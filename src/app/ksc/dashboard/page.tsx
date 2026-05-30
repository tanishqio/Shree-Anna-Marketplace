"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Users,
    ShieldCheck,
    UserPlus,
    Search,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight,
    Loader2,
    Volume2,
    VolumeX,
    FileText,
    TrendingUp,
    Eye,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GovernmentSchemesHub } from '@/components/GovernmentSchemesHub';
import { OfflineSyncIndicator } from '@/components/OfflineSyncIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { kscApi } from '@/lib/api';

interface PendingFarmer {
    id: string;
    name: string;
    phone: string;
    district: string;
    created_at: string;
    farmer_profiles?: any[];
}

export default function KscDashboard() {
    const [role, setRole] = useState('ksc');
    const { user, isLoading: authLoading } = useAuth();
    const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

    const [pendingFarmers, setPendingFarmers] = useState<PendingFarmer[]>([]);
    const [stats, setStats] = useState({
        pending: 0,
        verified: 0,
        rejected: 0,
        todayVerified: 0,
        assistedRegistrations: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchPhone, setSearchPhone] = useState('');
    const [searchResult, setSearchResult] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pendingRes, statsRes] = await Promise.all([
                    kscApi.getPendingFarmers({ limit: 5 }),
                    kscApi.getVerificationStats(user?.id)
                ]);
                setPendingFarmers(pendingRes.farmers || []);
                setStats(statsRes);
            } catch (error) {
                console.error('Error fetching KSC data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchData();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const handleVerify = async (farmerId: string) => {
        if (!user) return;
        try {
            await kscApi.verifyFarmer(farmerId, user.id);
            setPendingFarmers(prev => prev.filter(f => f.id !== farmerId));
            setStats(prev => ({
                ...prev,
                pending: prev.pending - 1,
                verified: prev.verified + 1,
                todayVerified: prev.todayVerified + 1
            }));
        } catch (error) {
            console.error('Error verifying farmer:', error);
        }
    };

    const handleReject = async (farmerId: string) => {
        if (!user) return;
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await kscApi.rejectFarmer(farmerId, user.id, reason);
            setPendingFarmers(prev => prev.filter(f => f.id !== farmerId));
            setStats(prev => ({
                ...prev,
                pending: prev.pending - 1,
                rejected: prev.rejected + 1
            }));
        } catch (error) {
            console.error('Error rejecting farmer:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchPhone || searchPhone.length < 10) return;
        setSearchLoading(true);
        try {
            const result = await kscApi.lookupFarmerByPhone(searchPhone);
            setSearchResult(result);
        } catch (error) {
            console.error('Error searching farmer:', error);
            setSearchResult(null);
        } finally {
            setSearchLoading(false);
        }
    };

    const userName = user?.name || 'KSC Officer';

    // Page voice descriptions
    const pageVoice = {
        en: `Welcome to Kisan Service Center Dashboard. You have ${stats.pending} farmers pending verification. Today you have verified ${stats.todayVerified} farmers.`,
        hi: `किसान सेवा केंद्र डैशबोर्ड में आपका स्वागत है। ${stats.pending} किसान सत्यापन के लिए लंबित हैं। आज आपने ${stats.todayVerified} किसानों का सत्यापन किया है।`,
        kn: `ಕಿಸಾನ್ ಸೇವಾ ಕೇಂದ್ರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ. ${stats.pending} ರೈತರು ಪರಿಶೀಲನೆಗಾಗಿ ಬಾಕಿ ಇದ್ದಾರೆ.`,
        te: `కిసాన్ సేవా కేంద్రం డాష్‌బోర్డ్‌కు స్వాగతం. ${stats.pending} రైతులు ధృవీకరణ కోసం పెండింగ్‌లో ఉన్నారు.`,
        ta: `கிசான் சேவை மைய டாஷ்போர்டுக்கு வரவேற்கிறோம். ${stats.pending} விவசாயிகள் சரிபார்ப்புக்காக காத்திருக்கிறார்கள்.`,
        mr: `किसान सेवा केंद्र डॅशबोर्डवर स्वागत आहे. ${stats.pending} शेतकरी सत्यापनासाठी प्रलंबित आहेत.`,
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            stopSpeaking();
        } else {
            speak(pageVoice[language as keyof typeof pageVoice] || pageVoice.en);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
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
                                {language === 'hi' ? `स्वागत है, ${userName}! 👋` : `Welcome, ${userName}! 👋`}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {language === 'hi' ? 'किसान सेवा केंद्र डैशबोर्ड' : 'Kisan Service Center Dashboard'}
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
                            <Link href="/ksc/register-farmer">
                                <UserPlus className="w-5 h-5 mr-2" />
                                {language === 'hi' ? 'किसान पंजीकृत करें' : 'Register Farmer'}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        {
                            label: language === 'hi' ? 'लंबित सत्यापन' : 'Pending Verification',
                            value: stats.pending.toString(),
                            icon: Clock,
                            color: 'bg-amber-500/10 text-amber-600',
                        },
                        {
                            label: language === 'hi' ? 'सत्यापित किसान' : 'Verified Farmers',
                            value: stats.verified.toString(),
                            icon: CheckCircle,
                            color: 'bg-accent/10 text-accent',
                        },
                        {
                            label: language === 'hi' ? 'अस्वीकृत' : 'Rejected',
                            value: stats.rejected.toString(),
                            icon: XCircle,
                            color: 'bg-destructive/10 text-destructive',
                        },
                        {
                            label: language === 'hi' ? 'आज सत्यापित' : 'Verified Today',
                            value: stats.todayVerified.toString(),
                            icon: TrendingUp,
                            color: 'bg-primary/10 text-primary',
                        },
                        {
                            label: language === 'hi' ? 'सहायित पंजीकरण' : 'Assisted Registrations',
                            value: stats.assistedRegistrations.toString(),
                            icon: UserPlus,
                            color: 'bg-sky-500/10 text-sky-600',
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
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
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <h2 className="font-heading font-semibold text-lg mb-4">
                                {language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: language === 'hi' ? 'सत्यापन कतार' : 'Verification Queue', icon: ShieldCheck, href: '/ksc/verify', color: 'bg-primary' },
                                    { label: language === 'hi' ? 'किसान पंजीकृत करें' : 'Register Farmer', icon: UserPlus, href: '/ksc/register-farmer', color: 'bg-accent' },
                                    { label: language === 'hi' ? 'किसान खोजें' : 'Farmer Lookup', icon: Search, href: '/ksc/farmers', color: 'bg-terra-500' },
                                    { label: language === 'hi' ? 'सरकारी योजनाएं' : 'Govt Schemes', icon: FileText, href: '/schemes', color: 'bg-sky-500' },
                                ].map((action) => (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors touch-target"
                                    >
                                        <div className={`w-12 h-12 rounded-full ${action.color} text-white flex items-center justify-center`}>
                                            <action.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-medium text-center">{action.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Pending Verification Queue */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading font-semibold text-lg">
                                    {language === 'hi' ? 'लंबित सत्यापन' : 'Pending Verification'}
                                </h2>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/ksc/verify">
                                        {language === 'hi' ? 'सभी देखें' : 'View All'} <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {pendingFarmers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-accent" />
                                        <p>{language === 'hi' ? 'कोई लंबित सत्यापन नहीं!' : 'No pending verifications!'}</p>
                                    </div>
                                ) : (
                                    pendingFarmers.map((farmer) => (
                                        <div key={farmer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{farmer.name}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {language === 'hi' ? 'नया' : 'New'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {farmer.phone}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {farmer.district}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleReject(farmer.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <XCircle className="w-4 h-4 mr-1" /> {language === 'hi' ? 'अस्वीकार' : 'Reject'}
                                                </Button>
                                                <Button size="sm" onClick={() => handleVerify(farmer.id)} className="bg-accent hover:bg-accent/90">
                                                    <CheckCircle className="w-4 h-4 mr-1" /> {language === 'hi' ? 'सत्यापित' : 'Verify'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Farmer Lookup */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-primary" />
                                {language === 'hi' ? 'किसान खोज' : 'Farmer Lookup'}
                            </h3>
                            <div className="flex gap-2">
                                <Input
                                    type="tel"
                                    placeholder={language === 'hi' ? 'फ़ोन नंबर दर्ज करें' : 'Enter phone number'}
                                    value={searchPhone}
                                    onChange={(e) => setSearchPhone(e.target.value)}
                                    maxLength={10}
                                />
                                <Button onClick={handleSearch} disabled={searchLoading || searchPhone.length < 10}>
                                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                            {searchResult && (
                                <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                                    <p className="font-medium">{searchResult.name}</p>
                                    <p className="text-sm text-muted-foreground">{searchResult.phone}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className={searchResult.verification_status === 'verified' ? 'bg-accent' : 'bg-amber-500'}>
                                            {searchResult.verification_status}
                                        </Badge>
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/ksc/farmers?id=${searchResult.id}`}>
                                                <Eye className="w-3 h-3 mr-1" /> View
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {searchResult === null && searchPhone.length >= 10 && !searchLoading && (
                                <p className="mt-3 text-sm text-muted-foreground text-center">
                                    {language === 'hi' ? 'कोई किसान नहीं मिला' : 'No farmer found'}
                                </p>
                            )}
                        </div>

                        {/* Government Schemes */}
                        <GovernmentSchemesHub compact />

                        {/* KSC Tips */}
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 sm:p-6 border border-primary/20">
                            <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                                <span className="text-xl">💡</span> {language === 'hi' ? 'केएससी टिप' : 'KSC Tip'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {language === 'hi'
                                    ? 'किसानों को उनके आधार और भूमि दस्तावेजों के साथ सत्यापन के लिए आने को कहें।'
                                    : 'Ask farmers to bring their Aadhaar and land documents for quick verification.'}
                            </p>
                            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                                <Link href="/ksc/register-farmer">
                                    {language === 'hi' ? 'नया किसान पंजीकृत करें' : 'Register New Farmer'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
