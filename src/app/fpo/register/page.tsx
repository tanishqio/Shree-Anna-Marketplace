"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    User,
    MapPin,
    Phone,
    CheckCircle,
    Mic,
    Users,
    KeyRound,
    Loader2,
    Building,
    FileText
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { languages } from '@/lib/design-tokens';
import { userApi, authApi, setAccessToken, isDevPhone, setDevUserRole } from '@/lib/api';
import { useLanguage, Language } from '@/lib/hooks/useLanguage';
import { useAuth } from '@/lib/hooks/useAuth';

// Multilingual translations for onboarding
const onboardingTexts = {
    welcome: {
        title: {
            en: 'Welcome FPOs & SHGs! 🏢',
            hi: 'एफपीओ और एसएचजी का स्वागत है! 🏢',
            kn: 'ಎಫ್‌ಪಿಒಗಳು ಮತ್ತು ಎಸ್‌ಎಚ್‌ಜಿಗಳಿಗೆ ಸುಸ್ವಾಗತ! 🏢',
            te: 'FPOలు & SHGలకు స్వాగతం! 🏢',
            ta: 'FPO கள் மற்றும் SHG களுக்கு வரவேற்கிறோம்! 🏢',
            mr: 'FPO आणि SHG चे स्वागत आहे! 🏢',
        },
        description: {
            en: "Register your organization to aggregate produce and sell directly to bulk buyers.",
            hi: 'उपज को इकट्ठा करने और थोक खरीदारों को सीधे बेचने के लिए अपने संगठन को पंजीकृत करें।',
            kn: 'ಉತ್ಪನ್ನಗಳನ್ನು ಒಟ್ಟುಗೂಡಿಸಲು ಮತ್ತು ಬೃಹತ್ ಖರೀದಿದಾರರಿಗೆ ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಲು ನಿಮ್ಮ ಸಂಸ್ಥೆಯನ್ನು ನೋಂದಾಯಿಸಿ.',
            te: 'ఉత్పత్తులను సమీకరించడానికి మరియు బల్క్ కొనుగోలుదారులకు నేరుగా విక్రయించడానికి మీ సంస్థను నమోదు చేయండి.',
            ta: 'உற்பத்தியைச் சேகரிக்கவும், மொத்தமாக வாங்குபவர்களுக்கு நேரடியாக விற்கவும் உங்கள் நிறுவனத்தைப் பதிவு செய்யவும்.',
            mr: 'उत्पादन एकत्रित करण्यासाठी आणि थेट मोठ्या खरेदीदारांना विकण्यासाठी तुमच्या संस्थेची नोंदणी करा.',
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
            en: 'Mobile Number',
            hi: 'मोबाइल नंबर',
            kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
            te: 'మొబైల్ నంబర్',
            ta: 'மொபைல் எண்',
            mr: 'मोबाइल नंबर',
        },
        description: {
            en: "Enter the representative's mobile number",
            hi: 'प्रतिनिधि का मोबाइल नंबर दर्ज करें',
            kn: 'ಪ್ರತಿನಿಧಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
            te: 'ప్రతినిధి మొబైల్ నంబర్‌ను నమోదు చేయండి',
            ta: 'பிரதிநிதியின் மொபைல் எண்ணை உள்ளிடவும்',
            mr: 'प्रतिनिधीचा मोबाइल नंबर प्रविष्ट करा',
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
            en: 'Organization Name',
            hi: 'संगठन का नाम',
            kn: 'ಸಂಸ್ಥೆಯ ಹೆಸರು',
            te: 'సంస్థ పేరు',
            ta: 'நிறுவனத்தின் பெயர்',
            mr: 'संस्थेचे नाव',
        },
        description: {
            en: 'Name of your FPO, SHG, or Cooperative',
            hi: 'अपने एफपीओ, एसएचजी, या सहकारी का नाम',
            kn: 'ನಿಮ್ಮ ಎಫ್‌ಪಿಒ, ಎಸ್‌ಎಚ್‌ಜಿ ಅಥವಾ ಸಹಕಾರಿಯ ಹೆಸರು',
            te: 'మీ FPO, SHG లేదా కోఆపరేటివ్ పేరు',
            ta: 'உங்கள் FPO, SHG அல்லது கூட்டுறவு பெயர்',
            mr: 'तुमच्या FPO, SHG किंवा सहकारी संस्थेचे नाव',
        },
        placeholder: {
            en: 'Enter organization name',
            hi: 'संगठन का नाम दर्ज करें',
            kn: 'ಸಂಸ್ಥೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
            te: 'సంస్థ పేరు నమోదు చేయండి',
            ta: 'நிறுவனத்தின் பெயரை உள்ளிடவும்',
            mr: 'संस्थेचे नाव प्रविष्ट करा',
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
            en: 'Headquarters Location',
            hi: 'मुख्यालय का स्थान',
            kn: 'ಪ್ರಧಾನ ಕಚೇರಿ ಸ್ಥಳ',
            te: 'ప్రధాన కార్యాలయం స్థానం',
            ta: 'தலைமையகம் இடம்',
            mr: 'मुख्यालय स्थान',
        },
        description: {
            en: 'Where is your organization based?',
            hi: 'आपका संगठन कहाँ स्थित है?',
            kn: 'ನಿಮ್ಮ ಸಂಸ್ಥೆ ಎಲ್ಲಿದೆ?',
            te: 'మీ సంస్థ ఎక్కడ ఉంది?',
            ta: 'உங்கள் நிறுவனம் எங்கே உள்ளது?',
            mr: 'तुमची संस्था कुठे आहे?',
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
            en: 'Tap to speak location',
            hi: 'स्थान बोलने के लिए टैप करें',
            kn: 'ಸ್ಥಳ ಹೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
            te: 'స్థానం చెప్పడానికి నొక్కండి',
            ta: 'இடத்தைச் சொல்ல தட்டவும்',
            mr: 'स्थान सांगण्यासाठी टॅप करा',
        },
    },
    orgDetails: {
        title: {
            en: 'Organization Details',
            hi: 'संगठन विवरण',
            kn: 'ಸಂಸ್ಥೆಯ ವಿವರಗಳು',
            te: 'సంస్థ వివరాలు',
            ta: 'நிறுவன விவரங்கள்',
            mr: 'संस्था तपशील',
        },
        description: {
            en: 'Select your registration type',
            hi: 'अपना पंजीकरण प्रकार चुनें',
            kn: 'ನಿಮ್ಮ ನೋಂದಣಿ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            te: 'మీ నమోదు రకాన్ని ఎంచుకోండి',
            ta: 'உங்கள் பதிவு வகையைத் தேர்வுசெய்க',
            mr: 'तुमचा नोंदणी प्रकार निवडा',
        },
        regNumber: {
            en: 'Registration Number',
            hi: 'पंजीकरण संख्या',
            kn: 'ನೋಂದಣಿ ಸಂಖ್ಯೆ',
            te: 'నమోదు సంఖ్య',
            ta: 'பதிவு எண்',
            mr: 'नोंदणी क्रमांक',
        }
    },
    membership: {
        title: {
            en: 'Membership Size',
            hi: 'सदस्यता का आकार',
            kn: 'ಸದಸ್ಯತ್ವ ಗಾತ್ರ',
            te: 'సభ్యత్వ పరిమాణం',
            ta: 'உறுப்பினர் அளவு',
            mr: 'सदस्यत्व आकार',
        },
        description: {
            en: 'How many farmers are associated with you?',
            hi: 'कितने किसान आपसे जुड़े हैं?',
            kn: 'ಎಷ್ಟು ರೈತರು ನಿಮ್ಮೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿದ್ದಾರೆ?',
            te: 'మీతో ఎంత మంది రైతులు అనుబంధంగా ఉన్నారు?',
            ta: 'எத்தனை விவசாயிகள் உங்களுடன் தொடர்புடையவர்கள்?',
            mr: 'तुमच्याशी किती शेतकरी जोडलेले आहेत?',
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
            en: 'Your FPO profile is ready. Start aggregating produce and connecting with buyers.',
            hi: 'आपकी एफपीओ प्रोफ़ाइल तैयार है। उपज इकट्ठा करना और खरीदारों से जुड़ना शुरू करें।',
            kn: 'ನಿಮ್ಮ ಎಫ್‌ಪಿಒ ಪ್ರೊಫೈಲ್ ಸಿದ್ಧವಾಗಿದೆ. ಉತ್ಪನ್ನಗಳನ್ನು ಒಟ್ಟುಗೂಡಿಸಲು ಮತ್ತು ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಲು ಪ್ರಾರಂಭಿಸಿ.',
            te: 'మీ FPO ప్రొఫైల్ సిద్ధంగా ఉంది. ఉత్పత్తులను సమీకరించడం మరియు కొనుగోలుదారులతో కనెక్ట్ అవ్వడం ప్రారంభించండి.',
            ta: 'உங்கள் FPO சுயவிவரம் தயாராக உள்ளது. உற்பத்தியைச் சேகரிக்கவும் வாங்குபவர்களுடன் இணையவும் தொடங்குங்கள்.',
            mr: 'तुमची FPO प्रोफाइल तयार आहे. उत्पादन एकत्रित करणे आणि खरेदीदारांशी संपर्क साधणे सुरू करा.',
        },
    },
    header: {
        registration: {
            en: 'FPO Registration',
            hi: 'एफपीओ पंजीकरण',
            kn: 'ಎಫ್‌ಪಿಒ ನೋಂದಣಿ',
            te: 'FPO నమోదు',
            ta: 'FPO பதிவு',
            mr: 'FPO नोंदणी',
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

export default function FpoRegister() {
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
        regType: 'fpo',
        regNumber: '',
        memberCount: '',
        language: siteLanguage,
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);
    const [devOtp, setDevOtp] = useState<string | null>(null);

    const getText = (section: keyof typeof onboardingTexts, key: string): string => {
        const lang = formData.language as Language;
        const sectionData = onboardingTexts[section] as Record<string, Record<Language, string>>;
        return sectionData[key]?.[lang] || sectionData[key]?.['en'] || '';
    };

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
            console.log('🔧 Developer bypass: Setting role to fpo');
            setDevUserRole('fpo');
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
        try {
            // Pass isRegistration=true for registration flow
            const result = await authApi.requestOtp('+91' + formData.phone, formData.language, true);
            if (result.success) {
                setOtpSent(true);
                if (result.dev_otp) {
                    setDevOtp(result.dev_otp);
                }
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
            if (result.token) {
                setAccessToken(result.token);
                setOtpVerified(true);
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

    const memberCounts = [
        { value: '1-50', label: '1–50 Members' },
        { value: '50-100', label: '50–100 Members' },
        { value: '100-300', label: '100–300 Members' },
        { value: '300+', label: '300+ Members' },
    ];

    const steps = [
        {
            id: 'welcome',
            title: getText('welcome', 'title'),
            description: getText('welcome', 'description'),
            icon: <span className="text-4xl">🏢</span>,
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
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-sm text-muted-foreground">{getText('phone', 'loginInstead')}</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/login?role=fpo')}
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
            icon: <Building className="w-10 h-10" />,
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
            id: 'orgDetails',
            title: getText('orgDetails', 'title'),
            description: getText('orgDetails', 'description'),
            icon: <FileText className="w-10 h-10" />,
            voicePrompt: getText('orgDetails', 'description'),
            input: (
                <div className="space-y-6">
                    <RadioGroup value={formData.regType} onValueChange={(v) => updateField('regType', v)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fpo" id="fpo" />
                            <Label htmlFor="fpo">FPO (Farmer Producer Org)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="shg" id="shg" />
                            <Label htmlFor="shg">SHG (Self Help Group)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="coop" id="coop" />
                            <Label htmlFor="coop">Cooperative Society</Label>
                        </div>
                    </RadioGroup>
                    <Input
                        placeholder={getText('orgDetails', 'regNumber')}
                        value={formData.regNumber}
                        onChange={(e) => updateField('regNumber', e.target.value)}
                        className="h-14 text-lg"
                    />
                </div>
            ),
            canProceed: formData.regNumber.length > 0,
        },
        {
            id: 'membership',
            title: getText('membership', 'title'),
            description: getText('membership', 'description'),
            icon: <Users className="w-10 h-10" />,
            voicePrompt: getText('membership', 'description'),
            input: (
                <div className="space-y-4">
                    <Select value={formData.memberCount} onValueChange={(v) => updateField('memberCount', v)}>
                        <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder="Select Member Count" />
                        </SelectTrigger>
                        <SelectContent>
                            {memberCounts.map((count) => (
                                <SelectItem key={count.value} value={count.value}>{count.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ),
            canProceed: formData.memberCount.length > 0,
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
        const payload = {
            name: formData.name,
            organization_name: formData.name,
            registration_no: formData.regNumber,
            address: formData.village,
            district: formData.district,
            state: formData.state,
            member_count: parseInt(formData.memberCount.split('-')[0]) || 0, // Extract min count or 0
            language: formData.language,
        };

        console.log('Sending FPO payload to API:', payload);

        try {
            const result = await userApi.onboardFpo(payload);
            console.log('API Response:', result);
            await refreshUser();
            router.push('/fpo/dashboard');
        } catch (err) {
            console.error('Onboarding API failed:', err);
            setTimeout(() => router.push('/fpo/dashboard'), 2000);
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
