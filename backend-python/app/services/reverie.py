"""
Shree Anna Backend - Reverie Voice Service
Handles Reverie voice-bot webhook integration.
"""

import hmac
import hashlib
import json
from typing import Any, Dict, Optional
from enum import Enum

from loguru import logger
from pydantic import BaseModel

from app.core.config import settings
from app.core.utils import utc_now, get_fallback_store


class VoiceAction(str, Enum):
    """Voice webhook action types from Reverie."""
    START = "start"
    SPEECH_INPUT = "speech_input"
    DTMF_INPUT = "dtmf_input"
    END = "end"
    TIMEOUT = "timeout"
    ERROR = "error"


class VoiceWebhookPayload(BaseModel):
    """Incoming Reverie webhook payload."""
    action: str
    call_id: str
    phone: Optional[str] = None
    language: Optional[str] = None
    text: Optional[str] = None  # Transcribed speech
    dtmf: Optional[str] = None  # DTMF digits
    confidence: Optional[float] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class VoiceResponse(BaseModel):
    """Response to send back to Reverie."""
    action: str  # "speak", "gather", "hangup", "transfer"
    text: Optional[str] = None  # TTS text
    language: str = "hi"
    gather_type: Optional[str] = None  # "speech", "dtmf", "both"
    timeout_seconds: int = 10
    metadata: Optional[Dict[str, Any]] = None


