"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Phone,
    MapPin,
    Mail,
    Building2,
    Edit2,
    Save,
    X,
    ArrowLeft,
    CreditCard,
    ShoppingBag,
    CheckCircle,
    AlertCircle,
    FileText,
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

export default function BuyerProfilePage() {
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
        companyName: '',
        gstNumber: '',
        address: '',
        district: '',
        state: '',
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
                companyName: '',
                gstNumber: '',
                address: '',
                district: user.district || '',
                state: '',
            });
            loadBuyerProfile();
        }
    }, [user]);

    const loadBuyerProfile = async () => {
        try {
            const data = await userApi.getBuyerProfile();
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    companyName: data.company_name || '',
                    gstNumber: data.gst_number || '',
                    address: data.address || '',
                    state: data.state || '',
                }));
            }
        } catch (err) {
            console.log('No buyer profile found or error loading');
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
        router.push('/login?role=buyer');
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
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xl">🛒</span>
                            </div>
                            <h1 className="text-xl font-heading font-bold">
                                {language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}
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
                                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
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
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 text-4xl">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : '🛒'}
                        </div>
                        <h2 className="text-2xl font-bold">{formData.name || 'Buyer'}</h2>
                        <p className="text-muted-foreground">{formData.phone}</p>
                        {formData.companyName && (
                            <p className="text-sm text-muted-foreground mt-1">{formData.companyName}</p>
                        )}
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                🛒 {language === 'hi' ? 'खरीदार' : 'Buyer'}
                            </span>
                            {user?.onboarded && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    {language === 'hi' ? 'सत्यापित' : 'Verified'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                {language === 'hi' ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
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

                    {/* Business Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                {language === 'hi' ? 'व्यवसाय जानकारी' : 'Business Information'}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>{language === 'hi' ? 'कंपनी का नाम' : 'Company Name'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium">{formData.companyName || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'GST नंबर' : 'GST Number'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.gstNumber}
                                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            {formData.gstNumber || '-'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label>{language === 'hi' ? 'पता' : 'Address'}</Label>
                                {isEditing ? (
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="mt-1"
                                    />
                                ) : (
                                    <p className="mt-1 font-medium">{formData.address || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
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
                            onClick={() => router.push('/buyer/dashboard')}
                        >
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                            <span>{language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2"
                            onClick={() => router.push('/settings')}
                        >
                            <CreditCard className="w-6 h-6 text-blue-600" />
                            <span>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
