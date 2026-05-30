"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Bell,
    Check, X,
    MessageSquare,
    Loader2,
    IndianRupee,
    Package,
    User,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { milletTypes } from '@/lib/design-tokens';
import { api } from '@/lib/api';

interface Offer {
    id: string;
    listing_id: string;
    listing_crop?: string;
    listing_qty?: number;
    buyer_id: string;
    buyer_name?: string;
    buyer_phone?: string;
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

export default function FarmerOffersPage() {
    const [role, setRole] = useState('farmer');
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const fetchOffers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ data?: { offers?: Offer[] }; offers?: Offer[] }>('/offers/received');
            // Handle both response formats and empty responses
            const offersData = response?.data?.offers || response?.offers || [];
            setOffers(Array.isArray(offersData) ? offersData : []);
        } catch (err) {
            console.log('Failed to load offers:', err);
            setOffers([]); // Set empty array on error
            // Don't show error for developer mode
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const handleAccept = async (offerId: string) => {
        try {
            await api.post(`/offers/${offerId}/accept`);
            await fetchOffers();
        } catch (err) {
            alert('Failed to accept offer');
        }
    };

    const handleReject = async (offerId: string) => {
        try {
            await api.post(`/offers/${offerId}/reject`);
            await fetchOffers();
        } catch (err) {
            alert('Failed to reject offer');
        }
    };

    const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id };

    const filteredOffers = offers.filter(offer =>
        filter === 'all' || offer.status === filter
    );

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
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Received Offers</h1>
                        <p className="text-muted-foreground mt-1">Manage offers on your listings</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
                        { label: 'Pending', value: stats.pending, color: 'bg-amber-500/10 text-amber-600' },
                        { label: 'Accepted', value: stats.accepted, color: 'bg-green-500/10 text-green-600' },
                        { label: 'Rejected', value: stats.rejected, color: 'bg-red-500/10 text-red-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div className="mb-6">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-md border border-input bg-background"
                    >
                        <option value="all">All Offers</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="countered">Countered</option>
                    </select>
                </div>

                {/* Offers */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                        {error}
                    </div>
                )}

                {filteredOffers.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border">
                        <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No offers yet</h3>
                        <p className="text-muted-foreground mb-6">
                            {filter !== 'all' ? 'No offers match your filter' : 'Offers from buyers will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOffers.map((offer, idx) => {
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
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                                                <User className="w-7 h-7 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{offer.buyer_name || 'Anonymous Buyer'}</h3>
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
                                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                            <p className="text-sm">{offer.message}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {offer.status === 'pending' && (
                                        <div className="flex gap-3 pt-4 border-t border-border">
                                            <Button
                                                size="lg"
                                                onClick={() => handleAccept(offer.id)}
                                                className="flex-1"
                                            >
                                                <Check className="w-5 h-5 mr-2" />
                                                Accept Offer
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                onClick={() => handleReject(offer.id)}
                                                className="flex-1"
                                            >
                                                <X className="w-5 h-5 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
