"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Plus,
    Factory,
    ShoppingBag,
    TrendingUp,
    MessageSquare,
    Package,
    ChevronRight,
    Loader2,
    Volume2,
    VolumeX,
    ClipboardList,
    CheckCircle,
    Clock,
    AlertCircle,
    BarChart3,
    Leaf
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GovernmentSchemesHub } from '@/components/GovernmentSchemesHub';
import { OfflineSyncIndicator } from '@/components/OfflineSyncIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { milletTypes } from '@/lib/design-tokens';
import { listingsApi, offersApi, ordersApi, batchesApi, requirementApplicationsApi, RequirementApplication } from '@/lib/api';

export default function ProcessorDashboard() {
    const [role, setRole] = useState('processor');
    const { user, isLoading: authLoading } = useAuth();
    const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

    const [stats, setStats] = useState({
        totalProcured: '0 kg',
        activeBatches: 0,
        pendingOffers: 0,
        productsSold: 0,
        farmerApplications: 0
    });
    const [pendingOffers, setPendingOffers] = useState<any[]>([]);
    const [productListings, setProductListings] = useState<any[]>([]);
    const [productionBatches, setProductionBatches] = useState<any[]>([]);
    const [farmerApplications, setFarmerApplications] = useState<RequirementApplication[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const userName = user?.name || 'Processor';

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setIsLoadingData(true);

                // 1. Fetch Inbound Offers (Farmers offering to supply)
                const offersData = await offersApi.getMyReceivedOffers();
                const procurementOffers = (offersData.offers || []).filter((o: any) =>
                    o.status === 'pending' && o.listings?.is_processed === false
                );
                setPendingOffers(procurementOffers);

                // 2. Fetch My Product Listings
                const productsData = await listingsApi.getProcessedProducts({ limit: 4 });
                if (productsData.success) {
                    setProductListings(productsData.products || []);
                }

                // 3. Fetch Production Batches (Real Data)
                const batchesData = await batchesApi.getMyBatches();
                const batches = batchesData.items || [];
                setProductionBatches(batches.slice(0, 3));
                const activeBatchesCount = batches.filter((b: any) =>
                    ['CREATED', 'active', 'processing'].includes(b.status)
                ).length;

                // 4. Fetch Orders to calculate stats
                const procurementData = await ordersApi.getMyOrders('buyer');
                const totalProcuredKg = (procurementData.orders || []).reduce((sum: number, order: any) => sum + (Number(order.quantity_kg) || 0), 0);

                const salesData = await ordersApi.getMyOrders('farmer');
                const totalSold = (salesData.orders || []).length;

                // 5. Fetch Farmer Applications to my requirements
                const applicationsData = await requirementApplicationsApi.getReceivedApplications();
                const pendingApplications = (applicationsData.applications || []).filter(a => a.status === 'pending');
                setFarmerApplications(pendingApplications.slice(0, 5));

                setStats({
                    totalProcured: `${totalProcuredKg.toLocaleString()} kg`,
                    activeBatches: activeBatchesCount,
                    pendingOffers: procurementOffers.length,
                    productsSold: totalSold,
                    farmerApplications: pendingApplications.length
                });

            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    // Page voice descriptions
    const pageVoice = {
        en: `Welcome to your processor dashboard ${userName}. You have ${stats.activeBatches} active production batches and ${stats.pendingOffers} pending offers. Total raw material procured is ${stats.totalProcured}.`,
        hi: `${userName}, आपके प्रोसेसर डैशबोर्ड में स्वागत है। आपके पास ${stats.activeBatches} सक्रिय उत्पादन बैच और ${stats.pendingOffers} लंबित प्रस्ताव हैं। कुल कच्चा माल खरीद ${stats.totalProcured} है।`,
        kn: `${userName}, ನಿಮ್ಮ ಸಂಸ್ಕಾರಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಬಳಿ ${stats.activeBatches} ಸಕ್ರಿಯ ಉತ್ಪಾದನಾ ಬ್ಯಾಚ್‌ಗಳು ಮತ್ತು ${stats.pendingOffers} ಬಾಕಿ ಇರುವ ಆಫರ್‌ಗಳಿವೆ.`,
        te: `${userName}, మీ ప్రాసెసర్ డాష్‌బోర్డ్‌కు స్వాగతం. మీకు ${stats.activeBatches} యాక్టివ్ ప్రొడక్షన్ బ్యాచ్‌లు మరియు ${stats.pendingOffers} పెండింగ్ ఆఫర్‌లు ఉన్నాయి.`,
        ta: `${userName}, உங்கள் செயலாக்க டாஷ்போர்டுக்கு வரவேற்கிறோம். உங்களிடம் ${stats.activeBatches} செயலில் உள்ள உற்பத்தித் தொகுதிகள் மற்றும் ${stats.pendingOffers} நிலுவையில் உள்ள சலுகைகள் உள்ளன.`,
        mr: `${userName}, तुमच्या प्रोसेसर डॅशबोर्डवर स्वागत आहे. तुमच्याकडे ${stats.activeBatches} सक्रिय उत्पादन बॅचेस आणि ${stats.pendingOffers} प्रलंबित ऑफर आहेत.`,
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            stopSpeaking();
        } else {
            speak(pageVoice[language] || pageVoice.en);
        }
    };

    const getMilletName = (id: string) => {
        const m = milletTypes.find(t => t.id === id);
        return m ? m.name : id;
    };

    if (authLoading || isLoadingData) {
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
                                {language === 'hi' ? 'यह आपका प्रोसेसर डैशबोर्ड है' : 'Here\'s your processing unit dashboard'}
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
                            {/* Create Batch shortcut */}
                            <Link href="/processor/batches/create">
                                <Plus className="w-5 h-5 mr-2" />
                                {language === 'hi' ? 'नया बैच' : 'New Batch'}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        {
                            label: 'Material Procured',
                            value: stats.totalProcured,
                            icon: Leaf,
                            color: 'bg-accent/10 text-accent',
                        },
                        {
                            label: 'Active Batches',
                            value: stats.activeBatches,
                            icon: Factory,
                            color: 'bg-primary/10 text-primary',
                        },
                        {
                            label: 'Pending Offers',
                            value: stats.pendingOffers,
                            icon: MessageSquare,
                            color: 'bg-terra-500/10 text-terra-600',
                        },
                        {
                            label: 'Farmer Applications',
                            value: stats.farmerApplications,
                            icon: ClipboardList,
                            color: 'bg-amber-500/10 text-amber-600',
                        },
                        {
                            label: 'Products Sold',
                            value: stats.productsSold,
                            icon: ShoppingBag,
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
                            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <h2 className="font-heading font-semibold text-lg mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'New Batch', icon: Factory, href: '/processor/batches/create', color: 'bg-primary' },
                                    { label: 'Raise Requirement', icon: Plus, href: '/processor/requirements/create', color: 'bg-accent' },
                                    { label: 'Incoming Offers', icon: MessageSquare, href: '/processor/offers', color: 'bg-terra-500' },
                                    { label: 'Product Listings', icon: Package, href: '/processor/products', color: 'bg-sky-500' },
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

                        {/* Pending Procurement Offers */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading font-semibold text-lg">Pending Procurement Offers</h2>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/processor/offers">
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {pendingOffers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No pending offers found.</p>
                                        <Button variant="link" asChild className="mt-2">
                                            <Link href="/processor/marketplace">Browse Marketplace</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    pendingOffers.map((offer) => (
                                        <div key={offer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">
                                                        {getMilletName(offer.listings?.crop || 'Millet')}
                                                    </h3>
                                                    {offer.listings?.quality_grade && (
                                                        <Badge variant="outline" className="text-xs">{offer.listings.quality_grade}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {offer.qty_kg} kg {offer.buyer?.name ? `from ${offer.buyer.name}` : ''}
                                                </p>
                                                {offer.listings?.is_organic && (
                                                    <div className="flex items-center gap-1 text-xs text-accent mt-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Organic
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-primary">₹{offer.price_per_qtl}/qtl</p>
                                                    <p className="text-xs text-muted-foreground">Offered Price</p>
                                                </div>
                                                <Button size="sm">Review</Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Farmer Applications to Requirements */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading font-semibold text-lg">Farmer Applications</h2>
                                <Badge variant="outline" className="text-xs">
                                    {stats.farmerApplications} pending
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                {farmerApplications.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No farmer applications yet.</p>
                                        <p className="text-sm mt-1">Create a requirement to receive applications from farmers.</p>
                                        <Button variant="link" asChild className="mt-2">
                                            <Link href="/processor/requirements/create">Create Requirement</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    farmerApplications.map((application) => (
                                        <div key={application.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium">
                                                        {application.requirement?.crop || 'Millet'} - {application.offered_qty_kg} kg
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Pending
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    From: <span className="font-medium text-foreground">{application.farmer?.name || 'Farmer'}</span>
                                                    {application.farmer?.district && ` (${application.farmer.district})`}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-sm">
                                                    <span className="text-primary font-semibold">
                                                        Offered: ₹{application.offered_price_per_qtl}/qtl
                                                    </span>
                                                    {application.requirement?.target_price_per_qtl && (
                                                        <span className="text-muted-foreground">
                                                            (Your target: ₹{application.requirement.target_price_per_qtl}/qtl)
                                                        </span>
                                                    )}
                                                </div>
                                                {application.message && (
                                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                                        "{application.message}"
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50 border-red-200"
                                                    onClick={async () => {
                                                        await requirementApplicationsApi.reject(application.id);
                                                        setFarmerApplications(prev => prev.filter(a => a.id !== application.id));
                                                        setStats(prev => ({ ...prev, farmerApplications: prev.farmerApplications - 1 }));
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-accent hover:bg-accent/90"
                                                    onClick={async () => {
                                                        await requirementApplicationsApi.accept(application.id);
                                                        setFarmerApplications(prev => prev.filter(a => a.id !== application.id));
                                                        setStats(prev => ({ ...prev, farmerApplications: prev.farmerApplications - 1 }));
                                                    }}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* My Production Batches */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading font-semibold text-lg">My Production Batches</h2>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/processor/batches">
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {productionBatches.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">No active batches.</p>
                                ) : (
                                    productionBatches.map((batch) => (
                                        <div key={batch.id} className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium">{getMilletName(batch.crop)} Batch</h3>
                                                <Badge className={`
                            ${batch.status === 'processing' || batch.status === 'active' ? 'bg-primary/10 text-primary' : ''}
                            ${batch.status === 'completed' ? 'bg-accent/10 text-accent' : ''}
                            ${batch.status === 'CREATED' ? 'bg-blue-500/10 text-blue-600' : ''}
                          `}>
                                                    {batch.status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                <span>{batch.total_weight} kg</span>
                                                <span>{batch.grade || 'Standard'}</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                                    style={{ width: batch.status === 'completed' ? '100%' : '25%' }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* My Product Listings */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading font-semibold text-lg">My Product Listings</h2>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/processor/products">
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {productListings.length === 0 ? (
                                    <p className="text-muted-foreground col-span-2 text-center py-4">No products listed yet.</p>
                                ) : (
                                    productListings.map((product) => (
                                        <div key={product.id} className="flex gap-3 p-3 rounded-xl border border-border">
                                            {product.photos && product.photos[0] ? (
                                                <img src={product.photos[0]} alt={product.crop} className="w-16 h-16 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate">{product.crop} {product.product_type}</h3>
                                                <div className="flex justify-between items-end mt-1">
                                                    <p className="font-semibold text-primary">₹{product.min_price_per_qtl}/kg</p>
                                                    <p className="text-xs text-muted-foreground">{product.qty_kg} kg stock</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Capacity Planner */}
                        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Capacity Planner
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Flour Mill</span>
                                        <span className="font-medium">85% Utilized</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className="bg-accent h-2 rounded-full" style={{ width: '85%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Packaging Unit</span>
                                        <span className="font-medium">45% Utilized</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                                Manage Schedule
                            </Button>
                        </div>

                        {/* Government Schemes */}
                        <GovernmentSchemesHub compact />

                        {/* Today's Tip */}
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 sm:p-6 border border-primary/20">
                            <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                                <span className="text-xl">💡</span> Processing Tip
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Demand for ready-to-cook millet mixes is rising. Consider increasing production of your foxtail millet dosa mix.
                            </p>
                            <Button variant="outline" size="sm" className="mt-3 w-full">
                                View Market Insights
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
