"""
Shree Anna Backend - Weather Cache Service
Fetches and caches weather data with fallback.
"""

import json
from datetime import datetime, timedelta
from typing import Dict, Optional, List

import httpx
from loguru import logger

from app.core.config import settings
from app.core.utils import utc_now, get_fallback_store


class WeatherService:
    """
    Weather service with caching and fallback.
    Uses Open-Meteo API (free, no API key required) or mock data.
    """
    
    def __init__(self):
        self.api_key = settings.weather_api_key
        self.use_mock = settings.use_mock_weather
        self.base_url = "https://api.open-meteo.com/v1"
        self.cache_ttl_minutes = 10
        
        # Weather code to description mapping (WMO codes)
        self.weather_codes = {
            0: ("साफ आसमान", "Clear sky", "01d"),
            1: ("मुख्यतः साफ", "Mainly clear", "02d"),
            2: ("आंशिक बादल", "Partly cloudy", "03d"),
            3: ("बादल छाए", "Overcast", "04d"),
            45: ("कोहरा", "Fog", "50d"),
            48: ("जमा हुआ कोहरा", "Depositing rime fog", "50d"),
            51: ("हल्की बूंदाबांदी", "Light drizzle", "09d"),
            53: ("मध्यम बूंदाबांदी", "Moderate drizzle", "09d"),
            55: ("घनी बूंदाबांदी", "Dense drizzle", "09d"),
            61: ("हल्की बारिश", "Slight rain", "10d"),
            63: ("मध्यम बारिश", "Moderate rain", "10d"),
            65: ("भारी बारिश", "Heavy rain", "10d"),
            80: ("हल्की बौछार", "Slight showers", "09d"),
            81: ("मध्यम बौछार", "Moderate showers", "09d"),
            82: ("भारी बौछार", "Violent showers", "09d"),
            95: ("गरज के साथ बारिश", "Thunderstorm", "11d"),
        }
        
        # District to coordinates mapping (sample for major millet-growing areas)
        self.district_coords: Dict[str, Dict] = {
            # Karnataka
            "tumkur": {"lat": 13.34, "lon": 77.10},
            "raichur": {"lat": 16.20, "lon": 77.35},
            "bellary": {"lat": 15.15, "lon": 76.93},
            "chitradurga": {"lat": 14.23, "lon": 76.40},
            # Rajasthan
            "jodhpur": {"lat": 26.29, "lon": 73.02},
            "barmer": {"lat": 25.75, "lon": 71.39},
            "jaisalmer": {"lat": 26.91, "lon": 70.90},
            # Madhya Pradesh
            "dindori": {"lat": 22.95, "lon": 81.07},
            "mandla": {"lat": 22.60, "lon": 80.38},
            "balaghat": {"lat": 21.81, "lon": 80.19},
            # Maharashtra
            "ahmednagar": {"lat": 19.08, "lon": 74.73},
            "nashik": {"lat": 19.99, "lon": 73.78},
            "solapur": {"lat": 17.66, "lon": 75.90},
            # Andhra Pradesh / Telangana
            "anantapur": {"lat": 14.68, "lon": 77.60},
            "kurnool": {"lat": 15.83, "lon": 78.04},
            "mahbubnagar": {"lat": 16.73, "lon": 78.00},
            # Default
            "default": {"lat": 20.59, "lon": 78.96}  # Center of India
        }
    
    async def get_weather(
        self,
        district: str,
        force_refresh: bool = False
    ) -> Dict:
        """
        Get weather data for a district.
        Returns cached data if available and fresh.
        """
        district_key = district.lower().strip()
        
        # Check cache first
        if not force_refresh:
            cached = self._get_cached(district_key)
            if cached:
                logger.debug(f"Weather cache hit for {district_key}")
                return cached
        
        # Fetch fresh data
        if self.use_mock:
            weather = self._get_mock_weather(district_key)
        else:
            weather = await self._fetch_weather(district_key)
        
        # Cache the result
        self._set_cached(district_key, weather)
        
        return weather
    
    async def _fetch_weather(self, district: str) -> Dict:
        """Fetch weather from Open-Meteo API (free, no API key required)."""
        coords = self.district_coords.get(district, self.district_coords["default"])
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Open-Meteo API - current weather and forecast
                url = f"{self.base_url}/forecast"
                response = await client.get(
                    url,
                    params={
                        "latitude": coords["lat"],
                        "longitude": coords["lon"],
                        "current_weather": "true",
                        "hourly": "temperature_2m,relativehumidity_2m,precipitation_probability,weathercode",
                        "forecast_days": 1,
                        "timezone": "Asia/Kolkata"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                return self._format_open_meteo_response(district, data)
        
        except Exception as e:
            logger.error(f"Weather API error for {district}: {e}")
            # Fallback to mock
            return self._get_mock_weather(district)
    
    def _format_open_meteo_response(self, district: str, data: Dict) -> Dict:
        """Format Open-Meteo API response to our standard format."""
        current = data.get("current_weather", {})
        hourly = data.get("hourly", {})
        
        # Get weather description from code
        weather_code = current.get("weathercode", 0)
        weather_info = self.weather_codes.get(weather_code, ("अज्ञात", "Unknown", "01d"))
        
        # Get humidity from hourly data (first entry)
        humidity = hourly.get("relativehumidity_2m", [50])[0] if hourly.get("relativehumidity_2m") else 50
        
        # Parse forecast for next few hours
        daily_forecast = []
        temps = hourly.get("temperature_2m", [])
        humidities = hourly.get("relativehumidity_2m", [])
        rain_probs = hourly.get("precipitation_probability", [])
        codes = hourly.get("weathercode", [])
        times = hourly.get("time", [])
        
        for i in range(min(4, len(temps))):
            code = codes[i] if i < len(codes) else 0
            desc = self.weather_codes.get(code, ("", "Unknown", "01d"))
            daily_forecast.append({
                "time": times[i] if i < len(times) else "",
                "temp": temps[i] if i < len(temps) else None,
                "description": desc[1],
                "rain_chance": rain_probs[i] if i < len(rain_probs) else 0
            })
        
        # Create mock main/weather for advisory generation
        main = {"temp": current.get("temperature"), "humidity": humidity}
        weather_obj = {"description": weather_info[1]}
        wind = {"speed": current.get("windspeed", 0)}
        
        advisory = self._generate_advisory(main, weather_obj, wind)
        
        return {
            "district": district,
            "current": {
                "temp": current.get("temperature"),
                "feels_like": current.get("temperature"),  # Open-Meteo doesn't provide feels_like
                "humidity": humidity,
                "description": weather_info[0],  # Hindi description
                "description_en": weather_info[1],  # English description
                "icon": weather_info[2],
                "wind_speed": current.get("windspeed"),
                "wind_direction": current.get("winddirection")
            },
            "forecast": daily_forecast,
            "advisory": advisory,
            "fetched_at": utc_now().isoformat(),
            "cached": False
        }
    
    def _format_weather_response(
        self,
        district: str,
        current: Dict,
        forecast: Dict
    ) -> Dict:
        """Format API response to our standard format."""
        main = current.get("main", {})
        weather_info = current.get("weather", [{}])[0]
        wind = current.get("wind", {})
        
        # Parse forecast for daily summary
        daily_forecast = []
        if "list" in forecast:
            for item in forecast["list"][:4]:  # Next 12 hours
                daily_forecast.append({
                    "time": item.get("dt_txt", ""),
                    "temp": item.get("main", {}).get("temp"),
                    "description": item.get("weather", [{}])[0].get("description", ""),
                    "rain_chance": item.get("pop", 0) * 100
                })
        
        # Agricultural advisory based on conditions
        advisory = self._generate_advisory(main, weather_info, wind)
        
        return {
            "district": district,
            "current": {
                "temp": main.get("temp"),
                "feels_like": main.get("feels_like"),
                "humidity": main.get("humidity"),
                "description": weather_info.get("description", ""),
                "icon": weather_info.get("icon", ""),
                "wind_speed": wind.get("speed"),
                "wind_direction": wind.get("deg")
            },
            "forecast": daily_forecast,
            "advisory": advisory,
            "fetched_at": utc_now().isoformat(),
            "cached": False
        }
    
    def _get_mock_weather(self, district: str) -> Dict:
        """Generate mock weather data."""
        import random
        
        conditions = [
            {"description": "साफ आसमान", "icon": "01d", "temp_range": (28, 35)},
            {"description": "हल्के बादल", "icon": "02d", "temp_range": (26, 32)},
            {"description": "बादल छाए", "icon": "03d", "temp_range": (24, 30)},
            {"description": "हल्की बारिश", "icon": "10d", "temp_range": (22, 28)},
        ]
        
        condition = random.choice(conditions)
        temp = random.uniform(*condition["temp_range"])
        humidity = random.randint(40, 80)
        wind_speed = random.uniform(2, 8)
        
        return {
            "district": district,
            "current": {
                "temp": round(temp, 1),
                "feels_like": round(temp + random.uniform(-2, 2), 1),
                "humidity": humidity,
                "description": condition["description"],
                "icon": condition["icon"],
                "wind_speed": round(wind_speed, 1),
                "wind_direction": random.randint(0, 360)
            },
            "forecast": [
                {
                    "time": (datetime.now() + timedelta(hours=i*3)).strftime("%Y-%m-%d %H:%M"),
                    "temp": round(temp + random.uniform(-3, 3), 1),
                    "description": condition["description"],
                    "rain_chance": random.randint(0, 30) if "बारिश" not in condition["description"] else random.randint(40, 80)
                }
                for i in range(4)
            ],
            "advisory": self._get_mock_advisory(condition["description"], humidity),
            "fetched_at": utc_now().isoformat(),
            "cached": False,
            "mock": True
        }
    
    def _generate_advisory(
        self,
        main: Dict,
        weather: Dict,
        wind: Dict
    ) -> Dict:
        """Generate agricultural advisory based on weather."""
        temp = main.get("temp", 30)
        humidity = main.get("humidity", 50)
        description = weather.get("description", "").lower()
        
        alerts = []
        recommendations = []
        
        # Temperature alerts
        if temp > 40:
            alerts.append("अत्यधिक गर्मी - फसल को छाया दें")
        elif temp > 35:
            recommendations.append("सिंचाई सुबह या शाम करें")
        
        # Humidity
        if humidity > 80:
            alerts.append("उच्च नमी - कीट/रोग की जांच करें")
        elif humidity < 30:
            recommendations.append("सिंचाई की आवश्यकता हो सकती है")
        
        # Rain
        if "rain" in description or "बारिश" in description:
            recommendations.append("स्प्रे न करें, बारिश के बाद करें")
            recommendations.append("जल निकासी की व्यवस्था जांचें")
        
        # Wind
        wind_speed = wind.get("speed", 0)
        if wind_speed > 10:
            recommendations.append("तेज हवा - स्प्रे न करें")
        
        # Default for millets
        recommendations.append("बाजरा/रागी: नियमित निराई करें")
        
        return {
            "alerts": alerts,
            "recommendations": recommendations,
            "crop_specific": {
                "ragi": "अच्छी वृद्धि के लिए उपयुक्त मौसम",
                "bajra": "सिंचाई समय पर करें",
                "jowar": "कीट नियंत्रण की जांच करें"
            }
        }
    
    def _get_mock_advisory(self, description: str, humidity: int) -> Dict:
        """Generate mock advisory."""
        alerts = []
        recommendations = [
            "बाजरा/रागी: नियमित निराई करें",
            "फसल की नियमित निगरानी करें"
        ]
        
        if "बारिश" in description:
            recommendations.insert(0, "बारिश के बाद स्प्रे करें")
        
        if humidity > 70:
            alerts.append("उच्च नमी - रोग की जांच करें")
        
        return {
            "alerts": alerts,
            "recommendations": recommendations,
            "crop_specific": {
                "ragi": "अच्छी वृद्धि के लिए उपयुक्त",
                "bajra": "सिंचाई आवश्यकतानुसार",
                "jowar": "सामान्य देखभाल जारी रखें"
            }
        }
    
    def _get_cached(self, district: str) -> Optional[Dict]:
        """Get cached weather data."""
        store = get_fallback_store("weather_cache")
        cached = store.get_by_id(district)
        
        if cached:
            # Check if still valid
            fetched_at = cached.get("fetched_at", "")
            if fetched_at:
                try:
                    fetched_time = datetime.fromisoformat(fetched_at.replace("Z", "+00:00"))
                    if utc_now() - fetched_time < timedelta(minutes=self.cache_ttl_minutes):
                        cached["cached"] = True
                        return cached
                except Exception:
                    pass
        
        return None
    
    def _set_cached(self, district: str, data: Dict) -> None:
        """Cache weather data."""
        store = get_fallback_store("weather_cache")
        data["id"] = district  # For lookup
        store.upsert(district, data)


# Global singleton
weather_service = WeatherService()


async def get_weather(district: str, force_refresh: bool = False) -> Dict:
    """Get weather for a district."""
    return await weather_service.get_weather(district, force_refresh)


async def get_weather_for_user(user_district: Optional[str] = None) -> Dict:
    """Get weather for user's district."""
    district = user_district or "default"
    return await weather_service.get_weather(district)
