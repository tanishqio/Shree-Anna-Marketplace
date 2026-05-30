"""
Shree Anna Backend - SMS Service
Handles SMS sending via Twilio with mock fallback.
"""

from typing import Optional
from loguru import logger

from app.core.config import settings
from app.core.utils import get_fallback_store, normalize_phone, utc_now


class SMSService:
    """
    SMS Service with Twilio integration and mock fallback.
    """
    
    def __init__(self):
        self.use_mock = settings.use_mock_sms
        self.client = None
        self.from_number = settings.twilio_phone_number
        
        if not self.use_mock:
            try:
                from twilio.rest import Client
                self.client = Client(
                    settings.twilio_account_sid,
                    settings.twilio_auth_token
                )
                logger.info("Twilio SMS client initialized")
            except ImportError:
                logger.warning("Twilio not installed, using mock SMS")
                self.use_mock = True
            except Exception as e:
                logger.warning(f"Twilio init failed: {e}, using mock SMS")
                self.use_mock = True
    
    def send_sms(
        self,
        to: str,
        message: str,
        template_id: Optional[str] = None
    ) -> dict:
        """
        Send an SMS message.
        Returns dict with status and message_id.
        """
        to_normalized = normalize_phone(to)
        
        if self.use_mock:
            return self._mock_send(to_normalized, message, template_id)
        
        return self._twilio_send(to_normalized, message, template_id)
    
    def _mock_send(
        self,
        to: str,
        message: str,
        template_id: Optional[str] = None
    ) -> dict:
        """Mock SMS sending - logs and stores in fallback JSON."""
        import uuid
        
        message_id = f"mock_{uuid.uuid4().hex[:12]}"
        
        sms_record = {
            "id": message_id,
            "to": to,
            "message": message[:160],  # SMS limit
            "template_id": template_id,
            "status": "mock_sent",
            "sent_at": utc_now().isoformat()
        }
        
        # Store in fallback
        store = get_fallback_store("sent_sms")
        store.append(sms_record)
        
        logger.info(f"[MOCK SMS] To: {to}, Message: {message[:50]}...")
        
        return {
            "success": True,
            "message_id": message_id,
            "status": "mock_sent",
            "mock": True
        }
    
    def _twilio_send(
        self,
        to: str,
        message: str,
        template_id: Optional[str] = None
    ) -> dict:
        """Send SMS via Twilio."""
        try:
            result = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to
            )
            
            logger.info(f"SMS sent via Twilio: {result.sid} to {to}")
            
            # Also store in fallback for audit
            store = get_fallback_store("sent_sms")
            store.append({
                "id": result.sid,
                "to": to,
                "message": message[:160],
                "template_id": template_id,
                "status": result.status,
                "sent_at": utc_now().isoformat()
            })
            
            return {
                "success": True,
                "message_id": result.sid,
                "status": result.status,
                "mock": False
            }
        
        except Exception as e:
            logger.error(f"Twilio SMS failed: {e}")
            # Fallback to mock on error
            return self._mock_send(to, message, template_id)
    
    def send_otp(self, to: str, otp: str, language: str = "hi") -> dict:
        """Send OTP message."""
        templates = {
            "hi": f"आपका ShreeAnna OTP है: {otp}. 5 मिनट में समाप्त होगा।",
            "en": f"Your ShreeAnna OTP is: {otp}. Valid for 5 minutes.",
            "mr": f"तुमचा ShreeAnna OTP आहे: {otp}. 5 मिनिटांत संपेल.",
            "te": f"మీ ShreeAnna OTP: {otp}. 5 నిమిషాల్లో ముగుస్తుంది."
        }
        message = templates.get(language, templates["en"])
        return self.send_sms(to, message, template_id="OTP")
    
    def send_notification(
        self,
        to: str,
        template_key: str,
        params: dict,
        language: str = "hi"
    ) -> dict:
        """
        Send a templated notification.
        Template placeholders use {key} format.
        """
        # Get template from database or use hardcoded defaults
        templates = {
            # ===== Registration =====
            "REGISTRATION_SUCCESS": {
                "hi": "🌾 स्वागत है {name}! आप श्री अन्न पर {role} के रूप में पंजीकृत हो गए हैं।",
                "en": "🌾 Welcome {name}! You are now registered on Shree Anna as {role}."
            },
            
            # ===== Listings =====
            "LISTING_CREATED": {
                "hi": "✅ लिस्टिंग बनाई गई: {crop} - {qty_kg}kg @ ₹{price}/क्विंटल",
                "en": "✅ Listing created: {crop} - {qty_kg}kg @ ₹{price}/quintal"
            },
            "LISTING_EXPIRED": {
                "hi": "⏰ आपकी {crop} लिस्टिंग समाप्त हो गई। नई लिस्टिंग बनाएं।",
                "en": "⏰ Your {crop} listing has expired. Create a new listing."
            },
            "LISTING_SOLD": {
                "hi": "🎉 बधाई! आपकी {crop} लिस्टिंग बिक गई। कुल: ₹{amount}",
                "en": "🎉 Congrats! Your {crop} listing sold. Total: ₹{amount}"
            },
            
            # ===== Offers =====
            "OFFER_RECEIVED": {
                "hi": "🔔 नया ऑफर! {buyer} ने {crop} के लिए ₹{price}/क्विंटल का ऑफर दिया।",
                "en": "🔔 New offer! {buyer} offered ₹{price}/qtl for {crop}."
            },
            "OFFER_ACCEPTED": {
                "hi": "✅ आपका ऑफर स्वीकार! {crop} @ ₹{price}/क्विंटल। पिकअप जल्द होगी।",
                "en": "✅ Offer accepted! {crop} @ ₹{price}/qtl. Pickup will be scheduled."
            },
            "OFFER_REJECTED": {
                "hi": "❌ आपका {crop} का ऑफर अस्वीकार हुआ। अन्य लिस्टिंग देखें।",
                "en": "❌ Your offer for {crop} was declined. Check other listings."
            },
            "COUNTER_OFFER": {
                "hi": "💬 काउंटर ऑफर! {crop} के लिए नया प्रस्ताव ₹{price}/क्विंटल।",
                "en": "💬 Counter offer! New proposal ₹{price}/qtl for {crop}."
            },
            
            # ===== Orders & Delivery =====
            "ORDER_CONFIRMED": {
                "hi": "📦 ऑर्डर #{order_id} पुष्टि! कुल: ₹{amount}। डिलीवरी जल्द।",
                "en": "📦 Order #{order_id} confirmed! Total: ₹{amount}. Delivery soon."
            },
            "PICKUP_SCHEDULED": {
                "hi": "🚛 पिकअप शेड्यूल! दिनांक: {date}, समय: {time}, स्थान: {location}",
                "en": "🚛 Pickup scheduled! Date: {date}, Time: {time}, Location: {location}"
            },
            "DELIVERY_STARTED": {
                "hi": "🚚 डिलीवरी शुरू! ऑर्डर #{order_id} आज {time} तक पहुंचेगा।",
                "en": "🚚 Delivery started! Order #{order_id} arriving by {time} today."
            },
            "DELIVERY_COMPLETED": {
                "hi": "✅ डिलीवरी सफल! ऑर्डर #{order_id}। धन्यवाद श्री अन्न से।",
                "en": "✅ Delivery complete! Order #{order_id}. Thank you for using Shree Anna."
            },
            
            # ===== Payments =====
            "PAYMENT_RECEIVED": {
                "hi": "💰 ₹{amount} प्राप्त! ऑर्डर #{order_id} का भुगतान आपके खाते में जमा।",
                "en": "💰 ₹{amount} received! Payment for order #{order_id} credited."
            },
            "PAYMENT_PENDING": {
                "hi": "⏳ ₹{amount} का भुगतान बाकी है। कृपया जल्द भुगतान करें।",
                "en": "⏳ ₹{amount} payment pending. Please complete soon."
            },
            "PAYMENT_FAILED": {
                "hi": "❌ भुगतान विफल! कृपया पुनः प्रयास करें या संपर्क करें।",
                "en": "❌ Payment failed! Please retry or contact support."
            },
            
            # ===== FPO/SHG =====
            "COLLECTIVE_LISTING": {
                "hi": "🏢 सामूहिक लिस्टिंग बनी! {qty_kg}kg {crop} ({members} सदस्य)",
                "en": "🏢 Collective listing created! {qty_kg}kg {crop} ({members} members)"
            },
            "MEMBER_CONTRIBUTION": {
                "hi": "📥 {member} ने {qty_kg}kg {crop} जमा किया।",
                "en": "📥 {member} contributed {qty_kg}kg {crop}."
            },
            "FPO_PAYOUT": {
                "hi": "💵 FPO भुगतान: ₹{amount}। {members} सदस्यों में वितरित।",
                "en": "💵 FPO payout: ₹{amount} distributed among {members} members."
            },
            
            # ===== Government Schemes =====
            "NEW_SCHEME": {
                "hi": "🏛️ नई योजना! '{scheme}' अब उपलब्ध। पात्रता जांचें।",
                "en": "🏛️ New scheme! '{scheme}' now available. Check eligibility."
            },
            "SCHEME_APPROVED": {
                "hi": "✅ '{scheme}' आवेदन स्वीकृत! लाभ जल्द मिलेगा।",
                "en": "✅ '{scheme}' application approved! Benefits coming soon."
            },
            "SCHEME_REJECTED": {
                "hi": "❌ '{scheme}' आवेदन अस्वीकृत। कारण: {reason}",
                "en": "❌ '{scheme}' application rejected. Reason: {reason}"
            },
            
            # ===== Weather =====
            "WEATHER_ALERT": {
                "hi": "🌧️ मौसम चेतावनी: {alert}। कृपया सावधान रहें।",
                "en": "🌧️ Weather alert: {alert}. Please take precautions."
            },
            
            # ===== Quality =====
            "QUALITY_VERIFIED": {
                "hi": "✅ गुणवत्ता सत्यापित! {crop} - ग्रेड: {grade}",
                "en": "✅ Quality verified! {crop} - Grade: {grade}"
            },
            
            # ===== Price Alerts =====
            "PRICE_ALERT": {
                "hi": "📈 मूल्य अपडेट! {crop} अब ₹{price}/क्विंटल। बेचने का अच्छा समय!",
                "en": "📈 Price update! {crop} now ₹{price}/qtl. Good time to sell!"
            },
        }
        
        template = templates.get(template_key, {}).get(language)
        if not template:
            template = templates.get(template_key, {}).get("en", f"ShreeAnna notification: {template_key}")
        
        try:
            message = template.format(**params)
        except KeyError as e:
            logger.warning(f"Template param missing: {e}")
            message = template
        
        return self.send_sms(to, message, template_id=template_key)


# Global singleton
sms_service = SMSService()


def send_sms(to: str, message: str, template_id: Optional[str] = None) -> dict:
    """Convenience function to send SMS."""
    return sms_service.send_sms(to, message, template_id)


def send_otp_sms(to: str, otp: str, language: str = "hi") -> dict:
    """Convenience function to send OTP."""
    return sms_service.send_otp(to, otp, language)


def send_notification_sms(
    to: str,
    template_key: str,
    params: dict,
    language: str = "hi"
) -> dict:
    """Convenience function to send notification."""
    return sms_service.send_notification(to, template_key, params, language)