class ReverieVoiceService:
    """
    Reverie Voice-Bot Integration Service.
    Handles incoming webhooks and generates appropriate responses.
    """
    
    def __init__(self):
        self.api_key = settings.reverie_api_key
        self.api_secret = settings.reverie_api_secret
        self.is_mock = not bool(self.api_key and self.api_secret)
        
        if self.is_mock:
            logger.warning("Reverie API credentials not set, using mock mode")
        
        # Conversation state cache (in production, use Redis)
        self.call_states: Dict[str, Dict] = {}
    
    def verify_signature(
        self,
        payload: bytes,
        signature: str
    ) -> bool:
        """
        Verify the webhook signature from Reverie.
        """
        if self.is_mock:
            return True
        
        expected = hmac.new(
            self.api_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected, signature)
    
    def handle_webhook(
        self,
        payload: VoiceWebhookPayload,
        user_context: Optional[Dict] = None
    ) -> VoiceResponse:
        """
        Handle incoming voice webhook and generate response.
        """
        # Log the event
        self._log_voice_event(payload)
        
        action = payload.action.lower()
        call_id = payload.call_id
        
        # Route to appropriate handler
        if action == VoiceAction.START:
            return self._handle_call_start(payload, user_context)
        
        elif action == VoiceAction.SPEECH_INPUT:
            return self._handle_speech_input(payload, user_context)
        
        elif action == VoiceAction.DTMF_INPUT:
            return self._handle_dtmf_input(payload, user_context)
        
        elif action == VoiceAction.TIMEOUT:
            return self._handle_timeout(payload)
        
        elif action in [VoiceAction.END, VoiceAction.ERROR]:
            return self._handle_call_end(payload)
        
        # Default response
        return VoiceResponse(
            action="speak",
            text="कृपया बाद में पुनः प्रयास करें।",  # Please try again later
            language=payload.language or "hi"
        )
    
    def _handle_call_start(
        self,
        payload: VoiceWebhookPayload,
        user_context: Optional[Dict]
    ) -> VoiceResponse:
        """Handle new incoming call."""
        language = payload.language or "hi"
        phone = payload.phone
        
        # Initialize call state
        self.call_states[payload.call_id] = {
            "phone": phone,
            "language": language,
            "state": "greeting",
            "user_context": user_context
        }
        
        # Welcome message based on whether user is known
        if user_context and user_context.get("name"):
            greeting = self._get_personalized_greeting(
                user_context["name"],
                language
            )
        else:
            greeting = self._get_welcome_message(language)
        
        return VoiceResponse(
            action="gather",
            text=greeting,
            language=language,
            gather_type="speech",
            timeout_seconds=15
        )
    
    def _handle_speech_input(
        self,
        payload: VoiceWebhookPayload,
        user_context: Optional[Dict]
    ) -> VoiceResponse:
        """Handle speech input from user."""
        text = payload.text or ""
        language = payload.language or "hi"
        call_state = self.call_states.get(payload.call_id, {})
        current_state = call_state.get("state", "greeting")
        
        # Intent classification (simplified)
        intent = self._classify_intent(text, language)
        
        logger.info(
            f"Voice input - Call: {payload.call_id}, "
            f"Text: '{text}', Intent: {intent}"
        )
        
        # Route based on intent
        if intent == "check_price":
            return self._handle_price_inquiry(text, language, user_context)
        
        elif intent == "create_listing":
            return self._handle_listing_creation(text, language, user_context)
        
        elif intent == "check_offers":
            return self._handle_offers_inquiry(language, user_context)
        
        elif intent == "weather":
            return self._handle_weather_inquiry(text, language, user_context)
        
        elif intent == "help":
            return self._get_help_response(language)
        
        elif intent == "yes" or intent == "confirm":
            return self._handle_confirmation(payload.call_id, language)
        
        elif intent == "no" or intent == "cancel":
            return self._handle_cancellation(payload.call_id, language)
        
        # Default: ask for clarification
        return VoiceResponse(
            action="gather",
            text=self._get_clarification_message(language),
            language=language,
            gather_type="speech",
            timeout_seconds=15
        )
    
    def _handle_dtmf_input(
        self,
        payload: VoiceWebhookPayload,
        user_context: Optional[Dict]
    ) -> VoiceResponse:
        """Handle DTMF (keypad) input."""
        dtmf = payload.dtmf or ""
        language = payload.language or "hi"
        
        # Menu-based navigation
        menu_responses = {
            "1": ("मंडी भाव जानने के लिए बोलें।", "check_price"),
            "2": ("नई लिस्टिंग बनाने के लिए फसल का नाम बोलें।", "create_listing"),
            "3": ("आपके ऑफर्स देख रहे हैं।", "check_offers"),
            "4": ("मौसम जानकारी के लिए।", "weather"),
            "0": ("ऑपरेटर से बात करने के लिए रुकें।", "transfer"),
        }
        
        if dtmf in menu_responses:
            text, next_state = menu_responses[dtmf]
            
            if next_state == "transfer":
                return VoiceResponse(
                    action="transfer",
                    text=text,
                    language=language
                )
            
            # Update call state
            if payload.call_id in self.call_states:
                self.call_states[payload.call_id]["state"] = next_state
            
            return VoiceResponse(
                action="gather",
                text=text,
                language=language,
                gather_type="speech",
                timeout_seconds=15
            )
        
        # Invalid input
        return VoiceResponse(
            action="gather",
            text="कृपया 1 से 4 के बीच दबाएं।",
            language=language,
            gather_type="dtmf",
            timeout_seconds=10
        )
    
    def _handle_timeout(self, payload: VoiceWebhookPayload) -> VoiceResponse:
        """Handle timeout (no input received)."""
        language = payload.language or "hi"
        call_state = self.call_states.get(payload.call_id, {})
        timeout_count = call_state.get("timeout_count", 0) + 1
        
        if payload.call_id in self.call_states:
            self.call_states[payload.call_id]["timeout_count"] = timeout_count
        
        if timeout_count >= 3:
            return VoiceResponse(
                action="hangup",
                text="कोई प्रतिक्रिया नहीं मिली। कृपया बाद में कॉल करें।",
                language=language
            )
        
        return VoiceResponse(
            action="gather",
            text="क्या आप वहां हैं? कृपया बोलें या बटन दबाएं।",
            language=language,
            gather_type="both",
            timeout_seconds=10
        )
    
    def _handle_call_end(self, payload: VoiceWebhookPayload) -> VoiceResponse:
        """Handle call end/hangup."""
        # Clean up call state
        if payload.call_id in self.call_states:
            del self.call_states[payload.call_id]
        
        return VoiceResponse(
            action="hangup",
            text="धन्यवाद। अलविदा!",
            language=payload.language or "hi"
        )
    
    # =========================================================================
    # Intent Classification & Handlers
    # =========================================================================
    
    def _classify_intent(self, text: str, language: str) -> str:
        """
        Simple keyword-based intent classification.
        In production, use NLU service.
        """
        text_lower = text.lower()
        
        # Hindi keywords
        if any(w in text_lower for w in ["भाव", "दाम", "कीमत", "price", "rate"]):
            return "check_price"
        
        if any(w in text_lower for w in ["बेचना", "लिस्ट", "sell", "listing"]):
            return "create_listing"
        
        if any(w in text_lower for w in ["ऑफर", "offer", "खरीदार"]):
            return "check_offers"
        
        if any(w in text_lower for w in ["मौसम", "बारिश", "weather", "rain"]):
            return "weather"
        
        if any(w in text_lower for w in ["मदद", "सहायता", "help"]):
            return "help"
        
        if any(w in text_lower for w in ["हां", "हाँ", "yes", "ठीक", "ok"]):
            return "yes"
        
        if any(w in text_lower for w in ["नहीं", "no", "cancel", "रद्द"]):
            return "no"
        
        return "unknown"
    
    def _handle_price_inquiry(
        self,
        text: str,
        language: str,
        user_context: Optional[Dict]
    ) -> VoiceResponse:
        """Handle price inquiry."""
        # Extract crop name from text (simplified)
        crops = {
            "रागी": "Ragi",
            "बाजरा": "Bajra",
            "ज्वार": "Jowar",
            "कोदो": "Kodo",
            "कुटकी": "Kutki"
        }
        
        detected_crop = None
        for hindi, english in crops.items():
            if hindi in text or english.lower() in text.lower():
                detected_crop = hindi
                break
        
        if detected_crop:
            # In production, fetch from price API
            response = f"{detected_crop} का आज का मंडी भाव 3200 रुपये प्रति क्विंटल है।"
        else:
            response = "किस फसल का भाव जानना है? रागी, बाजरा, या ज्वार?"
        
        return VoiceResponse(
            action="gather",
            text=response,
            language=language,
            gather_type="speech",
            timeout_seconds=15
        )
    
    def _handle_listing_creation(
        self,
        text: str,
        language: str,
        user_context: Optional[Dict]
    ) -> VoiceResponse:
        """Handle listing creation via voice."""
        # Simplified - in production, multi-turn dialog
        return VoiceResponse(
            action="gather",
            text="लिस्टिंग बनाने के लिए कृपया फसल का नाम, मात्रा किलो में, और न्यूनतम दाम बताएं।",
            language=language,
            gather_type="speech",
            timeout_seconds=20
        )
    
    def _handle_offers_inquiry(
        self,
        language: str,
        user_context: Optional[Dict]
    ) -> VoiceResponse:
        """Handle offers inquiry."""
        if not user_context:
            return VoiceResponse(
                action="gather",
                text="आपका फोन नंबर नहीं मिला। कृपया SMS से रजिस्टर करें।",
                language=language,
                gather_type="speech",
                timeout_seconds=10
            )
        
        # In production, fetch from database
        return VoiceResponse(
            action="gather",
            text="आपके पास 2 नए ऑफर हैं। पहला ऑफर: रागी के लिए 3500 रुपये प्रति क्विंटल। दूसरा ऑफर: बाजरा के लिए 2800 रुपये। स्वीकार करने के लिए हां बोलें।",
            language=language,
            gather_type="speech",
            timeout_seconds=15
        )
    
    def _handle_weather_inquiry(
        self,
        text: str,
        language: str,
        user_context: Optional[Dict]
    ) -> VoiceResponse:
        """Handle weather inquiry."""
        # In production, fetch from weather service
        district = user_context.get("district", "आपका जिला") if user_context else "आपका जिला"
        
        return VoiceResponse(
            action="speak",
            text=f"{district} में आज मौसम साफ रहेगा। तापमान 28 से 35 डिग्री। अगले 3 दिन बारिश की संभावना नहीं है।",
            language=language
        )
    
    def _handle_confirmation(
        self,
        call_id: str,
        language: str
    ) -> VoiceResponse:
        """Handle yes/confirm response."""
        call_state = self.call_states.get(call_id, {})
        current_state = call_state.get("state", "")
        
        if current_state == "check_offers":
            return VoiceResponse(
                action="speak",
                text="ऑफर स्वीकार किया गया। खरीदार को सूचित किया जाएगा। धन्यवाद!",
                language=language
            )
        
        return VoiceResponse(
            action="gather",
            text="ठीक है। और क्या मदद चाहिए?",
            language=language,
            gather_type="speech",
            timeout_seconds=15
        )
    
    def _handle_cancellation(
        self,
        call_id: str,
        language: str
    ) -> VoiceResponse:
        """Handle no/cancel response."""
        return VoiceResponse(
            action="gather",
            text="ठीक है। और क्या मदद चाहिए?",
            language=language,
            gather_type="speech",
            timeout_seconds=15
        )
    
    # =========================================================================
    # Message Templates
    # =========================================================================
    
    def _get_welcome_message(self, language: str) -> str:
        """Get welcome message."""
        messages = {
            "hi": "श्री अन्न में आपका स्वागत है। आप मंडी भाव, लिस्टिंग, या ऑफर के बारे में पूछ सकते हैं। बोलें या 1 से 4 दबाएं।",
            "en": "Welcome to Shree Anna. You can ask about mandi prices, listings, or offers. Speak or press 1-4.",
            "mr": "श्री अन्न मध्ये आपले स्वागत आहे. मंडी भाव, लिस्टिंग किंवा ऑफर बद्दल विचारा."
        }
        return messages.get(language, messages["hi"])
    
    def _get_personalized_greeting(self, name: str, language: str) -> str:
        """Get personalized greeting."""
        messages = {
            "hi": f"नमस्ते {name} जी! श्री अन्न में आपका स्वागत है। आज क्या मदद चाहिए?",
            "en": f"Hello {name}! Welcome to Shree Anna. How can I help today?",
        }
        return messages.get(language, messages["hi"])
    
    def _get_help_response(self, language: str) -> VoiceResponse:
        """Get help menu response."""
        text = """
        आप ये काम कर सकते हैं:
        1. मंडी भाव जानें।
        2. नई लिस्टिंग बनाएं।
        3. अपने ऑफर देखें।
        4. मौसम जानकारी।
        0. ऑपरेटर से बात करें।
        """
        return VoiceResponse(
            action="gather",
            text=text.strip(),
            language=language,
            gather_type="both",
            timeout_seconds=15
        )
    
    def _get_clarification_message(self, language: str) -> str:
        """Get clarification message."""
        messages = {
            "hi": "माफ कीजिए, समझ नहीं पाया। कृपया दोबारा बोलें या 1 से 4 दबाएं।",
            "en": "Sorry, I didn't understand. Please try again or press 1-4."
        }
        return messages.get(language, messages["hi"])
    
    def _log_voice_event(self, payload: VoiceWebhookPayload) -> None:
        """Log voice event to fallback store."""
        try:
            store = get_fallback_store("events_log")
            store.append({
                "type": "voice_webhook",
                "action": payload.action,
                "call_id": payload.call_id,
                "phone": payload.phone,
                "text": payload.text,
                "timestamp": utc_now().isoformat()
            })
        except Exception as e:
            logger.warning(f"Failed to log voice event: {e}")


# Global singleton
reverie_service = ReverieVoiceService()


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify Reverie webhook signature."""
    return reverie_service.verify_signature(payload, signature)


def handle_voice_webhook(
    payload: VoiceWebhookPayload,
    user_context: Optional[Dict] = None
) -> VoiceResponse:
    """Handle incoming voice webhook."""
    return reverie_service.handle_webhook(payload, user_context)
