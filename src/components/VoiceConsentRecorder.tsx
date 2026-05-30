"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Check, Shield, Phone, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VoiceConsentRecorderProps {
  onConsentRecorded: (consent: ConsentData) => void;
  consentType: 'sell' | 'accept' | 'delegate' | 'withdraw';
  contextData?: {
    listingId?: string;
    offerId?: string;
    buyerName?: string;
    amount?: number;
    quantity?: number;
  };
  farmerPhone?: string;
  proxyId?: string;
  language?: string;
  className?: string;
}

export interface ConsentData {
  audioUrl: string;
  audioBlob?: Blob;
  transcription: string;
  otpVerified: boolean;
  timestamp: Date;
  consentType: string;
  contextData: Record<string, unknown>;
  proxyId?: string;
  phoneLastFour?: string;
}

interface ConsentHistoryItem {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  audioUrl: string;
  otpVerified: boolean;
  actor: string;
  actorType: 'farmer' | 'shg' | 'fpo';
  contextData?: Record<string, unknown>;
}

// Component for recording voice consent with OTP verification
export function VoiceConsentRecorder({
  onConsentRecorded,
  consentType,
  contextData = {},
  farmerPhone = '',
  proxyId,
  language = 'hi-IN',
  className = '',
}: VoiceConsentRecorderProps) {
  const [step, setStep] = useState<'record' | 'verify' | 'confirm'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const consentMessages = {
    sell: {
      en: 'I agree to sell my produce as described in the listing',
      hi: 'मैं अपनी फसल को लिस्टिंग के अनुसार बेचने के लिए सहमत हूं',
    },
    accept: {
      en: `I accept the offer of ₹${contextData.amount} from ${contextData.buyerName}`,
      hi: `मैं ${contextData.buyerName} की ₹${contextData.amount} की पेशकश स्वीकार करता/करती हूं`,
    },
    delegate: {
      en: 'I authorize the SHG/FPO to act on my behalf',
      hi: 'मैं SHG/FPO को अपनी ओर से कार्य करने का अधिकार देता/देती हूं',
    },
    withdraw: {
      en: 'I withdraw my previous consent',
      hi: 'मैं अपनी पिछली सहमति वापस लेता/लेती हूं',
    },
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Could not access microphone. Please allow microphone access.');
      console.error('Recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const sendOTP = async () => {
    // Simulate OTP sending
    setOtpSent(true);
    setCountdown(30);
    // In production: POST to /api/otp/send with phone number
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every((digit) => digit) && newOtp.join('').length === 4) {
      verifyOTP(newOtp.join(''));
    }
  };

  const verifyOTP = async (otpCode: string) => {
    // Simulate OTP verification
    // In production: POST to /api/otp/verify
    if (otpCode === '1234') {
      setOtpVerified(true);
      setStep('confirm');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const confirmConsent = () => {
    if (audioUrl && otpVerified) {
      const consent: ConsentData = {
        audioUrl,
        audioBlob: audioBlob || undefined,
        transcription,
        otpVerified: true,
        timestamp: new Date(),
        consentType,
        contextData,
        proxyId,
        phoneLastFour: farmerPhone.slice(-4),
      };
      onConsentRecorded(consent);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setTranscription('');
    setStep('record');
  };

  return (
    <div className={`bg-card rounded-2xl border border-border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg">Voice Consent Required</h3>
          <p className="text-sm text-muted-foreground">
            Record your consent and verify with OTP
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['record', 'verify', 'confirm'].map((s, idx) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : idx < ['record', 'verify', 'confirm'].indexOf(step)
                  ? 'bg-accent text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < ['record', 'verify', 'confirm'].indexOf(step) ? (
                <Check className="w-4 h-4" />
              ) : (
                idx + 1
              )}
            </div>
            {idx < 2 && (
              <div
                className={`flex-1 h-1 ${
                  idx < ['record', 'verify', 'confirm'].indexOf(step)
                    ? 'bg-accent'
                    : 'bg-muted'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Record */}
      {step === 'record' && (
        <div className="space-y-6">
          {/* Consent message to read */}
          <div className="bg-muted/50 rounded-xl p-4 border border-dashed border-primary/30">
            <p className="text-sm text-muted-foreground mb-2">Please read aloud:</p>
            <p className="font-medium text-lg">
              {consentMessages[consentType]?.hi}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {consentMessages[consentType]?.en}
            </p>
          </div>

          {/* Recording interface */}
          <div className="flex flex-col items-center">
            {!audioUrl ? (
              <>
                <motion.button
                  onClick={isRecording ? stopRecording : startRecording}
                  whileTap={{ scale: 0.95 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-destructive text-white voice-recording'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  } shadow-lg`}
                >
                  {isRecording ? (
                    <Square className="w-10 h-10" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </motion.button>
                <p className="text-muted-foreground mt-4">
                  {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
                </p>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 mt-3"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-destructive rounded-full"
                        animate={{ height: [8, 24, 8] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </motion.div>
                )}
              </>
            ) : (
              <div className="w-full space-y-4">
                <div className="bg-muted rounded-xl p-4">
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={playAudio}
                      className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium">Voice recorded</p>
                      <p className="text-sm text-muted-foreground">Tap to play your recording</p>
                    </div>
                    <button
                      onClick={resetRecording}
                      className="p-2 hover:bg-muted-foreground/10 rounded-lg"
                    >
                      <RefreshCw className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <Button onClick={() => setStep('verify')} className="w-full h-14 text-lg">
                  Continue to Verify
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {step === 'verify' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-sky-600" />
            </div>
            <h4 className="font-semibold text-lg">Verify with OTP</h4>
            <p className="text-muted-foreground">
              Enter the 4-digit code sent to +91-XXXX-XX{farmerPhone.slice(-4) || '****'}
            </p>
          </div>

          {!otpSent ? (
            <Button onClick={sendOTP} className="w-full h-14 text-lg">
              Send OTP
            </Button>
          ) : (
            <>
              {/* OTP Input */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, idx) => (
                  <Input
                    key={idx}
                    ref={(el) => { otpInputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-14 h-14 text-center text-2xl font-bold"
                  />
                ))}
              </div>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-muted-foreground">Resend OTP in {countdown}s</p>
                ) : (
                  <button
                    onClick={sendOTP}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Alternate: Verify via call */}
              <div className="text-center">
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  Or verify via automated call →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <h4 className="font-semibold text-lg">Ready to Confirm</h4>
            <p className="text-muted-foreground">
              Your voice consent has been recorded and verified
            </p>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Consent Type</span>
              <span className="font-medium capitalize">{consentType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phone Verified</span>
              <span className="font-medium text-accent">✓ +91-XXXX-XX{farmerPhone.slice(-4) || '****'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Timestamp</span>
              <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>
            {proxyId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acted by</span>
                <span className="font-medium">SHG Agent</span>
              </div>
            )}
          </div>

          <Button onClick={confirmConsent} className="w-full h-14 text-lg bg-accent hover:bg-accent/90">
            <Check className="w-5 h-5 mr-2" />
            Confirm Consent
          </Button>
        </div>
      )}
    </div>
  );
}

// Component for displaying consent history
export function ConsentHistory({
  consents,
  className = '',
}: {
  consents: ConsentHistoryItem[];
  className?: string;
}) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (consent: ConsentHistoryItem) => {
    if (audioRef.current) {
      if (playingId === consent.id) {
        audioRef.current.pause();
        setPlayingId(null);
      } else {
        audioRef.current.src = consent.audioUrl;
        audioRef.current.play();
        setPlayingId(consent.id);
      }
    }
  };

  const actorColors = {
    farmer: 'bg-accent/10 text-accent',
    shg: 'bg-primary/10 text-primary',
    fpo: 'bg-sky-500/10 text-sky-600',
  };

  return (
    <div className={`bg-card rounded-2xl border border-border overflow-hidden ${className}`}>
      <div className="p-4 border-b border-border">
        <h3 className="font-heading font-semibold">Consent History</h3>
        <p className="text-sm text-muted-foreground">All recorded voice consents</p>
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      <div className="divide-y divide-border">
        {consents.map((consent) => (
          <div key={consent.id} className="p-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => playAudio(consent)}
                className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10"
              >
                {playingId === consent.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium capitalize">{consent.type}</span>
                  {consent.otpVerified && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{consent.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{consent.timestamp.toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded-full ${actorColors[consent.actorType]}`}>
                    {consent.actor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {consents.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No consent records yet</p>
        </div>
      )}
    </div>
  );
}
