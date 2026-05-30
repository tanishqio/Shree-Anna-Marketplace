"""
Shree Anna Backend - User Management API Routes
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field
from sqlmodel import Session
from loguru import logger

from app.core.security import get_current_user, require_admin
from app.core.utils import success_response, error_response
from app.db import (
    get_session, get_user_by_id, update_user, User,
    create_farmer_profile, get_farmer_by_user_id,
    create_fpo_profile, get_fpo_by_user_id,
    create_buyer_profile, get_buyer_by_user_id,
    create_processor_profile, get_processor_by_user_id,
    Farmer, FPO
)
from app.services import save_file, send_notification_sms

router = APIRouter(prefix="/users", tags=["Users"])


# =============================================================================
# Pydantic Models for Onboarding
# =============================================================================

class FarmerOnboardingRequest(BaseModel):
    """Farmer onboarding request."""
    name: str = Field(..., min_length=2, max_length=100)
    language: str = Field(default="hi")
    district: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    village: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc: Optional[str] = None
    # Optional fields not currently sent by frontend but good to keep optional
    land_size: Optional[float] = None
    geo: Optional[str] = None
    crops: Optional[List[str]] = None


class FPOOnboardingRequest(BaseModel):
    """FPO onboarding request."""
    name: str = Field(..., min_length=2, max_length=100)
    organization_name: str = Field(..., min_length=2)
    registration_no: Optional[str] = None
    address: Optional[str] = None
    district: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    member_count: Optional[int] = None
    crops: Optional[List[str]] = None
    language: str = Field(default="hi")


class BuyerOnboardingRequest(BaseModel):
    """Buyer onboarding request."""
    name: str = Field(..., min_length=2, max_length=100)
    company_name: Optional[str] = None
    buyer_type: str = Field(default="retail")  # retail, bulk, distributor, exporter
    district: str = Field(..., min_length=2)
    state: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    language: str = Field(default="hi")


class ProcessorOnboardingRequest(BaseModel):
    """Processor onboarding request."""
    name: str = Field(..., min_length=2, max_length=100)
    unit_name: Optional[str] = None
    unit_type: str = Field(default="small")  # micro, small, medium, large
    fssai_license: Optional[str] = None
    district: str = Field(..., min_length=2)
    state: Optional[str] = None
    city: Optional[str] = None
    products: Optional[List[str]] = None
    language: str = Field(default="hi")


class AdminOnboardingRequest(BaseModel):
    """Admin onboarding request."""
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(...)
    designation: str = Field(default="state")  # state, district, logistics, quality
    access_level: str = Field(default="l1")  # l1, l2, l3
    language: str = Field(default="hi")


class FarmerProfileRequest(BaseModel):
    """Farmer profile creation/update request."""
    name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    land_holding_acres: Optional[float] = None
    geo_coordinates: Optional[str] = None
    crops: Optional[List[str]] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    organic_certified: Optional[bool] = None
    certification_id: Optional[str] = None
    language: str = Field(default="hi")


class UserUpdateRequest(BaseModel):
    """User update request."""
    name: Optional[str] = None
    language: Optional[str] = None
    district: Optional[str] = None


@router.patch("/me")
async def update_me(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user."""
    update_data = request.dict(exclude_unset=True)
    if update_data:
        update_user(session, current_user.id, **update_data)
    return current_user


# =============================================================================
# ONBOARDING ENDPOINTS
# =============================================================================

