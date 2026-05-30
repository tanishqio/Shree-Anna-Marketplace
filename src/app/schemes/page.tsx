"use client";

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GovernmentSchemesHub } from '@/components/GovernmentSchemesHub';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function SchemesPage() {
  const [role, setRole] = useState('farmer');
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: 'Welcome to Government Schemes Hub. Here you can find information about various government schemes for millet farmers including PM-KISAN, Millet Mission, crop insurance, and more. Check eligibility and apply for benefits.',
      hi: 'सरकारी योजना केंद्र में आपका स्वागत है। यहाँ आप बाजरा किसानों के लिए पीएम-किसान, मिलेट मिशन, फसल बीमा जैसी विभिन्न सरकारी योजनाओं की जानकारी पा सकते हैं। पात्रता जांचें और लाभ के लिए आवेदन करें।',
      kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಕೇಂದ್ರಕ್ಕೆ ಸ್ವಾಗತ. ಇಲ್ಲಿ ನೀವು ಸಿರಿಧಾನ್ಯ ರೈತರಿಗೆ ಪಿಎಂ-ಕಿಸಾನ್, ಮಿಲೆಟ್ ಮಿಷನ್, ಬೆಳೆ ವಿಮೆ ಮುಂತಾದ ವಿವಿಧ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಪಡೆಯಬಹುದು. ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲಾಭಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      te: 'ప్రభుత్వ పథకాల హబ్‌కు స్వాగతం. ఇక్కడ మీరు చిరుధాన్య రైతులకు పిఎం-కిసాన్, మిల్లెట్ మిషన్, పంట బీమా వంటి వివిధ ప్రభుత్వ పథకాల సమాచారాన్ని పొందవచ్చు. అర్హతను తనిఖీ చేసి ప్రయోజనాల కోసం దరఖాస్తు చేసుకోండి.',
      ta: 'அரசு திட்டங்கள் மையத்திற்கு வரவேற்கிறோம். இங்கே நீங்கள் சிறுதானிய விவசாயிகளுக்கான பிஎம்-கிசான், மில்லெட் மிஷன், பயிர் காப்பீடு போன்ற பல்வேறு அரசு திட்டங்களின் தகவல்களைப் பெறலாம். தகுதியை சரிபார்த்து நன்மைகளுக்கு விண்ணப்பிக்கவும்.',
      mr: 'सरकारी योजना केंद्रात आपले स्वागत आहे. येथे तुम्ही ज्वारी-बाजरी शेतकऱ्यांसाठी पीएम-किसान, मिलेट मिशन, पीक विमा यांसारख्या विविध सरकारी योजनांची माहिती मिळवू शकता. पात्रता तपासा आणि लाभांसाठी अर्ज करा.',
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">
            {language === 'hi' ? 'सरकारी योजनाएं 🏛️' : language === 'te' ? 'ప్రభుత్వ పథకాలు 🏛️' : language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು 🏛️' : language === 'ta' ? 'அரசு திட்டங்கள் 🏛️' : language === 'mr' ? 'सरकारी योजना 🏛️' : 'Government Schemes 🏛️'}
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
        <GovernmentSchemesHub />
      </main>
    </div>
  );
}
