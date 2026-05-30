"use client";

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/lib/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { speechApi } from '@/lib/api';

interface SpeakButtonProps {
  text: string;
  textHi?: string;
  textKn?: string;
  textTe?: string;
  textTa?: string;
  textMr?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
  gender?: 'male' | 'female';
}

// Labels for the button in each language
const labels: Record<Language, { listen: string; stop: string }> = {
  en: { listen: 'Listen', stop: 'Stop' },
  hi: { listen: 'सुनें', stop: 'रुकें' },
  kn: { listen: 'ಕೇಳಿ', stop: 'ನಿಲ್ಲಿಸಿ' },
  te: { listen: 'వినండి', stop: 'ఆపు' },
  ta: { listen: 'கேளுங்கள்', stop: 'நிறுத்து' },
  mr: { listen: 'ऐका', stop: 'थांबा' },
};

// Language code mapping for Google Cloud Speech
const langCodeMap: Record<Language, string> = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  te: 'te',
  ta: 'ta',
  mr: 'mr',
};

export function SpeakButton({
  text,
  textHi,
  textKn,
  textTe,
  textTa,
  textMr,
  className,
  size = 'md',
  variant = 'outline',
  showLabel = false,
  gender = 'female',
}: SpeakButtonProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getTextForLanguage = () => {
    switch (language) {
      case 'hi': return textHi || text;
      case 'kn': return textKn || text;
      case 'te': return textTe || text;
      case 'ta': return textTa || text;
      case 'mr': return textMr || text;
      default: return text;
    }
  };

  const speakWithGoogle = async (textToSpeak: string) => {
    // Stop any current audio first
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await speechApi.tts({
          text: textToSpeak,
          language: langCodeMap[language] || 'hi',
          gender,
          sampling_rate: 22050,
      });
      if (!result.success) throw new Error('TTS failed');

      // Decode base64 audio
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
      console.error('TTS Error:', err);
      setError('Failed to play audio');
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const textToSpeak = getTextForLanguage();
      speakWithGoogle(textToSpeak);
    }
  };

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const label = labels[language] || labels.en;

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all',
          isSpeaking 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted hover:bg-muted/80',
          isLoading && 'opacity-70 cursor-wait',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSpeaking ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {isLoading ? '...' : isSpeaking ? label.stop : label.listen}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        !showLabel && 'w-10',
        'rounded-full transition-all',
        isSpeaking && 'bg-primary text-primary-foreground animate-pulse',
        isLoading && 'opacity-70',
        className
      )}
      title={isLoading ? 'Loading...' : isSpeaking ? label.stop : label.listen}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : isSpeaking ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </Button>
  );
}
