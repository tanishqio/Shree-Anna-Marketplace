"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { useLanguage } from '@/lib/hooks/useLanguage';
import {
    Heart, CheckCircle2, Video, PlayCircle, ExternalLink, ArrowRight,
    Wheat, Sprout, Factory, ShoppingCart, Users, Gem, Box, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SpeakButton } from '@/components/SpeakButton';
import { Card, CardContent } from '@/components/ui/card';

// --- Data Structure with 6 Languages ---
const contentData = {
    hero: {
        title: {
            en: "Why Shree Anna",
            hi: "श्री अन्न क्यों",
            kn: "ಶ್ರೀ ಅನ್ನ ಏಕೆ",
            te: "శ్రీ అన్న ఎందుకు",
            ta: "ஸ்ரீ அண்ணா ஏன்",
            mr: "श्री अन्ना का"
        },
        subtitle: {
            en: "Empowering Farmers & Rural Women through Millets",
            hi: "बाजरा के माध्यम से किसानों और ग्रामीण महिलाओं का सशक्तिकरण",
            kn: "ಸಿರಿಧಾನ್ಯಗಳ ಮೂಲಕ ರೈತರು ಮತ್ತು ಗ್ರಾಮೀಣ ಮಹಿಳೆಯರ ಸಬಲೀಕರಣ",
            te: "మిల్లెట్ల ద్వారా రైతులు & గ్రామీణ మహిళా సాధికారత",
            ta: "சிறுதானியங்கள் மூலம் விவசாயிகள் & கிராமப்புற பெண்கள் அதிகாரம்",
            mr: "मिलेट्सद्वारे शेतकरी आणि ग्रामीण महिलांचे सक्षमीकरण"
        },
        tagline: {
            en: "From raw millet to nutritious snacks — sustainable livelihood for villages.",
            hi: "कच्चे बाजरे से पौष्टिक स्नैक्स तक — गांवों के लिए स्थायी आजीविका।",
            kn: "ಕಚ್ಚಾ ಸಿರಿಧಾನ್ಯದಿಂದ ಪೌಷ್ಟಿಕ ಸ್ನ್ಯಾಕ್ಸ್‌ವರೆಗೆ — ಹಳ್ಳಿಗಳಿಗೆ ಸುಸ್ಥಿರ ಜೀವನೋಪಾಯ.",
            te: "ముడి మిల్లెట్ నుండి పోషకమైన స్నాక్స్ వరకు — గ్రామాలకు సుస్థిర జీవనోపాధి.",
            ta: "மூல சிறுதானியத்திலிருந்து சத்தான தின்பண்டங்கள் வரை — கிராமங்களுக்கு நிலையான வாழ்வாதாரம்.",
            mr: "कच्च्या बाजरीपासून पौष्टिक स्नॅक्सपर्यंत — गावांसाठी शाश्वत उपजीविका."
        },
        cta: {
            en: "Join Our Mission",
            hi: "हमारे मिशन से जुड़ें",
            kn: "ನಮ್ಮ ಯೋಜನೆಯನ್ನು ಸೇರಿ",
            te: "మా మిషన్‌లో చేరండి",
            ta: "எங்கள் பயணத்தில் இணையுங்கள்",
            mr: "आमच्या मोहिमेत सामील व्हा"
        }
    },
    videos: {
        title: {
            en: "Learn & Grow: Video Tutorials",
            hi: "सीखें और बढ़ें: वीडियो ट्यूटोरियल",
            kn: "ಕಲಿಯಿರಿ ಮತ್ತು ಬೆಳೆಯಿರಿ: ವಿಡಿಯೋ ಟ್ಯುಟೋರಿಯಲ್ಸ್",
            te: "నేర్చుకోండి & ఎదగండి: వీడియో ట్యుటోరియల్స్",
            ta: "கற்றுக்கொள்ளுங்கள் & வளருங்கள்: வீடியோ டுடோரியல்கள்",
            mr: "शिका आणि वाढा: व्हिडिओ ट्यूटोरियल्स"
        },
        desc: {
            en: "Master the art of millet processing with these detailed guides. Learn how to transform grains into high-value products like cookies and flour, ready for the market.",
            hi: "इन विस्तृत गाइडों के साथ बाजरा प्रसंस्करण की कला में महारत हासिल करें। जानें कि अनाज को कुकीज़ और आटे जैसे उच्च-मूल्य वाले उत्पादों में कैसे बदला जाए, जो बाजार के लिए तैयार हैं।",
            kn: "ಈ ವಿವರವಾದ ಮಾರ್ಗದರ್ಶಿಗಳೊಂದಿಗೆ ಸಿರಿಧಾನ್ಯ ಸಂಸ್ಕರಣಾ ಕಲೆಯನ್ನು ಕರಗತ ಮಾಡಿಕೊಳ್ಳಿ. ಮಾರುಕಟ್ಟೆಗೆ ಸಿದ್ಧವಾಗಿರುವ ಕುಕೀಸ್ ಮತ್ತು ಹಿಟ್ಟಿನಂತಹ ಹೆಚ್ಚಿನ ಮೌಲ್ಯದ ಉತ್ಪನ್ನಗಳಾಗಿ ಧಾನ್ಯಗಳನ್ನು ಹೇಗೆ ಪರಿವರ್ತಿಸುವುದು ಎಂದು ತಿಳಿಯಿರಿ.",
            te: "ఈ వివరణాత్మక గైడ్‌లతో మిల్లెట్ ప్రాసెసింగ్ కళలో ప్రావీణ్యం పొందండి. ధాన్యాలను కుకీలు మరియు పిండి వంటి అధిక-విలువైన ఉత్పత్తులుగా ఎలా మార్చాలో తెలుసుకోండి.",
            ta: "இந்த விரிவான வழிகாட்டிகளுடன் சிறுதானிய செயலாக்கக் கலையில் தேர்ச்சி பெறுங்கள். தானியங்களை சந்தைக்குத் தயாராக உள்ள குக்கீகள் மற்றும் மாவு போன்ற உயர் மதிப்புள்ள பொருட்களாக மாற்றுவது எப்படி என்று அறிக.",
            mr: "या तपशीलवार मार्गदर्शकांसह बाजरी प्रक्रियेच्या कलेमध्ये प्रभुत्व मिळवा. धान्याचे कुकीज आणि पिठासारख्या उच्च-मूल्याच्या उत्पादनांमध्ये रूपांतर कसे करायचे ते शिका."
        },
        cta: {
            en: "Start Your Journey - Register SHG",
            hi: "अपनी यात्रा शुरू करें - एसएचजी पंजीकृत करें",
            kn: "ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಪ್ರಾರಂಭಿಸಿ - SHG ನೋಂದಾಯಿಸಿ",
            te: "మీ ప్రయాణాన్ని ప్రారంభించండి - SHG ని రిజిస్టర్ చేయండి",
            ta: "உங்கள் பயணத்தைத் தொடங்குங்கள் - SHG ஐப் பதிவுசெய்க",
            mr: "तुमचा प्रवास सुरू करा - SHG नोंदणी करा"
        },
        list: [
            {
                videoId: "KNhfY7-x318",
                icon: Gem,
                title: { en: "Successful Women Entrepreneur in Millet Cookies", hi: "बाजरा कुकीज़ में सफल महिला उद्यमी", kn: "ಸಿರಿಧಾನ್ಯ ಕುಕೀಸ್‌ನಲ್ಲಿ ಯಶಸ್ವಿ ಮಹಿಳಾ ಉದ್ಯಮಿ", te: "మిల్లెట్ కుకీలలో విజయవంతమైన మహిళా పారిశ్రామికవేత్త", ta: "சிறுதானிய பிஸ்கட்களில் வெற்றிகರ பெண் தொழில்முனைவோர்", mr: "बाजरी कुकीजमधील यशस्वी महिला उद्योजक" },
                description: {
                    en: "How it helps: Provides inspiration and a proven business model for starting a small-scale cookie unit.\nRequirements: Commercial oven, packaging material, FSSAI registration.",
                    hi: "यह कैसे मदद करता है: छोटे पैमाने पर कुकी इकाई शुरू करने के लिए प्रेरणा और एक सिद्ध व्यवसाय मॉडल प्रदान करता है।\nआवश्यकताएँ: वाणिज्यिक ओवन, पैकेजिंग सामग्री, FSSAI पंजीकरण।",
                    kn: "ಸಣ್ಣ ಪ್ರಮಾಣದ ಕುಕೀ ಘಟಕವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಸ್ಫೂರ್ತಿ ಮತ್ತು ಸಾಬೀತಾದ ವ್ಯಾಪಾರ ಮಾದರಿಯನ್ನು ಒದಗಿಸುತ್ತದೆ. ಅಗತ್ಯತೆಗಳು: ಕಮರ್ಷಿಯಲ್ ಓವನ್, ಪ್ಯಾಕೇಜಿಂಗ್ ವಸ್ತು, FSSAI ನೋಂದಣಿ.",
                    te: "చిన్న తరహా కుకీ యూనిట్‌ను ప్రారంభించడానికి ప్రేరణ మరియు నిరూపితమైన వ్యాపార నమూనాను అందిస్తుంది. అవసరాలు: కమర్షియల్ ఓవెన్, ప్యాకేజింగ్ మెటీరియల్, FSSAI రిజిస్ట్రేషన్.",
                    ta: "சிறிய அளவிலான குக்கீ யூனிட்டைத் தொடங்குவதற்கான உத்வேகம் மற்றும் நிரூபிக்கப்பட்ட வணிக மாதிரியை வழங்குகிறது. தேவைகள்: வணிக அடுப்பு, பேக்கேஜிங் பொருள், FSSAI பதிவு.",
                    mr: "लहान प्रमाणात कुकी युनिट सुरू करण्यासाठी प्रेरणा आणि एक सिद्ध व्यवसाय मॉडेल प्रदान करते. आवश्यकता: व्यावसायिक ओव्हन, पॅकेजिंग साहित्य, एफएसएसएआय नोंदणी."
                }
            },
            {
                videoId: "yEdYvTHj6a8",
                icon: Factory,
                title: { en: "Market-style Coconut Millet Cookies", hi: "बाजार जैसी नारियल बाजरा कुकीज़", kn: "ಮಾರುಕಟ್ಟೆ ಶೈಲಿಯ ತೆಂಗಿನಕಾಯಿ ಸಿರಿಧಾನ್ಯ ಕುಕೀಸ್", te: "మార్కెట్ స్టైల్ కొబ్బరి మిల్లెట్ కుకీలు", ta: "சந்தை பாணி தேங்காய் சிறுதானிய குக்கீகள்", mr: "मार्केट स्टाईल कोकोनट बाजरी कुकीज" },
                description: {
                    en: "How it helps: Teaches high-demand recipe blending coconut flavor with healthy millets for better sales.\nRequirements: Kadai/Cooker (no oven needed), ingredients (coconut powder, millet flour).",
                    hi: "यह कैसे मदद करता है: बेहतर बिक्री के लिए स्वस्थ बाजरा के साथ नारियल के स्वाद को मिलाने वाली उच्च मांग वाली रेसिपी सिखाता है।\nआवश्यकताएँ: कड़ाही/कुकर, सामग्री (नारियल पाउडर, बाजरे का आटा)।",
                    kn: "ಆರೋಗ್ಯಕರ ಸಿರಿಧಾನ್ಯಗಳೊಂದಿಗೆ ತೆಂಗಿನಕಾಯಿ ಪರಿಮಳವನ್ನು ಬೆರೆಸುವ ಹೆಚ್ಚಿನ ಬೇಡಿಕೆಯ ಪಾಕವಿಧಾನವನ್ನು ಕಲಿಸುತ್ತದೆ. ಅಗತ್ಯತೆಗಳು: ಕಡೈ/ಕುಕ್ಕರ್, ಪದಾರ್ಥಗಳು.",
                    te: "ఆరోగ్యకరమైన మిల్లెట్‌లతో కొబ్బరి రుచిని మిళితం చేసే అధిక-డిమాండ్ రెసిపీని నేర్పుతుంది. అవసరాలు: కడాయి/కుక్కర్, పదార్థాలు.",
                    ta: "ஆரோக்கியமான சிறுதானியங்களுடன் தேங்காய் சுவையை கலக்கும் அதிக தேவை உள்ள செய்முறையை கற்பிக்கிறது. தேவைகள்: கடாய்/குக்கர், பொருட்கள்.",
                    mr: "चांगल्या विक्रीसाठी निरोगी बाजरी सोबत नारळाची चव मिसळणारी उच्च मागणी असलेली रेसिपी शिकवते. आवश्यकता: कढई/कुकर, साहित्य."
                }
            },
            {
                videoId: "aEvWXUAMlbc",
                icon: Wheat,
                title: { en: "Correct Way to Cook & Eat Millets", hi: "बाजरा पकाने और खाने का सही तरीका", kn: "ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಬೇಯಿಸಲು ಮತ್ತು ತಿನ್ನಲು ಸರಿಯಾದ ಮಾರ್ಗ", te: "మిల్లెట్లు వండడానికి మరియు తినడానికి సరైన మార్గం", ta: "சிறுதானியங்களை சமைக்கவும் சாப்பிடவும் சரியான வழி", mr: "बाजरी शिजवण्याची आणि खाण्याची योग्य पद्धत" },
                description: {
                    en: "How it helps: Ensures maximum nutrition absorption, making your food products healthier and more marketable.\nRequirements: Soaking vessels, proper water ratio knowledge.",
                    hi: "यह कैसे मदद करता है: अधिकतम पोषण अवशोषण सुनिश्चित करता है, जिससे आपके खाद्य उत्पाद स्वस्थ और अधिक बिक्री योग्य बनते हैं।\nआवश्यकताएँ: भिगोने के बर्तन, पानी के अनुपात का सही ज्ञान।",
                    kn: "ಗರಿಷ್ಠ ಪೋಷಕಾಂಶಗಳ ಹೀರಿಕೊಳ್ಳುವಿಕೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ. ಅಗತ್ಯತೆಗಳು: ನೆನೆಸುವ ಪಾತ್ರೆಗಳು, ಸರಿಯಾದ ನೀರಿನ ಅನುಪಾತ.",
                    te: "గరిష్ట పోషకాహార శోషణను నిర్ధారిస్తుంది. అవసరాలు: నానబెట్టే పాత్రలు, సరైన నీటి నిష్పత్తి.",
                    ta: "அதிகபட்ச ஊட்டச்சத்து உறிஞ்சுதலை உறுதி செய்கிறது. தேவைகள்: ஊறவைக்கும் பாத்திரங்கள், சரியான நீர் விகிதம்.",
                    mr: "जास्तीत जास्त पोषण शोषण सुनिश्चित करते. आवश्यकता: भिजवण्याची भांडी, योग्य पाण्याचे प्रमाण."
                }
            },
            {
                videoId: "SwbSGT1USmQ",
                icon: Heart,
                title: { en: "Super Crunchy No-Maida Biscuits", hi: "सुपर कुरकुरी नो-मैदा बिस्कुट", kn: "ಮೈದಾ ಇಲ್ಲದ ಸೂಪರ್ ಕ್ರಂಚಿ ಬಿಸ್ಕತ್ತುಗಳು", te: "మైదా లేని సూపర్ క్రంచీ బిస్కెట్లు", ta: "மைதா இல்லாத சூப்பர் க்ரஞ்சி பிஸ்கட்", mr: "सुपर क्रंची नो-मैदा बिस्किटे" },
                description: {
                    en: "How it helps: Targets health-conscious customers by offering gluten-free, sugar-free crunchy snack options.\nRequirements: Baking tray, mixing bowl, jaggery/natural sweeteners.",
                    hi: "यह कैसे मदद करता है: लस मुक्त, चीनी मुक्त कुरकुरे स्नैक विकल्प प्रदान करके स्वास्थ्य के प्रति जागरूक ग्राहकों को लक्षित करता है।\nआवश्यकताएँ: बेकिंग ट्रे, मिक्सिंग बाउल, गुड़।",
                    kn: "ಆರೋಗ್ಯ ಪ್ರಜ್ಞೆಯುಳ್ಳ ಗ್ರಾಹಕರನ್ನು ಗುರಿಯಾಗಿಸುತ್ತದೆ. ಅಗತ್ಯತೆಗಳು: ಬೇಕಿಂಗ್ ಟ್ರೇ, ಮಿಕ್ಸಿಂಗ್ ಬೌಲ್.",
                    te: "ఆరోగ్యం పట్ల శ్రద్ధ వహించే కస్టమర్లను లక్ష్యంగా చేసుకుంటుంది. అవసరాలు: బేకింగ్ ట్రే, మిక్సింగ్ బౌల్.",
                    ta: "சுகாதார உணர்வுள்ள வாடிக்கையாளர்களை குறிவைக்கிறது. தேவைகள்: பேக்கிங் தட்டு, கலக்கும் கிண்ணம்.",
                    mr: "आरोग्याबाबत जागरुक ग्राहकांना लक्ष्य करते. आवश्यकता: बेकिंग ट्रे, मिक्सिंग बाउल."
                }
            },
            {
                videoId: "4Qmugp3sHic",
                icon: Users,
                title: { en: "Millet Business Training & Certs", hi: "बाजरा व्यवसाय प्रशिक्षण और प्रमाणन", kn: "ಸಿರಿಧಾನ್ಯ ವ್ಯಾಪಾರ ತರಬೇತಿ ಮತ್ತು ಪ್ರಮಾಣೀಕರಣ", te: "మిల్లెట్ వ్యాపార శిక్షణ & ధృవీకరణలు", ta: "சிறுதானிய வணிக பயிற்சி & சான்றிதழ்கள்", mr: "बाजरी व्यवसाय प्रशिक्षण आणि प्रमाणपत्रे" },
                description: {
                    en: "How it helps: Guides you on where to get formal training (Pantnagar Univ) to build credibility and trust.\nRequirements: Application form, basic educational qualification.",
                    hi: "यह कैसे मदद करता है: विश्वसनीयता और विश्वास बनाने के लिए औपचारिक प्रशिक्षण (पंतनगर विश्वविद्यालय) कहां से प्राप्त करें, इस पर मार्गदर्शन करता है।\nआवश्यकताएँ: आवेदन पत्र, बुनियादी शैक्षणिक योग्यता।",
                    kn: "ಔಪಚಾರಿಕ ತರಬೇತಿಯನ್ನು ಎಲ್ಲಿ ಪಡೆಯಬೇಕು ಎಂಬುದರ ಕುರಿತು ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ. ಅಗತ್ಯತೆಗಳು: ಅರ್ಜಿ ನಮೂನೆ.",
                    te: "అధికారిక శిక్షణ ఎక్కడ పొందాలో మార్గనిర్దేశం చేస్తుంది. అవసరాలు: దరఖాస్తు ఫారం.",
                    ta: "முறையான பயிற்சியை எங்கு பெறுவது என்பது குறித்து வழிகாட்டுகிறது. தேவைகள்: விண்ணப்ப படிவம்.",
                    mr: "औपचारिक प्रशिक्षण कोठे घ्यावे याबद्दल मार्गदर्शन करते. आवश्यकता: अर्ज फॉर्म."
                }
            },
            {
                videoId: "FiKVX1XDiuc",
                icon: Factory,
                title: { en: "Advanced Millet Processing Tech", hi: "उन्नत बाजरा प्रसंस्करण तकनीक", kn: "ಸುಧಾರಿತ ಸಿರಿಧಾನ್ಯ ಸಂಸ್ಕರಣಾ ತಂತ್ರಜ್ಞಾನ", te: "అధునాతన మిల్లెట్ ప్రాసెసింగ్ టెక్", ta: "மேம்பட்ட சிறுதானிய செயலாக்க தொழில்நுட்பம்", mr: "प्रगत बाजरी प्रक्रिया तंत्र" },
                description: {
                    en: "How it helps: Explains modern machinery for dehulling and polishing to scale up production capacity.\nRequirements: Dehuller machine, polisher, destoner unit.",
                    hi: "यह कैसे मदद करता है: उत्पादन क्षमता बढ़ाने के लिए dehulling और पॉलिशिंग के लिए आधुनिक मशीनरी की व्याख्या करता है।\nआवश्यकताएँ: डीहुलर मशीन, पॉलिशर, डेस्टोनर इकाई।",
                    kn: "ಉತ್ಪಾದನಾ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೆಚ್ಚಿಸಲು ಆಧುನಿಕ ಯಂತ್ರೋಪಕರಣಗಳನ್ನು ವಿವರಿಸುತ್ತದೆ. ಅಗತ್ಯತೆಗಳು: ಡಿಹಲ್ಲರ್ ಯಂತ್ರ, ಪಾಲಿಶರ್.",
                    te: "ఉత్పత్తి సామర్థ్యాన్ని పెంచడానికి ఆధునిక యంత్రాలను వివరిస్తుంది. అవసరాలు: డీహల్లర్ మెషిన్, పాలిషర్.",
                    ta: "உற்பத்தி திறனை அதிகரிக்க நவீன இயந்திரங்களை விளக்குகிறது. தேவைகள்: டிஹல்லர் இயந்திரம், பாலிஷர்.",
                    mr: "उत्पादन क्षमता वाढवण्यासाठी आधुनिक यंत्रसामग्री स्पष्ट करते. आवश्यकता: डीहुलर मशीन, पॉलिशर."
                }
            },
            {
                videoId: "sCyY07sDi44",
                icon: Box,
                title: { en: "Millet Packaging & Branding", hi: "बाजरा पैकेजिंग और ब्रांडिंग", kn: "ಸಿರಿಧಾನ್ಯ ಪ್ಯಾಕೇಜಿಂಗ್ ಮತ್ತು ಬ್ರ್ಯಾಂಡಿಂಗ್", te: "మిల్లెట్ ప్యాకేజింగ్ & బ్రాండింగ్", ta: "சிறுதானிய பேக்கேஜிಂಗ್ & பிராண்டிங்", mr: "बाजरी पॅकेजिंग आणि ब्रँडिंग" },
                description: {
                    en: "How it helps: Shows how to create attractive, eco-friendly packaging that commands a premium price.\nRequirements: Sealing machine, biodegradable pouches, label design.",
                    hi: "यह कैसे मदद करता है: आकर्षक, पर्यावरण-अनुकूल पैकेजिंग कैसे बनाएं जो प्रीमियम मूल्य प्राप्त करे।\nआवश्यकताएँ: सीलिंग मशीन, बायोडिग्रेडेबल पाउच, लेबल डिजाइन।",
                    kn: "ಪ್ರೀಮಿಯಂ ಬೆಲೆಯನ್ನು ತರುವ ಆಕರ್ಷಕ ಪ್ಯಾಕೇಜಿಂಗ್ ರಚಿಸುವುದು ಹೇಗೆ ಎಂದು ತೋರಿಸುತ್ತದೆ. ಅಗತ್ಯತೆಗಳು: ಸೀಲಿಂಗ್ ಯಂತ್ರ, ಪೌಚ್‌ಗಳು.",
                    te: "ప్రీమియం ధరను పొందే ఆకర్షణీయమైన ప్యాకేజింగ్‌ను ఎలా సృష్టించాలో చూపుతుంది. అవసరాలు: సీలింగ్ మెషిన్, పర్సులు.",
                    ta: "பிரீமியம் விலையைப் பெறும் கவர்ச்சிகரமான பேக்கேஜிங்கை எவ்வாறு உருவாக்குவது என்பதைக் காட்டுகிறது. தேவைகள்: சீலிங் இயந்திரம், பைகள்.",
                    mr: "प्रीमियम किंमत मिळवणारे आकर्षक पॅकेजिंग कसे तयार करायचे ते दर्शवते. आवश्यकता: सीलिंग मशीन, पाऊच."
                }
            },
            {
                videoId: "yZgtsqkKKJc",
                icon: Globe,
                title: { en: "Export Opportunities for Millets", hi: "बाजरा के लिए निर्यात अवसर", kn: "ಸಿರಿಧಾನ್ಯಗಳಿಗೆ ರಫ್ತು ಅವಕಾಶಗಳು", te: "మిల్లెట్ల కోసం ఎగుమతి అవకాశాలు", ta: "சிறுதானியங்களுக்கான ஏற்றுமதி வாய்ப்புகள்", mr: "बाजरीसाठी निर्यात संधी" },
                description: {
                    en: "How it helps: Connects farmers to global buyers and explains international quality standards for export.\nRequirements: Export license (IEC), quality testing, bulk storage.",
                    hi: "यह कैसे मदद करता है: किसानों को वैश्विक खरीदारों से जोड़ता है और निर्यात के लिए अंतरराष्ट्रीय गुणवत्ता मानकों की व्याख्या करता है।\nआवश्यकताएँ: निर्यात लाइसेंस (IEC), गुणवत्ता परीक्षण, थोक भंडारण।",
                    kn: "ರೈತರನ್ನು ಜಾಗತಿಕ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ. ಅಗತ್ಯತೆಗಳು: ರಫ್ತು ಪರವಾನಗಿ, ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ.",
                    te: "రైతులను గ్లోబల్ కొనుగోలుదారులతో కలుపుతుంది. అవసరాలు: ఎగుమతి లైసెన్స్, నాణ్యత పరీక్ష.",
                    ta: "விவசாயிகளை உலகளாவிய வாங்குபவர்களுடன் இணைக்கிறது. தேவைகள்: ஏற்றுமதி உரிமம், தர சோதனை.",
                    mr: "जागतिक खरेदीदारांशी शेतकऱ्यांना जोडते. आवश्यकता: निर्यात परवाना, गुणवत्ता चाचणी."
                }
            }
        ]
    },
    women: {
        title: {
            en: "Women Empowerment",
            hi: "महिला सशक्तिकरण",
            kn: "ಮಹಿಳಾ ಸಬಲೀಕರಣ",
            te: "మహిళా సాధికారత",
            ta: "பெண்கள் அதிகாரம்",
            mr: "महिला सक्षमीकरण"
        },
        subtitle: {
            en: "The Heart of Our Initiative",
            hi: "हमारी पहल का दिल",
            kn: "ನಮ್ಮ ಉಪಕ್ರಮದ ಹೃದಯ",
            te: "మా చొరవ యొక్క హృదయం",
            ta: "எங்கள் முயற்சியின் இதயம்",
            mr: "आमच्या उपक्रमाचे हृदय"
        },
        desc: {
            en: "We believe when you empower a woman, you empower a whole community. Shree Anna provides skill training and resources to help rural women start home-based millet businesses.",
            hi: "हमारा मानना है कि जब आप एक महिला को सशक्त बनाते हैं, तो आप पूरे समुदाय को सशक्त बनाते हैं। श्री अन्न ग्रामीण महिलाओं को गृह-आधारित बाजरा व्यवसाय शुरू करने में मदद करने के लिए कौशल प्रशिक्षण और संसाधन प्रदान करता है।",
            kn: "ನೀವು ಮಹಿಳೆಯನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸಿದಾಗ, ನೀವು ಇಡೀ ಸಮುದಾಯವನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುತ್ತೀರಿ ಎಂದು ನಾವು ನಂಬುತ್ತೇವೆ. ಗ್ರಾಮೀಣ ಮಹಿಳೆಯರಿಗೆ ಮನೆ ಆಧಾರಿತ ಸಿರಿಧಾನ್ಯ ಉದ್ಯಮಗಳನ್ನು ಪ್ರಾರಂಭಿಸಲು ಸಹಾಯ ಮಾಡಲು ಶ್ರೀ ಅನ್ನ ಕೌಶಲ್ಯ ತರಬೇತಿ ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.",
            te: "మీరు ఒక మహిళకు సాధికారత కల్పిస్తే, మీరు మొత్తం సమాజానికి సాధికారత కల్పిస్తారని మేము నమ్ముతున్నాము. గ్రామీణ మహిళలు గృహ ఆధారిత మిల్లెట్ వ్యాపారాలను ప్రారంభించడానికి శ్రీ అన్న నైపుణ్య శిక్షణ మరియు వనరులను అందిస్తుంది.",
            ta: "நீங்கள் ஒரு பெண்ணை அதிகாரம் செய்யும்போது, முழு சமூகத்தையும் அதிகாரம் செய்கிறீர்கள் என்று நாங்கள் நம்புகிறோம். கிராமப்புற பெண்கள் வீட்டிலேயே சிறுதானிய வணிகங்களைத் தொடங்க உதவ ஸ்ரீ அண்ணா திறன் பயிற்சி மற்றும் வளங்களை வழங்குகிறது.",
            mr: "आम्हाला विश्वास आहे की जेव्हा तुम्ही एका महिलेला सक्षम करता, तेव्हा तुम्ही संपूर्ण समुदायाला सक्षम करता. श्री अन्ना ग्रामीण महिलांना गृह-आधारित बाजरी व्यवसाय सुरू करण्यास मदत करण्यासाठी कौशल्य प्रशिक्षण आणि संसाधने पुरवते."
        },
        benefits: [
            { en: "Skill training in food processing", hi: "खाद्य प्रसंस्करण में कौशल प्रशिक्षण", kn: "ಆಹಾರ ಸಂಸ್ಕರಣೆಯಲ್ಲಿ ಕೌಶಲ್ಯ ತರಬೇತಿ", te: "ఆహార ప్రాసెసింగ్‌లో నైపుణ్య శిక్షణ", ta: "உணவு செயலாக்கத்தில் திறன் பயிற்சி", mr: "अन्न प्रक्रियेत कौशल्य प्रशिक्षण" },
            { en: "Financial independence & dignity", hi: "आर्थिक स्वतंत्रता और सम्मान", kn: "ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ ಮತ್ತು ಘನತೆ", te: "ఆర్థిక స్వాతంత్ర్యం & గౌరవం", ta: "பொருளாதார சுதந்திரம் & கண்ணியம்", mr: "आर्थिक स्वातंत्र्य आणि प्रतिष्ठा" },
            { en: "Leadership in village SHGs", hi: "ग्राम एसएचजी में नेतृत्व", kn: "ಗ್ರಾಮ SHG ಗಳಲ್ಲಿ ನಾಯಕತ್ವ", te: "గ్రామ SHG లలో నాయకత్వం", ta: "கிராம SHG-களில் தலைமை", mr: "गाव SHG मध्ये नेतृत्व" }
        ]
    },
    process: {
        title: { en: "How It Works", hi: "यह कैसे काम करता है", kn: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", te: "ఇది ఎలా పనిచేస్తుంది", ta: "இது எப்படி வேலை செய்கிறது", mr: "हे कसे कार्य करते" },
        steps: [
            { icon: Sprout, title: { en: "Cultivation", hi: "खेती" }, desc: { en: "Farmer grows millets naturally", hi: "किसान प्राकृतिक रूप से बाजरा उगाते हैं" } },
            { icon: ShoppingCart, title: { en: "Collection", hi: "संग्रह" }, desc: { en: "Harvest brought to village center", hi: "फसल गांव के केंद्र में लाई जाती है" } },
            { icon: Users, title: { en: "Training", hi: "प्रशिक्षण" }, desc: { en: "Women trained in processing", hi: "महिलाओं को प्रसंस्करण में प्रशिक्षित किया जाता है" } },
            { icon: Factory, title: { en: "Value Add", hi: "मूल्य संवर्धन" }, desc: { en: "Making biscuits, flour, snacks", hi: "बिस्कुट, आटा, स्नैक्स बनाना" } },
            { icon: ArrowRight, title: { en: "Market", hi: "बाजार" }, desc: { en: "Sold directly to consumers", hi: "सीधे उपभोक्ताओं को बेचा जाता है" } }
        ]
    }
};

export default function WhyShreeAnnaPage() {
    const [role, setRole] = useState('farmer');
    const [showHelp, setShowHelp] = useState(false);
    const { language } = useLanguage();

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    // Helper to get text based on selected language
    const getTxt = (obj: any) => {
        if (!obj) return "";
        return obj[language] || obj['en'] || "";
    };

    // Full Page Text for TTS
    const getFullPageText = () => {
        return [
            getTxt(contentData.hero.title),
            getTxt(contentData.hero.subtitle),
            getTxt(contentData.videos.title),
            getTxt(contentData.videos.desc),
            ...contentData.videos.list.map(v => `${getTxt(v.title)}. ${getTxt(v.description)}`),
            getTxt(contentData.women.title),
            getTxt(contentData.women.desc),
            getTxt(contentData.process.title)
        ].join('. ');
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main>
                {/* 1. Hero Section */}
                <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img src="/hero-shree-anna.png" alt="Smiling woman farmer" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-white">
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="inline-block px-4 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 text-white font-medium">
                                    {getTxt(contentData.hero.title)}
                                </div>
                                <SpeakButton text={getFullPageText()} size="sm" variant="ghost" className="text-white hover:text-primary hover:bg-white/10" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
                                {getTxt(contentData.hero.subtitle)}
                            </h1>
                            <p className="text-lg text-gray-200 mb-6 max-w-2xl">
                                {getTxt(contentData.hero.tagline)}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* 2. MAIN CONTENT: Video Tutorials List */}
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 border-b pb-8">
                            <div className="max-w-3xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-sm font-bold uppercase tracking-wider">
                                        <Video className="w-4 h-4" /> Tutorials
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 flex items-center gap-3 text-foreground">
                                    {getTxt(contentData.videos.title)}
                                    <SpeakButton text={`${getTxt(contentData.videos.title)}. ${getTxt(contentData.videos.desc)}`} />
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {getTxt(contentData.videos.desc)}
                                </p>
                            </div>
                            <Button asChild size="lg" className="shrink-0 text-lg px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                                <Link href="/fpo/register">
                                    {getTxt(contentData.videos.cta)} <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>

                        {/* Video List Items (No Thumbnails, Just Text & Button) */}
                        <div className="grid gap-6">
                            {contentData.videos.list.map((video, idx) => {
                                const Icon = video.icon;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="hover:shadow-md transition-shadow border border-border">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                                    {/* Icon Box */}
                                                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <Icon className="w-8 h-8" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="grow space-y-3">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <h3 className="text-xl font-heading font-bold text-foreground">
                                                                {getTxt(video.title)}
                                                            </h3>
                                                            <SpeakButton text={`${getTxt(video.title)}. ${getTxt(video.description)}`} size="sm" variant="ghost" />
                                                        </div>
                                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                                            {getTxt(video.description)}
                                                        </p>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="shrink-0 self-center md:self-start pt-2">
                                                        <Button asChild variant="outline" className="gap-2 min-w-[140px] border-primary/20 hover:bg-primary/5 hover:text-primary">
                                                            <Link href={video.videoId.length > 11 ? video.videoId : `https://www.youtube.com/watch?v=${video.videoId}`} target="_blank">
                                                                <PlayCircle className="w-4 h-4" /> Watch Video
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 3. Women Empowerment Content */}
                <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-3xl overflow-hidden border-8 border-white/10 shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1596392135607-0624d7768560?q=80&w=800&auto=format&fit=crop" alt="Women working" className="w-full h-full object-cover" />
                            </motion.div>

                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                                    <Heart className="w-4 h-4 fill-white" /> {getTxt(contentData.women.subtitle)}
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
                                        {getTxt(contentData.women.title)}
                                    </h2>
                                    <SpeakButton variant="ghost" className="text-white hover:bg-white/20" text={`${getTxt(contentData.women.title)}. ${getTxt(contentData.women.desc)}`} />
                                </div>
                                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                                    {getTxt(contentData.women.desc)}
                                </p>
                                <ul className="space-y-4">
                                    {contentData.women.benefits.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-lg font-medium">{getTxt(item)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. How It Works - Process Flow */}
                <section className="py-20 bg-muted/40">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-16">
                            {getTxt(contentData.process.title)}
                        </h2>

                        <div className="relative">
                            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0"></div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
                                {contentData.process.steps.map((step, idx) => {
                                    const Icon = step.icon;
                                    return (
                                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-card p-6 rounded-xl border border-border shadow-sm text-center relative group hover:-translate-y-2 transition-transform duration-300">
                                            <div className="w-16 h-16 rounded-full bg-background border-4 border-primary text-primary flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <h3 className="font-heading font-bold text-lg mb-2">{getTxt(step.title)}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{getTxt(step.desc)}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer onOpenHelp={() => setShowHelp(true)} />
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
