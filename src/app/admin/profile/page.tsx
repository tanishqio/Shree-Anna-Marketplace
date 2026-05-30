"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Phone,
    Mail,
    Edit2,
    Save,
    X,
    ArrowLeft,
    Shield,
    Key,
    LayoutDashboard,
    CheckCircle,
    AlertCircle,
    Settings,
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

export default function AdminProfilePage() {
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
        designation: '',
        accessLevel: '',
    });

    const designations = [
        { value: 'state', label: 'State Admin' },
        { value: 'district', label: 'District Admin' },
        { value: 'logistics', label: 'Logistics Admin' },
        { value: 'support', label: 'Support Admin' },
        { value: 'super', label: 'Super Admin' },
    ];

    const accessLevels = [
        { value: 'read', label: 'Read Only' },
        { value: 'write', label: 'Read & Write' },
        { value: 'full', label: 'Full Access' },
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: '',
                designation: '',
                accessLevel: '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await userApi.updateProfile({
                name: formData.name,
            });
            await refreshUser();
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile');
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
        router.push('/login?role=admin');
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
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xl">🛡️</span>
                            </div>
                            <h1 className="text-xl font-heading font-bold">Admin Profile</h1>
                        </div>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
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
                        <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 text-4xl">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : '🛡️'}
                        </div>
                        <h2 className="text-2xl font-bold">{formData.name || 'Admin'}</h2>
                        <p className="text-muted-foreground">{formData.phone}</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                🛡️ Admin
                            </span>
                            {user?.onboarded && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-600" />
                                Personal Information
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>Name</Label>
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
                                    <Label>Phone</Label>
                                    <p className="mt-1 font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        {formData.phone}
                                    </p>
                                </div>
                                <div>
                                    <Label>Email</Label>
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

                    {/* Admin Access Info */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Shield className="w-4 h-4 text-purple-600" />
                                Admin Access
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>Designation</Label>
                                    {isEditing ? (
                                        <Select
                                            value={formData.designation}
                                            onValueChange={(value) => setFormData({ ...formData, designation: value })}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select designation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {designations.map((d) => (
                                                    <SelectItem key={d.value} value={d.value}>
                                                        {d.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="mt-1 font-medium capitalize">{formData.designation || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Access Level</Label>
                                    {isEditing ? (
                                        <Select
                                            value={formData.accessLevel}
                                            onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select access level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accessLevels.map((level) => (
                                                    <SelectItem key={level.value} value={level.value}>
                                                        {level.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="mt-1 font-medium flex items-center gap-2">
                                            <Key className="w-4 h-4 text-muted-foreground" />
                                            {formData.accessLevel || '-'}
                                        </p>
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
                            onClick={() => router.push('/admin/dashboard')}
                        >
                            <LayoutDashboard className="w-6 h-6 text-purple-600" />
                            <span>Admin Dashboard</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2"
                            onClick={() => router.push('/settings')}
                        >
                            <Settings className="w-6 h-6 text-purple-600" />
                            <span>Settings</span>
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
