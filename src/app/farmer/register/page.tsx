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
    CreditCard,
    KeyRound,
    Loader2,
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
            en: 'Welcome to Shree Anna! 🌾',
            hi: 'श्री अन्न में आपका स्वागत है! 🌾',
            kn: 'ಶ್ರೀ ಅನ್ನಕ್ಕೆ ಸುಸ್ವಾಗತ! 🌾',
            te: 'శ్రీ అన్నకు స్వాగతం! 🌾',
            ta: 'ஸ்ரீ அன்னாவிற்கு வரவேற்கிறோம்! 🌾',
            mr: 'श्री अन्नमध्ये आपले स्वागत आहे! 🌾',
        },
        description: {
            en: "Join thousands of farmers selling millets directly to buyers. Let's set up your profile in a few simple steps.",
            hi: 'हजारों किसानों से जुड़ें जो सीधे खरीदारों को मिलेट बेच रहे हैं। कुछ आसान चरणों में अपनी प्रोफ़ाइल सेट करें।',
            kn: 'ನೇರವಾಗಿ ಖರೀದಿದಾರರಿಗೆ ಸಿರಿಧಾನ್ಯ ಮಾರುತ್ತಿರುವ ಸಾವಿರಾರು ರೈತರೊಂದಿಗೆ ಸೇರಿ. ಕೆಲವು ಸರಳ ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಅನ್ನು ಸೆಟಪ್ ಮಾಡೋಣ.',
            te: 'నేరుగా కొనుగోలుదారులకు చిరుధాన్యాలు అమ్ముతున్న వేలాది రైతులతో చేరండి. కొన్ని సులభమైన దశల్లో మీ ప్రొఫైల్‌ను సెటప్ చేద్దాం.',
            ta: 'நேரடியாக வாங்குபவர்களுக்கு தினைகளை விற்கும் ஆயிரக்கணக்கான விவசாயிகளுடன் சேருங்கள். சில எளிய படிகளில் உங்கள் சுயவிவரத்தை அமைப்போம்.',
            mr: 'थेट खरेदीदारांना बाजरी विकणाऱ्या हजारो शेतकऱ्यांसह सामील व्हा. काही सोप्या टप्प्यांमध्ये तुमची प्रोफाइल सेट करूया.',
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
            en: 'What is your name?',
            hi: 'आपका नाम क्या है?',
            kn: 'ನಿಮ್ಮ ಹೆಸರೇನು?',
            te: 'మీ పేరు ఏమిటి?',
            ta: 'உங்கள் பெயர் என்ன?',
            mr: 'तुमचे नाव काय आहे?',
        },
        description: {
            en: 'Enter your full name as per your Aadhaar card',
            hi: 'आधार कार्ड के अनुसार अपना पूरा नाम दर्ज करें',
            kn: 'ನಿಮ್ಮ ಆಧಾರ್ ಕಾರ್ಡ್ ಪ್ರಕಾರ ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
            te: 'మీ ఆధార్ కార్డ్ ప్రకారం మీ పూర్తి పేరు నమోదు చేయండి',
            ta: 'உங்கள் ஆதார் அட்டையின் படி உங்கள் முழு பெயரை உள்ளிடவும்',
            mr: 'तुमच्या आधार कार्डानुसार तुमचे पूर्ण नाव प्रविष्ट करा',
        },
        placeholder: {
            en: 'Enter your full name',
            hi: 'अपना पूरा नाम दर्ज करें',
            kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
            te: 'మీ పూర్తి పేరు నమోదు చేయండి',
            ta: 'உங்கள் முழு பெயரை உள்ளிடவும்',
            mr: 'तुमचे पूर्ण नाव प्रविष्ट करा',
        },
        voicePlaceholder: {
            en: 'Tap to speak your name',
            hi: 'अपना नाम बोलने के लिए टैप करें',
            kn: 'ನಿಮ್ಮ ಹೆಸರನ್ನು ಹೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
            te: 'మీ పేరు చెప్పడానికి నొక్కండి',
            ta: 'உங்கள் பெயரைச் சொல்ல தட்டவும்',
            mr: 'तुमचे नाव सांगण्यासाठी टॅप करा',
        },
    },
    location: {
        title: {
            en: 'Where is your farm?',
            hi: 'आपका खेत कहां है?',
            kn: 'ನಿಮ್ಮ ತೋಟ ಎಲ್ಲಿದೆ?',
            te: 'మీ పొలం ఎక్కడ ఉంది?',
            ta: 'உங்கள் பண்ணை எங்கே உள்ளது?',
            mr: 'तुमचे शेत कुठे आहे?',
        },
        description: {
            en: 'This helps buyers find local sellers',
            hi: 'इससे खरीदारों को स्थानीय विक्रेता खोजने में मदद मिलती है',
            kn: 'ಇದು ಖರೀದಿದಾರರಿಗೆ ಸ್ಥಳೀಯ ಮಾರಾಟಗಾರರನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ',
            te: 'ఇది కొనుగోలుదారులకు స్థానిక విక్రేతలను కనుగొనడంలో సహాయపడుతుంది',
            ta: 'இது வாங்குபவர்கள் உள்ளூர் விற்பனையாளர்களைக் கண்டறிய உதவுகிறது',
            mr: 'यामुळे खरेदीदारांना स्थानिक विक्रेते शोधण्यात मदत होते',
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
        village: {
            en: 'Village/Town',
            hi: 'गाँव/कस्बा',
            kn: 'ಹಳ್ಳಿ/ಪಟ್ಟಣ',
            te: 'గ్రామం/పట్టణం',
            ta: 'கிராமம்/நகரம்',
            mr: 'गाव/शहर',
        },
        voicePlaceholder: {
            en: 'Tap to speak your village name',
            hi: 'अपने गाँव का नाम बोलने के लिए टैप करें',
            kn: 'ನಿಮ್ಮ ಹಳ್ಳಿ ಹೆಸರನ್ನು ಹೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
            te: 'మీ గ్రామం పేరు చెప్పడానికి నొక్కండి',
            ta: 'உங்கள் கிராமம் பெயரைச் சொல்ல தட்டவும்',
            mr: 'तुमच्या गावाचे नाव सांगण्यासाठी टॅप करा',
        },
    },
    bank: {
        title: {
            en: 'Bank Account Details',
            hi: 'बैंक खाता विवरण',
            kn: 'ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು',
            te: 'బ్యాంక్ ఖాతా వివరాలు',
            ta: 'வங்கி கணக்கு விவரங்கள்',
            mr: 'बँक खाते तपशील',
        },
        description: {
            en: 'For receiving payments (optional, can add later)',
            hi: 'भुगतान प्राप्त करने के लिए (वैकल्पिक, बाद में जोड़ सकते हैं)',
            kn: 'ಪಾವತಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲು (ಐಚ್ಛಿಕ, ನಂತರ ಸೇರಿಸಬಹುದು)',
            te: 'చెల్లింపులు పొందడానికి (ఐచ్ఛికం, తర్వాత జోడించవచ్చు)',
            ta: 'பணம் பெற (விருப்பமானது, பின்னர் சேர்க்கலாம்)',
            mr: 'पेमेंट मिळवण्यासाठी (पर्यायी, नंतर जोडता येते)',
        },
        accountNumber: {
            en: 'Bank Account Number',
            hi: 'बैंक खाता नंबर',
            kn: 'ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ',
            te: 'బ్యాంక్ ఖాతా నంబర్',
            ta: 'வங்கி கணக்கு எண்',
            mr: 'बँक खाते क्रमांक',
        },
        ifsc: {
            en: 'IFSC Code',
            hi: 'IFSC कोड',
            kn: 'IFSC ಕೋಡ್',
            te: 'IFSC కోడ్',
            ta: 'IFSC குறியீடு',
            mr: 'IFSC कोड',
        },
        voicePlaceholder: {
            en: 'Tap to speak account number',
            hi: 'खाता नंबर बोलने के लिए टैप करें',
            kn: 'ಖಾತೆ ಸಂಖ್ಯೆ ಹೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
            te: 'ఖాతా నంబర్ చెప్పడానికి నొక్కండి',
            ta: 'கணக்கு எண்ணைச் சொல்ல தட்டவும்',
            mr: 'खाते क्रमांक सांगण्यासाठी टॅप करा',
        },
        skipHint: {
            en: 'You can skip this and add bank details later',
            hi: 'आप इसे छोड़ सकते हैं और बाद में बैंक विवरण जोड़ सकते हैं',
            kn: 'ನೀವು ಇದನ್ನು ಬಿಟ್ಟು ನಂತರ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಸೇರಿಸಬಹುದು',
            te: 'మీరు దీన్ని దాటవేసి తర్వాత బ్యాంక్ వివరాలను జోడించవచ్చు',
            ta: 'இதைத் தவிர்த்து பின்னர் வங்கி விவரங்களைச் சேர்க்கலாம்',
            mr: 'तुम्ही हे वगळू शकता आणि नंतर बँक तपशील जोडू शकता',
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
            en: 'Your farmer profile is ready. Start listing your millets and connect with buyers.',
            hi: 'आपकी किसान प्रोफ़ाइल तैयार है। अपने मिलेट लिस्ट करें और खरीदारों से जुड़ें।',
            kn: 'ನಿಮ್ಮ ರೈತ ಪ್ರೊಫೈಲ್ ಸಿದ್ಧವಾಗಿದೆ. ನಿಮ್ಮ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ ಮತ್ತು ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ.',
            te: 'మీ రైతు ప్రొఫైల్ సిద్ధంగా ఉంది. మీ చిరుధాన్యాలను జాబితా చేసి కొనుగోలుదారులతో కనెక్ట్ అవ్వండి.',
            ta: 'உங்கள் விவசாயி சுயவிவரம் தயாராக உள்ளது. உங்கள் தினைகளை பட்டியலிட்டு வாங்குபவர்களுடன் இணையுங்கள்.',
            mr: 'तुमची शेतकरी प्रोफाइल तयार आहे. तुमची बाजरी सूचीबद्ध करा आणि खरेदीदारांशी संपर्क साधा.',
        },
    },
    header: {
        registration: {
            en: 'Farmer Registration',
            hi: 'किसान पंजीकरण',
            kn: 'ರೈತ ನೋಂದಣಿ',
            te: 'రైతు నమోదు',
            ta: 'விவசாயி பதிவு',
            mr: 'शेतकरी नोंदणी',
        },
        cancel: {
            en: 'Cancel',
            hi: 'रद्द करें',
            kn: 'ರದ್ದುಮಾಡಿ',
            te: 'ರದ್ದು ಮಾಡಿ',
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

export default function FarmerRegister() {
    const router = useRouter();
    const { language: siteLanguage, setLanguage: setSiteLanguage } = useLanguage();
    const { refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        otp: '',
        state: '',
        district: '',
        village: '',
        bankAccount: '',
        ifsc: '',
        language: siteLanguage, // Initialize with site language
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [autoAdvanceTrigger, setAutoAdvanceTrigger] = useState(0);

    // Helper to get translated text based on selected language
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

        // When language is updated, also update the site-wide language
        if (field === 'language' && typeof value === 'string') {
            setSiteLanguage(value as Language);
        }
    };
    const handleVoiceInput = (field: string) => (text: string) => {
        updateField(field, text);
    };

    const handleSendOtp = async () => {
        console.log('handleSendOtp called. Phone:', formData.phone);

        // Developer bypass - set role before any validation
        if (isDevPhone(formData.phone)) {
            console.log('🔧 Developer bypass: Setting role to farmer');
            setDevUserRole('farmer');
        }

        if (formData.phone.length !== 10) {
            console.log('Invalid phone length');
            setError(getText('phone', 'invalidPhone'));
            return;
        }
        // Validate Indian mobile number format (must start with 6-9) - skip for dev phone
        if (!/^[6-9]/.test(formData.phone) && !isDevPhone(formData.phone)) {
            console.log('Invalid phone format');
            setError(getText('phone', 'invalidPhoneFormat'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setShowAlreadyRegistered(false);
        try {
            console.log('Sending OTP request to API...');
            // Pass isRegistration=true for registration flow
            const result = await authApi.requestOtp('+91' + formData.phone, formData.language, true);
            console.log('OTP Request Result:', result);

            if (result.success) {
                console.log('OTP Sent successfully.');
                setOtpSent(true);
                // Store dev OTP for testing
                if (result.dev_otp) {
                    console.log('Setting Dev OTP:', result.dev_otp);
                    setDevOtp(result.dev_otp);
                } else {
                    console.log('Using standard OTP flow');
                }
                // Auto-advance to OTP step
                console.log('Triggering auto-advance in 300ms...');
                setTimeout(() => {
                    console.log('Executing auto-advance (+1)');
                    setAutoAdvanceTrigger(prev => prev + 1);
                }, 300);
            } else if (result.user_exists) {
                console.log('User already exists');
                setError(getText('phone', 'alreadyRegistered'));
                setShowAlreadyRegistered(true);
            } else {
                console.log('OTP request returned success=false');
                setError(result.message || getText('errors', 'otpFailed'));
            }
        } catch (err) {
            console.error('OTP send failed:', err);
            setError(getText('errors', 'otpFailed'));
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
                // Save the token for authenticated API calls
                setAccessToken(result.token);
                console.log('Token saved successfully');
                setOtpVerified(true);
                // Auto-advance to next step
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

    const steps = [
        {
            id: 'welcome',
            title: getText('welcome', 'title'),
            description: getText('welcome', 'description'),
            icon: <span className="text-4xl">🙏</span>,
            voicePrompt: getText('welcome', 'description'),
        },
        {
            id: 'language',
            title: getText('language', 'title'),
            description: getText('language', 'description'),
            icon: <span className="text-4xl">🗣️</span>,
            voicePrompt: getText('language', 'description'),
            input: (
                <div className="grid grid-cols-2 gap-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => updateField('language', lang.code)}
                            className={`p-4 rounded-xl border-2 transition-all ${formData.language === lang.code
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                                }`}
                        >
                            <p className="font-medium">{lang.nativeName}</p>
                            <p className="text-sm text-muted-foreground">{lang.name}</p>
                        </button>
                    ))}
                </div>
            ),
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
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-base text-muted-foreground">{getText('phone', 'loginInstead')}</p>
                                    <Button
                                        variant="outline"
                                        size="xl"
                                        onClick={() => router.push('/login?role=farmer')}
                                        className="w-full touch-target"
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
                            size="xl"
                            className="w-full touch-target"
                            disabled={formData.phone.length !== 10 || isLoading}
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : getText('phone', 'sendOtp')}
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
                            size="xl"
                            className="w-full touch-target"
                            disabled={formData.otp.length !== 6 || isLoading}
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : getText('otp', 'verify')}
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
                        placeholder={getText('location', 'village')}
                        value={formData.village}
                        onChange={(e) => updateField('village', e.target.value)}
                        className="h-14 text-lg"
                    />
                    <div className="flex justify-center">
                        <VoiceButton
                            onTranscript={handleVoiceInput('village')}
                            placeholder={getText('location', 'voicePlaceholder')}
                            size="md"
                        />
                    </div>
                </div>
            ),
            canProceed: formData.state.length > 0 && formData.district.trim().length >= 2 && formData.village.trim().length >= 2,
        },
        {
            id: 'bank',
            title: getText('bank', 'title'),
            description: getText('bank', 'description'),
            icon: <CreditCard className="w-10 h-10" />,
            voicePrompt: getText('bank', 'description'),
            input: (
                <div className="space-y-4">
                    <Input
                        placeholder={getText('bank', 'accountNumber')}
                        value={formData.bankAccount}
                        onChange={(e) => updateField('bankAccount', e.target.value)}
                        className="h-14 text-lg"
                    />
                    <Input
                        placeholder={getText('bank', 'ifsc')}
                        value={formData.ifsc}
                        onChange={(e) => updateField('ifsc', e.target.value.toUpperCase())}
                        className="h-14 text-lg"
                    />
                    <div className="flex justify-center">
                        <VoiceButton
                            onTranscript={handleVoiceInput('bankAccount')}
                            placeholder={getText('bank', 'voicePlaceholder')}
                            size="md"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        {getText('bank', 'skipHint')}
                    </p>
                </div>
            ),
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
        console.log('=== handleComplete called ===');
        console.log('formData:', formData);

        const payload = {
            name: formData.name,
            language: formData.language,
            district: formData.district,
            state: formData.state,
            village: formData.village,
            bank_account: formData.bankAccount,
            ifsc: formData.ifsc,
        };

        console.log('Sending payload to API:', payload);

        try {
            const result = await userApi.onboardFarmer(payload);
            console.log('API Response:', result);
            // Refresh user data to update auth state
            await refreshUser();
            router.push('/farmer/dashboard');
        } catch (err) {
            console.error('Onboarding API failed:', err);
            // Still redirect to dashboard even if onboarding API fails
            setTimeout(() => router.push('/farmer/dashboard'), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-card/50 backdrop-blur">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                            <img src="/lgo.png" alt="Shree Anna" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <span className="font-heading font-bold text-lg">Shree Anna</span>
                            <span className="block text-xs text-muted-foreground">{getText('header', 'registration')}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="lg" onClick={() => router.push('/')} className="touch-target">
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
