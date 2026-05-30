"""
Shree Anna Backend - Security Module
JWT authentication, RBAC, and request validation.
"""

from datetime import datetime, timedelta, timezone
from typing import Annotated, List, Optional

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import Session, select

from .config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)


class TokenPayload(BaseModel):
    """JWT token payload structure."""
    sub: str  # user_id
    phone: str
    roles: List[str]
    exp: datetime
    iat: datetime
    type: str = "access"


class TokenResponse(BaseModel):
    """Token response for auth endpoints."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    roles: List[str]


def create_access_token(
    user_id: str,
    phone: str,
    roles: List[str],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        user_id: User's unique ID
        phone: User's phone number
        roles: List of user roles
        expires_delta: Optional custom expiry time
    
    Returns:
        Encoded JWT token
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.jwt_access_token_expire_days)

    payload = {
        "sub": user_id,
        "phone": phone,
        "roles": roles,
        "exp": expire,
        "iat": now,
        "type": "access"
    }

    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> TokenPayload:
    """
    Decode and validate a JWT token.
    
    Args:
        token: The JWT token string
    
    Returns:
        Decoded token payload
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)]
):
    """
    Dependency to get current authenticated user from JWT token.
    Fetches the full User object from the database.
    
    Returns:
        User model with full user info
    
    Raises:
        HTTPException: If no token or invalid token
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    
    # Handle Developer Bypass Token
    if token.startswith("dev-"):
        # Format: dev-{role}-{phone}
        try:
            parts = token.split("-")
            role = parts[1]
            phone = parts[-1]  # Last part is phone
            
            # Import here to avoid circular imports
            from app.db.init_db import get_session
            from app.db.models import User
            from app.db.crud import create_user, get_user_by_phone
            
            session = next(get_session())
            try:
                # Check if dev user exists (by ID=token OR by phone)
                user = session.exec(
                    select(User).where(User.id == token)
                ).first()
                
                if not user:
                    # Also check by phone to avoid duplicates if ID format changed
                    user = get_user_by_phone(session, phone)
                
                if not user:
                    # Create dev user
                    from loguru import logger
                    logger.info(f"Creating developer user for token: {token}")
                    user = create_user(
                        session=session,
                        phone=phone,
                        name=f"Developer {role.capitalize()}",
                        roles=role,
                        language="en",
                        district="New Delhi"  # Default for dev
                    )
                    # Force ID to match token if possible/needed? 
                    # Actually create_user generates UUID. 
                    # Ideally we want ID to be the token for consistency with frontend expectations?
                    # But the frontend just stores the token. 
                    # If we use a real UUID, get_current_user next time won't find it by ID=token.
                    # So we should probably try to find by phone.
                    
                # Verify role
                if not user.has_role(role):
                    user.add_role(role)
                    session.add(user)
                    session.commit()
                    session.refresh(user)
                
                return user
            finally:
                session.close()
        except Exception as e:
            from loguru import logger
            logger.error(f"Dev token error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid developer token",
                headers={"WWW-Authenticate": "Bearer"}
            )

    token_payload = decode_token(token)
    
    # Import here to avoid circular imports
    from app.db.init_db import get_session
    from app.db.models import User
    
    # Get database session and fetch user
    session = next(get_session())
    try:
        user = session.exec(
            select(User).where(User.id == token_payload.sub)
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is inactive",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return user
    finally:
        session.close()


async def get_optional_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)]
):
    """
    Dependency to optionally get current user (for public endpoints).
    
    Returns:
        User object if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        token_payload = decode_token(credentials.credentials)
        
        # Import here to avoid circular imports
        from app.db.init_db import get_session
        from app.db.models import User
        
        session = next(get_session())
        try:
            user = session.exec(
                select(User).where(User.id == token_payload.sub)
            ).first()
            return user
        finally:
            session.close()
    except HTTPException:
        return None


class RoleChecker:
    """
    Dependency class for role-based access control.
    
    Usage:
        @router.get("/admin", dependencies=[Depends(RoleChecker(["admin"]))])
    """
    
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    async def __call__(
        self,
        user: Annotated[any, Depends(get_current_user)]
    ):
        """Check if user has any of the allowed roles."""
        # User.roles is a comma-separated string
        user_roles = user.roles.split(",") if user.roles else []
        if not any(role in user_roles for role in self.allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {self.allowed_roles}"
            )
        return user


# Convenience role checker instances
require_farmer = RoleChecker(["farmer", "admin"])
require_fpo = RoleChecker(["fpo", "admin"])
require_buyer = RoleChecker(["buyer", "admin"])
require_admin = RoleChecker(["admin"])
require_any_authenticated = RoleChecker(["farmer", "fpo", "shg", "buyer", "admin"])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash a password for storage."""
    return pwd_context.hash(password)


def get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
