"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { HelpModal } from '@/components/HelpModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface FAQ {
  q: string;
  qHi: string;
  qKn: string;
  qTe: string;
  qTa: string;
  qMr: string;
  a: string;
  aHi: string;
  aKn: string;
  aTe: string;
  aTa: string;
  aMr: string;
}

interface FAQCategory {
  category: string;
  categoryHi: string;
  categoryKn: string;
  categoryTe: string;
  categoryTa: string;
  categoryMr: string;
  questions: FAQ[];
}

const faqs: FAQCategory[] = [
  {
    category: 'Getting Started',
    categoryHi: 'शुरुआत करना',
    categoryKn: 'ಪ್ರಾರಂಭಿಸುವುದು',
    categoryTe: 'ప్రారంభించడం',
    categoryTa: 'தொடங்குதல்',
    categoryMr: 'सुरुवात करणे',
    questions: [
      { 
        q: 'How do I register as a farmer?', 
        qHi: 'मैं किसान के रूप में कैसे पंजीकरण करूं?',
        qKn: 'ನಾನು ರೈತನಾಗಿ ಹೇಗೆ ನೋಂದಾಯಿಸಿಕೊಳ್ಳಬಹುದು?',
        qTe: 'నేను రైతుగా ఎలా నమోదు చేసుకోవాలి?',
        qTa: 'நான் விவசாயியாக எப்படி பதிவு செய்வது?',
        qMr: 'मी शेतकरी म्हणून कसे नोंदणी करू?',
        a: 'Click on "I am a Farmer" on the homepage and follow the simple onboarding steps. You\'ll need your phone number and basic details.', 
        aHi: 'होमपेज पर "मैं किसान हूं" पर क्लिक करें और सरल ऑनबोर्डिंग चरणों का पालन करें। आपको अपने फोन नंबर और बुनियादी विवरण की आवश्यकता होगी।',
        aKn: 'ಮುಖಪುಟದಲ್ಲಿ "ನಾನು ರೈತ" ಅನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ಸರಳ ಆನ್‌ಬೋರ್ಡಿಂಗ್ ಹಂತಗಳನ್ನು ಅನುಸರಿಸಿ. ನಿಮಗೆ ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ಮತ್ತು ಮೂಲ ವಿವರಗಳು ಬೇಕಾಗುತ್ತವೆ.',
        aTe: 'హోమ్‌పేజీలో "నేను రైతు" పై క్లిక్ చేయండి మరియు సాధారణ ఆన్‌బోర్డింగ్ దశలను అనుసరించండి. మీకు మీ ఫోన్ నంబర్ మరియు ప్రాథమిక వివరాలు అవసరం.',
        aTa: 'முகப்புப் பக்கத்தில் "நான் விவசாயி" என்பதைக் கிளிக் செய்து எளிய ஆன்போர்டிங் படிகளைப் பின்பற்றவும். உங்கள் தொலைபேசி எண் மற்றும் அடிப்படை விவரங்கள் தேவை.',
        aMr: 'मुखपृष्ठावर "मी शेतकरी आहे" वर क्लिक करा आणि सोप्या ऑनबोर्डिंग स्टेप्स फॉलो करा. तुम्हाला तुमचा फोन नंबर आणि मूलभूत माहिती लागेल.',
      },
      { 
        q: 'Is registration free?', 
        qHi: 'क्या पंजीकरण मुफ्त है?',
        qKn: 'ನೋಂದಣಿ ಉಚಿತವೇ?',
        qTe: 'నమోదు ఉచితమా?',
        qTa: 'பதிவு இலவசமா?',
        qMr: 'नोंदणी मोफत आहे का?',
        a: 'Yes! Registration is completely free for farmers, FPOs, and buyers.', 
        aHi: 'हाँ! किसानों, FPO और खरीदारों के लिए पंजीकरण पूरी तरह से मुफ्त है।',
        aKn: 'ಹೌದು! ರೈತರು, FPO ಗಳು ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ನೋಂದಣಿ ಸಂಪೂರ್ಣವಾಗಿ ಉಚಿತ.',
        aTe: 'అవును! రైతులు, FPOలు మరియు కొనుగోలుదారులకు నమోదు పూర్తిగా ఉచితం.',
        aTa: 'ஆம்! விவசாயிகள், FPOக்கள் மற்றும் வாங்குபவர்களுக்கு பதிவு முற்றிலும் இலவசம்.',
        aMr: 'होय! शेतकरी, FPO आणि खरेदीदारांसाठी नोंदणी पूर्णपणे मोफत आहे.',
      },
      { 
        q: 'What documents do I need?', 
        qHi: 'मुझे कौन से दस्तावेज़ चाहिए?',
        qKn: 'ನನಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?',
        qTe: 'నాకు ఏ డాక్యుమెంట్లు కావాలి?',
        qTa: 'எனக்கு என்ன ஆவணங்கள் தேவை?',
        qMr: 'मला कोणती कागदपत्रे लागतील?',
        a: 'Basic registration requires just your phone number. For verification, you may need Aadhaar and bank details.', 
        aHi: 'बुनियादी पंजीकरण के लिए केवल आपके फोन नंबर की आवश्यकता है। सत्यापन के लिए आधार और बैंक विवरण की आवश्यकता हो सकती है।',
        aKn: 'ಮೂಲ ನೋಂದಣಿಗೆ ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ಮಾತ್ರ ಬೇಕು. ಪರಿಶೀಲನೆಗಾಗಿ ಆಧಾರ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ವಿವರಗಳು ಬೇಕಾಗಬಹುದು.',
        aTe: 'ప్రాథమిక నమోదుకు మీ ఫోన్ నంబర్ మాత్రమే అవసరం. వెరిఫికేషన్ కోసం ఆధార్ మరియు బ్యాంక్ వివరాలు అవసరం కావచ్చు.',
        aTa: 'அடிப்படை பதிவுக்கு உங்கள் தொலைபேசி எண் மட்டுமே தேவை. சரிபார்ப்புக்கு ஆதார் மற்றும் வங்கி விவரங்கள் தேவைப்படலாம்.',
        aMr: 'मूलभूत नोंदणीसाठी फक्त तुमचा फोन नंबर आवश्यक आहे. व्हेरिफिकेशनसाठी आधार आणि बँक तपशील लागू शकतात.',
      },
    ],
  },
  {
    category: 'Selling Millets',
    categoryHi: 'मिलेट बेचना',
    categoryKn: 'ಸಿರಿಧಾನ್ಯ ಮಾರಾಟ',
    categoryTe: 'చిరుధాన్యాలు అమ్మడం',
    categoryTa: 'தினை விற்பனை',
    categoryMr: 'ज्वारी विक्री',
    questions: [
      { 
        q: 'How do I create a listing?', 
        qHi: 'मैं लिस्टिंग कैसे बनाऊं?',
        qKn: 'ನಾನು ಪಟ್ಟಿಯನ್ನು ಹೇಗೆ ರಚಿಸುವುದು?',
        qTe: 'నేను లిస్టింగ్ ఎలా క్రియేట్ చేయాలి?',
        qTa: 'நான் பட்டியலை எப்படி உருவாக்குவது?',
        qMr: 'मी लिस्टिंग कशी तयार करू?',
        a: 'Go to your Dashboard → Create Listing. You can use voice to describe your produce or enter details manually.', 
        aHi: 'अपने डैशबोर्ड → लिस्टिंग बनाएं पर जाएं। आप अपनी उपज का वर्णन करने के लिए आवाज़ का उपयोग कर सकते हैं या मैन्युअल रूप से विवरण दर्ज कर सकते हैं।',
        aKn: 'ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ → ಪಟ್ಟಿ ರಚಿಸಿ ಗೆ ಹೋಗಿ. ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ವಿವರಿಸಲು ಧ್ವನಿಯನ್ನು ಬಳಸಬಹುದು ಅಥವಾ ವಿವರಗಳನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ನಮೂದಿಸಬಹುದು.',
        aTe: 'మీ డాష్‌బోర్డ్ → లిస్టింగ్ క్రియేట్ చేయండి కి వెళ్ళండి. మీ ఉత్పత్తిని వివరించడానికి వాయిస్ ఉపయోగించవచ్చు లేదా వివరాలను మాన్యువల్‌గా ఎంటర్ చేయవచ్చు.',
        aTa: 'உங்கள் டாஷ்போர்டு → பட்டியல் உருவாக்கு க்கு செல்லவும். உங்கள் விளைபொருளை விவரிக்க குரலைப் பயன்படுத்தலாம் அல்லது விவரங்களை கைமுறையாக உள்ளிடலாம்.',
        aMr: 'तुमच्या डॅशबोर्डवर जा → लिस्टिंग तयार करा. तुम्ही तुमच्या उत्पादनाचे वर्णन करण्यासाठी व्हॉईस वापरू शकता किंवा तपशील मॅन्युअली एंटर करू शकता.',
      },
      { 
        q: 'How do I set the right price?', 
        qHi: 'मैं सही कीमत कैसे तय करूं?',
        qKn: 'ನಾನು ಸರಿಯಾದ ಬೆಲೆಯನ್ನು ಹೇಗೆ ನಿಗದಿಪಡಿಸುವುದು?',
        qTe: 'నేను సరైన ధరను ఎలా సెట్ చేయాలి?',
        qTa: 'நான் சரியான விலையை எப்படி நிர்ணயிப்பது?',
        qMr: 'मी योग्य किंमत कशी ठरवू?',
        a: 'We show you current market prices for reference. You can set your own price based on quality and demand.', 
        aHi: 'हम आपको संदर्भ के लिए वर्तमान बाजार मूल्य दिखाते हैं। आप गुणवत्ता और मांग के आधार पर अपनी कीमत तय कर सकते हैं।',
        aKn: 'ನಾವು ನಿಮಗೆ ಉಲ್ಲೇಖಕ್ಕಾಗಿ ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ತೋರಿಸುತ್ತೇವೆ. ಗುಣಮಟ್ಟ ಮತ್ತು ಬೇಡಿಕೆಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಸ್ವಂತ ಬೆಲೆಯನ್ನು ನಿಗದಿಪಡಿಸಬಹುದು.',
        aTe: 'మేము మీకు రిఫరెన్స్ కోసం ప్రస్తుత మార్కెట్ ధరలను చూపిస్తాము. నాణ్యత మరియు డిమాండ్ ఆధారంగా మీ స్వంత ధరను సెట్ చేయవచ్చు.',
        aTa: 'நாங்கள் உங்களுக்கு குறிப்புக்காக தற்போதைய சந்தை விலைகளைக் காட்டுகிறோம். தரம் மற்றும் தேவையின் அடிப்படையில் உங்கள் சொந்த விலையை நிர்ணயிக்கலாம்.',
        aMr: 'आम्ही तुम्हाला संदर्भासाठी सध्याच्या बाजार किमती दाखवतो. तुम्ही गुणवत्ता आणि मागणीवर आधारित तुमची स्वतःची किंमत ठरवू शकता.',
      },
      { 
        q: 'Can I list without internet?', 
        qHi: 'क्या मैं बिना इंटरनेट के लिस्ट कर सकता हूं?',
        qKn: 'ನಾನು ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಪಟ್ಟಿ ಮಾಡಬಹುದೇ?',
        qTe: 'నేను ఇంటర్నెట్ లేకుండా లిస్ట్ చేయగలనా?',
        qTa: 'நான் இணையம் இல்லாமல் பட்டியலிடலாமா?',
        qMr: 'मी इंटरनेट शिवाय लिस्ट करू शकतो का?',
        a: 'Yes! Create listings offline and they\'ll automatically sync when you\'re back online.', 
        aHi: 'हाँ! ऑफ़लाइन लिस्टिंग बनाएं और वे ऑनलाइन होने पर अपने आप सिंक हो जाएंगी।',
        aKn: 'ಹೌದು! ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಪಟ್ಟಿಗಳನ್ನು ರಚಿಸಿ ಮತ್ತು ನೀವು ಮತ್ತೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾಗ ಅವು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿಂಕ್ ಆಗುತ್ತವೆ.',
        aTe: 'అవును! ఆఫ్‌లైన్‌లో లిస్టింగ్‌లు క్రియేట్ చేయండి మరియు మీరు మళ్ళీ ఆన్‌లైన్‌లో ఉన్నప్పుడు అవి ఆటోమేటిక్‌గా సింక్ అవుతాయి.',
        aTa: 'ஆம்! ஆஃப்லைனில் பட்டியல்களை உருவாக்கவும், நீங்கள் மீண்டும் ஆன்லைனில் இருக்கும்போது அவை தானாகவே ஒத்திசைவாகும்.',
        aMr: 'होय! ऑफलाइन लिस्टिंग तयार करा आणि तुम्ही पुन्हा ऑनलाइन आल्यावर ते आपोआप सिंक होतील.',
      },
    ],
  },
  {
    category: 'Payments',
    categoryHi: 'भुगतान',
    categoryKn: 'ಪಾವತಿಗಳು',
    categoryTe: 'చెల్లింపులు',
    categoryTa: 'கட்டணங்கள்',
    categoryMr: 'पेमेंट',
    questions: [
      { 
        q: 'How do I receive payments?', 
        qHi: 'मुझे भुगतान कैसे मिलेगा?',
        qKn: 'ನಾನು ಪಾವತಿಗಳನ್ನು ಹೇಗೆ ಪಡೆಯುವುದು?',
        qTe: 'నేను చెల్లింపులను ఎలా పొందాలి?',
        qTa: 'நான் கட்டணங்களை எப்படி பெறுவது?',
        qMr: 'मला पेमेंट कसे मिळेल?',
        a: 'Payments are transferred directly to your bank account after delivery confirmation. Add your bank details in Profile settings.', 
        aHi: 'डिलीवरी कन्फर्मेशन के बाद भुगतान सीधे आपके बैंक खाते में ट्रांसफर हो जाता है। प्रोफ़ाइल सेटिंग्स में अपना बैंक विवरण जोड़ें।',
        aKn: 'ವಿತರಣೆ ದೃಢೀಕರಣದ ನಂತರ ಪಾವತಿಗಳು ನೇರವಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ವರ್ಗಾಯಿಸಲ್ಪಡುತ್ತವೆ. ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ.',
        aTe: 'డెలివరీ కన్ఫర్మేషన్ తర్వాత చెల్లింపులు నేరుగా మీ బ్యాంక్ ఖాతాకు బదిలీ చేయబడతాయి. ప్రొఫైల్ సెట్టింగ్‌లలో మీ బ్యాంక్ వివరాలను జోడించండి.',
        aTa: 'டெலிவரி உறுதிப்படுத்தலுக்குப் பிறகு கட்டணங்கள் நேரடியாக உங்கள் வங்கிக் கணக்கிற்கு மாற்றப்படும். சுயவிவர அமைப்புகளில் உங்கள் வங்கி விவரங்களைச் சேர்க்கவும்.',
        aMr: 'डिलिव्हरी कन्फर्मेशननंतर पेमेंट थेट तुमच्या बँक खात्यात ट्रान्सफर होते. प्रोफाइल सेटिंग्जमध्ये तुमचे बँक तपशील जोडा.',
      },
      { 
        q: 'How long does payment take?', 
        qHi: 'भुगतान में कितना समय लगता है?',
        qKn: 'ಪಾವತಿಗೆ ಎಷ್ಟು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ?',
        qTe: 'చెల్లింపు ఎంత సమయం పడుతుంది?',
        qTa: 'கட்டணம் எவ்வளவு நேரம் ஆகும்?',
        qMr: 'पेमेंटला किती वेळ लागतो?',
        a: 'Typically 2-3 business days after the buyer confirms receipt of produce.', 
        aHi: 'आमतौर पर खरीदार द्वारा उत्पाद प्राप्ति की पुष्टि के बाद 2-3 कार्य दिवस।',
        aKn: 'ಸಾಮಾನ್ಯವಾಗಿ ಖರೀದಿದಾರರು ಉತ್ಪನ್ನ ಸ್ವೀಕೃತಿಯನ್ನು ದೃಢೀಕರಿಸಿದ ನಂತರ 2-3 ವ್ಯವಹಾರ ದಿನಗಳು.',
        aTe: 'సాధారణంగా కొనుగోలుదారు ఉత్పత్తి రసీదును నిర్ధారించిన తర్వాత 2-3 వ్యాపార రోజులు.',
        aTa: 'வழக்கமாக வாங்குபவர் விளைபொருள் ரசீதை உறுதிப்படுத்திய பின் 2-3 வணிக நாட்கள்.',
        aMr: 'सामान्यतः खरेदीदाराने उत्पादन प्राप्ती पुष्टी केल्यानंतर 2-3 व्यावसायिक दिवस.',
      },
      { 
        q: 'Are there any charges?', 
        qHi: 'क्या कोई शुल्क है?',
        qKn: 'ಯಾವುದೇ ಶುಲ್ಕಗಳಿವೆಯೇ?',
        qTe: 'ఏమైనా చార్జీలు ఉన్నాయా?',
        qTa: 'ஏதேனும் கட்டணங்கள் உள்ளனவா?',
        qMr: 'काही शुल्क आहे का?',
        a: 'We charge a small 2% platform fee only when you successfully sell. No hidden charges.', 
        aHi: 'हम केवल तब 2% का छोटा प्लेटफॉर्म शुल्क लेते हैं जब आप सफलतापूर्वक बेचते हैं। कोई छुपे शुल्क नहीं।',
        aKn: 'ನೀವು ಯಶಸ್ವಿಯಾಗಿ ಮಾರಾಟ ಮಾಡಿದಾಗ ಮಾತ್ರ ನಾವು ಸಣ್ಣ 2% ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕವನ್ನು ವಿಧಿಸುತ್ತೇವೆ. ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕಗಳಿಲ್ಲ.',
        aTe: 'మీరు విజయవంతంగా అమ్మినప్పుడు మాత్రమే మేము చిన్న 2% ప్లాట్‌ఫారమ్ ఫీజు వసూలు చేస్తాము. దాచిన ఛార్జీలు లేవు.',
        aTa: 'நீங்கள் வெற்றிகரமாக விற்கும்போது மட்டுமே சிறிய 2% தளம் கட்டணம் வசூலிக்கிறோம். மறைந்த கட்டணங்கள் இல்லை.',
        aMr: 'तुम्ही यशस्वीपणे विक्री केल्यावरच आम्ही फक्त 2% प्लॅटफॉर्म शुल्क आकारतो. कोणतेही लपलेले शुल्क नाही.',
      },
    ],
  },
  {
    category: 'For Buyers',
    categoryHi: 'खरीदारों के लिए',
    categoryKn: 'ಖರೀದಿದಾರರಿಗೆ',
    categoryTe: 'కొనుగోలుదారులకు',
    categoryTa: 'வாங்குபவர்களுக்கு',
    categoryMr: 'खरेदीदारांसाठी',
    questions: [
      { 
        q: 'How do I verify quality?', 
        qHi: 'मैं गुणवत्ता कैसे सत्यापित करूं?',
        qKn: 'ನಾನು ಗುಣಮಟ್ಟವನ್ನು ಹೇಗೆ ಪರಿಶೀಲಿಸುವುದು?',
        qTe: 'నేను నాణ్యతను ఎలా వెరిఫై చేయాలి?',
        qTa: 'நான் தரத்தை எப்படி சரிபார்ப்பது?',
        qMr: 'मी गुणवत्ता कशी पडताळू?',
        a: 'Check farmer ratings, certifications, and use QR codes to trace produce origin. Premium buyers can request samples.', 
        aHi: 'किसान रेटिंग, प्रमाणपत्र देखें और उत्पाद की उत्पत्ति का पता लगाने के लिए QR कोड का उपयोग करें। प्रीमियम खरीदार नमूने का अनुरोध कर सकते हैं।',
        aKn: 'ರೈತ ರೇಟಿಂಗ್‌ಗಳು, ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಉತ್ಪನ್ನ ಮೂಲವನ್ನು ಪತ್ತೆಹಚ್ಚಲು QR ಕೋಡ್‌ಗಳನ್ನು ಬಳಸಿ. ಪ್ರೀಮಿಯಂ ಖರೀದಿದಾರರು ಮಾದರಿಗಳನ್ನು ವಿನಂತಿಸಬಹುದು.',
        aTe: 'రైతు రేటింగ్‌లు, సర్టిఫికేషన్‌లు చెక్ చేయండి మరియు ఉత్పత్తి మూలాన్ని ట్రేస్ చేయడానికి QR కోడ్‌లను ఉపయోగించండి. ప్రీమియం కొనుగోలుదారులు నమూనాలను అభ్యర్థించవచ్చు.',
        aTa: 'விவசாயி மதிப்பீடுகள், சான்றிதழ்களைச் சரிபார்த்து, விளைபொருள் தோற்றத்தைக் கண்டறிய QR குறியீடுகளைப் பயன்படுத்தவும். பிரீமியம் வாங்குபவர்கள் மாதிரிகளைக் கோரலாம்.',
        aMr: 'शेतकरी रेटिंग, प्रमाणपत्रे तपासा आणि उत्पादनाचे मूळ शोधण्यासाठी QR कोड वापरा. प्रीमियम खरेदीदार नमुने मागू शकतात.',
      },
      { 
        q: 'Can I buy in bulk?', 
        qHi: 'क्या मैं थोक में खरीद सकता हूं?',
        qKn: 'ನಾನು ಬೃಹತ್ ಪ್ರಮಾಣದಲ್ಲಿ ಖರೀದಿಸಬಹುದೇ?',
        qTe: 'నేను బల్క్‌లో కొనుగోలు చేయగలనా?',
        qTa: 'நான் மொத்தமாக வாங்கலாமா?',
        qMr: 'मी मोठ्या प्रमाणात खरेदी करू शकतो का?',
        a: 'Yes! Contact FPOs for bulk orders. They aggregate produce from multiple farmers.', 
        aHi: 'हाँ! थोक ऑर्डर के लिए FPO से संपर्क करें। वे कई किसानों से उत्पाद एकत्र करते हैं।',
        aKn: 'ಹೌದು! ಬೃಹತ್ ಆದೇಶಗಳಿಗಾಗಿ FPO ಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ. ಅವರು ಅನೇಕ ರೈತರಿಂದ ಉತ್ಪನ್ನಗಳನ್ನು ಸಂಗ್ರಹಿಸುತ್ತಾರೆ.',
        aTe: 'అవును! బల్క్ ఆర్డర్‌ల కోసం FPOలను సంప్రదించండి. వారు అనేక రైతుల నుండి ఉత్పత్తులను సేకరిస్తారు.',
        aTa: 'ஆம்! மொத்த ஆர்டர்களுக்கு FPOக்களைத் தொடர்பு கொள்ளவும். அவர்கள் பல விவசாயிகளிடமிருந்து விளைபொருட்களை ஒருங்கிணைக்கிறார்கள்.',
        aMr: 'होय! मोठ्या ऑर्डरसाठी FPO शी संपर्क साधा. ते अनेक शेतकऱ्यांकडून उत्पादने एकत्र करतात.',
      },
      { 
        q: 'What if produce quality is not as described?', 
        qHi: 'अगर उत्पाद की गुणवत्ता वर्णन के अनुसार नहीं है तो?',
        qKn: 'ಉತ್ಪನ್ನದ ಗುಣಮಟ್ಟ ವಿವರಿಸಿದಂತೆ ಇಲ್ಲದಿದ್ದರೆ ಏನು?',
        qTe: 'ఉత్పత్తి నాణ్యత వివరించినట్లు లేకపోతే ఏమి చేయాలి?',
        qTa: 'விளைபொருள் தரம் விவரிக்கப்பட்டபடி இல்லையென்றால் என்ன?',
        qMr: 'उत्पादनाची गुणवत्ता वर्णनानुसार नसल्यास काय?',
        a: 'Report within 24 hours of delivery. We have a fair dispute resolution process.', 
        aHi: 'डिलीवरी के 24 घंटों के भीतर रिपोर्ट करें। हमारे पास निष्पक्ष विवाद समाधान प्रक्रिया है।',
        aKn: 'ವಿತರಣೆಯ 24 ಗಂಟೆಗಳೊಳಗೆ ವರದಿ ಮಾಡಿ. ನಮ್ಮಲ್ಲಿ ನ್ಯಾಯಯುತ ವಿವಾದ ಪರಿಹಾರ ಪ್ರಕ್ರಿಯೆ ಇದೆ.',
        aTe: 'డెలివరీలో 24 గంటల్లోపు రిపోర్ట్ చేయండి. మాకు న్యాయమైన వివాద పరిష్కార ప్రక్రియ ఉంది.',
        aTa: 'டெலிவரிக்கு 24 மணி நேரத்திற்குள் புகாரளிக்கவும். எங்களிடம் நியாயமான தகராறு தீர்வு செயல்முறை உள்ளது.',
        aMr: 'डिलिव्हरीच्या 24 तासांच्या आत रिपोर्ट करा. आमच्याकडे न्याय्य विवाद निराकरण प्रक्रिया आहे.',
      },
    ],
  },
];

