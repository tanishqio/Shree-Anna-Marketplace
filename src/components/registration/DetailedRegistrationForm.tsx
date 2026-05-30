"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { RoleConfig, Field } from '@/lib/registration-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DetailedRegistrationFormProps {
    config: RoleConfig;
}

export default function DetailedRegistrationForm({ config }: DetailedRegistrationFormProps) {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});

    const currentStep = config.steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / config.steps.length) * 100;

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleNext = () => {
        if (currentStepIndex < config.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleComplete = () => {
        console.log('Form Submitted:', formData);
        // Simulate submission
        setTimeout(() => {
            router.push(`/${config.role}/dashboard`);
        }, 1000);
    };

    const isFieldVisible = (field: Field) => {
        if (!field.dependsOn) return true;
        return formData[field.dependsOn.field] === field.dependsOn.value;
    };

    return (
        <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Sidebar Steps */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                            <h2 className="text-xl font-bold mb-4 capitalize">{config.role} Registration</h2>
                            <div className="space-y-4">
                                {config.steps.map((step, idx) => {
                                    const isActive = idx === currentStepIndex;
                                    const isCompleted = idx < currentStepIndex;

                                    return (
                                        <div
                                            key={step.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                                }`}
                                        >
                                            <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2
                        ${isActive ? 'border-primary bg-primary text-primary-foreground' :
                                                    isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}
                      `}>
                                                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${isActive ? 'text-foreground' : ''}`}>{step.title}</p>
                                                {isActive && <p className="text-xs opacity-80">In Progress</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="lg:col-span-8">
                        <Card className="p-6 sm:p-8 shadow-md border-border">
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-2xl font-bold">{currentStep.title}</h1>
                                    <span className="text-sm text-muted-foreground">
                                        Step {currentStepIndex + 1} of {config.steps.length}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">{currentStep.description}</p>
                                <Progress value={progress} className="h-2 mt-4" />
                            </div>

                            <div className="space-y-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        {currentStep.fields.map((field) => {
                                            if (!isFieldVisible(field)) return null;

                                            return (
                                                <div key={field.id} className="space-y-2">
                                                    <Label htmlFor={field.id} className="text-base">
                                                        {field.label}
                                                        {field.required && <span className="text-destructive ml-1">*</span>}
                                                    </Label>

                                                    {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' ? (
                                                        <Input
                                                            id={field.id}
                                                            type={field.type}
                                                            placeholder={field.placeholder}
                                                            value={formData[field.id] || ''}
                                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                            className="h-12"
                                                        />
                                                    ) : field.type === 'select' ? (
                                                        <Select
                                                            value={formData[field.id]}
                                                            onValueChange={(val) => handleInputChange(field.id, val)}
                                                        >
                                                            <SelectTrigger className="h-12">
                                                                <SelectValue placeholder="Select an option" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {field.options?.map((opt) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : field.type === 'radio' ? (
                                                        <RadioGroup
                                                            value={formData[field.id]}
                                                            onValueChange={(val) => handleInputChange(field.id, val)}
                                                            className="flex flex-col space-y-2"
                                                        >
                                                            {field.options?.map((opt) => (
                                                                <div key={opt.value} className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} />
                                                                    <Label htmlFor={`${field.id}-${opt.value}`} className="font-normal cursor-pointer">
                                                                        {opt.label}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    ) : field.type === 'multiselect' ? (
                                                        <div className="grid sm:grid-cols-2 gap-3">
                                                            {field.options?.map((opt) => {
                                                                const isSelected = (formData[field.id] || []).includes(opt.value);
                                                                return (
                                                                    <div
                                                                        key={opt.value}
                                                                        className={`
                                      flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors
                                      ${isSelected ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent/50'}
                                    `}
                                                                        onClick={() => {
                                                                            const current = formData[field.id] || [];
                                                                            const updated = current.includes(opt.value)
                                                                                ? current.filter((v: string) => v !== opt.value)
                                                                                : [...current, opt.value];
                                                                            handleInputChange(field.id, updated);
                                                                        }}
                                                                    >
                                                                        <Checkbox checked={isSelected} />
                                                                        <span className="text-sm font-medium">{opt.label}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : field.type === 'file' ? (
                                                        <div className="border-2 border-dashed border-input rounded-xl p-8 text-center hover:bg-accent/5 transition-colors cursor-pointer">
                                                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                                            <Input
                                                                id={field.id}
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => console.log(e.target.files)}
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>

                                <div className="flex justify-between pt-8 border-t border-border mt-8">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={currentStepIndex === 0}
                                        className="h-12 px-6"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button onClick={handleNext} className="h-12 px-8">
                                        {currentStepIndex === config.steps.length - 1 ? 'Complete Registration' : 'Next Step'}
                                        {currentStepIndex !== config.steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
