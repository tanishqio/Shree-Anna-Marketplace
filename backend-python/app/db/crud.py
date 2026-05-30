"""
Shree Anna Backend - CRUD Operations
Database operations for all models.
"""

import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlmodel import Session, select
from loguru import logger

from app.core.hashing import (
    compute_payload_hash,
    sign_hash,
    hash_otp,
    verify_otp_hash,
    generate_otp
)
from app.core.utils import generate_uuid, utc_now, normalize_phone, get_fallback_store
from app.db.models import (
    User, OTPRecord, Farmer, FPO, Buyer,
    Listing, Offer, Order, Payment,
    Batch, TraceEvent, Consent, Media,
    SyncQueue, EventsLog, WeatherCache, Advisory
)


# =============================================================================
# USER OPERATIONS
# =============================================================================

def get_user_by_phone(session: Session, phone: str) -> Optional[User]:
    """Get user by phone number."""
    normalized = normalize_phone(phone)
    statement = select(User).where(User.phone == normalized)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: str) -> Optional[User]:
    """Get user by ID."""
    return session.get(User, user_id)


def create_user(
    session: Session,
    phone: str,
    name: Optional[str] = None,
    roles: str = "farmer",
    language: str = "hi",
    district: Optional[str] = None
) -> User:
    """Create a new user."""
    user = User(
        phone=normalize_phone(phone),
        name=name,
        roles=roles,
        language=language,
        district=district
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    logger.info(f"Created user: {user.id} ({user.phone})")
    return user


def update_user(session: Session, user_id: str, **kwargs) -> Optional[User]:
    """Update user fields."""
    user = session.get(User, user_id)
    if not user:
        return None
    
    for key, value in kwargs.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


# =============================================================================
# OTP OPERATIONS
# =============================================================================

def create_otp_record(session: Session, phone: str) -> Tuple[str, OTPRecord]:
    """
    Create a new OTP record for phone verification.
    Returns the plain OTP and the OTP record.
    """
    normalized = normalize_phone(phone)
    otp = generate_otp()
    otp_hash_value = hash_otp(otp, normalized)
    
    # Expire any existing OTPs
    existing = session.exec(
        select(OTPRecord).where(
            OTPRecord.phone == normalized,
            OTPRecord.used == False  # noqa: E712
        )
    ).all()
    
    for record in existing:
        record.used = True
        session.add(record)
    
    # Create new OTP record
    record = OTPRecord(
        phone=normalized,
        otp_hash=otp_hash_value,
        expires_at=utc_now() + timedelta(minutes=5)
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    
    logger.info(f"Created OTP for phone: {normalized}")
    return otp, record


def verify_otp(session: Session, phone: str, otp: str) -> bool:
    """Verify an OTP for a phone number."""
    normalized = normalize_phone(phone)
    
    # Find valid unexpired OTP
    statement = select(OTPRecord).where(
        OTPRecord.phone == normalized,
        OTPRecord.used == False,  # noqa: E712
        OTPRecord.expires_at > utc_now()
    ).order_by(OTPRecord.created_at.desc())
    
    record = session.exec(statement).first()
    if not record:
        logger.warning(f"No valid OTP found for: {normalized}")
        return False
    
    # Verify OTP hash
    if not verify_otp_hash(otp, normalized, record.otp_hash):
        logger.warning(f"Invalid OTP for: {normalized}")
        return False
    
    # Mark as used
    record.used = True
    session.add(record)
    session.commit()
    
    logger.info(f"OTP verified for: {normalized}")
    return True


# =============================================================================
# FARMER/FPO/BUYER PROFILE OPERATIONS
# =============================================================================

def create_farmer_profile(
    session: Session,
    user_id: str,
    land_size: Optional[float] = None,
    geo: Optional[Dict] = None,
    crops: Optional[List[str]] = None,
    village: Optional[str] = None,
    bank_account: Optional[str] = None,
    ifsc: Optional[str] = None
) -> Farmer:
    """Create farmer profile for a user."""
    farmer = Farmer(
        user_id=user_id,
        land_size=land_size,
        geo=json.dumps(geo) if geo else None,
        crops=json.dumps(crops) if crops else "[]",
        village=village,
        bank_account=bank_account,
        ifsc=ifsc
    )
    session.add(farmer)
    
    # Add farmer role to user
    user = session.get(User, user_id)
    if user and not user.has_role("farmer"):
        user.add_role("farmer")
        session.add(user)
    
    session.commit()
    session.refresh(farmer)
    return farmer


def get_farmer_by_user_id(session: Session, user_id: str) -> Optional[Farmer]:
    """Get farmer profile by user ID."""
    statement = select(Farmer).where(Farmer.user_id == user_id)
    return session.exec(statement).first()


def create_fpo_profile(
    session: Session,
    user_id: str,
    name: str,
    registration_no: Optional[str] = None,
    address: Optional[str] = None,
    district: Optional[str] = None,
    member_count: Optional[int] = None
) -> FPO:
    """Create FPO profile for a user."""
    fpo = FPO(
        user_id=user_id,
        name=name,
        registration_no=registration_no,
        address=address,
        district=district,
        member_count=member_count
    )
    session.add(fpo)
    
    # Add FPO role to user
    user = session.get(User, user_id)
    if user and not user.has_role("fpo"):
        user.add_role("fpo")
        session.add(user)
    
    session.commit()
    session.refresh(fpo)
    return fpo


def get_fpo_by_user_id(session: Session, user_id: str) -> Optional[FPO]:
    """Get FPO profile by user ID."""
    statement = select(FPO).where(FPO.user_id == user_id)
    return session.exec(statement).first()


def create_buyer_profile(
    session: Session,
    user_id: str,
    company_name: Optional[str] = None,
    gst_number: Optional[str] = None,
    address: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    buyer_type: Optional[str] = None
) -> Buyer:
    """Create Buyer profile for a user."""
    buyer = Buyer(
        user_id=user_id,
        company_name=company_name,
        gst_number=gst_number,
        address=address,
        district=district,
        state=state,
        buyer_type=buyer_type
    )
    session.add(buyer)
    
    # Add buyer role to user
    user = session.get(User, user_id)
    if user and not user.has_role("buyer"):
        user.add_role("buyer")
        session.add(user)
    
    session.commit()
    session.refresh(buyer)
    return buyer


def get_buyer_by_user_id(session: Session, user_id: str) -> Optional[Buyer]:
    """Get Buyer profile by user ID."""
    statement = select(Buyer).where(Buyer.user_id == user_id)
    return session.exec(statement).first()


def create_processor_profile(
    session: Session,
    user_id: str,
    company_name: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    city: Optional[str] = None,
    unit_type: Optional[str] = None,
    fssai_license: Optional[str] = None,
    products: Optional[List[str]] = None,
    address: Optional[str] = None
) -> "Processor":
    """Create Processor profile for a user."""
    from app.db.models import Processor
    
    processor = Processor(
        user_id=user_id,
        company_name=company_name,
        state=state,
        district=district,
        city=city,
        unit_type=unit_type,
        fssai_license=fssai_license,
        products=json.dumps(products) if products else "[]",
        address=address
    )
    session.add(processor)
    
    # Add processor role to user
    user = session.get(User, user_id)
    if user and not user.has_role("processor"):
        user.add_role("processor")
        session.add(user)
    
    session.commit()
    session.refresh(processor)
    return processor


def get_processor_by_user_id(session: Session, user_id: str) -> Optional["Processor"]:
    """Get Processor profile by user ID."""
    from app.db.models import Processor
    statement = select(Processor).where(Processor.user_id == user_id)
    return session.exec(statement).first()


# =============================================================================
# LISTING OPERATIONS
# =============================================================================

def create_listing(
    session: Session,
    owner_type: str,
    owner_id: str,
    crop: str,
    qty_kg: float,
    min_price_per_qtl: float,
    **kwargs
) -> Listing:
    """Create a new listing."""
    listing = Listing(
        owner_type=owner_type,
        owner_id=owner_id,
        crop=crop,
        qty_kg=qty_kg,
        min_price_per_qtl=min_price_per_qtl,
        **kwargs
    )
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    # Create trace event
    create_trace_event_for_listing(session, listing, "listing_created")
    
    logger.info(f"Created listing: {listing.id}")
    return listing


def get_listing_by_id(session: Session, listing_id: str) -> Optional[Listing]:
    """Get listing by ID."""
    return session.get(Listing, listing_id)


def get_listings(
    session: Session,
    crop: Optional[str] = None,
    district: Optional[str] = None,
    status: str = "active",
    is_processed: Optional[bool] = None,
    owner_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[Listing]:
    """Get listings with optional filters."""
    statement = select(Listing).where(Listing.status == status)
    
    if crop:
        statement = statement.where(Listing.crop == crop)
    if district:
        statement = statement.where(Listing.district == district)
    if is_processed is not None:
        statement = statement.where(Listing.is_processed == is_processed)
    if owner_type:
        statement = statement.where(Listing.owner_type == owner_type)
    
    statement = statement.offset(offset).limit(limit).order_by(Listing.created_at.desc())
    return list(session.exec(statement).all())


def update_listing_status(
    session: Session,
    listing_id: str,
    status: str,
    actor_id: Optional[str] = None
) -> Optional[Listing]:
    """Update listing status."""
    listing = session.get(Listing, listing_id)
    if not listing:
        return None
    
    old_status = listing.status
    listing.status = status
    listing.updated_at = utc_now()
    session.add(listing)
    session.commit()
    
    # Create trace event for status change
    create_trace_event_for_listing(
        session, listing, "listing_status_changed",
        {"old_status": old_status, "new_status": status},
        actor_id
    )
    
    session.refresh(listing)
    return listing


def create_trace_event_for_listing(
    session: Session,
    listing: Listing,
    event_type: str,
    extra_payload: Optional[Dict] = None,
    actor_id: Optional[str] = None
) -> None:
    """Create a trace event for a listing change (fallback to events_log)."""
    payload = {
        "listing_id": listing.id,
        "crop": listing.crop,
        "qty_kg": listing.qty_kg,
        "status": listing.status,
        "timestamp": utc_now().isoformat()
    }
    if extra_payload:
        payload.update(extra_payload)
    
    # Log to events_log (listings don't have batch_id by default)
    event = EventsLog(
        user_id=actor_id or listing.owner_id,
        event_type=event_type,
        source="system",
        raw=json.dumps(payload)
    )
    session.add(event)
    session.commit()


# =============================================================================
# OFFER OPERATIONS
# =============================================================================

def create_offer(
    session: Session,
    listing_id: str,
    buyer_id: str,
    price_per_qtl: float,
    qty_kg: Optional[float] = None,
    message: Optional[str] = None
) -> Offer:
    """Create an offer on a listing."""
    offer = Offer(
        listing_id=listing_id,
        buyer_id=buyer_id,
        price_per_qtl=price_per_qtl,
        qty_kg=qty_kg,
        message=message
    )
    session.add(offer)
    session.commit()
    session.refresh(offer)
    logger.info(f"Created offer: {offer.id} on listing {listing_id}")
    return offer


def accept_offer(session: Session, offer_id: str) -> Optional[Offer]:
    """Accept an offer."""
    offer = session.get(Offer, offer_id)
    if not offer or offer.status != "pending":
        return None
    
    offer.status = "accepted"
    offer.accepted_at = utc_now()
    offer.updated_at = utc_now()
    session.add(offer)
    
    # Update listing status
    listing = session.get(Listing, offer.listing_id)
    if listing:
        listing.status = "sold"
        listing.updated_at = utc_now()
        session.add(listing)
    
    # Reject other pending offers
    other_offers = session.exec(
        select(Offer).where(
            Offer.listing_id == offer.listing_id,
            Offer.id != offer_id,
            Offer.status == "pending"
        )
    ).all()
    
    for other in other_offers:
        other.status = "rejected"
        other.rejected_at = utc_now()
        session.add(other)
    
    session.commit()
    session.refresh(offer)
    logger.info(f"Accepted offer: {offer.id}")
    return offer


# =============================================================================
# BATCH & TRACE OPERATIONS
# =============================================================================

def create_batch(
    session: Session,
    created_by_id: str,
    source_lots: List[str],
    total_weight: float,
    crop: str,
    **kwargs
) -> Batch:
    """Create a new batch."""
    batch = Batch(
        created_by_id=created_by_id,
        source_lots=json.dumps(source_lots),
        total_weight=total_weight,
        crop=crop,
        **kwargs
    )
    session.add(batch)
    session.commit()
    session.refresh(batch)
    
    # Create initial trace event
    add_trace_event(
        session,
        batch_id=batch.id,
        event_type="batch_created",
        payload={"source_lots": source_lots, "total_weight": total_weight, "crop": crop},
        actor_id=created_by_id,
        actor_type="fpo"
    )
    
    logger.info(f"Created batch: {batch.id}")
    return batch


def get_batch_by_id(session: Session, batch_id: str) -> Optional[Batch]:
    """Get batch by ID."""
    return session.get(Batch, batch_id)


def add_trace_event(
    session: Session,
    batch_id: str,
    event_type: str,
    payload: Dict[str, Any],
    actor_id: Optional[str] = None,
    actor_type: Optional[str] = None,
    location: Optional[Dict] = None
) -> TraceEvent:
    """
    Add a trace event to a batch.
    Computes payload hash and server signature for tamper-evidence.
    """
    # Add timestamp to payload
    payload["timestamp"] = utc_now().isoformat()
    
    # Compute hash and signature
    payload_hash = compute_payload_hash(payload)
    server_signature = sign_hash(payload_hash)
    
    event = TraceEvent(
        batch_id=batch_id,
        event_type=event_type,
        payload=json.dumps(payload),
        payload_hash=payload_hash,
        server_signature=server_signature,
        actor_id=actor_id,
        actor_type=actor_type,
        location=json.dumps(location) if location else None
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    
    logger.info(f"Added trace event: {event.id} ({event_type}) to batch {batch_id}")
    return event


def get_batch_trace(session: Session, batch_id: str) -> List[TraceEvent]:
    """Get all trace events for a batch in chronological order."""
    statement = select(TraceEvent).where(
        TraceEvent.batch_id == batch_id
    ).order_by(TraceEvent.timestamp.asc())
    return list(session.exec(statement).all())


# =============================================================================
# CONSENT OPERATIONS
# =============================================================================

def create_consent(
    session: Session,
    farmer_id: str,
    proxy_user_id: str,
    scope: str = "all",
    expires_days: int = 365,
    audio_url: Optional[str] = None,
    audio_hash: Optional[str] = None,
    otp_hash: Optional[str] = None
) -> Consent:
    """Create a consent record."""
    consent = Consent(
        farmer_id=farmer_id,
        proxy_user_id=proxy_user_id,
        scope=scope,
        audio_url=audio_url,
        audio_hash=audio_hash,
        otp_hash=otp_hash,
        expires_at=utc_now() + timedelta(days=expires_days)
    )
    session.add(consent)
    session.commit()
    session.refresh(consent)
    logger.info(f"Created consent: {consent.id}")
    return consent


def get_active_consent(
    session: Session,
    farmer_id: str,
    proxy_user_id: str
) -> Optional[Consent]:
    """Get active consent between farmer and proxy."""
    statement = select(Consent).where(
        Consent.farmer_id == farmer_id,
        Consent.proxy_user_id == proxy_user_id,
        Consent.active == True,  # noqa: E712
        Consent.expires_at > utc_now()
    )
    return session.exec(statement).first()


# =============================================================================
# SYNC QUEUE OPERATIONS
# =============================================================================

def add_to_sync_queue(
    session: Session,
    user_id: str,
    type: str,
    payload: Dict[str, Any],
    client_temp_id: Optional[str] = None,
    client_ts: Optional[datetime] = None
) -> SyncQueue:
    """Add an item to the sync queue."""
    item = SyncQueue(
        user_id=user_id,
        type=type,
        payload=json.dumps(payload),
        client_temp_id=client_temp_id,
        client_ts=client_ts
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def get_pending_sync_items(
    session: Session,
    user_id: str,
    since: Optional[datetime] = None
) -> List[SyncQueue]:
    """Get pending sync items for a user."""
    statement = select(SyncQueue).where(
        SyncQueue.user_id == user_id,
        SyncQueue.status.in_(["pending", "conflict"])
    )
    if since:
        statement = statement.where(SyncQueue.created_at > since)
    return list(session.exec(statement).all())


# =============================================================================
# EVENTS LOG
# =============================================================================

def log_event(
    session: Session,
    event_type: str,
    raw: Any,
    user_id: Optional[str] = None,
    source: str = "system"
) -> EventsLog:
    """Log an event."""
    event = EventsLog(
        user_id=user_id,
        event_type=event_type,
        source=source,
        raw=json.dumps(raw) if not isinstance(raw, str) else raw
    )
    session.add(event)
    session.commit()
    
    # Also log to fallback store
    try:
        store = get_fallback_store("events_log")
        store.append({
            "id": event.id,
            "event_type": event_type,
            "source": source,
            "user_id": user_id,
            "raw": raw,
            "created_at": utc_now().isoformat()
        })
    except Exception as e:
        logger.warning(f"Failed to write to fallback store: {e}")
    
    return event


# =============================================================================
# WEATHER CACHE
# =============================================================================

def get_cached_weather(session: Session, district: str) -> Optional[Dict]:
    """Get cached weather data for a district."""
    statement = select(WeatherCache).where(
        WeatherCache.district == district,
        WeatherCache.expires_at > utc_now()
    )
    cache = session.exec(statement).first()
    if cache:
        return json.loads(cache.data)
    return None


def set_cached_weather(
    session: Session,
    district: str,
    data: Dict,
    ttl_minutes: int = 10
) -> WeatherCache:
    """Set cached weather data for a district."""
    # Update existing or create new
    statement = select(WeatherCache).where(WeatherCache.district == district)
    cache = session.exec(statement).first()
    
    if cache:
        cache.data = json.dumps(data)
        cache.expires_at = utc_now() + timedelta(minutes=ttl_minutes)
        cache.updated_at = utc_now()
    else:
        cache = WeatherCache(
            district=district,
            data=json.dumps(data),
            expires_at=utc_now() + timedelta(minutes=ttl_minutes)
        )
    
    session.add(cache)
    session.commit()
    session.refresh(cache)
    return cache
