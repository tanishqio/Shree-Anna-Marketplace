"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Wheat,
    Sprout,
    Calendar,
    CloudRain,
    Sun,
    TrendingUp,
    Package,
    Award,
    ChevronRight,
    BookOpen,
    Leaf,
    Timer,
    IndianRupee,
    Users,
    ShieldCheck,
    Factory,
    Store,
    CheckCircle,
    Info,
    Droplets,
    Bug
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useLanguage } from '@/lib/hooks/useLanguage';

// --- Data Definitions ---

// Millet crops
const milletCrops = [
    {
        id: 'pearl_millet', name: 'Pearl Millet (Bajra)', nameHi: 'बाजरा', emoji: '🌾',
        sowingKharif: { en: 'June–July (after first monsoon)', hi: 'जून–जुलाई (पहली बारिश के बाद)' },
        sowingSummer: { en: 'Feb–March (irrigated)', hi: 'फरवरी–मार्च (सिंचित)' },
        duration: { en: '80-95 days', hi: '80-95 दिन' },
        seeds: ['ICTP 8203', 'HHB 67 Improved', '86M64', 'Pioneer 86M70'],
        biofortified: { en: 'Zinc-rich varieties available', hi: 'जिंक-समृद्ध किस्में उपलब्ध' },
    },
    {
        id: 'finger_millet', name: 'Finger Millet (Ragi)', nameHi: 'रागी', emoji: '🌾',
        sowingKharif: { en: 'June–July (rainfed)', hi: 'जून–जुलाई (वर्षा आधारित)' },
        sowingSummer: { en: 'Aug–Sept (irrigated)', hi: 'अगस्त–सितंबर (सिंचित)' },
        duration: { en: '100-130 days', hi: '100-130 दिन' },
        seeds: ['GPU 28', 'GPU 48', 'GPU 67', 'MR 1'],
        biofortified: { en: 'Iron-rich varieties available', hi: 'आयरन-समृद्ध किस्में उपलब्ध' },
    },
    {
        id: 'sorghum', name: 'Sorghum (Jowar)', nameHi: 'ज्वार', emoji: '🌾',
        sowingKharif: { en: 'June–July', hi: 'जून–जुलाई' },
        sowingRabi: { en: 'Sept–Oct', hi: 'सितंबर–अक्टूबर' },
        duration: { en: '110-120 days', hi: '110-120 दिन' },
        seeds: ['CSV 15', 'CSV 20', 'CSH 14', 'CSH 16'],
        biofortified: { en: 'High-iron varieties', hi: 'उच्च आयरन किस्में' },
    },
    {
        id: 'foxtail_millet', name: 'Foxtail Millet', nameHi: 'कंगनी', emoji: '🌾',
        sowingKharif: { en: 'June–August', hi: 'जून–अगस्त' },
        duration: { en: '70-90 days', hi: '70-90 दिन' },
        seeds: ['SiA 3085', 'SiA 3156', 'Prasad'],
        biofortified: { en: 'High-fiber varieties', hi: 'उच्च फाइबर किस्में' },
    },
    {
        id: 'little_millet', name: 'Little Millet', nameHi: 'कुटकी', emoji: '🌾',
        sowingKharif: { en: 'June–July', hi: 'जून–जुलाई' },
        duration: { en: '75-85 days', hi: '75-85 दिन' },
        seeds: ['Paiyur 2', 'OLM 203', 'JK 8'],
        biofortified: { en: 'Nutrient-dense', hi: 'पोषक तत्वों से भरपूर' },
    },
];

// Pulse crops
const pulseCrops = [
    {
        id: 'chana', name: 'Chickpea (Chana)', nameHi: 'चना', emoji: '🫘',
        sowingRabi: { en: 'Oct–Nov', hi: 'अक्टूबर–नवंबर' },
        duration: { en: '90-120 days', hi: '90-120 दिन' },
        seeds: ['JG 11', 'JG 14', 'Pusa 362'],
    },
    {
        id: 'toor_dal', name: 'Pigeon Pea (Tur/Arhar)', nameHi: 'तूर/अरहर', emoji: '🫘',
        sowingKharif: { en: 'June–July', hi: 'जून–जुलाई' },
        duration: { en: '150-180 days', hi: '150-180 दिन' },
        seeds: ['ICPH 2740 (Hybrid)', 'ICPL 87119', 'Asha'],
    },
    {
        id: 'moong', name: 'Green Gram (Moong)', nameHi: 'मूंग', emoji: '🫘',
        sowingKharif: { en: 'June–July', hi: 'जून–जुलाई' },
        duration: { en: '60-75 days', hi: '60-75 दिन' },
        seeds: ['SML 668', 'IPM 205-7', 'Pusa Vishal'],
    },
    {
        id: 'urad', name: 'Black Gram (Urad)', nameHi: 'उड़द', emoji: '🫘',
        sowingKharif: { en: 'June–July', hi: 'जून–जुलाई' },
        duration: { en: '70-90 days', hi: '70-90 दिन' },
        seeds: ['PU 31', 'LBG 752', 'T9'],
    },
    {
        id: 'masoor', name: 'Lentil (Masoor)', nameHi: 'मसूर', emoji: '🫘',
        sowingRabi: { en: 'Oct–Nov', hi: 'अक्टूबर–नवंबर' },
        duration: { en: '100-120 days', hi: '100-120 दिन' },
        seeds: ['L 4594', 'IPL 316', 'Pusa Masoor'],
    },
];