@router.post("/onboard/farmer")
async def onboard_farmer(
    request: FarmerOnboardingRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Onboard user as a farmer."""
    # Check if already onboarded as farmer
    existing = get_farmer_by_user_id(session, current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already onboarded as farmer"
        )
    
    # Update user profile
    update_user(
        session,
        current_user.id,
        name=request.name,
        language=request.language,
        district=request.district,
        state=request.state,
        onboarded=True
    )
    
    # Create farmer profile
    farmer = create_farmer_profile(
        session,
        user_id=current_user.id,
        land_size=request.land_size,
        geo=request.geo,
        crops=request.crops,
        village=request.village,
        bank_account=request.bank_account,
        ifsc=request.ifsc
    )
    
    logger.info(f"Farmer onboarded: {current_user.id}")
    
    # Send Welcome SMS
    send_notification_sms(
        to=current_user.phone,
        template_key="REGISTRATION_SUCCESS",
        params={"name": request.name, "role": "Farmer"},
        language=request.language
    )
    
    return success_response(
        message="Farmer onboarding complete",
        data={
            "user_id": current_user.id,
            "farmer_id": farmer.id,
            "name": request.name,
            "district": request.district
        }
    )


@router.post("/onboard/fpo")
async def onboard_fpo(
    request: FPOOnboardingRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Onboard user as an FPO."""
    # Check if already onboarded as FPO
    existing = get_fpo_by_user_id(session, current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already onboarded as FPO"
        )
    
    # Update user profile
    update_user(
        session,
        current_user.id,
        name=request.name,
        language=request.language,
        district=request.district,
        state=request.state,
        onboarded=True
    )
    
    # Create FPO profile
    fpo = create_fpo_profile(
        session,
        user_id=current_user.id,
        name=request.organization_name,
        registration_no=request.registration_no,
        address=request.address,
        district=request.district,
        member_count=request.member_count
    )
    
    logger.info(f"FPO onboarded: {current_user.id}")
    
    # Send Welcome SMS
    send_notification_sms(
        to=current_user.phone,
        template_key="REGISTRATION_SUCCESS",
        params={"name": request.name, "role": "FPO/SHG"},
        language=request.language
    )
    
    return success_response(
        message="FPO onboarding complete",
        data={
            "user_id": current_user.id,
            "fpo_id": fpo.id,
            "organization": request.organization_name,
            "district": request.district
        }
    )


@router.post("/onboard/buyer")
async def onboard_buyer(
    request: BuyerOnboardingRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Onboard user as a buyer."""
    # Check if already onboarded as Buyer
    existing = get_buyer_by_user_id(session, current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already onboarded as Buyer"
        )
    
    # Update user profile
    update_user(
        session,
        current_user.id,
        name=request.name,
        language=request.language,
        district=request.district,
        state=request.state,
        onboarded=True
    )
    
    # Create buyer profile
    buyer = create_buyer_profile(
        session,
        user_id=current_user.id,
        company_name=request.company_name,
        gst_number=request.gst_number,
        address=request.address,
        district=request.district,
        state=request.state,
        buyer_type=request.buyer_type
    )
    
    logger.info(f"Buyer onboarded: {current_user.id}")
    
    # Send Welcome SMS
    send_notification_sms(
        to=current_user.phone,
        template_key="REGISTRATION_SUCCESS",
        params={"name": request.name, "role": "Buyer"},
        language=request.language
    )
    
    return success_response(
        message="Buyer onboarding complete",
        data={
            "user_id": current_user.id,
            "buyer_id": buyer.id,
            "name": request.name,
            "district": request.district,
            "buyer_type": request.buyer_type
        }
    )


@router.post("/onboard/processor")
async def onboard_processor(
    request: ProcessorOnboardingRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Onboard user as a processor."""
    # Check if already onboarded as Processor
    existing = get_processor_by_user_id(session, current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already onboarded as Processor"
        )
    
    # Update user profile
    update_user(
        session,
        current_user.id,
        name=request.name,
        language=request.language,
        district=request.district,
        state=request.state,
        onboarded=True
    )
    
    # Create processor profile
    processor = create_processor_profile(
        session,
        user_id=current_user.id,
        company_name=request.name,
        state=request.state,
        district=request.district,
        city=request.city,
        unit_type=request.unit_type,
        fssai_license=request.fssai_license,
        products=request.products,
        address=request.address
    )
    
    logger.info(f"Processor onboarded: {current_user.id}")
    
    # Send Welcome SMS
    send_notification_sms(
        to=current_user.phone,
        template_key="REGISTRATION_SUCCESS",
        params={"name": request.name, "role": "Processor"},
        language=request.language
    )
    
    return success_response(
        message="Processor onboarding complete",
        data={
            "user_id": current_user.id,
            "processor_id": processor.id,
            "name": request.name,
            "district": request.district,
            "unit_type": request.unit_type
        }
    )


@router.post("/onboard/admin")
async def onboard_admin(
    request: AdminOnboardingRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Onboard user as an admin."""
    # Update user profile with admin fields
    update_user(
        session,
        current_user.id,
        name=request.name,
        language=request.language,
        email=request.email,
        designation=request.designation,
        access_level=request.access_level,
        onboarded=True
    )
    
    # Add admin role
    if not current_user.has_role("admin"):
        current_user.add_role("admin")
        session.add(current_user)
        session.commit()
    
    logger.info(f"Admin onboarded: {current_user.id}")
    
    # Send Welcome SMS
    send_notification_sms(
        to=current_user.phone,
        template_key="REGISTRATION_SUCCESS",
        params={"name": request.name, "role": "Admin"},
        language=request.language
    )
    
    return success_response(
        message="Admin onboarding complete",
        data={
            "user_id": current_user.id,
            "name": request.name,
            "email": request.email,
            "designation": request.designation,
            "access_level": request.access_level
        }
    )


# =============================================================================
# FARMER PROFILE CRUD (/users/farmer/profile)
# =============================================================================

@router.post("/farmer/profile")
async def create_farmer_profile_route(
    request: FarmerProfileRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create farmer profile (alternative to onboarding)."""
    import json
    
    # Check if already has farmer profile
    existing = get_farmer_by_user_id(session, current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Farmer profile already exists"
        )
    
    # Update user profile if name/district provided
    if request.name or request.district:
        update_user(
            session,
            current_user.id,
            name=request.name or current_user.name,
            district=request.district or current_user.district,
            onboarded=True
        )
    
    # Create farmer profile
    farmer = create_farmer_profile(
        session,
        user_id=current_user.id,
        land_size=request.land_holding_acres,
        geo={"village": request.village, "state": request.state, "pincode": request.pincode} if request.village else None,
        crops=request.primary_crops
    )
    
    logger.info(f"Farmer profile created: {current_user.id}")
    
    return {
        "id": farmer.id,
        "user_id": farmer.user_id,
        "name": request.name,
        "village": request.village,
        "district": request.district,
        "state": request.state,
        "pincode": request.pincode,
        "land_holding_acres": request.land_holding_acres,
        "primary_crops": request.primary_crops,
        "organic_certified": request.organic_certified,
        "certification_id": request.certification_id,
        "created_at": farmer.created_at.isoformat() if farmer.created_at else None
    }


@router.get("/me/farmer-profile")
async def get_farmer_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's farmer profile."""
    import json
    
    farmer = get_farmer_by_user_id(session, current_user.id)
    
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found"
        )
    
    geo = json.loads(farmer.geo) if farmer.geo else {}
    crops = json.loads(farmer.crops) if farmer.crops else []
    
    return {
        "id": farmer.id,
        "user_id": farmer.user_id,
        "name": current_user.name,
        "village": geo.get("village"),
        "district": current_user.district,
        "state": geo.get("state"),
        "pincode": geo.get("pincode"),
        "land_holding_acres": farmer.land_size,
        "crops": crops,
        "organic_certified": farmer.organic_certified,
        "certification_id": farmer.certification_id,
        "verified": geo.get("verified", False),
        "created_at": farmer.created_at.isoformat() if farmer.created_at else None
    }


@router.put("/farmer/profile")
async def update_farmer_profile_route(
    request: FarmerProfileRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user's farmer profile."""
    import json
    
    farmer = get_farmer_by_user_id(session, current_user.id)
    
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found"
        )
    
    # Update user name/district if provided
    if request.name or request.district:
        update_user(
            session,
            current_user.id,
            name=request.name or current_user.name,
            district=request.district or current_user.district
        )
    
    # Update farmer profile
    if request.land_holding_acres is not None:
        farmer.land_size = request.land_holding_acres
    
    if request.crops is not None:
        farmer.crops = json.dumps(request.crops)
        
    if request.organic_certified is not None:
        farmer.organic_certified = request.organic_certified
        
    if request.certification_id is not None:
        farmer.certification_id = request.certification_id
    
    # Update geo data
    current_geo = json.loads(farmer.geo) if farmer.geo else {}
    if request.village is not None:
        current_geo["village"] = request.village
    if request.state is not None:
        current_geo["state"] = request.state
    if request.pincode is not None:
        current_geo["pincode"] = request.pincode
    
    # Remove old fields from geo if they exist
    if "organic_certified" in current_geo:
        del current_geo["organic_certified"]
    if "certification_id" in current_geo:
        del current_geo["certification_id"]
        
    farmer.geo = json.dumps(current_geo)
    
    session.add(farmer)
    session.commit()
    session.refresh(farmer)
    
    logger.info(f"Farmer profile updated: {current_user.id}")
    
    return {
        "id": farmer.id,
        "user_id": farmer.user_id,
        "land_holding_acres": farmer.land_size,
        "crops": json.loads(farmer.crops) if farmer.crops else [],
        "organic_certified": farmer.organic_certified,
        "certification_id": farmer.certification_id,
        "updated": True
    }


@router.get("/me/fpo-profile")
async def get_fpo_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's FPO profile."""
    fpo = get_fpo_by_user_id(session, current_user.id)
    
    if not fpo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FPO profile not found"
        )
    
    return {
        "id": fpo.id,
        "user_id": fpo.user_id,
        "name": fpo.name,
        "registration_no": fpo.registration_no,
        "address": fpo.address,
        "district": fpo.district,
        "verified": fpo.verified,
        "created_at": fpo.created_at.isoformat() if fpo.created_at else None
    }


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Upload user avatar."""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, or WebP images allowed"
        )
    
    # Save file
    path, file_hash, size = await save_file(
        file,
        prefix=f"avatar_{current_user.id}",
        user_id=current_user.id
    )
    
    # Update user profile (store avatar path)
    # Note: Would need to add avatar_url field to User model
    
    logger.info(f"Avatar uploaded for user {current_user.id}: {path}")
    
    return success_response(
        message="Avatar uploaded",
        data={"path": path, "size": size}
    )


# Admin endpoints

@router.get("/", dependencies=[Depends(require_admin)])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    role: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """List all users (admin only)."""
    from sqlmodel import select
    
    statement = select(User)
    
    if role:
        statement = statement.where(User.roles.contains(role))
    
    statement = statement.offset(skip).limit(limit)
    users = session.exec(statement).all()
    
    return {
        "users": [
            {
                "id": u.id,
                "phone": u.phone,
                "name": u.name,
                "roles": u.get_roles(),
                "onboarded": u.onboarded,
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ],
        "skip": skip,
        "limit": limit
    }


@router.get("/{user_id}", dependencies=[Depends(require_admin)])
async def get_user(
    user_id: str,
    session: Session = Depends(get_session)
):
    """Get user by ID (admin only)."""
    user = get_user_by_id(session, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "phone": user.phone,
        "name": user.name,
        "roles": user.get_roles(),
        "language": user.language,
        "district": user.district,
        "onboarded": user.onboarded,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None
    }


@router.patch("/{user_id}/roles", dependencies=[Depends(require_admin)])
async def update_user_roles(
    user_id: str,
    roles: List[str],
    session: Session = Depends(get_session)
):
    """Update user roles (admin only)."""
    user = get_user_by_id(session, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate roles
    valid_roles = {"farmer", "fpo", "shg", "buyer", "admin"}
    for role in roles:
        if role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {role}"
            )
    
    updated = update_user(session, user_id, roles=",".join(roles))
    
    logger.info(f"User {user_id} roles updated to: {roles}")
    
    return success_response(
        message="Roles updated",
        data={"user_id": user_id, "roles": roles}
    )
