"""
Shree Anna Backend - Offers API Routes
Marketplace offers management for buyers and farmers.
"""

from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from loguru import logger

from app.core.security import get_current_user, require_buyer
from app.core.utils import success_response, utc_now
from app.db import get_session, User, Listing, Offer, Order
from app.services.sms import send_notification_sms


router = APIRouter(prefix="/offers", tags=["Offers"])


class CreateOfferRequest(BaseModel):
    """Create offer request."""
    listing_id: str = Field(..., description="Listing to make offer on")
    price_per_qtl: float = Field(..., gt=0, description="Offered price per quintal")
    qty_kg: Optional[float] = Field(None, gt=0, description="Quantity to buy (optional)")
    message: Optional[str] = Field(None, max_length=500, description="Message to seller")


class AcceptOfferRequest(BaseModel):
    """Accept offer request."""
    voice_consent_url: Optional[str] = None


class RejectOfferRequest(BaseModel):
    """Reject offer request."""
    reason: Optional[str] = None


class CounterOfferRequest(BaseModel):
    """Counter offer request."""
    price_per_qtl: float = Field(..., gt=0)
    message: Optional[str] = None


class OfferResponse(BaseModel):
    """Offer response model."""
    id: str
    listing_id: str
    buyer_id: str
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    price_per_qtl: float
    qty_kg: Optional[float]
    status: str
    message: Optional[str]
    created_at: str
    updated_at: Optional[str] = None


