"""
Google Cloud Speech-to-Text and Text-to-Speech Service.
Supports Hindi and other Indian languages via Google Cloud APIs.

Requires:
- google-cloud-speech
- google-cloud-texttospeech

Set GOOGLE_APPLICATION_CREDENTIALS environment variable to your service account JSON path,
OR set GOOGLE_CLOUD_API_KEY for API key authentication.
"""

import base64
import logging
import os
import struct
from typing import Optional, List, Dict
from dataclasses import dataclass
from enum import Enum

from app.core.config import settings

logger = logging.getLogger(__name__)

# Load Google Cloud credentials from environment variable (path to service account JSON)
# Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json in your environment
# Never hardcode credentials in source code

# Try to import Google Cloud libraries
try:
    from google.cloud import speech_v1 as speech
    from google.cloud import texttospeech_v1 as texttospeech
    from google.oauth2 import service_account
    import json

    _credentials_path = settings.google_application_credentials
    if _credentials_path and os.path.exists(_credentials_path):
        credentials = service_account.Credentials.from_service_account_file(_credentials_path)
        GOOGLE_CLOUD_AVAILABLE = True
        logger.info("Google Cloud credentials loaded from file: %s", _credentials_path)
    else:
        # Fall back to application default credentials (works on GCP / Cloud Run)
        credentials = None
        GOOGLE_CLOUD_AVAILABLE = True
        logger.info("Google Cloud: using Application Default Credentials")
except ImportError:
    GOOGLE_CLOUD_AVAILABLE = False
    credentials = None
    logger.warning("Google Cloud libraries not installed. Install with: pip install google-cloud-speech google-cloud-texttospeech")



class SpeechLanguage(str, Enum):
    """Supported language codes for Google Speech API (BCP-47)."""
    HINDI = "hi-IN"
    ENGLISH_INDIA = "en-IN"
    ENGLISH_US = "en-US"
    KANNADA = "kn-IN"
    TELUGU = "te-IN"
    TAMIL = "ta-IN"
    MARATHI = "mr-IN"
    BENGALI = "bn-IN"
    GUJARATI = "gu-IN"
    PUNJABI = "pa-IN"
    MALAYALAM = "ml-IN"
    ODIA = "or-IN"


# Map short codes to BCP-47 codes
LANGUAGE_CODE_MAP = {
    "hi": "hi-IN",
    "en": "en-IN",
    "kn": "kn-IN",
    "te": "te-IN",
    "ta": "ta-IN",
    "mr": "mr-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "pa": "pa-IN",
    "ml": "ml-IN",
    "or": "or-IN",
    "as": "as-IN",
}

# Language display info
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
    audio_format: str = "mp3"
    success: bool = True
    error: Optional[str] = None


