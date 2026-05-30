"""
Shree Anna Backend - Services Module
"""

from app.services.sms import (
    sms_service,
    send_sms,
    send_otp_sms,
    send_notification_sms
)
from app.services.storage import (
    storage_service,
    save_file,
    save_audio,
    get_file_url,
    delete_file
)
from app.services.reverie import (
    reverie_service,
    verify_webhook_signature,
    handle_voice_webhook,
    VoiceWebhookPayload,
    VoiceResponse,
    VoiceAction
)
from app.services.weather_cache import (
    weather_service,
    get_weather,
    get_weather_for_user
)
from app.services.payments import (
    payment_service,
    initiate_payment,
    confirm_payment,
    get_payment_status,
    refund_payment,
    PaymentRequest,
    PaymentResponse,
    PaymentStatus,
    PaymentMethod
)
from app.services.supabase_auth import (
    send_otp_via_supabase,
    verify_otp_via_supabase,
    get_supabase_user
)

__all__ = [
    # SMS
    "sms_service",
    "send_sms",
    "send_otp_sms",
    "send_notification_sms",
    # Storage
    "storage_service",
    "save_file",
    "save_audio",
    "get_file_url",
    "delete_file",
    # Voice
    "reverie_service",
    "verify_webhook_signature",
    "handle_voice_webhook",
    "VoiceWebhookPayload",
    "VoiceResponse",
    "VoiceAction",
    # Weather
    "weather_service",
    "get_weather",
    "get_weather_for_user",
    # Payments
    "payment_service",
    "initiate_payment",
    "confirm_payment",
    "get_payment_status",
    "refund_payment",
    "PaymentRequest",
    "PaymentResponse",
    "PaymentStatus",
    "PaymentMethod",
    # Supabase Auth
    "send_otp_via_supabase",
    "verify_otp_via_supabase",
    "get_supabase_user",
]