// Growth stages data map
const growthStagesData: Record<string, any[]> = {
    // Millets (General / Specific mappings if needed, here treating basic millets similarly for MVP)
    pearl_millet: [
        { stage: { en: 'Land Prep', hi: 'भूमि तैयारी' }, days: { en: 'Week -2 to 0', hi: 'सप्ताह -2 से 0' }, icon: Sprout, actions: { en: ['Fine seedbed', 'Apply FYM', 'Ridges & furrows'], hi: ['खेत की जुताई', 'गोबर खाद', 'मेड़ और नालियां बनाएं'] } },
        { stage: { en: 'Sowing', hi: 'बुवाई' }, days: { en: 'Day 0', hi: 'दिन 0' }, icon: Wheat, actions: { en: ['Treat seeds with Thiram', 'Depth: 2-3 cm', 'Row spacing: 45cm'], hi: ['थीरम से बीज उपचार', 'गहराई: 2-3 सेमी', 'कतार दूरी: 45 सेमी'] } },
        { stage: { en: 'Tillering', hi: 'कल्ले निकलना' }, days: { en: 'Days 20-35', hi: 'दिन 20-35' }, icon: Leaf, actions: { en: ['Thinning', 'Weeding', 'Top dress Urea'], hi: ['विरलन (Thinning)', 'निराई-गुड़ाई', 'यूरिया का छिड़काव'] } },
        { stage: { en: 'Flowering', hi: 'फूल आना' }, days: { en: 'Days 40-55', hi: 'दिन 40-55' }, icon: Sun, actions: { en: ['Critical Irrigation', 'Protect from heat'], hi: ['महत्वपूर्ण सिंचाई', 'लू से बचाव करें'] } },
        { stage: { en: 'Maturity', hi: 'परिपक्वता' }, days: { en: 'Days 80-90', hi: 'दिन 80-90' }, icon: Package, actions: { en: ['Harvest earheads', 'Dry to 12% moisture'], hi: ['बालियों की कटाई', '12% नमी तक सुखाएं'] } },
    ],
    // Default millet fallback
    default_millet: [
        { stage: { en: 'Sowing', hi: 'बुवाई' }, days: { en: 'Day 0', hi: 'दिन 0' }, icon: Wheat, actions: { en: ['Line sowing prefered', 'Seed treatment mandatory'], hi: ['कतार में बुवाई करें', 'बीज उपचार अनिवार्य'] } },
        { stage: { en: 'Vegetative', hi: 'वनस्पति वृद्धि' }, days: { en: 'Days 15-35', hi: 'दिन 15-35' }, icon: Leaf, actions: { en: ['Gap filling', 'Hand weeding'], hi: ['नागे भरें', 'हाथ से निराई'] } },
        { stage: { en: 'Reproductive', hi: 'फूल/बाली' }, days: { en: 'Days 40-60', hi: 'दिन 40-60' }, icon: Sun, actions: { en: ['Maintain soil moisture', 'Watch for shoot fly'], hi: ['नमी बनाए रखें', 'तना मक्खी पर नजर रखें'] } },
        { stage: { en: 'Harvest', hi: 'कटाई' }, days: { en: 'Maturity', hi: 'परिपक्वता' }, icon: Package, actions: { en: ['Harvest when grains hard', 'Thresh and clean'], hi: ['दाने सख्त होने पर कटाई', 'मड़ाई और सफाई'] } },
    ],
    // Pulses
    chana: [
        { stage: { en: 'Sowing', hi: 'बुवाई' }, days: { en: 'Oct-Nov', hi: 'अक्टूबर-नवंबर' }, icon: Sprout, actions: { en: ['Seed treatment with Rhizobium', 'Deep ploughing'], hi: [' राइजोबियम से उपचार', 'गहरी जुताई करें'] } },
        { stage: { en: 'Vegetative', hi: 'पौध वृद्धि' }, days: { en: 'Days 30-45', hi: 'दिन 30-45' }, icon: Leaf, actions: { en: ['Nipping (top removal)', 'Interculture'], hi: ['शीर्ष शाखा तोड़ना (Nipping)', 'निराई-गुड़ाई'] } },
        { stage: { en: 'Flowering', hi: 'फूल आना' }, days: { en: 'Days 50-70', hi: 'दिन 50-70' }, icon: Sun, actions: { en: ['One irrigation if dry', 'Monitor Pod Borer'], hi: ['जरूरत हो तो एक सिंचाई', 'फली छेदक पर नजर'] } },
        { stage: { en: 'Pod Filling', hi: 'दाना भरना' }, days: { en: 'Days 75-90', hi: 'दिन 75-90' }, icon: Droplets, actions: { en: ['Avoid water stress', 'Bird perches for pest control'], hi: ['पानी की कमी न होने दें', 'कीट नियंत्रण हेतु पक्षी मचान'] } },
        { stage: { en: 'Harvest', hi: 'कटाई' }, days: { en: 'Days 100-110', hi: 'दिन 100-110' }, icon: Package, actions: { en: ['Harvest when plant turns yellow', 'Dry for 5-7 days'], hi: ['पौधा पीला पड़ने पर कटाई', '5-7 दिन धूप में सुखाएं'] } },
    ],
    // Default Pulse fallback
    default_pulse: [
        { stage: { en: 'Sowing', hi: 'बुवाई' }, days: { en: 'Day 0', hi: 'दिन 0' }, icon: Sprout, actions: { en: ['Treat with Rhizobium', 'Ensure field moisture'], hi: ['राइजोबियम से उपचार', 'खेत में नमी सुनिश्चित करें'] } },
        { stage: { en: 'Branching', hi: 'शाखाएं' }, days: { en: 'Days 25-40', hi: 'दिन 25-40' }, icon: Leaf, actions: { en: ['Weeding is critical', 'Thinning if crowded'], hi: ['निराई बहुत जरूरी है', 'घने पौधों को कम करें'] } },
        { stage: { en: 'Flowering', hi: 'फूल' }, days: { en: 'Days 45-60', hi: 'दिन 45-60' }, icon: Sun, actions: { en: ['Light irrigation', 'Pheromone traps for pests'], hi: ['हल्की सिंचाई', 'कीटों के लिए फेरोमोन ट्रैप'] } },
        { stage: { en: 'Podding', hi: 'फली' }, days: { en: 'Days 65-80', hi: 'दिन 65-80' }, icon: Bug, actions: { en: ['Check for pod borer', 'Spray Neem oil'], hi: ['फली छेदक की जांच', 'नीम तेल का छिड़काव'] } },
    ]
};

