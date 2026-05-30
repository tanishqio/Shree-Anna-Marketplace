"""
Shree Anna Backend - Database Module
"""

from app.db.init_db import engine, get_session, init_database
from app.db.models import (
    User, OTPRecord, Farmer, FPO, Buyer,
    Listing, Offer, Order, Payment, Certificate, Escrow, OrderEvent, CartItem,
    Batch, TraceEvent, Consent, Media,
    SyncQueue, EventsLog, WeatherCache, Advisory, SmsTemplate
)
from app.db.crud import (
    # User operations
    get_user_by_phone,
    get_user_by_id,
    create_user,
    update_user,
    # OTP operations
    create_otp_record,
    verify_otp,
    # Profile operations
    create_farmer_profile,
    get_farmer_by_user_id,
    create_fpo_profile,
    get_fpo_by_user_id,
    # Buyer operations
    create_buyer_profile,
    get_buyer_by_user_id,
    # Processor operations
    create_processor_profile,
    get_processor_by_user_id,
    # Listing operations
    create_listing,
    get_listing_by_id,
    get_listings,
    update_listing_status,
    # Offer operations
    create_offer,
    accept_offer,
    # Batch & Trace operations
    create_batch,
    get_batch_by_id,
    add_trace_event,
    get_batch_trace,
    # Consent operations
    create_consent,
    get_active_consent,
    # Sync operations
    add_to_sync_queue,
    get_pending_sync_items,
    # Events
    log_event,
    # Weather
    get_cached_weather,
    set_cached_weather,
)

__all__ = [
    # Database
    "engine",
    "create_db_and_tables",
    "get_session",
    "init_database",
    # Models
    "User",
    "OTPRecord",
    "Farmer",
    "FPO",
    "Buyer",
    "Listing",
    "Offer",
    "Order",
    "Payment",
    "Batch",
    "TraceEvent",
    "Consent",
    "Media",
    "SyncQueue",
    "EventsLog",
    "WeatherCache",
    "Advisory",
    "SmsTemplate",
    # CRUD
    "get_user_by_phone",
    "get_user_by_id",
    "create_user",
    "update_user",
    "create_otp_record",
    "verify_otp",
    "create_farmer_profile",
    "get_farmer_by_user_id",
    "create_fpo_profile",
    "get_fpo_by_user_id",
    "create_buyer_profile",
    "get_buyer_by_user_id",
    "create_processor_profile",
    "get_processor_by_user_id",
    "create_listing",
    "get_listing_by_id",
    "get_listings",
    "update_listing_status",
    "create_offer",
    "accept_offer",
    "create_batch",
    "get_batch_by_id",
    "add_trace_event",
    "get_batch_trace",
    "create_consent",
    "get_active_consent",
    "add_to_sync_queue",
    "get_pending_sync_items",
    "log_event",
    "get_cached_weather",
    "set_cached_weather",
]
