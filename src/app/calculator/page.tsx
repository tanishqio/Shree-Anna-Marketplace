"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { SpeakButton } from '@/components/SpeakButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Calculator, Landmark, Shield, TrendingUp, BookOpen, AlertTriangle,
    ChevronRight, ExternalLink, Sprout, IndianRupee, Percent, Calendar,
    MapPin, Wheat, CheckCircle2, Info, Zap, Target, PiggyBank, FileText
} from 'lucide-react';
import Link from 'next/link';

// --- Data Constants ---
const STATES = [
    "Andhra Pradesh", "Bihar", "Chhattisgarh", "Gujarat", "Haryana", "Jharkhand",
    "Karnataka", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
    "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand"
];

const CROPS = {
    millets: [
        { id: 'bajra', en: 'Bajra (Pearl Millet)', hi: 'बाजरा' },
        { id: 'jowar', en: 'Jowar (Sorghum)', hi: 'ज्वार' },
        { id: 'ragi', en: 'Ragi (Finger Millet)', hi: 'रागी' },
        { id: 'foxtail', en: 'Foxtail Millet', hi: 'कांगनी' },
        { id: 'kodo', en: 'Kodo Millet', hi: 'कोदो' },
        { id: 'little', en: 'Little Millet', hi: 'कुटकी' },
        { id: 'barnyard', en: 'Barnyard Millet', hi: 'सांवा' },
    ],
    pulses: [
        { id: 'arhar', en: 'Arhar / Red Gram', hi: 'अरहर' },
        { id: 'chana', en: 'Chana (Chickpea)', hi: 'चना' },
        { id: 'urad', en: 'Urad (Black Gram)', hi: 'उड़द' },
        { id: 'moong', en: 'Moong (Green Gram)', hi: 'मूंग' },
    ]
};

const CREDIT_SCORES = [
    { value: 'excellent', en: 'Excellent (750+)', hi: 'उत्कृष्ट (750+)' },
    { value: 'good', en: 'Good (650-749)', hi: 'अच्छा (650-749)' },
    { value: 'fair', en: 'Fair (550-649)', hi: 'ठीक (550-649)' },
    { value: 'poor', en: 'Poor (Below 550)', hi: 'खराब (550 से कम)' },
    { value: 'unknown', en: 'Unknown', hi: 'अज्ञात' },
];

const SCHEMES = [
    { id: 'pmkisan', name: { en: 'PM-KISAN', hi: 'पीएम-किसान' }, category: { en: 'Income Support', hi: 'आय सहायता' }, url: 'https://pmkisan.gov.in/', action: { en: 'Check Status', hi: 'स्थिति जांचें' } },
    { id: 'pmfby', name: { en: 'PMFBY', hi: 'पीएमएफबीवाई' }, category: { en: 'Insurance', hi: 'बीमा' }, url: 'https://pmfby.gov.in/', action: { en: 'Enroll Now', hi: 'अभी नामांकन करें' } },
    { id: 'shc', name: { en: 'Soil Health Card', hi: 'मृदा स्वास्थ्य कार्ड' }, category: { en: 'Soil Health', hi: 'मृदा स्वास्थ्य' }, url: 'https://soilhealth.dac.gov.in/', action: { en: 'Find Center', hi: 'केंद्र खोजें' } },
    { id: 'aif', name: { en: 'Agri Infra Fund', hi: 'कृषि अवसंरचना कोष' }, category: { en: 'Value Chain', hi: 'मूल्य श्रृंखला' }, url: 'https://agriinfra.dac.gov.in/', action: { en: 'Apply', hi: 'आवेदन करें' } },
];

