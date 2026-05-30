"""
Shree Anna Backend - Voice Webhook API Routes
Reverie voice-bot integration for IVR.
"""

import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from pydantic import BaseModel
from sqlmodel import Session
from loguru import logger

from app.core.utils import success_response, get_fallback_store, utc_now
from app.db import get_session, get_user_by_phone, User
from app.services import (
    verify_webhook_signature,
    handle_voice_webhook,
    VoiceWebhookPayload,
    VoiceResponse
)


router = APIRouter(prefix="/voice", tags=["Voice Webhooks"])


class ReverieWebhookRequest(BaseModel):
    """Incoming Reverie webhook request."""
    action: str
    call_id: str
    phone: Optional[str] = None
    language: Optional[str] = None
    text: Optional[str] = None
    dtmf: Optional[str] = None
    confidence: Optional[float] = None
    timestamp: Optional[str] = None
    metadata: Optional[dict] = None


class ReverieWebhookResponse(BaseModel):
    """Response to Reverie webhook."""
    action: str  # speak, gather, hangup, transfer
    text: Optional[str] = None
    language: str = "hi"
    gather_type: Optional[str] = None
    timeout_seconds: int = 10
    metadata: Optional[dict] = None


@router.post("/webhook")
async def reverie_webhook(
    request: Request,
    x_reverie_signature: Optional[str] = Header(None, alias="X-Reverie-Signature"),
    session: Session = Depends(get_session)
):
    """
    Main webhook endpoint for Reverie voice-bot.
    Handles incoming calls and voice/DTMF inputs.
    """
    # Get raw body for signature verification
    body = await request.body()
    
    # Verify signature
    if x_reverie_signature and not verify_webhook_signature(body, x_reverie_signature):
        logger.warning("Invalid Reverie webhook signature")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature"
        )
    
    # Parse payload
    try:
        data = json.loads(body)
        payload = VoiceWebhookPayload(**data)
    except Exception as e:
        logger.error(f"Invalid webhook payload: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    
    # Get user context if phone provided
    user_context = None
    if payload.phone:
        user = get_user_by_phone(session, payload.phone)
        if user:
            user_context = {
                "id": user.id,
                "name": user.name,
                "language": user.language,
                "district": user.district,
                "roles": user.get_roles()
            }
    
    # Handle webhook
    response = handle_voice_webhook(payload, user_context)
    
    logger.info(
        f"Voice webhook - Action: {payload.action}, "
        f"Call: {payload.call_id}, Response: {response.action}"
    )
    
    return {
        "action": response.action,
        "text": response.text,
        "language": response.language,
        "gather_type": response.gather_type,
        "timeout_seconds": response.timeout_seconds,
        "metadata": response.metadata
    }


# =============================================================================
# INDIVIDUAL WEBHOOK SUB-ROUTES
# =============================================================================

class CallStartRequest(BaseModel):
    """Call start webhook request."""
    session_id: str
    caller_id: str
    called_number: Optional[str] = None
    language: Optional[str] = "hi"


class SpeechInputRequest(BaseModel):
    """Speech input webhook request."""
    session_id: str
    speech_text: str
    language: Optional[str] = "hi"
    confidence: Optional[float] = None


class DTMFInputRequest(BaseModel):
    """DTMF input webhook request."""
    session_id: str
    dtmf_digits: str


class CallEndRequest(BaseModel):
    """Call end webhook request."""
    session_id: str
    duration_seconds: Optional[int] = None
    status: Optional[str] = "completed"


@router.post("/webhook/call_start")
async def webhook_call_start(
    request: CallStartRequest,
    session: Session = Depends(get_session)
):
    """Webhook for call start event."""
    # Get user by caller ID
    user_context = None
    user = get_user_by_phone(session, request.caller_id)
    if user:
        user_context = {
            "id": user.id,
            "name": user.name,
            "language": user.language,
            "district": user.district,
            "roles": user.get_roles()
        }
    
    payload = VoiceWebhookPayload(
        action="start",
        call_id=request.session_id,
        phone=request.caller_id,
        language=request.language
    )
    
    response = handle_voice_webhook(payload, user_context)
    
    # Log event
    store = get_fallback_store("events_log")
    store.append({
        "type": "voice_webhook",
        "action": "call_start",
        "session_id": request.session_id,
        "caller_id": request.caller_id,
        "timestamp": utc_now().isoformat()
    })
    
    logger.info(f"Voice call started: {request.session_id} from {request.caller_id}")
    
    return {
        "action": response.action,
        "text": response.text,
        "language": response.language,
        "session_id": request.session_id
    }


@router.post("/webhook/speech_input")
async def webhook_speech_input(
    request: SpeechInputRequest,
    session: Session = Depends(get_session)
):
    """Webhook for speech input event."""
    payload = VoiceWebhookPayload(
        action="speech_input",
        call_id=request.session_id,
        text=request.speech_text,
        language=request.language,
        confidence=request.confidence
    )
    
    response = handle_voice_webhook(payload, None)
    
    # Log event
    store = get_fallback_store("events_log")
    store.append({
        "type": "voice_webhook",
        "action": "speech_input",
        "session_id": request.session_id,
        "text": request.speech_text,
        "language": request.language,
        "timestamp": utc_now().isoformat()
    })
    
    logger.info(f"Voice speech input: {request.session_id} - {request.speech_text[:50]}...")
    
    return {
        "action": response.action,
        "text": response.text,
        "language": response.language,
        "session_id": request.session_id
    }


@router.post("/webhook/dtmf")
async def webhook_dtmf(
    request: DTMFInputRequest,
    session: Session = Depends(get_session)
):
    """Webhook for DTMF input event."""
    payload = VoiceWebhookPayload(
        action="dtmf_input",
        call_id=request.session_id,
        dtmf=request.dtmf_digits
    )
    
    response = handle_voice_webhook(payload, None)
    
    # Log event
    store = get_fallback_store("events_log")
    store.append({
        "type": "voice_webhook",
        "action": "dtmf",
        "session_id": request.session_id,
        "digits": request.dtmf_digits,
        "timestamp": utc_now().isoformat()
    })
    
    logger.info(f"Voice DTMF input: {request.session_id} - {request.dtmf_digits}")
    
    return {
        "action": response.action,
        "text": response.text,
        "language": response.language,
        "session_id": request.session_id
    }


@router.post("/webhook/call_end")
async def webhook_call_end(
    request: CallEndRequest,
    session: Session = Depends(get_session)
):
    """Webhook for call end event."""
    # Log event
    store = get_fallback_store("events_log")
    store.append({
        "type": "voice_webhook",
        "action": "call_end",
        "session_id": request.session_id,
        "duration_seconds": request.duration_seconds,
        "status": request.status,
        "timestamp": utc_now().isoformat()
    })
    
    logger.info(
        f"Voice call ended: {request.session_id} - "
        f"duration={request.duration_seconds}s, status={request.status}"
    )
    
    return {
        "action": "hangup",
        "session_id": request.session_id,
        "status": request.status,
        "duration_seconds": request.duration_seconds
    }


@router.post("/webhook/status")
async def call_status_webhook(
    request: Request
):
    """
    Webhook for call status updates.
    Called when call ends or status changes.
    """
    try:
        body = await request.json()
        
        # Log call status
        store = get_fallback_store("events_log")
        store.append({
            "type": "call_status",
            "data": body,
            "timestamp": utc_now().isoformat()
        })
        
        logger.info(f"Call status update: {body.get('call_id', 'unknown')}")
        
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"Call status webhook error: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/call-logs")
async def get_call_logs(
    phone: Optional[str] = None,
    limit: int = 50,
    session: Session = Depends(get_session)
):
    """
    Get recent call logs (for debugging/admin).
    """
    store = get_fallback_store("events_log")
    events = store.get_all()
    
    # Filter voice events
    voice_events = [
        e for e in events
        if e.get("type") in ["voice_webhook", "call_status"]
    ]
    
    # Filter by phone if provided
    if phone:
        voice_events = [
            e for e in voice_events
            if e.get("phone") == phone or e.get("data", {}).get("phone") == phone
        ]
    
    # Sort by timestamp descending
    voice_events.sort(
        key=lambda x: x.get("timestamp", ""),
        reverse=True
    )
    
    return {
        "logs": voice_events[:limit],
        "count": len(voice_events[:limit])
    }


