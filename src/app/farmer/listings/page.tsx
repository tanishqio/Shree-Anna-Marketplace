"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Package,
    Eye,
    Edit,
    Trash2,
    Plus,
    Filter,
    Search,
    Loader2,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMyListings } from '@/lib/hooks/useData';
import { milletTypes } from '@/lib/design-tokens';

const statusColors: Record<string, string> = {
    active: 'bg-accent/10 text-accent border-accent/20',
    pending: 'bg-primary/10 text-primary border-primary/20',
    sold: 'bg-green-500/10 text-green-600 border-green-500/20',
    draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    expired: 'bg-red-500/10 text-red-600 border-red-500/20',
    cancelled: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export default function FarmerListingsPage() {
    const [role, setRole] = useState('farmer');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { data: listings, isLoading, error, refetch } = useMyListings();

    const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id, nameHi: id };

    // Filter listings
    const filteredListings = listings?.filter(listing => {
        const matchesSearch = !searchQuery ||
            listing.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.district?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    const stats = {
        total: listings?.length || 0,
        active: listings?.filter(l => l.status === 'active').length || 0,
        sold: listings?.filter(l => l.status === 'sold').length || 0,
        draft: listings?.filter(l => l.status === 'draft').length || 0,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading your listings...</p>
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
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold">My Listings</h1>
                        <p className="text-muted-foreground mt-1">Manage your millet listings</p>
                    </div>
                    <Button asChild size="lg" className="touch-target">
                        <Link href="/farmer/listing/create">
                            <Plus className="w-5 h-5 mr-2" />
                            New Listing
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
                        { label: 'Active', value: stats.active, color: 'bg-accent/10 text-accent' },
                        { label: 'Sold', value: stats.sold, color: 'bg-green-500/10 text-green-600' },
                        { label: 'Draft', value: stats.draft, color: 'bg-yellow-500/10 text-yellow-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by crop or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-md border border-input bg-background"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                {/* Listings */}
                {error && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200">
                        {error}
                    </div>
                )}

                {filteredListings.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                        <p className="text-muted-foreground mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first listing to get started'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <Button asChild size="lg">
                                <Link href="/farmer/listing/create">Create Listing</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredListings.map((listing, idx) => {
                            const millet = getMillet(listing.crop);
                            const totalValue = listing.qty_kg * (listing.min_price_per_qtl / 100);

                            return (
                                <motion.div
                                    key={listing.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-3xl">🌾</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-lg">{millet.name}</h3>
                                                    <Badge className={`${statusColors[listing.status]} border`}>
                                                        {listing.status}
                                                    </Badge>
                                                    {listing.is_organic && (
                                                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200">
                                                            Organic
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                    <p>Quantity: <span className="font-medium text-foreground">{listing.qty_kg} kg</span></p>
                                                    <p>Price: <span className="font-medium text-foreground">₹{(listing.min_price_per_qtl / 100).toFixed(2)}/kg</span></p>
                                                    <p>Location: <span className="font-medium text-foreground">{listing.district}, {listing.state}</span></p>
                                                    <p>Total Value: <span className="font-medium text-accent">₹{totalValue.toLocaleString()}</span></p>
                                                </div>
                                                {listing.quality_grade && (
                                                    <p className="text-sm mt-2">
                                                        Grade: <span className="font-medium">{listing.quality_grade}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/farmer/listing/${listing.id}`}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Link>
                                            </Button>
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