class GoogleSpeechService:
    """Service for Google Cloud Speech-to-Text and Text-to-Speech."""

    def __init__(self):
        """Initialize Google Speech service."""
        self._speech_client = None
        self._tts_client = None

    @property
    def is_configured(self) -> bool:
        """Check if Google Cloud is properly configured."""
        # Check if hardcoded credentials are available
        return GOOGLE_CLOUD_AVAILABLE and credentials is not None

    def _get_speech_client(self):
        """Get or create Speech-to-Text client."""
        if not GOOGLE_CLOUD_AVAILABLE or credentials is None:
            return None
        if self._speech_client is None:
            self._speech_client = speech.SpeechClient(credentials=credentials)
        return self._speech_client

    def _get_tts_client(self):
        """Get or create Text-to-Speech client."""
        if not GOOGLE_CLOUD_AVAILABLE or credentials is None:
            return None
        if self._tts_client is None:
            self._tts_client = texttospeech.TextToSpeechClient(credentials=credentials)
        return self._tts_client

    def _get_bcp47_code(self, language: str) -> str:
        """Convert short language code to BCP-47 format."""
        # If already in BCP-47 format
        if "-" in language:
            return language
        return LANGUAGE_CODE_MAP.get(language, "hi-IN")

    async def speech_to_text(
        self,
        audio_content: bytes,
        language: str = "hi",
        audio_format: str = "webm",
        sampling_rate: int = 48000
    ) -> ASRResult:
        """
        Convert speech to text using Google Cloud Speech-to-Text.

        Args:
            audio_content: Raw audio bytes
            language: Language code (hi, en, kn, te, ta, mr, etc.)
            audio_format: Audio format (webm, wav, mp3, flac, ogg)
            sampling_rate: Audio sampling rate in Hz

        Returns:
            ASRResult with transcribed text
        """
        if not self.is_configured:
            logger.warning("Google Cloud not configured, using mock response")
            return ASRResult(
                text=f"[Mock] Voice input received in {language}",
                language=language,
                success=True
            )

        try:
            client = self._get_speech_client()
            if not client:
                raise ValueError("Speech client not available")

            # Map audio format to Google encoding
            encoding_map = {
                "webm": speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                "ogg": speech.RecognitionConfig.AudioEncoding.OGG_OPUS,
                "wav": speech.RecognitionConfig.AudioEncoding.LINEAR16,
                "flac": speech.RecognitionConfig.AudioEncoding.FLAC,
                "mp3": speech.RecognitionConfig.AudioEncoding.MP3,
            }
            encoding = encoding_map.get(audio_format.lower(), speech.RecognitionConfig.AudioEncoding.WEBM_OPUS)

            # Get BCP-47 language code
            language_code = self._get_bcp47_code(language)

            # Configure recognition
            config = speech.RecognitionConfig(
                encoding=encoding,
                sample_rate_hertz=sampling_rate,
                language_code=language_code,
                enable_automatic_punctuation=True,
                model="latest_long",  # Better for longer audio
            )

            audio = speech.RecognitionAudio(content=audio_content)

            # Perform recognition
            response = client.recognize(config=config, audio=audio)

            # Extract transcript
            transcript = ""
            confidence = 0.0
            for result in response.results:
                transcript += result.alternatives[0].transcript
                confidence = max(confidence, result.alternatives[0].confidence)

            return ASRResult(
                text=transcript or "",
                language=language,
                confidence=confidence,
                success=True
            )

        except Exception as e:
            logger.error(f"Google STT error: {str(e)}")
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
        Convert text to speech using Google Cloud Text-to-Speech.

        Args:
            text: Text to convert to speech
            language: Language code (hi, en, kn, te, ta, mr, etc.)
            gender: Voice gender ("male" or "female")
            sampling_rate: Audio sampling rate in Hz

        Returns:
            TTSResult with base64 encoded audio (MP3)
        """
        if not self.is_configured:
            logger.warning("Google Cloud not configured, using mock TTS response")
            mock_audio = self._generate_mock_audio()
            return TTSResult(
                audio_base64=mock_audio,
                language=language,
                audio_format="wav",
                success=True
            )

        try:
            client = self._get_tts_client()
            if not client:
                raise ValueError("TTS client not available")

            # Get BCP-47 language code
            language_code = self._get_bcp47_code(language)

            # Set up synthesis input
            synthesis_input = texttospeech.SynthesisInput(text=text)

            # Select voice
            ssml_gender = (
                texttospeech.SsmlVoiceGender.FEMALE
                if gender.lower() == "female"
                else texttospeech.SsmlVoiceGender.MALE
            )
            
            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                ssml_gender=ssml_gender,
            )

            # Configure audio output (MP3 for smaller size)
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                sample_rate_hertz=sampling_rate,
            )

            # Perform synthesis
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config,
            )

            # Encode audio to base64
            audio_base64 = base64.b64encode(response.audio_content).decode("utf-8")

            return TTSResult(
                audio_base64=audio_base64,
                language=language,
                audio_format="mp3",
                success=True
            )

        except Exception as e:
            logger.error(f"Google TTS error: {str(e)}")
            return TTSResult(
                audio_base64="",
                language=language,
                success=False,
                error=str(e)
            )

    def _generate_mock_audio(self) -> str:
        """Generate a minimal silent WAV file as base64 for mock mode."""
        # Create a minimal WAV header with silence
        sample_rate = 22050
        num_samples = sample_rate  # 1 second of silence
        bits_per_sample = 16
        num_channels = 1
        
        wav_header = struct.pack(
            '<4sI4s4sIHHIIHH4sI',
            b'RIFF',
            36 + num_samples * 2,
            b'WAVE',
            b'fmt ',
            16,
            1,
            num_channels,
            sample_rate,
            sample_rate * num_channels * bits_per_sample // 8,
            num_channels * bits_per_sample // 8,
            bits_per_sample,
            b'data',
            num_samples * 2
        )
        
        silence = b'\x00' * (num_samples * 2)
        wav_data = wav_header + silence
        
        return base64.b64encode(wav_data).decode('utf-8')

    async def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages."""
        return [
            {"code": code, **info}
            for code, info in LANGUAGE_INFO.items()
        ]


# Singleton instance
_google_speech_service: Optional[GoogleSpeechService] = None


def get_speech_service() -> GoogleSpeechService:
    """Get the Google Speech service singleton instance."""
    global _google_speech_service
    if _google_speech_service is None:
        _google_speech_service = GoogleSpeechService()
    return _google_speech_service
