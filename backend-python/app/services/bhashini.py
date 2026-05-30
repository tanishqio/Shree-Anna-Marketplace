"""
Bhashini API Service for Speech-to-Text (ASR) and Text-to-Speech (TTS).
Supports Hindi and other Indian languages.

Documentation: https://bhashini.gitbook.io/bhashini-apis
"""

import base64
import logging
import httpx
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum

from app.core.config import settings

logger = logging.getLogger(__name__)


class BhashiniLanguage(str, Enum):
    """Supported Bhashini language codes (ISO-639)."""
    HINDI = "hi"
    ENGLISH = "en"
    KANNADA = "kn"
    TELUGU = "te"
    TAMIL = "ta"
    MARATHI = "mr"
    BENGALI = "bn"
    GUJARATI = "gu"
    PUNJABI = "pa"
    ODIA = "or"
    MALAYALAM = "ml"
    ASSAMESE = "as"


@dataclass
class BhashiniConfig:
    """Bhashini API configuration."""
    user_id: str
    api_key: str
    pipeline_id: str = "64392f96daac500b55c543cd"  # MeitY pipeline
    config_endpoint: str = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"


@dataclass
class ASRResult:
    """Speech recognition result."""
    text: str
    language: str
    confidence: Optional[float] = None
    success: bool = True
    error: Optional[str] = None


@dataclass
class TTSResult:
    """Text-to-speech result."""
    audio_base64: str
    language: str
    audio_format: str = "wav"
    success: bool = True
    error: Optional[str] = None


