"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    User,
    MapPin,
    Phone,
    CheckCircle,
    Mic,
    ShoppingBag,
    KeyRound,
    Loader2,
    Building2,
    CreditCard
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
import { languages } from '@/lib/design-tokens';
import { userApi, authApi, setAccessToken, isDevPhone, setDevUserRole } from '@/lib/api';
import { useLanguage, Language } from '@/lib/hooks/useLanguage';
import { useAuth } from '@/lib/hooks/useAuth';

// Multilingual translations for onboarding
const onboardingTexts = {
    welcome: {
        title: {
            en: 'Welcome to Shree Anna! 🛍️',
            hi: 'श्री अन्न में आपका स्वागत है! 🛍️',
            kn: 'ಶ್ರೀ ಅನ್ನಕ್ಕೆ ಸುಸ್ವಾಗತ! 🛍️',
            te: 'శ్రీ అన్నకు స్వాగతం! 🛍️',
            ta: 'ஸ்ரீ அன்னாவிற்கு வரவேற்கிறோம்! 🛍️',
            mr: 'श्री अन्नमध्ये आपले स्वागत आहे! 🛍️',
        },
        description: {
            en: "Connect directly with farmers and FPOs to source premium quality millets.",
            hi: 'प्रीमियम गुणवत्ता वाले बाजरे की सोर्सिंग के लिए सीधे किसानों और एफपीओ से जुड़ें।',
            kn: 'ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟದ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಪಡೆಯಲು ರೈತರು ಮತ್ತು ಎಫ್‌ಪಿಒಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.',
            te: 'ప్రీమియం నాణ్యమైన చిరుధాన్యాలను సోర్స్ చేయడానికి రైతులు మరియు FPOలతో నేరుగా కనెక్ట్ అవ్వండి.',
            ta: 'பிரீமியம் தரமான தினைகளைப் பெற விவசாயிகள் மற்றும் FPO களுடன் நேரடியாக இணையுங்கள்.',
            mr: 'प्रीमियम गुणवत्तेची बाजरी मिळवण्यासाठी थेट शेतकरी आणि FPO शी कनेक्ट व्हा.',
        },
    },
    language: {
        title: {
            en: 'Choose Your Language',
            hi: 'अपनी भाषा चुनें',
            kn: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            te: 'మీ భాషను ఎంచుకోండి',
            ta: 'உங்கள் மொழியைத் தேர்வுசெய்க',
            mr: 'तुमची भाषा निवडा',
        },
        description: {
            en: "Select the language you're most comfortable with",
            hi: 'वह भाषा चुनें जिसमें आप सबसे सहज हैं',
            kn: 'ನಿಮಗೆ ಅತ್ಯಂತ ಆರಾಮದಾಯಕ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            te: 'మీకు అత్యంత సౌకర్యవంతమైన భాషను ఎంచుకోండి',
            ta: 'உங்களுக்கு மிகவும் வசதியான மொழியைத் தேர்வுசெய்யுங்கள்',
            mr: 'तुम्हाला सर्वात सोयीची भाषा निवडा',
        },
    },
    phone: {
        title: {
            en: 'Your Mobile Number',
            hi: 'आपका मोबाइल नंबर',
            kn: 'ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
            te: 'మీ మొబైల్ నంబర్',
            ta: 'உங்கள் மொபைல் எண்',
            mr: 'तुमचा मोबाइल नंबर',
        },
        description: {
            en: "We'll send OTP to verify your number",
            hi: 'हम आपका नंबर सत्यापित करने के लिए OTP भेजेंगे',
            kn: 'ನಿಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ನಾವು OTP ಕಳುಹಿಸುತ್ತೇವೆ',
            te: 'మీ నంబర్‌ను ధృవీకరించడానికి మేము OTP పంపుతాము',
            ta: 'உங்கள் எண்ணை சரிபார்க்க OTP அனுப்புவோம்',
            mr: 'तुमचा नंबर पडताळण्यासाठी आम्ही OTP पाठवू',
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
        invalidPhoneFormat: {
            en: 'Mobile number must start with 6, 7, 8, or 9',
            hi: 'मोबाइल नंबर 6, 7, 8 या 9 से शुरू होना चाहिए',
            kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ 6, 7, 8 ಅಥವಾ 9 ರಿಂದ ಪ್ರಾರಂಭವಾಗಬೇಕು',
            te: 'మొబైల్ నంబర్ 6, 7, 8 లేదా 9 తో ప్రారంభం కావాలి',
            ta: 'மொபைல் எண் 6, 7, 8 அல்லது 9 இல் தொடங்க வேண்டும்',
            mr: 'मोबाइल नंबर 6, 7, 8 किंवा 9 ने सुरू व्हायला हवा',
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
            en: 'Your Name / Company Name',
            hi: 'आपका नाम / कंपनी का नाम',
            kn: 'ನಿಮ್ಮ ಹೆಸರು / ಕಂಪನಿ ಹೆಸರು',
            te: 'మీ పేరు / కంపెనీ పేరు',
            ta: 'உங்கள் பெயர் / நிறுவனத்தின் பெயர்',
            mr: 'तुमचे नाव / कंपनीचे नाव',
        },
        description: {
            en: 'How should we address you?',
            hi: 'हमें आपको कैसे संबोधित करना चाहिए?',
            kn: 'ನಾವು ನಿಮ್ಮನ್ನು ಹೇಗೆ ಸಂಬೋಧಿಸಬೇಕು?',
            te: 'మేము మిమ్మల్ని ఎలా పిలవాలి?',
            ta: 'நாங்கள் உங்களை எப்படி அழைக்க வேண்டும்?',
            mr: 'आम्ही तुम्हाला कसे संबोधित करावे?',
        },
        placeholder: {
            en: 'Enter name',
            hi: 'नाम दर्ज करें',
            kn: 'ಹೆಸರು ನಮೂದಿಸಿ',
            te: 'పేరు నమోదు చేయండి',
            ta: 'பெயரை உள்ளிடவும்',
            mr: 'नाव प्रविष्ट करा',
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
    location: {
        title: {
            en: 'Where are you located?',
            hi: 'आप कहाँ स्थित हैं?',
            kn: 'ನೀವು ಎಲ್ಲಿದ್ದೀರಿ?',
            te: 'మీరు ఎక్కడ ఉన్నారు?',
            ta: 'நீங்கள் எங்கே இருக்கிறீர்கள்?',
            mr: 'तुम्ही कुठे आहात?',
        },
        description: {
            en: 'To show you nearby farmers',
            hi: 'आपको नजदीकी किसानों को दिखाने के लिए',
            kn: 'ನಿಮಗೆ ಹತ್ತಿರದ ರೈತರನ್ನು ತೋರಿಸಲು',
            te: 'మీకు సమీపంలోని రైతులను చూపించడానికి',
            ta: 'உங்களுக்கு அருகிலுள்ள விவசாயிகளைக் காட்ட',
            mr: 'तुम्हाला जवळचे शेतकरी दाखवण्यासाठी',
        },
        selectState: {
            en: 'Select State',
            hi: 'राज्य चुनें',
            kn: 'ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ',
            te: 'రాష్ట్రం ఎంచుకోండి',
            ta: 'மாநிலத்தைத் தேர்வுசெய்க',
            mr: 'राज्य निवडा',
        },
        district: {
            en: 'District',
            hi: 'जिला',
            kn: 'ಜಿಲ್ಲೆ',
            te: 'జిల్లా',
            ta: 'மாவட்டம்',
            mr: 'जिल्हा',
        },
        address: {
            en: 'Address',
            hi: 'पता',
            kn: 'ವಿಳಾಸ',
            te: 'చిరునామా',
            ta: 'முகவரி',
            mr: 'पत्ता',
        },
        voicePlaceholder: {
            en: 'Tap to speak address',
            hi: 'पता बोलने के लिए टैप करें',
            kn: 'ವಿಳಾಸ ಹೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
            te: 'చిరునామా చెప్పడానికి నొక్కండి',
            ta: 'முகவரியைச் சொல்ல தட்டவும்',
            mr: 'पत्ता सांगण्यासाठी टॅप करा',
        },
    },
    buyerType: {
        title: {
            en: 'What type of buyer are you?',
            hi: 'आप किस प्रकार के खरीदार हैं?',
            kn: 'ನೀವು ಯಾವ ರೀತಿಯ ಖರೀದಿದಾರರು?',
            te: 'మీరు ఏ రకమైన కొనుగోలుదారు?',
            ta: 'நீங்கள் எந்த வகையான வாங்குபவர்?',
            mr: 'तुम्ही कोणत्या प्रकारचे खरेदीदार आहात?',
        },
        description: {
            en: 'Select the option that best describes you',
            hi: 'वह विकल्प चुनें जो आपका सबसे अच्छा वर्णन करता है',
            kn: 'ನಿಮ್ಮನ್ನು ಉತ್ತಮವಾಗಿ ವಿವರಿಸುವ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ',
            te: 'మిమ్మల్ని ఉత్తమంగా వివరించే ఎంపికను ఎంచుకోండి',
            ta: 'உங்களைச் சிறப்பாக விவரிக்கும் விருப்பத்தைத் தேர்வுசெய்க',
            mr: 'तुमचे सर्वोत्तम वर्णन करणारा पर्याय निवडा',
        },
    },
    complete: {
        title: {
            en: "You're all set! 🎉",
            hi: 'आप तैयार हैं! 🎉',
            kn: 'ನೀವು ಸಿದ್ಧರಾಗಿದ್ದೀರಿ! 🎉',
            te: 'మీరు సిద్ధంగా ఉన్నారు! 🎉',
            ta: 'நீங்கள் தயாராகிவிட்டீர்கள்! 🎉',
            mr: 'तुम्ही तयार आहात! 🎉',
        },
        description: {
            en: 'Your buyer profile is ready. Start exploring millets from verified farmers.',
            hi: 'आपकी खरीदार प्रोफ़ाइल तैयार है। सत्यापित किसानों से बाजरे की खोज शुरू करें।',
            kn: 'ನಿಮ್ಮ ಖರೀದಿದಾರರ ಪ್ರೊಫೈಲ್ ಸಿದ್ಧವಾಗಿದೆ. ಪರಿಶೀಲಿಸಿದ ರೈತರಿಂದ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ಪ್ರಾರಂಭಿಸಿ.',
            te: 'మీ కొనుగోలుదారు ప్రొఫైల్ సిద్ధంగా ఉంది. ధృవీకరించబడిన రైతుల నుండి చిరుధాన్యాలను అన్వేషించడం ప్రారంభించండి.',
            ta: 'உங்கள் வாங்குபவர் சுயவிவரம் தயாராக உள்ளது. சரிபார்க்கப்பட்ட விவசாயிகளிடமிருந்து தினைகளை ஆராயத் தொடங்குங்கள்.',
            mr: 'तुमची खरेदीदार प्रोफाइल तयार आहे. पडताळलेल्या शेतकऱ्यांकडून बाजरी शोधणे सुरू करा.',
        },
    },
    header: {
        registration: {
            en: 'Buyer Registration',
            hi: 'खरीदार पंजीकरण',
            kn: 'ಖರೀದಿದಾರ ನೋಂದಣಿ',
            te: 'కొనుగోలుదారు నమోదు',
            ta: 'வாங்குபவர் பதிவு',
            mr: 'खरेदीदार नोंदणी',
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

export default function BuyerRegister() {
    const router = useRouter();
    const { language: siteLanguage, setLanguage: setSiteLanguage } = useLanguage();
    const { refreshUser } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        otp: '',
        state: '',
        district: '',
        address: '',
        buyerType: '',
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
            console.log('🔧 Developer bypass: Setting role to buyer');
            setDevUserRole('buyer');
        }

        if (formData.phone.length !== 10) {
            setError(getText('phone', 'invalidPhone'));
            return;
        }
        // Validate Indian mobile number format (must start with 6-9) - skip for dev phone
        if (!/^[6-9]/.test(formData.phone) && !isDevPhone(formData.phone)) {
            setError(getText('phone', 'invalidPhoneFormat'));
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
            // Developer bypass is handled inside authApi.verifyOtp
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

    const states = [
        'Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu',
        'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Gujarat'
    ];

    const buyerTypes = [
        { value: 'retail', label: 'Retail Consumer' },
        { value: 'bulk', label: 'Bulk Buyer' },
        { value: 'distributor', label: 'Distributor' },
        { value: 'exporter', label: 'Exporter' },
        { value: 'institutional', label: 'Institutional Buyer' },
    ];

    const steps = [
        {
            id: 'welcome',
            title: getText('welcome', 'title'),
            description: getText('welcome', 'description'),
            icon: <span className="text-4xl">🛍️</span>,
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
                                        onClick={() => router.push('/login?role=buyer')}
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
            id: 'location',
            title: getText('location', 'title'),
            description: getText('location', 'description'),
            icon: <MapPin className="w-10 h-10" />,
            voicePrompt: getText('location', 'description'),
            input: (
                <div className="space-y-4">
                    <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                        <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder={getText('location', 'selectState')} />
                        </SelectTrigger>
                        <SelectContent>
                            {states.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder={getText('location', 'district')}
                        value={formData.district}
                        onChange={(e) => updateField('district', e.target.value)}
                        className="h-14 text-lg"
                    />
                    <Input
                        placeholder={getText('location', 'address')}
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        className="h-14 text-lg"
                    />
                    <div className="flex justify-center">
                        <VoiceButton
                            onTranscript={handleVoiceInput('address')}
                            placeholder={getText('location', 'voicePlaceholder')}
                            size="md"
                        />
                    </div>
                </div>
            ),
            canProceed: formData.state.length > 0 && formData.district.trim().length >= 2 && formData.address.trim().length >= 5,
        },
        {
            id: 'buyerType',
            title: getText('buyerType', 'title'),
            description: getText('buyerType', 'description'),
            icon: <Building2 className="w-10 h-10" />,
            voicePrompt: getText('buyerType', 'description'),
            input: (
                <div className="space-y-4">
                    <Select value={formData.buyerType} onValueChange={(v) => updateField('buyerType', v)}>
                        <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder="Select Buyer Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {buyerTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ),
            canProceed: formData.buyerType.length > 0,
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
        console.log('=== handleComplete called (Buyer) ===');
        console.log('formData:', formData);

        const payload = {
            name: formData.name,
            language: formData.language,
            district: formData.district,
            state: formData.state,
            address: formData.address,
            buyer_type: formData.buyerType,
        };

        console.log('Sending payload to API:', payload);

        try {
            const result = await userApi.onboardBuyer(payload);
            console.log('API Response:', result);
            await refreshUser();
            router.push('/buyer/dashboard');
        } catch (err) {
            console.error('Onboarding API failed:', err);
            setTimeout(() => router.push('/buyer/dashboard'), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-card/50 backdrop-blur">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xl">🛍️</span>
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
