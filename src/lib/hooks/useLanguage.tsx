"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { speechApi } from '@/lib/api';

export type Language = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  speak: (text: string, lang?: Language) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  isLoadingAudio: boolean;
  ttsError: string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// API URL for Google Cloud TTS
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';

// Language code mapping for Google Cloud Speech
const LANG_CODE_MAP: Record<Language, string> = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  te: 'te',
  ta: 'ta',
  mr: 'mr',
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shreeanna_language') as Language;
      if (saved && ['en', 'hi', 'kn', 'te', 'ta', 'mr'].includes(saved)) {
        setLanguageState(saved);
      }
    }
  }, []);

  // Save language to localStorage when changed
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shreeanna_language', lang);
    }
  }, []);

  // Text-to-Speech function using Google Cloud TTS API (no browser fallback)
  const speak = useCallback(async (text: string, lang?: Language) => {
    const targetLang = lang || language;

    // Stop any ongoing speech
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsSpeaking(false);
    setIsLoadingAudio(true);
    setTtsError(null);

    try {
      const result = await speechApi.tts({
          text,
          language: LANG_CODE_MAP[targetLang],
          gender: 'female',
          sampling_rate: 22050,
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

      const mimeType = result.audio_format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
      const audioBlob = new Blob([audioArray], { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoadingAudio(false);
      };
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setTtsError('Audio playback failed');
      };

      await audio.play();
    } catch (error) {
      console.error('Google Cloud TTS error:', error);
      setIsSpeaking(false);
      setIsLoadingAudio(false);
      setTtsError(error instanceof Error ? error.message : 'TTS failed');
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    // Stop Google Cloud audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  }, []);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      speak, 
      stopSpeaking, 
      isSpeaking,
      isLoadingAudio,
      ttsError
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