class BhashiniService:
    """Service for interacting with Bhashini APIs."""

    def __init__(self, config: Optional[BhashiniConfig] = None):
        """Initialize Bhashini service with configuration."""
        self.config = config or self._load_config_from_settings()
        self._pipeline_config: Optional[Dict] = None
        self._tts_pipeline_config: Optional[Dict] = None
        self._service_ids: Dict[str, Dict[str, str]] = {}  # language -> {asr: id, tts: id}
        self._inference_endpoint: Optional[str] = None
        self._tts_inference_endpoint: Optional[str] = None
        self._inference_key: Optional[Dict[str, str]] = None
        self._tts_inference_key: Optional[Dict[str, str]] = None

    def _load_config_from_settings(self) -> BhashiniConfig:
        """Load configuration from application settings."""
        return BhashiniConfig(
            user_id=getattr(settings, 'bhashini_user_id', '') or '',
            api_key=getattr(settings, 'bhashini_api_key', '') or '',
        )

    @property
    def is_configured(self) -> bool:
        """Check if Bhashini is properly configured."""
        return bool(self.config.user_id and self.config.api_key)

    async def _get_pipeline_config(self, task_type: str = "asr", source_language: str = "hi") -> Dict:
        """Get pipeline configuration for a specific task and language."""
        if not self.is_configured:
            raise ValueError("Bhashini API credentials not configured")

        headers = {
            "Content-Type": "application/json",
            "userID": self.config.user_id,
            "ulcaApiKey": self.config.api_key,
        }

        payload = {
            "pipelineTasks": [{"taskType": task_type}],
            "pipelineRequestConfig": {
                "pipelineId": self.config.pipeline_id
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.config.config_endpoint,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()

    async def _ensure_config_loaded(self, language: str = "hi") -> None:
        """Ensure pipeline configuration is loaded for the language."""
        if self._pipeline_config is None or language not in self._service_ids:
            config = await self._get_pipeline_config("asr", language)
            self._pipeline_config = config

            # Extract inference endpoint and auth
            endpoint_config = config.get("pipelineInferenceAPIEndPoint", {})
            self._inference_endpoint = endpoint_config.get("callbackUrl")
            
            inference_key = endpoint_config.get("inferenceApiKey", {})
            self._inference_key = {
                "name": inference_key.get("name", "Authorization"),
                "value": inference_key.get("value", "")
            }

            # Extract service IDs for each language
            for task_config in config.get("pipelineResponseConfig", []):
                if task_config.get("taskType") == "asr":
                    for lang_config in task_config.get("config", []):
                        lang_code = lang_config.get("language", {}).get("sourceLanguage")
                        service_id = lang_config.get("serviceId")
                        if lang_code and service_id:
                            if lang_code not in self._service_ids:
                                self._service_ids[lang_code] = {}
                            self._service_ids[lang_code]["asr"] = service_id

    async def _ensure_tts_config_loaded(self, language: str = "hi") -> None:
        """Ensure TTS pipeline configuration is loaded for the language."""
        if self._tts_pipeline_config is None or language not in self._service_ids or "tts" not in self._service_ids.get(language, {}):
            config = await self._get_pipeline_config("tts", language)
            self._tts_pipeline_config = config

            # Extract inference endpoint and auth for TTS
            endpoint_config = config.get("pipelineInferenceAPIEndPoint", {})
            self._tts_inference_endpoint = endpoint_config.get("callbackUrl")
            
            inference_key = endpoint_config.get("inferenceApiKey", {})
            self._tts_inference_key = {
                "name": inference_key.get("name", "Authorization"),
                "value": inference_key.get("value", "")
            }

            # Extract TTS service IDs for each language
            for task_config in config.get("pipelineResponseConfig", []):
                if task_config.get("taskType") == "tts":
                    for lang_config in task_config.get("config", []):
                        lang_code = lang_config.get("language", {}).get("sourceLanguage")
                        service_id = lang_config.get("serviceId")
                        if lang_code and service_id:
                            if lang_code not in self._service_ids:
                                self._service_ids[lang_code] = {}
                            self._service_ids[lang_code]["tts"] = service_id

    async def speech_to_text(
        self,
        audio_content: bytes,
        language: str = "hi",
        audio_format: str = "wav",
        sampling_rate: int = 16000
    ) -> ASRResult:
        """
        Convert speech to text using Bhashini ASR.

        Args:
            audio_content: Raw audio bytes
            language: ISO-639 language code (hi, en, kn, te, ta, mr, etc.)
            audio_format: Audio format (wav, mp3, flac)
            sampling_rate: Audio sampling rate in Hz

        Returns:
            ASRResult with transcribed text
        """
        if not self.is_configured:
            # Fall back to mock response for development
            logger.warning("Bhashini not configured, using mock response")
            return ASRResult(
                text="[Mock] Voice input received in " + language,
                language=language,
                success=True
            )

        try:
            await self._ensure_config_loaded(language)

            if language not in self._service_ids:
                return ASRResult(
                    text="",
                    language=language,
                    success=False,
                    error=f"Language {language} not supported for ASR"
                )

            # Encode audio to base64
            audio_base64 = base64.b64encode(audio_content).decode("utf-8")

            # Prepare request payload
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "asr",
                        "config": {
                            "language": {
                                "sourceLanguage": language
                            },
                            "serviceId": self._service_ids[language]["asr"],
                            "audioFormat": audio_format,
                            "samplingRate": sampling_rate
                        }
                    }
                ],
                "inputData": {
                    "input": [{"source": None}],
                    "audio": [{"audioContent": audio_base64}]
                }
            }

            # Prepare headers with auth
            headers = {
                "Content-Type": "application/json",
                self._inference_key["name"]: self._inference_key["value"]
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self._inference_endpoint,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()

            # Extract transcribed text from response
            output = result.get("pipelineResponse", [{}])[0]
            output_data = output.get("output", [{}])[0]
            transcribed_text = output_data.get("source", "")

            return ASRResult(
                text=transcribed_text,
                language=language,
                success=True
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"Bhashini API error: {e.response.status_code} - {e.response.text}")
            return ASRResult(
                text="",
                language=language,
                success=False,
                error=f"API error: {e.response.status_code}"
            )
        except Exception as e:
            logger.error(f"Bhashini ASR error: {str(e)}")
            return ASRResult(
                text="",
                language=language,
                success=False,
                error=str(e)
            )

    async def text_to_speech(
        self,
        text: str,
        language: str = "hi",
        gender: str = "female",
        sampling_rate: int = 22050
    ) -> TTSResult:
        """
        Convert text to speech using Bhashini TTS.

        Args:
            text: Text to convert to speech
            language: ISO-639 language code (hi, en, kn, te, ta, mr, etc.)
            gender: Voice gender ("male" or "female")
            sampling_rate: Audio sampling rate in Hz (default 22050)

        Returns:
            TTSResult with base64 encoded audio
        """
        if not self.is_configured:
            # Fall back to mock response for development
            logger.warning("Bhashini not configured, using mock TTS response")
            # Return a minimal valid WAV file as base64 (silent audio)
            mock_wav = self._generate_mock_wav()
            return TTSResult(
                audio_base64=mock_wav,
                language=language,
                audio_format="wav",
                success=True
            )

        try:
            await self._ensure_tts_config_loaded(language)

            if language not in self._service_ids or "tts" not in self._service_ids.get(language, {}):
                return TTSResult(
                    audio_base64="",
                    language=language,
                    success=False,
                    error=f"Language {language} not supported for TTS"
                )

            # Prepare request payload
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "tts",
                        "config": {
                            "language": {
                                "sourceLanguage": language
                            },
                            "serviceId": self._service_ids[language]["tts"],
                            "gender": gender,
                            "samplingRate": sampling_rate
                        }
                    }
                ],
                "inputData": {
                    "input": [{"source": text}]
                }
            }

            # Prepare headers with auth
            headers = {
                "Content-Type": "application/json",
                self._tts_inference_key["name"]: self._tts_inference_key["value"]
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self._tts_inference_endpoint,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()

            # Extract audio from response
            output = result.get("pipelineResponse", [{}])[0]
            audio_list = output.get("audio", [{}])
            audio_base64 = audio_list[0].get("audioContent", "") if audio_list else ""

            return TTSResult(
                audio_base64=audio_base64,
                language=language,
                audio_format="wav",
                success=True
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"Bhashini TTS API error: {e.response.status_code} - {e.response.text}")
            return TTSResult(
                audio_base64="",
                language=language,
                success=False,
                error=f"API error: {e.response.status_code}"
            )
        except Exception as e:
            logger.error(f"Bhashini TTS error: {str(e)}")
            return TTSResult(
                audio_base64="",
                language=language,
                success=False,
                error=str(e)
            )

    def _generate_mock_wav(self) -> str:
        """Generate a minimal silent WAV file as base64 for mock mode."""
        import struct
        # Create a minimal WAV header with silence
        sample_rate = 22050
        num_samples = sample_rate  # 1 second of silence
        bits_per_sample = 16
        num_channels = 1
        
        # WAV file header
        wav_header = struct.pack(
            '<4sI4s4sIHHIIHH4sI',
            b'RIFF',
            36 + num_samples * 2,  # File size - 8
            b'WAVE',
            b'fmt ',
            16,  # Subchunk1 size
            1,   # Audio format (PCM)
            num_channels,
            sample_rate,
            sample_rate * num_channels * bits_per_sample // 8,  # Byte rate
            num_channels * bits_per_sample // 8,  # Block align
            bits_per_sample,
            b'data',
            num_samples * 2  # Subchunk2 size
        )
        
        # Add silence (zeros)
        silence = b'\x00' * (num_samples * 2)
        wav_data = wav_header + silence
        
        return base64.b64encode(wav_data).decode('utf-8')

    async def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages for ASR/TTS."""
        if not self.is_configured:
            # Return default supported languages
            return [
                {"code": "hi", "name": "Hindi", "nativeName": "हिन्दी"},
                {"code": "en", "name": "English", "nativeName": "English"},
                {"code": "kn", "name": "Kannada", "nativeName": "ಕನ್ನಡ"},
                {"code": "te", "name": "Telugu", "nativeName": "తెలుగు"},
                {"code": "ta", "name": "Tamil", "nativeName": "தமிழ்"},
                {"code": "mr", "name": "Marathi", "nativeName": "मराठी"},
            ]

        try:
            await self._ensure_config_loaded()
            languages = []
            for lang_code in self._service_ids.keys():
                lang_info = LANGUAGE_INFO.get(lang_code, {"name": lang_code, "nativeName": lang_code})
                languages.append({
                    "code": lang_code,
                    "name": lang_info["name"],
                    "nativeName": lang_info["nativeName"]
                })
            return languages
        except Exception as e:
            logger.error(f"Error getting supported languages: {e}")
            return []


# Language information mapping
LANGUAGE_INFO = {
    "hi": {"name": "Hindi", "nativeName": "हिन्दी"},
    "en": {"name": "English", "nativeName": "English"},
    "kn": {"name": "Kannada", "nativeName": "ಕನ್ನಡ"},
    "te": {"name": "Telugu", "nativeName": "తెలుగు"},
    "ta": {"name": "Tamil", "nativeName": "தமிழ்"},
    "mr": {"name": "Marathi", "nativeName": "मराठी"},
    "bn": {"name": "Bengali", "nativeName": "বাংলা"},
    "gu": {"name": "Gujarati", "nativeName": "ગુજરાતી"},
    "pa": {"name": "Punjabi", "nativeName": "ਪੰਜਾਬੀ"},
    "or": {"name": "Odia", "nativeName": "ଓଡ଼ିଆ"},
    "ml": {"name": "Malayalam", "nativeName": "മലയാളം"},
    "as": {"name": "Assamese", "nativeName": "অসমীয়া"},
}


# Singleton instance
_bhashini_service: Optional[BhashiniService] = None


def get_bhashini_service() -> BhashiniService:
    """Get the Bhashini service singleton instance."""
    global _bhashini_service
    if _bhashini_service is None:
        _bhashini_service = BhashiniService()
    return _bhashini_service
