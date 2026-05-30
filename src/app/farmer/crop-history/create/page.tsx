"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Wheat,
    ChevronLeft,
    Loader2,
    Calendar,
    MapPin,
    Sprout,
    CheckCircle,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useLanguage } from '@/lib/hooks/useLanguage';
import { cropHistoryApi } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';

const pulseTypes = [
    { id: 'toor_dal', name: 'Toor Dal (Arhar)', nameHi: 'तूर दाल (अरहर)' },
    { id: 'chana_dal', name: 'Chana Dal', nameHi: 'चना दाल' },
    { id: 'moong_dal', name: 'Moong Dal', nameHi: 'मूंग दाल' },
    { id: 'urad_dal', name: 'Urad Dal', nameHi: 'उड़द दाल' },
    { id: 'masoor_dal', name: 'Masoor Dal', nameHi: 'मसूर दाल' },
    { id: 'moth_dal', name: 'Moth Dal', nameHi: 'मोठ दाल' },
    { id: 'kulthi', name: 'Horse Gram (Kulthi)', nameHi: 'कुल्थी' },
    { id: 'rajma', name: 'Rajma', nameHi: 'राजमा' },
    { id: 'lobia', name: 'Black-eyed Peas (Lobia)', nameHi: 'लोबिया' },
];