@router.post("/", response_model=OfferResponse)
async def create_offer(
    request: CreateOfferRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new offer on a listing.
    Any authenticated user can make offers (buyer role).
    """
    # Check listing exists and is active
    listing = session.get(Listing, request.listing_id)
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
    
    # Can't make offer on own listing
    if listing.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot make offer on your own listing"
        )
    
    # Check for existing pending offer
    existing = session.exec(
        select(Offer).where(
            Offer.listing_id == request.listing_id,
            Offer.buyer_id == current_user.id,
            Offer.status == "pending"
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending offer on this listing"
        )
    
    import uuid
    offer = Offer(
        id=str(uuid.uuid4()),
        listing_id=request.listing_id,
        buyer_id=current_user.id,
        price_per_qtl=request.price_per_qtl,
        qty_kg=request.qty_kg or listing.qty_kg,
        message=request.message,
        status="pending",
        created_at=utc_now(),
        updated_at=utc_now()
    )
    
    session.add(offer)
    session.commit()
    session.refresh(offer)
    
    # Notify seller
    seller = session.get(User, listing.owner_id)
    if seller:
        try:
            send_notification_sms(
                to=seller.phone,
                template_key="NEW_OFFER",
                params={
                    "crop": listing.crop,
                    "price": request.price_per_qtl
                },
                language=seller.language
            )
        except Exception as e:
            logger.warning(f"Failed to send offer notification: {e}")
    
    logger.info(f"Offer created: {offer.id} by {current_user.id}")
    
    return OfferResponse(
        id=offer.id,
        listing_id=offer.listing_id,
        buyer_id=offer.buyer_id,
        buyer_name=current_user.name,
        buyer_phone=current_user.phone,
        price_per_qtl=offer.price_per_qtl,
        qty_kg=offer.qty_kg,
        status=offer.status,
        message=offer.message,
        created_at=offer.created_at.isoformat() if offer.created_at else None,
        updated_at=offer.updated_at.isoformat() if offer.updated_at else None
    )


@router.get("/received")
async def get_received_offers(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get offers received on user's listings (for farmers/sellers).
    """
    offset = (page - 1) * limit
    
    # Get user's listings
    user_listings = session.exec(
        select(Listing.id).where(Listing.owner_id == current_user.id)
    ).all()
    
    if not user_listings:
        return {"offers": [], "total": 0, "page": page, "limit": limit}
    
    # Get offers on those listings
    statement = select(Offer).where(Offer.listing_id.in_(user_listings))
    
    if status_filter:
        statement = statement.where(Offer.status == status_filter)
    
    statement = statement.offset(offset).limit(limit).order_by(Offer.created_at.desc())
    offers = session.exec(statement).all()
    
    items = []
    for offer in offers:
        buyer = session.get(User, offer.buyer_id)
        listing = session.get(Listing, offer.listing_id)
        
        items.append({
            "id": offer.id,
            "listing_id": offer.listing_id,
            "listing_crop": listing.crop if listing else None,
            "listing_qty": listing.qty_kg if listing else None,
            "buyer_id": offer.buyer_id,
            "buyer_name": buyer.name if buyer else None,
            "buyer_phone": buyer.phone if buyer else None,
            "price_per_qtl": offer.price_per_qtl,
            "qty_kg": offer.qty_kg,
            "status": offer.status,
            "message": offer.message,
            "created_at": offer.created_at.isoformat() if offer.created_at else None
        })
    
    return {"offers": items, "total": len(items), "page": page, "limit": limit}


@router.get("/my")
async def get_my_offers(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get offers made by current user (as buyer).
    """
    offset = (page - 1) * limit
    
    statement = select(Offer).where(Offer.buyer_id == current_user.id)
    
    if status_filter:
        statement = statement.where(Offer.status == status_filter)
    
    statement = statement.offset(offset).limit(limit).order_by(Offer.created_at.desc())
    offers = session.exec(statement).all()
    
    items = []
    for offer in offers:
        listing = session.get(Listing, offer.listing_id)
        seller = session.get(User, listing.owner_id) if listing else None
        
        items.append({
            "id": offer.id,
            "listing_id": offer.listing_id,
            "listing_crop": listing.crop if listing else None,
            "seller_name": seller.name if seller else None,
            "price_per_qtl": offer.price_per_qtl,
            "qty_kg": offer.qty_kg,
            "status": offer.status,
            "message": offer.message,
            "created_at": offer.created_at.isoformat() if offer.created_at else None
        })
    
    return {"offers": items, "total": len(items), "page": page, "limit": limit}


@router.get("/{offer_id}")
async def get_offer(
    offer_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get offer details."""
    offer = session.get(Offer, offer_id)
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    listing = session.get(Listing, offer.listing_id)
    
    # Check authorization (buyer or seller)
    if offer.buyer_id != current_user.id and (not listing or listing.owner_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this offer"
        )
    
    buyer = session.get(User, offer.buyer_id)
    seller = session.get(User, listing.owner_id) if listing else None
    
    return {
        "id": offer.id,
        "listing_id": offer.listing_id,
        "listing": {
            "crop": listing.crop if listing else None,
            "qty_kg": listing.qty_kg if listing else None,
            "min_price_per_qtl": listing.min_price_per_qtl if listing else None,
            "district": listing.district if listing else None
        },
        "buyer_id": offer.buyer_id,
        "buyer_name": buyer.name if buyer else None,
        "buyer_phone": buyer.phone if buyer else None,
        "seller_id": listing.owner_id if listing else None,
        "seller_name": seller.name if seller else None,
        "price_per_qtl": offer.price_per_qtl,
        "qty_kg": offer.qty_kg,
        "status": offer.status,
        "message": offer.message,
        "created_at": offer.created_at.isoformat() if offer.created_at else None,
        "updated_at": offer.updated_at.isoformat() if offer.updated_at else None
    }


@router.post("/{offer_id}/accept")
async def accept_offer(
    offer_id: str,
    request: AcceptOfferRequest = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Accept an offer (creates an order).
    Only the listing owner can accept.
    """
    offer = session.get(Offer, offer_id)
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    if offer.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Offer is already {offer.status}"
        )
    
    listing = session.get(Listing, offer.listing_id)
    if not listing or listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owner can accept offers"
        )
    
    # Create order
    import uuid
    order = Order(
        id=str(uuid.uuid4()),
        offer_id=offer.id,
        listing_id=offer.listing_id,
        seller_id=listing.owner_id,
        buyer_id=offer.buyer_id,
        qty_kg=offer.qty_kg or listing.qty_kg,
        price_per_qtl=offer.price_per_qtl,
        total_amount=(offer.qty_kg or listing.qty_kg) * offer.price_per_qtl / 100,
        status="created",
        created_at=utc_now(),
        updated_at=utc_now()
    )
    
    session.add(order)
    
    # Update offer status
    offer.status = "accepted"
    offer.updated_at = utc_now()
    session.add(offer)
    
    # Update listing status
    listing.status = "sold"
    listing.updated_at = utc_now()
    session.add(listing)
    
    # Reject other pending offers
    other_offers = session.exec(
        select(Offer).where(
            Offer.listing_id == offer.listing_id,
            Offer.id != offer.id,
            Offer.status == "pending"
        )
    ).all()
    
    for other in other_offers:
        other.status = "rejected"
        other.updated_at = utc_now()
        session.add(other)
    
    session.commit()
    session.refresh(order)
    
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
    
    logger.info(f"Offer {offer_id} accepted, order {order.id} created")
    
    return {
        "success": True,
        "message": "Offer accepted",
        "order": {
            "id": order.id,
            "status": order.status,
            "qty_kg": order.qty_kg,
            "price_per_qtl": order.price_per_qtl,
            "total_amount": order.total_amount
        }
    }


@router.post("/{offer_id}/reject")
async def reject_offer(
    offer_id: str,
    request: RejectOfferRequest = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Reject an offer.
    Only the listing owner can reject.
    """
    offer = session.get(Offer, offer_id)
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    if offer.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Offer is already {offer.status}"
        )
    
    listing = session.get(Listing, offer.listing_id)
    if not listing or listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owner can reject offers"
        )
    
    offer.status = "rejected"
    offer.updated_at = utc_now()
    if request and request.reason:
        offer.message = f"Rejected: {request.reason}"
    
    session.add(offer)
    session.commit()
    
    # Notify buyer
    buyer = session.get(User, offer.buyer_id)
    if buyer:
        try:
            send_notification_sms(
                to=buyer.phone,
                template_key="OFFER_REJECTED",
                params={"crop": listing.crop},
                language=buyer.language
            )
        except Exception as e:
            logger.warning(f"Failed to send rejection notification: {e}")
    
    logger.info(f"Offer {offer_id} rejected")
    
    return {"success": True, "message": "Offer rejected"}


@router.post("/{offer_id}/counter")
async def counter_offer(
    offer_id: str,
    request: CounterOfferRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Make a counter offer.
    Only the listing owner can counter.
    """
    offer = session.get(Offer, offer_id)
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    if offer.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Offer is already {offer.status}"
        )
    
    listing = session.get(Listing, offer.listing_id)
    if not listing or listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only listing owner can counter offers"
        )
    
    offer.status = "countered"
    offer.price_per_qtl = request.price_per_qtl
    if request.message:
        offer.message = request.message
    offer.updated_at = utc_now()
    
    session.add(offer)
    session.commit()
    session.refresh(offer)
    
    # Notify buyer
    buyer = session.get(User, offer.buyer_id)
    if buyer:
        try:
            send_notification_sms(
                to=buyer.phone,
                template_key="COUNTER_OFFER",
                params={
                    "crop": listing.crop,
                    "price": request.price_per_qtl
                },
                language=buyer.language
            )
        except Exception as e:
            logger.warning(f"Failed to send counter notification: {e}")
    
    logger.info(f"Counter offer made on {offer_id}")
    
    return {
        "id": offer.id,
        "listing_id": offer.listing_id,
        "buyer_id": offer.buyer_id,
        "price_per_qtl": offer.price_per_qtl,
        "qty_kg": offer.qty_kg,
        "status": offer.status,
        "message": offer.message,
        "created_at": offer.created_at.isoformat() if offer.created_at else None,
        "updated_at": offer.updated_at.isoformat() if offer.updated_at else None
    }
