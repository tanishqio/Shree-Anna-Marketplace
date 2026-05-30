"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Mic,
    WifiOff,
    Globe,
    QrCode,
    Shield,
    TrendingUp,
    Users,
    MapPin,
    ArrowRight,
    CheckCircle,
    Leaf,
    Phone,
    LayoutDashboard,
    ShoppingBag,
    FileText,
    HelpCircle
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { HelpModal } from '@/components/HelpModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { milletTypes } from '@/lib/design-tokens';

import { supabase } from '@/lib/supabase';

// API URL for fetching real stats
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';

interface Feature {
    icon: any;
    title: string;
    titleHi: string;
    description: string;
    color: string;
}

interface RoleLandingPageProps {
    role: string;
    heroTitle: React.ReactNode;
    heroDescription: string;
    heroImage: string;
    features: Feature[];
    registerLink: string;
    loginLink: string;
    stats?: { value: string; label: string; icon: any }[];
}

export default function RoleLandingPage({
    role,
    heroTitle,
    heroDescription,
    heroImage,
    features,
    registerLink,
    loginLink,
    stats
}: RoleLandingPageProps) {
    const router = useRouter();
    const [showHelp, setShowHelp] = React.useState(false);
    const [realStats, setRealStats] = useState<{ farmers: string; transactions: string; fpos: string } | null>(null);

    // Fetch real stats from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: farmersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).contains('roles', ['farmer']);
                const { count: fposCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).contains('roles', ['fpo']);
                const { count: transactionsCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

                if (farmersCount !== null || fposCount !== null) {
                    setRealStats({
                        farmers: (farmersCount || 12000).toLocaleString() + '+',
                        transactions: '₹' + ((transactionsCount || 500) * 0.05).toFixed(1) + 'Cr+',
                        fpos: (fposCount || 45).toString() + '+',
                    });
                }
            } catch (error) {
                // Silently fall back to hardcoded stats
            }
        };
        fetchStats();
    }, []);

    // Default stats if not provided - use real stats if available
    const defaultStats = [
        { value: realStats?.farmers || '12,000+', label: 'Farmers', icon: Users },
        { value: realStats?.transactions || '₹15 Cr+', label: 'Transactions', icon: TrendingUp },
        { value: realStats?.fpos || '500+', label: 'FPOs', icon: Shield },
        { value: '50+', label: 'Districts', icon: MapPin },
    ];

    const displayStats = stats || defaultStats;

    return (
        <div className="min-h-screen bg-background">
            <Navigation
                currentRole={role}
                onRoleChange={(newRole) => router.push(`/${newRole}`)}
                isOffline={false}
            />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e9b93e' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="container mx-auto px-4 py-16 sm:py-24 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                                🌾 Millet Value Chain
                            </Badge>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
                                {heroTitle}
                            </h1>

                            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                                {heroDescription}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Button asChild size="lg" className="h-14 text-lg px-8">
                                    <Link href={registerLink}>
                                        <span className="mr-2">📝</span>
                                        Register as {role.charAt(0).toUpperCase() + role.slice(1)}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-14 text-lg px-8">
                                    <Link href={loginLink}>
                                        <span className="mr-2">🔐</span>
                                        Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </Link>
                                </Button>
                            </div>

                            {/* Quick links */}
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/schemes"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                                >
                                    📋 Government Schemes
                                </Link>
                                <button
                                    onClick={() => setShowHelp(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    Help: 1800-XXX-XXXX
                                </button>
                            </div>
                        </motion.div>

                        {/* Right Content - Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src={heroImage}
                                    alt={`${role} hero`}
                                    className="w-full h-[400px] sm:h-[500px] object-cover"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Play button overlay */}

                            </div>

                            {/* Floating stats card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-4 border border-border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">₹15 Cr+</p>
                                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-muted/50 border-y border-border">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayStats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <stat.icon className="w-7 h-7 text-primary" />
                                </div>
                                <p className="text-3xl font-bold">{stat.value}</p>
                                <p className="text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                            Built for {role.charAt(0).toUpperCase() + role.slice(1)}s
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Tailored features to help you succeed in the millet marketplace.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                                <p className="text-sm text-primary mb-2">{feature.titleHi}</p>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Millet Types Section */}
            <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                            Trade All Types of Millets
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            From Ragi to Jowar, buy and sell all nutritious millet varieties
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {milletTypes.map((millet, idx) => (
                            <motion.div
                                key={millet.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-card rounded-full px-5 py-3 border border-border flex items-center gap-2 hover:border-primary transition-colors cursor-pointer"
                            >
                                <span className="text-xl">🌾</span>
                                <div>
                                    <span className="font-medium">{millet.name}</span>
                                    <span className="text-muted-foreground ml-2 text-sm">({millet.nameHi})</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-card border-t border-border py-12">
                <div className="container mx-auto px-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-xl">🌾</span>
                                </div>
                                <div>
                                    <span className="font-heading font-bold text-lg">Shree Anna</span>
                                    <span className="block text-xs text-muted-foreground">Millets Marketplace</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Empowering smallholder farmers with technology for fair and transparent millet trade.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <Phone className="w-4 h-4 inline mr-1" />
                                Toll-free: 1800-XXX-XXXX
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/marketplace" className="text-muted-foreground hover:text-foreground">Marketplace</Link></li>
                                <li><Link href="/farmer/dashboard" className="text-muted-foreground hover:text-foreground">Farmer Dashboard</Link></li>
                                <li><Link href="/buyer/dashboard" className="text-muted-foreground hover:text-foreground">Buyer Dashboard</Link></li>
                                <li><Link href="/schemes" className="text-muted-foreground hover:text-foreground">Government Schemes</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
                                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQs</Link></li>
                                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
                                <li><button onClick={() => setShowHelp(true)} className="text-muted-foreground hover:text-foreground">Request Callback</button></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                                <li><Link href="/refund" className="text-muted-foreground hover:text-foreground">Refund Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2024 Shree Anna. Made with ❤️ for Indian Farmers.
                        </p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-xs">
                                <Leaf className="w-3 h-3 mr-1" />
                                Carbon Neutral
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                🇮🇳 Made in India
                            </Badge>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Help Modal */}
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