# =============================================================================
# TEST ENDPOINTS (for development)
# =============================================================================

@router.post("/test/simulate-call")
async def simulate_call(
    phone: str,
    language: str = "hi",
    session: Session = Depends(get_session)
):
    """
    Simulate an incoming call (for testing).
    """
    import uuid
    
    call_id = f"test_{uuid.uuid4().hex[:8]}"
    
    payload = VoiceWebhookPayload(
        action="start",
        call_id=call_id,
        phone=phone,
        language=language
    )
    
    # Get user context
    user_context = None
    user = get_user_by_phone(session, phone)
    if user:
        user_context = {
            "id": user.id,
            "name": user.name,
            "language": user.language,
            "district": user.district
        }
    
    response = handle_voice_webhook(payload, user_context)
    
    return {
        "call_id": call_id,
        "response": {
            "action": response.action,
            "text": response.text,
            "language": response.language
        }
    }


@router.post("/test/simulate-input")
async def simulate_input(
    call_id: str,
    text: Optional[str] = None,
    dtmf: Optional[str] = None,
    language: str = "hi"
):
    """
    Simulate voice or DTMF input (for testing).
    """
    if not text and not dtmf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either text or dtmf"
        )
    
    action = "speech_input" if text else "dtmf_input"
    
    payload = VoiceWebhookPayload(
        action=action,
        call_id=call_id,
        text=text,
        dtmf=dtmf,
        language=language
    )
    
    response = handle_voice_webhook(payload, None)
    
    return {
        "call_id": call_id,
        "input": text or dtmf,
        "response": {
            "action": response.action,
            "text": response.text,
            "language": response.language
        }
    }
