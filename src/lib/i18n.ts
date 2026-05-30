// Internationalization utilities for Shree Anna

export type Language = 'en' | 'hi' | 'te' | 'kn' | 'ta' | 'mr';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.dashboard': 'Dashboard',
    'nav.schemes': 'Government Schemes',
    'nav.help': 'Help',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.whyShreeAnna': 'Why श्री अन्न',

    // Why Shree Anna Page
    'whyShreeAnna.title': 'Why Shree Anna?',
    'whyShreeAnna.subtitle': 'Rediscovering the Ancient Grains of India',
    'whyShreeAnna.hero.tagline': 'Good for you, good for the farmer, good for the planet.',

    'whyShreeAnna.importance.title': 'Why Millets Matter',
    'whyShreeAnna.importance.desc': 'Millets are a group of highly variable small-seeded grasses, widely grown around the world as cereal crops or grains. They are important crops in the semiarid tropics of Asia and Africa.',

    'whyShreeAnna.nutrition.title': 'Nutritional Powerhouse',
    'whyShreeAnna.nutrition.fiber': 'Rich in Dietary Fiber',
    'whyShreeAnna.nutrition.protein': 'High Protein Content',
    'whyShreeAnna.nutrition.minerals': 'Packed with Minerals (Iron, Calcium, Magnesium)',
    'whyShreeAnna.nutrition.glycemic': 'Low Glycemic Index (Good for Diabetics)',
    'whyShreeAnna.nutrition.comparison': 'Superior to Rice and Wheat in micronutrients.',

    'whyShreeAnna.health.title': 'Health Benefits',
    'whyShreeAnna.health.diabetes': 'Helps manage Diabetes',
    'whyShreeAnna.health.heart': 'Promotes Heart Health',
    'whyShreeAnna.health.weight': 'Aids in Weight Management',
    'whyShreeAnna.health.gut': 'Improves Gut Health',
    'whyShreeAnna.health.gluten': 'Naturally Gluten-Free',

    'whyShreeAnna.farmer.title': 'Benefits for Farmers',
    'whyShreeAnna.farmer.drought': 'Drought Resistant & Low Water Use',
    'whyShreeAnna.farmer.climate': 'Climate Resilient',
    'whyShreeAnna.farmer.economic': 'Better Returns with Value Addition',
    'whyShreeAnna.farmer.govt': 'Supported by Government Schemes',

    'whyShreeAnna.env.title': 'Environmental Impact',
    'whyShreeAnna.env.soil': 'Improves Soil Health',
    'whyShreeAnna.env.biodiversity': 'Supports Biodiversity',
    'whyShreeAnna.env.sustainable': 'Role in sustainable food systems',

    // Hero
    'hero.title': 'Shree Anna',
    'hero.subtitle': 'Millets Marketplace',
    'hero.tagline': 'Connecting farmers to buyers, one millet at a time',
    'hero.cta.farmer': 'I am a Farmer',
    'hero.cta.buyer': 'I am a Buyer',
    'hero.cta.fpo': 'FPO/SHG',

    // Features
    'features.voice': 'Voice-Enabled Listing',
    'features.voice.desc': 'Create listings using your voice in your language',
    'features.offline': 'Works Offline',
    'features.offline.desc': 'Use the app even without internet connection',
    'features.fair': 'Fair Pricing',
    'features.fair.desc': 'Transparent pricing with no middlemen',
    'features.trace': 'Full Traceability',
    'features.trace.desc': 'Track your millets from farm to table',

    // Farmer Dashboard
    'farmer.dashboard': 'Farmer Dashboard',
    'farmer.listings': 'My Listings',
    'farmer.offers': 'Offers Received',
    'farmer.create': 'Create Listing',
    'farmer.earnings': 'My Earnings',
    'farmer.weather': 'Weather',

    // Listing
    'listing.millet': 'Millet Type',
    'listing.quantity': 'Quantity (kg)',
    'listing.price': 'Price per kg',
    'listing.quality': 'Quality Grade',
    'listing.photos': 'Add Photos',
    'listing.location': 'Pickup Location',
    'listing.submit': 'Submit Listing',

    // Buyer
    'buyer.browse': 'Browse Millets',
    'buyer.filter': 'Filter',
    'buyer.sort': 'Sort By',
    'buyer.makeOffer': 'Make Offer',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.offline': 'You are offline',
    'common.sync': 'Syncing...',
    'common.success': 'Success!',
    'common.error': 'Error occurred',
  },

  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.marketplace': 'मार्केटप्लेस',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.schemes': 'सरकारी योजनाएं',
    'nav.help': 'मदद',
    'nav.login': 'लॉगिन',
    'nav.register': 'रजिस्टर',
    'nav.whyShreeAnna': 'श्री अन्न क्यों?',

    // Why Shree Anna Page
    'whyShreeAnna.title': 'श्री अन्न क्यों?',
    'whyShreeAnna.subtitle': 'भारत के प्राचीन अनाजों की पुनर्खोज',
    'whyShreeAnna.hero.tagline': 'आपके लिए अच्छा, किसान के लिए अच्छा, दुनिया के लिए अच्छा।',

    'whyShreeAnna.importance.title': 'मिलेट्स (श्री अन्न) क्यों महत्वपूर्ण हैं',
    'whyShreeAnna.importance.desc': 'मिलेट्स छोटे बीज वाली घासों का एक समूह है, जो मुख्य रूप से एशिया और अफ्रीका में अनाज के रूप में उगाए जाते हैं।',

    'whyShreeAnna.nutrition.title': 'पोषण का पावरहाउस',
    'whyShreeAnna.nutrition.fiber': 'फाइबर से भरपूर',
    'whyShreeAnna.nutrition.protein': 'उच्च प्रोटीन सामग्री',
    'whyShreeAnna.nutrition.minerals': 'खनिजों से भरपूर (लोहा, कैल्शियम, मैग्नीशियम)',
    'whyShreeAnna.nutrition.glycemic': 'कम ग्लाइसेमिक इंडेक्स (मधुमेह के लिए अच्छा)',
    'whyShreeAnna.nutrition.comparison': 'चावल और गेहूं की तुलना में बेहतर।',

    'whyShreeAnna.health.title': 'स्वास्थ्य लाभ',
    'whyShreeAnna.health.diabetes': 'मधुमेह प्रबंधन में सहायक',
    'whyShreeAnna.health.heart': 'हृदय स्वास्थ्य को बढ़ावा देता है',
    'whyShreeAnna.health.weight': 'वजन प्रबंधन में सहायक',
    'whyShreeAnna.health.gut': 'पाचन स्वास्थ्य में सुधार',
    'whyShreeAnna.health.gluten': 'प्राकृतिक रूप से लस मुक्त (Gluten-Free)',

    'whyShreeAnna.farmer.title': 'किसानों के लिए लाभ',
    'whyShreeAnna.farmer.drought': 'सूखा प्रतिरोधी और कम पानी की आवश्यकता',
    'whyShreeAnna.farmer.climate': 'जलवायु अनुकूल',
    'whyShreeAnna.farmer.economic': 'मूल्य संवर्धन के साथ बेहतर रिटर्न',
    'whyShreeAnna.farmer.govt': 'सरकारी योजनाओं द्वारा समर्थित',

    'whyShreeAnna.env.title': 'पर्यावरणीय प्रभाव',
    'whyShreeAnna.env.soil': 'मिट्टी के स्वास्थ्य में सुधार',
    'whyShreeAnna.env.biodiversity': 'जैव विविधता का समर्थन करता है',
    'whyShreeAnna.env.sustainable': 'सतत खाद्य प्रणालियों में भूमिका',

    // Hero
    'hero.title': 'श्री अन्न',
    'hero.subtitle': 'मिलेट्स मार्केटप्लेस',
    'hero.tagline': 'किसानों को खरीदारों से जोड़ना, एक मिलेट से',
    'hero.cta.farmer': 'मैं किसान हूं',
    'hero.cta.buyer': 'मैं खरीदार हूं',
    'hero.cta.fpo': 'FPO/SHG',

    // Features
    'features.voice': 'वॉइस-सक्षम लिस्टिंग',
    'features.voice.desc': 'अपनी भाषा में आवाज़ से लिस्टिंग बनाएं',
    'features.offline': 'ऑफलाइन काम करता है',
    'features.offline.desc': 'बिना इंटरनेट के भी ऐप का उपयोग करें',
    'features.fair': 'उचित मूल्य',
    'features.fair.desc': 'बिना बिचौलियों के पारदर्शी मूल्य',
    'features.trace': 'पूर्ण ट्रेसेबिलिटी',
    'features.trace.desc': 'खेत से थाली तक अपने मिलेट को ट्रैक करें',

    // Farmer Dashboard
    'farmer.dashboard': 'किसान डैशबोर्ड',
    'farmer.listings': 'मेरी लिस्टिंग',
    'farmer.offers': 'प्राप्त ऑफर',
    'farmer.create': 'लिस्टिंग बनाएं',
    'farmer.earnings': 'मेरी कमाई',
    'farmer.weather': 'मौसम',

    // Listing
    'listing.millet': 'मिलेट का प्रकार',
    'listing.quantity': 'मात्रा (किलो)',
    'listing.price': 'प्रति किलो कीमत',
    'listing.quality': 'गुणवत्ता ग्रेड',
    'listing.photos': 'फोटो जोड़ें',
    'listing.location': 'पिकअप स्थान',
    'listing.submit': 'लिस्टिंग सबमिट करें',

    // Buyer
    'buyer.browse': 'मिलेट ब्राउज़ करें',
    'buyer.filter': 'फ़िल्टर',
    'buyer.sort': 'क्रमबद्ध करें',
    'buyer.makeOffer': 'ऑफर दें',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.back': 'वापस',
    'common.next': 'आगे',
    'common.offline': 'आप ऑफलाइन हैं',
    'common.sync': 'सिंक हो रहा है...',
    'common.success': 'सफल!',
    'common.error': 'त्रुटि हुई',
  },

  te: {
    'nav.home': 'హోమ్',
    'nav.marketplace': 'మార్కెట్‌ప్లేస్',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.schemes': 'ప్రభుత్వ పథకాలు',
    'nav.help': 'సహాయం',
    'nav.login': 'లాగిన్',
    'nav.register': 'రిజిస్టర్',
    'nav.whyShreeAnna': 'శ్రీ అన్న ఎందుకు?',

    'hero.title': 'శ్రీ అన్న',
    'hero.subtitle': 'మిల్లెట్స్ మార్కెట్‌ప్లేస్',
    'hero.tagline': 'రైతులను కొనుగోలుదారులతో కలుపుతూ',
    'hero.cta.farmer': 'నేను రైతును',
    'hero.cta.buyer': 'నేను కొనుగోలుదారును',
    'hero.cta.fpo': 'FPO/SHG',
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.save': 'సేవ్',
    'common.cancel': 'రద్దు',
    'common.confirm': 'నిర్ధారించు',
    'common.back': 'వెనుక',
    'common.next': 'తదుపరి',
    'common.offline': 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు',
    'common.sync': 'సింక్ అవుతోంది...',
    'common.success': 'విజయం!',
    'common.error': 'లోపం సంభవించింది',

    // Why Shree Anna Page
    'whyShreeAnna.title': 'శ్రీ అన్న ఎందుకు?',
    'whyShreeAnna.subtitle': 'భారతదేశం యొక్క ప్రాచీన ధాన్యాలను పునరుద్ధరించడం',
    'whyShreeAnna.hero.tagline': 'మీ కోసం మంచిది, రైతుకు మంచిది, గ్రహానికి మంచిది.',

    'whyShreeAnna.importance.title': 'చిరుధాన్యాలు ఎందుకు ముఖ్యమైనవి',
    'whyShreeAnna.importance.desc': 'చిరుధాన్యాలు అనేవి చిన్న గింజల గడ్డి జాతికి చెందినవి, వీటిని ఆసియా మరియు ఆఫ్రికాలో ప్రధాన ఆహార పంటలుగా పండిస్తారు.',

    'whyShreeAnna.nutrition.title': 'పోషకాల గని',
    'whyShreeAnna.nutrition.fiber': 'పీచు పదార్థం సమృద్ధిగా ఉంటుంది',
    'whyShreeAnna.nutrition.protein': 'అధిక ప్రోటీన్ కంటెంట్',
    'whyShreeAnna.nutrition.minerals': 'ఖనిజాలతో నిండి ఉంటుంది (ఐరన్, కాల్షియం)',
    'whyShreeAnna.nutrition.glycemic': 'తక్కువ గ్లైసెమిక్ ఇండెక్స్ (మధుమేహానికి మంచిది)',
    'whyShreeAnna.nutrition.comparison': 'బియ్యం మరియు గోధుమల కంటే మెరుగైనది',

    'whyShreeAnna.health.title': 'ఆరోగ్య ప్రయోజనాలు',
    'whyShreeAnna.health.diabetes': 'మధుమేహాన్ని నియంత్రించడంలో సహాయపడుతుంది',
    'whyShreeAnna.health.heart': 'గుండె ఆరోగ్యాన్ని మెరుగుపరుస్తుంది',
    'whyShreeAnna.health.weight': 'బరువు తగ్గడంలో సహాయపడుతుంది',
    'whyShreeAnna.health.gut': 'జీర్ణ ఆరోగ్యాన్ని మెరుగుపరుస్తుంది',
    'whyShreeAnna.health.gluten': 'సహజంగా గ్లూటెన్ లేనిది',

    'whyShreeAnna.farmer.title': 'రైతులకు ప్రయోజనాలు',
    'whyShreeAnna.farmer.drought': 'కరువును తట్టుకుంటుంది & తక్కువ నీరు అవసరం',
    'whyShreeAnna.farmer.climate': 'వాతావరణ మార్పులను తట్టుకుంటుంది',
    'whyShreeAnna.farmer.economic': 'విలువ జోడింపుతో కూడిన మెరుగైన రాబడి',
    'whyShreeAnna.farmer.govt': 'ప్రభుత్వ పథకాల మద్దతు',

    'whyShreeAnna.env.title': 'పర్యావరణ ప్రభావం',
    'whyShreeAnna.env.soil': 'నేల ఆరోగ్యాన్ని మెరుగుపరుస్తుంది',
    'whyShreeAnna.env.biodiversity': 'జీవవైవిధ్యాన్ని కాపాడుతుంది',
    'whyShreeAnna.env.sustainable': 'స్థిరమైన ఆహార వ్యవస్థల్లో పాత్ర',
  },

  kn: {
    'nav.home': 'ಮನೆ',
    'nav.marketplace': 'ಮಾರುಕಟ್ಟೆ',
    'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'nav.schemes': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    'nav.help': 'ಸಹಾಯ',
    'nav.login': 'ಲಾಗಿನ್',
    'nav.register': 'ನೋಂದಣಿ',
    'nav.whyShreeAnna': 'ಶ್ರೀ ಅನ್ನ ಏಕೆ?',

    'hero.title': 'ಶ್ರೀ ಅನ್ನ',
    'hero.subtitle': 'ಮಿಲ್ಲೆಟ್ಸ್ ಮಾರುಕಟ್ಟೆ',
    'hero.tagline': 'ರೈತರನ್ನು ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತಿದೆ',
    'hero.cta.farmer': 'ನಾನು ರೈತ',
    'hero.cta.buyer': 'ನಾನು ಖರೀದಿದಾರ',
    'hero.cta.fpo': 'FPO/SHG',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.save': 'ಉಳಿಸಿ',
    'common.cancel': 'ರದ್ದುಮಾಡಿ',
    'common.confirm': 'ದೃಢೀಕರಿಸಿ',
    'common.back': 'ಹಿಂದೆ',
    'common.next': 'ಮುಂದೆ',
    'common.offline': 'ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ',
    'common.sync': 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...',
    'common.success': 'ಯಶಸ್ವಿ!',
    'common.error': 'ದೋಷ ಸಂಭವಿಸಿದೆ',

    // Why Shree Anna Page
    'whyShreeAnna.title': 'ಶ್ರೀ ಅನ್ನ ಏಕೆ?',
    'whyShreeAnna.subtitle': 'ಭಾರತದ ಪ್ರಾಚೀನ ಧಾನ್ಯಗಳನ್ನು ಮರುಶೋಧಿಸುವುದು',
    'whyShreeAnna.hero.tagline': 'ನಿಮಗೆ ಒಳ್ಳೆಯದು, ರೈತರಿಗೆ ಒಳ್ಳೆಯದು, ಗ್ರಹಕ್ಕೆ ಒಳ್ಳೆಯದು.',

    'whyShreeAnna.importance.title': 'ಸಿರಿಧಾನ್ಯಗಳು ಏಕೆ ಮುಖ್ಯ',
    'whyShreeAnna.importance.desc': 'ಸಿರಿಧಾನ್ಯಗಳು ಸಣ್ಣ ಬೀಜದ ಹುಲ್ಲುಗಳ ಗುಂಪಾಗಿದ್ದು, ಇದನ್ನು ಏಷ್ಯಾ ಮತ್ತು ಆಫ್ರಿಕಾದಾದ್ಯಂತ ಪ್ರಮುಖ ಆಹಾರ ಬೆಳೆಯಾಗಿ ಬೆಳೆಯಲಾಗುತ್ತದೆ.',

    'whyShreeAnna.nutrition.title': 'ಪೋಷಕಾಂಶಗಳ ಆಗರ',
    'whyShreeAnna.nutrition.fiber': 'ನಾರಿನಂಶದಿಂದ ಕೂಡಿದೆ',
    'whyShreeAnna.nutrition.protein': 'ಹೆಚ್ಚಿನ ಪ್ರೋಟೀನ್',
    'whyShreeAnna.nutrition.minerals': 'ಖನಿಜಗಳಿಂದ ಸಮೃದ್ಧವಾಗಿದೆ',
    'whyShreeAnna.nutrition.glycemic': 'ಕಡಿಮೆ ಗ್ಲೈಸೆಮಿಕ್ ಇಂಡೆಕ್ಸ್ (ಮಧುಮೇಹಿಗಳಿಗೆ ಒಳ್ಳೆಯದು)',
    'whyShreeAnna.nutrition.comparison': 'ಅಕ್ಕಿ ಮತ್ತು ಗೋಧಿಗಳಿಗಿಂತ ಉತ್ತಮ',

    'whyShreeAnna.health.title': 'ಆರೋಗ್ಯ ಪ್ರಯೋಜನಗಳು',
    'whyShreeAnna.health.diabetes': 'ಮಧುಮೇಹ ನಿರ್ವಹಣೆಗೆ ಸಹಕಾರಿ',
    'whyShreeAnna.health.heart': 'ಹೃದಯ ಆರೋಗ್ಯವನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ',
    'whyShreeAnna.health.weight': 'ತೂಕ ಇಳಿಕೆಗೆ ಸಹಕಾರಿ',
    'whyShreeAnna.health.gut': 'ಜೀರ್ಣಕ್ರಿಯೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ',
    'whyShreeAnna.health.gluten': 'ನೈಸರ್ಗಿಕವಾಗಿ ಗ್ಲುಟನ್ ಮುಕ್ತ',

    'whyShreeAnna.farmer.title': 'ರೈತರಿಗೆ ಪ್ರಯೋಜನಗಳು',
    'whyShreeAnna.farmer.drought': 'ಬರ ಸಹಿಷ್ಣು ಮತ್ತು ಕಡಿಮೆ ನೀರಿನ ಬಳಕೆ',
    'whyShreeAnna.farmer.climate': 'ಹವಾಮಾನ ಸ್ಥಿತಿಸ್ಥಾಪಕ',
    'whyShreeAnna.farmer.economic': 'ಮೌಲ್ಯವರ್ಧನೆಯೊಂದಿಗೆ ಉತ್ತಮ ಆದಾಯ',
    'whyShreeAnna.farmer.govt': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಂದ ಬೆಂಬಲ',

    'whyShreeAnna.env.title': 'ಪರಿಸರ ಪರಿಣಾಮ',
    'whyShreeAnna.env.soil': 'ಮಣ್ಣಿನ ಆರೋಗ್ಯವನ್ನು ಸುಧಾರಿಸುತ್ತದೆ',
    'whyShreeAnna.env.biodiversity': 'ಜೀವವೈವಿಧ್ಯತೆಯನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ',
    'whyShreeAnna.env.sustainable': 'ಸುಸ್ಥಿರ ಆಹಾರ ವ್ಯವಸ್ಥೆಗಳಲ್ಲಿ ಪಾತ್ರ',
  },

  ta: {
    'nav.home': 'முகப்பு',
    'nav.marketplace': 'சந்தை',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.schemes': 'அரசு திட்டங்கள்',
    'nav.help': 'உதவி',
    'nav.login': 'உள்நுழைய',
    'nav.register': 'பதிவு',
    'nav.whyShreeAnna': 'ஏன் ஸ்ரீ அன்னா?',

    'hero.title': 'ஸ்ரீ அன்னா',
    'hero.subtitle': 'தினை சந்தை',
    'hero.tagline': 'விவசாயிகளை வாங்குபவர்களுடன் இணைக்கிறது',
    'hero.cta.farmer': 'நான் விவசாயி',
    'hero.cta.buyer': 'நான் வாங்குபவர்',
    'hero.cta.fpo': 'FPO/SHG',
    'common.loading': 'ஏற்றுகிறது...',
    'common.save': 'சேமி',
    'common.cancel': 'ரத்து',
    'common.confirm': 'உறுதிப்படுத்து',
    'common.back': 'பின்',
    'common.next': 'அடுத்து',
    'common.offline': 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்',
    'common.sync': 'ஒத்திசைவுகிறது...',
    'common.success': 'வெற்றி!',
    'common.error': 'பிழை ஏற்பட்டது',

    // Why Shree Anna Page
    'whyShreeAnna.title': 'ஏன் ஸ்ரீ அன்னா?',
    'whyShreeAnna.subtitle': 'இந்தியாவின் பண்டைய தானியங்களை மீட்டெடுத்தல்',
    'whyShreeAnna.hero.tagline': 'உங்களுக்கும் நல்லது, விவசாயிக்கும் நல்லது, பூமிக்கும் நல்லது.',

    'whyShreeAnna.importance.title': 'சிறுதானியங்கள் ஏன் அவசியம்',
    'whyShreeAnna.importance.desc': 'சிறுதானியங்கள் சிறிய விதை கொண்ட புல் வகைகளாகும். இவை ஆசியா மற்றும் ஆப்பிரிக்காவில் முக்கிய உணவுப் பயிராக வளர்க்கப்படுகின்றன.',

    'whyShreeAnna.nutrition.title': 'ஊட்டச்சத்து களஞ்சியம்',
    'whyShreeAnna.nutrition.fiber': 'நார்ச்சத்து மிக்கது',
    'whyShreeAnna.nutrition.protein': 'அதிக புரதம் கொண்டது',
    'whyShreeAnna.nutrition.minerals': 'கனிமங்கள் நிறைந்தது',
    'whyShreeAnna.nutrition.glycemic': 'குறைந்த கிளைசெமிக் குறியீடு (நீரிழிவுக்கு நல்லது)',
    'whyShreeAnna.nutrition.comparison': 'அரிசி மற்றும் கோதுமையை விட சிறந்தது',

    'whyShreeAnna.health.title': 'சுகாதார நன்மைகள்',
    'whyShreeAnna.health.diabetes': 'நீரிழிவு நோயைக் கட்டுப்படுத்த உதவுகிறது',
    'whyShreeAnna.health.heart': 'இதய ஆரோக்கியத்தை மேம்படுத்துகிறது',
    'whyShreeAnna.health.weight': 'எடை குறைப்பில் உதவுகிறது',
    'whyShreeAnna.health.gut': 'செரிமானத்தை சீராக்குகிறது',
    'whyShreeAnna.health.gluten': 'இயற்கையாகவே குளுட்டன் அற்றது',

    'whyShreeAnna.farmer.title': 'விவசாயிகளுக்கான நன்மைகள்',
    'whyShreeAnna.farmer.drought': 'வறட்சியைத் தாங்கும் மற்றும் குறைந்த நீர் தேவை',
    'whyShreeAnna.farmer.climate': 'காலநிலை மாற்றம் தாங்கும் திறன்',
    'whyShreeAnna.farmer.economic': 'மதிப்பு கூட்டல் மூலம் சிறந்த வருமானம்',
    'whyShreeAnna.farmer.govt': 'அரசு திட்டங்கள் மூலம் ஆதரவு',

    'whyShreeAnna.env.title': 'சுற்றுச்சூழல் தாக்கம்',
    'whyShreeAnna.env.soil': 'மண் வளத்தை மேம்படுத்துகிறது',
    'whyShreeAnna.env.biodiversity': 'பல்லுயிர் பெருக்கத்தை ஆதரிக்கிறது',
    'whyShreeAnna.env.sustainable': 'நிலையான உணவு அமைப்புகளில் பங்கு',
  },

  mr: {
    'nav.home': 'होम',
    'nav.marketplace': 'मार्केटप्लेस',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.schemes': 'सरकारी योजना',
    'nav.help': 'मदत',
    'nav.login': 'लॉगिन',
    'nav.register': 'नोंदणी',
    'nav.whyShreeAnna': 'श्री अन्न का?',

    'hero.title': 'श्री अन्न',
    'hero.subtitle': 'मिलेट्स मार्केटप्लेस',
    'hero.tagline': 'शेतकऱ्यांना खरेदीदारांशी जोडतो',
    'hero.cta.farmer': 'मी शेतकरी आहे',
    'hero.cta.buyer': 'मी खरेदीदार आहे',
    'hero.cta.fpo': 'FPO/SHG',
    'common.loading': 'लोड होत आहे...',
    'common.save': 'जतन करा',
    'common.cancel': 'रद्द करा',
    'common.confirm': 'पुष्टी करा',
    'common.back': 'मागे',
    'common.next': 'पुढे',
    'common.offline': 'तुम्ही ऑफलाइन आहात',
    'common.sync': 'सिंक होत आहे...',
    'common.success': 'यशस्वी!',
    'common.error': 'त्रुटी आली',

    // Why Shree Anna Page
    'whyShreeAnna.title': 'श्री अन्न का?',
    'whyShreeAnna.subtitle': 'भारताच्या प्राचीन धान्यांचा पुनर्शोध',
    'whyShreeAnna.hero.tagline': 'तुमच्यासाठी चांगले, शेतकऱ्यासाठी चांगले, ग्रहासाठी चांगले.',

    'whyShreeAnna.importance.title': 'मिलेट्स का महत्त्वाचे आहेत',
    'whyShreeAnna.importance.desc': 'मिलेट्स हे लहान बियाण्यांच्या गवतांचा समूह आहे, जो आशिया आणि आफ्रिकेत प्रमुख अन्नधान्य म्हणून पिकवला जातो.',

    'whyShreeAnna.nutrition.title': 'पोषणाचे पॉवरहाऊस',
    'whyShreeAnna.nutrition.fiber': 'फायबरने समृद्ध',
    'whyShreeAnna.nutrition.protein': 'उच्च प्रथिने',
    'whyShreeAnna.nutrition.minerals': 'खनिजांनी समृद्ध',
    'whyShreeAnna.nutrition.glycemic': 'कमी ग्लिसेमिक इंडेक्स (मधुमेहासाठी चांगले)',
    'whyShreeAnna.nutrition.comparison': 'तांदूळ आणि गव्हापेक्षा श्रेष्ठ',

    'whyShreeAnna.health.title': 'आरोग्य फायदे',
    'whyShreeAnna.health.diabetes': 'मधुमेह नियंत्रित करण्यास मदत करते',
    'whyShreeAnna.health.heart': 'हृदय आरोग्य सुधारते',
    'whyShreeAnna.health.weight': 'वजन कमी करण्यास मदत करते',
    'whyShreeAnna.health.gut': 'पचन सुधारते',
    'whyShreeAnna.health.gluten': 'नैसर्गिकरित्या ग्लूटेन-मुक्त',

    'whyShreeAnna.farmer.title': 'शेतकऱ्यांसाठी फायदे',
    'whyShreeAnna.farmer.drought': 'दुष्काळ सहिष्णु आणि कमी पाण्याची गरज',
    'whyShreeAnna.farmer.climate': 'हवामान लवचिक',
    'whyShreeAnna.farmer.economic': 'मूल्यवर्धनासह चांगले उत्पन्न',
    'whyShreeAnna.farmer.govt': 'सरकारी योजनांद्वारे समर्थित',

    'whyShreeAnna.env.title': 'पर्यावरणीय परिणाम',
    'whyShreeAnna.env.soil': 'मातीचे आरोग्य सुधारते',
    'whyShreeAnna.env.biodiversity': 'जैवविविधतेला समर्थन देते',
    'whyShreeAnna.env.sustainable': 'शाश्वत अन्न प्रणालींमध्ये भूमिका',
  },
};

export function t(key: string, lang: Language = 'en'): string {
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}
