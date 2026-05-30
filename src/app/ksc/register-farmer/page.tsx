"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    UserPlus,
    Phone,
    User,
    MapPin,
    ChevronLeft,
    Loader2,
    CheckCircle,
    Home,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { kscApi } from '@/lib/api';

const districts = [
    { value: 'bangalore_urban', label: 'Bangalore Urban' },
    { value: 'bangalore_rural', label: 'Bangalore Rural' },
    { value: 'tumkur', label: 'Tumkur' },
    { value: 'hassan', label: 'Hassan' },
    { value: 'mandya', label: 'Mandya' },
    { value: 'mysore', label: 'Mysore' },
    { value: 'raichur', label: 'Raichur' },
    { value: 'bellary', label: 'Bellary' },
    { value: 'davanagere', label: 'Davanagere' },
];

const states = [
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
    { value: 'telangana', label: 'Telangana' },
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
];

export default function RegisterFarmer() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { language } = useLanguage();
    const [role, setRole] = useState('ksc');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        village: '',
        district: '',
        state: 'karnataka',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const validateForm = () => {
        if (!formData.name.trim() || formData.name.length < 2) {
            setError(language === 'hi' ? 'कृपया वैध नाम दर्ज करें' : 'Please enter a valid name');
            return false;
        }
        if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) {
            setError(language === 'hi' ? 'कृपया वैध 10 अंकों का फोन नंबर दर्ज करें' : 'Please enter a valid 10-digit phone number');
            return false;
        }
        if (!formData.district) {
            setError(language === 'hi' ? 'कृपया जिला चुनें' : 'Please select a district');
            return false;
        }
        if (!formData.state) {
            setError(language === 'hi' ? 'कृपया राज्य चुनें' : 'Please select a state');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await kscApi.registerFarmerAssisted(user.id, {
                name: formData.name,
                phone: formData.phone,
                district: formData.district,
                state: formData.state,
                village: formData.village,
            });

            setIsSuccess(true);

            // Reset form after success
            setTimeout(() => {
                setFormData({
                    name: '',
                    phone: '',
                    village: '',
                    district: '',
                    state: 'karnataka',
                });
                setIsSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error registering farmer:', err);
            setError(
                language === 'hi'
                    ? 'किसान पंजीकरण विफल। कृपया पुनः प्रयास करें।'
                    : 'Failed to register farmer. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/ksc/dashboard">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-2">
                            <UserPlus className="w-8 h-8 text-primary" />
                            {language === 'hi' ? 'किसान पंजीकरण' : 'Register Farmer'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {language === 'hi'
                                ? 'नए किसान को सीधे सत्यापित स्थिति के साथ पंजीकृत करें'
                                : 'Register a new farmer directly with verified status'}
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Registration Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    {language === 'hi' ? 'किसान विवरण' : 'Farmer Details'}
                                </CardTitle>
                                <CardDescription>
                                    {language === 'hi'
                                        ? 'किसान की जानकारी नीचे दर्ज करें। उनका खाता स्वचालित रूप से सत्यापित हो जाएगा।'
                                        : 'Enter the farmer details below. Their account will be automatically verified.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-10 h-10 text-accent" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-accent mb-2">
                                            {language === 'hi' ? 'किसान सफलतापूर्वक पंजीकृत!' : 'Farmer Registered Successfully!'}
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            {language === 'hi'
                                                ? 'किसान अब ऐप में लॉगिन कर सकता है।'
                                                : 'The farmer can now login to the app.'}
                                        </p>
                                        <div className="flex justify-center gap-3">
                                            <Button variant="outline" onClick={() => setIsSuccess(false)}>
                                                {language === 'hi' ? 'और पंजीकृत करें' : 'Register Another'}
                                            </Button>
                                            <Button asChild>
                                                <Link href="/ksc/dashboard">
                                                    {language === 'hi' ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard'}
                                                </Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {language === 'hi' ? 'पूरा नाम' : 'Full Name'} *
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder={language === 'hi' ? 'किसान का नाम दर्ज करें' : 'Enter farmer name'}
                                                value={formData.name}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                className="h-12"
                                                required
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'} *
                                            </Label>
                                            <div className="flex gap-2">
                                                <div className="flex items-center justify-center bg-muted px-4 rounded-lg font-medium">
                                                    +91
                                                </div>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder={language === 'hi' ? '10 अंकों का नंबर' : '10 digit number'}
                                                    value={formData.phone}
                                                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    className="h-12 flex-1"
                                                    maxLength={10}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Village */}
                                        <div className="space-y-2">
                                            <Label htmlFor="village" className="flex items-center gap-2">
                                                <Home className="w-4 h-4" />
                                                {language === 'hi' ? 'गाँव / ब्लॉक' : 'Village / Block'}
                                            </Label>
                                            <Input
                                                id="village"
                                                placeholder={language === 'hi' ? 'गाँव का नाम दर्ज करें' : 'Enter village name'}
                                                value={formData.village}
                                                onChange={(e) => updateField('village', e.target.value)}
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {/* District */}
                                            <div className="space-y-2">
                                                <Label htmlFor="district" className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {language === 'hi' ? 'जिला' : 'District'} *
                                                </Label>
                                                <Select value={formData.district} onValueChange={(v) => updateField('district', v)}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder={language === 'hi' ? 'जिला चुनें' : 'Select District'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {districts.map((d) => (
                                                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* State */}
                                            <div className="space-y-2">
                                                <Label htmlFor="state" className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {language === 'hi' ? 'राज्य' : 'State'} *
                                                </Label>
                                                <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder={language === 'hi' ? 'राज्य चुनें' : 'Select State'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {states.map((s) => (
                                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                                                {error}
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full h-14 text-lg"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    {language === 'hi' ? 'पंजीकरण हो रहा है...' : 'Registering...'}
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-5 h-5 mr-2" />
                                                    {language === 'hi' ? 'किसान पंजीकृत करें' : 'Register Farmer'}
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tips Card */}
                        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span>💡</span> {language === 'hi' ? 'सहायक पंजीकरण' : 'Assisted Registration'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                    <p className="text-muted-foreground">
                                        {language === 'hi'
                                            ? 'इस तरह पंजीकृत किसान स्वचालित रूप से सत्यापित हो जाते हैं।'
                                            : 'Farmers registered this way are automatically verified.'}
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                    <p className="text-muted-foreground">
                                        {language === 'hi'
                                            ? 'किसान तुरंत लिस्टिंग बनाने और बिक्री शुरू करने में सक्षम होंगे।'
                                            : 'Farmers can immediately create listings and start selling.'}
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                    <p className="text-muted-foreground">
                                        {language === 'hi'
                                            ? 'किसान को उनके पंजीकृत नंबर पर SMS प्राप्त होगा।'
                                            : 'Farmer will receive an SMS on their registered number.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {language === 'hi' ? 'आज की गतिविधि' : "Today's Activity"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-4">
                                    <div className="text-4xl font-bold text-primary mb-2">
                                        {user?.name ? '✨' : '0'}
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        {language === 'hi' ? 'आज पंजीकृत किसान' : 'Farmers registered today'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
