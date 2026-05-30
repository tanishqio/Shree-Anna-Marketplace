"use client";

import RoleLandingPage from '@/components/RoleLandingPage';
import { Mic, WifiOff, TrendingUp, FileText, Shield, Globe } from 'lucide-react';

export default function FarmerPage() {
    const features = [
        {
            icon: Mic,
            title: 'Voice-Enabled Listing',
            titleHi: 'वॉइस से लिस्टिंग',
            description: 'Create listings by speaking in your language. No typing needed.',
            color: 'bg-primary/10 text-primary',
        },
        {
            icon: WifiOff,
            title: 'Works Offline',
            titleHi: 'ऑफलाइन काम करता है',
            description: 'Use the app without internet. Data syncs when you reconnect.',
            color: 'bg-accent/10 text-accent',
        },
        {
            icon: TrendingUp,
            title: 'Fair Pricing',
            titleHi: 'उचित मूल्य',
            description: 'Get the best prices with direct farmer-to-buyer connections.',
            color: 'bg-primary/10 text-primary',
        },
        {
            icon: Shield,
            title: 'Secure Payments',
            titleHi: 'सुरक्षित भुगतान',
            description: 'Receive payments directly to your bank account securely.',
            color: 'bg-secondary/10 text-secondary',
        },
        {
            icon: Globe,
            title: 'Multilingual Support',
            titleHi: 'बहुभाषी समर्थन',
            description: 'App available in Hindi, Kannada, Telugu, Tamil and Marathi.',
            color: 'bg-sky-500/10 text-sky-600',
        },
        {
            icon: FileText,
            title: 'Government Schemes',
            titleHi: 'सरकारी योजनाएं',
            description: 'Access latest government schemes and subsidies for millet farming.',
            color: 'bg-terra-500/10 text-terra-600',
        },
    ];

    return (
        <RoleLandingPage
            role="farmer"
            heroTitle={<>India&apos;s First <span className="text-primary">Millet Marketplace</span></>}
            heroDescription="Direct market access, fair prices, and government schemes for farmers. Sell your millets easily with voice commands."
            heroImage="/farmer-profile.jpeg"
            features={features}
            registerLink="/farmer/register"
            loginLink="/login?role=farmer"
        />
    );
}
