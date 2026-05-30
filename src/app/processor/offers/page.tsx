"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    Loader2,
    Package,
    IndianRupee,
    User,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';

interface Offer {
    id: string;
    listing_id: string;
    listing_crop?: string;
    seller_name?: string;
    price_per_qtl: number;
    qty_kg: number;
    status: string;
    message?: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    accepted: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    countered: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function ProcessorOffersPage() {
    const [role, setRole] = useState('processor');
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOffers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Get offers made by processor (as buyer)
            const response = await api.get<any>('/offers/my');
            setOffers(response.data?.offers || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load offers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id };

    const stats = {
        total: offers.length,
        pending: offers.filter(o => o.status === 'pending').length,
        accepted: offers.filter(o => o.status === 'accepted').length,
        rejected: offers.filter(o => o.status === 'rejected').length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading offers...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold">My Offers</h1>
                        <p className="text-muted-foreground mt-1">Track offers you've made to farmers</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
                        { label: 'Pending', value: stats.pending, color: 'bg-amber-500/10 text-amber-600' },
                        { label: 'Accepted', value: stats.accepted, color: 'bg-green-500/10 text-green-600' },
                        { label: 'Rejected', value: stats.rejected, color: 'bg-red-500/10 text-red-600' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card rounded-2xl border border-border p-6"
                        >
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
                        {error}
                    </div>
                )}

                {offers.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border">
                        <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No offers yet</h3>
                        <p className="text-muted-foreground">
                            Browse the marketplace to make offers to farmers
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {offers.map((offer, idx) => {
                            const millet = getMillet(offer.listing_crop || '');
                            const totalValue = offer.qty_kg * (offer.price_per_qtl / 100);

                            return (
                                <motion.div
                                    key={offer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-card rounded-xl border border-border p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                                <User className="w-7 h-7 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">
                                                        Offer to {offer.seller_name || 'Farmer'}
                                                    </h3>
                                                    <Badge className={`${statusColors[offer.status]} border`}>
                                                        {offer.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {new Date(offer.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                                    <p className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">{millet.name}</span>
                                                        <span className="text-muted-foreground">({offer.qty_kg} kg)</span>
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">₹{(offer.price_per_qtl / 100).toFixed(2)}/kg</span>
                                                        <span className="text-muted-foreground">(₹{totalValue.toLocaleString()} total)</span>
                                                    </p>
                                                </div>
                                                {offer.message && (
                                                    <p className="text-sm mt-2 text-muted-foreground">{offer.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
