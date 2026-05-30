"""
Shree Anna Backend - Database Models
SQLModel definitions for all entities.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlmodel import Field, Relationship, SQLModel, JSON, Column
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.utils import generate_uuid, utc_now


# =============================================================================
# BASE MODELS
# =============================================================================

class TimestampMixin(SQLModel):
    """Mixin for created_at and updated_at timestamps."""
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# USER & AUTHENTICATION
# =============================================================================

class User(SQLModel, table=True):
    """User account - can be farmer, FPO, buyer, processor, or admin."""
    __tablename__ = "users"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    phone: str = Field(unique=True, index=True)
    name: Optional[str] = None
    email: Optional[str] = None  # For admin users
    roles: str = Field(default="farmer")  # comma-separated: farmer,fpo,buyer,processor,admin
    language: str = Field(default="hi")
    preferred_language: str = Field(default="hi")
    district: Optional[str] = None
    state: Optional[str] = None
    profile_photo_url: Optional[str] = None
    external_id: Optional[str] = None
    # Admin-specific fields
    designation: Optional[str] = None  # state, district, logistics, quality
    access_level: Optional[str] = None  # l1, l2, l3
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    is_kyc_verified: bool = Field(default=False)
    kyc_verified_at: Optional[str] = None
    masked_aadhaar: Optional[str] = None
    onboarded: bool = Field(default=False)
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    farmer: Optional["Farmer"] = Relationship(back_populates="user")
    fpo: Optional["FPO"] = Relationship(back_populates="user")
    buyer: Optional["Buyer"] = Relationship(back_populates="user")
    processor: Optional["Processor"] = Relationship(back_populates="user")
    
    def get_roles(self) -> List[str]:
        """Get roles as list."""
        return [r.strip() for r in self.roles.split(",") if r.strip()]
    
    def has_role(self, role: str) -> bool:
        """Check if user has a specific role."""
        return role in self.get_roles()
    
    def add_role(self, role: str) -> None:
        """Add a role to the user."""
        roles = self.get_roles()
        if role not in roles:
            roles.append(role)
            self.roles = ",".join(roles)


class OTPRecord(SQLModel, table=True):
    """OTP records for phone verification."""
    __tablename__ = "otps"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    phone: str = Field(index=True)
    otp_hash: str
    expires_at: datetime
    used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# FARMER, FPO, BUYER, PROCESSOR PROFILES
# =============================================================================

class Farmer(SQLModel, table=True):
    """Farmer profile linked to a user."""
    __tablename__ = "farmers"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True))
    land_size: Optional[float] = None
    geo: Optional[str] = None  # JSON string: {lat, lng, address, pincode}
    village: Optional[str] = None
    agri_id: Optional[str] = Field(default=None, index=True)
    crops: str = Field(default="[]")  # JSON array of crops
    organic_certified: bool = Field(default=False)
    certification_id: Optional[str] = None
    # Bank details for payment
    bank_account: Optional[str] = None
    ifsc: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="farmer")


class FPO(SQLModel, table=True):
    """Farmer Producer Organization profile."""
    __tablename__ = "fpos"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True))
    name: str
    registration_no: Optional[str] = None
    registration_docs: str = Field(default="[]")  # JSON array of doc URLs
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    member_count: Optional[int] = None
    is_active: bool = Field(default=True)
    verified: bool = Field(default=False)
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="fpo")
    batches: List["Batch"] = Relationship(back_populates="created_by_fpo")


class Buyer(SQLModel, table=True):
    """Buyer profile linked to a user."""
    __tablename__ = "buyers"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True))
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    buyer_type: Optional[str] = None  # retail, bulk, distributor, exporter, institutional
    verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="buyer")


class Processor(SQLModel, table=True):
    """Millet Processor profile linked to a user."""
    __tablename__ = "processors"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True))
    company_name: Optional[str] = None  # Same as user.name for processors
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    unit_type: Optional[str] = None  # micro, small, medium, large
    fssai_license: Optional[str] = None  # FSSAI License Number
    products: str = Field(default="[]")  # JSON array of products: flour, mixes, snacks, cookies, ready_to_eat, malt
    address: Optional[str] = None
    is_active: bool = Field(default=True)
    verified: bool = Field(default=False)
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="processor")


# =============================================================================
# LISTINGS & OFFERS
# =============================================================================

class Listing(SQLModel, table=True):
    """Product listing by farmer, FPO, or Processor."""
    __tablename__ = "listings"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    owner_type: str = Field(index=True)  # farmer, fpo, processor
    owner_id: str = Field(index=True)
    crop: str = Field(index=True)
    variety: Optional[str] = None
    description: Optional[str] = None  # Description of the listing
    qty_kg: float
    min_price_per_qtl: float
    photos: str = Field(default="[]")  # JSON array of URLs
    status: str = Field(default="draft", index=True)  # draft, active, paused, sold, expired, cancelled, aggregated
    harvest_date: Optional[datetime] = None
    quality_grade: Optional[str] = None
    moisture_level: Optional[float] = None
    is_organic: bool = Field(default=False)
    organic_cert_url: Optional[str] = None
    district: Optional[str] = Field(default=None, index=True)
    state: Optional[str] = None
    expires_at: Optional[datetime] = None
    client_temp_id: Optional[str] = Field(default=None, index=True)
    # FPO aggregation
    batch_id: Optional[str] = Field(default=None, sa_column=Column(UUID(as_uuid=False), ForeignKey("batches.id"), index=True))
    farmer_id: Optional[str] = Field(default=None, sa_column=Column(UUID(as_uuid=False), ForeignKey("farmers.id"), index=True))  # For FPO aggregation tracking
    
    # Processed product fields (for Processor listings)
    is_processed: bool = Field(default=False, index=True)  # True for processor products
    product_type: Optional[str] = None  # flour, mixes, snacks, cookies, ready_to_eat, malt
    source_batch_id: Optional[str] = Field(default=None, index=True)  # Source batch for traceability
    processing_date: Optional[datetime] = None
    shelf_life_days: Optional[int] = None
    packaging_type: Optional[str] = None  # packet, box, bulk
    packaging_size_grams: Optional[int] = None
    fssai_license: Optional[str] = None  # Processor's FSSAI license
    nutritional_info: Optional[str] = None  # JSON object with nutrition facts
    
    # Retail (B2C) fields
    is_retail: bool = Field(default=False, index=True)  # True for B2C consumer sales
    min_order_kg: float = Field(default=1.0)  # Minimum order quantity for retail
    max_order_kg: Optional[float] = None  # Maximum per order (optional)
    retail_price_per_kg: Optional[float] = None  # Price per kg for retail (vs per quintal for B2B)
    
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    offers: List["Offer"] = Relationship(back_populates="listing")


class Offer(SQLModel, table=True):
    """Buyer offer on a listing."""
    __tablename__ = "offers"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    listing_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("listings.id"), index=True))
    buyer_id: str = Field(index=True)
    price_per_qtl: float
    qty_kg: Optional[float] = None
    message: Optional[str] = None
    status: str = Field(default="pending", index=True)  # pending, accepted, rejected, expired
    accepted_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    listing: Optional[Listing] = Relationship(back_populates="offers")


# =============================================================================
# ORDERS & PAYMENTS
# =============================================================================

class Order(SQLModel, table=True):
    """Order created from accepted offer."""
    __tablename__ = "orders"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    buyer_id: str = Field(index=True)
    seller_id: Optional[str] = None
    listing_id: Optional[str] = Field(default=None, sa_column=Column(UUID(as_uuid=False), ForeignKey("listings.id")))
    batch_id: Optional[str] = Field(default=None, sa_column=Column(UUID(as_uuid=False), ForeignKey("batches.id")))
    offer_id: Optional[str] = Field(default=None, sa_column=Column(UUID(as_uuid=False), ForeignKey("offers.id")))
    qty_kg: float
    price_per_qtl: float
    total_amount: float
    status: str = Field(default="created", index=True)  # created, confirmed, processing, shipped, delivered, cancelled, disputed
    payment_status: str = Field(default="pending")  # pending, initiated, completed, failed, refunded
    logistics_status: str = Field(default="pending")  # pending, scheduled, in_transit, delivered
    shipping_address: Optional[str] = None  # JSON
    tracking_number: Optional[str] = None
    delivery_date: Optional[datetime] = None
    delivery_proof_url: Optional[str] = None  # Photo proof of delivery
    # Razorpay integration fields
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class Payment(SQLModel, table=True):
    """Payment record for an order."""
    __tablename__ = "payments"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    order_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("orders.id"), index=True))
    amount: float
    currency: str = Field(default="INR")
    status: str = Field(default="pending", index=True)  # pending, initiated, completed, failed, refunded
    payment_method: Optional[str] = None  # upi, bank_transfer, cash
    transaction_id: Optional[str] = None
    payment_url: Optional[str] = None
    extra_data: Optional[str] = None  # JSON - renamed from metadata (reserved)
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# ESCROW SYSTEM
# =============================================================================

class Escrow(SQLModel, table=True):
    """Escrow for holding funds between payment and delivery confirmation."""
    __tablename__ = "escrows"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    order_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("orders.id"), unique=True, index=True))
    payment_id: Optional[str] = Field(default=None, sa_column=Column(UUID(as_uuid=False), ForeignKey("payments.id")))
    
    # Amounts
    amount: float  # Total amount held
    platform_fee: float = Field(default=0.0)  # Platform commission
    seller_amount: float = Field(default=0.0)  # Amount to be released to seller
    currency: str = Field(default="INR")
    
    # Status tracking
    status: str = Field(default="pending", index=True)  # pending, held, released, refunded, disputed
    held_at: Optional[datetime] = None
    released_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    
    # Dispute handling
    dispute_reason: Optional[str] = None
    dispute_filed_at: Optional[datetime] = None
    dispute_resolved_at: Optional[datetime] = None
    dispute_resolution: Optional[str] = None  # refund, release, partial_refund
    
    # Release/Refund details
    released_to: Optional[str] = None  # User ID who received funds
    refunded_to: Optional[str] = None  # User ID who received refund
    release_transaction_id: Optional[str] = None
    refund_transaction_id: Optional[str] = None
    
    # Metadata
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# QUALITY CERTIFICATES
# =============================================================================

class Certificate(SQLModel, table=True):
    """Quality certificate for a listing (FSSAI, Organic, Lab Reports, etc.)."""
    __tablename__ = "certificates"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    listing_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("listings.id"), index=True))
    batch_id: Optional[str] = Field(default=None, sa_column=Column(UUID(as_uuid=False), ForeignKey("batches.id"), index=True))
    
    # Certificate details
    cert_type: str = Field(index=True)  # fssai, organic, lab_report, quality_test, pesticide_free, gmo_free
    cert_number: Optional[str] = None  # Certificate number/ID from issuing authority
    issuer: Optional[str] = None  # Who issued (lab name, certification body)
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    
    # File storage
    file_url: str  # URL to the certificate file (PDF/image)
    file_type: str = Field(default="pdf")  # pdf, jpg, png
    file_size: Optional[int] = None  # Size in bytes
    
    # Verification status
    verification_status: str = Field(default="pending", index=True)  # pending, verified, rejected, expired
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None  # User ID of verifier (admin)
    rejection_reason: Optional[str] = None
    
    # Metadata
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# ORDER EVENTS (STATUS TRACKING)
# =============================================================================

class OrderEvent(SQLModel, table=True):
    """Tracks all status changes and events for an order (audit trail)."""
    __tablename__ = "order_events"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    order_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("orders.id"), index=True))
    
    # Event details
    event_type: str = Field(index=True)  # status_change, payment, shipment, delivery, dispute, note
    previous_status: Optional[str] = None  # Previous order status (if status_change)
    new_status: Optional[str] = None  # New order status (if status_change)
    
    # Actor info
    actor_id: Optional[str] = None  # User who triggered the event
    actor_type: Optional[str] = None  # buyer, seller, admin, system, logistics
    
    # Event metadata
    title: str  # Human-readable event title
    description: Optional[str] = None  # Detailed description
    location: Optional[str] = None  # Location where event occurred (for logistics)
    extra_data: Optional[str] = None  # JSON - additional data
    
    # Timestamps
    timestamp: datetime = Field(default_factory=utc_now, index=True)
    estimated_next_at: Optional[datetime] = None  # Estimated time for next event


# =============================================================================
# FPO MEMBER CONSENT
# =============================================================================

class FPOMemberConsent(SQLModel, table=True):
    """Records farmer consent to join an FPO with verification."""
    __tablename__ = "fpo_member_consents"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    fpo_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("fpos.id"), index=True))
    farmer_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("farmers.id"), index=True))
    consent_type: str = Field(default="otp")  # otp, voice, signature
    otp_code: Optional[str] = None  # The OTP sent for verification
    otp_verified: bool = Field(default=False)
    consent_given: bool = Field(default=False)
    voice_recording_url: Optional[str] = None  # For voice consent
    ip_address: Optional[str] = None
    device_info: Optional[str] = None
    consent_timestamp: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)
    expires_at: Optional[datetime] = None  # OTP expiration


# =============================================================================
# SHOPPING CART (B2C)
# =============================================================================

class CartItem(SQLModel, table=True):
    """Shopping cart item for B2C consumers."""
    __tablename__ = "cart_items"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("users.id"), index=True))
    listing_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("listings.id"), index=True))
    qty_kg: float  # Quantity in kg
    price_per_kg: float  # Snapshot of price at time of adding
    added_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# BATCHES & TRACEABILITY
# =============================================================================

class Batch(SQLModel, table=True):
    """Batch of produce aggregated by FPO."""
    __tablename__ = "batches"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    created_by_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("fpos.id"), index=True))
    source_lots: str = Field(default="[]")  # JSON array of listing IDs
    total_weight: float
    crop: str = Field(index=True)
    grade: Optional[str] = None  # Quality grade (A, B, C)
    qr_code: str = Field(default_factory=lambda: __import__('secrets').token_hex(6).upper(), unique=True, index=True)
    assay_results: Optional[str] = None  # JSON object
    qr_code_url: Optional[str] = None
    status: str = Field(default="created")  # created, processed, shipped, delivered
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    created_by_fpo: Optional[FPO] = Relationship(back_populates="batches")
    trace_events: List["TraceEvent"] = Relationship(back_populates="batch")


class TraceEvent(SQLModel, table=True):
    """
    Append-only trace event for supply chain tracking.
    Each event is cryptographically linked to prevent tampering.
    """
    __tablename__ = "trace_events"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    batch_id: str = Field(sa_column=Column(UUID(as_uuid=False), ForeignKey("batches.id"), index=True))
    event_type: str = Field(index=True)  # harvested, collected, qc_passed, batched, shipped, delivered, etc.
    payload: str  # JSON object with event details
    payload_hash: str  # SHA256 of payload for tamper detection
    server_signature: str  # HMAC signature by server
    actor_id: Optional[str] = None
    actor_type: Optional[str] = None  # farmer, fpo, logistics, buyer
    location: Optional[str] = None  # JSON: {lat, lng, address}
    timestamp: datetime = Field(default_factory=utc_now)
    created_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    batch: Optional[Batch] = Relationship(back_populates="trace_events")


# =============================================================================
# CONSENT
# =============================================================================

class Consent(SQLModel, table=True):
    """
    Consent record for proxy actions (e.g., FPO acting on farmer's behalf).
    Includes audio URL and OTP hash for auditable consent.
    """
    __tablename__ = "consents"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    farmer_id: str = Field(index=True)  # User ID of farmer granting consent
    proxy_user_id: str = Field(index=True)  # User ID of proxy (FPO/SHG)
    scope: str = Field(default="all")  # comma-separated: list,accept,sell,all
    max_qty_kg: Optional[float] = None
    audio_url: Optional[str] = None
    audio_hash: Optional[str] = None
    otp_hash: Optional[str] = None
    transcript: Optional[str] = None
    active: bool = Field(default=True)
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# MEDIA
# =============================================================================

class Media(SQLModel, table=True):
    """Media file information."""
    __tablename__ = "media"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    url: str
    hash: str = Field(index=True)
    type: str  # image, audio, document, certificate
    filename: Optional[str] = None
    content_type: Optional[str] = None
    size: Optional[int] = None
    purpose: Optional[str] = None  # listing_photo, consent_audio, certificate, etc.
    uploaded_by: str = Field(index=True)
    external: bool = Field(default=False)  # True if URL is external (not stored locally)
    extra_data: Optional[str] = None  # JSON - renamed from metadata (reserved)
    created_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# SYNC QUEUE
# =============================================================================

class SyncQueue(SQLModel, table=True):
    """Queue for offline sync operations."""
    __tablename__ = "sync_queue"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(index=True)
    type: str  # listing.create, offer.accept, consent.grant, etc.
    client_temp_id: Optional[str] = Field(default=None, index=True)
    payload: str  # JSON
    status: str = Field(default="pending", index=True)  # pending, processing, completed, failed, conflict
    canonical_id: Optional[str] = None  # Server-assigned ID after processing
    error_message: Optional[str] = None
    retry_count: int = Field(default=0)
    client_ts: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# EVENTS LOG
# =============================================================================

class EventsLog(SQLModel, table=True):
    """Log of all webhook and system events."""
    __tablename__ = "events_log"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: Optional[str] = Field(default=None, index=True)
    event_type: str = Field(index=True)
    source: Optional[str] = None  # reverie, twilio, system, api
    raw: str  # JSON of raw event data
    processed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# WEATHER & ADVISORIES
# =============================================================================

class WeatherCache(SQLModel, table=True):
    """Cached weather data."""
    __tablename__ = "weather_cache"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    district: str = Field(unique=True, index=True)
    data: str  # JSON
    expires_at: datetime
    updated_at: datetime = Field(default_factory=utc_now)


class Advisory(SQLModel, table=True):
    """Farming advisories for districts."""
    __tablename__ = "advisories"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    title: str
    message: str
    title_hi: Optional[str] = None
    message_hi: Optional[str] = None
    type: str  # weather, market, pest, general
    districts: str = Field(default="[]")  # JSON array, empty = all districts
    priority: str = Field(default="normal")  # low, normal, high, urgent
    send_sms: bool = Field(default=False)
    send_voice: bool = Field(default=False)
    send_push: bool = Field(default=True)
    sent_at: Optional[datetime] = None
    created_by: str
    created_at: datetime = Field(default_factory=utc_now)


# =============================================================================
# SMS TEMPLATES
# =============================================================================

class SmsTemplate(SQLModel, table=True):
    """SMS message templates."""
    __tablename__ = "sms_templates"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    key: str = Field(unique=True, index=True)
    template: str
    template_hi: Optional[str] = None
    variables: str = Field(default="[]")  # JSON array
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now)
