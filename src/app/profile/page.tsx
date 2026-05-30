"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    User,
    Phone,
    MapPin,
    Building,
    CreditCard,
    LogOut,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { userApi } from '@/lib/api';
import { Navigation } from '@/components/Navigation';

interface ProfileData {
    id: string;
    name: string;
    phone?: string;
    role: string;
    district?: string;
    state?: string;
    address?: string;
    pincode?: string;
    // Farmer specific
    village?: string;
    land_size?: number;
    crops?: string[];
    bank_account?: string;
    ifsc?: string;
    // FPO specific
    organization_name?: string;
    registration_no?: string;
    member_count?: number;
    // Buyer specific
    company_name?: string;
    gst_number?: string;
    buyer_type?: string;
    // Processor specific
    unit_type?: string;
    fssai_license?: string;
    products?: string[];

    verified?: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout, isLoading: authLoading } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                setLoading(true);
                let data: any = null;
                const role = user.roles[0]; // Primary role

                // Fetch basic user data first if needed, but we try specific profile endpoints
                if (role === 'farmer') {
                    const res = await userApi.getFarmerProfile();
                    data = { ...res, role: 'Farmer' };
                } else if (role === 'fpo' || role === 'shg') {
                    const res = await userApi.getFpoProfile();
                    data = { ...res, role: 'FPO/SHG' };
                } else if (role === 'buyer') {
                    const res = await userApi.getBuyerProfile();
                    data = { ...res, role: 'Buyer' };
                } else if (role === 'processor') {
                    const res = await userApi.getProcessorProfile();
                    data = { ...res, role: 'Processor' };
                } else {
                    // Admin or others
                    data = {
                        id: user.id,
                        name: user.name || 'Admin',
                        role: role.toUpperCase(),
                        phone: user.phone
                    };
                }

                if (data) {
                    // Merge basic user info if profile is partial
                    setProfile({
                        ...data,
                        phone: user.phone, // Phone is usually in user object
                        name: data.name || user.name
                    });
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                setError('Could not load profile data. Please try again.');
                // Fallback to basic user info
                if (user) {
                    setProfile({
                        id: user.id,
                        name: user.name || 'User',
                        phone: user.phone,
                        role: user.roles[0]?.toUpperCase() || 'USER'
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchProfile();
        } else if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!profile) {
        return null; // Should redirect
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navigation />

            <main className="container mx-auto px-4 py-6 max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                </div>

                {/* Profile Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-20 h-20 border-2 border-primary/20">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} />
                                <AvatarFallback>{profile.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold">{profile.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="uppercase text-xs tracking-wider">
                                        {profile.role}
                                    </Badge>
                                    {profile.verified && (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Verified
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm mt-1">{profile.phone}</p>
                            </div>
                        </div>
                        {/* Edit button could go here */}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-6">

                    {/* Location Info */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-primary">
                            <MapPin className="w-5 h-5" /> Location Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem label="District" value={profile.district} />
                            <InfoItem label="State" value={profile.state} />
                            <InfoItem label="Village" value={profile.village} />
                            <InfoItem label="Address" value={profile.address} />
                            <InfoItem label="Pincode" value={profile.pincode} />
                        </div>
                    </div>

                    {/* Role Specific Info */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-primary">
                            <Building className="w-5 h-5" /> Business Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Farmer */}
                            <InfoItem label="Land Size" value={profile.land_size ? `${profile.land_size} Acres` : undefined} />

                            {/* FPO */}
                            <InfoItem label="Organization" value={profile.organization_name} />
                            <InfoItem label="Reg. Number" value={profile.registration_no} />
                            <InfoItem label="Members" value={profile.member_count?.toString()} />

                            {/* Buyer/Processor */}
                            <InfoItem label="Company" value={profile.company_name} />
                            <InfoItem label="GST Number" value={profile.gst_number} />
                            <InfoItem label="License (FSSAI)" value={profile.fssai_license} />
                            <InfoItem label="Type" value={profile.buyer_type || profile.unit_type} />
                        </div>

                        {/* Crops/Products */}
                        {(profile.crops?.length || 0) > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-sm text-muted-foreground mb-2">Crops / Products</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.crops?.map((c, i) => (
                                        <Badge key={i} variant="outline" className="text-sm py-1">{c}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {(profile.products?.length || 0) > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-sm text-muted-foreground mb-2">Products</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.products?.map((p, i) => (
                                        <Badge key={i} variant="outline" className="text-sm py-1">{p}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Financial Info */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-primary">
                            <CreditCard className="w-5 h-5" /> Financial Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem label="Bank Account" value={profile.bank_account ? `••••${profile.bank_account.slice(-4)}` : undefined} />
                            <InfoItem label="IFSC Code" value={profile.ifsc} />
                        </div>
                    </div>

                    <Button
                        variant="destructive"
                        className="w-full mt-8"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>

                </div>
            </main>
        </div>
    );
}

function InfoItem({ label, value }: { label: string, value?: string }) {
    if (!value) return null;
    return (
        <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="font-medium text-foreground">{value}</p>
        </div>
    );
}
