"""
Shree Anna Backend - Supabase Phone Authentication Service
Uses Supabase's built-in phone OTP authentication.
"""

from typing import Optional, Dict, Any
from loguru import logger

from app.core.config import settings


# Initialize Supabase client
_supabase_client = None


def get_supabase_client():
    """Get or create Supabase client (lazy initialization)."""
    global _supabase_client
    
    if _supabase_client is None:
        try:
            from supabase import create_client, Client
            
            # Use Client directly to avoid proxy argument issue in create_client
            _supabase_client = Client(
                settings.supabase_url,
                settings.supabase_anon_key
            )
            logger.info("Supabase client initialized")
        except ImportError:
            logger.error("Supabase package not installed. Run: pip install supabase")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    return _supabase_client


def send_otp_via_supabase(phone: str) -> Dict[str, Any]:
    """
    Send OTP via Supabase Phone Auth.
    
    Args:
        phone: Phone number with country code (e.g., +91XXXXXXXXXX)
    
    Returns:
        Dict with status and message
    """
    try:
        # Use mock mode if configured
        if settings.use_mock_sms:
            logger.info(f"[MOCK] Supabase OTP sent to {phone}")
            return {
                "success": True,
                "status": "mock",
                "message": "Mock OTP sent (dev mode)",
                "mock_otp": "123456"  # Dev testing OTP
            }
        
        supabase = get_supabase_client()
        
        # Supabase signInWithOtp for phone
        # This sends an OTP to the phone number
        response = supabase.auth.sign_in_with_otp({
            "phone": phone
        })
        
        logger.info(f"Supabase OTP sent to {phone[:6]}***")
        
        return {
            "success": True,
            "status": "sent",
            "message": "OTP sent via Supabase"
        }
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Supabase OTP send error: {error_msg}")
        
        # Check for common Supabase errors
        if "phone_provider_disabled" in error_msg.lower():
            return {
                "success": False,
                "status": "error",
                "message": "Phone auth not enabled. Enable it in Supabase Dashboard → Authentication → Providers → Phone"
            }
        elif "rate_limit" in error_msg.lower():
            return {
                "success": False,
                "status": "rate_limited",
                "message": "Too many OTP requests. Please wait before trying again."
            }
        else:
            return {
                "success": False,
                "status": "error",
                "message": f"Failed to send OTP: {error_msg}"
            }


def verify_otp_via_supabase(phone: str, otp: str) -> Dict[str, Any]:
    """
    Verify OTP via Supabase Phone Auth.
    
    Args:
        phone: Phone number with country code
        otp: 6-digit OTP code
    
    Returns:
        Dict with verification result and session info
    """
    try:
        # Use mock mode if configured
        if settings.use_mock_sms:
            if otp == "123456" or otp == "111111":
                logger.info(f"[MOCK] OTP verified for {phone}")
                return {
                    "success": True,
                    "status": "verified",
                    "message": "OTP verified (mock mode)",
                    "user_id": None,
                    "session": None
                }
            else:
                return {
                    "success": False,
                    "status": "invalid",
                    "message": "Invalid OTP (mock mode: use 123456)"
                }
        
        supabase = get_supabase_client()
        
        # Verify the OTP
        response = supabase.auth.verify_otp({
            "phone": phone,
            "token": otp,
            "type": "sms"
        })
        
        # Check if verification was successful
        if response.user:
            logger.info(f"Supabase OTP verified for {phone[:6]}***, user: {response.user.id}")
            
            return {
                "success": True,
                "status": "verified",
                "message": "OTP verified successfully",
                "user_id": response.user.id,
                "session": {
                    "access_token": response.session.access_token if response.session else None,
                    "refresh_token": response.session.refresh_token if response.session else None
                } if response.session else None
            }
        else:
            return {
                "success": False,
                "status": "invalid",
                "message": "Invalid or expired OTP"
            }
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Supabase OTP verify error: {error_msg}")
        
        if "invalid" in error_msg.lower() or "expired" in error_msg.lower():
            return {
                "success": False,
                "status": "invalid",
                "message": "Invalid or expired OTP"
            }
        else:
            return {
                "success": False,
                "status": "error",
                "message": f"Verification failed: {error_msg}"
            }


def get_supabase_user(access_token: str) -> Optional[Dict[str, Any]]:
    """
    Get user info from Supabase using access token.
    
    Args:
        access_token: Supabase access token
    
    Returns:
        User info dict or None
    """
    try:
        supabase = get_supabase_client()
        
        # Get user with token
        response = supabase.auth.get_user(access_token)
        
        if response.user:
            return {
                "id": response.user.id,
                "phone": response.user.phone,
                "created_at": response.user.created_at
            }
        return None
        
    except Exception as e:
        logger.error(f"Failed to get Supabase user: {e}")
        return None
