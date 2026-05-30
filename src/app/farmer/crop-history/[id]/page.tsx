"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Wheat,
    ChevronLeft,
    Loader2,
    Calendar,
    MapPin,
    Sprout,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Plus,
    Edit,
    Trash2,
    Leaf,
    Droplets,
    Bug,
    Users,
    Package,
    CheckCircle,
    Clock,
    X,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { cropHistoryApi, CropCycle, CropSeed, CropInput, CropActivity, CropHarvest, CropSale } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';

const statusColors: Record<string, string> = {
    active: 'bg-accent/10 text-accent border-accent/20',
    harvested: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const activityIcons: Record<string, any> = {
    land_preparation: MapPin,
    sowing: Sprout,
    irrigation: Droplets,
    weeding: Leaf,
    pest_control: Bug,
    harvest: Wheat,
    other: Clock,
};

export default function CropCycleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const cycleId = params.id as string;
    const [role, setRole] = useState('farmer');
    const { language } = useLanguage();

    const [cycle, setCycle] = useState<CropCycle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Form data for modals
    const [seedForm, setSeedForm] = useState({
        seed_name: '', variety: '', quantity_kg: '', cost_per_kg: '', total_cost: '', supplier: '', sowing_date: '', notes: ''
    });
    const [inputForm, setInputForm] = useState({
        input_type: 'fertilizer', input_name: '', is_organic: false, quantity: '', cost: '', application_date: '', purpose: '', notes: ''
    });
    const [activityForm, setActivityForm] = useState({
        activity_type: 'other', activity_name: '', activity_date: '', cost: '', labor_hours: '', labor_cost: '', description: '', notes: ''
    });
    const [harvestForm, setHarvestForm] = useState({
        harvest_date: '', yield_kg: '', quality_grade: '', moisture_level: '', harvest_cost: '', notes: ''
    });
    const [saleForm, setSaleForm] = useState({
        buyer_name: '', buyer_type: '', quantity_kg: '', price_per_kg: '', total_amount: '', sale_date: '', notes: ''
    });

    const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id, nameHi: id };

    const fetchCycle = async () => {
        try {
            setIsLoading(true);
            const data = await cropHistoryApi.getById(cycleId);
            setCycle(data);
        } catch (err) {
            console.error('Error fetching crop cycle:', err);
            setError('Failed to load crop cycle details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCycle();
    }, [cycleId]);

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

    // Add handlers
    const handleAddSeed = async () => {
        if (!seedForm.seed_name || !seedForm.quantity_kg) {
            setModalError(language === 'hi' ? 'बीज का नाम और मात्रा आवश्यक है' : 'Seed name and quantity are required');
            return;
        }
        setIsSubmitting(true);
        setModalError(null);
        try {
            await cropHistoryApi.addSeed(cycleId, {
                seed_name: seedForm.seed_name,
                variety: seedForm.variety || undefined,
                quantity_kg: parseFloat(seedForm.quantity_kg),
                cost_per_kg: seedForm.cost_per_kg ? parseFloat(seedForm.cost_per_kg) : undefined,
                total_cost: seedForm.total_cost ? parseFloat(seedForm.total_cost) : undefined,
                supplier: seedForm.supplier || undefined,
                sowing_date: seedForm.sowing_date || undefined,
                notes: seedForm.notes || undefined,
            });
            await fetchCycle();
            setActiveModal(null);
            setSeedForm({ seed_name: '', variety: '', quantity_kg: '', cost_per_kg: '', total_cost: '', supplier: '', sowing_date: '', notes: '' });
        } catch (err) {
            setModalError(language === 'hi' ? 'बीज जोड़ने में विफल' : 'Failed to add seed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddInput = async () => {
        if (!inputForm.input_name) {
            setModalError(language === 'hi' ? 'इनपुट नाम आवश्यक है' : 'Input name is required');
            return;
        }
        setIsSubmitting(true);
        setModalError(null);
        try {
            await cropHistoryApi.addInput(cycleId, {
                input_type: inputForm.input_type,
                input_name: inputForm.input_name,
                is_organic: inputForm.is_organic,
                quantity: inputForm.quantity || undefined,
                cost: inputForm.cost ? parseFloat(inputForm.cost) : undefined,
                application_date: inputForm.application_date || undefined,
                purpose: inputForm.purpose || undefined,
                notes: inputForm.notes || undefined,
            });
            await fetchCycle();
            setActiveModal(null);
            setInputForm({ input_type: 'fertilizer', input_name: '', is_organic: false, quantity: '', cost: '', application_date: '', purpose: '', notes: '' });
        } catch (err) {
            setModalError(language === 'hi' ? 'इनपुट जोड़ने में विफल' : 'Failed to add input');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddActivity = async () => {
        if (!activityForm.activity_name || !activityForm.activity_date) {
            setModalError(language === 'hi' ? 'गतिविधि नाम और तारीख आवश्यक है' : 'Activity name and date are required');
            return;
        }
        setIsSubmitting(true);
        setModalError(null);
        try {
            await cropHistoryApi.addActivity(cycleId, {
                activity_type: activityForm.activity_type,
                activity_name: activityForm.activity_name,
                activity_date: activityForm.activity_date,
                cost: activityForm.cost ? parseFloat(activityForm.cost) : 0,
                labor_hours: activityForm.labor_hours ? parseFloat(activityForm.labor_hours) : undefined,
                labor_cost: activityForm.labor_cost ? parseFloat(activityForm.labor_cost) : undefined,
                description: activityForm.description || undefined,
                notes: activityForm.notes || undefined,
            });
            await fetchCycle();
            setActiveModal(null);
            setActivityForm({ activity_type: 'other', activity_name: '', activity_date: '', cost: '', labor_hours: '', labor_cost: '', description: '', notes: '' });
        } catch (err) {
            setModalError(language === 'hi' ? 'गतिविधि जोड़ने में विफल' : 'Failed to add activity');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddHarvest = async () => {
        if (!harvestForm.harvest_date || !harvestForm.yield_kg) {
            setModalError(language === 'hi' ? 'कटाई की तारीख और उपज आवश्यक है' : 'Harvest date and yield are required');
            return;
        }
        setIsSubmitting(true);
        setModalError(null);
        try {
            await cropHistoryApi.addHarvest(cycleId, {
                harvest_date: harvestForm.harvest_date,
                yield_kg: parseFloat(harvestForm.yield_kg),
                quality_grade: harvestForm.quality_grade || undefined,
                moisture_level: harvestForm.moisture_level || undefined,
                harvest_cost: harvestForm.harvest_cost ? parseFloat(harvestForm.harvest_cost) : 0,
                notes: harvestForm.notes || undefined,
            });
            await fetchCycle();
            setActiveModal(null);
            setHarvestForm({ harvest_date: '', yield_kg: '', quality_grade: '', moisture_level: '', harvest_cost: '', notes: '' });
        } catch (err) {
            setModalError(language === 'hi' ? 'कटाई जोड़ने में विफल' : 'Failed to add harvest');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddSale = async () => {
        if (!saleForm.quantity_kg || !saleForm.price_per_kg || !saleForm.sale_date) {
            setModalError(language === 'hi' ? 'मात्रा, कीमत और तारीख आवश्यक है' : 'Quantity, price and date are required');
            return;
        }
        setIsSubmitting(true);
        setModalError(null);
        try {
            const qty = parseFloat(saleForm.quantity_kg);
            const price = parseFloat(saleForm.price_per_kg);
            await cropHistoryApi.addSale(cycleId, {
                buyer_name: saleForm.buyer_name || undefined,
                buyer_type: saleForm.buyer_type || undefined,
                quantity_kg: qty,
                price_per_kg: price,
                total_amount: saleForm.total_amount ? parseFloat(saleForm.total_amount) : qty * price,
                sale_date: saleForm.sale_date,
                notes: saleForm.notes || undefined,
            });
            await fetchCycle();
            setActiveModal(null);
            setSaleForm({ buyer_name: '', buyer_type: '', quantity_kg: '', price_per_kg: '', total_amount: '', sale_date: '', notes: '' });
        } catch (err) {
            setModalError(language === 'hi' ? 'बिक्री जोड़ने में विफल' : 'Failed to add sale');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !cycle) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6">
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-4">{error || 'Crop cycle not found'}</p>
                        <Button asChild>
                            <Link href="/farmer/crop-history">{language === 'hi' ? 'वापस जाएं' : 'Go Back'}</Link>
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const cropInfo = getMillet(cycle.crop);
    const profit = cycle.total_revenue - cycle.total_input_cost;
    const profitPerAcre = cycle.area_acres ? profit / cycle.area_acres : 0;
    const costPerKg = cycle.total_yield_kg > 0 ? cycle.total_input_cost / cycle.total_yield_kg : 0;
    const revenuePerKg = cycle.total_yield_kg > 0 ? cycle.total_revenue / cycle.total_yield_kg : 0;

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/farmer/crop-history">
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <span className="text-3xl">{cycle.crop_type === 'millets' ? '🌾' : '🫘'}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-heading font-bold">
                                        {language === 'hi' ? cropInfo.nameHi : cropInfo.name}
                                    </h1>
                                    {cycle.variety && <span className="text-muted-foreground">({cycle.variety})</span>}
                                    <Badge className={`${statusColors[cycle.status]} border`}>
                                        {cycle.status}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1">
                                    {cycle.season} {cycle.year} {cycle.plot_name && `• ${cycle.plot_name}`} {cycle.area_acres && `• ${cycle.area_acres} acres`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: language === 'hi' ? 'कुल लागत' : 'Total Cost', value: formatCurrency(cycle.total_input_cost), color: 'text-red-500' },
                        { label: language === 'hi' ? 'कुल राजस्व' : 'Total Revenue', value: formatCurrency(cycle.total_revenue), color: 'text-accent' },
                        { label: language === 'hi' ? 'लाभ/हानि' : 'Profit/Loss', value: `${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`, color: profit >= 0 ? 'text-accent' : 'text-red-500' },
                        { label: language === 'hi' ? 'कुल उपज' : 'Total Yield', value: `${cycle.total_yield_kg} kg`, color: 'text-primary' },
                        { label: language === 'hi' ? 'प्रति किलो लागत' : 'Cost/kg', value: formatCurrency(costPerKg), color: 'text-muted-foreground' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-card rounded-xl border border-border p-4"
                        >
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Seeds Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Sprout className="w-5 h-5 text-primary" />
                                    {language === 'hi' ? 'बीज' : 'Seeds'}
                                </CardTitle>
                                <CardDescription>{language === 'hi' ? 'इस्तेमाल किए गए बीज' : 'Seeds used for this crop'}</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setActiveModal('seed')}>
                                <Plus className="w-4 h-4 mr-1" /> {language === 'hi' ? 'जोड़ें' : 'Add'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {cycle.seeds?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">{language === 'hi' ? 'कोई बीज नहीं जोड़ा गया' : 'No seeds added yet'}</p>
                            ) : (
                                <div className="space-y-3">
                                    {cycle.seeds?.map((seed) => (
                                        <div key={seed.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                                            <div>
                                                <p className="font-medium">{seed.seed_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {seed.quantity_kg} kg {seed.total_cost && `• ${formatCurrency(seed.total_cost)}`}
                                                </p>
                                            </div>
                                            {seed.sowing_date && <Badge variant="outline">{formatDate(seed.sowing_date)}</Badge>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Inputs Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Leaf className="w-5 h-5 text-green-600" />
                                    {language === 'hi' ? 'खाद और इनपुट' : 'Fertilizers & Inputs'}
                                </CardTitle>
                                <CardDescription>{language === 'hi' ? 'उर्वरक, कीटनाशक आदि' : 'Fertilizers, pesticides etc.'}</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setActiveModal('input')}>
                                <Plus className="w-4 h-4 mr-1" /> {language === 'hi' ? 'जोड़ें' : 'Add'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {cycle.inputs?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">{language === 'hi' ? 'कोई इनपुट नहीं जोड़ा गया' : 'No inputs added yet'}</p>
                            ) : (
                                <div className="space-y-3">
                                    {cycle.inputs?.map((input) => (
                                        <div key={input.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{input.input_name}</p>
                                                    {input.is_organic && <Badge className="bg-green-100 text-green-700 text-xs">Organic</Badge>}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {input.quantity} {input.cost && `• ${formatCurrency(input.cost)}`}
                                                </p>
                                            </div>
                                            <Badge variant="outline">{input.input_type}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activities Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                    {language === 'hi' ? 'गतिविधियाँ' : 'Activities'}
                                </CardTitle>
                                <CardDescription>{language === 'hi' ? 'खेत की गतिविधियाँ' : 'Farm operations & activities'}</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setActiveModal('activity')}>
                                <Plus className="w-4 h-4 mr-1" /> {language === 'hi' ? 'जोड़ें' : 'Add'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {cycle.activities?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">{language === 'hi' ? 'कोई गतिविधि नहीं जोड़ी गई' : 'No activities added yet'}</p>
                            ) : (
                                <div className="space-y-3">
                                    {cycle.activities?.map((activity) => {
                                        const Icon = activityIcons[activity.activity_type] || Clock;
                                        return (
                                            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{activity.activity_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(activity.activity_date)} {activity.cost > 0 && `• ${formatCurrency(activity.cost)}`}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Harvest Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Wheat className="w-5 h-5 text-amber-500" />
                                    {language === 'hi' ? 'कटाई' : 'Harvest'}
                                </CardTitle>
                                <CardDescription>{language === 'hi' ? 'कटाई का रिकॉर्ड' : 'Harvest records'}</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setActiveModal('harvest')}>
                                <Plus className="w-4 h-4 mr-1" /> {language === 'hi' ? 'जोड़ें' : 'Add'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {cycle.harvests?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">{language === 'hi' ? 'कोई कटाई नहीं जोड़ी गई' : 'No harvest recorded yet'}</p>
                            ) : (
                                <div className="space-y-3">
                                    {cycle.harvests?.map((harvest) => (
                                        <div key={harvest.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                                            <div>
                                                <p className="font-medium">{harvest.yield_kg} kg</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(harvest.harvest_date)} {harvest.quality_grade && `• ${harvest.quality_grade}`}
                                                </p>
                                            </div>
                                            {harvest.harvest_cost > 0 && <Badge variant="outline">{formatCurrency(harvest.harvest_cost)}</Badge>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sales Section - Full Width */}
                <Card className="mt-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-accent" />
                                {language === 'hi' ? 'बिक्री इतिहास' : 'Sales History'}
                            </CardTitle>
                            <CardDescription>{language === 'hi' ? 'इस फसल की बिक्री' : 'Sales from this crop'}</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setActiveModal('sale')}>
                            <Plus className="w-4 h-4 mr-1" /> {language === 'hi' ? 'बिक्री जोड़ें' : 'Add Sale'}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {cycle.sales?.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">{language === 'hi' ? 'कोई बिक्री नहीं दर्ज की गई' : 'No sales recorded yet'}</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{language === 'hi' ? 'तारीख' : 'Date'}</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{language === 'hi' ? 'खरीदार' : 'Buyer'}</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{language === 'hi' ? 'मात्रा' : 'Quantity'}</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{language === 'hi' ? 'मूल्य/kg' : 'Price/kg'}</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{language === 'hi' ? 'कुल' : 'Total'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cycle.sales?.map((sale) => (
                                            <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/30">
                                                <td className="py-3 px-4">{formatDate(sale.sale_date)}</td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium">{sale.buyer_name || '-'}</p>
                                                        {sale.buyer_type && <p className="text-xs text-muted-foreground">{sale.buyer_type}</p>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right">{sale.quantity_kg} kg</td>
                                                <td className="py-3 px-4 text-right">{formatCurrency(sale.price_per_kg)}</td>
                                                <td className="py-3 px-4 text-right font-semibold text-accent">{formatCurrency(sale.total_amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Add Seed Modal */}
            <Dialog open={activeModal === 'seed'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{language === 'hi' ? 'बीज जोड़ें' : 'Add Seed'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{language === 'hi' ? 'बीज का नाम' : 'Seed Name'} *</Label>
                            <Input value={seedForm.seed_name} onChange={(e) => setSeedForm({ ...seedForm, seed_name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'मात्रा (kg)' : 'Quantity (kg)'} *</Label>
                                <Input type="number" value={seedForm.quantity_kg} onChange={(e) => setSeedForm({ ...seedForm, quantity_kg: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'कुल लागत' : 'Total Cost'}</Label>
                                <Input type="number" value={seedForm.total_cost} onChange={(e) => setSeedForm({ ...seedForm, total_cost: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{language === 'hi' ? 'बुवाई की तारीख' : 'Sowing Date'}</Label>
                            <Input type="date" value={seedForm.sowing_date} onChange={(e) => setSeedForm({ ...seedForm, sowing_date: e.target.value })} />
                        </div>
                        {modalError && <p className="text-sm text-destructive">{modalError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
                        <Button onClick={handleAddSeed} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {language === 'hi' ? 'जोड़ें' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Input Modal */}
            <Dialog open={activeModal === 'input'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{language === 'hi' ? 'इनपुट जोड़ें' : 'Add Input'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{language === 'hi' ? 'प्रकार' : 'Type'}</Label>
                            <Select value={inputForm.input_type} onValueChange={(v) => setInputForm({ ...inputForm, input_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fertilizer">{language === 'hi' ? 'उर्वरक' : 'Fertilizer'}</SelectItem>
                                    <SelectItem value="pesticide">{language === 'hi' ? 'कीटनाशक' : 'Pesticide'}</SelectItem>
                                    <SelectItem value="herbicide">{language === 'hi' ? 'खरपतवारनाशी' : 'Herbicide'}</SelectItem>
                                    <SelectItem value="other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{language === 'hi' ? 'नाम' : 'Name'} *</Label>
                            <Input value={inputForm.input_name} onChange={(e) => setInputForm({ ...inputForm, input_name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'मात्रा' : 'Quantity'}</Label>
                                <Input value={inputForm.quantity} onChange={(e) => setInputForm({ ...inputForm, quantity: e.target.value })} placeholder="e.g., 50 kg" />
                            </div>
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'लागत' : 'Cost'}</Label>
                                <Input type="number" value={inputForm.cost} onChange={(e) => setInputForm({ ...inputForm, cost: e.target.value })} />
                            </div>
                        </div>
                        {modalError && <p className="text-sm text-destructive">{modalError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
                        <Button onClick={handleAddInput} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {language === 'hi' ? 'जोड़ें' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Activity Modal */}
            <Dialog open={activeModal === 'activity'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{language === 'hi' ? 'गतिविधि जोड़ें' : 'Add Activity'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{language === 'hi' ? 'प्रकार' : 'Type'}</Label>
                            <Select value={activityForm.activity_type} onValueChange={(v) => setActivityForm({ ...activityForm, activity_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="land_preparation">{language === 'hi' ? 'भूमि तैयारी' : 'Land Preparation'}</SelectItem>
                                    <SelectItem value="sowing">{language === 'hi' ? 'बुवाई' : 'Sowing'}</SelectItem>
                                    <SelectItem value="irrigation">{language === 'hi' ? 'सिंचाई' : 'Irrigation'}</SelectItem>
                                    <SelectItem value="weeding">{language === 'hi' ? 'निराई' : 'Weeding'}</SelectItem>
                                    <SelectItem value="pest_control">{language === 'hi' ? 'कीट नियंत्रण' : 'Pest Control'}</SelectItem>
                                    <SelectItem value="harvest">{language === 'hi' ? 'कटाई' : 'Harvest'}</SelectItem>
                                    <SelectItem value="other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{language === 'hi' ? 'गतिविधि का नाम' : 'Activity Name'} *</Label>
                            <Input value={activityForm.activity_name} onChange={(e) => setActivityForm({ ...activityForm, activity_name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'तारीख' : 'Date'} *</Label>
                                <Input type="date" value={activityForm.activity_date} onChange={(e) => setActivityForm({ ...activityForm, activity_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'लागत' : 'Cost'}</Label>
                                <Input type="number" value={activityForm.cost} onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })} />
                            </div>
                        </div>
                        {modalError && <p className="text-sm text-destructive">{modalError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
                        <Button onClick={handleAddActivity} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {language === 'hi' ? 'जोड़ें' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Harvest Modal */}
            <Dialog open={activeModal === 'harvest'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{language === 'hi' ? 'कटाई जोड़ें' : 'Add Harvest'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'कटाई की तारीख' : 'Harvest Date'} *</Label>
                                <Input type="date" value={harvestForm.harvest_date} onChange={(e) => setHarvestForm({ ...harvestForm, harvest_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'उपज (kg)' : 'Yield (kg)'} *</Label>
                                <Input type="number" value={harvestForm.yield_kg} onChange={(e) => setHarvestForm({ ...harvestForm, yield_kg: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'गुणवत्ता ग्रेड' : 'Quality Grade'}</Label>
                                <Select value={harvestForm.quality_grade} onValueChange={(v) => setHarvestForm({ ...harvestForm, quality_grade: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="premium">Premium</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="economy">Economy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'कटाई लागत' : 'Harvest Cost'}</Label>
                                <Input type="number" value={harvestForm.harvest_cost} onChange={(e) => setHarvestForm({ ...harvestForm, harvest_cost: e.target.value })} />
                            </div>
                        </div>
                        {modalError && <p className="text-sm text-destructive">{modalError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
                        <Button onClick={handleAddHarvest} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {language === 'hi' ? 'जोड़ें' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Sale Modal */}
            <Dialog open={activeModal === 'sale'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{language === 'hi' ? 'बिक्री जोड़ें' : 'Add Sale'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'खरीदार का नाम' : 'Buyer Name'}</Label>
                                <Input value={saleForm.buyer_name} onChange={(e) => setSaleForm({ ...saleForm, buyer_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'खरीदार प्रकार' : 'Buyer Type'}</Label>
                                <Select value={saleForm.buyer_type} onValueChange={(v) => setSaleForm({ ...saleForm, buyer_type: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="processor">{language === 'hi' ? 'प्रोसेसर' : 'Processor'}</SelectItem>
                                        <SelectItem value="trader">{language === 'hi' ? 'व्यापारी' : 'Trader'}</SelectItem>
                                        <SelectItem value="fpo">FPO</SelectItem>
                                        <SelectItem value="shg">SHG</SelectItem>
                                        <SelectItem value="retail">{language === 'hi' ? 'खुदरा' : 'Retail'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'मात्रा (kg)' : 'Quantity (kg)'} *</Label>
                                <Input type="number" value={saleForm.quantity_kg} onChange={(e) => setSaleForm({ ...saleForm, quantity_kg: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'मूल्य/kg' : 'Price/kg'} *</Label>
                                <Input type="number" value={saleForm.price_per_kg} onChange={(e) => setSaleForm({ ...saleForm, price_per_kg: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{language === 'hi' ? 'तारीख' : 'Date'} *</Label>
                                <Input type="date" value={saleForm.sale_date} onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })} />
                            </div>
                        </div>
                        {modalError && <p className="text-sm text-destructive">{modalError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
                        <Button onClick={handleAddSale} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {language === 'hi' ? 'जोड़ें' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
