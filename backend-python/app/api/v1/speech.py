"""
Speech API routes for Google Cloud Speech-to-Text and Text-to-Speech.
Supports Hindi and other Indian languages via Google Cloud APIs.
"""

import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from pydantic import BaseModel

from app.services.google_speech import get_speech_service

router = APIRouter(prefix="/speech", tags=["Speech"])


class SpeechToTextRequest(BaseModel):
    """Request model for speech-to-text conversion."""
    audio_base64: str
    language: str = "hi"
    audio_format: str = "wav"
    sampling_rate: int = 16000


class SpeechToTextResponse(BaseModel):
    """Response model for speech-to-text conversion."""
    text: str
    language: str
    success: bool
    error: Optional[str] = None


class TextToSpeechRequest(BaseModel):
    """Request model for text-to-speech conversion."""
    text: str
    language: str = "hi"
    gender: str = "female"
    sampling_rate: int = 22050


class TextToSpeechResponse(BaseModel):
    """Response model for text-to-speech conversion."""
    audio_base64: str
    language: str
    audio_format: str
    success: bool
    error: Optional[str] = None


class SupportedLanguage(BaseModel):
    """Supported language model."""
    code: str
    name: str
    nativeName: str


@router.post("/to-text", response_model=SpeechToTextResponse)
async def speech_to_text(request: SpeechToTextRequest):
    """
    Convert speech audio to text using Google Cloud Speech-to-Text.

    Supports Indian languages: Hindi (hi), English (en), Kannada (kn),
    Telugu (te), Tamil (ta), Marathi (mr), Bengali (bn), Gujarati (gu),
    Punjabi (pa), Odia (or), Malayalam (ml), Assamese (as).

    Args:
        request: Contains base64 encoded audio, language code, format, and sampling rate

    Returns:
        Transcribed text in the specified language
    """
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(request.audio_base64)
        
        # Get Google Speech service
        service = get_speech_service()
        
        # Perform speech-to-text
        result = await service.speech_to_text(
            audio_content=audio_bytes,
            language=request.language,
            audio_format=request.audio_format,
            sampling_rate=request.sampling_rate
        )
        
        return SpeechToTextResponse(
            text=result.text,
            language=result.language,
            success=result.success,
            error=result.error
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/to-text/upload", response_model=SpeechToTextResponse)
async def speech_to_text_upload(
    audio: UploadFile = File(...),
    language: str = Form(default="hi"),
    sampling_rate: int = Form(default=48000)
):
    """
    Convert uploaded audio file to text using Google Cloud Speech-to-Text.

    Args:
        audio: Audio file (wav, mp3, webm, ogg, flac)
        language: Language code (hi, en, kn, te, ta, mr, etc.)
        sampling_rate: Audio sampling rate in Hz

    Returns:
        Transcribed text in the specified language
    """
    try:
        # Read audio file
        audio_bytes = await audio.read()
        
        # Determine audio format from filename
        filename = audio.filename or "audio.webm"
        audio_format = filename.split(".")[-1].lower()
        
        # Get Google Speech service
        service = get_speech_service()
        
        # Perform speech-to-text
        result = await service.speech_to_text(
            audio_content=audio_bytes,
            language=language,
            audio_format=audio_format,
            sampling_rate=sampling_rate
        )
        
        return SpeechToTextResponse(
            text=result.text,
            language=result.language,
            success=result.success,
            error=result.error
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/languages", response_model=list[SupportedLanguage])
async def get_supported_languages():
    """
    Get list of supported languages for speech-to-text and text-to-speech.

    Returns:
        List of supported languages with code, name, and native name
    """
    service = get_speech_service()
    languages = await service.get_supported_languages()
    return [SupportedLanguage(**lang) for lang in languages]


# ============================================================================
# Text-to-Speech (TTS) Endpoints
# ============================================================================


@router.post("/to-audio", response_model=TextToSpeechResponse)
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech audio using Google Cloud Text-to-Speech.

    Supports Indian languages: Hindi (hi), English (en), Kannada (kn),
    Telugu (te), Tamil (ta), Marathi (mr), Bengali (bn), Gujarati (gu),
    Punjabi (pa), Odia (or), Malayalam (ml), Assamese (as).

    Args:
        request: Contains text, language code, gender, and sampling rate

    Returns:
        Base64 encoded audio in MP3 format
    """
    try:
        service = get_speech_service()
        
        result = await service.text_to_speech(
            text=request.text,
            language=request.language,
            gender=request.gender,
            sampling_rate=request.sampling_rate
        )
        
        return TextToSpeechResponse(
            audio_base64=result.audio_base64,
            language=result.language,
            audio_format=result.audio_format,
            success=result.success,
            error=result.error
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/to-audio/stream")
async def text_to_speech_stream(request: TextToSpeechRequest):
    """
    Convert text to speech and return audio as binary stream.

    This endpoint returns the audio directly as an MP3 file,
    suitable for direct playback in browsers.

    Args:
        request: Contains text, language code, gender, and sampling rate

    Returns:
        Audio MP3 file as binary response
    """
    try:
        service = get_speech_service()
        
        result = await service.text_to_speech(
            text=request.text,
            language=request.language,
            gender=request.gender,
            sampling_rate=request.sampling_rate
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.error)
        
        # Decode base64 to binary
        audio_bytes = base64.b64decode(result.audio_base64)
        
        # Determine media type based on format
        media_type = "audio/mpeg" if result.audio_format == "mp3" else "audio/wav"
        
        return Response(
            content=audio_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f"inline; filename=speech.{result.audio_format}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def speech_health_check():
    """
    Check if the speech service is configured and healthy.

    Returns:
        Health status of the Google Cloud Speech service
    """
    service = get_speech_service()
    return {
        "status": "healthy",
        "configured": service.is_configured,
        "provider": "google-cloud",
        "message": "Google Cloud Speech ready" if service.is_configured else "Using mock mode (set GOOGLE_APPLICATION_CREDENTIALS)"
    }
