"""
Shree Anna Backend - Storage Service
Handles file uploads and media management.
"""

import os
import hashlib
import shutil
import uuid
from pathlib import Path
from typing import Optional, Tuple
from datetime import datetime

from loguru import logger
from fastapi import UploadFile

from app.core.config import settings
from app.core.utils import utc_now


class StorageService:
    """
    File storage service for media uploads.
    Stores files locally in /uploads directory.
    """
    
    def __init__(self):
        self.upload_path = settings.upload_path
        # Create subdirectories
        for subdir in ["images", "audio", "documents", "temp"]:
            (self.upload_path / subdir).mkdir(parents=True, exist_ok=True)
    
    def _get_file_hash(self, content: bytes) -> str:
        """Compute SHA256 hash of file content."""
        return hashlib.sha256(content).hexdigest()
    
    def _generate_filename(
        self,
        original_name: str,
        prefix: Optional[str] = None
    ) -> str:
        """Generate a unique filename."""
        ext = Path(original_name).suffix.lower()
        unique_id = uuid.uuid4().hex[:12]
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        if prefix:
            return f"{prefix}_{timestamp}_{unique_id}{ext}"
        return f"{timestamp}_{unique_id}{ext}"
    
    def _get_subdir(self, content_type: str) -> str:
        """Determine subdirectory based on content type."""
        if content_type.startswith("image/"):
            return "images"
        elif content_type.startswith("audio/"):
            return "audio"
        elif content_type in ["application/pdf", "application/msword"]:
            return "documents"
        return "temp"
    
    async def save_upload(
        self,
        file: UploadFile,
        prefix: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Tuple[str, str, int]:
        """
        Save an uploaded file.
        
        Returns:
            Tuple of (file_path, file_hash, file_size)
        """
        content = await file.read()
        file_hash = self._get_file_hash(content)
        file_size = len(content)
        
        # Determine storage location
        content_type = file.content_type or "application/octet-stream"
        subdir = self._get_subdir(content_type)
        filename = self._generate_filename(file.filename or "upload", prefix)
        
        # Full path
        file_path = self.upload_path / subdir / filename
        
        # Write file
        with open(file_path, "wb") as f:
            f.write(content)
        
        logger.info(
            f"Saved file: {file_path} ({file_size} bytes, hash: {file_hash[:12]}...)"
        )
        
        # Return relative path for storage in DB
        relative_path = f"/{subdir}/{filename}"
        return relative_path, file_hash, file_size
    
    async def save_audio(
        self,
        file: UploadFile,
        farmer_id: str,
        consent_type: str = "consent"
    ) -> Tuple[str, str, int]:
        """
        Save audio recording (for consent or voice notes).
        """
        content = await file.read()
        file_hash = self._get_file_hash(content)
        file_size = len(content)
        
        # Generate filename with context
        ext = Path(file.filename or "audio.wav").suffix.lower() or ".wav"
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{consent_type}_{farmer_id}_{timestamp}{ext}"
        
        file_path = self.upload_path / "audio" / filename
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        logger.info(f"Saved audio: {file_path} ({file_size} bytes)")
        
        relative_path = f"/audio/{filename}"
        return relative_path, file_hash, file_size
    
    def get_file_path(self, relative_path: str) -> Optional[Path]:
        """Get the full path for a stored file."""
        if relative_path.startswith("/"):
            relative_path = relative_path[1:]
        
        full_path = self.upload_path / relative_path
        
        if full_path.exists():
            return full_path
        return None
    
    def delete_file(self, relative_path: str) -> bool:
        """Delete a stored file."""
        full_path = self.get_file_path(relative_path)
        
        if full_path and full_path.exists():
            full_path.unlink()
            logger.info(f"Deleted file: {full_path}")
            return True
        
        logger.warning(f"File not found for deletion: {relative_path}")
        return False
    
    def get_file_url(self, relative_path: str) -> str:
        """Get the URL for accessing a file."""
        # In production, this would return a CDN URL
        return f"/uploads{relative_path}"
    
    def cleanup_temp(self, max_age_hours: int = 24) -> int:
        """
        Clean up old temporary files.
        Returns count of deleted files.
        """
        temp_dir = self.upload_path / "temp"
        deleted = 0
        cutoff = datetime.now().timestamp() - (max_age_hours * 3600)
        
        for file_path in temp_dir.iterdir():
            if file_path.is_file() and file_path.stat().st_mtime < cutoff:
                file_path.unlink()
                deleted += 1
        
        if deleted:
            logger.info(f"Cleaned up {deleted} temp files")
        
        return deleted


# Global singleton
storage_service = StorageService()


async def save_file(
    file: UploadFile,
    prefix: Optional[str] = None,
    user_id: Optional[str] = None
) -> Tuple[str, str, int]:
    """Convenience function to save a file."""
    return await storage_service.save_upload(file, prefix, user_id)


async def save_audio(
    file: UploadFile,
    farmer_id: str,
    consent_type: str = "consent"
) -> Tuple[str, str, int]:
    """Convenience function to save audio."""
    return await storage_service.save_audio(file, farmer_id, consent_type)


def get_file_url(relative_path: str) -> str:
    """Get public URL for a file."""
    return storage_service.get_file_url(relative_path)


def delete_file(relative_path: str) -> bool:
    """Delete a stored file."""
    return storage_service.delete_file(relative_path)
