"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Package,
    QrCode,
    Calendar,
    Loader2,
    TrendingUp,
    Plus,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { batchesApi } from '@/lib/api';
import { milletTypes } from '@/lib/design-tokens';

interface Batch {
    id: string;
    qr_code: string;
    crop: string;
    total_weight: number;
    grade?: string;
    status: string;
    created_at: string;
    event_count?: number;
}

const statusColors: Record<string, string> = {
    active: 'bg-accent/10 text-accent border-accent/20',
    CREATED: 'bg-primary/10 text-primary border-primary/20',
    processing: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
    shipped: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    delivered: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function ProcessorBatchesPage() {
    const [role, setRole] = useState('processor');
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBatches = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await batchesApi.getMyBatches();
            setBatches(response.items || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load batches');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

    const getMillet = (id: string) => milletTypes.find(m => m.id === id) || { id, name: id };

    const stats = {
        total: batches.length,
        active: batches.filter(b => b.status === 'CREATED' || b.status === 'active' || b.status === 'processing').length,
        completed: batches.filter(b => b.status === 'completed').length,
        totalWeight: batches.reduce((sum, b) => sum + (b.total_weight || 0), 0),
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading batches...</p>
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
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Processing Batches</h1>
                        <p className="text-muted-foreground mt-1">Track and manage your batches</p>
                    </div>
                    <Button asChild>
                        <Link href="/processor/batches/create">
                            <Plus className="w-4 h-4 mr-2" />
                            New Batch
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
                        { label: 'Active', value: stats.active, color: 'bg-accent/10 text-accent' },
                        { label: 'Completed', value: stats.completed, color: 'bg-green-500/10 text-green-600' },
                        { label: 'Total Weight', value: `${stats.totalWeight}kg`, color: 'bg-sky-500/10 text-sky-600' },
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

                {batches.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No batches yet</h3>
                        <p className="text-muted-foreground">Your processing batches will appear here</p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link href="/processor/batches/create">Create your first batch</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {batches.map((batch, idx) => {
                            const millet = getMillet(batch.crop);

                            return (
                                <motion.div
                                    key={batch.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-card rounded-xl border border-border p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                                <QrCode className="w-7 h-7 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-lg">{millet.name}</h3>
                                                    <Badge className={`${statusColors[batch.status] || 'bg-gray-100'} border`}>
                                                        {batch.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                    <p>Weight: <span className="font-medium text-foreground">{batch.total_weight} kg</span></p>
                                                    <p>Grade: <span className="font-medium text-foreground">{batch.grade || 'N/A'}</span></p>
                                                    <p>Events: <span className="font-medium text-foreground">{batch.event_count || 0}</span></p>
                                                    <p>Created: <span className="font-medium text-foreground">
                                                        {new Date(batch.created_at).toLocaleDateString('en-IN')}
                                                    </span></p>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Batch ID: {batch.qr_code || batch.id.slice(0, 12)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/processor/batches/${batch.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
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
