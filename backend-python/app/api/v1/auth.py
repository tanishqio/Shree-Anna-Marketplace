"""
Shree Anna Backend - Authentication API Routes
Phone-based OTP authentication using Supabase with JWT.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlmodel import Session
from loguru import logger

from app.core.security import create_access_token, TokenResponse, get_current_user
from app.core.utils import validate_phone, normalize_phone, utc_now, success_response, error_response
from app.db import (
    get_session, get_user_by_phone, create_user, update_user, User
)
from app.services import send_otp_via_supabase, verify_otp_via_supabase


router = APIRouter(prefix="/auth", tags=["Authentication"])


# Rate limiting storage (in production, use Redis)
otp_rate_limits: dict = {}
OTP_RATE_LIMIT = 3  # Max OTPs per phone per 10 minutes
OTP_RATE_WINDOW = 600  # 10 minutes in seconds


class RequestOTPRequest(BaseModel):
    """Request OTP for login/registration."""
    phone: str = Field(..., description="Phone number with country code (+91...)")
    language: str = Field(default="hi", description="Preferred language (hi, en, mr, te)")
    is_registration: bool = Field(default=False, description="True if this is for new user registration")


class RequestOTPResponse(BaseModel):
    """OTP request response."""
    success: bool
    message: str
    expires_in: int = 300  # 5 minutes
    retry_after: Optional[int] = None
    dev_otp: Optional[str] = None  # Only in dev mode for testing
    user_exists: bool = True  # Indicates if user is registered


class VerifyOTPRequest(BaseModel):
    """Verify OTP and get token."""
    phone: str = Field(..., description="Phone number")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP")
    is_registration: bool = Field(default=False, description="True if this is for new user registration")


class VerifyOTPResponse(BaseModel):
    """OTP verification response with token."""
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None
    is_new_user: bool = False


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    token: str


def check_rate_limit(phone: str) -> Optional[int]:
    """
    Check if phone has exceeded OTP rate limit.
    Returns seconds until retry allowed, or None if OK.
    """
    now = datetime.now().timestamp()
    phone_key = normalize_phone(phone)
    
    if phone_key not in otp_rate_limits:
        otp_rate_limits[phone_key] = []
    
    # Clean old entries
    otp_rate_limits[phone_key] = [
        ts for ts in otp_rate_limits[phone_key]
        if now - ts < OTP_RATE_WINDOW
    ]
    
    # Check limit
    if len(otp_rate_limits[phone_key]) >= OTP_RATE_LIMIT:
        oldest = min(otp_rate_limits[phone_key])
        retry_after = int(OTP_RATE_WINDOW - (now - oldest))
        return max(1, retry_after)
    
    # Add current request
    otp_rate_limits[phone_key].append(now)
    return None



# Developer Credentials for Testing
DEV_CREDENTIALS = {
    "+911111111111": "111111",  # Farmer
    "+912222222222": "333333",  # FPO
    "+913333333333": "111111",  # Processor
    "+914444444444": "111111",  # Buyer
    "+915555555555": "111111",  # Admin
    "+917777777777": "111111",  # Farmer
}

DEV_ROLES = {
    "+911111111111": "farmer",
    "+912222222222": "fpo",
    "+913333333333": "processor",
    "+914444444444": "buyer",
    "+915555555555": "admin",
    "+917777777777": "farmer",
}

@router.post("/request-otp", response_model=RequestOTPResponse)
async def request_otp(
    request: RequestOTPRequest,
    session: Session = Depends(get_session)
):
    """
    Request OTP for phone number verification using Supabase.
    Rate limited to 3 requests per 10 minutes per phone.
    For login: User must be registered first.
    For registration: is_registration=True allows new users.
    """
    # Validate phone
    if not validate_phone(request.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number. Use format: +91XXXXXXXXXX"
        )
    
    # Check if user exists
    normalized_phone = normalize_phone(request.phone)
    existing_user = get_user_by_phone(session, normalized_phone)

    # DEV BYPASS: Return Mock OTP for known dev numbers
    if normalized_phone in DEV_CREDENTIALS:
        return RequestOTPResponse(
            success=True,
            message="[DEV] OTP sent successfully.",
            expires_in=300,
            dev_otp=DEV_CREDENTIALS[normalized_phone],
            user_exists=existing_user is not None
        )
    
    # For login (not registration), user must exist
    if not request.is_registration and not existing_user:
        return RequestOTPResponse(
            success=False,
            message="This phone number is not registered. Please register first.",
            user_exists=False
        )
    
    # For registration, user must NOT exist
    if request.is_registration and existing_user:
        return RequestOTPResponse(
            success=False,
            message="This phone number is already registered. Please login instead.",
            user_exists=True
        )
    
    # Check rate limit
    retry_after = check_rate_limit(request.phone)
    if retry_after:
        return RequestOTPResponse(
            success=False,
            message=f"Too many OTP requests. Try again in {retry_after} seconds.",
            retry_after=retry_after,
            user_exists=existing_user is not None
        )
    
    try:
        # Send OTP via Supabase
        result = send_otp_via_supabase(normalized_phone)
        
        if not result["success"]:
            logger.warning(f"Supabase OTP failed: {result['message']}")
            # Universal OTP Fallback: Allow proceeding even if SMS fails
            # This enables using 000000 for any number (including invalid ones)
            return RequestOTPResponse(
                success=True,
                message="OTP sent. If you don't receive it, use 000000.",
                expires_in=300,
                user_exists=existing_user is not None
            )
        
        logger.info(
            f"OTP requested for {normalized_phone}, "
            f"is_registration={request.is_registration}, "
            f"status: {result.get('status', 'unknown')}"
        )
        
        # In dev mode (mock SMS), return OTP for testing
        dev_otp = result.get("mock_otp") if result.get("status") == "mock" else None
        
        return RequestOTPResponse(
            success=True,
            message="OTP sent successfully. Valid for 5 minutes.",
            expires_in=300,
            dev_otp=dev_otp,
            user_exists=existing_user is not None
        )
    
    except Exception as e:
        logger.error(f"OTP request error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP. Please try again."
        )


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp_endpoint(
    request: VerifyOTPRequest,
    session: Session = Depends(get_session)
):
    """
    Verify OTP using Supabase and return JWT token.
    For login: User must exist.
    For registration: Creates new user.
    """
    # Validate phone
    if not validate_phone(request.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number"
        )
    
    # Verify OTP via Supabase
    normalized_phone = normalize_phone(request.phone)
    
    # DEV BYPASS: Check hardcoded credentials
    is_dev_login = False
    
    # Universal OTP for development/testing
    if request.otp == "000000":
        is_dev_login = True
        logger.info(f"Universal OTP used for {normalized_phone}")
    elif normalized_phone in DEV_CREDENTIALS:
        if request.otp == DEV_CREDENTIALS[normalized_phone]:
            is_dev_login = True
        else:
             # If it's a dev phone but wrong OTP, fail immediately or allow fallback?
             # Let's return error to be strict with credentials provided
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP (Dev)"
            )

    if not is_dev_login:
        result = verify_otp_via_supabase(normalized_phone, request.otp)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.get("message", "Invalid or expired OTP")
            )
    
    # Get user from our database
    user = get_user_by_phone(session, normalized_phone)
    is_new_user = False
    
    if not user:
        # Auto-create dev user if missing
        if is_dev_login and normalized_phone in DEV_CREDENTIALS:
            logger.info(f"Auto-creating dev user for {normalized_phone}")
            role = DEV_ROLES.get(normalized_phone, "farmer")
            user = create_user(session, normalized_phone, roles=role)
            is_new_user = True
        
        # For login (not registration), user must exist
        elif not request.is_registration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please register first."
            )
        # Create new user for registration
        else:
            user = create_user(session, normalized_phone)
            is_new_user = True
            logger.info(f"New user created: {user.id}")
    else:
        # For registration, user must NOT exist
        if request.is_registration:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already registered. Please login instead."
            )
        # Update last login
        update_user(session, user.id, last_login=utc_now())
    
    # Generate our app's JWT token
    token = create_access_token(
        user_id=user.id,
        phone=user.phone,
        roles=user.get_roles()
    )
    
    logger.info(f"User authenticated: {user.id} ({user.phone})")
    
    return VerifyOTPResponse(
        success=True,
        message="Login successful",
        token=token,
        user={
            "id": user.id,
            "phone": user.phone,
            "name": user.name,
            "roles": user.get_roles(),
            "language": user.language,
            "district": user.district,
            "onboarded": user.onboarded
        },
        is_new_user=is_new_user
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    session: Session = Depends(get_session)
):
    """
    Refresh an existing JWT token.
    """
    from app.core.security import decode_token
    from app.core.config import settings
    
    try:
        payload = decode_token(request.token)
        user_id = payload.sub  # TokenPayload has sub attribute
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Verify user exists
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Generate new token
        new_token = create_access_token(
            user_id=user.id,
            phone=user.phone,
            roles=user.get_roles()
        )
        
        return TokenResponse(
            access_token=new_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_days * 24 * 60 * 60,
            user_id=user.id,
            roles=user.get_roles()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout():
    """
    Logout endpoint (client should discard token).
    For stateless JWT, this is a no-op on server side.
    """
    return success_response(message="Logged out successfully")


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user info.
    """
    return {
        "id": current_user.id,
        "phone": current_user.phone,
        "name": current_user.name,
        "roles": current_user.get_roles(),
        "language": current_user.language,
        "district": current_user.district,
        "onboarded": getattr(current_user, 'onboarded', False),
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
