"""
Shree Anna Backend - Utility Functions
Common helpers used across the application.
"""

import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, TypeVar

from loguru import logger

from .config import settings

T = TypeVar("T")


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


def normalize_phone(phone: str) -> str:
    """
    Normalize phone number to E.164 format.
    
    Args:
        phone: Phone number in any format
    
    Returns:
        Normalized phone number (e.g., +919876543210)
    """
    # Remove all non-digit characters except leading +
    cleaned = re.sub(r"[^\d+]", "", phone)
    
    # Handle Indian numbers
    if cleaned.startswith("+91"):
        return cleaned
    elif cleaned.startswith("91") and len(cleaned) == 12:
        return f"+{cleaned}"
    elif cleaned.startswith("0") and len(cleaned) == 11:
        return f"+91{cleaned[1:]}"
    elif len(cleaned) == 10:
        return f"+91{cleaned}"
    
    # Return as-is if already has country code
    if cleaned.startswith("+"):
        return cleaned
    
    return f"+{cleaned}"


def validate_phone(phone: str) -> bool:
    """
    Validate Indian phone number format.
    
    Args:
        phone: Phone number to validate
    
    Returns:
        True if valid Indian mobile number
    """
    normalized = normalize_phone(phone)
    # Indian mobile: +91 followed by 10 digits starting with 1-9 (1-5 allowed for dev/tests)
    pattern = r"^\+91[1-9]\d{9}$"
    return bool(re.match(pattern, normalized))


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename for safe storage.
    
    Args:
        filename: Original filename
    
    Returns:
        Sanitized filename
    """
    # Remove path components
    name = Path(filename).name
    # Replace problematic characters
    name = re.sub(r"[^\w\-_\.]", "_", name)
    # Limit length
    if len(name) > 100:
        ext = Path(name).suffix
        name = name[:100 - len(ext)] + ext
    return name


def get_upload_path(filename: str, subdir: str = "") -> Path:
    """
    Generate upload path with date-based organization.
    
    Args:
        filename: Original filename
        subdir: Optional subdirectory (e.g., "reverie")
    
    Returns:
        Full path for the uploaded file
    """
    now = utc_now()
    safe_name = sanitize_filename(filename)
    unique_name = f"{generate_uuid()[:8]}_{safe_name}"
    
    path = settings.upload_path
    if subdir:
        path = path / subdir
    path = path / str(now.year) / f"{now.month:02d}"
    path.mkdir(parents=True, exist_ok=True)
    
    return path / unique_name


# =============================================================================
# JSON Fallback Storage
# =============================================================================

class JsonFallbackStore:
    """
    Simple JSON file-based storage for fallback when DB is unavailable.
    Thread-safe for basic operations.
    """
    
    def __init__(self, filename: str):
        self.filepath = settings.data_path / filename
        self._ensure_file()
    
    def _ensure_file(self) -> None:
        """Create file if it doesn't exist."""
        if not self.filepath.exists():
            self.filepath.write_text("[]", encoding="utf-8")
    
    def read_all(self) -> List[Dict[str, Any]]:
        """Read all records from the JSON file."""
        try:
            content = self.filepath.read_text(encoding="utf-8")
            return json.loads(content)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    def get_all(self) -> List[Dict[str, Any]]:
        """Alias for read_all() for compatibility."""
        return self.read_all()
    
    def write_all(self, data: List[Dict[str, Any]]) -> None:
        """Write all records to the JSON file."""
        self.filepath.write_text(
            json.dumps(data, indent=2, default=str),
            encoding="utf-8"
        )
    
    def append(self, record: Dict[str, Any]) -> None:
        """Append a single record to the file."""
        data = self.read_all()
        data.append(record)
        self.write_all(data)
    
    def find_by_id(self, record_id: str, id_field: str = "id") -> Optional[Dict[str, Any]]:
        """Find a record by its ID."""
        data = self.read_all()
        for record in data:
            if record.get(id_field) == record_id:
                return record
        return None
    
    def get_by_id(self, record_id: str, id_field: str = "id") -> Optional[Dict[str, Any]]:
        """Alias for find_by_id for compatibility."""
        return self.find_by_id(record_id, id_field)
    
    def update_by_id(
        self,
        record_id: str,
        updates: Dict[str, Any],
        id_field: str = "id"
    ) -> bool:
        """Update a record by its ID."""
        data = self.read_all()
        for i, record in enumerate(data):
            if record.get(id_field) == record_id:
                data[i].update(updates)
                self.write_all(data)
                return True
        return False
    
    def delete_by_id(self, record_id: str, id_field: str = "id") -> bool:
        """Delete a record by its ID."""
        data = self.read_all()
        original_len = len(data)
        data = [r for r in data if r.get(id_field) != record_id]
        if len(data) < original_len:
            self.write_all(data)
            return True
        return False
    
    def find_by_field(self, field: str, value: Any) -> List[Dict[str, Any]]:
        """Find all records matching a field value."""
        data = self.read_all()
        return [r for r in data if r.get(field) == value]
    
    def upsert(self, record_id: str, record: Dict[str, Any], id_field: str = "id") -> None:
        """Insert or update a record by its ID."""
        record[id_field] = record_id
        data = self.read_all()
        for i, r in enumerate(data):
            if r.get(id_field) == record_id:
                data[i] = record
                self.write_all(data)
                return
        # Not found, append
        data.append(record)
        self.write_all(data)