// Value chain tips
const valueChainTips = [
    {
        title: { en: 'Join FPO/SHG', hi: 'FPO/SHG से जुड़ें' }, icon: Users, impact: '+10-30%',
        desc: { en: 'Better prices, bulk procurement, quality certification access', hi: 'बेहतर दाम, थोक खरीद, गुणवत्ता प्रमाणन' }
    },
    {
        title: { en: 'Primary Processing', hi: 'प्राथमिक प्रसंस्करण' }, icon: Factory, impact: '+25-100%',
        desc: { en: 'Cleaning, grading, dehusking, flour grinding, packaging', hi: 'सफाई, ग्रेडिंग, छिलका निकालना, आटा पीसना, पैकेजिंग' }
    },
    {
        title: { en: 'Sell Certified', hi: 'प्रमाणित बेचें' }, icon: ShieldCheck, impact: 'Premium',
        desc: { en: 'FSSAI certified, low-moisture, traceable produce', hi: 'FSSAI प्रमाणित, कम नमी, ट्रेस करने योग्य उत्पाद' }
    },
    {
        title: { en: 'Make Products', hi: 'उत्पाद बनाएं' }, icon: Store, impact: '3-6x',
        desc: { en: 'Ragi malt, millet ladoos, ready-to-cook mixes', hi: 'रागी माल्ट, मिलेट लड्डू, रेडी-टू-कुक मिक्स' }
    },
];

