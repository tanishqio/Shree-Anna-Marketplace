"""
Shree Anna Backend - Hashing & Cryptographic Utilities
Provides tamper-evidence for trace events and secure password hashing.
"""

import hashlib
import hmac
import json
import secrets
from typing import Any, Dict

from .config import settings


def compute_payload_hash(payload: Dict[str, Any], salt: str | None = None) -> str:
    """
    Compute SHA256 hash of a payload for tamper-evidence.
    
    Args:
        payload: Dictionary to hash
        salt: Optional salt (uses config salt if not provided)
    
    Returns:
        Hex-encoded SHA256 hash
    """
    salt = salt or settings.payload_salt
    # Canonical JSON: sorted keys, minimal separators
    json_bytes = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    data = (json_bytes + salt).encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def sign_hash(hash_hex: str, key: str | None = None) -> str:
    """
    Create HMAC signature of a hash for server verification.
    
    Args:
        hash_hex: The hash to sign
        key: Signing key (uses config key if not provided)
    
    Returns:
        Hex-encoded HMAC-SHA256 signature
    """
    key = key or settings.server_signing_key
    return hmac.new(
        key.encode("utf-8"),
        hash_hex.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()


def verify_signature(hash_hex: str, signature: str, key: str | None = None) -> bool:
    """
    Verify an HMAC signature.
    
    Args:
        hash_hex: The original hash
        signature: The signature to verify
        key: Signing key (uses config key if not provided)
    
    Returns:
        True if signature is valid
    """
    expected = sign_hash(hash_hex, key)
    return hmac.compare_digest(expected, signature)


def hash_otp(otp: str, phone: str) -> str:
    """
    Hash an OTP with the phone number for storage.
    
    Args:
        otp: The OTP code
        phone: Phone number (used as additional salt)
    
    Returns:
        Hex-encoded SHA256 hash
    """
    data = f"{otp}:{phone}:{settings.payload_salt}".encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def verify_otp_hash(otp: str, phone: str, stored_hash: str) -> bool:
    """
    Verify an OTP against its stored hash.
    
    Args:
        otp: The OTP to verify
        phone: Phone number
        stored_hash: The stored hash to compare against
    
    Returns:
        True if OTP matches
    """
    computed = hash_otp(otp, phone)
    return hmac.compare_digest(computed, stored_hash)


def generate_otp(length: int = 6) -> str:
    """
    Generate a secure random OTP.
    
    Args:
        length: Number of digits (default 6)
    
    Returns:
        Numeric OTP string
    """
    # Use secrets for cryptographically secure random numbers
    return "".join(str(secrets.randbelow(10)) for _ in range(length))


def compute_file_hash(file_path: str) -> str:
    """
    Compute SHA256 hash of a file.
    
    Args:
        file_path: Path to the file
    
    Returns:
        Hex-encoded SHA256 hash
    """
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def compute_bytes_hash(data: bytes) -> str:
    """
    Compute SHA256 hash of bytes.
    
    Args:
        data: Bytes to hash
    
    Returns:
        Hex-encoded SHA256 hash
    """
    return hashlib.sha256(data).hexdigest()


def generate_token(length: int = 32) -> str:
    """
    Generate a secure random token.
    
    Args:
        length: Number of bytes (default 32)
    
    Returns:
        URL-safe base64 encoded token
    """
    return secrets.token_urlsafe(length)
