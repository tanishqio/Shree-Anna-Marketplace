"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import {
    FileText, ShieldAlert, BadgeIndianRupee, Landmark, Link as LinkIcon,
    BookOpen, Fingerprint, Building, ArrowLeft, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpeakButton } from '@/components/SpeakButton';
import Link from 'next/link';
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function KrishiPathshalaPage() {
    const [role, setRole] = useState('farmer');
    const [showHelp, setShowHelp] = useState(false);
    const { language } = useLanguage();

    // Section Animation Variant
    const sectionVariant = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    // Content Data Structure
    const contentSections = [
        {
            id: 'intro',
            icon: FileText,
            color: 'text-primary',
            borderColor: 'border-l-primary',
            title: {
                en: "What is Krishi Pathshala?",
                hi: "कृषि पाठशाला क्या है?",
                kn: "ಕೃಷಿ ಪಾಠಶಾಲೆ ಹೋದರೇನು?",
                te: "కృషి పాఠశాల అంటే ఏమిటి?",
                ta: "கிருஷி பாடசாலை என்றால் என்ன?",
                mr: "कृषी पाठशाला म्हणजे काय?"
            },
            content: {
                en: "This page, “Krishi Pathshala,” is designed as a clear, simple guide for farmers — explaining essential governmental procedures, documentation, land & tax information, and giving easy-to-follow instructions. It’s a one-stop place to understand KYC, Aadhaar, land registration, tax/TDS, and more — helping you stay informed and compliant.",
                hi: "“कृषि पाठशाला” किसानों के लिए बनाया गया एक सरल और स्पष्ट गाइड पेज है — जहाँ सरकारी प्रक्रियाओं, दस्तावेजों, भूमि और टैक्स-संबंधित जानकारी सरल भाषा में मिलेगी। KYC, आधार, भूमि पंजीकरण, टैक्स / TDS आदि सब एक ही जगह समझने योग्य होंगे।",
                kn: "“ಕೃಷಿ ಪಾಠಶಾಲೆ” ರೈತರಿಗೆ ಒಂದು ಸ್ಪಷ್ಟ, ಸರಳ ಮಾರ್ಗದರ್ಶಿಯಾಗಿದೆ — ಅಗತ್ಯ ಸರ್ಕಾರಿ ಕಾರ್ಯವಿಧಾನಗಳು, ದಾಖಲೆಗಳು, ಭೂಮಿ ಮತ್ತು ತೆರಿಗೆ ಮಾಹಿತಿಯನ್ನು ವಿವರಿಸುತ್ತದೆ. ನಿಮ್ಮನ್ನು ಮಾಹಿತಿಯುಕ್ತವಾಗಿರಿಸಲು ಇದು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
                te: "“కృషి పాఠశాల” రైతులకు స్పష్టమైన, సరళమైన మార్గదర్శి — అవసరమైన ప్రభుత్వ విధానాలు, పత్రాలు, భూమి మరియు పన్ను సమాచారాన్ని వివరిస్తుంది. ఇది మీకు సమాచారం మరియు అనుకూలంగా ఉండటానికి సహాయపడుతుంది.",
                ta: "“கிருஷி பாடசாலை” விவசாயிகளுக்கான தெளிவான, எளிய வழிகாட்டியாகும் — அத்தியாவசிய அரசாங்க நடைமுறைகள், ஆவணங்கள், நிலம் மற்றும் வரி தகவல்களை விளக்குகிறது.",
                mr: "“कृषी पाठशाला” शेतकऱ्यांसाठी एक स्पष्ट आणि सोपे मार्गदर्शक आहे — आवश्यक सरकारी प्रक्रिया, कागदपत्रे, जमीन आणि कर माहिती स्पष्ट करते. हे तुम्हाला माहितीपूर्ण राहण्यास मदत करते."
            }
        },
        {
            id: 'kyc',
            icon: FileText,
            color: 'text-accent-foreground',
            borderColor: 'border-l-accent',
            title: {
                en: "KYC Guide",
                hi: "KYC गाइड",
                kn: "KYC ಮಾರ್ಗದರ್ಶಿ",
                te: "KYC గైడ్",
                ta: "KYC வழிகாட்டி",
                mr: "KYC मार्गदर्शक"
            },
            content: {
                en: "Explains what “KYC” (Know Your Customer) means, why identity verification is important for subsidies and banking, and lists required documents (Aadhaar, Identity Proof).\n\nRequired Documents:\n• Identity Proof (Aadhaar, Voter ID)\n• Address Proof\n• Passport Size Photo",
                hi: "“KYC क्या है” — किसानों के लिए पहचान और पते की पुष्टि क्यों ज़रूरी है। किस तरह का दस्तावेज़ चाहिए होता है (पहचान प्रमाण, पता प्रमाण, आधार आदि)।\n\nचरण: अपने नजदीकी बैंक या सहकारी समिति में जाकर KYC फॉर्म भरें और दस्तावेज़ जमा करें。",
                kn: "“KYC” ಎಂದರೇನು, ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ಬ್ಯಾಂಕಿಂಗ್‌ಗೆ ಗುರುತಿನ ಪರಿಶೀಲನೆ ಏಕೆ ಮುಖ್ಯ ಎಂದು ವಿವರಿಸುತ್ತದೆ. ಅಗತ್ಯ ದಾಖಲೆಗಳು: ಗುರುತಿನ ಪುರಾವೆ (ಆಧಾರ್), ವಿಳಾಸ ಪುರಾವೆ, ಫೋಟೋ.",
                te: "“KYC” అంటే ఏమిటి, సబ్సిడీలు మరియు బ్యాంకింగ్‌కు గుర్తింపు ధృవీకరణ ఎందుకు ముఖ్యమో వివరిస్తుంది. అవసరమైన పత్రాలు: గుర్తింపు రుజువు (ఆధార్), చిరునామా రుజువు, ఫోటో.",
                ta: "“KYC” என்றால் என்ன, மானியங்கள் மற்றும் வங்கிச் சேவைகளுக்கு அடையாளச் சரிபார்ப்பு ஏன் முக்கியம் என்பதை விளக்குகிறது.த் தேவையான ஆவணங்கள்: அடையாளச் சான்று (ஆதார்), முகவரிச் சான்று, புகைப்படம்.",
                mr: "“KYC” म्हणजे काय, अनुदाने आणि बँकिंगसाठी ओळख पडताळणी का महत्त्वाची आहे हे स्पष्ट करते. आवश्यक कागदपत्रे: ओळख पुरावा (आधार), पत्त्याचा पुरावा, फोटो."
            }
        },
        {
            id: 'aadhaar',
            icon: Fingerprint,
            color: 'text-secondary',
            borderColor: 'border-l-secondary',
            title: {
                en: "Aadhaar Information",
                hi: "आधार जानकारी",
                kn: "ಆಧಾರ್ ಮಾಹಿತಿ",
                te: "ఆధార్ సమాచారం",
                ta: "ஆதார் தகவல்",
                mr: "आधार माहिती"
            },
            content: {
                en: "Aadhaar is a 12-digit unique identity number. It is mandatory for accessing subsidies, banking services, and linking with land records.",
                hi: "Aadhaar क्या है — भारत सरकार द्वारा जारी एक 12-अंक पहचान संख्या। यह सब्सिडी और बैंकिंग सेवाओं के लिए अनिवार्य है।",
                kn: "ಆಧಾರ್ 12-ಅಂಕಿಯ ಅನನ್ಯ ಗುರುತಿನ ಸಂಖ್ಯೆ. ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ಬ್ಯಾಂಕಿಂಗ್ ಸೇವೆಗಳಿಗೆ ಇದು ಕಡ್ಡಾಯವಾಗಿದೆ.",
                te: "ఆధార్ 12-అంకెల ప్రత్యేక గుర్తింపు సంఖ్య. సబ్సిడీలు మరియు బ్యాంకింగ్ సేవలకు ఇది తప్పనిసరి.",
                ta: "ஆதார் ஒரு 12 இலக்க தனித்துவ அடையாள எண். மானியங்கள் மற்றும் வங்கிச் சேவைகளுக்கு இது கட்டாயமாகும்.",
                mr: "आधार हा 12-अंकी अद्वितीय ओळख क्रमांक आहे. सबसिडी आणि बँकिंग सेवांसाठी हे अनिवार्य आहे."
            },
            link: { url: "https://uidai.gov.in/en/", text: "Visit UIDAI Official Site" }
        },
        {
            id: 'lost-aadhaar',
            icon: ShieldAlert,
            color: 'text-destructive',
            borderColor: 'border-l-destructive',
            title: {
                en: "Lost Aadhaar & Security",
                hi: "खोया आधार और सुरक्षा",
                kn: "ಕಳೆದುಹೋದ ಆಧಾರ್ ಮತ್ತು ಭದ್ರತೆ",
                te: "కోల్పోయిన ఆధార్ & భద్రత",
                ta: "தொலைந்த ஆதார் & பாதுகாப்பு",
                mr: "हरवलेले आधार आणि सुरक्षा"
            },
            content: {
                en: "If lost, retrieve it via the official MyAadhaar portal. WARNING: Never share OTP or PIN with unknown callers.",
                hi: "अगर Aadhaar खो जाए, तो आधिकारिक पोर्टल का उपयोग करें। किसी अनजान व्यक्ति को OTP या निजी जानकारी न दें।",
                kn: "ಕಳೆದುಹೋದರೆ, ಅಧಿಕೃತ MyAadhaar ಪೋರ್ಟಲ್ ಮೂಲಕ ಅದನ್ನು ಹಿಂಪಡೆಯಿರಿ. ಎಚ್ಚರಿಕೆ: ಅಪರಿಚಿತರೊಂದಿಗೆ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
                te: "కోల్పోతే, అధికారిక MyAadhaar పోర్టల్ ద్వారా పొందండి. హెచ్చరిక: తెలియని వ్యక్తులతో OTP పంచుకోవద్దు.",
                ta: "தொலைந்துவிட்டால், MyAadhaar போர்டல் வழியாக மீட்டெடுக்கவும். எச்சரிக்கை: தெரியாதவர்களுடன் OTP பகிர வேண்டாம்.",
                mr: "हरवल्यास, अधिकृत MyAadhaar पोर्टलद्वारे मिळवा. सावधगिरी: अनोळखी व्यक्तीसोबत OTP शेअर करू नका."
            },
            link: { url: "https://uidai.gov.in/en/my-aadhaar/avail-aadhaar-services.html", text: "Aadhaar Services Portal" }
        },
        {
            id: 'tax',
            icon: BadgeIndianRupee,
            color: 'text-primary',
            borderColor: 'border-l-primary',
            title: {
                en: "Tax & TDS Basics",
                hi: "टैक्स और टीडीएस",
                kn: "ತೆರಿಗೆ ಮತ್ತು TDS",
                te: "పన్ను & TDS",
                ta: "வரி & TDS",
                mr: "कर आणि TDS"
            },
            content: {
                en: "Understand when TDS (Tax Deducted at Source) applies to your earnings from produce or land. Check your status on the Income Tax portal.",
                hi: "कर (Tax) और TDS क्या है — जानें कि आपकी उपज या आय पर टैक्स कब लागू होता है।",
                kn: "ನಿಮ್ಮ ಕೃಷಿ ಆದಾಯಕ್ಕೆ TDS ಯಾವಾಗ ಅನ್ವಯಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ತಿಳಿಯಿರಿ.",
                te: "మీ పంట ఆదాయానికి TDS ఎప్పుడు వర్తిస్తుందో తెలుసుకోండి.",
                ta: "உங்கள் வருவாய்க்கு TDS எப்போது பொருந்தும் என்பதைப் புரிந்து கொள்ளுங்கள்.",
                mr: "आपल्या उत्पन्नावर टीडीएस कधी लागू होतो हे समजून घ्या."
            },
            link: { url: "https://www.incometax.gov.in/iec/foportal/", text: "Income Tax e-Filing" }
        },
        {
            id: 'pan-registration',
            icon: FileText,
            color: 'text-accent-foreground',
            borderColor: 'border-l-accent',
            title: {
                en: "PAN Card Registration",
                hi: "पैन कार्ड पंजीकरण",
                kn: "ಪ್ಯಾನ್ ಕಾರ್ಡ್ ನೋಂದಣಿ",
                te: "PAN కార్డ్ నమోదు",
                ta: "PAN கார்டு பதிவு",
                mr: "पॅन कार्ड नोंदणी"
            },
            content: {
                en: "PAN (Permanent Account Number) is a 10-character alphanumeric identifier for all taxpayers. Required for banking, property transactions, and receiving subsidies over ₹50,000.\n\nRequired Documents:\n• Aadhaar Card (for individual)\n• Passport-sized photograph\n• Form 49A (for Indian citizens)",
                hi: "पैन (स्थायी खाता संख्या) सभी करदाताओं के लिए 10-अंकों की पहचान है। बैंकिंग, संपत्ति लेनदेन और ₹50,000 से अधिक सब्सिडी प्राप्त करने के लिए आवश्यक।\n\nआवश्यक दस्तावेज:\n• आधार कार्ड\n• पासपोर्ट आकार का फोटो\n• फॉर्म 49A (भारतीय नागरिकों के लिए)",
                kn: "PAN ಎಲ್ಲಾ ತೆರಿಗೆದಾರರಿಗೆ 10-ಅಕ್ಷರಗಳ ಗುರುತು. ಬ್ಯಾಂಕಿಂಗ್ ಮತ್ತು ಆಸ್ತಿ ವಹಿವಾಟುಗಳಿಗೆ ಅಗತ್ಯ. ದಾಖಲೆಗಳು: ಆಧಾರ್, ಫೋಟೋ, ಫಾರ್ಮ್ 49A.",
                te: "PAN అన్ని పన్ను చెల్లింపుదారులకు 10-అక్షరాల గుర్తింపు. బ్యాంకింగ్ మరియు ఆస్తి లావాదేవీలకు అవసరం. పత్రాలు: ఆధార్, ఫోటో, ఫారం 49A.",
                ta: "PAN அனைத்து வரி செலுத்துவோருக்கும் 10-எழுத்து அடையாளம். வங்கி மற்றும் சொத்து பரிவர்த்தனைகளுக்கு அவசியம். ஆவணங்கள்: ஆதார், புகைப்படம், படிவம் 49A.",
                mr: "PAN सर्व करदात्यांसाठी 10-अक्षरी ओळख. बँकिंग आणि मालमत्ता व्यवहारांसाठी आवश्यक. कागदपत्रे: आधार, फोटो, फॉर्म 49A."
            },
            link: { url: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html", text: "Apply for PAN (NSDL)" }
        },
        {
            id: 'lost-pan',
            icon: ShieldAlert,
            color: 'text-destructive',
            borderColor: 'border-l-destructive',
            title: {
                en: "Lost PAN Card",
                hi: "खोया पैन कार्ड",
                kn: "ಕಳೆದುಹೋದ ಪ್ಯಾನ್ ಕಾರ್ಡ್",
                te: "కోల్పోయిన PAN కార్డ్",
                ta: "தொலைந்த PAN கார்டு",
                mr: "हरवलेले पॅन कार्ड"
            },
            content: {
                en: "If your PAN card is lost or damaged, you can request a reprint online through the NSDL portal. You need your existing PAN number to apply.\n\nSteps:\n• Visit NSDL website\n• Select 'Reprint of PAN Card'\n• Enter your PAN number and verify via OTP\n• Pay the processing fee (approx ₹50-110)",
                hi: "अगर आपका पैन कार्ड खो गया है या क्षतिग्रस्त हो गया है, तो आप NSDL पोर्टल के माध्यम से ऑनलाइन पुनर्मुद्रण का अनुरोध कर सकते हैं।\n\nचरण:\n• NSDL वेबसाइट पर जाएं\n• 'पैन कार्ड का पुनर्मुद्रण' चुनें\n• अपना पैन नंबर दर्ज करें और OTP से सत्यापित करें\n• प्रोसेसिंग शुल्क का भुगतान करें (लगभग ₹50-110)",
                kn: "PAN ಕಾರ್ಡ್ ಕಳೆದುಹೋದರೆ, NSDL ಪೋರ್ಟಲ್ ಮೂಲಕ ಮರುಮುದ್ರಣಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ. OTP ಮೂಲಕ ಪರಿಶೀಲಿಸಿ.",
                te: "PAN కార్డ్ పోయినట్లయితే, NSDL పోర్టల్ ద్వారా పునర్ముద్రణకు దరఖాస్తు చేయండి. OTP ద్వారా ధృవీకరించండి.",
                ta: "PAN கார்டு தொலைந்தால், NSDL போர்டல் வழியாக மறுபதிப்புக்கு விண்ணப்பிக்கவும். OTP மூலம் சரிபார்க்கவும்.",
                mr: "PAN कार्ड हरवल्यास, NSDL पोर्टलद्वारे पुनर्मुद्रणासाठी अर्ज करा. OTP द्वारे सत्यापित करा."
            },
            link: { url: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html", text: "Reprint PAN Card (NSDL)" }
        },
        {
            id: 'voter-registration',
            icon: FileText,
            color: 'text-secondary',
            borderColor: 'border-l-secondary',
            title: {
                en: "Voter Card Registration",
                hi: "वोटर कार्ड पंजीकरण",
                kn: "ಮತದಾರರ ಕಾರ್ಡ್ ನೋಂದಣಿ",
                te: "ఓటర్ కార్డ్ నమోదు",
                ta: "வாக்காளர் அட்டை பதிவு",
                mr: "मतदार कार्ड नोंदणी"
            },
            content: {
                en: "Voter ID (EPIC) is essential for voting and serves as identity proof. Register via the National Voters' Service Portal (NVSP).\n\nRequired Documents:\n• Aadhaar Card / Passport / PAN\n• Address Proof (Electricity Bill, Rent Agreement)\n• Age Proof (Birth Certificate, Class 10 Marksheet)\n• Passport-sized photograph",
                hi: "वोटर आईडी (EPIC) मतदान के लिए आवश्यक है और पहचान प्रमाण के रूप में काम करता है। राष्ट्रीय मतदाता सेवा पोर्टल (NVSP) के माध्यम से पंजीकरण करें।\n\nआवश्यक दस्तावेज:\n• आधार कार्ड / पासपोर्ट / पैन\n• पता प्रमाण (बिजली बिल, किराया समझौता)\n• आयु प्रमाण (जन्म प्रमाणपत्र, कक्षा 10 मार्कशीट)\n• पासपोर्ट आकार का फोटो",
                kn: "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ (EPIC) ಮತದಾನಕ್ಕೆ ಅಗತ್ಯ. NVSP ಪೋರ್ಟಲ್ ಮೂಲಕ ನೋಂದಾಯಿಸಿ. ದಾಖಲೆಗಳು: ಆಧಾರ್, ವಿಳಾಸ ಪುರಾವೆ, ವಯಸ್ಸಿನ ಪುರಾವೆ.",
                te: "ఓటర్ ID (EPIC) ఓటింగ్‌కు అవసరం. NVSP పోర్టల్ ద్వారా నమోదు చేయండి. పత్రాలు: ఆధార్, చిరునామా రుజువు, వయస్సు రుజువు.",
                ta: "வாக்காளர் அடையாளம் (EPIC) வாக்களிக்க அவசியம். NVSP போர்டல் வழியாக பதிவு செய்யுங்கள். ஆவணங்கள்: ஆதார், முகவரி சான்று, வயது சான்று.",
                mr: "मतदार ओळखपत्र (EPIC) मतदानासाठी आवश्यक. NVSP पोर्टलद्वारे नोंदणी करा. कागदपत्रे: आधार, पत्ता पुरावा, वय पुरावा."
            },
            link: { url: "https://www.nvsp.in/", text: "Register on NVSP Portal" }
        },
        {
            id: 'lost-voter',
            icon: ShieldAlert,
            color: 'text-destructive',
            borderColor: 'border-l-destructive',
            title: {
                en: "Lost Voter Card",
                hi: "खोया वोटर कार्ड",
                kn: "ಕಳೆದುಹೋದ ಮತದಾರರ ಕಾರ್ಡ್",
                te: "కోల్పోయిన ఓటర్ కార్డ్",
                ta: "தொலைந்த வாக்காளர் அட்டை",
                mr: "हरवलेले मतदार कार्ड"
            },
            content: {
                en: "If your Voter ID is lost or damaged, apply for a duplicate/replacement via the NVSP portal using Form 002.\n\nSteps:\n• Login at nvsp.in\n• Select Form 002 (Correction/Replacement)\n• Fill details and upload documents\n• Submit and track application status",
                hi: "अगर आपका वोटर आईडी खो गया या क्षतिग्रस्त हो गया है, तो NVSP पोर्टल पर फॉर्म 002 का उपयोग करके डुप्लीकेट के लिए आवेदन करें।\n\nचरण:\n• nvsp.in पर लॉगिन करें\n• फॉर्म 002 (सुधार/प्रतिस्थापन) चुनें\n• विवरण भरें और दस्तावेज़ अपलोड करें\n• आवेदन जमा करें और स्थिति ट्रैक करें",
                kn: "ಮತದಾರರ ಕಾರ್ಡ್ ಕಳೆದುಹೋದರೆ, NVSP ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಫಾರ್ಮ್ 002 ಬಳಸಿ ಡುಪ್ಲಿಕೇಟ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
                te: "ఓటర్ కార్డ్ పోయినట్లయితే, NVSP పోర్టల్‌లో ఫారం 002 ఉపయోగించి నకిలీకి దరఖాస్తు చేయండి.",
                ta: "வாக்காளர் அட்டை தொலைந்தால், NVSP போர்டலில் படிவம் 002 பயன்படுத்தி நகலுக்கு விண்ணப்பிக்கவும்.",
                mr: "मतदार कार्ड हरवल्यास, NVSP पोर्टलवर फॉर्म 002 वापरून डुप्लिकेटसाठी अर्ज करा."
            },
            link: { url: "https://www.nvsp.in/", text: "Apply for Duplicate Voter ID" }
        },
        {
            id: 'bank-account',
            icon: Building,
            color: 'text-primary',
            borderColor: 'border-l-primary',
            title: {
                en: "How to Open a Bank Account",
                hi: "बैंक खाता कैसे खोलें",
                kn: "ಬ್ಯಾಂಕ್ ಖಾತೆ ಹೇಗೆ ತೆರೆಯುವುದು",
                te: "బ్యాంక్ ఖాతా ఎలా తెరవాలి",
                ta: "வங்கி கணக்கு எவ்வாறு திறப்பது",
                mr: "बँक खाते कसे उघडायचे"
            },
            content: {
                en: "A bank account is essential for receiving subsidies, selling produce, and saving money. The process is simple and can often be done online.\n\nRequired Documents:\n• Aadhaar Card (mandatory)\n• PAN Card (for higher transactions)\n• 2 Passport-sized photographs\n• Initial deposit (₹500-1000 for savings)\n\nTip: Watch tutorial videos below for step-by-step guidance!",
                hi: "बैंक खाता सब्सिडी प्राप्त करने, उपज बेचने और पैसे बचाने के लिए आवश्यक है। प्रक्रिया सरल है और अक्सर ऑनलाइन की जा सकती है।\n\nआवश्यक दस्तावेज:\n• आधार कार्ड (अनिवार्य)\n• पैन कार्ड (उच्च लेनदेन के लिए)\n• 2 पासपोर्ट आकार के फोटो\n• प्रारंभिक जमा (₹500-1000 बचत के लिए)\n\nसुझाव: चरण-दर-चरण मार्गदर्शन के लिए नीचे ट्यूटोरियल वीडियो देखें!",
                kn: "ಸಬ್ಸಿಡಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ಮತ್ತು ಹಣವನ್ನು ಉಳಿಸಲು ಬ್ಯಾಂಕ್ ಖಾತೆ ಅಗತ್ಯ. ದಾಖಲೆಗಳು: ಆಧಾರ್, ಪ್ಯಾನ್, ಫೋಟೋಗಳು, ಆರಂಭಿಕ ಠೇವಣಿ.",
                te: "సబ్సిడీలు పొందడానికి మరియు డబ్బు ఆదా చేయడానికి బ్యాంక్ ఖాతా అవసరం. పత్రాలు: ఆధార్, PAN, ఫోటోలు, ప్రారంభ డిపాజిట్.",
                ta: "மானியங்கள் பெறுவதற்கும் பணத்தைச் சேமிப்பதற்கும் வங்கி கணக்கு அவசியம். ஆவணங்கள்: ஆதார், PAN, புகைப்படங்கள், ஆரம்ப வைப்பு.",
                mr: "सबसिडी मिळवण्यासाठी आणि पैसे वाचवण्यासाठी बँक खाते आवश्यक आहे. कागदपत्रे: आधार, PAN, फोटो, प्रारंभिक ठेव."
            },
            youtubeLinks: [
                { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", text: "बैंक खाता कैसे खुलवाते हैं?" },
                { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", text: "SBI में खाता खोलने का फॉर्म कैसे भरे" },
                { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", text: "Bank of India Account Opening" }
            ],
            fullWidth: true
        },
        {
            id: 'land',
            icon: Building,
            color: 'text-secondary',
            borderColor: 'border-l-secondary',
            title: {
                en: "Land & Property Registration",
                hi: "भूमि पंजीकरण",
                kn: "ಭೂಮಿ ನೋಂದಣಿ",
                te: "భూమి నమోదు",
                ta: "நிலப் பதிவு",
                mr: "जमीन नोंदणी"
            },
            content: {
                en: "Registration is crucial to secure ownership rights and access government benefits. You can often do this via your local Sub-Registrar office or online state portals (Digital India Land Records).\n\nWhy it matters:\n• Secure Ownership Rights\n• Access to Loans & Subsidies\n• Avoid Legal Disputes",
                hi: "भूमि/संपत्ति पंजीकरण क्यों ज़रूरी है — मालिकाना हक़ सुरक्षित करना और सरकारी योजनाओं का लाभ लेना। आप इसे स्थानीय कार्यालय या राज्य के ऑनलाइन पोर्टल के माध्यम से कर सकते हैं।\n\nलाभ:\n• मालिकाना हक़ की सुरक्षा\n• ऋण और सब्सिडी की सुविधा\n• कानूनी विवादों से बचाव",
                kn: "ಮಾಲೀಕತ್ವದ ಹಕ್ಕುಗಳನ್ನು ಭದ್ರಪಡಿಸಿಕೊಳ್ಳಲು ನೋಂದಣಿ ಮುಖ್ಯವಾಗಿದೆ. ಇದು ಸಾಲಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳಿಗೆ ಪ್ರವೇಶವನ್ನು ನೀಡುತ್ತದೆ.",
                te: "యాజమాన్య హక్కులను సురక్షితం చేయడానికి నమోదు ముఖ్యం. ఇది రుణాలు మరియు సబ్సిడీలకు ప్రవేశం కల్పిస్తుంది.",
                ta: "உரிமை உரிமைகளைப் பாதுகாக்க பதிவு அவசியம். இது கடன்கள் மற்றும் மானியங்களுக்கான அணுகலை வழங்குகிறது.",
                mr: "मालकी हक्क सुरक्षित करण्यासाठी नोंदणी महत्त्वाची आहे. हे कर्ज आणि अनुदानांमध्ये प्रवेश देते."
            },
            fullWidth: true
        }
    ];

    // Combine all text for page read-aloud parameters
    const fullPageText = {
        en: contentSections.map(s => `${s.title.en}. ${s.content.en}`).join('\n\n'),
        hi: contentSections.map(s => `${s.title.hi}. ${s.content.hi}`).join('\n\n'),
        kn: contentSections.map(s => `${s.title.kn}. ${s.content.kn}`).join('\n\n'),
        te: contentSections.map(s => `${s.title.te}. ${s.content.te}`).join('\n\n'),
        ta: contentSections.map(s => `${s.title.ta}. ${s.content.ta}`).join('\n\n'),
        mr: contentSections.map(s => `${s.title.mr}. ${s.content.mr}`).join('\n\n')
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header Section */}
                <div className="mb-8">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" asChild>
                        <Link href="/krishi-darpan">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            {language === 'hi' ? 'वापस जाएँ' : 'Back to Krishi Darpan'}
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-primary" />
                                Krishi Pathshala / कृषि पाठशाला
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg">
                                Your Guide to Government Procedures, Documents & Rights
                            </p>
                        </div>
                        <SpeakButton
                            text={fullPageText.en}
                            textHi={fullPageText.hi}
                            textKn={fullPageText.kn}
                            textTe={fullPageText.te}
                            textTa={fullPageText.ta}
                            textMr={fullPageText.mr}
                            variant="default"
                            showLabel={true}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                        />
                    </div>
                </div>

                {/* Content Cards Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {contentSections.map((section) => (
                        <motion.div
                            key={section.id}
                            initial="hidden"
                            animate="visible"
                            variants={sectionVariant}
                            className={section.fullWidth ? "md:col-span-2 mt-4" : ""}
                        >
                            <Card className={`h-full border-l-4 ${section.borderColor} shadow-sm hover:shadow-md transition-shadow relative`}>
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className={`flex items-center gap-2 text-xl font-heading ${section.color}`}>
                                            <section.icon className="w-5 h-5" />
                                            {/* @ts-ignore */}
                                            {section.title[language] || section.title.en}
                                        </CardTitle>
                                        <SpeakButton
                                            text={section.content.en}
                                            textHi={section.content.hi}
                                            textKn={section.content.kn}
                                            textTe={section.content.te}
                                            textTa={section.content.ta}
                                            textMr={section.content.mr}
                                            size="sm"
                                            className="shrink-0"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {/* @ts-ignore */}
                                            {section.content[language] || section.content.en}
                                        </p>
                                    </div>

                                    {/* Secondary Text: Always Hindi, unless current language IS Hindi (to avoid duplication) */}
                                    {language !== 'hi' && (
                                        <div className="pt-2 border-t border-border/50">
                                            <p className="text-foreground leading-relaxed font-medium whitespace-pre-wrap">
                                                {section.content.hi}
                                            </p>
                                        </div>
                                    )}

                                    {section.link && (
                                        <Button size="sm" variant="outline" className="w-full justify-between mt-4" asChild>
                                            <Link href={section.link.url} target="_blank">
                                                {section.link.text} <LinkIcon className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    )}

                                    {/* @ts-ignore */}
                                    {section.youtubeLinks && section.youtubeLinks.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                                            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                                <PlayCircle className="w-4 h-4 text-destructive" />
                                                {language === 'hi' ? 'वीडियो ट्यूटोरियल देखें:' : 'Watch Video Tutorials:'}
                                            </p>
                                            <div className="grid gap-2">
                                                {/* @ts-ignore */}
                                                {section.youtubeLinks.map((yt: any, idx: number) => (
                                                    <Button key={idx} size="sm" variant="ghost" className="w-full justify-start text-left h-auto py-2 hover:bg-destructive/10" asChild>
                                                        <Link href={yt.url} target="_blank">
                                                            <PlayCircle className="w-4 h-4 mr-2 text-destructive shrink-0" />
                                                            <span className="truncate">{yt.text}</span>
                                                        </Link>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Useful Links Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariant}
                    className="mt-12 mb-20"
                >
                    <div className="bg-muted/30 rounded-2xl p-8 border border-border">
                        <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
                            <LinkIcon className="w-6 h-6 text-primary" />
                            Useful Official Links / उपयोगी सरकारी लिंक
                        </h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1 hover:bg-white hover:border-primary/50 transition-colors" asChild>
                                <Link href="https://uidai.gov.in/en/" target="_blank" className="w-full">
                                    <span className="font-bold text-foreground flex items-center w-full justify-between">
                                        UIDAI Official Site <LinkIcon className="w-3 h-3 opacity-50" />
                                    </span>
                                    <span className="text-xs text-muted-foreground">uidai.gov.in</span>
                                </Link>
                            </Button>

                            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1 hover:bg-white hover:border-destructive/50 transition-colors" asChild>
                                <Link href="https://uidai.gov.in/en/my-aadhaar/avail-aadhaar-services.html" target="_blank" className="w-full">
                                    <span className="font-bold text-foreground flex items-center w-full justify-between">
                                        MyAadhaar Services <LinkIcon className="w-3 h-3 opacity-50" />
                                    </span>
                                    <span className="text-xs text-muted-foreground">Retrieve Lost Aadhaar</span>
                                </Link>
                            </Button>

                            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1 hover:bg-white hover:border-secondary/50 transition-colors" asChild>
                                <Link href="https://www.incometax.gov.in/iec/foportal/" target="_blank" className="w-full">
                                    <span className="font-bold text-foreground flex items-center w-full justify-between">
                                        Income Tax Portal <LinkIcon className="w-3 h-3 opacity-50" />
                                    </span>
                                    <span className="text-xs text-muted-foreground">incometax.gov.in</span>
                                </Link>
                            </Button>

                            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1 hover:bg-white hover:border-accent/50 transition-colors" asChild>
                                <Link href="https://dilrmp.gov.in/" target="_blank" className="w-full">
                                    <span className="font-bold text-foreground flex items-center w-full justify-between">
                                        Digital Land Records <LinkIcon className="w-3 h-3 opacity-50" />
                                    </span>
                                    <span className="text-xs text-muted-foreground">dilrmp.gov.in</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer onOpenHelp={() => setShowHelp(true)} />
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
