"""
Shree Anna Backend - Core Module
"""

from .config import settings, get_settings
from .hashing import (
    compute_payload_hash,
    sign_hash,
    verify_signature,
    hash_otp,
    verify_otp_hash,
    generate_otp,
    compute_file_hash,
    compute_bytes_hash,
    generate_token,
)
from .security import (
    create_access_token,
    decode_token,
    get_current_user,
    get_optional_user,
    RoleChecker,
    require_farmer,
    require_fpo,
    require_buyer,
    require_admin,
    require_any_authenticated,
    TokenPayload,
    TokenResponse,
)
from .utils import (
    generate_uuid,
    utc_now,
    normalize_phone,
    validate_phone,
    sanitize_filename,
    get_upload_path,
    JsonFallbackStore,
    get_fallback_store,
    setup_logging,
    success_response,
    error_response,
    paginated_response,
)

__all__ = [
    # Config
    "settings",
    "get_settings",
    # Hashing
    "compute_payload_hash",
    "sign_hash",
    "verify_signature",
    "hash_otp",
    "verify_otp_hash",
    "generate_otp",
    "compute_file_hash",
    "compute_bytes_hash",
    "generate_token",
    # Security
    "create_access_token",
    "decode_token",
    "get_current_user",
    "get_optional_user",
    "RoleChecker",
    "require_farmer",
    "require_fpo",
    "require_buyer",
    "require_admin",
    "require_any_authenticated",
    "TokenPayload",
    "TokenResponse",
    # Utils
    "generate_uuid",
    "utc_now",
    "normalize_phone",
    "validate_phone",
    "sanitize_filename",
    "get_upload_path",
    "JsonFallbackStore",
    "get_fallback_store",
    "setup_logging",
    "success_response",
    "error_response",
    "paginated_response",
]
