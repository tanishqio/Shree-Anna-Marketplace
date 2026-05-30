"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Wheat,
    Plus,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    Calendar,
    MapPin,
    Eye,
    Loader2,
    IndianRupee,
    Sprout,
    ChevronRight,
    BarChart3,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useAuth } from '@/lib/hooks/useAuth';
import { cropHistoryApi, CropCycle } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';

const statusColors: Record<string, string> = {
    active: 'bg-accent/10 text-accent border-accent/20',
    harvested: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const statusLabels: Record<string, { en: string; hi: string }> = {
    active: { en: 'Active', hi: 'सक्रिय' },
    harvested: { en: 'Harvested', hi: 'कटाई हुई' },
    completed: { en: 'Completed', hi: 'पूर्ण' },
    cancelled: { en: 'Cancelled', hi: 'रद्द' },
};

const seasonLabels: Record<string, { en: string; hi: string }> = {
    kharif: { en: 'Kharif', hi: 'खरीफ' },
    rabi: { en: 'Rabi', hi: 'रबी' },
    summer: { en: 'Summer', hi: 'ग्रीष्म' },
};

export default function CropHistoryPage() {
    const [role, setRole] = useState('farmer');
    const { language } = useLanguage();
    const { user, isLoading: authLoading } = useAuth();

    const [cycles, setCycles] = useState<CropCycle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalCycles: 0,
        activeCycles: 0,
        completedCycles: 0,
        totalArea: 0,
        totalCost: 0,
        totalRevenue: 0,
        totalProfit: 0,
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [seasonFilter, setSeasonFilter] = useState('all');
    const [cropTypeFilter, setCropTypeFilter] = useState('all');

    const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id, nameHi: id };

    useEffect(() => {
        const fetchData = async () => {
            // Don't fetch if still loading auth
            if (authLoading) return;

            // If no user, show empty state (not an error)
            if (!user) {
                setIsLoading(false);
                setCycles([]);
                setStats({
                    totalCycles: 0,
                    activeCycles: 0,
                    completedCycles: 0,
                    totalArea: 0,
                    totalCost: 0,
                    totalRevenue: 0,
                    totalProfit: 0,
                });
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const [cyclesData, statsData] = await Promise.all([
                    cropHistoryApi.getAll({
                        status: statusFilter !== 'all' ? statusFilter : undefined,
                        season: seasonFilter !== 'all' ? seasonFilter : undefined,
                        crop_type: cropTypeFilter !== 'all' ? cropTypeFilter : undefined,
                    }),
                    cropHistoryApi.getStats(),
                ]);
                setCycles(cyclesData.cycles || []);
                setStats(statsData);
            } catch (err: any) {
                console.error('Error fetching crop history:', err);
                // Don't show error for empty results or auth errors
                if (err?.code === 'PGRST116' || err?.message?.includes('not found') || err?.message?.includes('Not authenticated')) {
                    setCycles([]);
                    setStats({
                        totalCycles: 0,
                        activeCycles: 0,
                        completedCycles: 0,
                        totalArea: 0,
                        totalCost: 0,
                        totalRevenue: 0,
                        totalProfit: 0,
                    });
                } else {
                    setError(language === 'hi' ? 'फसल इतिहास लोड करने में विफल' : 'Failed to load crop history');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [statusFilter, seasonFilter, cropTypeFilter, authLoading, user, language]);

    // Filter cycles by search
    const filteredCycles = cycles.filter(cycle => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const cropName = getMillet(cycle.crop).name.toLowerCase();
        return cropName.includes(query) || cycle.variety?.toLowerCase().includes(query) || cycle.plot_name?.toLowerCase().includes(query);
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">
                            {language === 'hi' ? 'फसल इतिहास लोड हो रहा है...' : 'Loading crop history...'}
                        </p>
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
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-2">
                            <Wheat className="w-8 h-8 text-primary" />
                            {language === 'hi' ? 'फसल इतिहास' : 'Crop History'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {language === 'hi' ? 'मिलेट और दालों का पूर्ण जीवनचक्र और लागत इतिहास' : 'Complete lifecycle & cost history of your Millets & Pulses'}
                        </p>
                    </div>
                    <Button asChild size="lg" className="touch-target">
                        <Link href="/farmer/crop-history/create">
                            <Plus className="w-5 h-5 mr-2" />
                            {language === 'hi' ? 'नई फसल जोड़ें' : 'Add New Crop'}
                        </Link>
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: language === 'hi' ? 'कुल फसल चक्र' : 'Total Cycles',
                            value: stats.totalCycles,
                            icon: Sprout,
                            color: 'bg-primary/10 text-primary',
                        },
                        {
                            label: language === 'hi' ? 'कुल क्षेत्र' : 'Total Area',
                            value: `${stats.totalArea.toFixed(1)} ${language === 'hi' ? 'एकड़' : 'acres'}`,
                            icon: MapPin,
                            color: 'bg-accent/10 text-accent',
                        },
                        {
                            label: language === 'hi' ? 'कुल राजस्व' : 'Total Revenue',
                            value: formatCurrency(stats.totalRevenue),
                            icon: IndianRupee,
                            color: 'bg-green-500/10 text-green-600',
                        },
                        {
                            label: language === 'hi' ? 'कुल लाभ' : 'Total Profit',
                            value: formatCurrency(stats.totalProfit),
                            icon: stats.totalProfit >= 0 ? TrendingUp : TrendingDown,
                            color: stats.totalProfit >= 0 ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-600',
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

                {/* Filters */}
                <div className="bg-card rounded-2xl border border-border p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder={language === 'hi' ? 'फसल, किस्म या खेत से खोजें...' : 'Search by crop, variety, or plot...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Select value={cropTypeFilter} onValueChange={setCropTypeFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder={language === 'hi' ? 'फसल प्रकार' : 'Crop Type'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{language === 'hi' ? 'सभी' : 'All Types'}</SelectItem>
                                    <SelectItem value="millets">{language === 'hi' ? 'मिलेट' : 'Millets'}</SelectItem>
                                    <SelectItem value="pulses">{language === 'hi' ? 'दालें' : 'Pulses'}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder={language === 'hi' ? 'मौसम' : 'Season'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{language === 'hi' ? 'सभी मौसम' : 'All Seasons'}</SelectItem>
                                    <SelectItem value="kharif">{language === 'hi' ? 'खरीफ' : 'Kharif'}</SelectItem>
                                    <SelectItem value="rabi">{language === 'hi' ? 'रबी' : 'Rabi'}</SelectItem>
                                    <SelectItem value="summer">{language === 'hi' ? 'ग्रीष्म' : 'Summer'}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder={language === 'hi' ? 'स्थिति' : 'Status'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{language === 'hi' ? 'सभी' : 'All Status'}</SelectItem>
                                    <SelectItem value="active">{language === 'hi' ? 'सक्रिय' : 'Active'}</SelectItem>
                                    <SelectItem value="harvested">{language === 'hi' ? 'कटाई हुई' : 'Harvested'}</SelectItem>
                                    <SelectItem value="completed">{language === 'hi' ? 'पूर्ण' : 'Completed'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                        {error}
                    </div>
                )}

                {/* Crop Cycles List */}
                {filteredCycles.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border">
                        <Wheat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            {language === 'hi' ? 'कोई फसल इतिहास नहीं मिला' : 'No Crop History Found'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchQuery || statusFilter !== 'all' || seasonFilter !== 'all'
                                ? (language === 'hi' ? 'फ़िल्टर बदलकर देखें' : 'Try adjusting your filters')
                                : (language === 'hi' ? 'अपनी पहली फसल का रिकॉर्ड बनाएं' : 'Start by adding your first crop cycle')}
                        </p>
                        {!searchQuery && statusFilter === 'all' && seasonFilter === 'all' && (
                            <Button asChild size="lg">
                                <Link href="/farmer/crop-history/create">
                                    <Plus className="w-5 h-5 mr-2" />
                                    {language === 'hi' ? 'नई फसल जोड़ें' : 'Add New Crop'}
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCycles.map((cycle, idx) => {
                            const cropInfo = getMillet(cycle.crop);
                            const profit = cycle.total_revenue - cycle.total_input_cost;
                            const profitPerAcre = cycle.area_acres ? profit / cycle.area_acres : 0;

                            return (
                                <motion.div
                                    key={cycle.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Crop Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-3xl">{cycle.crop_type === 'millets' ? '🌾' : '🫘'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="font-semibold text-lg">
                                                        {language === 'hi' ? cropInfo.nameHi : cropInfo.name}
                                                    </h3>
                                                    {cycle.variety && (
                                                        <span className="text-muted-foreground">({cycle.variety})</span>
                                                    )}
                                                    <Badge className={`${statusColors[cycle.status]} border`}>
                                                        {language === 'hi'
                                                            ? statusLabels[cycle.status]?.hi || cycle.status
                                                            : statusLabels[cycle.status]?.en || cycle.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                                                    <p className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {language === 'hi'
                                                            ? seasonLabels[cycle.season]?.hi || cycle.season
                                                            : seasonLabels[cycle.season]?.en || cycle.season} {cycle.year}
                                                    </p>
                                                    {cycle.area_acres && (
                                                        <p className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {cycle.area_acres} {language === 'hi' ? 'एकड़' : 'acres'}
                                                        </p>
                                                    )}
                                                    <p>
                                                        {language === 'hi' ? 'लागत' : 'Cost'}: <span className="font-medium text-foreground">{formatCurrency(cycle.total_input_cost)}</span>
                                                    </p>
                                                    <p>
                                                        {language === 'hi' ? 'राजस्व' : 'Revenue'}: <span className="font-medium text-accent">{formatCurrency(cycle.total_revenue)}</span>
                                                    </p>
                                                </div>
                                                {cycle.total_yield_kg > 0 && (
                                                    <p className="text-sm mt-2">
                                                        {language === 'hi' ? 'उपज' : 'Yield'}: <span className="font-medium">{cycle.total_yield_kg} kg</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Profit & Actions */}
                                        <div className="flex flex-col items-end gap-3">
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold ${profit >= 0 ? 'text-accent' : 'text-red-500'}`}>
                                                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {language === 'hi' ? 'लाभ/हानि' : 'Profit/Loss'}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/farmer/crop-history/${cycle.id}`}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    {language === 'hi' ? 'विवरण देखें' : 'View Details'}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Quick Action Card */}
                <div className="mt-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                                <BarChart3 className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold text-lg">
                                    {language === 'hi' ? 'फसल रिपोर्ट देखें' : 'View Crop Reports'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'hi'
                                        ? 'अपनी सभी फसलों का विस्तृत विश्लेषण देखें'
                                        : 'Get detailed analytics of all your crops'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="touch-target">
                            {language === 'hi' ? 'रिपोर्ट देखें' : 'View Reports'}
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
