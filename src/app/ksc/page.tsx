"use client";

import RoleLandingPage from '@/components/RoleLandingPage';
import { Users, ShieldCheck, UserPlus, FileText, LayoutDashboard, Phone } from 'lucide-react';

export default function KscPage() {
    const features = [
        {
            icon: ShieldCheck,
            title: 'Farmer Verification',
            titleHi: 'किसान सत्यापन',
            description: 'Verify farmer registrations and activate their accounts.',
            color: 'bg-primary/10 text-primary',
        },
        {
            icon: UserPlus,
            title: 'Assisted Registration',
            titleHi: 'सहायित पंजीकरण',
            description: 'Help farmers register directly at the service center.',
            color: 'bg-accent/10 text-accent',
        },
        {
            icon: Users,
            title: 'Farmer Support',
            titleHi: 'किसान सहायता',
            description: 'View farmer profiles, listings, and provide support.',
            color: 'bg-sky-500/10 text-sky-600',
        },
        {
            icon: LayoutDashboard,
            title: 'Dashboard',
            titleHi: 'डैशबोर्ड',
            description: 'Track verification activity and registration statistics.',
            color: 'bg-terra-500/10 text-terra-600',
        },
        {
            icon: FileText,
            title: 'Government Schemes',
            titleHi: 'सरकारी योजनाएं',
            description: 'Help farmers apply for agricultural schemes and benefits.',
            color: 'bg-secondary/10 text-secondary',
        },
        {
            icon: Phone,
            title: 'Farmer Lookup',
            titleHi: 'किसान खोज',
            description: 'Search farmers by phone number for quick assistance.',
            color: 'bg-primary/10 text-primary',
        },
    ];

    return (
        <RoleLandingPage
            role="ksc"
            heroTitle={<>Kisan <span className="text-primary">Service Center</span></>}
            heroDescription="Your local hub for farmer onboarding, verification, and support. Help farmers join India's millet revolution."
            heroImage="/images/heroes/ksc_hero.png"
            features={features}
            registerLink="/ksc/register"
            loginLink="/login?role=ksc"
        />
    );
}