# Pre-initialized fallback stores
fallback_stores = {
    "otps": JsonFallbackStore("otps.json"),
    "users": JsonFallbackStore("users.json"),
    "listings": JsonFallbackStore("listings.json"),
    "consents": JsonFallbackStore("consents.json"),
    "events_log": JsonFallbackStore("events_log.json"),
    "sync_queue": JsonFallbackStore("sync_queue.json"),
    "sent_sms": JsonFallbackStore("sent_sms.json"),
    "weather_cache": JsonFallbackStore("weather_cache.json"),
    "media": JsonFallbackStore("media.json"),
}


def get_fallback_store(name: str) -> JsonFallbackStore:
    """Get a fallback store by name, creating if needed."""
    if name not in fallback_stores:
        fallback_stores[name] = JsonFallbackStore(f"{name}.json")
    return fallback_stores[name]


# =============================================================================
# Logging Setup
# =============================================================================

def setup_logging() -> None:
    """Configure loguru logging with clean, readable output."""
    import sys
    log_path = settings.logs_path / "app.log"
    
    # Remove default handler
    logger.remove()
    
    # Clean console format - simple and readable
    console_format = (
        "<green>{time:HH:mm:ss}</green> | "
        "<level>{level: <7}</level> | "
        "<level>{message}</level>"
    )
    
    # Add console handler with clean format
    logger.add(
        sink=sys.stderr,
        format=console_format,
        level=settings.log_level,
        colorize=True,
        backtrace=False,
        diagnose=False
    )
    
    # Detailed file format for debugging
    file_format = "{time:YYYY-MM-DD HH:mm:ss} | {level: <7} | {name}:{function}:{line} - {message}"
    
    # Add file handler with rotation
    logger.add(
        sink=str(log_path),
        format=file_format,
        level="DEBUG",
        rotation="10 MB",
        retention="7 days",
        compression="zip",
        backtrace=True,
        diagnose=True
    )
    
    # Suppress noisy SQLAlchemy logs
    import logging
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)


# =============================================================================
# Response Helpers
# =============================================================================

def success_response(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """Create a standardized success response."""
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return response


def error_response(message: str, code: str = "ERROR") -> Dict[str, Any]:
    """Create a standardized error response."""
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message
        }
    }


def paginated_response(
    items: List[T],
    total: int,
    page: int,
    page_size: int = None,
    limit: int = None
) -> Dict[str, Any]:
    """Create a paginated response."""
    # Support both page_size and limit parameter names
    size = page_size if page_size is not None else (limit if limit is not None else 20)
    return {
        "success": True,
        "data": {
            "items": items,
            "pagination": {
                "total": total,
                "page": page,
                "page_size": size,
                "total_pages": (total + size - 1) // size if size > 0 else 1
            }
        }
    }
