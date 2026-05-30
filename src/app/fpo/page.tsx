"use client";

import RoleLandingPage from '@/components/RoleLandingPage';
import { Users, TrendingUp, Globe, LayoutDashboard, Shield, FileText } from 'lucide-react';

export default function FPOPage() {
    const features = [
        {
            icon: Users,
            title: 'Member Management',
            titleHi: 'सदस्य प्रबंधन',
            description: 'Digitize your farmer member records and manage them easily.',
            color: 'bg-primary/10 text-primary',
        },
        {
            icon: TrendingUp,
            title: 'Batch Aggregation',
            titleHi: 'बैच एकत्रीकरण',
            description: 'Aggregate produce from members to create large marketable lots.',
            color: 'bg-accent/10 text-accent',
        },
        {
            icon: Globe,
            title: 'Market Linkage',
            titleHi: 'बाजार संपर्क',
            description: 'Connect with institutional buyers and processors globally.',
            color: 'bg-sky-500/10 text-sky-600',
        },
        {
            icon: LayoutDashboard,
            title: 'Digital Dashboard',
            titleHi: 'डिजिटल डैशबोर्ड',
            description: 'Monitor procurement, sales, and inventory in real-time.',
            color: 'bg-terra-500/10 text-terra-600',
        },
        {
            icon: Shield,
            title: 'Quality Certification',
            titleHi: 'गुणवत्ता प्रमाणन',
            description: 'Issue quality certificates for your aggregated produce.',
            color: 'bg-secondary/10 text-secondary',
        },
        {
            icon: FileText,
            title: 'Compliance & Reports',
            titleHi: 'अनुपालन और रिपोर्ट',
            description: 'Generate automated reports for compliance and audits.',
            color: 'bg-primary/10 text-primary',
        },
    ];

    return (
        <RoleLandingPage
            role="fpo"
            heroTitle={<>India&apos;s First <span className="text-primary">Millet Marketplace</span></>}
            heroDescription="Manage member farmers, aggregate produce, and access larger markets with our comprehensive FPO management suite."
            heroImage="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800"
            features={features}
            registerLink="/fpo/register"
            loginLink="/login?role=fpo"
        />
    );
}
