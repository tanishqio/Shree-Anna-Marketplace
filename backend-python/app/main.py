"""
Shree Anna Backend - Main FastAPI Application

A complete Python backend for the Shree Anna Millets Value Chain platform.
Supports farmers, FPOs, SHGs, and buyers with:
- Phone-based OTP authentication
- Marketplace listings for millet crops
- QR-traceable batch management
- Voice webhook integration (Reverie)
- Offline-first sync capabilities
- Weather and agricultural advisories
"""

import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger

from app.core.config import settings
from app.core.utils import setup_logging
from app.db import init_database
from app.api.v1 import api_router


# Setup logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup - Clean banner
    logger.info("=" * 50)
    logger.info("🌾 SHREE ANNA BACKEND")
    logger.info("=" * 50)
    env_mode = "🔴 PRODUCTION" if settings.is_production else "🟢 DEVELOPMENT"
    logger.info(f"Mode: {env_mode}")
    
    # Verify database connection (Supabase manages tables)
    init_database()
    
    # Create local directories
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    settings.data_path.mkdir(parents=True, exist_ok=True)
    (Path("logs")).mkdir(parents=True, exist_ok=True)
    
    logger.info("=" * 50)
    logger.info("🚀 Server ready at http://localhost:8005")
    logger.info("📚 Docs: http://localhost:8005/docs")
    logger.info("=" * 50)
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Shree Anna API",
    description="""
    🌾 **Shree Anna - Millets Value Chain Platform**
    
    A comprehensive backend for connecting farmers, FPOs, and buyers in the millets ecosystem.
    
    ## Features
    
    * **Authentication** - Phone-based OTP with JWT tokens
    * **Marketplace** - Create and browse millet crop listings
    * **Traceability** - QR-coded batch tracking from farm to consumer
    * **Voice IVR** - Reverie voice-bot integration for rural access
    * **Offline Sync** - Push/pull synchronization for mobile apps
    * **Weather** - Agricultural advisories based on local weather
    * **Payments** - Mock UPI payment integration
    
    ## Roles
    
    - **Farmer** - Create listings, receive offers
    - **FPO** - Aggregate produce, create traceable batches
    - **Buyer** - Browse marketplace, make offers
    - **Admin** - System administration
    
    ## API Versioning
    
    All endpoints are prefixed with `/api/v1`
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(",") if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes
app.include_router(api_router, prefix="/api/v1")


# Mount static files for uploads
uploads_path = settings.upload_path
if uploads_path.exists():
    app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")


# =============================================================================
# ROOT ENDPOINTS
# =============================================================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Shree Anna API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """Health check endpoint."""
    from datetime import datetime
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": "connected",
        "services": {
            "sms": "mock" if settings.use_mock_sms else "twilio",
            "weather": "mock" if settings.use_mock_weather else "openweathermap"
        }
    }


@app.get("/api/v1", tags=["Root"])
async def api_root():
    """API v1 root endpoint."""
    return {
        "version": "v1",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "listings": "/api/v1/listings",
            "offers": "/api/v1/offers",
            "orders": "/api/v1/orders",
            "batches": "/api/v1/batches",
            "fpo": "/api/v1/fpo",
            "schemes": "/api/v1/schemes",
            "weather": "/api/v1/weather",
            "payments": "/api/v1/payments",
            "notifications": "/api/v1/notifications",
            "trace": "/api/v1/trace",
            "sync": "/api/v1/sync",
            "admin": "/api/v1/admin",
            "voice": "/api/v1/voice"
        }
    }


# =============================================================================
# ERROR HANDLERS
# =============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if not settings.is_production else None
        }
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """404 handler."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "success": False,
            "error": "Not found",
            "path": str(request.url.path)
        }
    )


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=not settings.is_production,
        log_level="info"
    )
