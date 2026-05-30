// Shree Anna - Millets Marketplace Design Tokens
// Earthy, agricultural aesthetic with warm, human-centered colors

export const colors = {
  // Primary - Millet Gold (warm harvest tones)
  milletGold: {
    50: '#fefcf3',
    100: '#fdf8e1',
    200: '#faefc4',
    300: '#f6e29d',
    400: '#f0d06e',
    500: '#e9b93e', // Primary
    600: '#d49a1f',
    700: '#b17a1a',
    800: '#8f611d',
    900: '#76501c',
  },

  // Secondary - Earth Brown (soil, roots)
  earthBrown: {
    50: '#faf8f5',
    100: '#f3efe8',
    200: '#e5dcd0',
    300: '#d4c4af',
    400: '#bfa588',
    500: '#a98a6a', // Secondary
    600: '#9a7858',
    700: '#806249',
    800: '#695140',
    900: '#574436',
  },

  // Accent - Leaf Green (growth, freshness)
  leafGreen: {
    50: '#f3faf3',
    100: '#e3f5e3',
    200: '#c9e9c9',
    300: '#9fd69f',
    400: '#6dba6d',
    500: '#4a9d4a', // Accent
    600: '#3a7f3a',
    700: '#316431',
    800: '#2b512b',
    900: '#254425',
  },

  // Terracotta - Warning/Attention
  terracotta: {
    50: '#fdf6f3',
    100: '#fbe9e3',
    200: '#f9d5c9',
    300: '#f4b8a3',
    400: '#ec9072',
    500: '#e26b47', // Warning
    600: '#cf4f2d',
    700: '#ad3f24',
    800: '#8f3723',
    900: '#763223',
  },

  // Sky Blue - Info/Water
  skyBlue: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#b9e5fe',
    300: '#7cd3fd',
    400: '#36bdfa',
    500: '#0ca5eb', // Info
    600: '#0084c9',
    700: '#0169a3',
    800: '#065886',
    900: '#0b496f',
  },

  // Neutral - Warm grays
  warmGray: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
};

export const typography = {
  fontFamily: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
    display: "'Poppins', sans-serif",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// Millet types for the marketplace
export const milletTypes = [
  { id: 'foxtail', name: 'Foxtail Millet', nameHi: 'कंगनी', nameTe: 'కొర్రలు', nameKn: 'ನವಣೆ', nameTa: 'தினை', nameMr: 'काकणी' },
  { id: 'finger', name: 'Finger Millet (Ragi)', nameHi: 'रागी', nameTe: 'రాగి', nameKn: 'ರಾಗಿ', nameTa: 'கேழ்வரகு', nameMr: 'नाचणी' },
  { id: 'pearl', name: 'Pearl Millet (Bajra)', nameHi: 'बाजरा', nameTe: 'సజ్జ', nameKn: 'ಸಜ್ಜೆ', nameTa: 'கம்பு', nameMr: 'बाजरी' },
  { id: 'sorghum', name: 'Sorghum (Jowar)', nameHi: 'ज्वार', nameTe: 'జొన్నలు', nameKn: 'ಜೋಳ', nameTa: 'சோளம்', nameMr: 'ज्वारी' },
  { id: 'barnyard', name: 'Barnyard Millet', nameHi: 'सांवा', nameTe: 'ఊదలు', nameKn: 'ಊದಲು', nameTa: 'குதிரைவாலி', nameMr: 'भगर' },
  { id: 'kodo', name: 'Kodo Millet', nameHi: 'कोदो', nameTe: 'అరికెలు', nameKn: 'ಹಾರಕ', nameTa: 'வரகு', nameMr: 'कोद्रा' },
  { id: 'little', name: 'Little Millet', nameHi: 'कुटकी', nameTe: 'సామలు', nameKn: 'ಸಾಮೆ', nameTa: 'சாமை', nameMr: 'साव' },
  { id: 'proso', name: 'Proso Millet', nameHi: 'चीना', nameTe: 'వరిగలు', nameKn: 'ಬರಗು', nameTa: 'பனிவரகு', nameMr: 'वरी' },
  { id: 'browntop', name: 'Browntop Millet', nameHi: 'कोराले', nameTe: 'అండుకొర్రలు', nameKn: 'ಕೊರಳೆ', nameTa: 'பனிப்புல்', nameMr: 'कोराळे' },
];

// User roles
export const userRoles = {
  farmer: { id: 'farmer', name: 'Farmer', nameHi: 'किसान', nameTe: 'రైతు', nameKn: 'ರೈತ', nameTa: 'விவசாயி', nameMr: 'शेतकरी', icon: '👨‍🌾' },
  fpo: { id: 'fpo', name: 'FPO/SHG', nameHi: 'FPO/SHG', nameTe: 'FPO/SHG', nameKn: 'FPO/SHG', nameTa: 'FPO/SHG', nameMr: 'FPO/SHG', icon: '🏢' },
  processor: { id: 'processor', name: 'Processor', nameHi: 'प्रोसेसर', nameTe: 'ప్రాసెసర్', nameKn: 'ಪ್ರೊಸೆಸರ್', nameTa: 'செயலாக்கி', nameMr: 'प्रोसेसर', icon: '🏭' },
  buyer: { id: 'buyer', name: 'Buyer', nameHi: 'खरीदार', nameTe: 'కొనుగోలుదారు', nameKn: 'ಖರೀದಿದಾರ', nameTa: 'வாங்குபவர்', nameMr: 'खरेदीदार', icon: '🛒' },
  ksc: { id: 'ksc', name: 'Kisan Service Center', nameHi: 'किसान सेवा केंद्र', nameTe: 'కిసాన్ సేవా కేంద్రం', nameKn: 'ಕಿಸಾನ್ ಸೇವಾ ಕೇಂದ್ರ', nameTa: 'கிசான் சேவை மையம்', nameMr: 'किसान सेवा केंद्र', icon: '🏛️' },
};

// Supported languages
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

// Quality grades
export const qualityGrades = [
  { id: 'premium', name: 'Premium', nameHi: 'प्रीमियम', nameTe: 'ప్రీమియం', nameKn: 'ಪ್ರೀಮಿಯಂ', nameTa: 'பிரீமியம்', nameMr: 'प्रीमियम', color: 'milletGold' },
  { id: 'standard', name: 'Standard', nameHi: 'मानक', nameTe: 'ప్రామాణికం', nameKn: 'ಪ್ರಮಾಣಕ', nameTa: 'தரநிலை', nameMr: 'मानक', color: 'leafGreen' },
  { id: 'economy', name: 'Economy', nameHi: 'इकोनॉमी', nameTe: 'ఎకానమీ', nameKn: 'ಎಕಾನಮಿ', nameTa: 'பொருளாதாரம்', nameMr: 'इकॉनॉमी', color: 'earthBrown' },
];

// Animation variants for Framer Motion
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  flashCard: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
};
