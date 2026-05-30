"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Phone,
    MapPin,
    Edit2,
    Save,
    X,
    ArrowLeft,
    Leaf,
    CheckCircle,
    AlertCircle,
    Loader2,
    Sprout,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { userApi, FarmerProfile } from '@/lib/api';

export default function FarmerProfilePage() {
    const router = useRouter();
    const { user, refreshUser, isLoading: authLoading } = useAuth();
    const { language } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        village: '',
        district: '',
        state: '',
        pincode: '',
        landHolding: '',
        crops: [] as string[],
        organicCertified: false,
        certificationId: '',
    });

    const states = [
        'Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu',
        'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Gujarat',
        'Uttar Pradesh', 'Bihar', 'Odisha', 'Chhattisgarh'
    ];

    const cropOptions = [
        { id: 'finger', name: 'Finger Millet (Ragi)', nameHi: 'रागी' },
        { id: 'pearl', name: 'Pearl Millet (Bajra)', nameHi: 'बाजरा' },
        { id: 'foxtail', name: 'Foxtail Millet', nameHi: 'कांगनी' },
        { id: 'sorghum', name: 'Sorghum (Jowar)', nameHi: 'ज्वार' },
        { id: 'barnyard', name: 'Barnyard Millet', nameHi: 'सांवा' },
        { id: 'kodo', name: 'Kodo Millet', nameHi: 'कोदो' },
        { id: 'little', name: 'Little Millet', nameHi: 'कुटकी' },
        { id: 'proso', name: 'Proso Millet', nameHi: 'चीना' },
    ];

    useEffect(() => {
        if (user) {
            loadFarmerProfile();
        }
    }, [user]);

    const loadFarmerProfile = async () => {
        setIsLoadingProfile(true);
        try {
            const data = await userApi.getFarmerProfile();
            if (data) {
                setFarmerProfile(data);
                setFormData({
                    name: data.name || user?.name || '',
                    phone: user?.phone || '',
                    village: data.village || '',
                    district: data.district || user?.district || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    landHolding: data.land_holding_acres?.toString() || '',
                    crops: data.primary_crops || [],
                    organicCertified: data.organic_certified || false,
                    certificationId: data.certification_id || '',
                });
            } else {
                setFormData({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    village: '',
                    district: user?.district || '',
                    state: '',
                    pincode: '',
                    landHolding: '',
                    crops: [],
                    organicCertified: false,
                    certificationId: '',
                });
            }
        } catch (err) {
            console.log('No farmer profile found, using user data');
            setFormData({
                name: user?.name || '',
                phone: user?.phone || '',
                village: '',
                district: user?.district || '',
                state: '',
                pincode: '',
                landHolding: '',
                crops: [],
                organicCertified: false,
                certificationId: '',
            });
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleCropToggle = (cropId: string) => {
        setFormData(prev => ({
            ...prev,
            crops: prev.crops.includes(cropId)
                ? prev.crops.filter(c => c !== cropId)
                : [...prev.crops, cropId]
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await userApi.updateFarmerProfile({
                name: formData.name,
                village: formData.village,
                district: formData.district,
                state: formData.state,
                pincode: formData.pincode,
                land_holding_acres: formData.landHolding ? parseFloat(formData.landHolding) : undefined,
                crops: formData.crops,
                organic_certified: formData.organicCertified,
                certification_id: formData.certificationId || undefined,
            });
            await refreshUser();
            await loadFarmerProfile();
            setSuccess(language === 'hi' ? 'प्रोफ़ाइल अपडेट हो गई!' : 'Profile updated successfully!');
            setIsEditing(false);
        } catch (err: any) {
            setError(err?.message || (language === 'hi' ? 'अपडेट करने में त्रुटि' : 'Failed to update profile'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (farmerProfile) {
            setFormData({
                name: farmerProfile.name || user?.name || '',
                phone: user?.phone || '',
                village: farmerProfile.village || '',
                district: farmerProfile.district || user?.district || '',
                state: farmerProfile.state || '',
                pincode: farmerProfile.pincode || '',
                landHolding: farmerProfile.land_holding_acres?.toString() || '',
                crops: farmerProfile.primary_crops || [],
                organicCertified: farmerProfile.organic_certified || false,
                certificationId: farmerProfile.certification_id || '',
            });
        }
        setIsEditing(false);
        setError(null);
    };

    if (authLoading || isLoadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-muted-foreground">
                        {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push('/login?role=farmer');
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-2xl">👨‍🌾</span>
                            </div>
                            <h1 className="text-2xl font-heading font-bold">
                                {language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}
                            </h1>
                        </div>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="lg" className="touch-target">
                            <Edit2 className="w-5 h-5 mr-2" />
                            {language === 'hi' ? 'संपादित करें' : 'Edit'}
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button onClick={handleCancel} variant="ghost" size="lg" className="touch-target">
                                <X className="w-5 h-5 mr-2" />
                                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} size="lg" className="touch-target">
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                {isSaving ? (language === 'hi' ? 'सहेजा जा रहा...' : 'Saving...') : (language === 'hi' ? 'सहेजें' : 'Save')}
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
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 text-4xl">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : '👨‍🌾'}
                        </div>
                        <h2 className="text-2xl font-bold">{formData.name || 'Farmer'}</h2>
                        <p className="text-muted-foreground">{formData.phone}</p>
                        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                👨‍🌾 {language === 'hi' ? 'किसान' : 'Farmer'}
                            </span>
                            {farmerProfile?.verified && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    {language === 'hi' ? 'सत्यापित' : 'Verified'}
                                </span>
                            )}
                            {formData.organicCertified && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Leaf className="w-3 h-3" />
                                    {language === 'hi' ? 'ऑर्गेनिक' : 'Organic'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
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
                                            placeholder={language === 'hi' ? 'आपका नाम' : 'Your name'}
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium text-lg">{formData.name || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'फ़ोन' : 'Phone'}</Label>
                                    <p className="mt-1 font-medium text-lg flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        {formData.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {language === 'hi' ? 'स्थान' : 'Location'}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>{language === 'hi' ? 'गाँव' : 'Village'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.village}
                                            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                            className="mt-1"
                                            placeholder={language === 'hi' ? 'गाँव का नाम' : 'Village name'}
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium text-lg">{formData.village || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'जिला' : 'District'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="mt-1"
                                            placeholder={language === 'hi' ? 'जिला' : 'District'}
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium text-lg">{formData.district || '-'}</p>
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
                                                <SelectValue placeholder={language === 'hi' ? 'राज्य चुनें' : 'Select state'} />
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
                                        <p className="mt-1 font-medium text-lg">{formData.state || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>{language === 'hi' ? 'पिनकोड' : 'Pincode'}</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                            className="mt-1"
                                            placeholder="560001"
                                            maxLength={6}
                                        />
                                    ) : (
                                        <p className="mt-1 font-medium text-lg">{formData.pincode || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Farm Details */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Sprout className="w-4 h-4 text-primary" />
                                {language === 'hi' ? 'खेत विवरण' : 'Farm Details'}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <Label>{language === 'hi' ? 'भूमि का आकार (एकड़)' : 'Land Size (Acres)'}</Label>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        step="0.5"
                                        value={formData.landHolding}
                                        onChange={(e) => setFormData({ ...formData, landHolding: e.target.value })}
                                        className="mt-1"
                                        placeholder="2.5"
                                    />
                                ) : (
                                    <p className="mt-1 font-medium text-lg">
                                        {formData.landHolding ? `${formData.landHolding} ${language === 'hi' ? 'एकड़' : 'Acres'}` : '-'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label>{language === 'hi' ? 'उगाई जाने वाली फसलें' : 'Crops Grown'}</Label>
                                {isEditing ? (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {cropOptions.map((crop) => (
                                            <label
                                                key={crop.id}
                                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    formData.crops.includes(crop.id)
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:bg-muted'
                                                }`}
                                            >
                                                <Checkbox
                                                    checked={formData.crops.includes(crop.id)}
                                                    onCheckedChange={() => handleCropToggle(crop.id)}
                                                />
                                                <span className="text-sm">
                                                    {language === 'hi' ? crop.nameHi : crop.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {formData.crops.length > 0 ? (
                                            formData.crops.map((cropId) => {
                                                const crop = cropOptions.find(c => c.id === cropId);
                                                return (
                                                    <span
                                                        key={cropId}
                                                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                                    >
                                                        {language === 'hi' ? crop?.nameHi : crop?.name}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <p className="text-muted-foreground">-</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>{language === 'hi' ? 'ऑर्गेनिक प्रमाणित' : 'Organic Certified'}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {language === 'hi' ? 'क्या आपके पास ऑर्गेनिक प्रमाणन है?' : 'Do you have organic certification?'}
                                        </p>
                                    </div>
                                    {isEditing ? (
                                        <Checkbox
                                            checked={formData.organicCertified}
                                            onCheckedChange={(checked) => setFormData({ ...formData, organicCertified: !!checked })}
                                        />
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            formData.organicCertified
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {formData.organicCertified
                                                ? (language === 'hi' ? 'हाँ' : 'Yes')
                                                : (language === 'hi' ? 'नहीं' : 'No')}
                                        </span>
                                    )}
                                </div>

                                {formData.organicCertified && (
                                    <div className="mt-4">
                                        <Label>{language === 'hi' ? 'प्रमाणन आईडी' : 'Certification ID'}</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.certificationId}
                                                onChange={(e) => setFormData({ ...formData, certificationId: e.target.value })}
                                                className="mt-1"
                                                placeholder="ORG-KA-2024-XXXXX"
                                            />
                                        ) : (
                                            <p className="mt-1 font-medium">{formData.certificationId || '-'}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-auto py-5 flex flex-col items-center gap-2 touch-target"
                            onClick={() => router.push('/farmer/dashboard')}
                        >
                            <Leaf className="w-7 h-7 text-primary" />
                            <span className="text-lg">{language === 'hi' ? 'मेरी लिस्टिंग' : 'My Listings'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-auto py-5 flex flex-col items-center gap-2 touch-target"
                            onClick={() => router.push('/farmer/listing/create')}
                        >
                            <Building2 className="w-7 h-7 text-primary" />
                            <span className="text-lg">{language === 'hi' ? 'नई लिस्टिंग' : 'New Listing'}</span>
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
