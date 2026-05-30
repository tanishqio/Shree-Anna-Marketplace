"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Mic,
  WifiOff,
  Globe,
  QrCode,
  Shield,
  TrendingUp,
  Users,
  Leaf,
  ChevronRight,
  Play,
  Star,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { HelpModal } from '@/components/HelpModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { milletTypes } from '@/lib/design-tokens';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { supabase } from '@/lib/supabase';

// API URL for fetching real stats
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
import { t } from '@/lib/i18n';

// Multilingual feature content
const getFeatures = (lang: string) => [
  {
    icon: Mic,
    title: lang === 'hi' ? 'वॉइस से लिस्टिंग' : lang === 'te' ? 'వాయిస్ ద్వారా జాబితా' : lang === 'kn' ? 'ವಾಯ್ಸ್ ಲಿಸ್ಟಿಂಗ್' : lang === 'ta' ? 'குரல் பட்டியல்' : lang === 'mr' ? 'व्हॉइस लिस्टिंग' : 'Voice-Enabled Listing',
    description: lang === 'hi' ? 'अपनी भाषा में बोलकर लिस्टिंग बनाएं। टाइपिंग की जरूरत नहीं।' : lang === 'te' ? 'మీ భాషలో మాట్లాడి జాబితా చేయండి. టైపింగ్ అవసరం లేదు.' : lang === 'kn' ? 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಲಿಸ್ಟಿಂಗ್ ಮಾಡಿ. ಟೈಪಿಂಗ್ ಅಗತ್ಯವಿಲ್ಲ.' : lang === 'ta' ? 'உங்கள் மொழியில் பேசி பட்டியலிடுங்கள். தட்டச்சு தேவையில்லை.' : lang === 'mr' ? 'तुमच्या भाषेत बोलून लिस्टिंग करा. टायपिंग आवश्यक नाही.' : 'Create listings by speaking in your language. No typing needed.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: WifiOff,
    title: lang === 'hi' ? 'ऑफलाइन काम करता है' : lang === 'te' ? 'ఆఫ్‌లైన్‌లో పనిచేస్తుంది' : lang === 'kn' ? 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ' : lang === 'ta' ? 'ஆஃப்லைனில் வேலை செய்யும்' : lang === 'mr' ? 'ऑफलाइन काम करते' : 'Works Offline',
    description: lang === 'hi' ? 'बिना इंटरनेट के ऐप का उपयोग करें। फिर से कनेक्ट होने पर डेटा सिंक होता है।' : lang === 'te' ? 'ఇంటర్నెట్ లేకుండా యాప్ వాడండి. మళ్ళీ కనెక్ట్ అయినప్పుడు డేటా సింక్ అవుతుంది.' : lang === 'kn' ? 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಆಪ್ ಬಳಸಿ. ಮರುಸಂಪರ್ಕದಲ್ಲಿ ಡೇಟಾ ಸಿಂಕ್ ಆಗುತ್ತದೆ.' : lang === 'ta' ? 'இணையம் இல்லாமல் ஆப்பைப் பயன்படுத்துங்கள். மீண்டும் இணைக்கும்போது தரவு ஒத்திசைவு.' : lang === 'mr' ? 'इंटरनेट शिवाय अॅप वापरा. पुन्हा कनेक्ट झाल्यावर डेटा सिंक होतो.' : 'Use the app without internet. Data syncs when you reconnect.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: Globe,
    title: lang === 'hi' ? 'बहुभाषी' : lang === 'te' ? 'బహుభాషా' : lang === 'kn' ? 'ಬಹುಭಾಷಾ' : lang === 'ta' ? 'பன்மொழி' : lang === 'mr' ? 'बहुभाषिक' : 'Multilingual',
    description: lang === 'hi' ? 'हिंदी, तेलुगु, कन्नड़, तमिल और मराठी में उपलब्ध।' : lang === 'te' ? 'హిందీ, తెలుగు, కన్నడ, తమిళం మరియు మరాఠీలో అందుబాటులో ఉంది.' : lang === 'kn' ? 'ಹಿಂದಿ, ತೆಲುಗು, ಕನ್ನಡ, ತಮಿಳು ಮತ್ತು ಮರಾಠಿಯಲ್ಲಿ ಲಭ್ಯ.' : lang === 'ta' ? 'இந்தி, தெலுங்கு, கன்னடம், தமிழ் மற்றும் மராத்தியில் கிடைக்கும்.' : lang === 'mr' ? 'हिंदी, तेलुगू, कन्नड, तामिळ आणि मराठीमध्ये उपलब्ध.' : 'Available in Hindi, Telugu, Kannada, Tamil, and Marathi.',
    color: 'bg-sky-500/10 text-sky-600',
  },
  {
    icon: QrCode,
    title: lang === 'hi' ? 'पूर्ण ट्रेसेबिलिटी' : lang === 'te' ? 'పూర్తి ట్రేసబిలిటీ' : lang === 'kn' ? 'ಪೂರ್ಣ ಟ್ರೇಸೆಬಿಲಿಟಿ' : lang === 'ta' ? 'முழு தடமறிதல்' : lang === 'mr' ? 'पूर्ण ट्रेसेबिलिटी' : 'Full Traceability',
    description: lang === 'hi' ? 'क्यूआर कोड के साथ खेत से थाली तक अपने बाजरे को ट्रैक करें।' : lang === 'te' ? 'QR కోడ్‌లతో మీ చిరుధాన్యాలను పొలం నుండి ప్లేట్ వరకు ట్రాక్ చేయండి.' : lang === 'kn' ? 'QR ಕೋಡ್‌ಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಹೊಲದಿಂದ ತಟ್ಟೆಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.' : lang === 'ta' ? 'QR குறியீடுகளுடன் உங்கள் சிறுதானியங்களை வயல் முதல் தட்டு வரை கண்காணிக்கவும்.' : lang === 'mr' ? 'QR कोडसह तुमचे ज्वारी-बाजरी शेतातून ताटापर्यंत ट्रॅक करा.' : 'Track your millets from farm to table with QR codes.',
    color: 'bg-terra-500/10 text-terra-600',
  },
  {
    icon: Shield,
    title: lang === 'hi' ? 'सत्यापित खरीदार' : lang === 'te' ? 'ధృవీకరించబడిన కొనుగోలుదారులు' : lang === 'kn' ? 'ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರು' : lang === 'ta' ? 'சரிபார்க்கப்பட்ட வாங்குபவர்கள்' : lang === 'mr' ? 'सत्यापित खरेदीदार' : 'Verified Buyers',
    description: lang === 'hi' ? 'सुरक्षित लेनदेन के लिए सत्यापित खरीदारों और एफपीओ से जुड़ें।' : lang === 'te' ? 'సురక్షిత లావాదేవీల కోసం ధృవీకరించబడిన కొనుగోలుదారులు మరియు FPOలతో కనెక్ట్ అవ్వండి.' : lang === 'kn' ? 'ಸುರಕ್ಷಿತ ವಹಿವಾಟುಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರು ಮತ್ತು FPOಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ.' : lang === 'ta' ? 'பாதுகாப்பான பரிவர்த்தனைகளுக்கு சரிபார்க்கப்பட்ட வாங்குபவர்கள் மற்றும் FPOகளுடன் இணையுங்கள்.' : lang === 'mr' ? 'सुरक्षित व्यवहारांसाठी सत्यापित खरेदीदार आणि FPO शी जोडा.' : 'Connect with verified buyers and FPOs for secure transactions.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: TrendingUp,
    title: lang === 'hi' ? 'उचित मूल्य' : lang === 'te' ? 'న్యాయమైన ధర' : lang === 'kn' ? 'ನ್ಯಾಯಯುತ ಬೆಲೆ' : lang === 'ta' ? 'நியாயமான விலை' : lang === 'mr' ? 'योग्य किंमत' : 'Fair Pricing',
    description: lang === 'hi' ? 'सीधे किसान-से-खरीदार कनेक्शन के साथ सर्वोत्तम मूल्य प्राप्त करें।' : lang === 'te' ? 'నేరుగా రైతు-కొనుగోలుదారు కనెక్షన్‌తో ఉత్తమ ధరలు పొందండి.' : lang === 'kn' ? 'ನೇರ ರೈತ-ಖರೀದಿದಾರ ಸಂಪರ್ಕದೊಂದಿಗೆ ಅತ್ಯುತ್ತಮ ಬೆಲೆಗಳನ್ನು ಪಡೆಯಿರಿ.' : lang === 'ta' ? 'நேரடி விவசாயி-வாங்குபவர் இணைப்புடன் சிறந்த விலைகளைப் பெறுங்கள்.' : lang === 'mr' ? 'थेट शेतकरी-खरेदीदार कनेक्शनसह सर्वोत्तम किंमती मिळवा.' : 'Get the best prices with direct farmer-to-buyer connections.',
    color: 'bg-primary/10 text-primary',
  },
];