export default function AdvisoryPage() {
    const [role, setRole] = useState('farmer');
    const { language } = useLanguage();
    const isHi = language === 'hi';
    const [selectedCropId, setSelectedCropId] = useState<string | null>(null);

    // Helpers
    const getText = (obj: { en: string; hi: string } | string) => typeof obj === 'string' ? obj : (isHi ? obj.hi : obj.en);
    const getActions = (obj: { en: string[]; hi: string[] }) => isHi ? obj.hi : obj.en;

    // Determine season and default crop
    useEffect(() => {
        const month = new Date().getMonth(); // 0-11
        // Oct(9) - Feb(1) -> Rabi -> Chana
        // Mar(2) - May(4) -> Summer -> Moong
        // June(5) - Sep(8) -> Kharif -> Bajra
        let defaultCrop = 'pearl_millet'; // Default fallback
        if (month >= 9 || month <= 1) {
            defaultCrop = 'chana'; // Rabi
        } else if (month >= 2 && month <= 4) {
            defaultCrop = 'moong'; // Summer
        } else {
            defaultCrop = 'pearl_millet'; // Kharif
        }
        setSelectedCropId(defaultCrop);
    }, []);

    // Helper to find crop details
    const allCrops = [...milletCrops, ...pulseCrops];
    const selectedCropData = allCrops.find(c => c.id === selectedCropId);

    // Get growth stages: try specific ID, else determine if it's pulse or millet for generic fallback
    const getGrowthStages = () => {
        if (!selectedCropId) return [];
        if (growthStagesData[selectedCropId]) return growthStagesData[selectedCropId];

        // Fallback logic
        const isPulse = pulseCrops.some(p => p.id === selectedCropId);
        return isPulse ? growthStagesData['default_pulse'] : growthStagesData['default_millet'];
    };

    const currentStages = getGrowthStages();

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-8 max-w-6xl">

                {/* Hero / Header Section - Larger Typography */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-heading leading-tight">
                                {isHi ? 'कृषि सलाह एवं मार्गदर्शिका' : 'Farming Advisory & Guide'}
                            </h1>
                            <p className="text-lg text-muted-foreground mt-1 font-medium">
                                {isHi ? 'विशेषज्ञों द्वारा अनुशंसित आधुनिक खेती के तरीके' : 'Expert-recommended modern farming practices'}
                            </p>
                        </div>
                    </div>

                    {/* Season / Weather Card - Keeping it relevant but styling it cleaner */}
                    <div className="bg-white border text-card-foreground rounded-2xl p-6 shadow-sm border-l-4 border-l-primary flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
                                {isHi ? 'वर्तमान मौसम सुझाव' : 'Current Season Advisory'}
                                <Badge variant="secondary" className="px-3 py-1 font-normal bg-primary/10 text-primary border-0">
                                    {new Date().getMonth() >= 5 && new Date().getMonth() <= 9 ? (isHi ? 'खरीफ' : 'Kharif') :
                                        new Date().getMonth() >= 9 || new Date().getMonth() <= 1 ? (isHi ? 'रबी' : 'Rabi') : (isHi ? 'ग्रीष्म' : 'Summer')}
                                </Badge>
                            </h2>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                {new Date().getMonth() >= 5 && new Date().getMonth() <= 9
                                    ? (isHi ? 'यह समय बाजरा, ज्वार और खरीफ दालों की बुवाई और शुरुआती देखभाल के लिए उपयुक्त है।' : 'Ideal time for sowing and early care of Bajra, Jowar, and Kharif pulses.')
                                    : new Date().getMonth() >= 9 || new Date().getMonth() <= 1
                                        ? (isHi ? 'चना और मसूर जैसी रबी फसलों के लिए ठंडी जलवायु अनुकूल है। नमी बनाए रखें।' : 'Cool climate favored for Rabi crops like Chana and Masoor. Conserve soil moisture.')
                                        : (isHi ? 'ग्रीष्मकालीन मूंग और सिंचित फसलों के लिए समय। नियमित सिंचाई आवश्यक है।' : 'Time for Summer Moong and irrigated crops. Regular irrigation is essential.')}
                            </p>
                        </div>
                        <div className="hidden md:block w-px h-16 bg-border"></div>
                        <div className="flex gap-6 text-center">
                            <div>
                                <CloudRain className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                                <p className="text-xs font-medium text-muted-foreground">{isHi ? 'सिंचाई' : 'Irrigation'}</p>
                                <p className="font-semibold text-sm">{isHi ? 'सामान्य' : 'Normal'}</p>
                            </div>
                            <div>
                                <Sun className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                                <p className="text-xs font-medium text-muted-foreground">{isHi ? 'तापमान' : 'Temp'}</p>
                                <p className="font-semibold text-sm">24°C - 32°C</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Split Layout */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left: Interactive Crop Guide */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold font-heading text-foreground">
                                {isHi ? 'फसल विकास चरण' : 'Crop Growth Stages'}
                            </h2>

                            {/* Crop Selector Dropdown */}
                            <div className="w-[200px]">
                                <Select value={selectedCropId || ''} onValueChange={setSelectedCropId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Crop" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCrops.map(crop => (
                                            <SelectItem key={crop.id} value={crop.id}>
                                                <span className="flex items-center gap-2">
                                                    <span>{crop.emoji}</span>
                                                    {isHi ? crop.nameHi : crop.name.split('(')[0].trim()}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Selected Crop Header */}
                        {selectedCropData && (
                            <div className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                            {isHi ? selectedCropData.nameHi : selectedCropData.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                            {selectedCropData.duration && (
                                                <span className="flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded-md text-foreground">
                                                    <Timer className="w-3.5 h-3.5" /> {getText(selectedCropData.duration)}
                                                </span>
                                            )}
                                            {selectedCropData.sowingKharif && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" /> {isHi ? 'खरीफ' : 'Kharif'}: {getText(selectedCropData.sowingKharif)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{isHi ? 'अनुशंसित बीज' : 'Recommended Seeds'}</p>
                                        <div className="flex gap-1 justify-end flex-wrap max-w-[200px]">
                                            {selectedCropData.seeds.slice(0, 3).map(seed => (
                                                <Badge key={seed} variant="outline" className="text-[10px] bg-muted/50">{seed}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Growth Timeline */}
                        <div className="space-y-6 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
                            {currentStages.map((stage, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative pl-20"
                                >
                                    {/* Timeline Node */}
                                    <div className="absolute left-0 w-16 flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-primary/20 flex items-center justify-center shadow-sm z-10">
                                            <stage.icon className="w-8 h-8 text-primary" />
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-bold text-foreground">
                                                {getText(stage.stage)}
                                            </h4>
                                            <Badge variant="secondary" className="text-xs px-2">{getText(stage.days)}</Badge>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {getActions(stage.actions).map((action: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground/90">
                                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                                    <span>{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Support & Tips Sidebar */}
                    <div className="lg:w-[350px] space-y-8">

                        {/* Yield Tips */}
                        <div className="bg-[#FFF8F0] border border-orange-100 rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-900">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                                {isHi ? 'उपज बढ़ाने के उपाय' : 'Pro Tips for Yield'}
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    { tip: isHi ? 'प्रमाणित हाइब्रिड बीजों का ही प्रयोग करें' : 'Use certified hybrid seeds only', sub: isHi ? '30% तक अधिक उपज' : '+30% yield potential' },
                                    { tip: isHi ? 'बुवाई से पहले बीज उपचार (Seed Treatment) जरूर करें' : 'Seed treatment is mandatory before sowing', sub: isHi ? 'फफूंद रोगों से बचाव' : 'Prevents fungal diseases' },
                                    { tip: isHi ? 'मिट्टी जांच के आधार पर ही यूरिया/DAP डालें' : 'Apply Urea/DAP based on Soil Health Card', sub: isHi ? 'लागत कम, मिट्टी सुरक्षित' : 'Saves cost, protects soil' },
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-foreground text-sm leading-snug">{item.tip}</p>
                                            <p className="text-xs text-orange-700/80 mt-1">{item.sub}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Value Chain / Profit */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-green-600" />
                                {isHi ? 'आय बढ़ाएं' : 'Increase Income'}
                            </h3>
                            <div className="grid gap-3">
                                {valueChainTips.map((tip, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border flex items-center gap-4 hover:border-green-200 transition-colors cursor-default">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                            <tip.icon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm">{getText(tip.title)}</h4>
                                            <p className="text-xs text-muted-foreground">{getText(tip.desc)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA - Ask Expert */}
                        <div className="bg-primary text-primary-foreground rounded-2xl p-6 text-center">
                            <h3 className="text-lg font-bold mb-2">
                                {isHi ? 'कोई सवाल है?' : 'Have a Question?'}
                            </h3>
                            <p className="mb-6 opacity-90 text-sm">
                                {isHi ? 'हमारे कृषि विशेषज्ञों से अभी बात करें।' : 'Talk to our agri-experts directly.'}
                            </p>
                            <Button variant="secondary" size="lg" className="w-full font-bold">
                                {isHi ? 'विशेषज्ञ से पूछें' : 'Ask an Expert'}
                            </Button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
