"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Loader2,
    Scale,
    IndianRupee,
    Star,
    Leaf
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { requirementsApi } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';
import { MCQCard, MCQOption } from '@/components/MCQCard';
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function CreateRequirementPage() {
    const router = useRouter();
    const [role, setRole] = useState('processor');
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { language } = useLanguage();

    const [formData, setFormData] = useState({
        crop: '',
        qty_kg: '',
        target_price_per_qtl: '',
        quality_grade: '',
        is_organic: false,
        notes: '',
        required_by: '',
    });

    // Options for MCQ Cards
    const milletOptions: MCQOption[] = milletTypes.map((millet) => ({
        id: millet.id,
        label: millet.name,
        labelHi: millet.nameHi,
        icon: <span className="text-3xl">🌾</span>,
    }));

    const qualityOptions: MCQOption[] = [
        { id: 'Premium', label: 'Premium', icon: <Star className="w-8 h-8 text-primary" /> },
        { id: 'Standard', label: 'Standard', icon: <Star className="w-8 h-8 text-muted-foreground" /> },
        { id: 'Economy', label: 'Economy', icon: <Star className="w-8 h-8 text-orange-400" /> },
    ];

    const organicOptions: MCQOption[] = [
        { id: 'yes', label: 'Organic Only', icon: <Leaf className="w-8 h-8 text-green-600" /> },
        { id: 'no', label: 'Conventional', icon: <Leaf className="w-8 h-8 text-gray-400" /> },
    ];

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Create requirement in the database using requirementsApi
            await requirementsApi.create({
                crop: formData.crop,
                qty_kg: parseFloat(formData.qty_kg),
                target_price_per_qtl: parseFloat(formData.target_price_per_qtl),
                quality_grade: formData.quality_grade,
                is_organic: formData.is_organic,
                notes: formData.notes || undefined,
                required_by: formData.required_by || undefined,
            });

            // Navigate to processor dashboard on success
            router.push('/processor/dashboard');
        } catch (error) {
            console.error('Failed to create requirement:', error);
            alert('Failed to create requirement. Please try again.');
            setIsSubmitting(false);
        }
    };

    const steps = [
        // Step 0: Millet Type
        {
            title: "What do you need?",
            component: (
                <MCQCard
                    question="Select Millet Type"
                    options={milletOptions}
                    value={formData.crop}
                    onChange={(v) => updateField('crop', v)}
                    columns={2}
                    size="lg"
                    language={language}
                />
            )
        },
        // Step 1: Quality & Organic
        {
            title: "Quality Specifications",
            component: (
                <div className="space-y-8">
                    <MCQCard
                        question="Preferred Quality Grade"
                        options={qualityOptions}
                        value={formData.quality_grade}
                        onChange={(v) => updateField('quality_grade', v)}
                        columns={1}
                        size="md"
                        language={language}
                    />
                    <MCQCard
                        question="Organic Requirement"
                        options={organicOptions}
                        value={formData.is_organic ? 'yes' : 'no'}
                        onChange={(v) => updateField('is_organic', v === 'yes')}
                        columns={2}
                        size="md"
                        language={language}
                    />
                </div>
            )
        },
        // Step 2: Quantity & Price
        {
            title: "Quantity & Price",
            component: (
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border p-6">
                        <label className="text-sm font-medium block mb-4 flex items-center gap-2">
                            <Scale className="w-4 h-4" /> Required Quantity (kg)
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g. 1000"
                            className="h-14 text-lg"
                            value={formData.qty_kg}
                            onChange={(e) => updateField('qty_kg', e.target.value)}
                        />
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6">
                        <label className="text-sm font-medium block mb-4 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" /> Target Price (₹/quintal)
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g. 4500"
                            className="h-14 text-lg"
                            value={formData.target_price_per_qtl}
                            onChange={(e) => updateField('target_price_per_qtl', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            ≈ ₹{formData.target_price_per_qtl ? (parseFloat(formData.target_price_per_qtl) / 100).toFixed(2) : '0'}/kg
                        </p>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6">
                        <label className="text-sm font-medium block mb-2">Additional Notes</label>
                        <Input
                            placeholder="Any specific requirements..."
                            value={formData.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                        />
                    </div>
                </div>
            )
        },
        // Step 3: Review
        {
            title: "Review Requirement",
            component: (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Crop</span>
                        <span className="font-semibold text-lg">{milletTypes.find(m => m.id === formData.crop)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-semibold text-lg">{formData.qty_kg} kg</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Target Price</span>
                        <span className="font-semibold text-lg">₹{formData.target_price_per_qtl}/qtl</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Quality</span>
                        <span className="font-semibold">{formData.quality_grade} {formData.is_organic ? '(Organic)' : ''}</span>
                    </div>
                    {formData.notes && (
                        <div className="pt-2">
                            <span className="text-muted-foreground block mb-1">Notes</span>
                            <p className="text-sm bg-muted p-3 rounded-lg">{formData.notes}</p>
                        </div>
                    )}
                </div>
            )
        }
    ];

    const isStepValid = () => {
        switch (currentStep) {
            case 0: return !!formData.crop;
            case 1: return !!formData.quality_grade;
            case 2: return !!formData.qty_kg && !!formData.target_price_per_qtl;
            default: return true;
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="flex-1 container mx-auto px-4 py-6 max-w-lg flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 w-8 rounded-full transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-muted'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold font-heading">{steps[currentStep].title}</h1>
                </div>

                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {steps[currentStep].component}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-8 pb-6">
                    <Button
                        size="lg"
                        className="w-full text-lg h-14"
                        onClick={handleNext}
                        disabled={!isStepValid() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : currentStep === steps.length - 1 ? (
                            <>Confirm & Post <Check className="ml-2 w-5 h-5" /></>
                        ) : (
                            <>Continue <ChevronRight className="ml-2 w-5 h-5" /></>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
}