// Multilingual stats - with dynamic values
const getStats = (lang: string, realStats?: { farmers: string; transactions: string; fpos: string }) => [
  { value: realStats?.farmers || '0', label: lang === 'hi' ? 'किसान' : lang === 'te' ? 'రైతులు' : lang === 'kn' ? 'ರೈತರು' : lang === 'ta' ? 'விவசாயிகள்' : lang === 'mr' ? 'शेतकरी' : 'Farmers', icon: Users },
  { value: realStats?.transactions || '0', label: lang === 'hi' ? 'लेनदेन' : lang === 'te' ? 'లావాదేవీలు' : lang === 'kn' ? 'ವಹಿವಾಟುಗಳು' : lang === 'ta' ? 'பரிவர்த்தனைகள்' : lang === 'mr' ? 'व्यवहार' : 'Transactions', icon: TrendingUp },
  { value: realStats?.fpos || '0', label: lang === 'hi' ? 'एफपीओ' : lang === 'te' ? 'FPOలు' : lang === 'kn' ? 'FPOಗಳು' : lang === 'ta' ? 'FPOக்கள்' : lang === 'mr' ? 'FPO' : 'FPOs', icon: Shield },
  { value: '50+', label: lang === 'hi' ? 'जिले' : lang === 'te' ? 'జిల్లాలు' : lang === 'kn' ? 'ಜಿಲ್ಲೆಗಳು' : lang === 'ta' ? 'மாவட்டங்கள்' : lang === 'mr' ? 'जिल्हे' : 'Districts', icon: MapPin },
];

// Testimonials content
const getTestimonials = (lang: string) => [
  {
    name: lang === 'hi' ? 'रामेश कुमार' : lang === 'te' ? 'రామేష్ కుమార్' : lang === 'kn' ? 'ರಮೇಶ್ ಕುಮಾರ್' : lang === 'ta' ? 'ரமேஷ் குமார்' : lang === 'mr' ? 'रमेश कुमार' : 'Ramesh Kumar',
    role: lang === 'hi' ? 'किसान, तुमकुर' : lang === 'te' ? 'రైతు, తుమకూరు' : lang === 'kn' ? 'ರೈತ, ತುಮಕೂರು' : lang === 'ta' ? 'விவசாயி, தும்கூர்' : lang === 'mr' ? 'शेतकरी, तुमकुर' : 'Farmer, Tumkur',
    image: '/images/ramesh_kumar_farmer.png',
    quote: lang === 'hi' ? 'श्री अन्न ने मुझे स्थानीय मंडी से 20% अधिक कीमत पर मेरी रागी बेचने में मदद की।' : lang === 'te' ? 'శ్రీ అన్న స్థానిక మండీ కంటే 20% ఎక్కువ ధరకు నా రాగిని విక్రయించడంలో సహాయపడింది.' : lang === 'kn' ? 'ಶ್ರೀ ಅನ್ನ ನನಗೆ ಸ್ಥಳೀಯ ಮಂಡಿಗಿಂತ 20% ಹೆಚ್ಚು ಬೆಲೆಗೆ ನನ್ನ ರಾಗಿಯನ್ನು ಮಾರಾಟ ಮಾಡಲು ಸಹಾಯ ಮಾಡಿತು.' : lang === 'ta' ? 'ஸ்ரீ அன்னா உள்ளூர் மண்டியை விட 20% அதிக விலையில் என் ராகியை விற்க உதவியது.' : lang === 'mr' ? 'श्री अन्नने मला स्थानिक मंडईपेक्षा 20% जास्त किमतीत माझी नाचणी विकण्यास मदत केली.' : 'Shree Anna helped me sell my ragi at 20% higher price than local mandi.',
    rating: 5,
  },
  {
    name: lang === 'hi' ? 'लक्ष्मी देवी' : lang === 'te' ? 'లక్ష్మీ దేవి' : lang === 'kn' ? 'ಲಕ್ಷ್ಮಿ ದೇವಿ' : lang === 'ta' ? 'லட்சுமி தேவி' : lang === 'mr' ? 'लक्ष्मी देवी' : 'Lakshmi Devi',
    role: lang === 'hi' ? 'FPO प्रमुख, हासन' : lang === 'te' ? 'FPO లీడర్, హాసన్' : lang === 'kn' ? 'FPO ನಾಯಕ, ಹಾಸನ' : lang === 'ta' ? 'FPO தலைவர், ஹாசன்' : lang === 'mr' ? 'FPO प्रमुख, हासन' : 'FPO Leader, Hassan',
    image: '/images/lakshmi_devi_fpo.png',
    quote: lang === 'hi' ? 'बैच ट्रैकिंग सिस्टम से 150 किसानों को प्रबंधित करना आसान हो गया।' : lang === 'te' ? 'బ్యాచ్ ట్రాకింగ్ సిస్టమ్‌తో 150 మంది రైతులను నిర్వహించడం సులభం అయింది.' : lang === 'kn' ? 'ಬ್ಯಾಚ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಿಸ್ಟಮ್‌ನೊಂದಿಗೆ 150 ರೈತರನ್ನು ನಿರ್ವಹಿಸುವುದು ಸುಲಭವಾಯಿತು.' : lang === 'ta' ? 'பேட்ச் டிராக்கிங் சிஸ்டத்துடன் 150 விவசாயிகளை நிர்வகிப்பது எளிதாகியது.' : lang === 'mr' ? 'बॅच ट्रॅकिंग सिस्टमने 150 शेतकऱ्यांचे व्यवस्थापन सोपे झाले.' : 'Managing 150 farmers became easy with the batch tracking system.',
    rating: 5,
  },
  {
    name: lang === 'hi' ? 'ऑर्गेनिक फूड्स लिमिटेड' : lang === 'te' ? 'ఆర్గానిక్ ఫుడ్స్ లిమిటెడ్' : lang === 'kn' ? 'ಆರ್ಗಾನಿಕ್ ಫುಡ್ಸ್ ಲಿಮಿಟೆಡ್' : lang === 'ta' ? 'ஆர்கானிக் ஃபுட்ஸ் லிமிடெட்' : lang === 'mr' ? 'ऑर्गेनिक फूड्स लिमिटेड' : 'Organic Foods Ltd.',
    role: lang === 'hi' ? 'खरीदार, बेंगलुरु' : lang === 'te' ? 'కొనుగోలుదారు, బెంగళూరు' : lang === 'kn' ? 'ಖರೀದಿದಾರ, ಬೆಂಗಳೂರು' : lang === 'ta' ? 'வாங்குபவர், பெங்களூர்' : lang === 'mr' ? 'खरेदीदार, बंगलोर' : 'Buyer, Bengaluru',
    image: '/images/organic_foods_buyer.png',
    quote: lang === 'hi' ? 'हम सीधे सत्यापित किसानों से प्रीमियम गुणवत्ता वाले बाजरा प्राप्त करते हैं।' : lang === 'te' ? 'మేము ధృవీకరించబడిన రైతుల నుండి నేరుగా ప్రీమియం నాణ్యత చిరుధాన్యాలను సేకరిస్తాము.' : lang === 'kn' ? 'ನಾವು ಪರಿಶೀಲಿಸಿದ ರೈತರಿಂದ ನೇರವಾಗಿ ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟದ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಪಡೆಯುತ್ತೇವೆ.' : lang === 'ta' ? 'சரிபார்க்கப்பட்ட விவசாயிகளிடமிருந்து நேரடியாக பிரீமியம் தர சிறுதானியங்களை பெறுகிறோம்.' : lang === 'mr' ? 'आम्ही सत्यापित शेतकऱ्यांकडून थेट प्रीमियम दर्जाची ज्वारी-बाजरी मिळवतो.' : 'We source premium quality millets directly from verified farmers.',
    rating: 5,
  },
];

