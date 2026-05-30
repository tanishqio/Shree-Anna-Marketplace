"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Package,
  IndianRupee,
  TrendingUp,
  Bell,
  ChevronRight,
  Loader2,
  Volume2,
  VolumeX,
  Wheat,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { WeatherWidget } from '@/components/WeatherWidget';
import { GovernmentSchemesHub } from '@/components/GovernmentSchemesHub';
import { OfflineSyncIndicator } from '@/components/OfflineSyncIndicator';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { milletTypes } from '@/lib/design-tokens';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMyListings } from '@/lib/hooks/useData';
import { useLanguage, Language } from '@/lib/hooks/useLanguage';
import { requirementsApi, Requirement } from '@/lib/api';

// Translations for all dashboard text
const translations = {
  welcome: {
    en: 'Welcome',
    hi: 'स्वागत है',
    kn: 'ಸ್ವಾಗತ',
    te: 'స్వాగతం',
    ta: 'வரவேற்கிறோம்',
    mr: 'स्वागत आहे',
  },
  dashboardSubtitle: {
    en: "Here's your farming dashboard",
    hi: 'यह आपका किसान डैशबोर्ड है',
    kn: 'ಇದು ನಿಮ್ಮ ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    te: 'ఇది మీ రైతు డాష్‌బోర్డ్',
    ta: 'இது உங்கள் விவசாயி டாஷ்போர்டு',
    mr: 'हे तुमचे शेतकरी डॅशबोर्ड आहे',
  },
  newListing: {
    en: 'New Listing',
    hi: 'नई लिस्टिंग',
    kn: 'ಹೊಸ ಪಟ್ಟಿ',
    te: 'కొత్త లిస్టింగ్',
    ta: 'புதிய பட்டியல்',
    mr: 'नवीन यादी',
  },
  loading: {
    en: 'Loading dashboard...',
    hi: 'डैशबोर्ड लोड हो रहा है...',
    kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    te: 'డాష్‌బోర్డ్ లోడ్ అవుతోంది...',
    ta: 'டாஷ்போர்டு ஏற்றப்படுகிறது...',
    mr: 'डॅशबोर्ड लोड होत आहे...',
  },
  unableToLoad: {
    en: 'Unable to load data from server. Showing cached data.',
    hi: 'सर्वर से डेटा लोड करने में असमर्थ। कैश्ड डेटा दिखा रहे हैं।',
    kn: 'ಸರ್ವರ್‌ನಿಂದ ಡೇಟಾ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
    te: 'సర్వర్ నుండి డేటా లోడ్ చేయడం సాధ్యం కాలేదు.',
    ta: 'சர்வரிலிருந்து தரவை ஏற்ற முடியவில்லை.',
    mr: 'सर्व्हरवरून डेटा लोड करता आला नाही.',
  },
  stats: {
    totalEarnings: {
      en: 'Total Earnings',
      hi: 'कुल कमाई',
      kn: 'ಒಟ್ಟು ಗಳಿಕೆ',
      te: 'మొత్తం సంపాదన',
      ta: 'மொத்த வருவாய்',
      mr: 'एकूण कमाई',
    },
    activeListings: {
      en: 'Active Listings',
      hi: 'सक्रिय लिस्टिंग',
      kn: 'ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು',
      te: 'యాక్టివ్ జాబితాలు',
      ta: 'செயலில் உள்ள பட்டியல்கள்',
      mr: 'सक्रिय याद्या',
    },
    pendingOffers: {
      en: 'Pending Offers',
      hi: 'लंबित ऑफर',
      kn: 'ಬಾಕಿ ಆಫರ್‌ಗಳು',
      te: 'పెండింగ్ ఆఫర్‌లు',
      ta: 'நிலுவையில் உள்ள சலுகைகள்',
      mr: 'प्रलंबित ऑफर',
    },
    totalSales: {
      en: 'Total Sales',
      hi: 'कुल बिक्री',
      kn: 'ಒಟ್ಟು ಮಾರಾಟ',
      te: 'మొత్తం అమ్మకాలు',
      ta: 'மொத்த விற்பனை',
      mr: 'एकूण विक्री',
    },
  },
  quickActions: {
    title: {
      en: 'Quick Actions',
      hi: 'त्वरित कार्य',
      kn: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
      te: 'త్వరిత చర్యలు',
      ta: 'விரைவான செயல்கள்',
      mr: 'द्रुत क्रिया',
    },
    createListing: {
      en: 'Create Listing',
      hi: 'लिस्टिंग बनाएं',
      kn: 'ಪಟ್ಟಿ ರಚಿಸಿ',
      te: 'జాబితా సృష్టించు',
      ta: 'பட்டியல் உருவாக்கு',
      mr: 'यादी तयार करा',
    },
    cropHistory: {
      en: 'Crop History',
      hi: 'फसल इतिहास',
      kn: 'ಬೆಳೆ ಇತಿಹಾಸ',
      te: 'పంట చరిత్ర',
      ta: 'பயிர் வரலாறு',
      mr: 'पीक इतिहास',
    },
    viewOffers: {
      en: 'View Offers',
      hi: 'ऑफर देखें',
      kn: 'ಆಫರ್‌ಗಳನ್ನು ನೋಡಿ',
      te: 'ఆఫర్‌లు చూడండి',
      ta: 'சலுகைகளைக் காண்க',
      mr: 'ऑफर पहा',
    },
    myListings: {
      en: 'My Listings',
      hi: 'मेरी लिस्टिंग',
      kn: 'ನನ್ನ ಪಟ್ಟಿಗಳು',
      te: 'నా జాబితాలు',
      ta: 'எனது பட்டியல்கள்',
      mr: 'माझ्या याद्या',
    },
    earnings: {
      en: 'Earnings',
      hi: 'कमाई',
      kn: 'ಗಳಿಕೆ',
      te: 'సంపాదన',
      ta: 'வருவாய்',
      mr: 'कमाई',
    },
  },
  processorRequirements: {
    title: {
      en: 'Processor Requirements',
      hi: 'प्रोसेसर आवश्यकताएं',
      kn: 'ಪ್ರೊಸೆಸರ್ ಅವಶ್ಯಕತೆಗಳು',
      te: 'ప్రాసెసర్ అవసరాలు',
      ta: 'செயலி தேவைகள்',
      mr: 'प्रोसेसर आवश्यकता',
    },
    liveDemand: {
      en: 'Live Demand',
      hi: 'लाइव मांग',
      kn: 'ಲೈವ್ ಬೇಡಿಕೆ',
      te: 'లైవ్ డిమాండ్',
      ta: 'நேரடி தேவை',
      mr: 'लाइव्ह मागणी',
    },
    wanted: {
      en: 'Wanted',
      hi: 'चाहिए',
      kn: 'ಬೇಕು',
      te: 'కావాలి',
      ta: 'வேண்டும்',
      mr: 'हवे',
    },
    grade: {
      en: 'Grade',
      hi: 'ग्रेड',
      kn: 'ಗ್ರೇಡ್',
      te: 'గ్రేడ్',
      ta: 'தரம்',
      mr: 'ग्रेड',
    },
    target: {
      en: 'Target',
      hi: 'लक्ष्य',
      kn: 'ಗುರಿ',
      te: 'లక్ష్యం',
      ta: 'இலக்கு',
      mr: 'लक्ष्य',
    },
    organicOnly: {
      en: 'Organic Only',
      hi: 'केवल जैविक',
      kn: 'ಕೇವಲ ಸಾವಯವ',
      te: 'ఆర్గానిక్ మాత్రమే',
      ta: 'இயற்கை மட்டும்',
      mr: 'फक्त सेंद्रिय',
    },
    viewApply: {
      en: 'View & Apply',
      hi: 'देखें और आवेदन करें',
      kn: 'ವೀಕ್ಷಿಸಿ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
      te: 'చూడండి & దరఖాస్తు చేయండి',
      ta: 'பார்க்கவும் & விண்ணப்பிக்கவும்',
      mr: 'पहा आणि अर्ज करा',
    },
    postedBy: {
      en: 'Posted by',
      hi: 'द्वारा पोस्ट किया गया',
      kn: 'ಪೋಸ್ಟ್ ಮಾಡಿದವರು',
      te: 'పోస్ట్ చేసినవారు',
      ta: 'பதிவிட்டவர்',
      mr: 'द्वारे पोस्ट केले',
    },
    noRequirements: {
      en: 'No current requirements from processors.',
      hi: 'प्रोसेसर से कोई वर्तमान आवश्यकता नहीं।',
      kn: 'ಪ್ರೊಸೆಸರ್‌ಗಳಿಂದ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಅವಶ್ಯಕತೆಗಳಿಲ್ಲ.',
      te: 'ప్రాసెసర్‌ల నుండి ప్రస్తుత అవసరాలు లేవు.',
      ta: 'செயலிகளிடமிருந்து தற்போதைய தேவைகள் இல்லை.',
      mr: 'प्रोसेसरकडून सध्या कोणत्याही आवश्यकता नाहीत.',
    },
  },
  offers: {
    title: {
      en: 'Pending Offers',
      hi: 'लंबित ऑफर',
      kn: 'ಬಾಕಿ ಆಫರ್‌ಗಳು',
      te: 'పెండింగ్ ఆఫర్‌లు',
      ta: 'நிலுவையில் உள்ள சலுகைகள்',
      mr: 'प्रलंबित ऑफर',
    },
    viewAll: {
      en: 'View All',
      hi: 'सभी देखें',
      kn: 'ಎಲ್ಲಾ ನೋಡಿ',
      te: 'అన్నీ చూడండి',
      ta: 'அனைத்தையும் காண்க',
      mr: 'सर्व पहा',
    },
    noPending: {
      en: 'No pending offers',
      hi: 'कोई लंबित ऑफर नहीं',
      kn: 'ಯಾವುದೇ ಬಾಕಿ ಆಫರ್‌ಗಳಿಲ್ಲ',
      te: 'పెండింగ్ ఆఫర్‌లు లేవు',
      ta: 'நிலுவையில் சலுகைகள் இல்லை',
      mr: 'कोणतेही प्रलंबित ऑफर नाहीत',
    },
    toReview: {
      en: 'pending offer(s) to review',
      hi: 'समीक्षा के लिए लंबित ऑफर',
      kn: 'ಪರಿಶೀಲಿಸಲು ಬಾಕಿ ಆಫರ್‌ಗಳು',
      te: 'సమీక్షించడానికి పెండింగ్ ఆఫర్‌లు',
      ta: 'மதிப்பாய்வு செய்ய நிலுவையில் சலுகைகள்',
      mr: 'तपासणीसाठी प्रलंबित ऑफर',
    },
  },
  listings: {
    title: {
      en: 'My Listings',
      hi: 'मेरी लिस्टिंग',
      kn: 'ನನ್ನ ಪಟ್ಟಿಗಳು',
      te: 'నా జాబితాలు',
      ta: 'எனது பட்டியல்கள்',
      mr: 'माझ्या याद्या',
    },
    noListings: {
      en: 'No listings yet',
      hi: 'अभी तक कोई लिस्टिंग नहीं',
      kn: 'ಇನ್ನೂ ಯಾವುದೇ ಪಟ್ಟಿಗಳಿಲ್ಲ',
      te: 'ఇంకా జాబితాలు లేవు',
      ta: 'இன்னும் பட்டியல்கள் இல்லை',
      mr: 'अद्याप कोणत्याही याद्या नाहीत',
    },
    createFirst: {
      en: 'Create your first listing',
      hi: 'अपनी पहली लिस्टिंग बनाएं',
      kn: 'ನಿಮ್ಮ ಮೊದಲ ಪಟ್ಟಿ ರಚಿಸಿ',
      te: 'మీ మొదటి జాబితా సృష్టించండి',
      ta: 'உங்கள் முதல் பட்டியலை உருவாக்குங்கள்',
      mr: 'तुमची पहिली यादी तयार करा',
    },
    totalValue: {
      en: 'Total value',
      hi: 'कुल मूल्य',
      kn: 'ಒಟ್ಟು ಮೌಲ್ಯ',
      te: 'మొత్తం విలువ',
      ta: 'மொத்த மதிப்பு',
      mr: 'एकूण मूल्य',
    },
  },
  status: {
    active: {
      en: 'Active',
      hi: 'सक्रिय',
      kn: 'ಸಕ್ರಿಯ',
      te: 'యాక్టివ్',
      ta: 'செயலில்',
      mr: 'सक्रिय',
    },
    pending: {
      en: 'Pending',
      hi: 'लंबित',
      kn: 'ಬಾಕಿ',
      te: 'పెండింగ్',
      ta: 'நிலுவையில்',
      mr: 'प्रलंबित',
    },
    sold: {
      en: 'Sold',
      hi: 'बेचा गया',
      kn: 'ಮಾರಾಟವಾಗಿದೆ',
      te: 'అమ్మబడింది',
      ta: 'விற்கப்பட்டது',
      mr: 'विकले',
    },
    draft: {
      en: 'Draft',
      hi: 'ड्राफ्ट',
      kn: 'ಡ್ರಾಫ್ಟ್',
      te: 'డ్రాఫ్ట్',
      ta: 'வரைவு',
      mr: 'मसुदा',
    },
    expired: {
      en: 'Expired',
      hi: 'समाप्त',
      kn: 'ಅವಧಿ ಮುಗಿದಿದೆ',
      te: 'గడువు ముగిసింది',
      ta: 'காலாவதியானது',
      mr: 'कालबाह्य',
    },
  },
  tips: {
    title: {
      en: "Today's Tip",
      hi: 'आज की टिप',
      kn: 'ಇಂದಿನ ಸಲಹೆ',
      te: 'నేటి చిట్కా',
      ta: 'இன்றைய குறிப்பு',
      mr: 'आजची टिप',
    },
    message: {
      en: 'Finger millet prices are up 15% this week. Consider listing your ragi stock now for better returns!',
      hi: 'रागी की कीमतें इस सप्ताह 15% बढ़ी हैं। बेहतर रिटर्न के लिए अभी अपना रागी स्टॉक लिस्ट करें!',
      kn: 'ರಾಗಿ ಬೆಲೆಗಳು ಈ ವಾರ 15% ಹೆಚ್ಚಾಗಿವೆ. ಉತ್ತಮ ಲಾಭಕ್ಕಾಗಿ ಈಗಲೇ ನಿಮ್ಮ ರಾಗಿ ಸ್ಟಾಕ್ ಪಟ್ಟಿ ಮಾಡಿ!',
      te: 'రాగి ధరలు ఈ వారం 15% పెరిగాయి. మెరుగైన రాబడి కోసం ఇప్పుడే మీ రాగి స్టాక్‌ను జాబితా చేయండి!',
      ta: 'கேழ்வரகு விலை இந்த வாரம் 15% உயர்ந்துள்ளது. சிறந்த வருவாய்க்கு இப்போதே உங்கள் ராகி பங்குகளை பட்டியலிடுங்கள்!',
      mr: 'नाचणीच्या किमती या आठवड्यात 15% वाढल्या आहेत. अधिक नफ्यासाठी आत्ताच तुमचा नाचणी साठा यादीत टाका!',
    },
    learnMore: {
      en: 'Learn More',
      hi: 'और जानें',
      kn: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
      te: 'మరింత తెలుసుకోండి',
      ta: 'மேலும் அறிக',
      mr: 'अधिक जाणून घ्या',
    },
  },
};

