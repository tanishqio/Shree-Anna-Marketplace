"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Phone, 
  MessageCircle, 
  HelpCircle, 
  Clock, 
  CheckCircle,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [mode, setMode] = useState<'menu' | 'callback' | 'chat' | 'success'>('menu');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();

  const handleCallbackRequest = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setMode('success');
  };

  const resetModal = () => {
    setMode('menu');
    setPhoneNumber('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  // Multilingual Text Map
  const t = {
    helpCenter: { 
      en: 'Help Center', hi: 'सहायता केंद्र', te: 'సహాయ కేంద్రం', kn: 'ಸಹಾಯ ಕೇಂದ್ರ', ta: 'உதவி மையம்', mr: 'मदत केंद्र' 
    },
    hereToHelp: { 
      en: "We're here to help", hi: 'हम आपकी मदद के लिए यहाँ हैं', te: 'మీకు సహాయం చేయడానికి మేము ఇక్కడ ఉన్నాము', kn: 'ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾವಿದ್ದೇವೆ', ta: 'உங்களுக்கு உதவ நாங்கள் இருக்கிறோம்', mr: 'आम्ही मदतीसाठी येथे आहोत' 
    },
    reqCallback: { 
      en: 'Request Callback', hi: 'कॉलबैक का अनुरोध करें', te: 'కాల్‌బ్యాక్ అభ్యర్థించండి', kn: 'ಕಾಲ್‌ಬ್ಯಾಕ್ ವಿನಂತಿಸಿ', ta: 'கால்பேக் கோரவும்', mr: 'कॉलबॅक विनंती करा' 
    },
    liveChat: { 
      en: 'Live Chat', hi: 'लाइव चैट', te: 'లైవ్ చాట్', kn: 'ಲೈವ್ ಚಾಟ್', ta: 'நேரலை அரட்டை', mr: 'थेट चॅट' 
    },
    helpline: { 
      en: '24/7 Helpline', hi: '24/7 हेल्पलाइन', te: '24/7 హెల్ప్‌లైన్', kn: '24/7 ಸಹಾಯವಾಣಿ', ta: '24/7 உதவி எண்', mr: '24/7 हेल्पलाइन' 
    },
    tollFree: { 
      en: 'Toll-free • All languages', hi: 'टोल-फ्री • सभी भाषाएं', te: 'టోల్-ఫ్రీ • అన్ని భాషలు', kn: 'ಟೋಲ್-ಫ್ರೀ • ಎಲ್ಲಾ ಭಾಷೆಗಳು', ta: 'கட்டணமில்லா • அனைத்து மொழிகள்', mr: 'टोल-फ्री • सर्व भाषा' 
    },
    faq: { 
      en: 'Frequently Asked Questions', hi: 'अक्सर पूछे जाने वाले प्रश्न', te: 'తరచుగా అడిగే ప్రశ్నలు', kn: 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು', ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள்', mr: 'वारंवार विचारले जाणारे प्रश्न' 
    },
    backToMenu: { 
      en: '← Back to menu', hi: '← मेनू पर वापस जाएं', te: '← మెనూకి తిరిగి వెళ్ళు', kn: '← ಮೆನುಗೆ ಹಿಂತಿರುಗಿ', ta: '← மெனுவுக்குத் திரும்பு', mr: '← मेनूवर परत जा' 
    },
    callBackWithin: { 
      en: "We'll call you back within 30 minutes", hi: 'हम आपको 30 मिनट के भीतर वापस कॉल करेंगे', te: 'మేము మీకు 30 నిమిషాల్లో తిరిగి కాల్ చేస్తాము', kn: 'ನಾವು ನಿಮಗೆ 30 ನಿಮಿಷಗಳಲ್ಲಿ ಮರಳಿ ಕರೆ ಮಾಡುತ್ತೇವೆ', ta: 'நாங்கள் உங்களை 30 நிமிடங்களுக்குள் திரும்ப அழைப்போம்', mr: 'आम्ही तुम्हाला 30 मिनिटांत परत कॉल करू' 
    },
    phoneNum: { 
      en: 'Phone Number', hi: 'फ़ोन नंबर', te: 'ఫోన్ నంబర్', kn: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ', ta: 'தொலைபேசி எண்', mr: 'फोन नंबर' 
    },
    enterMobile: { 
      en: 'Enter your mobile number', hi: 'अपना मोबाइल नंबर दर्ज करें', te: 'మీ మొబైల్ నంబర్‌ను నమోదు చేయండి', kn: 'ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ', ta: 'உங்கள் மொபைல் எண்ணை உள்ளிடவும்', mr: 'तुमचा मोबाईल नंबर टाका' 
    },
    waitTime: { 
      en: 'Average wait time: 15 minutes', hi: 'औसत प्रतीक्षा समय: 15 मिनट', te: 'సగటు నిరీక్షణ సమయం: 15 నిమిషాలు', kn: 'ಸರಾಸರಿ ಕಾಯುವ ಸಮಯ: 15 ನಿಮಿಷಗಳು', ta: 'சராசரி காத்திருப்பு நேரம்: 15 நிமிடங்கள்', mr: 'सरासरी प्रतीक्षा वेळ: 15 मिनिटे' 
    },
    submitting: { 
      en: 'Submitting...', hi: 'जमा कर रहा है...', te: 'సమర్పిస్తోంది...', kn: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...', ta: 'சமர்ப்பிக்கப்படுகிறது...', mr: 'सबमिट करत आहे...' 
    },
    requestSubmitted: { 
      en: 'Request Submitted!', hi: 'अनुरोध जमा हो गया!', te: 'అభ్యర్థన సమర్పించబడింది!', kn: 'ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!', ta: 'கோரிக்கை சமர்ப்பிக்கப்பட்டது!', mr: 'विनंती सबमिट केली!' 
    },
    willCallYou: { 
      en: "We'll call you at", hi: 'हम आपको इस नंबर पर कॉल करेंगे', te: 'మేము మీకు కాల్ చేస్తాము', kn: 'ನಾವು ನಿಮಗೆ ಕರೆ ಮಾಡುತ್ತೇವೆ', ta: 'நாங்கள் உங்களை அழைப்போம்', mr: 'आम्ही तुम्हाला यावर कॉल करू' 
    },
    within30: { 
      en: 'within 30 minutes', hi: '30 मिनट के भीतर', te: '30 నిమిషాల్లో', kn: '30 ನಿಮಿಷಗಳಲ್ಲಿ', ta: '30 நிமிடங்களுக்குள்', mr: '30 मिनिटांत' 
    },
    close: { 
      en: 'Close', hi: 'बंद करें', te: 'మూసివేయండి', kn: 'ಮುಚ್ಚಿ', ta: 'மூடு', mr: 'बंद करा' 
    },
    chatSupport: { 
      en: 'Chat with our support team in your language', hi: 'अपनी भाषा में हमारी सहायता टीम से चैट करें', te: 'మీ భాషలో మా మద్దతు బృందంతో చాట్ చేయండి', kn: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ನಮ್ಮ ಬೆಂಬಲ ತಂಡದೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ', ta: 'உங்கள் மொழியில் எங்கள் ஆதரவு குழுவுடன் அரட்டையடிக்கவும்', mr: 'तुमच्या भाषेत आमच्या सपोर्ट टीमशी चॅट करा' 
    },
    startChat: { 
      en: 'Start Chat', hi: 'चैट शुरू करें', te: 'చాట్ ప్రారంభించండి', kn: 'ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ', ta: 'அரட்டையைத் தொடங்கு', mr: 'चॅट सुरू करा' 
    }
  };

  const getText = (key: keyof typeof t) => {
    return t[key][language as keyof typeof t['helpCenter']] || t[key]['en'];
  };

  const faqItems = [
    { 
      q: { en: 'How do I create a listing?', hi: 'मैं लिस्टिंग कैसे बनाऊं?', te: 'నేను లిస్టింగ్ ఎలా క్రియేట్ చేయాలి?', kn: 'ನಾನು ಪಟ್ಟಿಯನ್ನು ಹೇಗೆ ರಚಿಸುವುದು?', ta: 'நான் பட்டியலை எப்படி உருவாக்குவது?', mr: 'मी लिस्टिंग कशी तयार करू?' }, 
      a: { en: 'Go to Dashboard → Create Listing and follow the steps.', hi: 'डैशबोर्ड → लिस्टिंग बनाएं पर जाएं और चरणों का पालन करें।', te: 'డాష్‌బోర్డ్ → లిస్టింగ్ క్రియేట్ చేయండి కి వెళ్ళండి మరియు దశలను అనుసరించండి.', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ → ಪಟ್ಟಿ ರಚಿಸಿ ಗೆ ಹೋಗಿ ಮತ್ತು ಹಂತಗಳನ್ನು ಅನುಸರಿಸಿ.', ta: 'டாஷ்போர்டு → பட்டியல் உருவாக்கு க்குச் சென்று படிகளைப் பின்பற்றவும்.', mr: 'डॅशबोर्ड → लिस्टिंग तयार करा वर जा आणि स्टेप्स फॉलो करा.' } 
    },
    { 
      q: { en: 'How does payment work?', hi: 'भुगतान कैसे काम करता है?', te: 'చెల్లింపు ఎలా పనిచేస్తుంది?', kn: 'ಪಾವತಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?', ta: 'கட்டணம் எப்படி செயல்படுகிறது?', mr: 'पेमेंट कसे काम करते?' }, 
      a: { en: 'Payment is made directly to your bank account after delivery confirmation.', hi: 'डिलीवरी पुष्टि के बाद भुगतान सीधे आपके बैंक खाते में किया जाता है।', te: 'డెలివరీ నిర్ధారణ తర్వాత చెల్లింపు నేరుగా మీ బ్యాంక్ ఖాతాకు చేయబడుతుంది.', kn: 'ವಿತರಣೆ ದೃಢೀಕರಣದ ನಂತರ ಪಾವತಿಯನ್ನು ನೇರವಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಮಾಡಲಾಗುತ್ತದೆ.', ta: 'டெலிவரி உறுதிப்படுத்தலுக்குப் பிறகு கட்டணம் நேரடியாக உங்கள் வங்கிக் கணக்கில் செலுத்தப்படும்.', mr: 'डिलिव्हरी कन्फर्मेशननंतर पेमेंट थेट तुमच्या बँक खात्यात केले जाते.' } 
    },
    { 
      q: { en: 'What if my produce is rejected?', hi: 'यदि मेरी उपज अस्वीकार कर दी जाती है तो क्या होगा?', te: 'నా ఉత్పత్తి తిరస్కరించబడితే ఏమి జరుగుతుంది?', kn: 'ನನ್ನ ಉತ್ಪನ್ನ ತಿರಸ್ಕರಿಸಲ್ಪಟ್ಟರೆ ಏನು?', ta: 'என் விளைபொருள் நிராகரிக்கப்பட்டால் என்ன?', mr: 'माझे उत्पादन नाकारले गेले तर काय?' }, 
      a: { en: 'Our quality team will explain the reason. You can re-list with improvements.', hi: 'हमारी गुणवत्ता टीम कारण बताएगी। आप सुधार के साथ फिर से लिस्ट कर सकते हैं।', te: 'మా క్వాలిటీ టీమ్ కారణం వివరిస్తుంది. మీరు మెరుగుదలలతో రీ-లిస్ట్ చేయవచ్చు.', kn: 'ನಮ್ಮ ಗುಣಮಟ್ಟದ ತಂಡ ಕಾರಣವನ್ನು ವಿವರಿಸುತ್ತದೆ. ನೀವು ಸುಧಾರಣೆಗಳೊಂದಿಗೆ ಮರು-ಪಟ್ಟಿ ಮಾಡಬಹುದು.', ta: 'எங்கள் தரக் குழு காரணத்தை விளக்கும். மேம்பாடுகளுடன் நீங்கள் மீண்டும் பட்டியலிடலாம்.', mr: 'आमची गुणवत्ता टीम कारण स्पष्ट करेल. तुम्ही सुधारणांसह पुन्हा लिस्ट करू शकता.' } 
    },
    { 
      q: { en: 'How do I track my orders?', hi: 'मैं अपने ऑर्डर कैसे ट्रैक करूं?', te: 'నేను నా ఆర్డర్లను ఎలా ట్రాక్ చేయాలి?', kn: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳನ್ನು ನಾನು ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು?', ta: 'என் ஆர்டர்களை நான் எப்படி கண்காணிப்பது?', mr: 'मी माझे ओर्डर कसे ट्रॅक करू?' }, 
      a: { en: 'Visit Dashboard → My Orders to see real-time tracking.', hi: 'रियल-टाइम ट्रैकिंग देखने के लिए डैशबोर्ड → मेरे ऑर्डर पर जाएं।', te: 'రియల్-టైమ్ ట్రాకింగ్ చూడటానికి డాష్‌బోర్డ్ → నా ఆర్డర్లు సందర్శించండి.', kn: 'ರಿಯಲ್-ಟೈಮ್ ಟ್ರ್ಯಾಕಿಂಗ್ ನೋಡಲು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ → ನನ್ನ ಆರ್ಡರ್‌ಗಳು ಭೇಟಿ ನೀಡಿ.', ta: 'நிகழ்நேர கண்காணிப்பைக் காண டாஷ்போர்டு → எனது ஆர்டர்கள் ஐப் பார்வையிடவும்.', mr: 'रिअल-टाइम ट्रॅकिंग पाहण्यासाठी डॅशबोर्ड → माझे ऑर्डर ला भेट द्या.' } 
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-card rounded-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden border border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-lg">{getText('helpCenter')}</h2>
                  <p className="text-xs text-muted-foreground">{getText('hereToHelp')}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-88px)]">
              <AnimatePresence mode="wait">
                {mode === 'menu' && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setMode('callback')}
                        className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                          <Phone className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-center">{getText('reqCallback')}</span>
                      </button>
                      <button
                        onClick={() => setMode('chat')}
                        className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-accent/5 hover:bg-accent/10 border border-accent/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                         <div className="p-3 bg-white rounded-full shadow-sm text-accent">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-center">{getText('liveChat')}</span>
                      </button>
                    </div>

                    {/* Hotline */}
                    <div className="p-5 rounded-2xl bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">{getText('helpline')}</p>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                      </div>
                      <a href="tel:1800-XXX-XXXX" className="text-2xl font-bold text-primary tracking-tight block hover:opacity-80 transition-opacity">
                        1800-XXX-XXXX
                      </a>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {getText('tollFree')}
                      </p>
                    </div>

                    {/* FAQs */}
                    <div>
                      <h3 className="font-medium mb-4 px-1">{getText('faq')}</h3>
                      <div className="space-y-3">
                        {faqItems.map((faq, idx) => (
                          <details key={idx} className="group bg-card border border-border rounded-xl open:ring-1 open:ring-primary/20 transition-all">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                              <span className="text-sm font-medium pr-4">{faq.q[language as keyof typeof faq.q] || faq.q['en']}</span>
                              <div className="text-muted-foreground group-open:rotate-180 transition-transform duration-200">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </summary>
                            <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                              <div className="h-px bg-border -mt-2 mb-3 w-full opacity-50" />
                              {faq.a[language as keyof typeof faq.a] || faq.a['en']}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === 'callback' && (
                  <motion.div
                    key="callback"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <button
                      onClick={() => setMode('menu')}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                    >
                      {getText('backToMenu')}
                    </button>

                    <div className="text-center py-6">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
                        <Phone className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-heading font-bold text-xl">{getText('reqCallback')}</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                        {getText('callBackWithin')}
                      </p>
                    </div>

                    <div className="space-y-4 bg-muted/30 p-5 rounded-2xl border border-border/50">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block text-foreground">{getText('phoneNum')}</label>
                        <Input
                          type="tel"
                          placeholder={getText('enterMobile')}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="h-12 text-lg bg-background border-input focus:border-primary/50 transition-all rounded-xl"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{getText('waitTime')}</span>
                      </div>

                      <Button
                        onClick={handleCallbackRequest}
                        disabled={isSubmitting || phoneNumber.length < 10}
                        className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {getText('submitting')}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {getText('reqCallback')}
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {mode === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <button
                      onClick={() => setMode('menu')}
                       className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                    >
                      {getText('backToMenu')}
                    </button>

                    <div className="text-center py-10">
                      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
                        <MessageCircle className="w-9 h-9 text-accent" />
                      </div>
                      <h3 className="font-heading font-bold text-xl">{getText('liveChat')}</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                        {getText('chatSupport')}
                      </p>
                      <Button className="mt-8 h-12 px-8 rounded-xl text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
                        {getText('startChat')}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {mode === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                      className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <h3 className="font-heading font-bold text-2xl text-foreground">{getText('requestSubmitted')}</h3>
                    <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border/50 max-w-xs mx-auto">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {getText('willCallYou')} <span className="text-foreground font-semibold block text-base mt-1">{phoneNumber}</span> {getText('within30')}
                      </p>
                    </div>
                    <Button onClick={handleClose} variant="outline" className="mt-8 border-border hover:bg-muted h-11 px-8 rounded-xl">
                      {getText('close')}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
