"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Lock,
  Smartphone,
  User,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';

interface KYCVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  language?: 'en' | 'hi';
}

type Step = 'intro' | 'aadhaar' | 'otp' | 'success';

export function KYCVerification({
  isOpen,
  onClose,
  onVerified,
  language = 'en',
}: KYCVerificationProps) {
  const [step, setStep] = useState<Step>('intro');
  const [aadhaar, setAadhaar] = useState(['', '', '']);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sessionId, setSessionId] = useState('');
  const [maskedAadhaar, setMaskedAadhaar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const aadhaarInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = {
    en: {
      title: 'Verify Your Identity',
      intro: 'Complete Aadhaar-based KYC to unlock all features',
      benefits: [
        'Higher transaction limits',
        'Priority support',
        'Verified badge on profile',
        'Access to premium features',
      ],
      enterAadhaar: 'Enter Aadhaar Number',
      aadhaarHint: 'Your 12-digit Aadhaar number',
      sendOtp: 'Send OTP',
      otpSent: 'OTP sent to Aadhaar-linked mobile',
      enterOtp: 'Enter OTP',
      otpHint: 'Enter 6-digit OTP',
      verify: 'Verify',
      resend: 'Resend OTP',
      resendIn: 'Resend in',
      success: 'Verification Successful!',
      successMsg: 'Your identity has been verified',
      continue: 'Continue',
      cancel: 'Cancel',
      startVerification: 'Start Verification',
      securityNote: 'Your Aadhaar is encrypted and never stored',
    },
    hi: {
      title: 'अपनी पहचान सत्यापित करें',
      intro: 'सभी सुविधाओं को अनलॉक करने के लिए आधार-आधारित केवाईसी पूरा करें',
      benefits: [
        'उच्च लेनदेन सीमा',
        'प्राथमिकता सहायता',
        'प्रोफ़ाइल पर सत्यापित बैज',
        'प्रीमियम सुविधाओं तक पहुंच',
      ],
      enterAadhaar: 'आधार नंबर दर्ज करें',
      aadhaarHint: 'आपका 12 अंकों का आधार नंबर',
      sendOtp: 'OTP भेजें',
      otpSent: 'आधार से जुड़े मोबाइल पर OTP भेजा गया',
      enterOtp: 'OTP दर्ज करें',
      otpHint: '6 अंकों का OTP दर्ज करें',
      verify: 'सत्यापित करें',
      resend: 'OTP पुनः भेजें',
      resendIn: 'में पुनः भेजें',
      success: 'सत्यापन सफल!',
      successMsg: 'आपकी पहचान सत्यापित हो गई है',
      continue: 'जारी रखें',
      cancel: 'रद्द करें',
      startVerification: 'सत्यापन शुरू करें',
      securityNote: 'आपका आधार एन्क्रिप्टेड है और कभी संग्रहीत नहीं किया जाता',
    },
  }[language];

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleAadhaarChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 4);
    const newAadhaar = [...aadhaar];
    newAadhaar[index] = cleanValue;
    setAadhaar(newAadhaar);
    setError(null);

    // Auto-focus next input
    if (cleanValue.length === 4 && index < 2) {
      aadhaarInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleAadhaarKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !aadhaar[index] && index > 0) {
      aadhaarInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const getFullAadhaar = () => aadhaar.join('');

  const handleRequestOtp = async () => {
    const fullAadhaar = getFullAadhaar();
    if (fullAadhaar.length !== 12) {
      setError('Please enter complete 12-digit Aadhaar number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{
        success: boolean;
        session_id: string;
        masked_aadhaar: string;
        dev_otp?: string;
      }>('/kyc/request-otp', {
        aadhaar_number: fullAadhaar,
      });

      setSessionId(response.session_id);
      setMaskedAadhaar(response.masked_aadhaar);
      setDevOtp(response.dev_otp || null);
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/kyc/verify-otp', {
        session_id: sessionId,
        otp: fullOtp,
      });

      setStep('success');
      setTimeout(() => {
        onVerified();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{
        success: boolean;
        session_id: string;
        dev_otp?: string;
      }>('/kyc/resend-otp', {
        aadhaar_number: getFullAadhaar(),
      });

      setSessionId(response.session_id);
      setDevOtp(response.dev_otp || null);
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setStep('intro');
    setAadhaar(['', '', '']);
    setOtp(['', '', '', '', '', '']);
    setSessionId('');
    setMaskedAadhaar('');
    setError(null);
    setDevOtp(null);
    setCountdown(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetState(); onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t.title}
          </DialogTitle>
          {step === 'intro' && (
            <DialogDescription>{t.intro}</DialogDescription>
          )}
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-accent/10 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Benefits
                </h3>
                <ul className="space-y-2">
                  {t.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Lock className="w-4 h-4" />
                {t.securityNote}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                  {t.cancel}
                </Button>
                <Button onClick={() => setStep('aadhaar')}>
                  {t.startVerification}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'aadhaar' && (
            <motion.div
              key="aadhaar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t.enterAadhaar}
                </label>
                <div className="flex gap-2 justify-center">
                  {aadhaar.map((segment, i) => (
                    <Input
                      key={i}
                      ref={(el) => { aadhaarInputRefs.current[i] = el; }}
                      value={segment}
                      onChange={(e) => handleAadhaarChange(i, e.target.value)}
                      onKeyDown={(e) => handleAadhaarKeyDown(i, e)}
                      className="w-24 text-center text-lg font-mono tracking-wider"
                      placeholder="0000"
                      maxLength={4}
                      inputMode="numeric"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {t.aadhaarHint}
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('intro')}>
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleRequestOtp}
                  disabled={getFullAadhaar().length !== 12 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      {t.sendOtp}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t.otpSent}</p>
                <p className="font-mono font-medium mt-1">{maskedAadhaar}</p>
              </div>

              {devOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-yellow-700">DEV MODE - OTP:</p>
                  <p className="font-mono font-bold text-yellow-800">{devOtp}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block text-center">
                  {t.enterOtp}
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <Input
                      key={i}
                      ref={(el) => { otpInputRefs.current[i] = el; }}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 text-center text-xl font-mono"
                      maxLength={1}
                      inputMode="numeric"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t.resendIn} {countdown}s
                  </p>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    {t.resend}
                  </Button>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('aadhaar')}>
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.join('').length !== 6 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t.verify}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.success}</h3>
              <p className="text-muted-foreground">{t.successMsg}</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                KYC Verified
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
