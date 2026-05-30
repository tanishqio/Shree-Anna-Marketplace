"""
Shree Anna Backend - e-KYC Service
Mock Aadhaar verification service for identity verification.
"""

import secrets
import re
from datetime import datetime, timedelta
from typing import Optional, Tuple
from loguru import logger


class EKYCService:
    """Mock e-KYC/Aadhaar verification service."""
    
    def __init__(self):
        # In-memory storage for OTPs and verification sessions
        self._otp_store: dict[str, dict] = {}
        self._verified_users: dict[str, dict] = {}
        
    def _mask_aadhaar(self, aadhaar: str) -> str:
        """Mask Aadhaar number, showing only last 4 digits."""
        clean = re.sub(r'\D', '', aadhaar)
        if len(clean) != 12:
            return "XXXX-XXXX-****"
        return f"XXXX-XXXX-{clean[-4:]}"
    
    def _validate_aadhaar_format(self, aadhaar: str) -> Tuple[bool, str]:
        """Validate Aadhaar number format."""
        clean = re.sub(r'\D', '', aadhaar)
        
        if len(clean) != 12:
            return False, "Aadhaar number must be 12 digits"
        
        if clean[0] == '0' or clean[0] == '1':
            return False, "Invalid Aadhaar number - cannot start with 0 or 1"
            
        return True, ""
    
    def request_aadhaar_otp(
        self,
        user_id: str,
        aadhaar_number: str,
        phone: Optional[str] = None
    ) -> dict:
        """
        Request OTP for Aadhaar verification.
        In production, this would call UIDAI API.
        """
        # Validate format
        is_valid, error_msg = self._validate_aadhaar_format(aadhaar_number)
        if not is_valid:
            return {
                "success": False,
                "error": error_msg
            }
        
        # Check if already verified
        if user_id in self._verified_users:
            existing = self._verified_users[user_id]
            return {
                "success": False,
                "error": "User already KYC verified",
                "verified_at": existing.get("verified_at"),
                "masked_aadhaar": existing.get("masked_aadhaar")
            }
        
        # Generate mock OTP
        otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
        session_id = secrets.token_urlsafe(16)
        
        # Store OTP with expiry (10 minutes)
        self._otp_store[session_id] = {
            "user_id": user_id,
            "aadhaar": re.sub(r'\D', '', aadhaar_number),
            "otp": otp,
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
            "attempts": 0,
            "max_attempts": 3
        }
        
        logger.info(f"[MOCK KYC] OTP requested for user {user_id}")
        logger.info(f"[MOCK KYC] DEV OTP: {otp}")  # Only in dev
        
        return {
            "success": True,
            "session_id": session_id,
            "message": "OTP sent to Aadhaar-linked mobile number",
            "masked_aadhaar": self._mask_aadhaar(aadhaar_number),
            "expires_in_seconds": 600,
            "dev_otp": otp  # Only in development
        }
    
    def verify_aadhaar_otp(
        self,
        session_id: str,
        otp: str
    ) -> dict:
        """
        Verify OTP and complete KYC.
        """
        # Check session exists
        if session_id not in self._otp_store:
            return {
                "success": False,
                "error": "Invalid or expired session"
            }
        
        session = self._otp_store[session_id]
        
        # Check expiry
        if datetime.utcnow() > session["expires_at"]:
            del self._otp_store[session_id]
            return {
                "success": False,
                "error": "OTP has expired. Please request a new one."
            }
        
        # Check attempts
        if session["attempts"] >= session["max_attempts"]:
            del self._otp_store[session_id]
            return {
                "success": False,
                "error": "Maximum OTP attempts exceeded. Please request a new OTP."
            }
        
        # Verify OTP
        session["attempts"] += 1
        
        if otp != session["otp"]:
            remaining = session["max_attempts"] - session["attempts"]
            if remaining > 0:
                return {
                    "success": False,
                    "error": f"Invalid OTP. {remaining} attempts remaining."
                }
            else:
                del self._otp_store[session_id]
                return {
                    "success": False,
                    "error": "Maximum attempts exceeded. Please request new OTP."
                }
        
        # OTP verified - mark user as KYC verified
        user_id = session["user_id"]
        masked_aadhaar = self._mask_aadhaar(session["aadhaar"])
        
        self._verified_users[user_id] = {
            "masked_aadhaar": masked_aadhaar,
            "verified_at": datetime.utcnow().isoformat(),
            "verification_id": secrets.token_urlsafe(16)
        }
        
        # Clean up session
        del self._otp_store[session_id]
        
        logger.info(f"[MOCK KYC] User {user_id} KYC verified")
        
        return {
            "success": True,
            "verified": True,
            "masked_aadhaar": masked_aadhaar,
            "verified_at": self._verified_users[user_id]["verified_at"],
            "verification_id": self._verified_users[user_id]["verification_id"],
            "message": "Aadhaar verification successful"
        }
    
    def get_kyc_status(self, user_id: str) -> dict:
        """Get KYC verification status for a user."""
        if user_id in self._verified_users:
            data = self._verified_users[user_id]
            return {
                "is_verified": True,
                "masked_aadhaar": data["masked_aadhaar"],
                "verified_at": data["verified_at"],
                "verification_id": data["verification_id"]
            }
        return {
            "is_verified": False,
            "masked_aadhaar": None,
            "verified_at": None,
            "verification_id": None
        }
    
    def revoke_kyc(self, user_id: str) -> dict:
        """Revoke KYC verification (admin action)."""
        if user_id in self._verified_users:
            del self._verified_users[user_id]
            logger.info(f"[MOCK KYC] KYC revoked for user {user_id}")
            return {"success": True, "message": "KYC verification revoked"}
        return {"success": False, "error": "User not KYC verified"}


# Singleton instance
ekyc_service = EKYCService()