export default function HomePage() {
  const [role, setRole] = useState('farmer');
  const [showHelp, setShowHelp] = useState(false);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  // Real stats from backend
  const [realStats, setRealStats] = useState<{ farmers: string; transactions: string; fpos: string } | undefined>(undefined);

  // Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: farmersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).contains('roles', ['farmer']);
        const { count: fposCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).contains('roles', ['fpo']);
        const { count: transactionsCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

        if (farmersCount !== null || fposCount !== null) {
          setRealStats({
            farmers: (farmersCount || 0).toLocaleString(),
            transactions: (transactionsCount || 0).toString(),
            fpos: (fposCount || 0).toString(),
          });
        }
      } catch (error) {
        // Silently fall back to hardcoded stats
        console.log('Using default stats', error);
      }
    };
    fetchStats();
  }, []);

  // Get translated content based on current language
  const features = getFeatures(language);
  const stats = getStats(language, realStats);

  // Role-specific content configuration with all language support
  const roleContent: Record<string, any> = {
    farmer: {
      subtitle: language === 'hi' ? 'मिलेट्स मार्केटप्लेस'
        : language === 'te' ? 'మిల్లెట్స్ మార్కెట్‌ప్లేస్'
          : language === 'kn' ? 'ಮಿಲ್ಲೆಟ್ಸ್ ಮಾರುಕಟ್ಟೆ'
            : language === 'ta' ? 'சிறுதானிய சந்தை'
              : language === 'mr' ? 'मिलेट्स मार्केटप्लेस'
                : 'Millets Marketplace',
      tagline: language === 'hi' ? 'छोटे किसानों को सीधे खरीदारों से जोड़ना। वॉइस-सक्षम लिस्टिंग, ऑफलाइन सपोर्ट और पूर्ण ट्रेसेबिलिटी के साथ उचित मूल्य पर अपने बाजरे बेचें।'
        : language === 'te' ? 'చిన్న రైతులను నేరుగా కొనుగోలుదారులతో కలుపుతోంది. వాయిస్-ఎనేబుల్డ్ లిస్టింగ్‌లు, ఆఫ్‌లైన్ సపోర్ట్ మరియు పూర్తి ట్రేసబిలిటీతో మీ చిరుధాన్యాలను న్యాయమైన ధరలకు అమ్మండి.'
          : language === 'kn' ? 'ಸಣ್ಣ ರೈತರನ್ನು ನೇರವಾಗಿ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತಿದೆ. ವಾಯ್ಸ್-ಎನೇಬಲ್ಡ್ ಲಿಸ್ಟಿಂಗ್‌ಗಳು, ಆಫ್‌ಲೈನ್ ಬೆಂಬಲ ಮತ್ತು ಪೂರ್ಣ ಟ್ರೇಸಬಿಲಿಟಿಯೊಂದಿಗೆ ನಿಮ್ಮ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ನ್ಯಾಯಯುತ ಬೆಲೆಗಳಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ.'
            : language === 'ta' ? 'சிறு விவசாயிகளை நேரடியாக வாங்குபவர்களுடன் இணைக்கிறது. குரல்-இயக்கப்பட்ட பட்டியல்கள், ஆஃப்லைன் ஆதரவு மற்றும் முழுமையான தடமறிதலுடன் உங்கள் சிறுதானியங்களை நியாயமான விலையில் விற்கவும்.'
              : language === 'mr' ? 'छोट्या शेतकऱ्यांना थेट खरेदीदारांशी जोडतो. व्हॉइस-सक्षम लिस्टिंग, ऑफलाइन सपोर्ट आणि संपूर्ण ट्रेसेबिलिटीसह तुमचे ज्वारी-बाजरी योग्य किमतीत विका.'
                : 'Connecting smallholder farmers directly to buyers. Sell your millets at fair prices with voice-enabled listings, offline support, and complete traceability.',
      ctaRegister: language === 'hi' ? 'किसान के रूप में पंजीकरण करें'
        : language === 'te' ? 'రైతుగా నమోదు చేసుకోండి'
          : language === 'kn' ? 'ರೈತರಾಗಿ ನೋಂದಾಯಿಸಿ'
            : language === 'ta' ? 'விவசாயியாக பதிவு செய்யுங்கள்'
              : language === 'mr' ? 'शेतकरी म्हणून नोंदणी करा'
                : 'Register as Farmer',
      ctaLogin: language === 'hi' ? 'किसान के रूप में लॉगिन करें'
        : language === 'te' ? 'రైతుగా లాగిన్ అవ్వండి'
          : language === 'kn' ? 'ರೈತರಾಗಿ ಲಾಗಿನ್ ಆಗಿ'
            : language === 'ta' ? 'விவசாயியாக உள்நுழையுங்கள்'
              : language === 'mr' ? 'शेतकरी म्हणून लॉगिन करा'
                : 'Login as Farmer',
      image: "/images/heroes/farmer_hero.png"
    },
    buyer: {
      subtitle: language === 'hi' ? 'प्रीमियम गुणवत्ता वाले बाजरे की सोर्सिंग'
        : language === 'te' ? 'ప్రీమియం నాణ్యత చిరుధాన్యాలను సోర్సింగ్'
          : language === 'kn' ? 'ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟದ ಸಿರಿಧಾನ್ಯಗಳ ಸೋರ್ಸಿಂಗ್'
            : language === 'ta' ? 'பிரீமியம் தரமான சிறுதானியங்களை சோர்சிங்'
              : language === 'mr' ? 'प्रीमियम गुणवत्तेचे ज्वारी-बाजरी सोर्सिंग'
                : 'Source Premium Quality Millets',
      tagline: language === 'hi' ? 'सत्यापित किसानों और एफपीओ से सीधे जुड़ें। गुणवत्ता आश्वासन और पारदर्शी मूल्य निर्धारण के साथ थोक में खरीदें।'
        : language === 'te' ? 'ధృవీకరించబడిన రైతులు మరియు FPOలతో నేరుగా కనెక్ట్ అవ్వండి. నాణ్యత హామీ మరియు పారదర్శక ధరలతో బల్క్‌లో కొనుగోలు చేయండి.'
          : language === 'kn' ? 'ಪರಿಶೀಲಿಸಿದ ರೈತರು ಮತ್ತು FPOಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ. ಗುಣಮಟ್ಟದ ಭರವಸೆ ಮತ್ತು ಪಾರದರ್ಶಕ ಬೆಲೆಯೊಂದಿಗೆ ಬೃಹತ್ ಪ್ರಮಾಣದಲ್ಲಿ ಖರೀದಿಸಿ.'
            : language === 'ta' ? 'சரிபார்க்கப்பட்ட விவசாயிகள் மற்றும் FPOகளுடன் நேரடியாக இணையுங்கள். தர உத்தரவாதம் மற்றும் வெளிப்படையான விலையுடன் மொத்தமாக வாங்குங்கள்.'
              : language === 'mr' ? 'सत्यापित शेतकरी आणि FPO शी थेट जोडा. गुणवत्ता हमी आणि पारदर्शक किमतीसह मोठ्या प्रमाणात खरेदी करा.'
                : 'Connect directly with verified farmers and FPOs. Buy in bulk with quality assurance and transparent pricing.',
      ctaRegister: language === 'hi' ? 'खरीदार के रूप में पंजीकरण करें'
        : language === 'te' ? 'కొనుగోలుదారుగా నమోదు చేసుకోండి'
          : language === 'kn' ? 'ಖರೀದಿದಾರರಾಗಿ ನೋಂದಾಯಿಸಿ'
            : language === 'ta' ? 'வாங்குபவராக பதிவு செய்யுங்கள்'
              : language === 'mr' ? 'खरेदीदार म्हणून नोंदणी करा'
                : 'Register as Buyer',
      ctaLogin: language === 'hi' ? 'खरीदार के रूप में लॉगिन करें'
        : language === 'te' ? 'కొనుగోలుదారుగా లాగిన్ అవ్వండి'
          : language === 'kn' ? 'ಖರೀದಿದಾರರಾಗಿ ಲಾಗಿನ್ ಆಗಿ'
            : language === 'ta' ? 'வாங்குபவராக உள்நுழையுங்கள்'
              : language === 'mr' ? 'खरेदीदार म्हणून लॉगिन करा'
                : 'Login as Buyer',
      image: "/images/heroes/buyer_hero.png"
    },
    fpo: {
      subtitle: language === 'hi' ? 'एफपीओ को सशक्त बनाना'
        : language === 'te' ? 'FPOలను శక్తివంతం చేయడం'
          : language === 'kn' ? 'FPOಗಳನ್ನು ಸಬಲೀಕರಿಸುವುದು'
            : language === 'ta' ? 'FPOக்களை வலுப்படுத்துதல்'
              : language === 'mr' ? 'FPO ला सक्षम करणे'
                : 'Empowering FPOs',
      tagline: language === 'hi' ? 'अपने किसान सदस्यों को प्रबंधित करें, उपज को एकत्रित करें और बड़े खरीदारों से जुड़ें।'
        : language === 'te' ? 'మీ రైతు సభ్యులను నిర్వహించండి, ఉత్పత్తిని సేకరించండి మరియు పెద్ద కొనుగోలుదారులతో కనెక్ట్ అవ్వండి.'
          : language === 'kn' ? 'ನಿಮ್ಮ ರೈತ ಸದಸ್ಯರನ್ನು ನಿರ್ವಹಿಸಿ, ಉತ್ಪನ್ನವನ್ನು ಒಟ್ಟುಗೂಡಿಸಿ ಮತ್ತು ದೊಡ್ಡ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ.'
            : language === 'ta' ? 'உங்கள் விவசாயி உறுப்பினர்களை நிர்வகிக்கவும், உற்பத்தியை திரட்டவும் மற்றும் பெரிய வாங்குபவர்களுடன் இணையுங்கள்.'
              : language === 'mr' ? 'तुमच्या शेतकरी सदस्यांचे व्यवस्थापन करा, उत्पादन एकत्र करा आणि मोठ्या खरेदीदारांशी जोडा.'
                : 'Manage your farmer members, aggregate produce, and connect with large buyers efficiently.',
      ctaRegister: language === 'hi' ? 'एफपीओ के रूप में पंजीकरण करें'
        : language === 'te' ? 'FPOగా నమోదు చేసుకోండి'
          : language === 'kn' ? 'FPO ಆಗಿ ನೋಂದಾಯಿಸಿ'
            : language === 'ta' ? 'FPOவாக பதிவு செய்யுங்கள்'
              : language === 'mr' ? 'FPO म्हणून नोंदणी करा'
                : 'Register as FPO',
      ctaLogin: language === 'hi' ? 'एफपीओ के रूप में लॉगिन करें'
        : language === 'te' ? 'FPOగా లాగిన్ అవ్వండి'
          : language === 'kn' ? 'FPO ಆಗಿ ಲಾಗಿನ್ ಆಗಿ'
            : language === 'ta' ? 'FPOவாக உள்நுழையுங்கள்'
              : language === 'mr' ? 'FPO म्हणून लॉगिन करा'
                : 'Login as FPO',
      image: "/images/heroes/fpo_hero.png"
    },
    processor: {
      subtitle: language === 'hi' ? 'प्रसंस्करण समाधान'
        : language === 'te' ? 'ప్రాసెసింగ్ సొల్యూషన్స్'
          : language === 'kn' ? 'ಪ್ರಕ್ರಿಯೆ ಪರಿಹಾರಗಳು'
            : language === 'ta' ? 'பதப்படுத்தும் தீர்வுகள்'
              : language === 'mr' ? 'प्रक्रिया उपाय'
                : 'Processing Solutions',
      tagline: language === 'hi' ? 'किसानों से कच्चा माल प्राप्त करें और मूल्य वर्धित उत्पादों को बाजार में बेचें।'
        : language === 'te' ? 'రైతుల నుండి ముడి పదార్థాలను సేకరించండి మరియు విలువ ఆధారిత ఉత్పత్తులను మార్కెట్‌లో అమ్మండి.'
          : language === 'kn' ? 'ರೈತರಿಂದ ಕಚ್ಚಾ ವಸ್ತುಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ ಮತ್ತು ಮೌಲ್ಯವರ್ಧಿತ ಉತ್ಪನ್ನಗಳನ್ನು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ.'
            : language === 'ta' ? 'விவசாயிகளிடமிருந்து மூலப்பொருட்களைப் பெறுங்கள் மற்றும் மதிப்பு கூட்டப்பட்ட தயாரிப்புகளை சந்தையில் விற்கவும்.'
              : language === 'mr' ? 'शेतकऱ्यांकडून कच्चा माल मिळवा आणि मूल्यवर्धित उत्पादने बाजारात विका.'
                : 'Source raw material from farmers and sell value-added products to the market.',
      ctaRegister: language === 'hi' ? 'प्रोसेसर के रूप में पंजीकरण करें'
        : language === 'te' ? 'ప్రాసెసర్‌గా నమోదు చేసుకోండి'
          : language === 'kn' ? 'ಪ್ರಕ್ರಿಯೆದಾರರಾಗಿ ನೋಂದಾಯಿಸಿ'
            : language === 'ta' ? 'செயலியாக பதிவு செய்யுங்கள்'
              : language === 'mr' ? 'प्रोसेसर म्हणून नोंदणी करा'
                : 'Register as Processor',
      ctaLogin: language === 'hi' ? 'प्रोसेसर के रूप में लॉगिन करें'
        : language === 'te' ? 'ప్రాసెసర్‌గా లాగిన్ అవ్వండి'
          : language === 'kn' ? 'ಪ್ರಕ್ರಿಯೆದಾರರಾಗಿ ಲಾಗಿನ್ ಆಗಿ'
            : language === 'ta' ? 'செயலியாக உள்நுழையுங்கள்'
              : language === 'mr' ? 'प्रोसेसर म्हणून लॉगिन करा'
                : 'Login as Processor',
      image: "/images/heroes/processor_hero.png"
    },
    ksc: {
      subtitle: language === 'hi' ? 'किसान सेवा केंद्र'
        : language === 'te' ? 'కిసాన్ సేవా కేంద్రం'
          : language === 'kn' ? 'ಕಿಸಾನ್ ಸೇವಾ ಕೇಂದ್ರ'
            : language === 'ta' ? 'கிசான் சேவை மையம்'
              : language === 'mr' ? 'किसान सेवा केंद्र'
                : 'Kisan Service Center',
      tagline: language === 'hi' ? 'किसानों को डिजिटल मंडी से जोड़ने में मदद करें। सत्यापन, पंजीकरण और सहायता।'
        : language === 'te' ? 'రైతులను డిజిటల్ మార్కెట్‌తో కనెక్ట్ చేయడంలో సహాయపడండి. ధృవీకరణ, నమోదు మరియు మద్దతు.'
          : language === 'kn' ? 'ರೈತರನ್ನು ಡಿಜಿಟಲ್ ಮಾರುಕಟ್ಟೆಗೆ ಸಂಪರ್ಕಿಸಲು ಸಹಾಯ ಮಾಡಿ. ಪರಿಶೀಲನೆ, ನೋಂದಣಿ ಮತ್ತು ಬೆಂಬಲ.'
            : language === 'ta' ? 'விவசாயிகளை டிஜிட்டல் சந்தையுடன் இணைக்க உதவுங்கள். சரிபார்ப்பு, பதிவு மற்றும் ஆதரவு.'
              : language === 'mr' ? 'शेतकऱ्यांना डिजिटल बाजारपेठेशी जोडण्यात मदत करा. सत्यापन, नोंदणी आणि समर्थन.'
                : 'Help farmers connect to the digital marketplace. Verification, registration, and support.',
      ctaRegister: language === 'hi' ? 'KSC के रूप में पंजीकरण करें'
        : language === 'te' ? 'KSC గా నమోదు చేసుకోండి'
          : language === 'kn' ? 'KSC ಆಗಿ ನೋಂದಾಯಿಸಿ'
            : language === 'ta' ? 'KSC ஆக பதிவு செய்யுங்கள்'
              : language === 'mr' ? 'KSC म्हणून नोंदणी करा'
                : 'Register as KSC',
      ctaLogin: language === 'hi' ? 'KSC के रूप में लॉगिन करें'
        : language === 'te' ? 'KSC గా లాగిన్ అవ్వండి'
          : language === 'kn' ? 'KSC ಆಗಿ ಲಾಗಿನ್ ಆಗಿ'
            : language === 'ta' ? 'KSC ஆக உள்நுழையுங்கள்'
              : language === 'mr' ? 'KSC म्हणून लॉगिन करा'
                : 'Login as KSC',
      image: "/images/heroes/ksc_hero.png"
    }
  };

  const currentRoleContent = roleContent[role] || roleContent.farmer;

  const speakPageContent = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(currentRoleContent.tagline);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e9b93e' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                🌾 Millet Value Chain
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
                <span className="text-primary">श्री अन्न</span>
                <br />
                <span className="text-foreground flex items-center gap-3">
                  Shree Anna
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={speakPageContent}
                    className="touch-target"
                    aria-label={isSpeaking ? 'Stop speaking' : 'Read page content aloud'}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-6 h-6 text-destructive" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </Button>
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-muted-foreground mb-2 font-heading">
                {currentRoleContent.subtitle}
              </p>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                {currentRoleContent.tagline}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 mb-8 w-full max-w-md">
                <Button asChild size="lg" className="h-14 text-base px-6 touch-target justify-center">
                  <Link href={`/${role}/register`}>
                    <span className="mr-2">📝</span>
                    {currentRoleContent.ctaRegister}
                    <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 text-base px-6 touch-target justify-center">
                  <Link href="/login">
                    <span className="mr-2">🔐</span>
                    {currentRoleContent.ctaLogin}
                  </Link>
                </Button>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/fpo/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-sm sm:text-base font-medium transition-colors touch-target"
                >
                  🏢 {language === 'hi' ? 'FPO/SHG पोर्टल' : language === 'te' ? 'FPO/SHG పోర్టల్' : language === 'kn' ? 'FPO/SHG ಪೋರ್ಟಲ್' : language === 'ta' ? 'FPO/SHG போர்டல்' : language === 'mr' ? 'FPO/SHG पोर्टल' : 'FPO/SHG Portal'}
                </Link>
                <Link
                  href="/schemes"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-sm sm:text-base font-medium transition-colors touch-target"
                >
                  📋 {language === 'hi' ? 'सरकारी योजनाएं' : language === 'te' ? 'ప్రభుత్వ పథకాలు' : language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : language === 'ta' ? 'அரசு திட்டங்கள்' : language === 'mr' ? 'सरकारी योजना' : 'Government Schemes'}
                </Link>
                <button
                  onClick={() => setShowHelp(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-sm sm:text-base font-medium transition-colors touch-target"
                >
                  <Phone className="w-4 h-4" />
                  {language === 'hi' ? 'सहायता: 1800-XXX-XXXX' : language === 'te' ? 'సహాయం: 1800-XXX-XXXX' : language === 'kn' ? 'ಸಹಾಯ: 1800-XXX-XXXX' : language === 'ta' ? 'உதவி: 1800-XXX-XXXX' : language === 'mr' ? 'मदत: 1800-XXX-XXXX' : 'Help: 1800-XXX-XXXX'}
                </button>
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={currentRoleContent.image}
                  alt={`${role} in millet field`}
                  className="w-full h-[400px] sm:h-[500px] object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Play button overlay */}

              </div>

              {/* Floating stats card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-4 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹15 Cr+</p>
                    <p className="text-sm text-muted-foreground">{language === 'hi' ? 'कुल लेनदेन' : language === 'te' ? 'మొత్తం లావాదేవీలు' : language === 'kn' ? 'ಒಟ್ಟು ವಹಿವಾಟುಗಳು' : language === 'ta' ? 'மொத்த பரிவர்த்தனைகள்' : language === 'mr' ? 'एकूण व्यवहार' : 'Total Transactions'}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              {language === 'hi' ? 'भारतीय किसानों के लिए बनाया गया' : language === 'te' ? 'భారతీయ రైతుల కోసం నిర్మించబడింది' : language === 'kn' ? 'ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ' : language === 'ta' ? 'இந்திய விவசாயிகளுக்காக உருவாக்கப்பட்டது' : language === 'mr' ? 'भारतीय शेतकऱ्यांसाठी तयार केलेले' : 'Built for Indian Farmers'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'hi' ? 'छोटे किसानों, एफपीओ और ग्रामीण समुदायों के लिए सरल और सुलभ तकनीक।' : language === 'te' ? 'చిన్న రైతులు, FPOలు మరియు గ్రామీణ సమాజాల కోసం సులభమైన, అందుబాటులో ఉండే సాంకేతికత.' : language === 'kn' ? 'ಸಣ್ಣ ರೈತರು, FPOಗಳು ಮತ್ತು ಗ್ರಾಮೀಣ ಸಮುದಾಯಗಳಿಗಾಗಿ ಸರಳ, ಪ್ರವೇಶಿಸಬಹುದಾದ ತಂತ್ರಜ್ಞಾನ.' : language === 'ta' ? 'சிறு விவசாயிகள், FPOக்கள் மற்றும் கிராமப்புற சமூகங்களுக்கான எளிமையான, அணுகக்கூடிய தொழில்நுட்பம்.' : language === 'mr' ? 'लहान शेतकरी, FPO आणि ग्रामीण समुदायांसाठी साधी, सुलभ तंत्रज्ञान.' : 'Simple, accessible technology designed for smallholder farmers, FPOs, and rural communities.'}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Millet Types Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              {language === 'hi' ? 'सभी प्रकार के बाजरे का व्यापार करें' : language === 'te' ? 'అన్ని రకాల చిరుధాన్యాలను వ్యాపారం చేయండి' : language === 'kn' ? 'ಎಲ್ಲಾ ರೀತಿಯ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ವ್ಯಾಪಾರ ಮಾಡಿ' : language === 'ta' ? 'அனைத்து வகையான சிறுதானியங்களையும் வர்த்தகம் செய்யுங்கள்' : language === 'mr' ? 'सर्व प्रकारच्या ज्वारी-बाजरीचा व्यापार करा' : 'Trade All Types of Millets'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {language === 'hi' ? 'रागी से ज्वार तक, सभी पौष्टिक बाजरे की किस्में खरीदें और बेचें' : language === 'te' ? 'రాగి నుండి జొన్నల వరకు, అన్ని పోషకమైన చిరుధాన్య రకాలను కొనండి మరియు అమ్మండి' : language === 'kn' ? 'ರಾಗಿಯಿಂದ ಜೋಳದವರೆಗೆ, ಎಲ್ಲಾ ಪೌಷ್ಟಿಕ ಸಿರಿಧಾನ್ಯ ತಳಿಗಳನ್ನು ಖರೀದಿಸಿ ಮತ್ತು ಮಾರಾಟ ಮಾಡಿ' : language === 'ta' ? 'கேழ்வரகு முதல் சோளம் வரை, அனைத்து சத்தான சிறுதானிய வகைகளையும் வாங்கி விற்கவும்' : language === 'mr' ? 'नाचणीपासून ज्वारीपर्यंत, सर्व पौष्टिक ज्वारी-बाजरी प्रकार खरेदी आणि विक्री करा' : 'From Ragi to Jowar, buy and sell all nutritious millet varieties'}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {milletTypes.map((millet, idx) => {
              const localName = language === 'hi' ? millet.nameHi : language === 'te' ? millet.nameTe : language === 'kn' ? millet.nameKn : language === 'ta' ? millet.nameTa : language === 'mr' ? millet.nameMr : null;
              return (
                <motion.div
                  key={millet.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-full px-5 py-3 border border-border flex items-center gap-2 hover:border-primary transition-colors cursor-pointer"
                >
                  <span className="text-xl">🌾</span>
                  <div>
                    <span className="font-medium">{language === 'en' ? millet.name : localName}</span>
                    {language === 'en' && <span className="text-muted-foreground ml-2 text-sm">({millet.nameHi})</span>}
                    {language !== 'en' && <span className="text-muted-foreground ml-2 text-sm">({millet.name})</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              {language === 'hi' ? 'यह कैसे काम करता है' : language === 'te' ? 'ఇది ఎలా పని చేస్తుంది' : language === 'kn' ? 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ' : language === 'ta' ? 'இது எப்படி செயல்படுகிறது' : language === 'mr' ? 'हे कसे कार्य करते' : 'How It Works'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {language === 'hi' ? 'बाजरा बेचने या खरीदने के लिए सरल कदम' : language === 'te' ? 'చిరుధాన్యాలను అమ్మడం లేదా కొనడం ప్రారంభించడానికి సులభమైన దశలు' : language === 'kn' ? 'ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಮಾರಾಟ ಅಥವಾ ಖರೀದಿಸಲು ಸರಳ ಹಂತಗಳು' : language === 'ta' ? 'சிறுதானியங்களை விற்க அல்லது வாங்க எளிய படிகள்' : language === 'mr' ? 'ज्वारी-बाजरी विक्री किंवा खरेदी सुरू करण्यासाठी सोपी पावले' : 'Simple steps to start selling or buying millets'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Farmers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl border border-border p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">👨‍🌾</span>
                </div>
                <h3 className="text-2xl font-heading font-semibold">{language === 'hi' ? 'किसानों के लिए' : language === 'te' ? 'రైతుల కోసం' : language === 'kn' ? 'ರೈತರಿಗಾಗಿ' : language === 'ta' ? 'விவசாயிகளுக்கு' : language === 'mr' ? 'शेतकऱ्यांसाठी' : 'For Farmers'}</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: language === 'hi' ? 'पंजीकरण करें' : language === 'te' ? 'నమోదు చేసుకోండి' : language === 'kn' ? 'ನೋಂದಾಯಿಸಿ' : language === 'ta' ? 'பதிவு செய்யுங்கள்' : language === 'mr' ? 'नोंदणी करा' : 'Register',
                    desc: language === 'hi' ? 'अपने फोन नंबर से साइन अप करें' : language === 'te' ? 'మీ ఫోన్ నంబర్‌తో సైన్ అప్ చేయండి' : language === 'kn' ? 'ನಿಮ್ಮ ಫೋನ್ ನಂಬರ್‌ನೊಂದಿಗೆ ಸೈನ್ ಅಪ್ ಮಾಡಿ' : language === 'ta' ? 'உங்கள் ஃபோன் எண்ணுடன் பதிவு செய்யுங்கள்' : language === 'mr' ? 'तुमच्या फोन नंबरने साइन अप करा' : 'Sign up with your phone number'
                  },
                  {
                    step: 2,
                    title: language === 'hi' ? 'लिस्टिंग बनाएं' : language === 'te' ? 'జాబితా సృష్టించండి' : language === 'kn' ? 'ಲಿಸ್ಟಿಂಗ್ ರಚಿಸಿ' : language === 'ta' ? 'பட்டியல் உருவாக்குங்கள்' : language === 'mr' ? 'लिस्टिंग तयार करा' : 'Create Listing',
                    desc: language === 'hi' ? 'वॉइस का उपयोग करके अपनी उपज लिस्ट करें' : language === 'te' ? 'వాయిస్ ఉపయోగించి మీ ఉత్పత్తిని జాబితా చేయండి' : language === 'kn' ? 'ವಾಯ್ಸ್ ಬಳಸಿ ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಲಿಸ್ಟ್ ಮಾಡಿ' : language === 'ta' ? 'குரலைப் பயன்படுத்தி உங்கள் விளைபொருளை பட்டியலிடுங்கள்' : language === 'mr' ? 'व्हॉइस वापरून तुमचे उत्पादन लिस्ट करा' : 'Use voice to list your produce'
                  },
                  {
                    step: 3,
                    title: language === 'hi' ? 'ऑफर प्राप्त करें' : language === 'te' ? 'ఆఫర్లు పొందండి' : language === 'kn' ? 'ಆಫರ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ' : language === 'ta' ? 'சலுகைகளைப் பெறுங்கள்' : language === 'mr' ? 'ऑफर मिळवा' : 'Receive Offers',
                    desc: language === 'hi' ? 'सत्यापित खरीदारों से ऑफर प्राप्त करें' : language === 'te' ? 'ధృవీకరించబడిన కొనుగోలుదారుల నుండి ఆఫర్లు పొందండి' : language === 'kn' ? 'ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರಿಂದ ಆಫರ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ' : language === 'ta' ? 'சரிபார்க்கப்பட்ட வாங்குபவர்களிடமிருந்து சலுகைகளைப் பெறுங்கள்' : language === 'mr' ? 'सत्यापित खरेदीदारांकडून ऑफर मिळवा' : 'Get offers from verified buyers'
                  },
                  {
                    step: 4,
                    title: language === 'hi' ? 'भुगतान प्राप्त करें' : language === 'te' ? 'చెల్లింపు పొందండి' : language === 'kn' ? 'ಪಾವತಿ ಪಡೆಯಿರಿ' : language === 'ta' ? 'பணம் பெறுங்கள்' : language === 'mr' ? 'पेमेंट मिळवा' : 'Get Paid',
                    desc: language === 'hi' ? 'बिक्री की पुष्टि करें और भुगतान प्राप्त करें' : language === 'te' ? 'విక్రయాన్ని నిర్ధారించండి మరియు చెల్లింపు పొందండి' : language === 'kn' ? 'ಮಾರಾಟವನ್ನು ದೃಢೀಕರಿಸಿ ಮತ್ತು ಪಾವತಿ ಪಡೆಯಿರಿ' : language === 'ta' ? 'விற்பனையை உறுதிப்படுத்தி பணம் பெறுங்கள்' : language === 'mr' ? 'विक्रीची पुष्टी करा आणि पेमेंट मिळवा' : 'Confirm sale and receive payment'
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild size="xl" className="w-full mt-6 touch-target">
                <Link href="/farmer/register">
                  {language === 'hi' ? 'बेचना शुरू करें' : language === 'te' ? 'అమ్మడం ప్రారంభించండి' : language === 'kn' ? 'ಮಾರಾಟ ಪ್ರಾರಂಭಿಸಿ' : language === 'ta' ? 'விற்க தொடங்குங்கள்' : language === 'mr' ? 'विक्री सुरू करा' : 'Start Selling'} <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>

            {/* For Buyers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl border border-border p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-2xl font-heading font-semibold">{language === 'hi' ? 'खरीदारों के लिए' : language === 'te' ? 'కొనుగోలుదారుల కోసం' : language === 'kn' ? 'ಖರೀದಿದಾರರಿಗಾಗಿ' : language === 'ta' ? 'வாங்குபவர்களுக்கு' : language === 'mr' ? 'खरेदीदारांसाठी' : 'For Buyers'}</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: language === 'hi' ? 'लिस्टिंग ब्राउज़ करें' : language === 'te' ? 'జాబితాలను బ్రౌజ్ చేయండి' : language === 'kn' ? 'ಲಿಸ್ಟಿಂಗ್‌ಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' : language === 'ta' ? 'பட்டியல்களை உலாவுங்கள்' : language === 'mr' ? 'लिस्टिंग ब्राउझ करा' : 'Browse Listings',
                    desc: language === 'hi' ? 'प्रकार, स्थान, गुणवत्ता के अनुसार मिलेट खोजें' : language === 'te' ? 'రకం, స్థానం, నాణ్యత ద్వారా మిల్లెట్లను శోధించండి' : language === 'kn' ? 'ಪ್ರಕಾರ, ಸ್ಥಳ, ಗುಣಮಟ್ಟದ ಮೂಲಕ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಹುಡುಕಿ' : language === 'ta' ? 'வகை, இடம், தரம் மூலம் தினைகளைத் தேடுங்கள்' : language === 'mr' ? 'प्रकार, स्थान, गुणवत्तेनुसार मिलेट शोधा' : 'Search millets by type, location, quality'
                  },
                  {
                    step: 2,
                    title: language === 'hi' ? 'ऑफर दें' : language === 'te' ? 'ఆఫర్లు చేయండి' : language === 'kn' ? 'ಆಫರ್ ಮಾಡಿ' : language === 'ta' ? 'சலுகைகள் செய்யுங்கள்' : language === 'mr' ? 'ऑफर करा' : 'Make Offers',
                    desc: language === 'hi' ? 'किसानों को सीधे ऑफर भेजें' : language === 'te' ? 'రైతులకు నేరుగా ఆఫర్లు పంపండి' : language === 'kn' ? 'ರೈತರಿಗೆ ನೇರವಾಗಿ ಆಫರ್‌ಗಳನ್ನು ಕಳುಹಿಸಿ' : language === 'ta' ? 'விவசாயிகளுக்கு நேரடியாக சலுகைகளை அனுப்புங்கள்' : language === 'mr' ? 'शेतकऱ्यांना थेट ऑफर पाठवा' : 'Send offers to farmers directly'
                  },
                  {
                    step: 3,
                    title: language === 'hi' ? 'गुणवत्ता सत्यापित करें' : language === 'te' ? 'నాణ్యతను ధృవీకరించండి' : language === 'kn' ? 'ಗುಣಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಿ' : language === 'ta' ? 'தரத்தை சரிபார்க்கவும்' : language === 'mr' ? 'गुणवत्ता सत्यापित करा' : 'Verify Quality',
                    desc: language === 'hi' ? 'प्रमाणपत्र जांचें और मूल पता लगाएं' : language === 'te' ? 'ధృవీకరణలు తనిఖీ చేయండి మరియు మూలాన్ని ట్రేస్ చేయండి' : language === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮೂಲವನ್ನು ಟ್ರೇಸ್ ಮಾಡಿ' : language === 'ta' ? 'சான்றிதழ்களை சரிபார்த்து தோற்றத்தை கண்டறியுங்கள்' : language === 'mr' ? 'प्रमाणपत्रे तपासा आणि मूळ शोधा' : 'Check certifications and trace origin'
                  },
                  {
                    step: 4,
                    title: language === 'hi' ? 'खरीदारी पूरी करें' : language === 'te' ? 'కొనుగోలు పూర్తి చేయండి' : language === 'kn' ? 'ಖರೀದಿ ಪೂರ್ಣಗೊಳಿಸಿ' : language === 'ta' ? 'கொள்முதலை முடிக்கவும்' : language === 'mr' ? 'खरेदी पूर्ण करा' : 'Complete Purchase',
                    desc: language === 'hi' ? 'पिकअप की व्यवस्था करें और भुगतान करें' : language === 'te' ? 'పికప్ ఏర్పాటు చేసి చెల్లింపు చేయండి' : language === 'kn' ? 'ಪಿಕಪ್ ಏರ್ಪಡಿಸಿ ಮತ್ತು ಪಾವತಿ ಮಾಡಿ' : language === 'ta' ? 'பிக்கப் ஏற்பாடு செய்து பணம் செலுத்துங்கள்' : language === 'mr' ? 'पिकअप व्यवस्था करा आणि पेमेंट करा' : 'Arrange pickup and make payment'
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild variant="outline" size="xl" className="w-full mt-6 touch-target">
                <Link href="/buyer/dashboard">
                  {language === 'hi' ? 'खरीदना शुरू करें' : language === 'te' ? 'కొనుగోలు ప్రారంభించండి' : language === 'kn' ? 'ಖರೀದಿ ಪ್ರಾರಂಭಿಸಿ' : language === 'ta' ? 'வாங்க தொடங்குங்கள்' : language === 'mr' ? 'खरेदी सुरू करा' : 'Start Buying'} <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              {language === 'hi' ? 'किसानों और खरीदारों द्वारा विश्वसनीय' : language === 'te' ? 'రైతులు మరియు కొనుగోలుదారులచే విశ్వసనీయం' : language === 'kn' ? 'ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರಿಂದ ವಿಶ್ವಾಸಾರ್ಹ' : language === 'ta' ? 'விவசாயிகள் மற்றும் வாங்குபவர்களால் நம்பகமானது' : language === 'mr' ? 'शेतकरी आणि खरेदीदारांचा विश्वास' : 'Trusted by Farmers & Buyers'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {getTestimonials(language).map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 sm:p-12 text-center text-primary-foreground"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              {language === 'hi' ? 'अपने बाजरा व्यापार को बदलने के लिए तैयार हैं?' : language === 'te' ? 'మీ చిరుధాన్యాల వ్యాపారాన్ని మార్చడానికి సిద్ధంగా ఉన్నారా?' : language === 'kn' ? 'ನಿಮ್ಮ ಸಿರಿಧಾನ್ಯ ವ್ಯಾಪಾರವನ್ನು ಬದಲಾಯಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?' : language === 'ta' ? 'உங்கள் சிறுதானிய வர்த்தகத்தை மாற்ற தயாரா?' : language === 'mr' ? 'तुमचा ज्वारी-बाजरी व्यापार बदलायला तयार आहात?' : 'Ready to Transform Your Millet Trade?'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {language === 'hi' ? 'भारत के सबसे भरोसेमंद बाजरा मार्केटप्लेस पर हजारों किसानों और खरीदारों से जुड़ें।' : language === 'te' ? 'భారతదేశపు అత్యంత నమ్మకమైన చిరుధాన్యాల మార్కెట్‌ప్లేస్‌లో వేలాది మంది రైతులు మరియు కొనుగోలుదారులతో చేరండి.' : language === 'kn' ? 'ಭಾರತದ ಅತ್ಯಂತ ವಿಶ್ವಾಸಾರ್ಹ ಸಿರಿಧಾನ್ಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಸಾವಿರಾರು ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರೊಂದಿಗೆ ಸೇರಿ.' : language === 'ta' ? 'இந்தியாவின் மிகவும் நம்பகமான சிறுதானிய சந்தையில் ஆயிரக்கணக்கான விவசாயிகள் மற்றும் வாங்குபவர்களுடன் சேருங்கள்.' : language === 'mr' ? 'भारतातील सर्वात विश्वसनीय ज्वारी-बाजरी मार्केटप्लेसवर हजारो शेतकरी आणि खरेदीदारांसमवेत सामील व्हा.' : 'Join thousands of farmers and buyers on India&apos;s most trusted millet marketplace.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" variant="secondary" className="text-lg px-8 touch-target">
                <Link href={`/${role}/register`}>
                  {currentRoleContent.ctaRegister}
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10 touch-target">
                <Link href="/login">
                  {currentRoleContent.ctaLogin}
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-75">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              {language === 'hi' ? 'मुफ्त पंजीकरण • कोई छुपे शुल्क नहीं • सुरक्षित लेनदेन' : language === 'te' ? 'ఉచిత నమోదు • దాచిన చార్జీలు లేవు • సురక్షిత లేవాదేవీలు' : language === 'kn' ? 'ಉಚಿತ ನೋಂದಣಿ • ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕಗಳಿಲ್ಲ • ಸುರಕ್ಷಿತ ವಹಿವಾಟುಗಳು' : language === 'ta' ? 'உசித பதிவு • மறைமுக கட்டணங்கள் இல்லை • பாதுகாப்பான பரிவர்த்தனைகள்' : language === 'mr' ? 'मोफत नोंदणी • कोणतेही लपविलेले शुल्क नाहीत • सुरक्षित व्यवहार' : 'Free registration • No hidden charges • Secure transactions'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xl">🌾</span>
                </div>
                <div>
                  <span className="font-heading font-bold text-lg">{language === 'hi' ? 'श्री अन्न' : language === 'te' ? 'శ్రీ అన్న' : language === 'kn' ? 'ಶ್ರೀ ಅನ್ನ' : language === 'ta' ? 'ஸ்ரீ அன்னா' : language === 'mr' ? 'श्री अन्न' : 'Shree Anna'}</span>
                  <span className="block text-xs text-muted-foreground">{language === 'hi' ? 'बाजरा मार्केटप्लेस' : language === 'te' ? 'చిరుధాన్యాల మార్కెట్‌ప్లేస్' : language === 'kn' ? 'ಸಿರಿಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ' : language === 'ta' ? 'சிறுதானிய சந்தை' : language === 'mr' ? 'ज्वारी-बाजरी मार्केटप्लेस' : 'Millets Marketplace'}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'hi' ? 'निष्पक्ष और पारदर्शी बाजरा व्यापार के लिए छोटे किसानों को तकनीक से सशक्त बनाना।' : language === 'te' ? 'న్యాయమైన మరియు పారదర్శక చిరుధాన్యాల వాణిజ్యం కోసం చిన్న రైతులను సాంకేతికతో శక్తివంతం చేయడం.' : language === 'kn' ? 'ನ್ಯಾಯಯುತ ಮತ್ತು ಪಾರದರ್ಶಕ ಸಿರಿಧಾನ್ಯ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ಸಣ್ಣ ರೈತರನ್ನು ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ಸಬಲೀಕರಣಗೊಳಿಸುವುದು.' : language === 'ta' ? 'நியாயமான மற்றும் வெளிப்படையான சிறுதானிய வர்த்தகத்திற்காக சிறு விவசாயிகளை தொழில்நுட்பத்துடன் மேம்படுத்துதல்.' : language === 'mr' ? 'निष्पक्ष आणि पारदर्शक ज्वारी-बाजरी व्यापारासाठी छोट्या शेतकऱ्यांना तंत्रज्ञानाने सक्षम करणे.' : 'Empowering smallholder farmers with technology for fair and transparent millet trade.'}
              </p>
              <p className="text-sm text-muted-foreground">
                <Phone className="w-4 h-4 inline mr-1" />
                {language === 'hi' ? 'टोल-फ्री: 1800-XXX-XXXX' : language === 'te' ? 'టోల్-ఫ్రీ: 1800-XXX-XXXX' : language === 'kn' ? 'ಟೋಲ್-ಫ್ರೀ: 1800-XXX-XXXX' : language === 'ta' ? 'இலவச அழைப்பு: 1800-XXX-XXXX' : language === 'mr' ? 'टोल-फ्री: 1800-XXX-XXXX' : 'Toll-free: 1800-XXX-XXXX'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">{language === 'hi' ? 'त्वरित लिंक' : language === 'te' ? 'శీఘ్ర లింక్‌లు' : language === 'kn' ? 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು' : language === 'ta' ? 'விரைவு இணைப்புகள்' : language === 'mr' ? 'जलद दुवे' : 'Quick Links'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/marketplace" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'मार्केटप्लेस' : language === 'te' ? 'మార్కెట్‌ప్లేస్' : language === 'kn' ? 'ಮಾರುಕಟ್ಟೆ' : language === 'ta' ? 'சந்தை' : language === 'mr' ? 'मार्केटप्लेस' : 'Marketplace'}</Link></li>
                <li><Link href="/farmer/dashboard" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'किसान डैशबोर्ड' : language === 'te' ? 'రైతు డాష్‌బోర్డ్' : language === 'kn' ? 'ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : language === 'ta' ? 'விவசாயி டாஷ்போர்டு' : language === 'mr' ? 'शेतकरी डॅशबोर्ड' : 'Farmer Dashboard'}</Link></li>
                <li><Link href="/buyer/dashboard" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'खरीदार डैशबोर्ड' : language === 'te' ? 'కొనుగోలుదారు డాష్‌బోర్డ్' : language === 'kn' ? 'ಖರೀದಿದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : language === 'ta' ? 'வாங்குபவர் டாஷ்போர்டு' : language === 'mr' ? 'खरेदीदार डॅशबोर्ड' : 'Buyer Dashboard'}</Link></li>
                <li><Link href="/schemes" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'सरकारी योजनाएं' : language === 'te' ? 'ప్రభుత్వ పథకాలు' : language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : language === 'ta' ? 'அரசு திட்டங்கள்' : language === 'mr' ? 'सरकारी योजना' : 'Government Schemes'}</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">{language === 'hi' ? 'सहायता' : language === 'te' ? 'సహాయం' : language === 'kn' ? 'ಬೆಂಬಲ' : language === 'ta' ? 'ஆதரவு' : language === 'mr' ? 'मदत' : 'Support'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'सहायता केंद्र' : language === 'te' ? 'సహాయ కేంద్రం' : language === 'kn' ? 'ಸಹಾಯ ಕೇಂದ್ರ' : language === 'ta' ? 'உதவி மையம்' : language === 'mr' ? 'मदत केंद्र' : 'Help Center'}</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : language === 'te' ? 'తరచుగా అడిగే ప్రశ్నలు' : language === 'kn' ? 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು' : language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : language === 'mr' ? 'वारंवार विचारले जाणारे प्रश्न' : 'FAQs'}</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'संपर्क करें' : language === 'te' ? 'మమ్మల్ని సంప్రదించండి' : language === 'kn' ? 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ' : language === 'ta' ? 'எங்களை தொடர்பு கொள்ளுங்கள்' : language === 'mr' ? 'आमच्याशी संपर्क साधा' : 'Contact Us'}</Link></li>
                <li><button onClick={() => setShowHelp(true)} className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'कॉलबैक का अनुरोध करें' : language === 'te' ? 'కాల్‌బ్యాక్ అభ్యర్థించండి' : language === 'kn' ? 'ಕಾಲ್‌ಬ್ಯಾಕ್ ವಿನಂತಿಸಿ' : language === 'ta' ? 'திரும்ப அழைக்க கோருங்கள்' : language === 'mr' ? 'कॉलबॅक विनंती करा' : 'Request Callback'}</button></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">{language === 'hi' ? 'कानूनी' : language === 'te' ? 'చట్టపరమైన' : language === 'kn' ? 'ಕಾನೂನು' : language === 'ta' ? 'சட்டப்பூர்வ' : language === 'mr' ? 'कायदेशीर' : 'Legal'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'गोपनीयता नीति' : language === 'te' ? 'గోప్యతా విధానం' : language === 'kn' ? 'ಗೌಪ್ಯತೆ ನೀತಿ' : language === 'ta' ? 'தனியுரிமைக் கொள்கை' : language === 'mr' ? 'गोपनीयता धोरण' : 'Privacy Policy'}</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'सेवा की शर्तें' : language === 'te' ? 'సేవా నిబంధనలు' : language === 'kn' ? 'ಸೇವಾ ನಿಯಮಗಳು' : language === 'ta' ? 'சேவை விதிமுறைகள்' : language === 'mr' ? 'सेवा अटी' : 'Terms of Service'}</Link></li>
                <li><Link href="/refund" className="text-muted-foreground hover:text-foreground">{language === 'hi' ? 'धनवापसी नीति' : language === 'te' ? 'రీఫండ్ విధానం' : language === 'kn' ? 'ಮರುಪಾವತಿ ನೀತಿ' : language === 'ta' ? 'பணத்தை திருப்பி அளிக்கும் கொள்கை' : language === 'mr' ? 'परतावा धोरण' : 'Refund Policy'}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 {language === 'hi' ? 'श्री अन्न। भारतीय किसानों के लिए ❤️ से बनाया गया।' : language === 'te' ? 'శ్రీ అన్న. భారతీయ రైతుల కోసం ❤️ తో తయారు చేయబడింది.' : language === 'kn' ? 'ಶ್ರೀ ಅನ್ನ. ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ❤️ ಯಿಂದ ತಯಾರಿಸಲಾಗಿದೆ.' : language === 'ta' ? 'ஸ்ரீ அன்னா. இந்திய விவசாயிகளுக்காக ❤️ உடன் உருவாக்கப்பட்டது.' : language === 'mr' ? 'श्री अन्न. भारतीय शेतकऱ्यांसाठी ❤️ ने बनवले.' : 'Shree Anna. Made with ❤️ for Indian Farmers.'}
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                <Leaf className="w-3 h-3 mr-1" />
                {language === 'hi' ? 'कार्बन न्यूट्रल' : language === 'te' ? 'కార్బన్ న్యూట్రల్' : language === 'kn' ? 'ಕಾರ್ಬನ್ ನ್ಯೂಟ್ರಲ್' : language === 'ta' ? 'கார்பன் நியூட்ரல்' : language === 'mr' ? 'कार्बन न्यूट्रल' : 'Carbon Neutral'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                🇮🇳 {language === 'hi' ? 'भारत में बना' : language === 'te' ? 'భారతదేశంలో తయారైంది' : language === 'kn' ? 'ಭಾರತದಲ್ಲಿ ತಯಾರಿಸಲಾಗಿದೆ' : language === 'ta' ? 'இந்தியாவில் தயாரிக்கப்பட்டது' : language === 'mr' ? 'भारतात बनवले' : 'Made in India'}
              </Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}