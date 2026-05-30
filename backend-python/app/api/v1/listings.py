"""
Shree Anna Backend - Listings API Routes
Marketplace listings for millet crops.
"""

import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from loguru import logger

from app.core.security import get_current_user, get_optional_user, require_farmer
from app.core.utils import success_response, paginated_response
from app.db import (
    get_session, User, Listing, Offer,
    create_listing, get_listing_by_id, get_listings, update_listing_status,
    create_offer, accept_offer
)
from app.db.models import Processor
from app.services import send_notification_sms


router = APIRouter(prefix="/listings", tags=["Listings"])


# Supported crops
MILLET_CROPS = [
    "ragi", "bajra", "jowar", "kodo", "kutki", "foxtail",
    "barnyard", "proso", "little", "browntop"
]


class CreateListingRequest(BaseModel):
    """Create listing request."""
    crop: str = Field(..., description="Crop type (millet variety)")
    qty_kg: float = Field(..., gt=0, description="Quantity in kg")
    min_price_per_qtl: float = Field(..., gt=0, description="Minimum price per quintal")
    description: Optional[str] = None
    district: Optional[str] = None
    geo: Optional[dict] = None
    quality_grade: Optional[str] = None
    harvest_date: Optional[str] = None
    is_organic: bool = Field(default=False, description="Is organic produce")
    images: Optional[List[str]] = None


class UpdateListingRequest(BaseModel):
    """Update listing request."""
    qty_kg: Optional[float] = Field(None, gt=0)
    min_price_per_qtl: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    quality_grade: Optional[str] = None
    is_organic: Optional[bool] = None
    status: Optional[str] = None


class CreateOfferRequest(BaseModel):
    """Create offer on listing."""
    price_per_qtl: float = Field(..., gt=0, description="Offered price per quintal")
    qty_kg: Optional[float] = Field(None, gt=0, description="Quantity to buy")
    message: Optional[str] = None


class ListingResponse(BaseModel):
    """Listing response model."""
    id: str
    owner_type: str
    owner_id: str
    crop: str
    qty_kg: float
    min_price_per_qtl: float
    status: str
    description: Optional[str]
    district: Optional[str]
    quality_grade: Optional[str]
    is_organic: bool
    created_at: str
    offer_count: int = 0


class OfferResponse(BaseModel):
    """Offer response model."""
    id: str
    listing_id: str
    buyer_id: str
    price_per_qtl: float
    qty_kg: Optional[float]
    status: str
    message: Optional[str]
    created_at: str


@router.post("/", response_model=ListingResponse)
async def create_new_listing(
    request: CreateListingRequest,
    current_user: User = Depends(require_farmer),
    session: Session = Depends(get_session)
):
    """
    Create a new crop listing.
    Requires farmer role.
    """
    # Validate crop
    if request.crop.lower() not in MILLET_CROPS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid crop. Supported: {', '.join(MILLET_CROPS)}"
        )
    
    # Determine owner type (farmer or fpo)
    owner_type = "farmer" if current_user.has_role("farmer") else "fpo"
    
    listing = create_listing(
        session=session,
        owner_type=owner_type,
        owner_id=current_user.id,
        crop=request.crop.lower(),
        qty_kg=request.qty_kg,
        min_price_per_qtl=request.min_price_per_qtl,
        description=request.description,
        district=request.district or current_user.district,
        geo=json.dumps(request.geo) if request.geo else None,
        quality_grade=request.quality_grade,
        harvest_date=request.harvest_date,
        is_organic=request.is_organic,
        images=json.dumps(request.images) if request.images else "[]",
        status="active"  # Auto-activate for now so they appear in marketplace
    )
    
    # Send notification SMS
    try:
        send_notification_sms(
            to=current_user.phone,
            template_key="LISTING_CREATED",
            params={
                "crop": request.crop,
                "qty_kg": request.qty_kg,
                "price": request.min_price_per_qtl
            },
            language=current_user.language
        )
    except Exception as e:
        logger.warning(f"Failed to send listing SMS: {e}")
    
    logger.info(f"Listing created: {listing.id} by {current_user.id}")
    
    return ListingResponse(
        id=listing.id,
        owner_type=listing.owner_type,
        owner_id=listing.owner_id,
        crop=listing.crop,
        qty_kg=listing.qty_kg,
        min_price_per_qtl=listing.min_price_per_qtl,
        status=listing.status,
        description=listing.description,
        district=listing.district,
        quality_grade=listing.quality_grade,
        is_organic=listing.is_organic,
        created_at=listing.created_at.isoformat()
    )


