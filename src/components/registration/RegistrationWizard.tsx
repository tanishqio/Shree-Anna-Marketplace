"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlashCard } from '@/components/FlashCard';
import { MCQCard } from '@/components/MCQCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleConfig, Field } from '@/lib/registration-config';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface RegistrationWizardProps {
    config: RoleConfig;
}

export default function RegistrationWizard({ config }: RegistrationWizardProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Record<string, any>>({});
    const { language } = useLanguage();

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleComplete = (data: Record<string, unknown>) => {
        console.log('Form Submitted:', { ...formData, ...data });
        // Simulate submission and redirect
        setTimeout(() => {
            router.push(`/${config.role}/dashboard`);
        }, 1000);
    };

    // Transform config steps into FlashCard steps
    const flashCardSteps = config.steps.map(step => {
        return {
            id: step.id,
            title: step.title,
            description: step.description || '',
            // We render the fields as the 'input' content for the FlashCard
            input: (
                <div className="w-full space-y-6">
                    {step.fields.map(field => {
                        // Check dependency
                        if (field.dependsOn) {
                            const dependentValue = formData[field.dependsOn.field];
                            if (dependentValue !== field.dependsOn.value) {
                                return null;
                            }
                        }

                        return (
                            <div key={field.id} className="space-y-3">
                                {/* For text/number/email/file inputs, show label. For MCQ, the card has its own question header if needed, but here we might have multiple MCQs on one card, so we need labels. */}
                                {(field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' || field.type === 'file') && (
                                    <Label htmlFor={field.id} className="text-lg font-medium">
                                        {field.label}
                                        {field.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>
                                )}

                                {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' ? (
                                    <Input
                                        id={field.id}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        className="h-14 text-lg"
                                    />
                                ) : field.type === 'select' || field.type === 'radio' || field.type === 'multiselect' ? (
                                    <MCQCard
                                        question={field.label} // Use label as question
                                        options={field.options?.map(opt => ({
                                            id: opt.value,
                                            label: opt.label,
                                        })) || []}
                                        value={formData[field.id]}
                                        onChange={(val) => handleInputChange(field.id, val)}
                                        multiSelect={field.type === 'multiselect'}
                                        columns={2}
                                        size="md"
                                        className="mb-4"
                                    />
                                ) : field.type === 'file' ? (
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-accent/5 transition-colors cursor-pointer">
                                        <span className="text-4xl mb-2 block">📄</span>
                                        <p className="text-base text-muted-foreground">Tap to upload document</p>
                                        <Input
                                            id={field.id}
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                console.log(e.target.files);
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            )
        };
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8 px-4">
            <div className="max-w-md mx-auto mb-8 text-center">
                <h1 className="text-2xl font-bold font-heading text-primary">
                    {config.role.charAt(0).toUpperCase() + config.role.slice(1)} Registration
                </h1>
            </div>

            <FlashCard
                steps={flashCardSteps}
                onComplete={handleComplete}
                className="max-w-xl"
            />
        </div>
    );
}
