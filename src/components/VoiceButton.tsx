"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { speechApi } from '@/lib/api';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  language?: string;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// API URL for Google Cloud Speech-to-Text
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';

// Convert audio blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Language code mapping for Google Cloud Speech
const LANG_CODE_MAP: Record<string, string> = {
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

// Call Google Cloud Speech API for speech-to-text
async function callGoogleCloudSTT(audioBlob: Blob, language: string): Promise<string> {
  console.log('[STT Debug] Starting STT call...', { blobSize: audioBlob.size, blobType: audioBlob.type });
  const base64Audio = await blobToBase64(audioBlob);
  console.log('[STT Debug] Audio converted to base64, length:', base64Audio.length);

  const googleLang = LANG_CODE_MAP[language] || 'hi';

  // Determine format from blob type
  const mimeType = audioBlob.type;
  const format = mimeType.includes('webm') ? 'webm' :
    mimeType.includes('mp4') ? 'mp4' :
      mimeType.includes('wav') ? 'wav' : 'webm';

  console.log('[STT Debug] Calling speechApi.stt with:', { language: googleLang, format, sampling_rate: 48000 });

  const result = await speechApi.stt({
    audio_base64: base64Audio,
    language: googleLang,
    audio_format: format,
    sampling_rate: 48000,
  });

  console.log('[STT Debug] STT API result:', result);

  if (!result.success) {
    throw new Error(result.error || 'STT failed');
  }

  return result.text;
}

export function VoiceButton({
  onTranscript,
  onRecordingStart,
  onRecordingEnd,
  language = 'hi-IN',
  placeholder = 'Tap to speak',
  className = '',
  size = 'lg',
}: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Start recording using MediaRecorder for Google Cloud STT
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check supported mime types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'; // Fallback
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        setIsProcessing(true);

        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const text = await callGoogleCloudSTT(audioBlob, language);

          if (text) {
            setTranscript(text);
            onTranscript(text);
          } else {
            setTranscript('No speech detected. Please try again.');
          }
        } catch (err) {
          console.error('Google Cloud STT error:', err);
          const errorMsg = err instanceof Error ? err.message : 'Speech recognition failed';
          setError(errorMsg);
          setTranscript('Could not recognize speech. Please try again.');
        } finally {
          setIsProcessing(false);
          onRecordingEnd?.();
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      setIsRecording(true);
      setTranscript('');
      onRecordingStart?.();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
      alert('Could not access microphone. Please check permissions.');
    }
  }, [language, onRecordingStart, onRecordingEnd, onTranscript]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Main button */}
      <motion.button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`
          ${sizeClasses[size]} 
          rounded-full flex items-center justify-center
          transition-all duration-300 touch-target
          ${isRecording
            ? 'bg-destructive text-white voice-recording'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }
          ${isProcessing ? 'opacity-70 cursor-wait' : ''}
          shadow-lg hover:shadow-xl
        `}
        whileTap={{ scale: 0.95 }}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Loader2 className={`${iconSizes[size]} animate-spin`} />
            </motion.div>
          ) : isRecording ? (
            <motion.div
              key="stop"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Square className={iconSizes[size]} />
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Mic className={iconSizes[size]} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Waveform animation */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-1"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              animate={{
                height: [8, 24, 8],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Transcript display */}
      <AnimatePresence>
        {(transcript || error || !isRecording) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center text-sm max-w-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {transcript || error || placeholder}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