@router.get("/")
async def list_listings(
    crop: Optional[str] = Query(None, description="Filter by crop"),
    district: Optional[str] = Query(None, description="Filter by district"),
    min_qty: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, gt=0),
    is_processed: Optional[bool] = Query(None, description="Filter by processed status"),
    owner_type: Optional[str] = Query(None, description="Filter by owner type"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    """
    Get marketplace listings.
    Public endpoint - no auth required.
    """
    offset = (page - 1) * limit
    
    # Get active listings
    listings = get_listings(
        session=session,
        crop=crop.lower() if crop else None,
        district=district,
        status="active",
        is_processed=is_processed,
        owner_type=owner_type,
        limit=limit,
        offset=offset
    )
    
    # Apply additional filters
    if min_qty:
        listings = [l for l in listings if l.qty_kg >= min_qty]
    if max_price:
        listings = [l for l in listings if l.min_price_per_qtl <= max_price]
    
    # Get offer counts
    items = []
    for listing in listings:
        offer_count = session.exec(
            select(Offer).where(
                Offer.listing_id == listing.id,
                Offer.status == "pending"
            )
        ).all()
        
        items.append({
            "id": listing.id,
            "owner_type": listing.owner_type,
            "crop": listing.crop,
            "qty_kg": listing.qty_kg,
            "min_price_per_qtl": listing.min_price_per_qtl,
            "status": listing.status,
            "description": listing.description,
            "district": listing.district,
            "quality_grade": listing.quality_grade,
            "created_at": listing.created_at.isoformat() if listing.created_at else None,
            "offer_count": len(offer_count)
        })
    
    return paginated_response(
        items=items,
        page=page,
        limit=limit,
        total=len(items)  # Would need count query for accurate total
    )


@router.get("/my")
async def get_my_listings(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's listings."""
    offset = (page - 1) * limit
    
    statement = select(Listing).where(Listing.owner_id == current_user.id)
    
    if status:
        statement = statement.where(Listing.status == status)
    
    statement = statement.offset(offset).limit(limit).order_by(Listing.created_at.desc())
    listings = session.exec(statement).all()
    
    items = []
    for listing in listings:
        offer_count = len(session.exec(
            select(Offer).where(Offer.listing_id == listing.id)
        ).all())
        
        items.append({
            "id": listing.id,
            "crop": listing.crop,
            "qty_kg": listing.qty_kg,
            "min_price_per_qtl": listing.min_price_per_qtl,
            "status": listing.status,
            "district": listing.district,
            "created_at": listing.created_at.isoformat() if listing.created_at else None,
            "offer_count": offer_count
        })
    
    return paginated_response(items=items, page=page, limit=limit, total=len(items))


@router.get("/offers/my")
async def get_my_offers(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's offers (as buyer)."""
    offset = (page - 1) * limit
    
    statement = select(Offer).where(Offer.buyer_id == current_user.id)
    
    if status_filter:
        statement = statement.where(Offer.status == status_filter)
    
    statement = statement.offset(offset).limit(limit).order_by(Offer.created_at.desc())
    offers = session.exec(statement).all()
    
    items = []
    for offer in offers:
        # Get listing info
        listing = get_listing_by_id(session, offer.listing_id)
        
        items.append({
            "id": offer.id,
            "listing_id": offer.listing_id,
            "listing_crop": listing.crop if listing else None,
            "price_per_qtl": offer.price_per_qtl,
            "qty_kg": offer.qty_kg,
            "status": offer.status,
            "message": offer.message,
            "created_at": offer.created_at.isoformat() if offer.created_at else None
        })
    
    return paginated_response(items=items, page=page, limit=limit, total=len(items))


@router.get("/{listing_id}")
async def get_listing(
    listing_id: str,
    session: Session = Depends(get_session)
):
    """Get listing details."""
    listing = get_listing_by_id(session, listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Get offers
    offers = session.exec(
        select(Offer).where(Offer.listing_id == listing_id)
    ).all()
    
    # Get owner info
    owner = session.get(User, listing.owner_id)
    
    return {
        "id": listing.id,
        "owner": {
            "id": listing.owner_id,
            "type": listing.owner_type,
            "name": owner.name if owner else None,
            "district": owner.district if owner else None
        },
        "crop": listing.crop,
        "qty_kg": listing.qty_kg,
        "min_price_per_qtl": listing.min_price_per_qtl,
        "status": listing.status,
        "description": listing.description,
        "district": listing.district,
        "quality_grade": listing.quality_grade,
        "harvest_date": listing.harvest_date,
        "images": json.loads(listing.photos) if listing.photos else [],
        "created_at": listing.created_at.isoformat() if listing.created_at else None,
        "offers": [
            {
                "id": o.id,
                "price_per_qtl": o.price_per_qtl,
                "qty_kg": o.qty_kg,
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None
            }
            for o in offers
        ],
        "offer_count": len(offers)
    }


@router.patch("/{listing_id}")
@router.put("/{listing_id}")
async def update_listing(
    listing_id: str,
    request: UpdateListingRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a listing."""
    listing = get_listing_by_id(session, listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Check ownership
    if listing.owner_id != current_user.id and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    # Update fields
    update_data = request.dict(exclude_none=True)
    
    if "status" in update_data:
        valid_statuses = ["active", "paused", "cancelled"]
        if update_data["status"] not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Valid: {valid_statuses}"
            )
    
    for key, value in update_data.items():
        setattr(listing, key, value)
    
    from app.core.utils import utc_now
    listing.updated_at = utc_now()
    
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    logger.info(f"Listing {listing_id} updated by {current_user.id}")
    
    return success_response(
        message="Listing updated",
        data={"listing_id": listing_id}
    )


@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Cancel/delete a listing."""
    listing = get_listing_by_id(session, listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Check ownership
    if listing.owner_id != current_user.id and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Soft delete - set status to cancelled
    update_listing_status(session, listing_id, "cancelled", current_user.id)
    
    logger.info(f"Listing {listing_id} cancelled by {current_user.id}")
    
    return success_response(message="Listing cancelled")


# =====================================================================
# OFFER ENDPOINTS
# =====================================================================

@router.post("/{listing_id}/offers", response_model=OfferResponse)
async def make_offer(
    listing_id: str,
    request: CreateOfferRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Make an offer on a listing."""
    listing = get_listing_by_id(session, listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Listing is not active"
        )
    
    # Can't offer on own listing
    if listing.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot make offer on your own listing"
        )
    
    offer = create_offer(
        session=session,
        listing_id=listing_id,
        buyer_id=current_user.id,
        price_per_qtl=request.price_per_qtl,
        qty_kg=request.qty_kg,
        message=request.message
    )
    
    # Notify listing owner
    owner = session.get(User, listing.owner_id)
    if owner:
        try:
            send_notification_sms(
                to=owner.phone,
                template_key="OFFER_RECEIVED",
                params={
                    "crop": listing.crop,
                    "price": request.price_per_qtl
                },
                language=owner.language
            )
        except Exception as e:
            logger.warning(f"Failed to send offer notification: {e}")
    
    logger.info(f"Offer {offer.id} created on listing {listing_id}")
    
    return OfferResponse(
        id=offer.id,
        listing_id=offer.listing_id,
        buyer_id=offer.buyer_id,
        price_per_qtl=offer.price_per_qtl,
        qty_kg=offer.qty_kg,
        status=offer.status,
        message=offer.message,
        created_at=offer.created_at.isoformat()
    )


@router.get("/{listing_id}/offers")
async def get_listing_offers(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all offers on a listing (owner only)."""
    listing = get_listing_by_id(session, listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Check ownership
    if listing.owner_id != current_user.id and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    offers = session.exec(
        select(Offer).where(Offer.listing_id == listing_id).order_by(Offer.created_at.desc())
    ).all()
    
    items = []
    for offer in offers:
        buyer = session.get(User, offer.buyer_id)
        items.append({
            "id": offer.id,
            "buyer": {
                "id": offer.buyer_id,
                "name": buyer.name if buyer else None,
                "phone": buyer.phone if buyer else None
            },
            "price_per_qtl": offer.price_per_qtl,
            "qty_kg": offer.qty_kg,
            "status": offer.status,
            "message": offer.message,
            "created_at": offer.created_at.isoformat() if offer.created_at else None
        })
    
    return {"offers": items, "count": len(items)}


@router.post("/{listing_id}/offers/{offer_id}/accept")
async def accept_listing_offer(
    listing_id: str,
    offer_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Accept an offer on a listing."""
    listing = get_listing_by_id(session, listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Check ownership
    if listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owner can accept offers"
        )
    
    offer = accept_offer(session, offer_id)
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offer not found or already processed"
        )
    
    # Notify buyer
    buyer = session.get(User, offer.buyer_id)
    if buyer:
        try:
            send_notification_sms(
                to=buyer.phone,
                template_key="OFFER_ACCEPTED",
                params={
                    "crop": listing.crop,
                    "price": offer.price_per_qtl
                },
                language=buyer.language
            )
        except Exception as e:
            logger.warning(f"Failed to send acceptance notification: {e}")
    
    logger.info(f"Offer {offer_id} accepted on listing {listing_id}")
    
    return success_response(
        message="Offer accepted",
        data={
            "offer_id": offer_id,
            "listing_id": listing_id,
            "status": "accepted"
        }
    )


@router.post("/{listing_id}/offers/{offer_id}/reject")
async def reject_offer(
    listing_id: str,
    offer_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Reject an offer on a listing."""
    listing = get_listing_by_id(session, listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owner can reject offers"
        )
    
    offer = session.get(Offer, offer_id)
    if not offer or offer.listing_id != listing_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    if offer.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offer already processed"
        )
    
    from app.core.utils import utc_now
    offer.status = "rejected"
    offer.rejected_at = utc_now()
    session.add(offer)
    session.commit()
    
    logger.info(f"Offer {offer_id} rejected on listing {listing_id}")
    
    return success_response(message="Offer rejected")


# =============================================================================
# PROCESSED PRODUCTS (PROCESSOR ROLE)
# =============================================================================

# Processed product types
PROCESSED_PRODUCT_TYPES = ["flour", "mixes", "snacks", "cookies", "ready_to_eat", "malt", "flakes", "puffs"]
PACKAGING_TYPES = ["packet", "box", "bulk", "pouch", "jar"]


class CreateProcessedProductRequest(BaseModel):
    """Create a processed product listing (Processor role)."""
    product_type: str = Field(..., description="Product type: flour, mixes, snacks, cookies, etc.")
    source_crop: str = Field(..., description="Source millet crop type")
    source_batch_id: Optional[str] = Field(None, description="Source batch ID for traceability")
    qty_kg: float = Field(..., gt=0, description="Total quantity in kg")
    min_price_per_qtl: float = Field(..., gt=0, description="Minimum price per quintal")
    description: Optional[str] = None
    processing_date: Optional[str] = None
    shelf_life_days: Optional[int] = Field(None, gt=0)
    packaging_type: Optional[str] = None
    packaging_size_grams: Optional[int] = Field(None, gt=0)
    nutritional_info: Optional[dict] = None
    is_organic: bool = Field(default=False)
    district: Optional[str] = None
    images: Optional[List[str]] = None


class ProcessedProductResponse(BaseModel):
    """Processed product response model."""
    id: str
    owner_type: str
    owner_id: str
    product_type: str
    crop: str
    qty_kg: float
    min_price_per_qtl: float
    description: Optional[str]
    source_batch_id: Optional[str]
    processing_date: Optional[str]
    shelf_life_days: Optional[int]
    packaging_type: Optional[str]
    packaging_size_grams: Optional[int]
    fssai_license: Optional[str]
    is_organic: bool
    status: str
    created_at: str


@router.post("/processed", response_model=ProcessedProductResponse)
async def create_processed_product(
    request: CreateProcessedProductRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a processed product listing.
    Requires processor role.
    """
    from app.db.models import Listing, Processor
    from app.core.utils import utc_now, generate_uuid
    from datetime import datetime
    
    # Check processor role
    if not current_user.has_role("processor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only processors can create processed product listings"
        )
    
    # Validate product type
    if request.product_type.lower() not in PROCESSED_PRODUCT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid product type. Supported: {', '.join(PROCESSED_PRODUCT_TYPES)}"
        )
    
    # Validate packaging type
    if request.packaging_type and request.packaging_type.lower() not in PACKAGING_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid packaging type. Supported: {', '.join(PACKAGING_TYPES)}"
        )
    
    # Validate source crop
    if request.source_crop.lower() not in MILLET_CROPS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid source crop. Supported: {', '.join(MILLET_CROPS)}"
        )
    
    # Get processor profile for FSSAI license
    processor = session.exec(
        select(Processor).where(Processor.user_id == current_user.id)
    ).first()
    
    fssai_license = processor.fssai_license if processor else None
    
    # Parse processing date
    processing_date = None
    if request.processing_date:
        try:
            processing_date = datetime.fromisoformat(request.processing_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid processing_date format. Use ISO format."
            )
    
    # Create listing
    listing = Listing(
        id=generate_uuid(),
        owner_type="processor",
        owner_id=current_user.id,
        crop=request.source_crop.lower(),
        qty_kg=request.qty_kg,
        min_price_per_qtl=request.min_price_per_qtl,
        description=request.description,
        is_organic=request.is_organic,
        district=request.district or current_user.district,
        photos=json.dumps(request.images) if request.images else "[]",
        status="active",
        
        # Processed product fields
        is_processed=True,
        product_type=request.product_type.lower(),
        source_batch_id=request.source_batch_id,
        processing_date=processing_date,
        shelf_life_days=request.shelf_life_days,
        packaging_type=request.packaging_type.lower() if request.packaging_type else None,
        packaging_size_grams=request.packaging_size_grams,
        fssai_license=fssai_license,
        nutritional_info=json.dumps(request.nutritional_info) if request.nutritional_info else None,
        
        created_at=utc_now(),
        updated_at=utc_now()
    )
    
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    logger.info(f"Processed product created: {listing.id} by processor {current_user.id}")
    
    return ProcessedProductResponse(
        id=listing.id,
        owner_type=listing.owner_type,
        owner_id=listing.owner_id,
        product_type=listing.product_type,
        crop=listing.crop,
        qty_kg=listing.qty_kg,
        min_price_per_qtl=listing.min_price_per_qtl,
        description=listing.description,
        source_batch_id=listing.source_batch_id,
        processing_date=listing.processing_date.isoformat() if listing.processing_date else None,
        shelf_life_days=listing.shelf_life_days,
        packaging_type=listing.packaging_type,
        packaging_size_grams=listing.packaging_size_grams,
        fssai_license=listing.fssai_license,
        is_organic=listing.is_organic,
        status=listing.status,
        created_at=listing.created_at.isoformat()
    )


@router.get("/processed")
async def get_processed_products(
    product_type: Optional[str] = Query(None, description="Filter by product type"),
    crop: Optional[str] = Query(None, description="Filter by source crop"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    """
    Get all processed product listings.
    Public endpoint.
    """
    from app.db.models import Listing
    
    offset = (page - 1) * limit
    
    # Build query
    query = select(Listing).where(
        Listing.is_processed == True,
        Listing.status == "active"
    )
    
    if product_type:
        query = query.where(Listing.product_type == product_type.lower())
    if crop:
        query = query.where(Listing.crop == crop.lower())
    
    query = query.offset(offset).limit(limit)
    
    listings = session.exec(query).all()
    
    return {
        "success": True,
        "products": [
            {
                "id": l.id,
                "owner_type": l.owner_type,
                "owner_id": l.owner_id,
                "product_type": l.product_type,
                "crop": l.crop,
                "qty_kg": l.qty_kg,
                "min_price_per_qtl": l.min_price_per_qtl,
                "description": l.description,
                "source_batch_id": l.source_batch_id,
                "processing_date": l.processing_date.isoformat() if l.processing_date else None,
                "shelf_life_days": l.shelf_life_days,
                "packaging_type": l.packaging_type,
                "packaging_size_grams": l.packaging_size_grams,
                "fssai_license": l.fssai_license,
                "is_organic": l.is_organic,
                "photos": json.loads(l.photos) if l.photos else [],
                "status": l.status,
                "created_at": l.created_at.isoformat()
            }
            for l in listings
        ],
        "page": page,
        "limit": limit,
        "total": len(listings)
    }


# =============================================================================
# QUALITY CERTIFICATES
# =============================================================================

# Certificate types
CERTIFICATE_TYPES = ["fssai", "organic", "lab_report", "quality_test", "pesticide_free", "gmo_free"]


class UploadCertificateRequest(BaseModel):
    """Request to upload a quality certificate."""
    cert_type: str = Field(..., description="Certificate type")
    cert_number: Optional[str] = Field(None, description="Certificate number from issuing authority")
    issuer: Optional[str] = Field(None, description="Issuing authority/lab name")
    issue_date: Optional[str] = Field(None, description="Issue date (ISO format)")
    expiry_date: Optional[str] = Field(None, description="Expiry date (ISO format)")
    file_url: str = Field(..., description="URL of the uploaded certificate file")
    file_type: str = Field(default="pdf", description="File type: pdf, jpg, png")
    notes: Optional[str] = Field(None, description="Additional notes")


class CertificateResponse(BaseModel):
    """Certificate response model."""
    id: str
    listing_id: str
    cert_type: str
    cert_number: Optional[str]
    issuer: Optional[str]
    issue_date: Optional[str]
    expiry_date: Optional[str]
    file_url: str
    file_type: str
    verification_status: str
    verified_at: Optional[str]
    notes: Optional[str]
    created_at: str


@router.post("/{listing_id}/certificates", response_model=CertificateResponse)
async def upload_certificate(
    listing_id: str,
    request: UploadCertificateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Upload a quality certificate for a listing.
    Only the listing owner can upload certificates.
    """
    from app.db.models import Certificate
    from datetime import datetime
    
    # Validate certificate type
    if request.cert_type.lower() not in CERTIFICATE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid certificate type. Supported: {', '.join(CERTIFICATE_TYPES)}"
        )
    
    # Verify listing exists and user owns it
    listing = get_listing_by_id(session, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owner can upload certificates"
        )
    
    # Parse dates
    issue_date = None
    expiry_date = None
    if request.issue_date:
        try:
            issue_date = datetime.fromisoformat(request.issue_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid issue_date format. Use ISO format."
            )
    if request.expiry_date:
        try:
            expiry_date = datetime.fromisoformat(request.expiry_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid expiry_date format. Use ISO format."
            )
    
    # Create certificate
    certificate = Certificate(
        listing_id=listing_id,
        cert_type=request.cert_type.lower(),
        cert_number=request.cert_number,
        issuer=request.issuer,
        issue_date=issue_date,
        expiry_date=expiry_date,
        file_url=request.file_url,
        file_type=request.file_type.lower(),
        notes=request.notes,
        verification_status="pending"
    )
    
    session.add(certificate)
    session.commit()
    session.refresh(certificate)
    
    logger.info(f"Certificate uploaded: {certificate.id} for listing {listing_id}")
    
    return CertificateResponse(
        id=certificate.id,
        listing_id=certificate.listing_id,
        cert_type=certificate.cert_type,
        cert_number=certificate.cert_number,
        issuer=certificate.issuer,
        issue_date=certificate.issue_date.isoformat() if certificate.issue_date else None,
        expiry_date=certificate.expiry_date.isoformat() if certificate.expiry_date else None,
        file_url=certificate.file_url,
        file_type=certificate.file_type,
        verification_status=certificate.verification_status,
        verified_at=certificate.verified_at.isoformat() if certificate.verified_at else None,
        notes=certificate.notes,
        created_at=certificate.created_at.isoformat()
    )


@router.get("/{listing_id}/certificates", response_model=List[CertificateResponse])
async def get_listing_certificates(
    listing_id: str,
    session: Session = Depends(get_session)
):
    """
    Get all certificates for a listing.
    Public endpoint - anyone can view certificates.
    """
    from app.db.models import Certificate
    
    # Verify listing exists
    listing = get_listing_by_id(session, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Get certificates
    certificates = session.exec(
        select(Certificate).where(Certificate.listing_id == listing_id)
    ).all()
    
    return [
        CertificateResponse(
            id=cert.id,
            listing_id=cert.listing_id,
            cert_type=cert.cert_type,
            cert_number=cert.cert_number,
            issuer=cert.issuer,
            issue_date=cert.issue_date.isoformat() if cert.issue_date else None,
            expiry_date=cert.expiry_date.isoformat() if cert.expiry_date else None,
            file_url=cert.file_url,
            file_type=cert.file_type,
            verification_status=cert.verification_status,
            verified_at=cert.verified_at.isoformat() if cert.verified_at else None,
            notes=cert.notes,
            created_at=cert.created_at.isoformat()
        )
        for cert in certificates
    ]


@router.delete("/{listing_id}/certificates/{certificate_id}")
async def delete_certificate(
    listing_id: str,
    certificate_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a certificate from a listing.
    Only the listing owner can delete certificates.
    """
    from app.db.models import Certificate
    
    # Verify listing exists and user owns it
    listing = get_listing_by_id(session, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owner can delete certificates"
        )
    
    # Get certificate
    certificate = session.get(Certificate, certificate_id)
    if not certificate or certificate.listing_id != listing_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Cannot delete verified certificates
    if certificate.verification_status == "verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete verified certificates"
        )
    
    session.delete(certificate)
    session.commit()
    
    logger.info(f"Certificate deleted: {certificate_id} from listing {listing_id}")
    
    return success_response(message="Certificate deleted")


@router.post("/{listing_id}/certificates/{certificate_id}/verify")
async def verify_certificate(
    listing_id: str,
    certificate_id: str,
    approved: bool = True,
    rejection_reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Verify or reject a certificate (Admin only).
    """
    from app.db.models import Certificate
    from app.core.utils import utc_now
    
    # Check admin role
    if not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can verify certificates"
        )
    
    # Get certificate
    certificate = session.get(Certificate, certificate_id)
    if not certificate or certificate.listing_id != listing_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    if certificate.verification_status not in ["pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certificate already processed"
        )
    
    if approved:
        certificate.verification_status = "verified"
        certificate.verified_at = utc_now()
        certificate.verified_by = current_user.id
        message = "Certificate verified"
    else:
        certificate.verification_status = "rejected"
        certificate.rejection_reason = rejection_reason
        message = "Certificate rejected"
    
    certificate.updated_at = utc_now()
    session.add(certificate)
    session.commit()
    
    logger.info(f"Certificate {certificate_id} {'verified' if approved else 'rejected'} by admin {current_user.id}")
    
    return success_response(
        message=message,
        data={
            "certificate_id": certificate_id,
            "status": certificate.verification_status
        }
    )

