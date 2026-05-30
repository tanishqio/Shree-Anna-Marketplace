"""
Shree Anna Backend - Weather API Routes
Weather data with caching and agricultural advisories.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from loguru import logger

from app.core.security import get_current_user, get_optional_user
from app.db import get_session, User
from app.services import get_weather, get_weather_for_user


router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/")
async def get_current_weather(
    district: Optional[str] = Query(None, description="District name"),
    current_user: Optional[User] = Depends(get_optional_user),
    session: Session = Depends(get_session)
):
    """
    Get current weather and advisory.
    Uses user's district if not specified.
    """
    # Determine district
    target_district = district
    
    if not target_district and current_user:
        target_district = current_user.district
    
    if not target_district:
        target_district = "default"
    
    # Get weather
    weather = await get_weather(target_district.lower().strip())
    
    return weather


@router.get("/advisory")
async def get_weather_advisory(
    district: Optional[str] = Query(None),
    crop: Optional[str] = Query(None, description="Specific crop for advisory"),
    current_user: Optional[User] = Depends(get_optional_user),
    session: Session = Depends(get_session)
):
    """
    Get agricultural advisory based on weather.
    """
    target_district = district
    if not target_district and current_user:
        target_district = current_user.district
    if not target_district:
        target_district = "default"
    
    weather = await get_weather(target_district.lower().strip())
    
    advisory = weather.get("advisory", {})
    
    # If specific crop requested, highlight that
    if crop and crop.lower() in advisory.get("crop_specific", {}):
        advisory["highlighted_crop"] = {
            "crop": crop,
            "advice": advisory["crop_specific"][crop.lower()]
        }
    
    return {
        "district": target_district,
        "current_conditions": weather.get("current", {}),
        "advisory": advisory,
        "fetched_at": weather.get("fetched_at")
    }


# Pincode to district mapping (sample for Karnataka)
PINCODE_DISTRICT_MAP = {
    "560001": "bangalore",
    "560002": "bangalore",
    "560003": "bangalore",
    "560004": "bangalore",
    "560005": "bangalore",
    "560006": "bangalore",
    "560078": "bangalore rural",
    "562110": "bangalore rural",
    "571401": "mandya",
    "571402": "mandya",
    "570001": "mysore",
    "570002": "mysore",
    "577001": "davangere",
    "577002": "davangere",
    "580001": "dharwad",
    "580002": "dharwad",
    "585101": "gulbarga",
    "585102": "gulbarga",
    "590001": "belgaum",
    "590002": "belgaum",
}


@router.get("/pincode/{pincode}")
async def get_weather_by_pincode(
    pincode: str,
    current_user: Optional[User] = Depends(get_optional_user),
    session: Session = Depends(get_session)
):
    """
    Get weather for a specific pincode.
    Maps pincode to nearest district for weather data.
    """
    # Look up district from pincode
    district = PINCODE_DISTRICT_MAP.get(pincode)
    
    if not district:
        # Try to match first 3 digits for general area
        prefix = pincode[:3] if len(pincode) >= 3 else pincode
        for pin, dist in PINCODE_DISTRICT_MAP.items():
            if pin.startswith(prefix):
                district = dist
                break
    
    if not district:
        district = "default"
    
    weather = await get_weather(district.lower().strip())
    
    return {
        "pincode": pincode,
        "district": district,
        "current": weather.get("current", {}),
        "advisory": weather.get("advisory", {}),
        "fetched_at": weather.get("fetched_at")
    }


@router.get("/forecast")
async def get_weather_forecast(
    district: Optional[str] = Query(None),
    days: int = Query(3, ge=1, le=7),
    current_user: Optional[User] = Depends(get_optional_user),
    session: Session = Depends(get_session)
):
    """
    Get weather forecast for next few days.
    """
    target_district = district
    if not target_district and current_user:
        target_district = current_user.district
    if not target_district:
        target_district = "default"
    
    weather = await get_weather(target_district.lower().strip())
    
    return {
        "district": target_district,
        "forecast": weather.get("forecast", [])[:days * 8],  # 3-hour intervals
        "fetched_at": weather.get("fetched_at")
    }


@router.post("/refresh")
async def refresh_weather(
    district: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Force refresh weather cache for a district.
    """
    weather = await get_weather(district.lower().strip(), force_refresh=True)
    
    logger.info(f"Weather cache refreshed for {district} by {current_user.id}")
    
    return {
        "message": "Weather data refreshed",
        "district": district,
        "current": weather.get("current", {}),
        "fetched_at": weather.get("fetched_at")
    }


@router.get("/districts")
async def get_supported_districts():
    """
    Get list of supported districts for weather data.
    """
    from app.services.weather_cache import weather_service
    
    districts = list(weather_service.district_coords.keys())
    districts.remove("default")
    
    return {
        "districts": sorted(districts),
        "count": len(districts)
    }