// Helper function to get translated text
const t = (key: string, lang: Language): string => {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations;
  for (const k of keys) {
    value = value?.[k];
  }
  return value?.[lang] || value?.['en'] || key;
};

const statusColors: Record<string, string> = {
  active: 'bg-accent/10 text-accent',
  pending: 'bg-primary/10 text-primary',
  sold: 'bg-muted text-muted-foreground',
  draft: 'bg-yellow-500/10 text-yellow-600',
  expired: 'bg-red-500/10 text-red-600',
};

export default function FarmerDashboard() {
  const [role, setRole] = useState('farmer');
  const { user, isLoading: authLoading } = useAuth();
  const { data: listings, isLoading: listingsLoading, error: listingsError } = useMyListings();
  const [processorRequirements, setProcessorRequirements] = useState<Requirement[]>([]);
  const [reqLoading, setReqLoading] = useState(true);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  // Fetch Processor Requirements from the requirements table
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        setReqLoading(true);
        // Use requirementsApi.getAll() to fetch from the requirements table
        const { requirements } = await requirementsApi.getAll({ limit: 5 });
        setProcessorRequirements(requirements || []);
      } catch (e) {
        console.error("Failed to fetch processor requirements", e);
      } finally {
        setReqLoading(false);
      }
    };

    if (!authLoading) {
      fetchRequirements();
    }
  }, [authLoading]);

  // Transform API listings to display format
  const displayListings = listings?.map(listing => ({
    id: listing.id,
    milletType: listing.crop,
    quantity: listing.qty_kg,
    pricePerKg: listing.min_price_per_qtl / 100, // Convert quintal to kg
    status: listing.status as 'active' | 'pending' | 'sold',
    views: 0, // API doesn't track views yet
    offers: 0,
    createdAt: new Date(listing.created_at),
  })) || [];

  // Calculate stats from real data
  const totalEarnings = displayListings
    .filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + (l.quantity * l.pricePerKg), 0);
  const activeListings = displayListings.filter(l => l.status === 'active').length;
  // Placeholder pending offers count until API is ready
  const pendingOffers = 0;

  const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id, nameHi: id };

  const userName = user?.name || 'Farmer';

  // Page voice descriptions in all languages
  const pageVoice: Record<string, string> = {
    en: `Welcome to your farmer dashboard ${userName}. You have ${activeListings} active listings and ${pendingOffers} pending offers. Total earnings are ${totalEarnings}. Check processor requirements below.`,
    hi: `${userName}, आपके किसान डैशबोर्ड में स्वागत है। आपके पास ${activeListings} सक्रिय लिस्टिंग और ${pendingOffers} लंबित ऑफर हैं। कुल कमाई ${totalEarnings} है। नीचे प्रोसेसर की आवश्यकताएं देखें।`,
    kn: `${userName}, ನಿಮ್ಮ ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಬಳಿ ${activeListings} ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು ಮತ್ತು ${pendingOffers} ಬಾಕಿ ಇರುವ ಆಫರ್‌ಗಳಿವೆ.`,
    te: `${userName}, మీ రైతు డాష్‌బోర్డ్‌కు స్వాగతం. మీకు ${activeListings} యాక్టివ్ లిస్టింగ్‌లు మరియు ${pendingOffers} పెండింగ్ ఆఫర్‌లు ఉన్నాయి.`,
    ta: `${userName}, உங்கள் விவசாயி டாஷ்போர்டுக்கு வரவேற்கிறோம். உங்களிடம் ${activeListings} செயலில் உள்ள பட்டியல்கள் மற்றும் ${pendingOffers} நிலுவையில் உள்ள சலுகைகள் உள்ளன.`,
    mr: `${userName}, तुमच्या शेतकरी डॅशबोर्डवर स्वागत आहे. तुमच्याकडे ${activeListings} सक्रिय यादी आणि ${pendingOffers} प्रलंबित ऑफर आहेत.`,
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(pageVoice[language] || pageVoice.en);
    }
  };

  // Show loading state
  if (authLoading || listingsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">{t('loading', language)}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold">
                {t('welcome', language)}, {userName}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('dashboardSubtitle', language)}
              </p>
            </div>
            <button
              onClick={handleSpeak}
              className={`p-3 rounded-full transition-all ${isSpeaking
                ? 'bg-primary text-primary-foreground animate-pulse'
                : 'bg-muted hover:bg-muted/80'
                }`}
              title={isSpeaking ? 'Stop' : 'Listen'}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <OfflineSyncIndicator />
            <Button asChild size="lg" className="touch-target">
              <Link href="/farmer/listing/create">
                <Plus className="w-5 h-5 mr-2" />
                {t('newListing', language)}
              </Link>
            </Button>
          </div>
        </div>

        {listingsError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="text-sm">{t('unableToLoad', language)}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: t('stats.totalEarnings', language),
              value: `₹${totalEarnings.toLocaleString()}`,
              icon: IndianRupee,
              color: 'bg-accent/10 text-accent',
              trend: '+12%',
            },
            {
              label: t('stats.activeListings', language),
              value: activeListings,
              icon: Package,
              color: 'bg-primary/10 text-primary',
            },
            {
              label: t('stats.pendingOffers', language),
              value: pendingOffers,
              icon: Bell,
              color: 'bg-terra-500/10 text-terra-600',
            },
            {
              label: t('stats.totalSales', language),
              value: '1,500 kg',
              icon: TrendingUp,
              color: 'bg-sky-500/10 text-sky-600',
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card rounded-2xl border border-border p-4 sm:p-6"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.trend && (
                  <span className="text-xs text-accent font-medium">{stat.trend}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">{t('quickActions.title', language)}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: t('quickActions.createListing', language), icon: Plus, href: '/farmer/listing/create', color: 'bg-primary' },
                  { label: t('quickActions.cropHistory', language), icon: Wheat, href: '/farmer/crop-history', color: 'bg-amber-500' },
                  { label: t('quickActions.viewOffers', language), icon: Bell, href: '/farmer/offers', color: 'bg-terra-500' },
                  { label: t('quickActions.myListings', language), icon: Package, href: '/farmer/listings', color: 'bg-accent' },
                  { label: t('quickActions.earnings', language), icon: IndianRupee, href: '/farmer/earnings', color: 'bg-sky-500' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-muted/50 hover:bg-muted transition-colors touch-target min-h-[120px]"
                  >
                    <div className={`w-14 h-14 rounded-full ${action.color} text-white flex items-center justify-center`}>
                      <action.icon className="w-7 h-7" />
                    </div>
                    <span className="text-base font-medium text-center">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Processor Requirements Section */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {t('processorRequirements.title', language)}
                </h2>
                <Badge variant="outline" className="text-xs">{t('processorRequirements.liveDemand', language)}</Badge>
              </div>

              {reqLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : processorRequirements.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">{t('processorRequirements.noRequirements', language)}</p>
              ) : (
                <div className="space-y-3">
                  {processorRequirements.map(req => {
                    const millet = getMillet(req.crop);
                    return (
                      <div key={req.id} className="p-4 rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-primary">{millet.name} {t('processorRequirements.wanted', language)}</h3>
                            <p className="text-sm text-muted-foreground">{req.qty_kg} kg • {req.quality_grade || 'Standard'} {t('processorRequirements.grade', language)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {t('processorRequirements.target', language)}: ₹{req.target_price_per_qtl}/Qtl
                              </Badge>
                              {req.is_organic && (
                                <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                                  {t('processorRequirements.organicOnly', language)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/farmer/requirements/${req.id}`}>
                              {t('processorRequirements.viewApply', language)}
                            </Link>
                          </Button>
                        </div>
                        {req.processor && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {t('processorRequirements.postedBy', language)} {req.processor.name} {req.processor.district ? `• ${req.processor.district}` : ''}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Offers */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">{t('offers.title', language)}</h2>
                <Button variant="ghost" size="lg" asChild className="touch-target">
                  <Link href="/farmer/offers">
                    {t('offers.viewAll', language)} <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {pendingOffers === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{t('offers.noPending', language)}</p>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {pendingOffers} {t('offers.toReview', language)}
                  </p>
                )}
              </div>
            </div>

            {/* My Listings */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">{t('listings.title', language)}</h2>
                <Button variant="ghost" size="lg" asChild className="touch-target">
                  <Link href="/farmer/listings">
                    {t('offers.viewAll', language)} <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {displayListings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4 text-lg">{t('listings.noListings', language)}</p>
                    <Button size="xl" asChild className="touch-target">
                      <Link href="/farmer/listing/create">{t('listings.createFirst', language)}</Link>
                    </Button>
                  </div>
                ) : displayListings.slice(0, 5).map((listing, idx) => {
                  const millet = getMillet(listing.milletType);
                  return (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-2xl">🌾</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{millet?.name}</p>
                          <Badge className={statusColors[listing.status]}>
                            {t(`status.${listing.status}`, language)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {listing.quantity} kg @ ₹{listing.pricePerKg}/kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{(listing.quantity * listing.pricePerKg).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('listings.totalValue', language)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <WeatherWidget />

            {/* Government Schemes */}
            <GovernmentSchemesHub compact />

            {/* Tips */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 sm:p-6 border border-primary/20">
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> {t('tips.title', language)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('tips.message', language)}
              </p>
              <Button variant="outline" size="lg" className="mt-3 w-full touch-target">
                {t('tips.learnMore', language)}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}