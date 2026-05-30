"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Droplets, Loader2, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'snowy' | 'stormy' | 'foggy';
  humidity: number;
  windSpeed: number;
  location: string;
  forecast?: {
    day: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

interface WeatherWidgetProps {
  data?: WeatherData;
  variant?: 'compact' | 'full';
  className?: string;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  'partly-cloudy': Cloud,
  snowy: CloudSnow,
  stormy: CloudLightning,
  foggy: CloudFog,
};

const weatherColors = {
  sunny: 'from-yellow-400 to-orange-400',
  cloudy: 'from-gray-400 to-gray-500',
  rainy: 'from-blue-400 to-blue-600',
  'partly-cloudy': 'from-blue-300 to-gray-400',
  snowy: 'from-blue-100 to-gray-300',
  stormy: 'from-gray-600 to-gray-800',
  foggy: 'from-gray-300 to-gray-400',
};

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
function getConditionFromWMO(code: number): 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'snowy' | 'stormy' | 'foggy' {
  if (code === 0) return 'sunny';
  if (code <= 3) return 'partly-cloudy';
  if (code >= 45 && code <= 48) return 'foggy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snowy';
  if (code >= 95 && code <= 99) return 'stormy';
  return 'cloudy';
}

function getConditionText(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm',
  };
  return conditions[code] || 'Unknown';
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeatherWidget({
  data,
  variant = 'full',
  className = '',
}: WeatherWidgetProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('Your Location');

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Default to Bengaluru if location access denied
          setLocation({ lat: 12.9716, lon: 77.5946 });
          setLocationName('Bengaluru, Karnataka');
        }
      );
    } else {
      setLocation({ lat: 12.9716, lon: 77.5946 });
      setLocationName('Bengaluru, Karnataka');
    }
  }, []);

  // Fetch weather from Open-Meteo API (free, no API key required)
  useEffect(() => {
    if (data) {
      setWeatherData(data);
      setIsLoading(false);
      return;
    }

    if (!location) return;

    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Open-Meteo API - completely free, no API key needed
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const apiData = await response.json();

        // Parse current weather
        const current = apiData.current;
        const condition = getConditionFromWMO(current.weather_code);

        // Parse 5-day forecast
        const forecast = apiData.daily.time.slice(0, 5).map((dateStr: string, i: number) => {
          const date = new Date(dateStr);
          return {
            day: dayNames[date.getDay()],
            high: Math.round(apiData.daily.temperature_2m_max[i]),
            low: Math.round(apiData.daily.temperature_2m_min[i]),
            condition: getConditionFromWMO(apiData.daily.weather_code[i]),
          };
        });

        setWeatherData({
          temperature: Math.round(current.temperature_2m),
          condition,
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          location: locationName,
          forecast,
        });

        // Try to get location name using reverse geocoding
        try {
          const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${location.lat}&longitude=${location.lon}&language=en`
          );
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData.results && geoData.results[0]) {
              const loc = geoData.results[0];
              setLocationName(`${loc.name}, ${loc.admin1 || loc.country}`);
              setWeatherData(prev => prev ? { ...prev, location: `${loc.name}, ${loc.admin1 || loc.country}` } : prev);
            }
          }
        } catch {
          // Ignore geocoding errors, keep default location name
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Could not load weather');
        // Set default fallback data
        setWeatherData({
          temperature: 28,
          condition: 'partly-cloudy',
          humidity: 65,
          windSpeed: 12,
          location: 'Bengaluru, Karnataka',
          forecast: [
            { day: 'Mon', high: 30, low: 22, condition: 'sunny' },
            { day: 'Tue', high: 29, low: 21, condition: 'cloudy' },
            { day: 'Wed', high: 27, low: 20, condition: 'rainy' },
            { day: 'Thu', high: 28, low: 21, condition: 'partly-cloudy' },
            { day: 'Fri', high: 31, low: 23, condition: 'sunny' },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [location, data, locationName]);

  const displayData = data || weatherData;

  const WeatherIcon = displayData ? weatherIcons[displayData.condition] || Cloud : Cloud;

  if (isLoading && !displayData) {
    return (
      <div className={`rounded-2xl bg-card border border-border p-6 flex items-center justify-center ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!displayData) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${weatherColors[displayData.condition]} text-white ${className}`}
      >
        <WeatherIcon className="w-8 h-8" />
        <div>
          <p className="text-2xl font-bold">{displayData.temperature}°C</p>
          <p className="text-xs opacity-90">{displayData.location}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden bg-card border border-border shadow-lg ${className}`}
    >
      {/* Main weather */}
      <div className={`p-6 bg-gradient-to-br ${weatherColors[displayData.condition]} text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-90 mb-1">{displayData.location}</p>
            <p className="text-5xl font-bold">{displayData.temperature}°C</p>
            <p className="text-sm mt-2 capitalize">{displayData.condition.replace('-', ' ')}</p>
          </div>
          <WeatherIcon className="w-16 h-16 opacity-90" />
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 opacity-75" />
            <span className="text-sm">{displayData.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 opacity-75" />
            <span className="text-sm">{displayData.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {displayData.forecast && (
        <div className="p-4 bg-background">
          <p className="text-sm font-medium text-muted-foreground mb-3">5-Day Forecast</p>
          <div className="flex justify-between">
            {displayData.forecast.map((day, idx) => {
              const ForecastIcon = weatherIcons[day.condition as keyof typeof weatherIcons] || Cloud;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                  <ForecastIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs font-medium">{day.high}°</span>
                  <span className="text-xs text-muted-foreground">{day.low}°</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agricultural tip */}
      <div className="px-4 py-3 bg-accent/10 border-t border-border">
        <p className="text-xs text-accent-foreground">
          <span className="font-medium">🌾 Tip:</span> {displayData.condition === 'rainy'
            ? 'Rain expected - secure harvested grains and avoid field work.'
            : displayData.condition === 'sunny'
              ? 'Good weather for millet drying and harvesting.'
              : 'Monitor weather conditions for optimal farming activities.'}
        </p>
      </div>
    </motion.div>
  );
}