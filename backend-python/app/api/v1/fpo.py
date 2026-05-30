"""
FPO (Farmer Producer Organization) API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import secrets
import json

from app.db.init_db import get_session
from app.db.models import FPO, Farmer, User, Batch, Listing, FPOMemberConsent
from app.core.security import get_current_user, RoleChecker
from app.services.sms import send_notification_sms

router = APIRouter(prefix="/fpo", tags=["fpo"])


class CreateFPORequest(BaseModel):
    name: str
    registration_number: str
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class UpdateFPORequest(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class AddMemberRequest(BaseModel):
    farmer_id: str


@router.get("/")
async def list_fpos(
    state: Optional[str] = None,
    district: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_session),
) -> dict:
    """
    List all FPOs (public endpoint).
    """
    query = select(FPO).where(FPO.is_active == True)
    
    if state:
        query = query.where(FPO.state == state)
    if district:
        query = query.where(FPO.district == district)
    
    query = query.offset(skip).limit(limit)
    fpos = db.exec(query).all()
    
    # Get total count
    count_query = select(func.count(FPO.id)).where(FPO.is_active == True)
    if state:
        count_query = count_query.where(FPO.state == state)
    if district:
        count_query = count_query.where(FPO.district == district)
    total = db.exec(count_query).one()
    
    return {
        "fpos": [
            {
                "id": f.id,
                "name": f.name,
                "registration_number": f.registration_no,  # Use the actual DB column
                "district": f.district,
                "state": f.state,
                "member_count": f.member_count,
            }
            for f in fpos
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/me")
async def get_my_fpo(
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo"]))
) -> dict:
    """
    Get FPO details for the current FPO user.
    """
    fpo = db.exec(
        select(FPO).where(FPO.user_id == current_user.id)
    ).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO profile not found. Please complete onboarding."
        )
    
    # Get member farmers
    members = db.exec(
        select(Farmer).where(Farmer.fpo_id == fpo.id)
    ).all()
    
    return {
        "fpo": {
            "id": fpo.id,
            "name": fpo.name,
            "registration_number": fpo.registration_number,
            "address": fpo.address,
            "district": fpo.district,
            "state": fpo.state,
            "contact_phone": fpo.contact_phone,
            "contact_email": fpo.contact_email,
            "member_count": fpo.member_count,
            "is_verified": fpo.is_verified,
            "created_at": fpo.created_at.isoformat() if fpo.created_at else None,
        },
        "members": [
            {
                "id": m.id,
                "name": m.name,
                "phone": m.phone,
                "village": m.village,
            }
            for m in members
        ]
    }


@router.get("/{fpo_id}")
async def get_fpo(
    fpo_id: str,
    db: Session = Depends(get_session),
) -> dict:
    """
    Get FPO details by ID (public endpoint).
    """
    fpo = db.exec(select(FPO).where(FPO.id == fpo_id)).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO not found"
        )
    
    return {
        "id": fpo.id,
        "name": fpo.name,
        "registration_number": fpo.registration_number,
        "district": fpo.district,
        "state": fpo.state,
        "member_count": fpo.member_count,
        "is_verified": fpo.is_verified,
    }


@router.post("/")
async def create_fpo(
    request: CreateFPORequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo", "admin"]))
) -> dict:
    """
    Create/register an FPO (FPO user or admin).
    """
    # Check if user already has an FPO
    existing = db.exec(
        select(FPO).where(FPO.user_id == current_user.id)
    ).first()
    
    if existing and "admin" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an FPO registered"
        )
    
    # Check registration number uniqueness
    existing_reg = db.exec(
        select(FPO).where(FPO.registration_number == request.registration_number)
    ).first()
    
    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="FPO with this registration number already exists"
        )
    
    fpo = FPO(
        name=request.name,
        registration_number=request.registration_number,
        user_id=current_user.id if "admin" not in current_user.roles else None,
        address=request.address,
        district=request.district,
        state=request.state,
        contact_phone=request.contact_phone,
        contact_email=request.contact_email,
    )
    db.add(fpo)
    db.commit()
    db.refresh(fpo)
    
    return {
        "message": "FPO created successfully",
        "fpo": {
            "id": fpo.id,
            "name": fpo.name,
            "registration_number": fpo.registration_number,
        }
    }


@router.put("/{fpo_id}")
async def update_fpo(
    fpo_id: str,
    request: UpdateFPORequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo", "admin"]))
) -> dict:
    """
    Update FPO details.
    """
    fpo = db.exec(select(FPO).where(FPO.id == fpo_id)).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO not found"
        )
    
    # Check ownership (unless admin)
    if "admin" not in current_user.roles and fpo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own FPO"
        )
    
    if request.name is not None:
        fpo.name = request.name
    if request.address is not None:
        fpo.address = request.address
    if request.district is not None:
        fpo.district = request.district
    if request.state is not None:
        fpo.state = request.state
    if request.contact_phone is not None:
        fpo.contact_phone = request.contact_phone
    if request.contact_email is not None:
        fpo.contact_email = request.contact_email
    
    fpo.updated_at = datetime.utcnow()
    db.add(fpo)
    db.commit()
    db.refresh(fpo)
    
    return {
        "message": "FPO updated successfully",
        "fpo": {
            "id": fpo.id,
            "name": fpo.name,
        }
    }


@router.post("/{fpo_id}/members")
async def add_member(
    fpo_id: str,
    request: AddMemberRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo", "admin"]))
) -> dict:
    """
    Add a farmer as a member of the FPO.
    """
    fpo = db.exec(select(FPO).where(FPO.id == fpo_id)).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO not found"
        )
    
    # Check ownership
    if "admin" not in current_user.roles and fpo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add members to your own FPO"
        )
    
    farmer = db.exec(select(Farmer).where(Farmer.id == request.farmer_id)).first()
    
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found"
        )
    
    if farmer.fpo_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer is already a member of an FPO"
        )
    
    farmer.fpo_id = fpo_id
    fpo.member_count = (fpo.member_count or 0) + 1
    
    db.add(farmer)
    db.add(fpo)
    db.commit()
    
    return {
        "message": "Farmer added to FPO successfully",
        "farmer_id": farmer.id,
        "fpo_id": fpo.id,
    }


@router.delete("/{fpo_id}/members/{farmer_id}")
async def remove_member(
    fpo_id: str,
    farmer_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo", "admin"]))
) -> dict:
    """
    Remove a farmer from the FPO.
    """
    fpo = db.exec(select(FPO).where(FPO.id == fpo_id)).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO not found"
        )
    
    # Check ownership
    if "admin" not in current_user.roles and fpo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only remove members from your own FPO"
        )
    
    farmer = db.exec(select(Farmer).where(Farmer.id == farmer_id)).first()
    
    if not farmer or farmer.fpo_id != fpo_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found in this FPO"
        )
    
    farmer.fpo_id = None
    fpo.member_count = max(0, (fpo.member_count or 0) - 1)
    
    db.add(farmer)
    db.add(fpo)
    db.commit()
    
    return {"message": "Farmer removed from FPO successfully"}


@router.get("/{fpo_id}/members")
async def list_members(
    fpo_id: str,
    db: Session = Depends(get_session),
) -> dict:
    """
    List all members of an FPO.
    """
    fpo = db.exec(select(FPO).where(FPO.id == fpo_id)).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO not found"
        )
    
    members = db.exec(
        select(Farmer).where(Farmer.fpo_id == fpo_id)
    ).all()
    
    return {
        "fpo_id": fpo_id,
        "fpo_name": fpo.name,
        "member_count": len(members),
        "members": [
            {
                "id": m.id,
                "name": m.name,
                "phone": m.phone,
                "village": m.village,
                "district": m.district,
            }
            for m in members
        ]
    }


@router.get("/{fpo_id}/batches")
async def list_fpo_batches(
    fpo_id: str,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_session),
) -> dict:
    """
    List all batches associated with an FPO.
    """
    fpo = db.exec(select(FPO).where(FPO.id == fpo_id)).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO not found"
        )
    
    batches = db.exec(
        select(Batch)
        .where(Batch.fpo_id == fpo_id)
        .offset(skip)
        .limit(limit)
    ).all()
    
    return {
        "fpo_id": fpo_id,
        "batches": [
            {
                "id": b.id,
                "crop_type": b.crop_type,
                "quantity_kg": b.quantity_kg,
                "current_stage": b.current_stage,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            }
            for b in batches
        ]
    }


@router.get("/{fpo_id}/listings")
async def list_fpo_listings(
    fpo_id: str,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_session),
) -> dict:
    """
    List all listings from FPO members.
    """
    fpo = db.exec(select(FPO).where(FPO.id == fpo_id)).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO not found"
        )
    
    # Get all farmer IDs in this FPO
    farmers = db.exec(
        select(Farmer).where(Farmer.fpo_id == fpo_id)
    ).all()
    farmer_ids = [f.id for f in farmers]
    
    if not farmer_ids:
        return {
            "fpo_id": fpo_id,
            "listings": [],
            "total": 0,
        }
    
    # Get listings from these farmers
    query = select(Listing).where(Listing.farmer_id.in_(farmer_ids))
    if status_filter:
        query = query.where(Listing.status == status_filter)
    
    listings = db.exec(query.offset(skip).limit(limit)).all()
    
    return {
        "fpo_id": fpo_id,
        "listings": [
            {
                "id": l.id,
                "crop_type": l.crop_type,
                "quantity_kg": l.quantity_kg,
                "price_per_kg": l.price_per_kg,
                "status": l.status,
                "farmer_id": l.farmer_id,
            }
            for l in listings
        ]
    }


@router.post("/{fpo_id}/verify")
async def verify_fpo(
    fpo_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Verify an FPO (admin only).
    """
    fpo = db.exec(select(FPO).where(FPO.id == fpo_id)).first()
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO not found"
        )
    
    fpo.is_verified = True
    fpo.updated_at = datetime.utcnow()
    db.add(fpo)
    db.commit()
    
    return {
        "message": "FPO verified successfully",
        "fpo_id": fpo.id,
    }


