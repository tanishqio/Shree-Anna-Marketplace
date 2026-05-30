"use client";

import RoleLandingPage from '@/components/RoleLandingPage';
import { Users, Shield, TrendingUp, FileText, LayoutDashboard, Globe } from 'lucide-react';

export default function AdminPage() {
    const features = [
        {
            icon: LayoutDashboard,
            title: 'Platform Overview',
            titleHi: 'प्लेटफ़ॉर्म अवलोकन',
            description: 'Comprehensive view of all platform activities and metrics.',
            color: 'bg-primary/10 text-primary',
        },
        {
            icon: Users,
            title: 'User Management',
            titleHi: 'उपयोगकर्ता प्रबंधन',
            description: 'Manage farmers, buyers, FPOs, and other stakeholders.',
            color: 'bg-accent/10 text-accent',
        },
        {
            icon: Shield,
            title: 'Dispute Resolution',
            titleHi: 'विवाद समाधान',
            description: 'Tools to handle and resolve trade disputes efficiently.',
            color: 'bg-sky-500/10 text-sky-600',
        },
        {
            icon: TrendingUp,
            title: 'Analytics & Reports',
            titleHi: 'एनालिटिक्स और रिपोर्ट',
            description: 'Deep insights into trade volumes, prices, and user growth.',
            color: 'bg-terra-500/10 text-terra-600',
        },
        {
            icon: FileText,
            title: 'Content Management',
            titleHi: 'सामग्री प्रबंधन',
            description: 'Manage schemes, news, and educational content.',
            color: 'bg-secondary/10 text-secondary',
        },
        {
            icon: Globe,
            title: 'System Settings',
            titleHi: 'सिस्टम सेटिंग्स',
            description: 'Configure platform parameters and regional settings.',
            color: 'bg-primary/10 text-primary',
        },
    ];

    return (
        <RoleLandingPage
            role="admin"
            heroTitle={<>India&apos;s First <span className="text-primary">Millet Marketplace</span></>}
            heroDescription="Centralized control center for managing the Shree Anna marketplace ecosystem."
            heroImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"
            features={features}
            registerLink="/admin/register"
            loginLink="/login?role=admin"
        />
    );
}
