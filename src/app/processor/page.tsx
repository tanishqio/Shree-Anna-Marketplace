"use client";

import RoleLandingPage from '@/components/RoleLandingPage';
import { Leaf, Shield, TrendingUp, Globe, ShoppingBag, Users } from 'lucide-react';

export default function ProcessorPage() {
    const features = [
        {
            icon: Leaf,
            title: 'Raw Material Sourcing',
            titleHi: 'कच्चा माल सोर्सिंग',
            description: 'Source high-quality raw millets directly from FPOs.',
            color: 'bg-primary/10 text-primary',
        },
        {
            icon: Shield,
            title: 'Quality Verification',
            titleHi: 'गुणवत्ता सत्यापन',
            description: 'Ensure raw materials meet processing standards.',
            color: 'bg-accent/10 text-accent',
        },
        {
            icon: TrendingUp,
            title: 'Value Addition',
            titleHi: 'मूल्य संवर्धन',
            description: 'Access market trends to create high-demand processed products.',
            color: 'bg-sky-500/10 text-sky-600',
        },
        {
            icon: Globe,
            title: 'Market Access',
            titleHi: 'बाजार पहुंच',
            description: 'Sell processed millet products to a wider audience.',
            color: 'bg-terra-500/10 text-terra-600',
        },
        {
            icon: ShoppingBag,
            title: 'Inventory Management',
            titleHi: 'इन्वेंटरी प्रबंधन',
            description: 'Track raw material and finished goods inventory.',
            color: 'bg-secondary/10 text-secondary',
        },
        {
            icon: Users,
            title: 'Supplier Network',
            titleHi: 'आपूर्तिकर्ता नेटवर्क',
            description: 'Build long-term relationships with reliable producers.',
            color: 'bg-primary/10 text-primary',
        },
    ];

    return (
        <RoleLandingPage
            role="processor"
            heroTitle={<>India&apos;s First <span className="text-primary">Millet Marketplace</span></>}
            heroDescription="Connect with FPOs for raw material and sell processed goods. Streamline your millet processing business."
            heroImage="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800"
            features={features}
            registerLink="/processor/register"
            loginLink="/login?role=processor"
        />
    );
}
