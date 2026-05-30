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
    Calendar,
    Star,
    Factory
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { batchesApi } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';
import { MCQCard, MCQOption } from '@/components/MCQCard';
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function CreateBatchPage() {
    const router = useRouter();
    const [role, setRole] = useState('processor');
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { language } = useLanguage();

    const [formData, setFormData] = useState({
        crop: '',
        total_weight: '',
        grade: '',
        processing_date: new Date().toISOString().split('T')[0],
        source_lots: [],
        notes: ''
    });

    // Options
    const milletOptions: MCQOption[] = milletTypes.map((millet) => ({
        id: millet.id,
        label: millet.name,
        labelHi: millet.nameHi,
        icon: <span className="text-3xl">🌾</span>,
    }));

    const gradeOptions: MCQOption[] = [
        { id: 'Grade A', label: 'Grade A', icon: <Star className="w-8 h-8 text-primary" /> },
        { id: 'Grade B', label: 'Grade B', icon: <Star className="w-8 h-8 text-muted-foreground" /> },
        { id: 'Grade C', label: 'Grade C', icon: <Star className="w-8 h-8 text-orange-400" /> },
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
            await batchesApi.create({
                crop: formData.crop,
                total_weight: parseFloat(formData.total_weight),
                grade: formData.grade,
                processing_date: new Date(formData.processing_date).toISOString(),
                source_lots: [],
                notes: formData.notes
            });
            router.push('/processor/batches');
        } catch (error) {
            console.error(error);
            alert("Failed to create batch");
            setIsSubmitting(false);
        }
    };

    const steps = [
        // Step 0: Crop Type
        {
            title: "Select Batch Crop",
            component: (
                <MCQCard
                    question="Which millet is in this batch?"
                    options={milletOptions}
                    value={formData.crop}
                    onChange={(v) => updateField('crop', v)}
                    columns={2}
                    size="lg"
                    language={language}
                />
            )
        },
        // Step 1: Weight & Grade
        {
            title: "Batch Details",
            component: (
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border p-6">
                        <label className="text-sm font-medium block mb-4 flex items-center gap-2">
                            <Scale className="w-4 h-4" /> Total Weight (kg)
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g. 500"
                            className="h-14 text-lg"
                            value={formData.total_weight}
                            onChange={(e) => updateField('total_weight', e.target.value)}
                        />
                    </div>

                    <MCQCard
                        question="Quality Grade"
                        options={gradeOptions}
                        value={formData.grade}
                        onChange={(v) => updateField('grade', v)}
                        columns={1}
                        size="md"
                        language={language}
                    />
                </div>
            )
        },
        // Step 2: Processing Date & Notes
        {
            title: "Processing Info",
            component: (
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border p-6">
                        <label className="text-sm font-medium block mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Processing Date
                        </label>
                        <Input
                            type="date"
                            className="h-14 text-lg"
                            value={formData.processing_date}
                            onChange={(e) => updateField('processing_date', e.target.value)}
                        />
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6">
                        <label className="text-sm font-medium block mb-2">Batch Notes</label>
                        <Input
                            placeholder="Shift details, machine ID, etc..."
                            value={formData.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                        />
                    </div>
                </div>
            )
        },
        // Step 3: Review
        {
            title: "Review Batch",
            component: (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                    <div className="flex items-center justify-center p-6 bg-muted/30 rounded-xl mb-4">
                        <Factory className="w-16 h-16 text-primary" />
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Crop</span>
                        <span className="font-semibold text-lg">{milletTypes.find(m => m.id === formData.crop)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-semibold text-lg">{formData.total_weight} kg</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Grade</span>
                        <span className="font-semibold">{formData.grade}</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-semibold">{new Date(formData.processing_date).toLocaleDateString()}</span>
                    </div>
                </div>
            )
        }
    ];

    const isStepValid = () => {
        switch (currentStep) {
            case 0: return !!formData.crop;
            case 1: return !!formData.total_weight && !!formData.grade;
            case 2: return !!formData.processing_date;
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
                    <div className="w-10" />
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
                            <>Confirm Batch <Check className="ml-2 w-5 h-5" /></>
                        ) : (
                            <>Continue <ChevronRight className="ml-2 w-5 h-5" /></>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
}