// --- Translations ---
const translations = {
    title: { en: 'AI Financial Planner', hi: 'AI वित्तीय योजनाकार' },
    subtitle: { en: 'Personalized guidance for Millet & Pulses farmers', hi: 'बाजरा और दाल किसानों के लिए व्यक्तिगत मार्गदर्शन' },
    profileTitle: { en: 'Your Farm Profile', hi: 'आपकी खेत प्रोफ़ाइल' },
    farmSize: { en: 'Farm Size (Acres)', hi: 'खेत का आकार (एकड़)' },
    state: { en: 'State', hi: 'राज्य' },
    district: { en: 'District', hi: 'जिला' },
    selectCrops: { en: 'Select Your Crops', hi: 'अपनी फसलें चुनें' },
    millets: { en: 'Millets', hi: 'बाजरा' },
    pulses: { en: 'Pulses', hi: 'दालें' },
    creditScore: { en: 'Credit Score', hi: 'क्रेडिट स्कोर' },
    analyzeBtn: { en: 'Analyze My Millet & Pulses Data', hi: 'मेरा बाजरा और दाल डेटा विश्लेषण करें' },
    loanTitle: { en: 'Loan Eligibility', hi: 'ऋण पात्रता' },
    loanDesc: { en: 'Based on your farm profile', hi: 'आपकी खेत प्रोफ़ाइल के आधार पर' },
    eligibleRange: { en: 'Eligible Loan Range', hi: 'पात्र ऋण सीमा' },
    recommendedLoans: { en: 'Recommended Loan Types', hi: 'अनुशंसित ऋण प्रकार' },
    kcc: { en: 'Kisan Credit Card (KCC)', hi: 'किसान क्रेडिट कार्ड (KCC)' },
    equipmentLoan: { en: 'Millet Processing Equipment Loan', hi: 'बाजरा प्रसंस्करण उपकरण ऋण' },
    infraLoan: { en: 'Agri Infrastructure Fund', hi: 'कृषि अवसंरचना कोष' },
    checkEligibility: { en: 'Check Eligibility', hi: 'पात्रता जांचें' },
    insuranceTitle: { en: 'Crop Insurance (PMFBY)', hi: 'फसल बीमा (PMFBY)' },
    insuranceDesc: { en: 'Protection for your crops', hi: 'आपकी फसलों के लिए सुरक्षा' },
    sumInsured: { en: 'Sum Insured / Acre', hi: 'बीमित राशि / एकड़' },
    premium: { en: 'Your Premium', hi: 'आपका प्रीमियम' },
    deadline: { en: 'Enrollment Deadline', hi: 'नामांकन की अंतिम तिथि' },
    applyPMFBY: { en: 'Apply on PMFBY Portal', hi: 'PMFBY पोर्टल पर आवेदन करें' },
    emiTitle: { en: 'EMI Calculator', hi: 'EMI कैलकुलेटर' },
    emiDesc: { en: 'Plan your loan repayment', hi: 'अपना ऋण भुगतान योजना बनाएं' },
    loanAmount: { en: 'Loan Amount (₹)', hi: 'ऋण राशि (₹)' },
    tenure: { en: 'Tenure (Months)', hi: 'अवधि (महीने)' },
    interestRate: { en: 'Interest Rate (%)', hi: 'ब्याज दर (%)' },
    monthlyEMI: { en: 'Monthly EMI', hi: 'मासिक EMI' },
    emiWarning: { en: 'Warning: EMI exceeds 30% of expected income', hi: 'चेतावनी: EMI अपेक्षित आय के 30% से अधिक है' },
    schemesTitle: { en: 'Matching Government Schemes', hi: 'मिलान सरकारी योजनाएं' },
    incomeTitle: { en: 'Income Prediction', hi: 'आय भविष्यवाणी' },
    expectedIncome: { en: 'Expected Annual Income', hi: 'अपेक्षित वार्षिक आय' },
    incomeGain: { en: 'Income Gain with Schemes', hi: 'योजनाओं के साथ आय लाभ' },
    riskProtection: { en: 'Risk Protection', hi: 'जोखिम सुरक्षा' },
    learningTitle: { en: 'Learning & Safety', hi: 'सीखना और सुरक्षा' },
    scamAlert: { en: 'Scam Alert', hi: 'घोटाला चेतावनी' },
    scamText: { en: 'Never share OTP, bank PIN, or personal details with unknown callers claiming to be from government schemes.', hi: 'कभी भी OTP, बैंक पिन या व्यक्तिगत जानकारी उन अज्ञात कॉलर्स के साथ साझा न करें जो सरकारी योजनाओं से होने का दावा करते हैं।' },
    generatePlan: { en: 'Get Your AI Financial Plan', hi: 'अपनी AI वित्तीय योजना प्राप्त करें' },
    disclaimer: { en: 'All estimates are AI-based. Final eligibility depends on government and banks.', hi: 'सभी अनुमान AI-आधारित हैं। अंतिम पात्रता सरकार और बैंकों पर निर्भर करती है।' },
};