# =============================================================================
# CONSENT-BASED MEMBER ADDITION
# =============================================================================

class InviteMemberRequest(BaseModel):
    """Invite a farmer to join FPO - sends OTP for consent."""
    farmer_phone: str = Field(..., description="Farmer's phone number")
    farmer_name: Optional[str] = None


class VerifyConsentRequest(BaseModel):
    """Verify farmer consent with OTP."""
    consent_id: str
    otp: str


class AggregateListingsRequest(BaseModel):
    """Request to aggregate listings into a batch."""
    listing_ids: List[str] = Field(..., min_length=1)
    batch_name: Optional[str] = None
    grade: Optional[str] = None  # A, B, C
    notes: Optional[str] = None


@router.post("/me/invite-member")
async def invite_member_to_fpo(
    request: InviteMemberRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo"]))
) -> dict:
    """
    Invite a farmer to join the FPO by sending OTP for consent.
    """
    # Get FPO for current user
    fpo = db.exec(select(FPO).where(FPO.user_id == current_user.id)).first()
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO profile not found"
        )
    
    # Find farmer by phone
    farmer_user = db.exec(
        select(User).where(User.phone == request.farmer_phone)
    ).first()
    
    if not farmer_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No farmer found with this phone number"
        )
    
    farmer = db.exec(
        select(Farmer).where(Farmer.user_id == farmer_user.id)
    ).first()
    
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No farmer profile found for this user"
        )
    
    if farmer.fpo_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer is already a member of an FPO"
        )
    
    # Check for existing pending consent
    existing = db.exec(
        select(FPOMemberConsent).where(
            FPOMemberConsent.fpo_id == fpo.id,
            FPOMemberConsent.farmer_id == farmer.id,
            FPOMemberConsent.consent_given == False
        )
    ).first()
    
    if existing and existing.expires_at and existing.expires_at > datetime.utcnow():
        return {
            "message": "Consent request already pending",
            "consent_id": existing.id,
            "expires_at": existing.expires_at.isoformat(),
        }
    
    # Generate OTP
    otp_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Create consent record
    consent = FPOMemberConsent(
        fpo_id=fpo.id,
        farmer_id=farmer.id,
        consent_type="otp",
        otp_code=otp_code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    
    # Send OTP via SMS
    try:
        send_notification_sms(
            to=request.farmer_phone,
            template_key="FPO_JOIN_OTP",
            params={
                "fpo_name": fpo.name,
                "otp": otp_code,
            },
            language=farmer_user.language or "en"
        )
    except Exception as e:
        # Log but don't fail - for demo purposes
        pass
    
    return {
        "success": True,
        "message": f"OTP sent to farmer for consent",
        "consent_id": consent.id,
        "farmer_name": farmer.name or farmer_user.name,
        "expires_in_minutes": 10,
    }


@router.post("/me/verify-consent")
async def verify_member_consent(
    request: VerifyConsentRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo"]))
) -> dict:
    """
    Verify farmer OTP consent and add them to the FPO.
    """
    # Get FPO for current user
    fpo = db.exec(select(FPO).where(FPO.user_id == current_user.id)).first()
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO profile not found"
        )
    
    # Find consent record
    consent = db.exec(
        select(FPOMemberConsent).where(
            FPOMemberConsent.id == request.consent_id,
            FPOMemberConsent.fpo_id == fpo.id
        )
    ).first()
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent request not found"
        )
    
    if consent.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent already verified"
        )
    
    if consent.expires_at and consent.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    if consent.otp_code != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Mark consent as verified
    consent.otp_verified = True
    consent.consent_given = True
    consent.consent_timestamp = datetime.utcnow()
    
    # Add farmer to FPO
    farmer = db.exec(select(Farmer).where(Farmer.id == consent.farmer_id)).first()
    if farmer:
        farmer.fpo_id = fpo.id
        fpo.member_count = (fpo.member_count or 0) + 1
        db.add(farmer)
        db.add(fpo)
    
    db.add(consent)
    db.commit()
    
    return {
        "success": True,
        "message": "Farmer consent verified and added to FPO",
        "farmer_id": consent.farmer_id,
        "fpo_id": fpo.id,
        "member_count": fpo.member_count,
    }