const seasons = [
    { id: 'kharif', name: 'Kharif (Jun-Oct)', nameHi: 'खरीफ (जून-अक्टूबर)' },
    { id: 'rabi', name: 'Rabi (Nov-Mar)', nameHi: 'रबी (नवंबर-मार्च)' },
    { id: 'summer', name: 'Summer (Apr-Jun)', nameHi: 'ग्रीष्म (अप्रैल-जून)' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function CreateCropCyclePage() {
    const router = useRouter();
    const [role, setRole] = useState('farmer');
    const { language } = useLanguage();

    const [formData, setFormData] = useState({
        crop_type: '',
        crop: '',
        variety: '',
        season: '',
        year: currentYear,
        plot_name: '',
        area_acres: '',
        sowing_date: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const getCropOptions = () => {
        if (formData.crop_type === 'millets') {
            return milletTypes;
        } else if (formData.crop_type === 'pulses') {
            return pulseTypes;
        }
        return [];
    };

    const validateForm = () => {
        if (!formData.crop_type) {
            setError(language === 'hi' ? 'कृपया फसल प्रकार चुनें' : 'Please select crop type');
            return false;
        }
        if (!formData.crop) {
            setError(language === 'hi' ? 'कृपया फसल चुनें' : 'Please select a crop');
            return false;
        }
        if (!formData.season) {
            setError(language === 'hi' ? 'कृपया मौसम चुनें' : 'Please select a season');
            return false;
        }
        if (!formData.year) {
            setError(language === 'hi' ? 'कृपया वर्ष चुनें' : 'Please select a year');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const cycle = await cropHistoryApi.create({
                crop_type: formData.crop_type,
                crop: formData.crop,
                variety: formData.variety || undefined,
                season: formData.season,
                year: formData.year,
                plot_name: formData.plot_name || undefined,
                area_acres: formData.area_acres ? parseFloat(formData.area_acres) : undefined,
                sowing_date: formData.sowing_date || undefined,
            });

            setSuccess(true);

            // Redirect to detail page after success
            setTimeout(() => {
                router.push(`/farmer/crop-history/${cycle.id}`);
            }, 1500);
        } catch (err) {
            console.error('Error creating crop cycle:', err);
            setError(language === 'hi' ? 'फसल चक्र बनाने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to create crop cycle. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-accent" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {language === 'hi' ? 'फसल चक्र बनाया गया!' : 'Crop Cycle Created!'}
                        </h2>
                        <p className="text-muted-foreground">
                            {language === 'hi' ? 'विवरण पृष्ठ पर जा रहे हैं...' : 'Redirecting to details page...'}
                        </p>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/farmer/crop-history">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-2">
                            <Sprout className="w-8 h-8 text-primary" />
                            {language === 'hi' ? 'नई फसल जोड़ें' : 'Add New Crop Cycle'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {language === 'hi' ? 'अपनी नई फसल का विवरण दर्ज करें' : 'Enter details of your new crop cycle'}
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wheat className="w-5 h-5 text-primary" />
                                {language === 'hi' ? 'फसल विवरण' : 'Crop Details'}
                            </CardTitle>
                            <CardDescription>
                                {language === 'hi'
                                    ? 'फसल के बारे में बुनियादी जानकारी'
                                    : 'Basic information about your crop'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Crop Type */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        {language === 'hi' ? 'फसल प्रकार' : 'Crop Type'} *
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'millets', label: language === 'hi' ? 'मिलेट' : 'Millets', emoji: '🌾' },
                                            { id: 'pulses', label: language === 'hi' ? 'दालें' : 'Pulses', emoji: '🫘' },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => {
                                                    updateField('crop_type', type.id);
                                                    updateField('crop', ''); // Reset crop when type changes
                                                }}
                                                className={`p-4 rounded-xl border-2 transition-all ${formData.crop_type === type.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <span className="text-3xl mb-2 block">{type.emoji}</span>
                                                <span className="font-medium">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Crop Selection */}
                                {formData.crop_type && (
                                    <div className="space-y-2">
                                        <Label>
                                            {language === 'hi' ? 'फसल' : 'Crop'} *
                                        </Label>
                                        <Select value={formData.crop} onValueChange={(v) => updateField('crop', v)}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder={language === 'hi' ? 'फसल चुनें' : 'Select Crop'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getCropOptions().map((crop) => (
                                                    <SelectItem key={crop.id} value={crop.id}>
                                                        {language === 'hi' ? crop.nameHi : crop.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Variety */}
                                <div className="space-y-2">
                                    <Label>
                                        {language === 'hi' ? 'किस्म (वैकल्पिक)' : 'Variety (Optional)'}
                                    </Label>
                                    <Input
                                        placeholder={language === 'hi' ? 'जैसे: GPU-28, CO-15' : 'e.g., GPU-28, CO-15'}
                                        value={formData.variety}
                                        onChange={(e) => updateField('variety', e.target.value)}
                                        className="h-12"
                                    />
                                </div>

                                {/* Season & Year */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {language === 'hi' ? 'मौसम' : 'Season'} *
                                        </Label>
                                        <Select value={formData.season} onValueChange={(v) => updateField('season', v)}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder={language === 'hi' ? 'मौसम चुनें' : 'Select Season'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {seasons.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {language === 'hi' ? s.nameHi : s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            {language === 'hi' ? 'वर्ष' : 'Year'} *
                                        </Label>
                                        <Select value={String(formData.year)} onValueChange={(v) => updateField('year', parseInt(v))}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Plot & Area */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {language === 'hi' ? 'खेत / प्लॉट नाम' : 'Plot / Field Name'}
                                        </Label>
                                        <Input
                                            placeholder={language === 'hi' ? 'जैसे: पूर्वी खेत' : 'e.g., East Field'}
                                            value={formData.plot_name}
                                            onChange={(e) => updateField('plot_name', e.target.value)}
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            {language === 'hi' ? 'क्षेत्र (एकड़)' : 'Area (Acres)'}
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder={language === 'hi' ? 'जैसे: 2.5' : 'e.g., 2.5'}
                                            value={formData.area_acres}
                                            onChange={(e) => updateField('area_acres', e.target.value)}
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                {/* Sowing Date */}
                                <div className="space-y-2">
                                    <Label>
                                        {language === 'hi' ? 'बुवाई की तारीख' : 'Sowing Date'}
                                    </Label>
                                    <Input
                                        type="date"
                                        value={formData.sowing_date}
                                        onChange={(e) => updateField('sowing_date', e.target.value)}
                                        className="h-12"
                                    />
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="flex-1 h-12"
                                    >
                                        {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-12"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                {language === 'hi' ? 'बना रहे हैं...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <Sprout className="w-5 h-5 mr-2" />
                                                {language === 'hi' ? 'फसल चक्र बनाएं' : 'Create Crop Cycle'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
