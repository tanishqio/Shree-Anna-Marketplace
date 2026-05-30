"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Camera,
  X,
  Mic,
  Leaf,
  Scale,
  Calendar,
  Droplets,
  Star,
  ImagePlus,
  WifiOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { MCQCard, MCQOption } from '@/components/MCQCard';
import { VoiceButton } from '@/components/VoiceButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { milletTypes } from '@/lib/design-tokens';
import { listingsApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface ListingFormData {
  cropType: string; // 'millets' or 'pulses'
  milletType: string;
  quantity: string;
  quantityUnit: string;
  harvestDate: string;
  cropInputs: string; // 'natural', 'mixed', or 'chemical'
  cleanliness: string; // 'machine-cleaned', 'hand-cleaned', or 'uncleaned'
  uniformity: string; // 'uniform' or 'mixed'
  drying: string; // 'dried' or 'moist'
  damagedGrains: string; // 'yes' or 'no'
  quality: string;
  moisture: string;
  organic: boolean;
  pricePerKg: string;
  location: string;
  photos: string[];
  voiceNote?: string;
  additionalNotes: string;
}

const initialFormData: ListingFormData = {
  cropType: '',
  milletType: '',
  quantity: '',
  quantityUnit: 'kg',
  harvestDate: '',
  cropInputs: '',
  cleanliness: '',
  uniformity: '',
  drying: '',
  damagedGrains: '',
  quality: '',
  moisture: '',
  organic: false,
  pricePerKg: '',
  location: '',
  photos: [],
  additionalNotes: '',
};

export default function CreateListingPage() {
  const router = useRouter();
  const [role, setRole] = useState('farmer');
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Language and TTS support
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: 'Create a new millet listing. Follow the steps to select millet type, quantity, harvest date, quality grade, and price. You can use voice input or tap to select options.',
      hi: 'नई बाजरा लिस्टिंग बनाएं। बाजरा प्रकार, मात्रा, कटाई तिथि, गुणवत्ता और मूल्य चुनने के लिए चरणों का पालन करें। आप वॉइस इनपुट का उपयोग कर सकते हैं या विकल्प चुनने के लिए टैप कर सकते हैं।',
      kn: 'ಹೊಸ ಸಿರಿಧಾನ್ಯ ಪಟ್ಟಿ ರಚಿಸಿ. ಸಿರಿಧಾನ್ಯ ಪ್ರಕಾರ, ಪ್ರಮಾಣ, ಕೊಯ್ಲು ದಿನಾಂಕ, ಗುಣಮಟ್ಟ ಮತ್ತು ಬೆಲೆ ಆಯ್ಕೆ ಮಾಡಲು ಹಂತಗಳನ್ನು ಅನುಸರಿಸಿ. ನೀವು ವಾಯ್ಸ್ ಇನ್‌ಪುಟ್ ಬಳಸಬಹುದು ಅಥವಾ ಆಯ್ಕೆಗಳನ್ನು ಟ್ಯಾಪ್ ಮಾಡಬಹುದು.',
      te: 'కొత్త చిరుధాన్యాల జాబితా సృష్టించండి. చిరుధాన్య రకం, పరిమాణం, పంటకోత తేదీ, నాణ్యత మరియు ధరను ఎంచుకోవడానికి దశలను అనుసరించండి. మీరు వాయిస్ ఇన్‌పుట్ ఉపయోగించవచ్చు లేదా ఎంపికలను ట్యాప్ చేయవచ్చు.',
      ta: 'புதிய சிறுதானிய பட்டியலை உருவாக்கவும். சிறுதானிய வகை, அளவு, அறுவடை தேதி, தரம் மற்றும் விலையைத் தேர்ந்தெடுக்க படிகளைப் பின்பற்றவும். நீங்கள் குரல் உள்ளீடு அல்லது விருப்பங்களைத் தேர்ந்தெடுக்க தட்டவும்.',
      mr: 'नवीन ज्वारी-बाजरी लिस्टिंग तयार करा. ज्वारी प्रकार, प्रमाण, कापणी तारीख, गुणवत्ता आणि किंमत निवडण्यासाठी चरणांचे अनुसरण करा. तुम्ही व्हॉइस इनपुट वापरू शकता किंवा पर्याय निवडण्यासाठी टॅप करू शकता.',
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  const updateField = <K extends keyof ListingFormData>(
    field: K,
    value: ListingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate grade automatically from hidden parameters
  const calculateGrade = () => {
    let score = 0;

    // Cleanliness scoring (max 30 points)
    if (formData.cleanliness === 'machine-cleaned') score += 30;
    else if (formData.cleanliness === 'hand-cleaned') score += 20;
    else if (formData.cleanliness === 'uncleaned') score += 5;

    // Uniformity scoring (max 25 points)
    if (formData.uniformity === 'uniform') score += 25;
    else if (formData.uniformity === 'mixed') score += 10;

    // Drying status scoring (max 25 points)
    if (formData.drying === 'dried') score += 25;
    else if (formData.drying === 'moist') score += 10;

    // Damaged grains scoring (max 20 points)
    if (formData.damagedGrains === 'no') score += 20;
    else if (formData.damagedGrains === 'yes') score += 5;

    // Determine quality grade
    if (score >= 80) return 'premium';
    if (score >= 50) return 'standard';
    return 'economy';
  };

  // Derive moisture level from drying status
  const getMoistureLevel = () => {
    if (formData.drying === 'dried') return 'dry';
    if (formData.drying === 'moist') return 'moist';
    return 'medium';
  };

  // Derive organic status from crop inputs
  const isOrganicProduct = () => formData.cropInputs === 'natural';

  // Millet type options
  const milletOptions: MCQOption[] = milletTypes.map((millet) => ({
    id: millet.id,
    label: millet.name,
    labelHi: millet.nameHi,
    icon: <span className="text-3xl">🌾</span>,
    description: millet.nameHi,  // Changed from nameTe to nameHi
  }));

  // Quantity range options
  const quantityOptions: MCQOption[] = [
    { id: 'small', label: '< 50 kg', labelHi: '50 किलो से कम', icon: <Scale className="w-8 h-8 text-primary" /> },
    { id: 'medium', label: '50 - 200 kg', labelHi: '50-200 किलो', icon: <Scale className="w-8 h-8 text-primary" /> },
    { id: 'large', label: '200 - 1000 kg', labelHi: '200-1000 किलो', icon: <Scale className="w-8 h-8 text-primary" /> },
    { id: 'bulk', label: '> 1000 kg', labelHi: '1000 किलो से ज़्यादा', icon: <Scale className="w-8 h-8 text-primary" /> },
  ];

  // Harvest date options
  const harvestOptions: MCQOption[] = [
    { id: 'today', label: 'Today', labelHi: 'आज', icon: <Calendar className="w-8 h-8 text-accent" /> },
    { id: 'week', label: 'Within 7 days', labelHi: '7 दिनों के भीतर', icon: <Calendar className="w-8 h-8 text-accent" /> },
    { id: 'fortnight', label: 'Within 2 weeks', labelHi: '2 हफ्तों में', icon: <Calendar className="w-8 h-8 text-accent" /> },
    { id: 'other', label: 'Other (speak)', labelHi: 'अन्य (बोलें)', icon: <Mic className="w-8 h-8 text-terra-500" /> },
  ];

  // Quality options
  const qualityOptionsUI: MCQOption[] = [
    { id: 'premium', label: 'Premium', labelHi: 'प्रीमियम', icon: <Star className="w-8 h-8 text-primary" />, description: 'Clean, no impurities' },
    { id: 'standard', label: 'Standard', labelHi: 'मानक', icon: <Star className="w-8 h-8 text-muted-foreground" />, description: 'Minor impurities' },
    { id: 'economy', label: 'Economy', labelHi: 'इकोनॉमी', icon: <Star className="w-8 h-8 text-earth-400" />, description: 'Needs cleaning' },
  ];

  // Moisture options
  const moistureOptions: MCQOption[] = [
    { id: 'dry', label: 'Dry', labelHi: 'सूखा', icon: <Droplets className="w-8 h-8 text-muted-foreground" />, description: '< 12% moisture' },
    { id: 'medium', label: 'Medium', labelHi: 'सामान्य', icon: <Droplets className="w-8 h-8 text-sky-400" />, description: '12-14% moisture' },
    { id: 'moist', label: 'Moist', labelHi: 'नम', icon: <Droplets className="w-8 h-8 text-sky-600" />, description: '> 14% moisture' },
    { id: 'needs-drying', label: 'Needs Re-Drying', labelHi: 'सुखाना ज़रूरी', icon: <Droplets className="w-8 h-8 text-destructive" />, description: 'High moisture' },
  ];

  // Organic options
  const organicOptions: MCQOption[] = [
    { id: 'yes', label: 'Yes, Organic', labelHi: 'हाँ, जैविक', icon: <Leaf className="w-8 h-8 text-accent" />, description: 'No chemical inputs' },
    { id: 'no', label: 'Not Organic', labelHi: 'जैविक नहीं', icon: <Leaf className="w-8 h-8 text-muted-foreground" />, description: 'Conventional farming' },
  ];

  // Translations object for multilingual support
  const t = {
    cropType: {
      question: {
        en: 'What do you want to sell?',
        hi: 'आप क्या बेचना चाहते हैं?',
        kn: 'ನೀವು ಏನು ಮಾರಾಟ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?',
        te: 'మీరు ఏమి అమ్మాలనుకుంటున్నారు?',
        ta: 'நீங்கள் என்ன விற்க விரும்புகிறீர்கள்?',
        mr: 'तुम्ही काय विकायचे आहे?',
      },
      millets: {
        en: 'Millets',
        hi: 'बाजरा',
        kn: 'ಸಿರಿಧಾನ್ಯಗಳು',
        te: 'చిరుధాన్యాలు',
        ta: 'சிறுதானியங்கள்',
        mr: 'ज्वारी-बाजरी',
      },
      pulses: {
        en: 'Pulses',
        hi: 'दालें',
        kn: 'ದಾಲ್‌ಗಳು',
        te: 'పప్పులు',
        ta: 'பருப்பு வகைகள்',
        mr: 'डाळी',
      },
    },
    milletType: {
      question: {
        en: 'What millet are you selling?',
        hi: 'आप कौन सा मिलेट बेच रहे हैं?',
        kn: 'ನೀವು ಯಾವ ಸಿರಿಧಾನ್ಯ ಮಾರಾಟ ಮಾಡುತ್ತಿದ್ದೀರಿ?',
        te: 'మీరు ఏ చిరుధాన్యాన్ని అమ్ముతున్నారు?',
        ta: 'நீங்கள் என்ன சிறுதானியத்தை விற்கிறீர்கள்?',
        mr: 'तुम्ही कोणते ज्वारी-बाजरी विकत आहात?',
      },
    },
    quantity: {
      question: {
        en: 'Approximate quantity?',
        hi: 'अनुमानित मात्रा?',
        kn: 'ಅಂದಾಜು ಪ್ರಮಾಣ?',
        te: 'సుమారు పరిమాణం?',
        ta: 'தோராயமான அளவு?',
        mr: 'अंदाजे प्रमाण?',
      },
    },
    harvest: {
      question: {
        en: 'When was it harvested?',
        hi: 'इसे कब काटा गया?',
        kn: 'ಇದನ್ನು ಯಾವಾಗ ಕೊಯ್ಲು ಮಾಡಲಾಗಿದೆ?',
        te: 'దీన్ని ఎప్పుడు పండించారు?',
        ta: 'இது எப்போது அறுவடை செய்யப்பட்டது?',
        mr: 'हे कधी कापले गेले?',
      },
    },
    cropInputs: {
      question: {
        en: 'What inputs did you use to grow your crop?',
        hi: 'फसल उगाने के लिए आपने किन इनपुट का उपयोग किया?',
        kn: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಬೆಳೆಯಲು ನೀವು ಯಾವ ಇನ್‌ಪುಟ್‌ಗಳನ್ನು ಬಳಸಿದ್ದೀರಿ?',
        te: 'మీ పంటను పండించడానికి మీరు ఏ ఇన్‌పుట్‌లను ఉపయోగించారు?',
        ta: 'உங்கள் பயிரை வளர்க்க நீங்கள் என்ன உள்ளீடுகளைப் பயன்படுத்தியுள்ளீர்கள்?',
        mr: 'तुमच्या पिकाची वाढ करण्यासाठी तुम्ही कोणत्या इनपुटचा वापर केला?',
      },
      natural: {
        en: 'Only natural fertilizers (like compost, cow dung)',
        hi: 'केवल प्राकृतिक उर्वरक (जैसे खाद, गोबर)',
        kn: 'ಕೇವಲ ನೈಸರ್ಗಿಕ ಗೊಬ್ಬರಗಳು (ಕಂಪೋಸ್ಟ್, ಹಸುವಿನ ಸಗಣಿ)',
        te: 'సహజ ఎరువులు మాత్రమే (కంపోస్ట్, ఆవు పేడ)',
        ta: 'இயற்கை உரங்கள் மட்டுமே (உரம், பசுவின் சாணம்)',
        mr: 'केवळ नैसर्गिक खते (जसे की कंपोस्ट, शेणखत)',
      },
      mixed: {
        en: 'Mixed inputs (some natural, some chemical)',
        hi: 'मिश्रित इनपुट (कुछ प्राकृतिक, कुछ रासायनिक)',
        kn: 'ಮಿಶ್ರ ಇನ್‌ಪುಟ್‌ಗಳು (ಕೆಲವು ನೈಸರ್ಗಿಕ, ಕೆಲವು ರಾಸಾಯನಿಕ)',
        te: 'మిశ్రమ ఇన్‌పుట్‌లు (కొన్ని సహజ, కొన్ని రసాయనాలు)',
        ta: 'கலப்பு உள்ளீடுகள் (சில இயற்கை, சில ரசாயனம்)',
        mr: 'मिश्र इनपुट (काही नैसर्गिक, काही रासायनिक)',
      },
      chemical: {
        en: 'Mainly chemical fertilizers and pesticides',
        hi: 'मुख्य रूप से रासायनिक उर्वरक और कीटनाशक',
        kn: 'ಮುಖ್ಯವಾಗಿ ರಾಸಾಯನಿಕ ಗೊಬ್ಬರಗಳು ಮತ್ತು ಕೀಟನಾಶಕಗಳು',
        te: 'ప్రధానంగా రసాయన ఎరువులు మరియు పురుగుమందులు',
        ta: 'முக்கியமாக இரசாயன உரங்கள் மற்றும் பூச்சிக்கொல்லிகள்',
        mr: 'मुख्यतः रासायनिक खते आणि कीटकनाशके',
      },
    },
    cleanliness: {
      question: {
        en: 'Is your crop machine-cleaned, hand-cleaned or uncleaned?',
        hi: 'क्या आपकी फसल मशीन से साफ, हाथ से साफ या बिना साफ की गई है?',
        kn: 'ನಿಮ್ಮ ಬೆಳೆ ಯಂತ್ರದಿಂದ ಸ್ವಚ್ಛಗೊಳಿಸಲಾಗಿದೆಯೇ, ಕೈಯಿಂದ ಸ್ವಚ್ಛಗೊಳಿಸಲಾಗಿದೆಯೇ ಅಥವಾ ಸ್ವಚ್ಛಗೊಳಿಸದೆ ಇದೆಯೇ?',
        te: 'మీ పంట యంత్రంతో శుభ్రం చేయబడిందా, చేతితో శుభ్రం చేయబడిందా లేదా శుభ్రం చేయబడలేదా?',
        ta: 'உங்கள் பயிர் இயந்திரத்தால் சுத்தம் செய்யப்பட்டதா, கையால் சுத்தம் செய்யப்பட்டதா அல்லது சுத்தம் செய்யப்படாததா?',
        mr: 'तुमचे पीक मशीनने स्वच्छ केलेले आहे, हाताने स्वच्छ केलेले आहे की अस्वच्छ आहे?',
      },
      machine: {
        en: 'Machine Cleaned',
        hi: 'मशीन से साफ',
        kn: 'ಯಂತ್ರದಿಂದ ಸ್ವಚ್ಛಗೊಳಿಸಲಾಗಿದೆ',
        te: 'యంత్రంతో శుభ్రం చేయబడింది',
        ta: 'இயந்திரத்தால் சுத்தம் செய்யப்பட்டது',
        mr: 'मशीनने स्वच्छ केलेले',
      },
      hand: {
        en: 'Hand Cleaned',
        hi: 'हाथ से साफ',
        kn: 'ಕೈಯಿಂದ ಸ್ವಚ್ಛಗೊಳಿಸಲಾಗಿದೆ',
        te: 'చేతితో శుభ్రం చేయబడింది',
        ta: 'கையால் சுத்தம் செய்யப்பட்டது',
        mr: 'हाताने स्वच्छ केलेले',
      },
      uncleaned: {
        en: 'Uncleaned',
        hi: 'बिना साफ',
        kn: 'ಸ್ವಚ್ಛಗೊಳಿಸಲಾಗಿಲ್ಲ',
        te: 'శుభ్రం చేయబడలేదు',
        ta: 'சுத்தம் செய்யப்படாதது',
        mr: 'अस्वच्छ',
      },
    },
    uniformity: {
      question: {
        en: 'Are the grains same size or are they mixed?',
        hi: 'क्या अनाज एक समान आकार के हैं या मिश्रित हैं?',
        kn: 'ಧಾನ್ಯಗಳು ಒಂದೇ ಗಾತ್ರದಲ್ಲಿವೆಯೇ ಅಥವಾ ಮಿಶ್ರಿತವಾಗಿವೆಯೇ?',
        te: 'ధాన్యాలు ఒకే పరిమాణంలో ఉన్నాయా లేదా మిశ్రమంగా ఉన్నాయా?',
        ta: 'தானியங்கள் ஒரே அளவில் உள்ளனவா அல்லது கலந்திருக்கின்றனவா?',
        mr: 'धान्य एकाच आकाराचे आहेत की मिश्रित आहेत?',
      },
      uniform: {
        en: 'Uniform',
        hi: 'एक समान',
        kn: 'ಏಕರೂಪ',
        te: 'ఏకరీతి',
        ta: 'சீரான',
        mr: 'एकसमान',
      },
      mixed: {
        en: 'Mixed',
        hi: 'मिश्रित',
        kn: 'ಮಿಶ್ರಿತ',
        te: 'మిశ్రమం',
        ta: 'கலப்பு',
        mr: 'मिश्रित',
      },
    },
    drying: {
      question: {
        en: 'Is it dried properly or slightly moist?',
        hi: 'क्या यह ठीक से सूखा है या थोड़ा नम है?',
        kn: 'ಇದು ಸರಿಯಾಗಿ ಒಣಗಿದೆಯೇ ಅಥವಾ ಸ್ವಲ್ಪ ತೇವವಾಗಿದೆಯೇ?',
        te: 'ఇది సరిగ్గా ఎండబెట్టబడిందా లేదా కొంచెం తేమగా ఉందా?',
        ta: 'இது சரியாக உலர்த்தப்பட்டதா அல்லது சற்று ஈரமாக உள்ளதா?',
        mr: 'ते नीट सुकलेले आहे की थोडे ओलसर आहे?',
      },
      dried: {
        en: 'Dried',
        hi: 'सूखा',
        kn: 'ಒಣಗಿದ',
        te: 'ఎండబెట్టబడింది',
        ta: 'உலர்த்தப்பட்டது',
        mr: 'सुकलेले',
      },
      moist: {
        en: 'Moist',
        hi: 'नम',
        kn: 'ತೇವ',
        te: 'తేమ',
        ta: 'ஈரம்',
        mr: 'ओलसर',
      },
    },
    damagedGrains: {
      question: {
        en: 'Any visible stones or damaged grains?',
        hi: 'क्या कोई दिखाई देने वाले पत्थर या क्षतिग्रस्त अनाज हैं?',
        kn: 'ಯಾವುದೇ ಗೋಚರಿಸುವ ಕಲ್ಲುಗಳು ಅಥವಾ ಹಾನಿಗೊಳಗಾದ ಧಾನ್ಯಗಳು ಇವೆಯೇ?',
        te: 'ఏదైనా కనిపించే రాళ్లు లేదా పాడైన ధాన్యాలు ఉన్నాయా?',
        ta: 'காணக்கூடிய கற்கள் அல்லது சேதமடைந்த தானியங்கள் உள்ளனவா?',
        mr: 'कोणतेही दिसणारे दगड किंवा खराब झालेले धान्य आहे का?',
      },
      yes: {
        en: 'Yes',
        hi: 'हाँ',
        kn: 'ಹೌದು',
        te: 'అవును',
        ta: 'ஆம்',
        mr: 'होय',
      },
      no: {
        en: 'No',
        hi: 'नहीं',
        kn: 'ಇಲ್ಲ',
        te: 'కాదు',
        ta: 'இல்லை',
        mr: 'नाही',
      },
    },
    quality: {
      question: {
        en: 'What is the quality grade?',
        hi: 'गुणवत्ता ग्रेड क्या है?',
        kn: 'ಗುಣಮಟ್ಟದ ದರ್ಜೆ ಏನು?',
        te: 'నాణ్యత గ్రేడ్ ఏమిటి?',
        ta: 'தர வகைப்பாடு என்ன?',
        mr: 'गुणवत्ता ग्रेड काय आहे?',
      },
    },
    moisture: {
      question: {
        en: 'What is the moisture level?',
        hi: 'नमी का स्तर क्या है?',
        kn: 'ತೇವಾಂಶದ ಮಟ್ಟ ಏನು?',
        te: 'తేమ స్థాయి ఏమిటి?',
        ta: 'ஈரப்பதம் அளவு என்ன?',
        mr: 'ओलावा पातळी काय आहे?',
      },
    },
    organic: {
      question: {
        en: 'Is your produce organic?',
        hi: 'क्या आपकी उपज जैविक है?',
        kn: 'ನಿಮ್ಮ ಉತ್ಪನ್ನ ಸಾವಯವವಾಗಿದೆಯೇ?',
        te: 'మీ ఉత్పత్తి సేంద్రియమా?',
        ta: 'உங்கள் உற்பத்தி இயற்கையா?',
        mr: 'तुमचे उत्पादन सेंद्रिय आहे का?',
      },
    },
  };

  // Crop type options with images
  const cropTypeOptions: MCQOption[] = [
    {
      id: 'millets',
      label: t.cropType.millets[language],
      image: '/millets_basket_1765086094663.png',
    },
    {
      id: 'pulses',
      label: t.cropType.pulses[language],
      image: '/pulses_basket_1765086116643.png',
    },
  ];

  // Crop inputs options
  const cropInputsOptions: MCQOption[] = [
    {
      id: 'natural',
      label: t.cropInputs.natural[language],
      icon: <Leaf className="w-10 h-10 text-accent" />,
    },
    {
      id: 'mixed',
      label: t.cropInputs.mixed[language],
      icon: <Leaf className="w-10 h-10 text-primary" />,
    },
    {
      id: 'chemical',
      label: t.cropInputs.chemical[language],
      icon: <Leaf className="w-10 h-10 text-muted-foreground" />,
    },
  ];

  // Cleanliness options
  const cleanlinessOptions: MCQOption[] = [
    {
      id: 'machine-cleaned',
      label: t.cleanliness.machine[language],
      icon: <Star className="w-10 h-10 text-primary" />,
    },
    {
      id: 'hand-cleaned',
      label: t.cleanliness.hand[language],
      icon: <Star className="w-10 h-10 text-accent" />,
    },
    {
      id: 'uncleaned',
      label: t.cleanliness.uncleaned[language],
      icon: <Star className="w-10 h-10 text-muted-foreground" />,
    },
  ];

  // Uniformity options
  const uniformityOptions: MCQOption[] = [
    {
      id: 'uniform',
      label: t.uniformity.uniform[language],
      icon: <Scale className="w-10 h-10 text-primary" />,
    },
    {
      id: 'mixed',
      label: t.uniformity.mixed[language],
      icon: <Scale className="w-10 h-10 text-muted-foreground" />,
    },
  ];

  // Drying options
  const dryingOptions: MCQOption[] = [
    {
      id: 'dried',
      label: t.drying.dried[language],
      icon: <Droplets className="w-10 h-10 text-muted-foreground" />,
    },
    {
      id: 'moist',
      label: t.drying.moist[language],
      icon: <Droplets className="w-10 h-10 text-sky-500" />,
    },
  ];

  // Damaged grains options
  const damagedGrainsOptions: MCQOption[] = [
    {
      id: 'yes',
      label: t.damagedGrains.yes[language],
      icon: <X className="w-10 h-10 text-destructive" />,
    },
    {
      id: 'no',
      label: t.damagedGrains.no[language],
      icon: <Check className="w-10 h-10 text-accent" />,
    },
  ];

  // Flash card steps
  const steps = [
    // Step 0: Crop Type Selection (Millets or Pulses)
    {
      id: 'cropType',
      component: (
        <MCQCard
          question={t.cropType.question[language]}
          options={cropTypeOptions}
          value={formData.cropType}
          onChange={(v) => updateField('cropType', v as string)}
          columns={2}
          size="lg"
          language={language}
        />
      ),
    },
    // Step 1: Millet Type Selection
    {
      id: 'millet',
      component: (
        <MCQCard
          question={t.milletType.question[language]}
          options={milletOptions}
          value={formData.milletType}
          onChange={(v) => updateField('milletType', v as string)}
          columns={2}
          size="lg"
          showVoiceInput
          language={language}
          onVoiceInput={(text) => {
            const match = milletTypes.find((m) =>
              m.name.toLowerCase().includes(text.toLowerCase()) || m.nameHi.includes(text)
            );
            if (match) updateField('milletType', match.id);
          }}
        />
      ),
    },
    // Step 2: Quantity
    {
      id: 'quantity',
      component: (
        <div className="space-y-6">
          <MCQCard
            question={t.quantity.question[language]}
            options={quantityOptions}
            value={formData.quantity}
            onChange={(v) => updateField('quantity', v as string)}
            columns={2}
            size="lg"
            language={language}
          />
          <div className="bg-muted/50 rounded-xl p-6">
            <label className="text-sm text-muted-foreground block mb-3">
              {language === 'hi' ? 'सटीक मात्रा (वैकल्पिक)' :
                language === 'kn' ? 'ನಿಖರವಾದ ಪ್ರಮಾಣ (ಐಚ್ಛಿಕ)' :
                  language === 'te' ? 'ఖచ్చితమైన పరిమాణం (ఐచ్ఛికం)' :
                    language === 'ta' ? 'துல்லியமான அளவு (விருப்பம்)' :
                      language === 'mr' ? 'अचूक प्रमाण (पर्यायी)' :
                        'Exact quantity (optional)'}
            </label>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder={language === 'hi' ? 'मात्रा दर्ज करें' : 'Enter amount'}
                className="h-14 text-lg"
                onChange={(e) => updateField('quantity', e.target.value)}
              />
              <select
                value={formData.quantityUnit}
                onChange={(e) => updateField('quantityUnit', e.target.value)}
                className="h-14 px-6 rounded-lg border border-border bg-background text-base font-medium"
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="ton">ton</option>
              </select>
            </div>
          </div>
        </div>
      ),
    },
    // Step 3: Harvest Date
    {
      id: 'harvest',
      component: (
        <MCQCard
          question={t.harvest.question[language]}
          options={harvestOptions}
          value={formData.harvestDate}
          onChange={(v) => updateField('harvestDate', v as string)}
          columns={2}
          size="lg"
          language={language}
        />
      ),
    },
    // Step 4: Crop Inputs
    {
      id: 'cropInputs',
      component: (
        <MCQCard
          question={t.cropInputs.question[language]}
          options={cropInputsOptions}
          value={formData.cropInputs}
          onChange={(v) => updateField('cropInputs', v as string)}
          columns={1}
          size="lg"
          language={language}
        />
      ),
    },
    // Step 5: Cleanliness (Hidden Grade Parameter)
    {
      id: 'cleanliness',
      component: (
        <MCQCard
          question={t.cleanliness.question[language]}
          options={cleanlinessOptions}
          value={formData.cleanliness}
          onChange={(v) => updateField('cleanliness', v as string)}
          columns={1}
          size="lg"
          language={language}
        />
      ),
    },
    // Step 6: Uniformity (Hidden Grade Parameter)
    {
      id: 'uniformity',
      component: (
        <MCQCard
          question={t.uniformity.question[language]}
          options={uniformityOptions}
          value={formData.uniformity}
          onChange={(v) => updateField('uniformity', v as string)}
          columns={2}
          size="lg"
          language={language}
        />
      ),
    },
    // Step 7: Drying (Hidden Grade Parameter)
    {
      id: 'drying',
      component: (
        <MCQCard
          question={t.drying.question[language]}
          options={dryingOptions}
          value={formData.drying}
          onChange={(v) => updateField('drying', v as string)}
          columns={2}
          size="lg"
          language={language}
        />
      ),
    },
    // Step 8: Damaged Grains (Hidden Grade Parameter)
    {
      id: 'damagedGrains',
      component: (
        <MCQCard
          question={t.damagedGrains.question[language]}
          options={damagedGrainsOptions}
          value={formData.damagedGrains}
          onChange={(v) => updateField('damagedGrains', v as string)}
          columns={2}
          size="lg"
          language={language}
        />
      ),
    },
    // NOTE: Quality grade, moisture level, and organic status are AUTO-CALCULATED:
    // - Grade is calculated from: cleanliness + uniformity + drying + damaged_grains
    // - Moisture is derived from: drying_status
    // - Organic is derived from: crop_inputs === 'natural'
    // These questions have been REMOVED to simplify the farmer experience

    // Step 9: Price
    {
      id: 'price',
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {language === 'hi' ? 'वर्तमान बाजार मूल्य' :
                language === 'kn' ? 'ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ' :
                  language === 'te' ? ' ప్రస్తుత మార్కెట్ ధర' :
                    language === 'ta' ? 'தற்போதைய சந்தை விலை' :
                      language === 'mr' ? 'सध्याची बाजार किंमत' :
                        'Current market price'}
            </p>
            <p className="text-3xl font-bold text-accent">₹45 - ₹55/kg</p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'hi' ? 'के लिए' : 'for'} {milletTypes.find((m) => m.id === formData.milletType)?.name || 'millet'}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <label className="text-sm font-medium block mb-4">
              {language === 'hi' ? 'प्रति किलो आपका मूल्य' :
                language === 'kn' ? 'ನಿಮ್ಮ ಬೆಲೆ ಪ್ರತಿ ಕೆಜಿ' :
                  language === 'te' ? 'మీ ధర కిలోకు' :
                    language === 'ta' ? 'உங்கள் விலை கிலோ ஒன்றுக்கு' :
                      language === 'mr' ? 'प्रति किलो तुमची किंमत' :
                        'Your price per kg'}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">₹</span>
              <Input
                type="number"
                placeholder={language === 'hi' ? 'मूल्य दर्ज करें' : 'Enter price'}
                value={formData.pricePerKg}
                onChange={(e) => updateField('pricePerKg', e.target.value)}
                className="h-16 text-2xl font-bold text-center"
              />
              <span className="text-lg text-muted-foreground">/kg</span>
            </div>
          </div>
          <div className="flex justify-center">
            <VoiceButton
              onTranscript={(text) => {
                const match = text.match(/\d+/);
                if (match) updateField('pricePerKg', match[0]);
              }}
              placeholder={language === 'hi' ? 'अपना मूल्य बोलें' : 'Say your price'}
              size="md"
            />
          </div>
        </div>
      ),
    },
    // Step 13: Photos
    {
      id: 'photos',
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              {language === 'hi' ? 'खरीदारों को आकर्षित करने के लिए अपने मिलेट की तस्वीरें जोड़ें' :
                language === 'kn' ? 'ಖರೀದಿದಾರರನ್ನು ಆಕರ್ಷಿಸಲು ನಿಮ್ಮ ಸಿರಿಧಾನ್ಯದ ಫೋಟೋಗಳನ್ನು ಸೇರಿಸಿ' :
                  language === 'te' ? 'కొనుగోలుదారులను ఆకర్షించడానికి మీ చిరుధాన్యాల ఫోటోలను జోడించండి' :
                    language === 'ta' ? 'வாங்குபவர்களை ஈர்க்க உங்கள் சிறுதானியத்தின் புகைப்படங்களைச் சேர்க்கவும்' :
                      language === 'mr' ? 'खरेदीदारांना आकर्षित करण्यासाठी तुमच्या ज्वारी-बाजरीचे फोटो जोडा' :
                        'Add photos of your millet to attract buyers'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
                updateField('photos', [...formData.photos, ...newPhotos]);
              }
            }}
          />
          <div className="grid grid-cols-3 gap-4">
            {formData.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => updateField('photos', formData.photos.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {formData.photos.length < 6 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-colors"
              >
                <Camera className="w-10 h-10 text-primary" />
                <span className="text-sm text-primary font-medium">
                  {language === 'hi' ? 'फोटो जोड़ें' :
                    language === 'kn' ? 'ಫೋಟೋ ಸೇರಿಸಿ' :
                      language === 'te' ? 'ఫోటో జోడించండి' :
                        language === 'ta' ? 'புகைப்படம் சேர்க்கவும்' :
                          language === 'mr' ? 'फोटो जोडा' :
                            'Add Photo'}
                </span>
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {language === 'hi' ? 'सुझाव: अच्छी तस्वीरें ऑफ़र को 30% तक बढ़ा सकती हैं' :
              language === 'kn' ? 'ಸಲಹೆ: ಉತ್ತಮ ಫೋಟೋಗಳು ಆಫರ್‌ಗಳನ್ನು 30% ವರೆಗೆ ಹೆಚ್ಚಿಸಬಹುದು' :
                language === 'te' ? 'చిట్కా: మంచి ఫోటోలు ఆఫర్‌లను 30% వరకు పెంచవచ్చు' :
                  language === 'ta' ? 'குறிப்பு: நல்ல புகைப்படங்கள் சலுகைகளை 30% அதிகரிக்கலாம்' :
                    language === 'mr' ? 'टीप: चांगले फोटो ऑफर 30% पर्यंत वाढवू शकतात' :
                      'Tip: Good photos can increase offers by up to 30%'}
          </p>
        </div>
      ),
    },
    // Step 14: Preview
    {
      id: 'preview',
      component: (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {formData.photos.length > 0 ? (
              <div className="h-48 overflow-hidden">
                <img src={formData.photos[0]} alt="Listing" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-48 bg-muted flex items-center justify-center">
                <ImagePlus className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg">
                  {milletTypes.find((m) => m.id === formData.milletType)?.name || 'Millet'}
                </h3>
                {isOrganicProduct() && (
                  <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                    {language === 'hi' ? 'जैविक' :
                      language === 'kn' ? 'ಸಾವಯವ' :
                        language === 'te' ? 'సేంద్రియ' :
                          language === 'ta' ? 'இயற்கை' :
                            language === 'mr' ? 'सेंद्रिय' :
                              'Organic'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <span>{formData.quantity} {formData.quantityUnit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{calculateGrade()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{getMoistureLevel()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{formData.harvestDate}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground">
                  {language === 'hi' ? 'आपका मूल्य' :
                    language === 'kn' ? 'ನಿಮ್ಮ ಬೆಲೆ' :
                      language === 'te' ? 'మీ ధర' :
                        language === 'ta' ? 'உங்கள் விலை' :
                          language === 'mr' ? 'तुमची किंمत' :
                            'Your price'}
                </span>
                <span className="text-2xl font-bold text-primary">₹{formData.pricePerKg}/kg</span>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-5">
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'hi' ? 'खरीदारों के लिए एक वॉइस नोट जोड़ें (वैकल्पिक)' :
                language === 'kn' ? 'ಖರೀದಿದಾರರಿಗೆ ಧ್ವನಿ ಟಿಪ್ಪಣಿಯನ್ನು ಸೇರಿಸಿ (ಐಚ್ಛಿಕ)' :
                  language === 'te' ? 'కొనుగోలుదారుల కోసం వాయిస్ నోట్ జోడించండి (ఐచ్ఛికం)' :
                    language === 'ta' ? 'வாங்குபவர்களுக்கு குரல் குறிப்பு சேர்க்கவும் (விருப்பம்)' :
                      language === 'mr' ? 'खरेदीदारांसाठी एक व्हॉईस नोट जोडा (पर्यायी)' :
                        'Add a voice note for buyers (optional)'}
            </p>
            <VoiceButton
              onTranscript={(text) => updateField('voiceNote', text)}
              placeholder={language === 'hi' ? 'एक छोटा संदेश रिकॉर्ड करें' : 'Record a short message'}
              size="md"
            />
          </div>
        </div>
      ),
    },
  ];

  // Check if current step has a valid selection
  const isCurrentStepValid = (): boolean => {
    const stepId = steps[currentStep]?.id;
    switch (stepId) {
      case 'cropType':
        return !!formData.cropType;
      case 'millet':
        return !!formData.milletType;
      case 'quantity':
        return !!formData.quantity;
      case 'harvest':
        return !!formData.harvestDate;
      case 'cropInputs':
        return !!formData.cropInputs;
      case 'cleanliness':
        return !!formData.cleanliness;
      case 'uniformity':
        return !!formData.uniformity;
      case 'drying':
        return !!formData.drying;
      case 'damagedGrains':
        return !!formData.damagedGrains;
      case 'price':
        return !!formData.pricePerKg && parseFloat(formData.pricePerKg) > 0;
      case 'photos':
        return true; // Photos are optional
      case 'preview':
        return true; // Preview is always valid
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!isCurrentStepValid()) {
      // Show validation feedback - user must select an option
      return;
    }
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitListing = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Check if offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOffline(true);
        // Save to local storage for later sync
        const offlineListings = JSON.parse(localStorage.getItem('offline_listings') || '[]');
        offlineListings.push({ ...formData, createdAt: new Date().toISOString() });
        localStorage.setItem('offline_listings', JSON.stringify(offlineListings));
        setShowSuccess(true);
        return;
      }

      // Parse quantity based on range selection or exact input
      let qtyKg = 0;
      const qtyStr = formData.quantity;
      // Check if it's a range selection or exact number
      if (qtyStr === 'small') qtyKg = 25;
      else if (qtyStr === 'medium') qtyKg = 125;
      else if (qtyStr === 'large') qtyKg = 600;
      else if (qtyStr === 'bulk') qtyKg = 1500;
      else {
        const qtyNum = parseFloat(qtyStr) || 0;
        if (formData.quantityUnit === 'quintal') {
          qtyKg = qtyNum * 100;
        } else if (formData.quantityUnit === 'ton') {
          qtyKg = qtyNum * 1000;
        } else {
          qtyKg = qtyNum;
        }
      }

      // Convert price per kg to price per quintal for API
      const pricePerKg = parseFloat(formData.pricePerKg) || 0;
      const pricePerQuintal = pricePerKg * 100;

      // Calculate derived fields
      const calculatedGrade = calculateGrade();
      const calculatedMoisture = getMoistureLevel();
      const calculatedOrganic = isOrganicProduct();

      // Submit to API with all fields
      await listingsApi.create({
        crop: formData.milletType,
        qty_kg: qtyKg,
        min_price_per_qtl: pricePerQuintal,
        quality_grade: calculatedGrade,
        is_organic: calculatedOrganic,
        description: formData.additionalNotes || `Crop type: ${formData.cropType}, Inputs: ${formData.cropInputs}, Cleanliness: ${formData.cleanliness}, Uniformity: ${formData.uniformity}, Drying: ${formData.drying}, Damaged: ${formData.damagedGrains}`,
        harvest_date: formData.harvestDate === 'today' ? new Date().toISOString() :
          formData.harvestDate === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
            formData.harvestDate === 'fortnight' ? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() :
              undefined,
        district: formData.location || undefined,
        images: formData.photos.length > 0 ? formData.photos : undefined,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to submit listing:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              {isOffline ? <WifiOff className="w-12 h-12 text-primary" /> : <Check className="w-12 h-12 text-accent" />}
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">
              {isOffline ?
                (language === 'hi' ? 'लिस्टिंग ऑफलाइन सेव की गई!' :
                  language === 'kn' ? 'ಪಟ್ಟಿ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ!' :
                    language === 'te' ? 'జాబితా ఆఫ్‌లైన్‌లో రక్షించబడింది!' :
                      language === 'ta' ? 'பட்டியல் ஆஃப்லைன்லில் சேமிக்கப்பட்டது!' :
                        language === 'mr' ? 'लिस्टिंग ऑफलाइन जतन केली!' :
                          'Listing Saved Offline!') :
                (language === 'hi' ? 'लिस्टिंग प्रकाशित!' :
                  language === 'kn' ? 'ಪಟ್ಟಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ!' :
                    language === 'te' ? 'జాబితా ప్రసిద్ధం అయ్యింది!' :
                      language === 'ta' ? 'பட்டியல் வெளியிடப்பட்டது!' :
                        language === 'mr' ? 'लिस्टिंग प्रकाशित झाली!' :
                          'Listing Published!')}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isOffline
                ? "We'll publish your listing when you're back online. You'll receive an SMS confirmation."
                : 'Your listing is now live. You will receive SMS notifications when buyers show interest.'}
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/farmer/dashboard')} className="w-full h-14 text-lg">
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(initialFormData);
                  setCurrentStep(0);
                  setShowSuccess(false);
                  setIsOffline(false);
                }}
                className="w-full h-14 text-lg"
              >
                Create Another Listing
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />
      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header with TTS */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg sm:text-xl font-heading font-bold">
            {language === 'hi' ? 'लिस्टिंग बनाएं' :
              language === 'kn' ? 'ಪಟ್ಟಿ ರಚಿಸಿ' :
                language === 'te' ? 'జాబితా సృష్టించండి' :
                  language === 'ta' ? 'பட்டியல் உருവாக்கவும்' :
                    language === 'mr' ? 'लिस्टिंग तयार करा' :
                      'Create Listing'}
          </h1>
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

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-2">
            <span>
              {language === 'hi' ? `चरण ${currentStep + 1}/${steps.length}` :
                language === 'kn' ? `ಹಂತ ${currentStep + 1}/${steps.length}` :
                  language === 'te' ? `దశ ${currentStep + 1}/${steps.length}` :
                    language === 'ta' ? `படி ${currentStep + 1}/${steps.length}` :
                      language === 'mr' ? `चरण ${currentStep + 1}/${steps.length}` :
                        `Step ${currentStep + 1} of ${steps.length}`}
            </span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        {/* Flash card */}
        <div className="relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-card rounded-2xl shadow-lg border border-border p-6"
            >
              {steps[currentStep].component}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Validation message */}
        {!isCurrentStepValid() && currentStep < steps.length - 2 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm text-center">
            {language === 'hi' ? 'आगे बढ़ने के लिए कृपया एक विकल्प चुनें' :
              language === 'kn' ? 'ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ' :
                language === 'te' ? 'కొనసాగించడానికి దయచేసి ఒక ఎంపికను ఎంచుకోండి' :
                  language === 'ta' ? 'தொடர ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்' :
                    language === 'mr' ? 'पुढे जाण्यासाठी कृपया एक पर्याय निवडा' :
                      'Please select an option to continue'}
          </div>
        )}

        {/* Error display */}
        {submitError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 sm:gap-4 mt-6">
          <Button variant="outline" onClick={goPrev} disabled={currentStep === 0} className="flex-1 h-12 sm:h-14 text-base sm:text-lg touch-target">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            {language === 'hi' ? 'पीछे' :
              language === 'kn' ? 'ಹಿಂದೆ' :
                language === 'te' ? 'వెనుక' :
                  language === 'ta' ? 'முந்தைய' :
                    language === 'mr' ? 'मागे' :
                      'Back'}
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={submitListing}
              disabled={isSubmitting}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg touch-target bg-terra-500 hover:bg-terra-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"
                  />
                  {language === 'hi' ? 'प्रकाशित हो रहा है...' :
                    language === 'kn' ? 'ಪ್ರಕಟಿಸಲಾಗುತ್ತಿದೆ...' :
                      language === 'te' ? 'ప్రసిద్ధం అవుతోంది...' :
                        language === 'ta' ? 'வெளியிடப்படுகிறது...' :
                          language === 'mr' ? 'प्रकाशित होत आहे...' :
                            'Publishing...'}
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  {language === 'hi' ? 'लिस्टिंग प्रकाशित करें' :
                    language === 'kn' ? 'ಪಟ್ಟಿಯನ್ನು ಪ್ರಕಟಿಸಿ' :
                      language === 'te' ? 'జాబితాను ప్రసిద్ధం చేయండి' :
                        language === 'ta' ? 'பட்டியலை வெளியிடவும்' :
                          language === 'mr' ? 'लिस्टिंग प्रकाशित करा' :
                            'Publish Listing'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!isCurrentStepValid()}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg touch-target"
            >
              {language === 'hi' ? 'अगला' :
                language === 'kn' ? 'ಮುಂದೆ' :
                  language === 'te' ? 'తరువాత' :
                    language === 'ta' ? 'அடுத்தது' :
                      language === 'mr' ? 'पुढे' :
                        'Next'}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
            </Button>
          )}
        </div>

        {/* Help */}
        <div className="mt-6 text-center">
          <button className="text-primary hover:underline text-sm font-medium">
            {language === 'hi' ? 'मदद चाहिए? एजेंट से बात करें' :
              language === 'kn' ? 'ಸಹಾಯ ಬೇಕಾ? ಪ್ರತಿನಿಧಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ' :
                language === 'te' ? 'సహాయం కావాలా? ఏజెంట్‌తో మాట్లాడండి' :
                  language === 'ta' ? 'உதவி தேவையா? ஏஜன்டை தொடர்பு கொள்ளவும்' :
                    language === 'mr' ? 'मदत हवी? एजंटशी बोला' :
                      'Need help? Speak to an agent'}
          </button>
        </div>
      </main>
    </div>
  );
}