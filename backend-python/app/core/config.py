"""
Shree Anna Backend - Configuration Module
Loads environment variables and provides typed settings.
"""

from functools import lru_cache
import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Server
    env: str = "development"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = int(os.environ.get("PORT", 8005))  # Render provides PORT env var

    # Database - Use Supabase PostgreSQL in production, SQLite for local dev
    # Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
    # Get your password from: Supabase Dashboard → Project Settings → Database → Connection String
    database_url: str = os.environ.get("DATABASE_URL", "sqlite:///./shreeanna.db")  # Override with PostgreSQL URL in production
    
    # Supabase (optional - for direct API access)
    supabase_url: str = ""  # Set via SUPABASE_URL env var
    supabase_anon_key: str = ""  # Set via SUPABASE_ANON_KEY env var

    # JWT Authentication
    jwt_secret_key: str = ""  # Set via JWT_SECRET_KEY env var - must be 32+ chars
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_days: int = 7

    # Security
    payload_salt: str = ""  # Set via PAYLOAD_SALT env var
    server_signing_key: str = ""  # Set via SERVER_SIGNING_KEY env var - must be 32+ chars

    # Twilio SMS
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None

    # OpenWeatherMap
    openweather_api_key: Optional[str] = None

    # Reverie Voice Bot
    reverie_webhook_secret: str = "reverie-webhook-secret-change-me"
    reverie_api_key: Optional[str] = None
    reverie_api_secret: Optional[str] = None

    # Weather API
    weather_api_key: Optional[str] = None

    # Google Cloud Speech (STT/TTS)
    # Set GOOGLE_APPLICATION_CREDENTIALS env var to service account JSON path
    # OR use google_cloud_api_key for API key auth
    google_application_credentials: Optional[str] = None  # Set via GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON)
    google_cloud_api_key: Optional[str] = None

    # File Storage
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 10

    # CORS
    cors_origins: str = "*"

    # Rate Limiting
    otp_rate_limit_per_hour: int = 3
    api_rate_limit_per_minute: int = 60

    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/app.log"

    @property
    def is_production(self) -> bool:
        return self.env == "production"

    @property
    def is_development(self) -> bool:
        return self.env == "development"

    @property
    def use_mock_sms(self) -> bool:
        """Use mock SMS if Twilio credentials not provided."""
        return not all([self.twilio_account_sid, self.twilio_auth_token, self.twilio_phone_number])

    @property
    def use_mock_weather(self) -> bool:
        """Use mock weather if weather API key not provided."""
        return not self.weather_api_key

    @property
    def is_cloud_platform(self) -> bool:
        """Check if running on a cloud platform with ephemeral storage."""
        return bool(os.environ.get("VERCEL") or os.environ.get("RENDER"))

    @property
    def upload_path(self) -> Path:
        """Get upload directory as Path object."""
        # Use /tmp on Vercel/Render (ephemeral file system)
        if self.is_cloud_platform:
            path = Path("/tmp/uploads")
        else:
            path = Path(self.upload_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def data_path(self) -> Path:
        """Get data directory for JSON fallback storage."""
        # Use /tmp on Vercel/Render
        if self.is_cloud_platform:
            path = Path("/tmp/data")
        else:
            path = Path("./data")
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def logs_path(self) -> Path:
        """Get logs directory."""
        # Use /tmp on Vercel/Render
        if self.is_cloud_platform:
            path = Path("/tmp/logs")
        else:
            path = Path("./logs")
        path.mkdir(parents=True, exist_ok=True)
        return path

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Convenience export
settings = get_settings()