export default function CalculatorPage() {
    const [role, setRole] = useState('farmer');
    const [showHelp, setShowHelp] = useState(false);
    const { language } = useLanguage();

    // Form State
    const [farmSize, setFarmSize] = useState(2);
    const [state, setState] = useState('Karnataka');
    const [district, setDistrict] = useState('');
    const [selectedCrops, setSelectedCrops] = useState<string[]>(['bajra', 'chana']);
    const [creditScore, setCreditScore] = useState('good');
    const [isAnalyzed, setIsAnalyzed] = useState(false);

    // EMI Calculator State
    const [loanAmount, setLoanAmount] = useState(100000);
    const [tenure, setTenure] = useState(36);
    const [interestRate, setInterestRate] = useState(7);

    const t = (key: keyof typeof translations) => translations[key][language as 'en' | 'hi'] || translations[key].en;

    // Toggle crop selection
    const toggleCrop = (cropId: string) => {
        setSelectedCrops(prev =>
            prev.includes(cropId) ? prev.filter(c => c !== cropId) : [...prev, cropId]
        );
    };

    // Calculate Loan Eligibility
    const loanEligibility = useMemo(() => {
        const baseAmount = farmSize * 50000;
        const creditMultiplier = creditScore === 'excellent' ? 2 : creditScore === 'good' ? 1.5 : creditScore === 'fair' ? 1 : 0.7;
        const cropBonus = selectedCrops.some(c => CROPS.pulses.find(p => p.id === c)) ? 20000 : 0;
        const minLoan = Math.round((baseAmount * creditMultiplier * 0.8 + cropBonus) / 1000) * 1000;
        const maxLoan = Math.round((baseAmount * creditMultiplier * 1.5 + cropBonus) / 1000) * 1000;
        return { min: Math.max(50000, minLoan), max: Math.min(1000000, maxLoan) };
    }, [farmSize, creditScore, selectedCrops]);

    // Calculate Insurance Premium
    const insuranceData = useMemo(() => {
        const hasPulses = selectedCrops.some(c => CROPS.pulses.find(p => p.id === c));
        const hasMillets = selectedCrops.some(c => CROPS.millets.find(m => m.id === c));
        const sumInsuredPerAcre = hasPulses ? 35000 : 25000;
        const premiumRate = hasMillets ? 0.02 : 0.015;
        const totalSum = sumInsuredPerAcre * farmSize;
        const premium = Math.round(totalSum * premiumRate);
        return { sumInsuredPerAcre, totalSum, premium, deadline: '31 July 2025' };
    }, [selectedCrops, farmSize]);

    // Calculate EMI
    const emi = useMemo(() => {
        const r = interestRate / 12 / 100;
        const n = tenure;
        if (r === 0) return Math.round(loanAmount / n);
        const emiValue = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        return Math.round(emiValue);
    }, [loanAmount, tenure, interestRate]);

    // Calculate Expected Income
    const incomeData = useMemo(() => {
        const yieldPerAcre = selectedCrops.some(c => CROPS.pulses.find(p => p.id === c)) ? 8000 : 6000;
        const baseIncome = farmSize * yieldPerAcre;
        const withSchemes = Math.round(baseIncome * 1.25);
        const gain = 25;
        const riskProtection = insuranceData.totalSum > 0 ? Math.round((insuranceData.totalSum / baseIncome) * 100) : 0;
        return { base: baseIncome, withSchemes, gain, riskProtection: Math.min(100, riskProtection) };
    }, [farmSize, selectedCrops, insuranceData]);

    const emiWarning = emi > (incomeData.withSchemes / 12) * 0.3;

    const handleAnalyze = () => {
        setIsAnalyzed(true);
    };

    const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="pb-20">
                {/* Hero Section */}
                <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
                    </div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                                <Calculator className="w-5 h-5" />
                                <span className="font-medium">{t('title')}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                                {language === 'hi' ? 'AI वित्तीय योजनाकार' : 'AI Financial Planner'}
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Farmer Profile Input */}
                <section className="py-12 -mt-8">
                    <div className="container mx-auto px-4">
                        <Card className="max-w-4xl mx-auto shadow-xl border-2 border-primary/20">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Sprout className="w-6 h-6 text-primary" />
                                    {t('profileTitle')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Farm Size */}
                                    <div className="space-y-2">
                                        <Label htmlFor="farmSize" className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-muted-foreground" />
                                            {t('farmSize')}
                                        </Label>
                                        <Input
                                            id="farmSize"
                                            type="number"
                                            min={0.5}
                                            max={100}
                                            step={0.5}
                                            value={farmSize}
                                            onChange={(e) => setFarmSize(parseFloat(e.target.value) || 0)}
                                            className="text-lg"
                                        />
                                    </div>

                                    {/* State */}
                                    <div className="space-y-2">
                                        <Label htmlFor="state" className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            {t('state')}
                                        </Label>
                                        <select
                                            id="state"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                                        >
                                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    {/* Credit Score */}
                                    <div className="space-y-2">
                                        <Label htmlFor="credit" className="flex items-center gap-2">
                                            <PiggyBank className="w-4 h-4 text-muted-foreground" />
                                            {t('creditScore')}
                                        </Label>
                                        <select
                                            id="credit"
                                            value={creditScore}
                                            onChange={(e) => setCreditScore(e.target.value)}
                                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                                        >
                                            {CREDIT_SCORES.map(c => (
                                                <option key={c.value} value={c.value}>
                                                    {language === 'hi' ? c.hi : c.en}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Crop Selection */}
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-lg">
                                        <Wheat className="w-5 h-5 text-primary" />
                                        {t('selectCrops')}
                                    </Label>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Millets */}
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-primary">{t('millets')}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {CROPS.millets.map(crop => (
                                                    <button
                                                        key={crop.id}
                                                        onClick={() => toggleCrop(crop.id)}
                                                        className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${selectedCrops.includes(crop.id)
                                                            ? 'border-primary bg-primary/10 text-primary font-medium'
                                                            : 'border-border hover:border-primary/50'
                                                            }`}
                                                    >
                                                        {selectedCrops.includes(crop.id) && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                                                        {language === 'hi' ? crop.hi : crop.en}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pulses */}
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-accent-foreground">{t('pulses')}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {CROPS.pulses.map(crop => (
                                                    <button
                                                        key={crop.id}
                                                        onClick={() => toggleCrop(crop.id)}
                                                        className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${selectedCrops.includes(crop.id)
                                                            ? 'border-accent bg-accent/10 text-accent-foreground font-medium'
                                                            : 'border-border hover:border-accent/50'
                                                            }`}
                                                    >
                                                        {selectedCrops.includes(crop.id) && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                                                        {language === 'hi' ? crop.hi : crop.en}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleAnalyze} size="lg" className="w-full text-lg h-14 gap-2">
                                    <Zap className="w-5 h-5" />
                                    {t('analyzeBtn')}
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Results Section - Only show after analysis */}
                {isAnalyzed && (
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        {/* Smart Tools Grid */}
                        <section className="py-12 bg-muted/30">
                            <div className="container mx-auto px-4">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

                                    {/* Loan Eligibility */}
                                    <Card className="border-l-4 border-l-primary shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Landmark className="w-5 h-5 text-primary" />
                                                {t('loanTitle')}
                                            </CardTitle>
                                            <CardDescription>{t('loanDesc')}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="bg-primary/10 p-4 rounded-xl text-center">
                                                <p className="text-sm text-muted-foreground mb-1">{t('eligibleRange')}</p>
                                                <p className="text-2xl font-bold text-primary">
                                                    ₹{loanEligibility.min.toLocaleString()} - ₹{loanEligibility.max.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">{t('recommendedLoans')}:</p>
                                                <ul className="text-sm space-y-1 text-muted-foreground">
                                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> {t('kcc')}</li>
                                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> {t('equipmentLoan')}</li>
                                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> {t('infraLoan')}</li>
                                                </ul>
                                            </div>
                                            <Button variant="outline" className="w-full gap-2" asChild>
                                                <Link href="https://pmkisan.gov.in/" target="_blank">
                                                    {t('checkEligibility')} <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Insurance */}
                                    <Card className="border-l-4 border-l-green-600 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-green-600" />
                                                {t('insuranceTitle')}
                                            </CardTitle>
                                            <CardDescription>{t('insuranceDesc')}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-center">
                                                    <p className="text-xs text-muted-foreground">{t('sumInsured')}</p>
                                                    <p className="text-lg font-bold text-green-700">₹{insuranceData.sumInsuredPerAcre.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-center">
                                                    <p className="text-xs text-muted-foreground">{t('premium')}</p>
                                                    <p className="text-lg font-bold text-green-700">₹{insuranceData.premium.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {t('deadline')}: <span className="font-medium text-foreground">{insuranceData.deadline}</span>
                                            </div>
                                            <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" asChild>
                                                <Link href="https://pmfby.gov.in/" target="_blank">
                                                    {t('applyPMFBY')} <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* EMI Calculator */}
                                    <Card className="border-l-4 border-l-accent shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calculator className="w-5 h-5 text-accent-foreground" />
                                                {t('emiTitle')}
                                            </CardTitle>
                                            <CardDescription>{t('emiDesc')}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <Label className="text-xs">{t('loanAmount')}</Label>
                                                    <Input type="number" value={loanAmount} onChange={(e) => setLoanAmount(parseInt(e.target.value) || 0)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-xs">{t('tenure')}</Label>
                                                        <Input type="number" value={tenure} onChange={(e) => setTenure(parseInt(e.target.value) || 12)} />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">{t('interestRate')}</Label>
                                                        <Input type="number" step="0.5" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`p-4 rounded-xl text-center ${emiWarning ? 'bg-destructive/10' : 'bg-accent/10'}`}>
                                                <p className="text-sm text-muted-foreground mb-1">{t('monthlyEMI')}</p>
                                                <p className={`text-3xl font-bold ${emiWarning ? 'text-destructive' : 'text-accent-foreground'}`}>
                                                    ₹{emi.toLocaleString()}
                                                </p>
                                            </div>
                                            {emiWarning && (
                                                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                                                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                                    {t('emiWarning')}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>

                        {/* Schemes Matching */}
                        <section className="py-12">
                            <div className="container mx-auto px-4">
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                                        <FileText className="w-6 h-6 text-primary" />
                                        {t('schemesTitle')}
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {SCHEMES.map(scheme => (
                                            <Card key={scheme.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                                            {language === 'hi' ? scheme.category.hi : scheme.category.en}
                                                        </p>
                                                        <p className="font-semibold text-lg">
                                                            {language === 'hi' ? scheme.name.hi : scheme.name.en}
                                                        </p>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="gap-1" asChild>
                                                        <Link href={scheme.url} target="_blank">
                                                            {language === 'hi' ? scheme.action.hi : scheme.action.en}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Income Prediction */}
                        <section className="py-12 bg-gradient-to-r from-primary/5 to-accent/5">
                            <div className="container mx-auto px-4">
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                        {t('incomeTitle')}
                                    </h2>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <IndianRupee className="w-8 h-8 mx-auto text-primary mb-2" />
                                                <p className="text-sm text-muted-foreground">{t('expectedIncome')}</p>
                                                <p className="text-3xl font-bold text-primary">₹{incomeData.withSchemes.toLocaleString()}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <Percent className="w-8 h-8 mx-auto text-green-600 mb-2" />
                                                <p className="text-sm text-muted-foreground">{t('incomeGain')}</p>
                                                <p className="text-3xl font-bold text-green-600">+{incomeData.gain}%</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <Shield className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                                                <p className="text-sm text-muted-foreground">{t('riskProtection')}</p>
                                                <p className="text-3xl font-bold text-blue-600">{incomeData.riskProtection}%</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Learning & Safety */}
                        <section className="py-12">
                            <div className="container mx-auto px-4">
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                        {t('learningTitle')}
                                    </h2>
                                    <Card className="border-l-4 border-l-destructive bg-destructive/5">
                                        <CardContent className="p-6 flex items-start gap-4">
                                            <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-lg text-destructive mb-2">{t('scamAlert')}</h3>
                                                <p className="text-muted-foreground">{t('scamText')}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>

                        {/* Final CTA */}
                        <section className="py-12 bg-primary text-primary-foreground">
                            <div className="container mx-auto px-4 text-center">
                                <h2 className="text-3xl font-heading font-bold mb-4">{t('generatePlan')}</h2>
                                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">{t('disclaimer')}</p>
                                <Button size="lg" variant="secondary" className="text-lg px-8 h-14 gap-2">
                                    <Zap className="w-5 h-5" />
                                    {language === 'hi' ? 'मेरी योजना जनरेट करें' : 'Generate My Plan'}
                                </Button>
                            </div>
                        </section>
                    </motion.div>
                )}
            </main>

            <Footer onOpenHelp={() => setShowHelp(true)} />
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