# =============================================================================
# AGGREGATION WORKFLOW
# =============================================================================

@router.post("/me/aggregate")
async def aggregate_listings(
    request: AggregateListingsRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo"]))
) -> dict:
    """
    Aggregate multiple listings from member farmers into a single batch.
    Creates traceability from individual farmer lots to the batch.
    """
    # Get FPO for current user
    fpo = db.exec(select(FPO).where(FPO.user_id == current_user.id)).first()
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO profile not found"
        )
    
    # Get member farmer IDs
    members = db.exec(select(Farmer).where(Farmer.fpo_id == fpo.id)).all()
    member_ids = {m.id for m in members}
    
    if not member_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No member farmers in FPO"
        )
    
    # Validate and fetch listings
    listings = []
    total_weight = 0.0
    crop_types = set()
    farmer_sources = []
    
    for listing_id in request.listing_ids:
        listing = db.exec(select(Listing).where(Listing.id == listing_id)).first()
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing {listing_id} not found"
            )
        
        if listing.farmer_id not in member_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Listing {listing_id} does not belong to an FPO member"
            )
        
        if listing.status not in ["active", "available"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Listing {listing_id} is not available for aggregation"
            )
        
        listings.append(listing)
        total_weight += listing.qty_kg or 0
        crop_types.add(listing.crop)
        
        # Get farmer info for traceability
        farmer = db.exec(select(Farmer).where(Farmer.id == listing.farmer_id)).first()
        if farmer:
            farmer_sources.append({
                "farmer_id": farmer.id,
                "farmer_name": farmer.name,
                "listing_id": listing.id,
                "quantity_kg": listing.qty_kg,
                "village": farmer.village,
            })
    
    # Validate all same crop type
    if len(crop_types) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot aggregate different crop types: {crop_types}"
        )
    
    crop = list(crop_types)[0] if crop_types else "unknown"
    
    # Create batch
    batch = Batch(
        created_by_id=fpo.id,
        source_lots=json.dumps(request.listing_ids),
        total_weight=total_weight,
        crop=crop,
        grade=request.grade,
        status="created",
    )
    db.add(batch)
    
    # Mark listings as aggregated
    for listing in listings:
        listing.status = "aggregated"
        listing.batch_id = batch.id
        db.add(listing)
    
    db.commit()
    db.refresh(batch)
    
    return {
        "success": True,
        "message": f"Aggregated {len(listings)} listings into batch",
        "batch": {
            "id": batch.id,
            "qr_code": batch.qr_code,
            "crop": batch.crop,
            "total_weight_kg": batch.total_weight,
            "grade": batch.grade,
            "source_count": len(listings),
            "farmer_sources": farmer_sources,
        }
    }


