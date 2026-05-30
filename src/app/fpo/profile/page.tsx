"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Phone,
    MapPin,
    Mail,
    Edit2,
    Save,
    X,
    ArrowLeft,
    Users,
    FileText,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { userApi } from '@/lib/api';

export default function FpoProfilePage() {
    const router = useRouter();
    const { user, refreshUser, isLoading: authLoading } = useAuth();
    const { language } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        orgName: '',
        registrationNumber: '',
        memberCount: '',
        district: '',
        state: '',
        crops: [] as string[],
    });

    const states = [
        'Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu',
        'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Gujarat'
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: '',
                orgName: '',
                registrationNumber: '',
                memberCount: '',
                district: user.district || '',
                state: '',
                crops: [],
            });
            loadFpoProfile();
        }
    }, [user]);

    const loadFpoProfile = async () => {
        try {
            const data = await userApi.getFpoProfile();
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    orgName: data.org_name || '',
                    registrationNumber: data.registration_number || '',
                    memberCount: data.member_count?.toString() || '',
                    crops: data.crops || [],
                    state: data.state || '',
                }));
            }
        } catch (err) {
            console.log('No FPO profile found or error loading');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await userApi.updateProfile({
                name: formData.name,
                district: formData.district,
            });
            await refreshUser();
            setSuccess(language === 'hi' ? 'प्रोफ़ाइल अपडेट हो गई!' : 'Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(language === 'hi' ? 'अपडेट करने में त्रुटि' : 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        router.push('/login?role=fpo');
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <span className="text-xl">👥</span>
                            </div>
                            <h1 className="text-xl font-heading font-bold">
                                {language === 'hi' ? 'FPO/SHG प्रोफ़ाइल' : 'FPO/SHG Profile'}
                            </h1>
                        </div>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                            <Edit2 className="w-4 h-4 mr-2" />
                            {language === 'hi' ? 'संपादित करें' : 'Edit'}
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} size="sm">
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-6 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Status messages */}
                    {success && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-700 dark:text-green-300">{success}</span>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-700 dark:text-red-300">{error}</span>
                        </div>
                    )}

                    {/* Profile Picture Card */}
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4 text-4xl">
                            {formData.orgName ? formData.orgName.charAt(0).toUpperCase() : '👥'}
                        </div>
                        <h2 className="text-2xl font-bold">{formData.orgName || formData.name || 'FPO/SHG'}</h2>
                        <p className="text-muted-foreground">{formData.phone}</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                                👥 FPO/SHG
                            </span>
                            {user?.onboarded && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Contact Person Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-teal-600" />
                                {language === 'hi' ? 'संपर्क व्यक्ति' : 'Contact Person'}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>{language === 'hi' ? 'नाम' : 'Name'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium">{formData.name || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'फ़ोन' : 'Phone'}</Label>
                                    <p className="mt-1 font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        {formData.phone}
                                    </p>
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'ईमेल' : 'Email'}</Label>
                                    {isEditing ? (
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            {formData.email || '-'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Organization Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Users className="w-4 h-4 text-teal-600" />
                                {language === 'hi' ? 'संगठन विवरण' : 'Organization Details'}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>{language === 'hi' ? 'संगठन का नाम' : 'Organization Name'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.orgName}
                                            onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium">{formData.orgName || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'पंजीकरण संख्या' : 'Registration Number'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.registrationNumber}
                                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            {formData.registrationNumber || '-'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'सदस्यों की संख्या' : 'Member Count'}</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={formData.memberCount}
                                            onChange={(e) => setFormData({ ...formData, memberCount: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            {formData.memberCount || '-'} {language === 'hi' ? 'सदस्य' : 'members'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {formData.crops.length > 0 && (
                                <div>
                                    <Label>{language === 'hi' ? 'फसलें' : 'Crops'}</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.crops.map((crop, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                                                {crop}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-teal-600" />
                                {language === 'hi' ? 'स्थान' : 'Location'}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>{language === 'hi' ? 'जिला' : 'District'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium">{formData.district || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'राज्य' : 'State'}</Label>
                                    {isEditing ? (
                                        <Select
                                            value={formData.state}
                                            onValueChange={(value) => setFormData({ ...formData, state: value })}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {states.map((state) => (
                                                    <SelectItem key={state} value={state}>
                                                        {state}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="mt-1 font-medium">{formData.state || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2"
                            onClick={() => router.push('/fpo/dashboard')}
                        >
                            <TrendingUp className="w-6 h-6 text-teal-600" />
                            <span>{language === 'hi' ? 'सामूहिक बिक्री' : 'Collective Sales'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2"
                            onClick={() => router.push('/settings')}
                        >
                            <Building2 className="w-6 h-6 text-teal-600" />
                            <span>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
