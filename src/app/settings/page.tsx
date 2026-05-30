"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Globe,
    Bell,
    Shield,
    Smartphone,
    Moon,
    Sun,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage, Language } from '@/lib/hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { languages } from '@/lib/design-tokens';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
    const router = useRouter();
    const { language, setLanguage } = useLanguage();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(false);
    const [offlineMode, setOfflineMode] = React.useState(true);

    const settingsSections = [
        {
            title: language === 'hi' ? 'सामान्य' : 'General',
            items: [
                {
                    icon: Globe,
                    label: language === 'hi' ? 'भाषा' : 'Language',
                    description: language === 'hi' ? 'ऐप की भाषा चुनें' : 'Choose app language',
                    action: (
                        <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.nativeName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ),
                },
                {
                    icon: darkMode ? Moon : Sun,
                    label: language === 'hi' ? 'डार्क मोड' : 'Dark Mode',
                    description: language === 'hi' ? 'डार्क थीम चालू करें' : 'Enable dark theme',
                    action: (
                        <Switch
                            checked={darkMode}
                            onCheckedChange={setDarkMode}
                        />
                    ),
                },
            ],
        },
        {
            title: language === 'hi' ? 'सूचनाएं' : 'Notifications',
            items: [
                {
                    icon: Bell,
                    label: language === 'hi' ? 'पुश सूचनाएं' : 'Push Notifications',
                    description: language === 'hi' ? 'महत्वपूर्ण अपडेट प्राप्त करें' : 'Receive important updates',
                    action: (
                        <Switch
                            checked={notificationsEnabled}
                            onCheckedChange={setNotificationsEnabled}
                        />
                    ),
                },
            ],
        },
        {
            title: language === 'hi' ? 'ऑफ़लाइन' : 'Offline',
            items: [
                {
                    icon: Smartphone,
                    label: language === 'hi' ? 'ऑफ़लाइन मोड' : 'Offline Mode',
                    description: language === 'hi' ? 'बिना इंटरनेट के ऐप का उपयोग करें' : 'Use app without internet',
                    action: (
                        <Switch
                            checked={offlineMode}
                            onCheckedChange={setOfflineMode}
                        />
                    ),
                },
            ],
        },
        {
            title: language === 'hi' ? 'सुरक्षा' : 'Security',
            items: [
                {
                    icon: Shield,
                    label: language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy',
                    description: language === 'hi' ? 'हमारी गोपनीयता नीति देखें' : 'View our privacy policy',
                    action: <ChevronRight className="w-5 h-5 text-muted-foreground" />,
                    onClick: () => router.push('/privacy'),
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="w-6 h-6 text-primary" />
                        <h1 className="text-xl font-heading font-bold">
                            {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-6 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {settingsSections.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="space-y-2">
                            <h2 className="text-sm font-medium text-muted-foreground px-1">
                                {section.title}
                            </h2>
                            <div className="bg-card rounded-xl border border-border overflow-hidden">
                                {section.items.map((item, itemIdx) => {
                                    const Icon = item.icon;
                                    const hasOnClick = 'onClick' in item && item.onClick;
                                    return (
                                        <div
                                            key={itemIdx}
                                            onClick={hasOnClick ? (item as { onClick: () => void }).onClick : undefined}
                                            className={`
                        flex items-center justify-between p-4 
                        ${hasOnClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                        ${itemIdx > 0 ? 'border-t border-border' : ''}
                      `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.label}</p>
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                </div>
                                            </div>
                                            {item.action}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* App version */}
                    <div className="text-center text-sm text-muted-foreground pt-8">
                        <p>Shree Anna v1.0.0</p>
                        <p className="mt-1">© 2024 Shree Anna. All rights reserved.</p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
