"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    User,
    Phone,
    CheckCircle,
    Mic,
    Building2,
    KeyRound,
    Loader2,
    MapPin
} from 'lucide-react';
import { FlashCard } from '@/components/FlashCard';
import { VoiceButton } from '@/components/VoiceButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { userApi, authApi, setAccessToken, isDevPhone, setDevUserRole } from '@/lib/api';
import { useLanguage, Language } from '@/lib/hooks/useLanguage';
import { useAuth } from '@/lib/hooks/useAuth';

// Multilingual translations for KSC onboarding
const onboardingTexts = {
    welcome: {
        title: {
            en: 'Kisan Service Center 🏛️',
            hi: 'किसान सेवा केंद्र 🏛️',
            kn: 'ಕಿಸಾನ್ ಸೇವಾ ಕೇಂದ್ರ 🏛️',
            te: 'కిసాన్ సేవా కేంద్రం 🏛️',
            ta: 'கிசான் சேவை மையம் 🏛️',
            mr: 'किसान सेवा केंद्र 🏛️',
        },
        description: {
            en: "Register your service center to help farmers onboard and verify.",
            hi: 'किसानों की मदद के लिए अपना सेवा केंद्र पंजीकृत करें।',
            kn: 'ರೈತರಿಗೆ ಸಹಾಯ ಮಾಡಲು ನಿಮ್ಮ ಸೇವಾ ಕೇಂದ್ರವನ್ನು ನೋಂದಾಯಿಸಿ.',
            te: 'రైతులకు సహాయం చేయడానికి మీ సేవా కేంద్రాన్ని నమోదు చేయండి.',
            ta: 'விவசாயிகளுக்கு உதவ உங்கள் சேவை மையத்தை பதிவு செய்யுங்கள்.',
            mr: 'शेतकऱ्यांना मदत करण्यासाठी तुमचे सेवा केंद्र नोंदणी करा.',
        },
    },
    phone: {
        title: {
            en: 'Mobile Number',
            hi: 'मोबाइल नंबर',
            kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
            te: 'మొబైల్ నంబర్',
            ta: 'மொபைல் எண்',
            mr: 'मोबाइल नंबर',
        },
        description: {
            en: "Enter your registered mobile number",
            hi: 'अपना पंजीकृत मोबाइल नंबर दर्ज करें',
            kn: 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
            te: 'మీ నమోదిత మొబైల్ నంబర్‌ను నమోదు చేయండి',
            ta: 'உங்கள் பதிவு செய்யப்பட்ட மொபைல் எண்ணை உள்ளிடவும்',
            mr: 'तुमचा नोंदणीकृत मोबाइल नंबर प्रविष्ट करा',
        },
        placeholder: {
            en: '10 digit mobile number',
            hi: '10 अंकों का मोबाइल नंबर',
            kn: '10 ಅಂಕಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
            te: '10 అంకెల మొబైల్ నంబర్',
            ta: '10 இலக்க மொபைல் எண்',
            mr: '10 अंकी मोबाइल नंबर',
        },
        sendOtp: {
            en: 'Send OTP',
            hi: 'OTP भेजें',
            kn: 'OTP ಕಳುಹಿಸಿ',
            te: 'OTP పంపండి',
            ta: 'OTP அனுப்பு',
            mr: 'OTP पाठवा',
        },
        otpSent: {
            en: 'OTP sent to',
            hi: 'OTP भेजा गया',
            kn: 'OTP ಕಳುಹಿಸಲಾಗಿದೆ',
            te: 'OTP పంపబడింది',
            ta: 'OTP அனுப்பப்பட்டது',
            mr: 'OTP पाठवला',
        },
        invalidPhone: {
            en: 'Please enter a valid 10-digit mobile number',
            hi: 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें',
            kn: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ 10 ಅಂಕಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
            te: 'దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి',
            ta: 'செல்லுபடியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
            mr: 'कृपया वैध 10 अंकी मोबाइल नंबर प्रविष्ट करा',
        },
        alreadyRegistered: {
            en: 'This phone number is already registered.',
            hi: 'यह फोन नंबर पहले से पंजीकृत है।',
            kn: 'ಈ ಫೋನ್ ಸಂಖ್ಯೆ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ.',
            te: 'ఈ ఫోన్ నంబర్ ఇప్పటికే నమోదు చేయబడింది.',
            ta: 'இந்த தொலைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.',
            mr: 'हा फोन नंबर आधीच नोंदणीकृत आहे.',
        },
        loginInstead: {
            en: 'Please login instead',
            hi: 'कृपया लॉगिन करें',
            kn: 'ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ',
            te: 'దయచేసి లాగిన్ అవ్వండి',
            ta: 'தயவுசெய்து உள்நுழையவும்',
            mr: 'कृपया लॉगिन करा',
        },
    },
    otp: {
        title: {
            en: 'Enter OTP',
            hi: 'OTP दर्ज करें',
            kn: 'OTP ನಮೂದಿಸಿ',
            te: 'OTP నమోదు చేయండి',
            ta: 'OTP உள்ளிடவும்',
            mr: 'OTP प्रविष्ट करा',
        },
        description: {
            en: 'Enter the 6-digit code sent to your phone',
            hi: 'अपने फोन पर भेजा गया 6 अंकों का कोड दर्ज करें',
            kn: 'ನಿಮ್ಮ ಫೋನ್‌ಗೆ ಕಳುಹಿಸಲಾದ 6 ಅಂಕಿ ಕೋಡ್ ನಮೂದಿಸಿ',
            te: 'మీ ఫోన్‌కు పంపిన 6 అంకెల కోడ్ నమోదు చేయండి',
            ta: 'உங்கள் தொலைபேசிக்கு அனுப்பிய 6 இலக்க குறியீட்டை உள்ளிடவும்',
            mr: 'तुमच्या फोनवर पाठवलेला 6 अंकी कोड प्रविष्ट करा',
        },
        placeholder: {
            en: 'Enter 6-digit OTP',
            hi: '6 अंकों का OTP दर्ज करें',
            kn: '6 ಅಂಕಿ OTP ನಮೂದಿಸಿ',
            te: '6 అంకెల OTP నమోదు చేయండి',
            ta: '6 இலக்க OTP உள்ளிடவும்',
            mr: '6 अंकी OTP प्रविष्ट करा',
        },
        verify: {
            en: 'Verify OTP',
            hi: 'OTP सत्यापित करें',
            kn: 'OTP ಪರಿಶೀಲಿಸಿ',
            te: 'OTP ధృవీకరించండి',
            ta: 'OTP சரிபார்க்கவும்',
            mr: 'OTP पडताळा',
        },
        verified: {
            en: 'Phone number verified',
            hi: 'फोन नंबर सत्यापित',
            kn: 'ಫೋನ್ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
            te: 'ఫోన్ నంబర్ ధృవీకరించబడింది',
            ta: 'தொலைபேசி எண் சரிபார்க்கப்பட்டது',
            mr: 'फोन नंबर पडताळला',
        },
        resend: {
            en: 'Resend OTP',
            hi: 'OTP पुनः भेजें',
            kn: 'OTP ಮರುಕಳುಹಿಸಿ',
            te: 'OTP మళ్ళీ పంపండి',
            ta: 'OTP மீண்டும் அனுப்பு',
            mr: 'OTP पुन्हा पाठवा',
        },
        invalidOtp: {
            en: 'Please enter a valid 6-digit OTP',
            hi: 'कृपया वैध 6 अंकों का OTP दर्ज करें',
            kn: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ 6 ಅಂಕಿ OTP ನಮೂದಿಸಿ',
            te: 'దయచేసి చెల్లుబాటు అయ్యే 6 అంకెల OTP నమోదు చేయండి',
            ta: 'செல்லுபடியான 6 இலக்க OTP உள்ளிடவும்',
            mr: 'कृपया वैध 6 अंकी OTP प्रविष्ट करा',
        },
    },
    name: {
        title: {
            en: 'Your Name',
            hi: 'आपका नाम',
            kn: 'ನಿಮ್ಮ ಹೆಸರು',
            te: 'మీ పేరు',
            ta: 'உங்கள் பெயர்',
            mr: 'तुमचे नाव',
        },
        description: {
            en: 'Enter your full name',
            hi: 'अपना पूरा नाम दर्ज करें',
            kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
            te: 'మీ పూర్తి పేరు నమోదు చేయండి',
            ta: 'உங்கள் முழு பெயரை உள்ளிடவும்',
            mr: 'तुमचे पूर्ण नाव प्रविष्ट करा',
        },
        placeholder: {
            en: 'Enter full name',
            hi: 'पूरा नाम दर्ज करें',
            kn: 'ಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ',
            te: 'పూర్తి పేరు నమోదు చేయండి',
            ta: 'முழு பெயரை உள்ளிடவும்',
            mr: 'पूर्ण नाव प्रविष्ट करा',
        },
        voicePlaceholder: {
            en: 'Tap to speak name',
            hi: 'नाम बोलने के लिए टैप करें',
            kn: 'ಹೆಸರು ಹೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
            te: 'పేరు చెప్పడానికి నొక్కండి',
            ta: 'பெயரைச் சொல்ல தட்டவும்',
            mr: 'नाव सांगण्यासाठी टॅप करा',
        },
    },
    center: {
        title: {
            en: 'Center Details',
            hi: 'केंद्र विवरण',
            kn: 'ಕೇಂದ್ರ ವಿವರಗಳು',
            te: 'కేంద్రం వివరాలు',
            ta: 'மைய விவரங்கள்',
            mr: 'केंद्र तपशील',
        },
        description: {
            en: 'Enter your service center information',
            hi: 'अपनी सेवा केंद्र की जानकारी दर्ज करें',
            kn: 'ನಿಮ್ಮ ಸೇವಾ ಕೇಂದ್ರದ ಮಾಹಿತಿ ನಮೂದಿಸಿ',
            te: 'మీ సేవా కేంద్రం సమాచారం నమోదు చేయండి',
            ta: 'உங்கள் சேவை மைய தகவலை உள்ளிடவும்',
            mr: 'तुमच्या सेवा केंद्राची माहिती प्रविष्ट करा',
        },
        centerName: {
            en: 'Center Name',
            hi: 'केंद्र का नाम',
            kn: 'ಕೇಂದ್ರದ ಹೆಸರು',
            te: 'కేంద్రం పేరు',
            ta: 'மையத்தின் பெயர்',
            mr: 'केंद्राचे नाव',
        },
        district: {
            en: 'Service District',
            hi: 'सेवा जिला',
            kn: 'ಸೇವಾ ಜಿಲ್ಲೆ',
            te: 'సేవా జిల్లా',
            ta: 'சேவை மாவட்டம்',
            mr: 'सेवा जिल्हा',
        },
    },
    complete: {
        title: {
            en: "Registration Complete! 🎉",
            hi: 'पंजीकरण पूरा हुआ! 🎉',
            kn: 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ! 🎉',
            te: 'నమోదు పూర్తయింది! 🎉',
            ta: 'பதிவு முடிந்தது! 🎉',
            mr: 'नोंदणी पूर्ण झाली! 🎉',
        },
        description: {
            en: 'Your KSC account is ready. Start verifying farmers!',
            hi: 'आपका KSC खाता तैयार है। किसानों का सत्यापन शुरू करें!',
            kn: 'ನಿಮ್ಮ KSC ಖಾತೆ ಸಿದ್ಧವಾಗಿದೆ. ರೈತರನ್ನು ಪರಿಶೀಲಿಸಲು ಪ್ರಾರಂಭಿಸಿ!',
            te: 'మీ KSC ఖాతా సిద్ధంగా ఉంది. రైతులను ధృవీకరించడం ప్రారంభించండి!',
            ta: 'உங்கள் KSC கணக்கு தயாராக உள்ளது. விவசாயிகளை சரிபார்க்கத் தொடங்குங்கள்!',
            mr: 'तुमचे KSC खाते तयार आहे. शेतकऱ्यांचे सत्यापन सुरू करा!',
        },
    },
    header: {
        registration: {
            en: 'KSC Registration',
            hi: 'KSC पंजीकरण',
            kn: 'KSC ನೋಂದಣಿ',
            te: 'KSC నమోదు',
            ta: 'KSC பதிவு',
            mr: 'KSC नोंदणी',
        },
        cancel: {
            en: 'Cancel',
            hi: 'रद्द करें',
            kn: 'ರದ್ದುಮಾಡಿ',
            te: 'రద్దు చేయండి',
            ta: 'ரத்துசெய்',
            mr: 'रद्द करा',
        },
    },
    footer: {
        voiceHint: {
            en: 'Tap the microphone to use voice input',
            hi: 'वॉइस इनपुट के लिए माइक्रोफ़ोन पर टैप करें',
            kn: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬಳಸಲು ಮೈಕ್ರೋಫೋನ್ ಟ್ಯಾಪ್ ಮಾಡಿ',
            te: 'వాయిస్ ఇన్‌పుట్ కోసం మైక్రోఫోన్‌ను నొక్కండి',
            ta: 'குரல் உள்ளீட்டிற்கு மைக்ரோஃபோனைத் தட்டவும்',
            mr: 'व्हॉइस इनपुटसाठी मायक्रोफोन टॅप करा',
        },
    },
    errors: {
        otpFailed: {
            en: 'Failed to send OTP. Please try again.',
            hi: 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।',
            kn: 'OTP ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
            te: 'OTP పంపడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
            ta: 'OTP அனுப்புவது தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
            mr: 'OTP पाठवणे अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        },
        invalidOtp: {
            en: 'Invalid OTP. Please try again.',
            hi: 'अमान्य OTP। कृपया पुनः प्रयास करें।',
            kn: 'ಅಮಾನ್ಯ OTP. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
            te: 'చెల్లని OTP. దయచేసి మళ్ళీ ప్రయత్నించండి.',
            ta: 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.',
            mr: 'अवैध OTP. कृपया पुन्हा प्रयत्न करा.',
        },
    },
};

const districts = [
    { value: 'bangalore_urban', label: 'Bangalore Urban' },
    { value: 'bangalore_rural', label: 'Bangalore Rural' },
    { value: 'tumkur', label: 'Tumkur' },
    { value: 'hassan', label: 'Hassan' },
    { value: 'mandya', label: 'Mandya' },
    { value: 'mysore', label: 'Mysore' },
];

export default function KscRegister() {
    const router = useRouter();
    const { language: siteLanguage, setLanguage: setSiteLanguage } = useLanguage();
    const { refreshUser } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        otp: '',
        centerName: '',
        district: '',
        language: siteLanguage,
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [autoAdvanceTrigger, setAutoAdvanceTrigger] = useState(0);

    const getText = (section: keyof typeof onboardingTexts, key: string): string => {
        const lang = formData.language as Language;
        const sectionData = onboardingTexts[section] as Record<string, Record<Language, string>>;
        return sectionData[key]?.[lang] || sectionData[key]?.['en'] || '';
    };

    // Auto-verify OTP when 6 digits are entered
    useEffect(() => {
        if (formData.otp.length === 6 && !otpVerified && !isLoading && otpSent) {
            handleVerifyOtp();
        }
    }, [formData.otp]);

    const updateField = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);

        if (field === 'language' && typeof value === 'string') {
            setSiteLanguage(value as Language);
        }
    };

    const handleVoiceInput = (field: string) => (text: string) => {
        updateField(field, text);
    };

    const handleSendOtp = async () => {
        // Developer bypass - set role before any validation
        if (isDevPhone(formData.phone)) {
            console.log('🔧 Developer bypass: Setting role to ksc');
            setDevUserRole('ksc');
        }

        if (formData.phone.length !== 10) {
            setError(getText('phone', 'invalidPhone'));
            return;
        }
        // Validate Indian mobile number format (must start with 6-9) - skip for dev phone
        if (!/^[6-9]/.test(formData.phone) && !isDevPhone(formData.phone)) {
            setError(getText('phone', 'invalidPhone'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setShowAlreadyRegistered(false);
        try {
            // Pass isRegistration=true for registration flow
            const result = await authApi.requestOtp('+91' + formData.phone, formData.language, true);
            if (result.success) {
                setOtpSent(true);
                if (result.dev_otp) {
                    setDevOtp(result.dev_otp);
                }
                // Auto-advance to OTP step
                setTimeout(() => setAutoAdvanceTrigger(prev => prev + 1), 300);
            } else if (result.user_exists) {
                setError(getText('phone', 'alreadyRegistered'));
                setShowAlreadyRegistered(true);
            }
        } catch (err) {
            console.error('OTP send failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (formData.otp.length !== 6) {
            setError(getText('otp', 'invalidOtp'));
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            // Pass isRegistration=true for registration flow
            const result = await authApi.verifyOtp('+91' + formData.phone, formData.otp, true);
            console.log('OTP Verify Response:', result);
            if (result.token) {
                setAccessToken(result.token);
                console.log('Token saved successfully');
                setOtpVerified(true);
                setTimeout(() => setAutoAdvanceTrigger(prev => prev + 1), 300);
            }
        } catch (err) {
            console.error('OTP verification failed:', err);
            const errorMessage = err instanceof Error ? err.message : getText('errors', 'invalidOtp');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        {
            id: 'welcome',
            title: getText('welcome', 'title'),
            description: getText('welcome', 'description'),
            icon: <span className="text-4xl">🏛️</span>,
            voicePrompt: getText('welcome', 'description'),
        },

        {
            id: 'phone',
            title: getText('phone', 'title'),
            description: getText('phone', 'description'),
            icon: <Phone className="w-10 h-10" />,
            voicePrompt: getText('phone', 'description'),
            input: (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="flex items-center justify-center bg-muted px-4 rounded-lg text-lg font-medium">
                            +91
                        </div>
                        <Input
                            type="tel"
                            placeholder={getText('phone', 'placeholder')}
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="h-14 text-lg flex-1"
                            disabled={otpSent}
                        />
                    </div>
                    {error && (
                        <div className="text-center space-y-2">
                            <p className="text-sm text-destructive">{error}</p>
                            {showAlreadyRegistered && (
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-sm text-muted-foreground">{getText('phone', 'loginInstead')}</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/login?role=ksc')}
                                        className="w-full"
                                    >
                                        {formData.language === 'hi' ? 'लॉगिन करें' :
                                            formData.language === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' :
                                                formData.language === 'te' ? 'లాగిన్ అవ్వండి' :
                                                    formData.language === 'ta' ? 'உள்நுழையவும்' :
                                                        formData.language === 'mr' ? 'लॉगिन करा' : 'Login'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    {!otpSent ? (
                        <Button
                            onClick={handleSendOtp}
                            className="w-full h-12"
                            disabled={formData.phone.length !== 10 || isLoading}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : getText('phone', 'sendOtp')}
                        </Button>
                    ) : (
                        <p className="text-sm text-accent text-center">✓ {getText('phone', 'otpSent')} +91 {formData.phone}</p>
                    )}
                </div>
            ),
            canProceed: otpSent,
        },
        {
            id: 'otp',
            title: getText('otp', 'title'),
            description: getText('otp', 'description'),
            icon: <KeyRound className="w-10 h-10" />,
            voicePrompt: getText('otp', 'description'),
            input: (
                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder={getText('otp', 'placeholder')}
                        value={formData.otp}
                        onChange={(e) => updateField('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="h-14 text-2xl text-center tracking-[0.5em] font-mono"
                        maxLength={6}
                        disabled={otpVerified}
                    />
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    {!otpVerified ? (
                        <Button
                            onClick={handleVerifyOtp}
                            className="w-full h-12"
                            disabled={formData.otp.length !== 6 || isLoading}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : getText('otp', 'verify')}
                        </Button>
                    ) : (
                        <p className="text-sm text-accent text-center">✓ {getText('otp', 'verified')}</p>
                    )}
                    {!otpVerified && (
                        <button
                            onClick={handleSendOtp}
                            className="text-sm text-primary hover:underline w-full text-center"
                            disabled={isLoading}
                        >
                            {getText('otp', 'resend')}
                        </button>
                    )}

                </div>
            ),
            canProceed: otpVerified,
        },
        {
            id: 'name',
            title: getText('name', 'title'),
            description: getText('name', 'description'),
            icon: <User className="w-10 h-10" />,
            voicePrompt: getText('name', 'description'),
            input: (
                <div className="space-y-4">
                    <Input
                        placeholder={getText('name', 'placeholder')}
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="h-14 text-lg text-center"
                    />
                    <div className="flex justify-center">
                        <VoiceButton
                            onTranscript={handleVoiceInput('name')}
                            placeholder={getText('name', 'voicePlaceholder')}
                            size="md"
                        />
                    </div>
                </div>
            ),
            canProceed: formData.name.trim().length >= 2,
        },
        {
            id: 'center',
            title: getText('center', 'title'),
            description: getText('center', 'description'),
            icon: <Building2 className="w-10 h-10" />,
            voicePrompt: getText('center', 'description'),
            input: (
                <div className="space-y-4">
                    <Input
                        placeholder={getText('center', 'centerName')}
                        value={formData.centerName}
                        onChange={(e) => updateField('centerName', e.target.value)}
                        className="h-14 text-lg"
                    />
                    <Select value={formData.district} onValueChange={(v) => updateField('district', v)}>
                        <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder={getText('center', 'district')} />
                        </SelectTrigger>
                        <SelectContent>
                            {districts.map((d) => (
                                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ),
            canProceed: formData.centerName.trim().length >= 2 && formData.district.length > 0,
        },
        {
            id: 'complete',
            title: getText('complete', 'title'),
            description: getText('complete', 'description'),
            icon: <CheckCircle className="w-16 h-16 text-accent" />,
            voicePrompt: getText('complete', 'description'),
        },
    ];

    const handleComplete = async () => {
        console.log('=== handleComplete called (KSC) ===');
        console.log('formData:', formData);

        const payload = {
            name: formData.name,
            language: formData.language,
            district: formData.district,
            ksc_center_name: formData.centerName,
        };

        console.log('Sending payload to API:', payload);

        try {
            const result = await userApi.onboardKsc(payload);
            console.log('API Response:', result);
            await refreshUser();
            router.push('/ksc/dashboard');
        } catch (err) {
            console.error('Onboarding API failed:', err);
            setTimeout(() => router.push('/ksc/dashboard'), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-card/50 backdrop-blur">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xl">🏛️</span>
                        </div>
                        <div>
                            <span className="font-heading font-bold text-lg">Shree Anna</span>
                            <span className="block text-xs text-muted-foreground">{getText('header', 'registration')}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                        {getText('header', 'cancel')}
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <FlashCard
                        steps={steps}
                        onComplete={handleComplete}
                        onStepChange={setCurrentStep}
                        autoAdvanceTrigger={autoAdvanceTrigger}
                        onBack={() => router.back()}
                    />
                </motion.div>
            </main>

            <footer className="py-4 text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Mic className="w-4 h-4" />
                    {getText('footer', 'voiceHint')}
                </p>
            </footer>
        </div>
    );
}
