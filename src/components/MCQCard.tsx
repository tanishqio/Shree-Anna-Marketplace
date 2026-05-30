"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Volume2, Loader2 } from 'lucide-react';
import { VoiceButton } from './VoiceButton';
import { speechApi } from '@/lib/api';

// Language code mapping for Google Cloud Speech
const LANG_CODE_MAP: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  te: 'te',
  ta: 'ta',
  mr: 'mr',
};

export interface MCQOption {
  id: string;
  label: string;
  labelHi?: string;
  labelKn?: string;
  labelTe?: string;
  labelTa?: string;
  labelMr?: string;
  icon?: React.ReactNode;
  image?: string;
  description?: string;
  className?: string;
}

interface MCQCardProps {
  question: string;
  questionHi?: string;
  questionAudio?: string;
  options: MCQOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  showVoiceInput?: boolean;
  onVoiceInput?: (text: string) => void;
  voicePlaceholder?: string;
  language?: 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr';
  columns?: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MCQCard({
  question,
  questionHi,
  questionAudio,
  options,
  value,
  onChange,
  multiSelect = false,
  showVoiceInput = false,
  onVoiceInput,
  voicePlaceholder = "Speak your answer",
  language = 'en',
  columns = 2,
  size = 'lg',
  className = '',
}: MCQCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const isSelected = (optionId: string) => selectedValues.includes(optionId);

  const handleSelect = (optionId: string) => {
    if (optionId === 'other') {
      setShowOtherInput(true);
      return;
    }

    if (multiSelect) {
      const newValues = isSelected(optionId)
        ? selectedValues.filter((v) => v !== optionId)
        : [...selectedValues, optionId];
      onChange(newValues);
    } else {
      onChange(optionId);
    }
  };

  // Play question using Google Cloud TTS
  const playQuestion = async () => {
    // Stop any ongoing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);

    try {
      const text = language === 'hi' && questionHi ? questionHi : question;
      const googleLang = LANG_CODE_MAP[language] || 'en';

      const result = await speechApi.tts({
        text,
        language: googleLang,
        gender: 'female',
      });

      if (!result.success) {
        throw new Error(result.error || 'TTS failed');
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
        setIsPlaying(true);
        setIsLoading(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error('Google Cloud TTS error:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: 'p-2 sm:p-3 text-xs sm:text-sm',
    md: 'p-3 sm:p-4 text-sm sm:text-base',
    lg: 'p-3 sm:p-4 md:p-5 text-base sm:text-lg min-h-[60px] sm:min-h-[70px] md:min-h-[80px]',
  };

  const iconSizes = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  };

  const getOptionLabel = (option: MCQOption) => {
    switch (language) {
      case 'hi':
        return option.labelHi || option.label;
      case 'kn':
        return option.labelKn || option.label;
      case 'te':
        return option.labelTe || option.label;
      case 'ta':
        return option.labelTa || option.label;
      case 'mr':
        return option.labelMr || option.label;
      default:
        return option.label;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Question with audio button */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={playQuestion}
          disabled={isLoading}
          className={`shrink-0 p-3 rounded-full transition-all touch-target ${isPlaying
            ? 'bg-primary text-primary-foreground voice-recording'
            : isLoading
              ? 'bg-primary/50 text-primary-foreground cursor-wait'
              : 'bg-primary/10 hover:bg-primary/20 text-primary'
            }`}
          aria-label="Play question audio"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold font-heading leading-tight">
            {language === 'hi' && questionHi ? questionHi : question}
          </h3>
          {language === 'hi' && questionHi && (
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">{question}</p>
          )}
        </div>
      </div>

      {/* Options grid */}
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {options.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            whileTap={{ scale: 0.98 }}
            className={`
              ${sizeClasses[size]}
              rounded-xl border-2 transition-all text-left
              touch-target flex items-center gap-3 relative
              ${isSelected(option.id)
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
              }
              ${option.className || ''}
            `}
            aria-pressed={isSelected(option.id)}
          >
            {/* Selection indicator */}
            <AnimatePresence>
              {isSelected(option.id) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon or Image */}
            {option.icon && (
              <div className={`${iconSizes[size]} shrink-0 rounded-lg bg-muted flex items-center justify-center ${option.className ? 'w-full h-auto bg-transparent' : ''}`}>
                {option.icon}
              </div>
            )}
            {option.image && (
              <div className={`${iconSizes[size]} shrink-0 rounded-lg overflow-hidden`}>
                <img
                  src={option.image}
                  alt={option.label}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Label */}
            <div className="flex-1 min-w-0 z-0">
              <p className="font-medium text-sm sm:text-base">{getOptionLabel(option)}</p>
              {option.description && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Voice input for "Other" option */}
      <AnimatePresence>
        {(showOtherInput || showVoiceInput) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className="bg-muted/50 rounded-xl p-4 border-2 border-dashed border-primary/30">
              <p className="text-sm text-muted-foreground mb-3 text-center">
                {voicePlaceholder}
              </p>
              <div className="flex justify-center">
                <VoiceButton
                  onTranscript={(text) => {
                    onVoiceInput?.(text);
                    setShowOtherInput(false);
                  }}
                  placeholder="Tap and speak..."
                  size="lg"
                  language={language === 'hi' ? 'hi-IN' : 'en-IN'}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-select hint */}
      {multiSelect && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          You can select multiple options
        </p>
      )}
    </div>
  );
}
