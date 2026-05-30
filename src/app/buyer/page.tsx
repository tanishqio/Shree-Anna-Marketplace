"use client";

import RoleLandingPage from '@/components/RoleLandingPage';
import { Shield, Users, QrCode, ShoppingBag, TrendingUp, MapPin } from 'lucide-react';

export default function BuyerPage() {
    const features = [
        {
            icon: Shield,
            title: 'Verified Quality',
            titleHi: 'सत्यापित गुणवत्ता',
            description: 'Source premium millets from verified farmers and FPOs.',
            color: 'bg-primary/10 text-primary',
        },
        {
            icon: Users,
            title: 'Direct Sourcing',
            titleHi: 'सीधी खरीद',
            description: 'Connect directly with farmers to get the best rates.',
            color: 'bg-accent/10 text-accent',
        },
        {
            icon: QrCode,
            title: 'Full Traceability',
            titleHi: 'पूर्ण ट्रेसेबिलिटी',
            description: 'Track the origin of your produce from farm to table.',
            color: 'bg-sky-500/10 text-sky-600',
        },
        {
            icon: ShoppingBag,
            title: 'Bulk Orders',
            titleHi: 'थोक आदेश',
            description: 'Place bulk orders easily and manage logistics.',
            color: 'bg-terra-500/10 text-terra-600',
        },
        {
            icon: TrendingUp,
            title: 'Market Insights',
            titleHi: 'बाजार अंतर्दृष्टि',
            description: 'Get real-time price trends and availability data.',
            color: 'bg-secondary/10 text-secondary',
        },
        {
            icon: MapPin,
            title: 'Pan-India Network',
            titleHi: 'अखिल भारतीय नेटवर्क',
            description: 'Source from major millet growing regions across India.',
            color: 'bg-primary/10 text-primary',
        },
    ];

    return (
        <RoleLandingPage
            role="buyer"
            heroTitle={<>India&apos;s First <span className="text-primary">Millet Marketplace</span></>}
            heroDescription="Connect with verified farmers and FPOs. Ensure quality, traceability, and fair trade for your business."
            heroImage="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800"
            features={features}
            registerLink="/buyer/register"
            loginLink="/login?role=buyer"
        />
    );
}