const tutorials = [
  { title: 'Creating Your First Listing', duration: '3 min', thumbnail: '🎥' },
  { title: 'Using Voice Commands', duration: '2 min', thumbnail: '🎤' },
  { title: 'Understanding QR Traceability', duration: '4 min', thumbnail: '📱' },
  { title: 'Managing Offers', duration: '3 min', thumbnail: '💰' },
];

export default function HelpPage() {
  const [role, setRole] = useState('farmer');
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const pageVoice: Record<string, string> = {
    en: 'Welcome to the Help Center. Find answers to common questions about selling millets, payments, and more. You can call us toll-free, request a callback, or email our support team.',
    hi: 'सहायता केंद्र में आपका स्वागत है। मिलेट बेचने, भुगतान और अधिक के बारे में सामान्य प्रश्नों के उत्तर खोजें। आप टोल-फ्री कॉल कर सकते हैं या ईमेल कर सकते हैं।',
    kn: 'ಸಹಾಯ ಕೇಂದ್ರಕ್ಕೆ ಸ್ವಾಗತ. ಸಿರಿಧಾನ್ಯ ಮಾರಾಟ, ಪಾವತಿಗಳು ಮತ್ತು ಹೆಚ್ಚಿನವುಗಳ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಗಳನ್ನು ಹುಡುಕಿ.',
    te: 'సహాయ కేంద్రానికి స్వాగతం. చిరుధాన్యాల అమ్మకం, చెల్లింపులు మరియు మరిన్ని గురించి సాధారణ ప్రశ్నలకు సమాధానాలు కనుగొనండి.',
    ta: 'உதவி மையத்திற்கு வரவேற்கிறோம். தினை விற்பனை, கட்டணங்கள் மற்றும் பலவற்றைப் பற்றிய பொதுவான கேள்விகளுக்கான பதில்களைக் கண்டறியவும்.',
    mr: 'मदत केंद्रात स्वागत आहे. ज्वारी विक्री, पेमेंट आणि बरेच काही याबद्दल सामान्य प्रश्नांची उत्तरे शोधा.',
  };

  const handleSpeak = () => {
    if (isSpeaking) stopSpeaking();
    else speak(pageVoice[language] || pageVoice.en);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            {language === 'hi' ? 'हम आपकी कैसे मदद कर सकते हैं?' : language === 'te' ? 'మేము మీకు ఎలా సహాయం చేయగలము?' : language === 'kn' ? 'ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?' : language === 'ta' ? 'நாங்கள் உங்களுக்கு எப்படி உதவலாம்?' : language === 'mr' ? 'आम्ही तुम्हाला कशी मदत करू शकतो?' : 'How can we help you?'}
          </h1>
          <button
            onClick={handleSpeak}
            className={`mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
              isSpeaking 
                ? 'bg-primary text-primary-foreground animate-pulse' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isSpeaking ? 'Stop' : 'Listen'}
          </button>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'hi' ? 'सामान्य प्रश्नों के उत्तर खोजें या हमारी सहायता टीम से संपर्क करें' : language === 'te' ? 'సాధారణ ప్రశ్నలకు సమాధానాలు కనుగొనండి లేదా మా సపోర్ట్ టీమ్‌ను సంప్రదించండి' : language === 'kn' ? 'ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಗಳನ್ನು ಹುಡುಕಿ ಅಥವಾ ನಮ್ಮ ಬೆಂಬಲ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ' : language === 'ta' ? 'பொதுவான கேள்விகளுக்கான பதில்களைக் கண்டறியவும் அல்லது எங்கள் ஆதரவு குழுவை தொடர்பு கொள்ளவும்' : language === 'mr' ? 'सामान्य प्रश्नांची उत्तरे शोधा किंवा आमच्या सपोर्ट टीमशी संपर्क साधा' : 'Find answers to common questions or contact our support team'}
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <Input
                type="search"
                placeholder={language === 'hi' ? 'सहायता खोजें...' : language === 'te' ? 'సహాయం కోసం శోధించండి...' : language === 'kn' ? 'ಸಹಾಯಕ್ಕಾಗಿ ಹುಡುಕಿ...' : language === 'ta' ? 'உதவிக்காக தேடுங்கள்...' : language === 'mr' ? 'मदतीसाठी शोधा...' : 'Search for help...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 text-lg"
              />
              <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Contact Options */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { 
              icon: Phone, 
              title: language === 'hi' ? 'कॉल करें' : language === 'kn' ? 'ಕರೆ ಮಾಡಿ' : language === 'te' ? 'కాల్ చేయండి' : language === 'ta' ? 'அழைக்கவும்' : language === 'mr' ? 'कॉल करा' : 'Call Us', 
              desc: '1800-XXX-XXXX', 
              subtitle: language === 'hi' ? 'टोल-फ्री, 24/7' : language === 'kn' ? 'ಟೋಲ್-ಫ್ರೀ, 24/7' : language === 'te' ? 'టోల్-ఫ్రీ, 24/7' : language === 'ta' ? 'கட்டணமில்லா, 24/7' : language === 'mr' ? 'टोल-फ्री, 24/7' : 'Toll-free, 24/7', 
              action: () => window.location.href = 'tel:1800-XXX-XXXX' 
            },
            { 
              icon: MessageCircle, 
              title: language === 'hi' ? 'कॉलबैक का अनुरोध करें' : language === 'kn' ? 'ಕಾಲ್‌ಬ್ಯಾಕ್ ವಿನಂತಿಸಿ' : language === 'te' ? 'కాల్‌బ్యాక్ అభ్యర్థించండి' : language === 'ta' ? 'கால்பேக் கோரவும்' : language === 'mr' ? 'कॉलबॅक विनंती करा' : 'Request Callback', 
              desc: language === 'hi' ? 'हम आपको वापस कॉल करेंगे' : language === 'kn' ? 'ನಾವು ನಿಮಗೆ ಮರಳಿ ಕರೆ ಮಾಡುತ್ತೇವೆ' : language === 'te' ? 'మేము మీకు తిరిగి కాల్ చేస్తాము' : language === 'ta' ? 'நாங்கள் உங்களை திரும்ப அழைப்போம்' : language === 'mr' ? 'आम्ही तुम्हाला परत कॉल करू' : 'We\'ll call you back', 
              subtitle: language === 'hi' ? '30 मिनट के भीतर' : language === 'kn' ? '30 ನಿಮಿಷಗಳಲ್ಲಿ' : language === 'te' ? '30 నిమిషాల్లో' : language === 'ta' ? '30 நிமிடங்களுக்குள்' : language === 'mr' ? '30 मिनिटांत' : 'Within 30 minutes', 
              action: () => setShowCallbackModal(true) 
            },
            { 
              icon: Mail, 
              title: language === 'hi' ? 'ईमेल सहायता' : language === 'kn' ? 'ಇಮೇಲ್ ಬೆಂಬಲ' : language === 'te' ? 'ఇమెయిల్ సపోర్ట్' : language === 'ta' ? 'மின்னஞ்சல் ஆதரவு' : language === 'mr' ? 'ईमेल सपोर्ट' : 'Email Support', 
              desc: 'help@shreenna.in', 
              subtitle: language === 'hi' ? '24 घंटे में जवाब' : language === 'kn' ? '24 ಗಂಟೆಗಳಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯೆ' : language === 'te' ? '24 గంటల్లో స్పందన' : language === 'ta' ? '24 மணி நேரத்தில் பதில்' : language === 'mr' ? '24 तासात प्रतिसाद' : 'Response in 24 hrs', 
              action: () => window.location.href = 'mailto:help@shreenna.in' 
            },
            { 
              icon: Users, 
              title: language === 'hi' ? 'समुदाय' : language === 'kn' ? 'ಸಮುದಾಯ' : language === 'te' ? 'కమ్యూనిటీ' : language === 'ta' ? 'சமூகம்' : language === 'mr' ? 'समुदाय' : 'Community', 
              desc: language === 'hi' ? 'व्हाट्सएप ग्रुप से जुड़ें' : language === 'kn' ? 'ವಾಟ್ಸಾಪ್ ಗ್ರೂಪ್‌ಗೆ ಸೇರಿ' : language === 'te' ? 'వాట్సాప్ గ్రూప్‌లో చేరండి' : language === 'ta' ? 'வாட்ஸ்அப் குழுவில் சேரவும்' : language === 'mr' ? 'व्हाट्सअँप ग्रुपमध्ये सामील व्हा' : 'Join WhatsApp Group', 
              subtitle: language === 'hi' ? '5000+ किसान' : language === 'kn' ? '5000+ ರೈತರು' : language === 'te' ? '5000+ రైతులు' : language === 'ta' ? '5000+ விவசாயிகள்' : language === 'mr' ? '5000+ शेतकरी' : '5000+ farmers', 
              action: () => {} 
            },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={item.action}
              className="bg-card rounded-2xl border border-border p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-primary font-medium">{item.desc}</p>
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            </motion.button>
          ))}
        </div>

        {/* Video Tutorials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-heading font-semibold mb-6">
            {language === 'hi' ? 'वीडियो ट्यूटोरियल' : language === 'kn' ? 'ವೀಡಿಯೊ ಟ್ಯುಟೋರಿಯಲ್‌ಗಳು' : language === 'te' ? 'వీడియో ట్యుటోరియల్స్' : language === 'ta' ? 'வீடியோ பயிற்சிகள்' : language === 'mr' ? 'व्हिडिओ ट्यूटोरियल' : 'Video Tutorials'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tutorials.map((tutorial, idx) => (
              <motion.div
                key={tutorial.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                  <span className="text-5xl">{tutorial.thumbnail}</span>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{tutorial.title}</h3>
                  <p className="text-sm text-muted-foreground">{tutorial.duration}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-heading font-semibold mb-6">
            {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : language === 'kn' ? 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು' : language === 'te' ? 'తరచుగా అడిగే ప్రశ్నలు' : language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : language === 'mr' ? 'वारंवार विचारले जाणारे प्रश्न' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-6">
            {faqs.map((category, catIdx) => {
              const getCategoryName = () => {
                switch(language) {
                  case 'hi': return category.categoryHi;
                  case 'kn': return category.categoryKn;
                  case 'te': return category.categoryTe;
                  case 'ta': return category.categoryTa;
                  case 'mr': return category.categoryMr;
                  default: return category.category;
                }
              };
              
              return (
                <div key={category.category}>
                  <h3 className="text-lg font-medium mb-3 text-primary">{getCategoryName()}</h3>
                  <div className="space-y-2">
                    {category.questions.map((faq, idx) => {
                      const key = `${catIdx}-${idx}`;
                      const isExpanded = expandedFaq === key;
                      
                      const getQuestion = () => {
                        switch(language) {
                          case 'hi': return faq.qHi;
                          case 'kn': return faq.qKn;
                          case 'te': return faq.qTe;
                          case 'ta': return faq.qTa;
                          case 'mr': return faq.qMr;
                          default: return faq.q;
                        }
                      };
                      
                      const getAnswer = () => {
                        switch(language) {
                          case 'hi': return faq.aHi;
                          case 'kn': return faq.aKn;
                          case 'te': return faq.aTe;
                          case 'ta': return faq.aTa;
                          case 'mr': return faq.aMr;
                          default: return faq.a;
                        }
                      };
                      
                      return (
                        <div key={key} className="bg-card rounded-xl border border-border overflow-hidden">
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : key)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                          >
                            <span className="font-medium pr-4">{getQuestion()}</span>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="px-4 pb-4"
                            >
                              <p className="text-muted-foreground">{getAnswer()}</p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Still need help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-heading font-semibold mb-2">
            {language === 'hi' ? 'अभी भी मदद चाहिए?' : language === 'kn' ? 'ಇನ್ನೂ ಸಹಾಯ ಬೇಕೇ?' : language === 'te' ? 'ఇంకా సహాయం కావాలా?' : language === 'ta' ? 'இன்னும் உதவி தேவையா?' : language === 'mr' ? 'अजूनही मदत हवी आहे?' : 'Still need help?'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'hi' ? 'हमारी सहायता टीम आपकी मदद के लिए 24/7 उपलब्ध है' : language === 'kn' ? 'ನಮ್ಮ ಬೆಂಬಲ ತಂಡ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು 24/7 ಲಭ್ಯವಿದೆ' : language === 'te' ? 'మా సపోర్ట్ టీమ్ మీకు సహాయం చేయడానికి 24/7 అందుబాటులో ఉంది' : language === 'ta' ? 'எங்கள் ஆதரவு குழு உங்களுக்கு உதவ 24/7 கிடைக்கும்' : language === 'mr' ? 'आमची सपोर्ट टीम तुम्हाला मदत करण्यासाठी 24/7 उपलब्ध आहे' : 'Our support team is available 24/7 to assist you'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setShowCallbackModal(true)} size="lg">
              <Phone className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'कॉलबैक का अनुरोध करें' : language === 'kn' ? 'ಕಾಲ್‌ಬ್ಯಾಕ್ ವಿನಂತಿಸಿ' : language === 'te' ? 'కాల్‌బ్యాక్ అభ్యర్థించండి' : language === 'ta' ? 'கால்பேக் கோரவும்' : language === 'mr' ? 'कॉलबॅक विनंती करा' : 'Request Callback'}
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:help@shreenna.in">
                <Mail className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'ईमेल करें' : language === 'kn' ? 'ಇಮೇಲ್ ಮಾಡಿ' : language === 'te' ? 'ఇమెయిల్ చేయండి' : language === 'ta' ? 'மின்னஞ்சல் அனுப்பவும்' : language === 'mr' ? 'ईमेल करा' : 'Email Us'}
              </a>
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Help Modal */}
      <HelpModal isOpen={showCallbackModal} onClose={() => setShowCallbackModal(false)} />
    </div>
  );
}
