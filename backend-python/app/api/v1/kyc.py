"""
Shree Anna Backend - e-KYC API Routes
Aadhaar-based identity verification endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.core.security import get_current_user
from app.db import get_session, User
from app.services.ekyc import ekyc_service


router = APIRouter(prefix="/kyc", tags=["KYC"])


class AadhaarOTPRequest(BaseModel):
    """Request OTP for Aadhaar verification."""
    aadhaar_number: str = Field(
        ..., 
        description="12-digit Aadhaar number",
        min_length=12,
        max_length=14  # Allow spaces/dashes
    )


class VerifyOTPRequest(BaseModel):
    """Verify Aadhaar OTP."""
    session_id: str = Field(..., description="Session ID from OTP request")
    otp: str = Field(..., description="6-digit OTP", min_length=6, max_length=6)


@router.get("/status")
async def get_kyc_status(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get current user's KYC verification status.
    """
    status_data = ekyc_service.get_kyc_status(current_user.id)
    
    return {
        "user_id": current_user.id,
        "is_kyc_verified": status_data["is_verified"],
        "masked_aadhaar": status_data["masked_aadhaar"],
        "verified_at": status_data["verified_at"],
        "verification_id": status_data["verification_id"]
    }


@router.post("/request-otp")
async def request_aadhaar_otp(
    request: AadhaarOTPRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Request OTP for Aadhaar verification.
    OTP will be sent to the mobile number linked with Aadhaar.
    
    In development mode, the OTP is returned in the response.
    """
    result = ekyc_service.request_aadhaar_otp(
        user_id=current_user.id,
        aadhaar_number=request.aadhaar_number,
        phone=current_user.phone
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to request OTP")
        )
    
    return result


@router.post("/verify-otp")
async def verify_aadhaar_otp(
    request: VerifyOTPRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Verify Aadhaar OTP to complete KYC.
    """
    result = ekyc_service.verify_aadhaar_otp(
        session_id=request.session_id,
        otp=request.otp
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "OTP verification failed")
        )
    
    # Update user's KYC status in database
    user = session.get(User, current_user.id)
    if user:
        user.is_kyc_verified = True
        user.kyc_verified_at = result.get("verified_at")
        session.add(user)
        session.commit()
    
    return result


@router.post("/resend-otp")
async def resend_aadhaar_otp(
    request: AadhaarOTPRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Resend OTP for Aadhaar verification.
    This creates a new session.
    """
    # Same as request_otp, just creates a new session
    result = ekyc_service.request_aadhaar_otp(
        user_id=current_user.id,
        aadhaar_number=request.aadhaar_number,
        phone=current_user.phone
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to resend OTP")
        )
    
    return result
