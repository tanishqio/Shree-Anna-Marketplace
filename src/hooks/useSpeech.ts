"use client";

import { useState, useCallback, useRef } from 'react';
import { speechApi } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';

// Language mapping for Google Cloud Speech
const LANGUAGE_MAP: Record<string, string> = {
  'hi-IN': 'hi',
  'hi': 'hi',
  'en-IN': 'en',
  'en': 'en',
  'kn-IN': 'kn',
  'kn': 'kn',
  'te-IN': 'te',
  'te': 'te',
  'ta-IN': 'ta',
  'ta': 'ta',
  'mr-IN': 'mr',
  'mr': 'mr',
  'bn-IN': 'bn',
  'bn': 'bn',
  'gu-IN': 'gu',
  'gu': 'gu',
  'pa-IN': 'pa',
  'pa': 'pa',
  'ml-IN': 'ml',
  'ml': 'ml',
  'or-IN': 'or',
  'or': 'or',
};

interface TTSOptions {
  language?: string;
  gender?: 'male' | 'female';
  samplingRate?: number;
}

interface TTSResult {
  audio_base64: string;
  language: string;
  audio_format: string;
  success: boolean;
  error?: string;
}

/**
 * Hook for Text-to-Speech using Google Cloud Speech API only.
 * Supports Hindi and other Indian languages.
 * No browser fallback - requires Google Cloud configuration.
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Convert text to speech using Google Cloud TTS API.
   */
  const speak = useCallback(async (text: string, options: TTSOptions = {}) => {
    const {
      language = 'hi',
      gender = 'female',
      samplingRate = 22050,
    } = options;

    // Map language code to Google Cloud format
    const googleLang = LANGUAGE_MAP[language] || language;

    setIsLoading(true);
    setError(null);

    try {
      const result = await speechApi.tts({
          text,
          language: googleLang,
          gender,
          sampling_rate: samplingRate,
      });

      if (!result.success) {
        throw new Error('TTS failed');
      }

      // Decode base64 audio and play it
      const audioData = atob(result.audio_base64);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }

      // Use appropriate MIME type based on format (Google returns MP3)
      const mimeType = result.audio_format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
      const audioBlob = new Blob([audioArray], { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setError('Audio playback failed');
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS failed');
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Stop any ongoing speech.
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
  };
}

/**
 * Supported languages for Google Cloud TTS.
 */
export const TTS_LANGUAGES = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
];

export default useSpeech;
