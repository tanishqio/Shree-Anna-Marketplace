"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    Loader2,
    User,
    MapPin,
    Phone,
    Scale,
    IndianRupee,
    Leaf,
    Star,
    CheckCircle,
    Clock,
    Send
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { requirementsApi, requirementApplicationsApi, Requirement } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RequirementDetailPage() {
    const router = useRouter();
    const params = useParams();
    const requirementId = params?.id as string;
    const { user, isLoading: authLoading } = useAuth();

    const [requirement, setRequirement] = useState<Requirement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Application form
    const [offeredPrice, setOfferedPrice] = useState('');
    const [offeredQty, setOfferedQty] = useState('');
    const [message, setMessage] = useState('');

    const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id };

    useEffect(() => {
        const fetchData = async () => {
            if (!requirementId) return;

            try {
                setIsLoading(true);

                // Fetch requirement details
                const reqData = await requirementsApi.getById(requirementId);
                setRequirement(reqData);

                // Pre-fill form with target values
                setOfferedPrice(reqData.target_price_per_qtl?.toString() || '');
                setOfferedQty(reqData.qty_kg?.toString() || '');

                // Check if farmer already applied
                const { applied, application } = await requirementApplicationsApi.checkIfApplied(requirementId);
                setHasApplied(applied);
                if (application) {
                    setApplicationStatus(application.status);
                }
            } catch (e) {
                console.error('Failed to fetch requirement:', e);
                setError('Failed to load requirement details');
            } finally {
                setIsLoading(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [requirementId, authLoading]);

    const handleApply = async () => {
        if (!offeredPrice || !offeredQty) {
            alert('Please fill in your offered price and quantity');
            return;
        }

        setIsSubmitting(true);
        try {
            await requirementApplicationsApi.apply({
                requirement_id: requirementId,
                offered_price_per_qtl: parseFloat(offeredPrice),
                offered_qty_kg: parseFloat(offeredQty),
                message: message || undefined
            });

            setHasApplied(true);
            setApplicationStatus('pending');
            alert('Application submitted successfully! The processor will review your offer.');
        } catch (e: any) {
            console.error('Failed to apply:', e);
            if (e.code === '23505') {
                alert('You have already applied to this requirement.');
                setHasApplied(true);
            } else {
                alert('Failed to submit application. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole="farmer" />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading requirement...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !requirement) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole="farmer" />
                <main className="container mx-auto px-4 py-6">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{error || 'Requirement not found'}</p>
                        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                    </div>
                </main>
            </div>
        );
    }

    const millet = getMillet(requirement.crop);

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentRole="farmer" />

            <main className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-heading">Requirement Details</h1>
                        <p className="text-sm text-muted-foreground">Posted by processor</p>
                    </div>
                </div>

                {/* Requirement Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border p-6 mb-6"
                >
                    {/* Crop Info */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl">
                            🌾
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary">{millet.name} Wanted</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{requirement.quality_grade || 'Standard'} Grade</Badge>
                                {requirement.is_organic && (
                                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                                        <Leaf className="w-3 h-3 mr-1" /> Organic Only
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Scale className="w-4 h-4" /> Required Quantity
                            </span>
                            <span className="font-semibold text-lg">{requirement.qty_kg} kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <IndianRupee className="w-4 h-4" /> Target Price
                            </span>
                            <span className="font-semibold text-lg text-primary">₹{requirement.target_price_per_qtl}/qtl</span>
                        </div>
                        {requirement.notes && (
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-1">Additional Notes:</p>
                                <p className="text-sm bg-muted p-3 rounded-lg">{requirement.notes}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Processor Info */}
                {requirement.processor && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-2xl border border-border p-6 mb-6"
                    >
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Processor Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{requirement.processor.name}</p>
                                    <p className="text-sm text-muted-foreground">Verified Processor</p>
                                </div>
                            </div>
                            {requirement.processor.district && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" /> {requirement.processor.district}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Application Status */}
                {hasApplied ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`rounded-2xl border p-6 mb-6 ${applicationStatus === 'accepted'
                                ? 'bg-green-50 border-green-200'
                                : applicationStatus === 'rejected'
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-primary/5 border-primary/20'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {applicationStatus === 'accepted' ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : applicationStatus === 'rejected' ? (
                                <CheckCircle className="w-8 h-8 text-red-600" />
                            ) : (
                                <Clock className="w-8 h-8 text-primary" />
                            )}
                            <div>
                                <h3 className="font-semibold">
                                    {applicationStatus === 'accepted'
                                        ? 'Application Accepted!'
                                        : applicationStatus === 'rejected'
                                            ? 'Application Rejected'
                                            : 'Application Submitted'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {applicationStatus === 'accepted'
                                        ? 'The processor has accepted your offer. They will contact you shortly.'
                                        : applicationStatus === 'rejected'
                                            ? 'Unfortunately, the processor has declined your offer.'
                                            : 'Your application is pending review by the processor.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* Application Form */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-2xl border border-border p-6"
                    >
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" /> Apply to This Requirement
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium block mb-2">
                                    Your Offered Price (₹/qtl) *
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 4500"
                                    value={offeredPrice}
                                    onChange={(e) => setOfferedPrice(e.target.value)}
                                    className="h-12"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Target: ₹{requirement.target_price_per_qtl}/qtl
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium block mb-2">
                                    Quantity You Can Supply (kg) *
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={offeredQty}
                                    onChange={(e) => setOfferedQty(e.target.value)}
                                    className="h-12"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Required: {requirement.qty_kg} kg
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium block mb-2">
                                    Message (Optional)
                                </label>
                                <Input
                                    placeholder="Any additional information..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-14 text-lg mt-4"
                                onClick={handleApply}
                                disabled={isSubmitting || !offeredPrice || !offeredQty}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" /> Submit Application
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
