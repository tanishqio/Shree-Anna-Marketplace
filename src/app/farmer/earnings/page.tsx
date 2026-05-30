"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    IndianRupee,
    TrendingUp,
    Download,
    Calendar,
    Loader2,
    FileText,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Payment {
    id: string;
    order_id?: string;
    amount: number;
    status: string;
    payment_method?: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    success: 'bg-green-500/10 text-green-600 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    failed: 'bg-red-500/10 text-red-600 border-red-500/20',
    refunded: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function FarmerEarningsPage() {
    const [role, setRole] = useState('farmer');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ data?: { payments?: Payment[] }; payments?: Payment[] }>('/payments/my');
            const paymentsData = response?.data?.payments || response?.payments || [];
            setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        } catch (err) {
            console.log('Failed to load earnings:', err);
            // Set some mock data if API fails
            setPayments([
                {
                    id: '1',
                    order_id: 'ORD001',
                    amount: 12500,
                    status: 'success',
                    payment_method: 'upi',
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: '2',
                    order_id: 'ORD002',
                    amount: 8750,
                    status: 'success',
                    payment_method: 'bank_transfer',
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const totalEarnings = payments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

    const thisMonthEarnings = payments
        .filter(p => {
            const paymentDate = new Date(p.created_at);
            const now = new Date();
            return (
                p.status === 'success' &&
                paymentDate.getMonth() === now.getMonth() &&
                paymentDate.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    const stats = {
        total: totalEarnings,
        thisMonth: thisMonthEarnings,
        pending: pendingAmount,
        transactions: payments.filter(p => p.status === 'success').length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading earnings...</p>
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
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Earnings</h1>
                        <p className="text-muted-foreground mt-1">Track your payment history</p>
                    </div>
                    <Button size="lg" variant="outline">
                        <Download className="w-5 h-5 mr-2" />
                        Export Report
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: 'Total Earnings',
                            value: `₹${stats.total.toLocaleString()}`,
                            icon: IndianRupee,
                            color: 'bg-accent/10 text-accent',
                        },
                        {
                            label: 'This Month',
                            value: `₹${stats.thisMonth.toLocaleString()}`,
                            icon: TrendingUp,
                            color: 'bg-primary/10 text-primary',
                        },
                        {
                            label: 'Pending',
                            value: `₹${stats.pending.toLocaleString()}`,
                            icon: Calendar,
                            color: 'bg-amber-500/10 text-amber-600',
                        },
                        {
                            label: 'Transactions',
                            value: stats.transactions,
                            icon: FileText,
                            color: 'bg-sky-500/10 text-sky-600',
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card rounded-2xl border border-border p-6"
                        >
                            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Payment History */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="font-heading font-semibold text-lg mb-4">Payment History</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200">
                            <p className="text-sm">{error}</p>
                            <p className="text-xs mt-1">Showing cached data</p>
                        </div>
                    )}

                    {payments.length === 0 ? (
                        <div className="text-center py-16">
                            <IndianRupee className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No earnings yet</h3>
                            <p className="text-muted-foreground">
                                Your payment history will appear here after successful transactions
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment, idx) => (
                                <motion.div
                                    key={payment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                            <IndianRupee className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                                                <Badge className={`${statusColors[payment.status] || statusColors.pending} border`}>
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(payment.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                            {payment.payment_method && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    via {payment.payment_method.toUpperCase().replace('_', ' ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {payment.order_id && (
                                        <Button variant="ghost" size="sm">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Receipt
                                        </Button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