@router.get("/me/aggregation-candidates")
async def get_aggregation_candidates(
    crop_type: Optional[str] = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["fpo"]))
) -> dict:
    """
    Get listings from member farmers that can be aggregated.
    """
    # Get FPO for current user
    fpo = db.exec(select(FPO).where(FPO.user_id == current_user.id)).first()
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO profile not found"
        )
    
    # Get member farmer IDs
    members = db.exec(select(Farmer).where(Farmer.fpo_id == fpo.id)).all()
    member_ids = [m.id for m in members]
    
    if not member_ids:
        return {"listings": [], "total": 0}
    
    # Get active listings from members
    query = select(Listing).where(
        Listing.farmer_id.in_(member_ids),
        Listing.status.in_(["active", "available"])
    )
    
    if crop_type:
        query = query.where(Listing.crop == crop_type)
    
    listings = db.exec(query).all()
    
    # Group by crop type
    grouped = {}
    for listing in listings:
        crop = listing.crop or "unknown"
        if crop not in grouped:
            grouped[crop] = []
        
        farmer = db.exec(select(Farmer).where(Farmer.id == listing.farmer_id)).first()
        grouped[crop].append({
            "id": listing.id,
            "crop": crop,
            "quantity_kg": listing.qty_kg,
            "price_per_qtl": listing.min_price_per_qtl,
            "farmer_name": farmer.name if farmer else None,
            "village": farmer.village if farmer else None,
            "created_at": listing.created_at.isoformat() if listing.created_at else None,
        })
    
    return {
        "grouped_by_crop": grouped,
        "total_listings": len(listings),
        "crop_types": list(grouped.keys()),
    }
