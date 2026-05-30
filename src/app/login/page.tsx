"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Loader2, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { isDevPhone, setDevUserRole } from '@/lib/api';
import Link from 'next/link';

type LoginStep = 'phone' | 'otp' | 'success';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'farmer';
  const { requestOtp, verifyOtp, error, isLoading } = useAuth();
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  // Validate phone number (should be 10 digits)
  const validatePhone = (value: string): boolean => {
    const cleaned = value.replace(/[\s\-\(\)]/g, '');
    // Remove country code if present for validation
    let digits = cleaned;
    if (digits.startsWith('+91')) digits = digits.substring(3);
    else if (digits.startsWith('91') && digits.length > 10) digits = digits.substring(2);
    else if (digits.startsWith('0')) digits = digits.substring(1);

    return /^\d{10}$/.test(digits);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const cleaned = value.replace(/[^\d]/g, '');
    setPhone(cleaned);
    setPhoneError(null);
  };

  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: 'Login to Shree Anna. Enter your phone number to receive an OTP. You can also register as a new user if you do not have an account.',
      hi: 'श्री अन्न में लॉगिन करें। ओटीपी प्राप्त करने के लिए अपना फोन नंबर दर्ज करें। यदि आपके पास खाता नहीं है तो आप नए उपयोगकर्ता के रूप में पंजीकरण भी कर सकते हैं।',
      kn: 'ಶ್ರೀ ಅನ್ನಕ್ಕೆ ಲಾಗಿನ್ ಮಾಡಿ. ಒಟಿಪಿ ಪಡೆಯಲು ನಿಮ್ಮ ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ. ನಿಮಗೆ ಖಾತೆ ಇಲ್ಲದಿದ್ದರೆ ನೀವು ಹೊಸ ಬಳಕೆದಾರರಾಗಿ ನೋಂದಾಯಿಸಿಕೊಳ್ಳಬಹುದು.',
      te: 'శ్రీ అన్నలో లాగిన్ అవ్వండి. OTP పొందడానికి మీ ఫోన్ నంబర్ నమోదు చేయండి. మీకు ఖాతా లేకపోతే మీరు కొత్త వినియోగదారుడిగా నమోదు చేసుకోవచ్చు.',
      ta: 'ஸ்ரீ அன்னாவில் உள்நுழைக. OTP பெற உங்கள் தொலைபேசி எண்ணை உள்ளிடவும். உங்களுக்கு கணக்கு இல்லையென்றால் புதிய பயனராக பதிவு செய்யலாம்.',
      mr: 'श्री अन्नामध्ये लॉगिन करा. ओटीपी मिळवण्यासाठी तुमचा फोन नंबर एंटर करा. तुमचे खाते नसल्यास तुम्ही नवीन वापरकर्ता म्हणून नोंदणी करू शकता.',
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Developer bypass - set role before any validation
    if (isDevPhone(phone)) {
      console.log('🔧 Developer bypass: Setting role to', role);
      setDevUserRole(role);
    }

    // Validate phone number first - skip for dev phone
    if (!validatePhone(phone) && !isDevPhone(phone)) {
      setPhoneError(language === 'hi' ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLocalLoading(true);
    setPhoneError(null);
    setShowRegisterPrompt(false);

    // Format phone number - clean and add +91 prefix
    let formattedPhone = phone.trim().replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses

    // Remove any existing country code to normalize
    if (formattedPhone.startsWith('+91')) {
      formattedPhone = formattedPhone.substring(3);
    } else if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
      formattedPhone = formattedPhone.substring(2);
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Add +91 prefix
    formattedPhone = '+91' + formattedPhone;

    // isRegistration = false for login (user must already exist)
    const result = await requestOtp(formattedPhone, language, false);
    setLocalLoading(false);

    if (result.success) {
      if (result.devOtp) {
        setDevOtp(result.devOtp);
      }
      setStep('otp');
    } else if (result.userExists === false) {
      // User not registered - show registration prompt
      setShowRegisterPrompt(true);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);

    // Format phone number - same logic as handleRequestOtp
    let formattedPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (formattedPhone.startsWith('+91')) {
      formattedPhone = formattedPhone.substring(3);
    } else if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
      formattedPhone = formattedPhone.substring(2);
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }
    formattedPhone = '+91' + formattedPhone;

    // isRegistration = false for login
    const result = await verifyOtp(formattedPhone, otp, false);
    setLocalLoading(false);

    if (result.success) {
      setStep('success');
      // Redirect to dashboard based on role
      const userRoles = result.user?.roles || [];
      let redirectPath = '/farmer/dashboard'; // Default fallback

      if (userRoles.includes('buyer')) redirectPath = '/buyer/dashboard';
      else if (userRoles.includes('processor')) redirectPath = '/processor/dashboard';
      else if (userRoles.includes('fpo')) redirectPath = '/fpo/dashboard';
      else if (userRoles.includes('ksc')) redirectPath = '/ksc/dashboard';
      else if (userRoles.includes('farmer')) redirectPath = '/farmer/dashboard';

      // If user specific role is requested and they have it, prioritize that
      if (role && userRoles.includes(role)) {
        redirectPath = `/${role}/dashboard`;
      }

      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl border border-border p-8 shadow-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img src="/lgo.png" alt="Shree Anna" className="w-16 h-16 object-contain" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-heading font-bold">Shree Anna</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={speakPageContent}
                className="touch-target"
                aria-label={isSpeaking ? 'Stop speaking' : 'Read page content aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-5 h-5 text-destructive" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground mt-1">श्री अन्न - Millets Marketplace</p>
          </div>

          {step === 'phone' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleRequestOtp}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'hi' ? 'फ़ोन नंबर' : language === 'kn' ? 'ಫೋನ್ ಸಂಖ್ಯೆ' : language === 'te' ? 'ఫోన్ నంబర్' : language === 'ta' ? 'தொலைபேசி எண்' : language === 'mr' ? 'फोन नंबर' : 'Phone Number'}
                </label>
                <div className="relative flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">+91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder={language === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    className="h-12 text-lg rounded-l-none"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {language === 'hi' ? 'हम आपको सत्यापन के लिए OTP भेजेंगे' : language === 'kn' ? 'ನಾವು ನಿಮಗೆ ಪರಿಶೀಲನೆಗಾಗಿ OTP ಕಳುಹಿಸುತ್ತೇವೆ' : language === 'te' ? 'మేము మీకు వెరిఫికేషన్ కోసం OTP పంపుతాము' : language === 'ta' ? 'சரிபார்ப்புக்கு OTP அனுப்புவோம்' : language === 'mr' ? 'आम्ही तुम्हाला व्हेरिफिकेशनसाठी OTP पाठवू' : "We'll send you an OTP to verify"}
                </p>
              </div>

              {(error || phoneError) && (
                <p className="text-sm text-destructive">{phoneError || error}</p>
              )}

              {showRegisterPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
                >
                  <p className="text-amber-800 dark:text-amber-200 text-sm font-medium mb-2">
                    {language === 'hi'
                      ? 'आप अभी पंजीकृत नहीं हैं!'
                      : language === 'kn'
                        ? 'ನೀವು ಇನ್ನೂ ನೋಂದಾಯಿಸಿಲ್ಲ!'
                        : language === 'te'
                          ? 'మీరు ఇంకా నమోదు కాలేదు!'
                          : language === 'ta'
                            ? 'நீங்கள் இன்னும் பதிவு செய்யவில்லை!'
                            : language === 'mr'
                              ? 'तुम्ही अजून नोंदणी केलेली नाही!'
                              : 'You are not registered yet!'}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs mb-3">
                    {language === 'hi'
                      ? 'लॉगिन करने के लिए पहले पंजीकरण करें।'
                      : language === 'kn'
                        ? 'ಲಾಗಿನ್ ಆಗಲು ಮೊದಲು ನೋಂದಾಯಿಸಿ.'
                        : language === 'te'
                          ? 'లాగిన్ అవ్వడానికి ముందు నమోదు చేసుకోండి.'
                          : language === 'ta'
                            ? 'உள்நுழைய முதலில் பதிவு செய்யவும்.'
                            : language === 'mr'
                              ? 'लॉगिन करण्यासाठी प्रथम नोंदणी करा.'
                              : 'Please register first to login.'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/farmer/register">
                      <Button size="lg" variant="outline" className="touch-target">
                        {language === 'hi' ? 'किसान' : 'Farmer'}
                      </Button>
                    </Link>
                    <Link href="/fpo/register">
                      <Button size="lg" variant="outline" className="touch-target">
                        FPO
                      </Button>
                    </Link>
                    <Link href="/buyer/register">
                      <Button size="lg" variant="outline" className="touch-target">
                        {language === 'hi' ? 'खरीदार' : 'Buyer'}
                      </Button>
                    </Link>
                    <Link href="/processor/register">
                      <Button size="lg" variant="outline" className="touch-target">
                        {language === 'hi' ? 'प्रोसेसर' : 'Processor'}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                size="xl"
                className="w-full text-lg touch-target"
                disabled={localLoading || !phone || phone.length < 10}
              >
                {localLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {language === 'hi' ? 'जारी रखें' : language === 'kn' ? 'ಮುಂದುವರಿಸಿ' : language === 'te' ? 'కొనసాగించు' : language === 'ta' ? 'தொடரவும்' : language === 'mr' ? 'पुढे जा' : 'Continue'}
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-base text-muted-foreground">
                {language === 'hi' ? 'खाता नहीं है?' : language === 'kn' ? 'ಖಾತೆ ಇಲ್ಲವೇ?' : language === 'te' ? 'ఖాతా లేదా?' : language === 'ta' ? 'கணக்கு இல்லையா?' : language === 'mr' ? 'खाते नाही?' : "Don't have an account?"}{' '}
                <Link href={`/${role}/register`} className="text-primary hover:underline font-medium">
                  {language === 'hi' ? 'पंजीकरण करें' : language === 'kn' ? 'ನೋಂದಾಯಿಸಿ' : language === 'te' ? 'నమోదు చేసుకోండి' : language === 'ta' ? 'பதிவு செய்யவும்' : language === 'mr' ? 'नोंदणी करा' : 'Register'}
                </Link>
              </p>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter OTP
                </label>
                <Input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-14 text-2xl text-center tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  OTP sent to {phone}
                </p>
                {devOtp && (
                  <p className="text-xs text-amber-600 mt-1">
                    Dev OTP: <strong>{devOtp}</strong>
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                size="xl"
                className="w-full text-lg touch-target"
                disabled={localLoading || otp.length !== 6}
              >
                {localLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Verify OTP
                    <CheckCircle className="w-6 h-6 ml-2" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-base text-muted-foreground hover:text-foreground py-3"
              >
                ← Change phone number
              </button>
            </motion.form>
          )}

          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Login Successful!</h2>
              <p className="text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </motion.div>
          )}
        </div>

        {/* Help link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help?{' '}
          <Link href="/help" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
