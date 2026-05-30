"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Bell, Cloud, Sprout, FileText, AlertTriangle, ShoppingCart, Truck,
    Check, ArrowLeft, Filter
} from 'lucide-react';
import Link from 'next/link';
import {
    mockNotifications,
    type NotificationType,
} from '@/lib/notification-data';

const categoryConfig = {
    weather: { label: 'Weather', labelHi: 'मौसम', icon: Cloud, color: 'text-sky-500', bgColor: 'bg-sky-50 dark:bg-sky-950/30' },
    season: { label: 'Seasons', labelHi: 'मौसम', icon: Sprout, color: 'text-accent', bgColor: 'bg-accent/10' },
    scheme: { label: 'Schemes', labelHi: 'योजनाएं', icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    disaster: { label: 'Alerts', labelHi: 'चेतावनी', icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
    order: { label: 'Orders', labelHi: 'ऑर्डर', icon: ShoppingCart, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
    logistics: { label: 'Logistics', labelHi: 'रसद', icon: Truck, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
};

export default function NotificationsPage() {
    const [role, setRole] = useState('farmer');
    const [showHelp, setShowHelp] = useState(false);
    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState<NotificationType | 'all'>('all');
    const [notifications, setNotifications] = useState(mockNotifications);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getFilteredNotifications = () => {
        if (activeTab === 'all') return notifications;
        return notifications.filter(n => n.type === activeTab);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const getRelativeTime = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return language === 'hi' ? `${minutes} मिनट पहले` : `${minutes}m ago`;
        if (hours < 24) return language === 'hi' ? `${hours} घंटे पहले` : `${hours}h ago`;
        return language === 'hi' ? `${days} दिन पहले` : `${days}d ago`;
    };

    const filteredNotifications = getFilteredNotifications();

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
                                <Bell className="w-8 h-8 text-primary" />
                                {language === 'hi' ? 'सभी सूचनाएं' : 'All Notifications'}
                            </h1>
                            <p className="text-muted-foreground">
                                {language === 'hi' ? `${unreadCount} अपठित सूचनाएं` : `${unreadCount} unread notifications`}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                            <Check className="w-4 h-4" />
                            {language === 'hi' ? 'सभी पढ़ें' : 'Mark all read'}
                        </Button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {language === 'hi' ? 'सभी' : 'All'} ({notifications.length})
                    </button>
                    {(Object.keys(categoryConfig) as NotificationType[]).map(type => {
                        const config = categoryConfig[type];
                        const Icon = config.icon;
                        const count = notifications.filter(n => n.type === type).length;
                        return (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === type
                                    ? `${config.bgColor} ${config.color}`
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {language === 'hi' ? config.labelHi : config.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-lg text-muted-foreground">
                                    {language === 'hi' ? 'कोई सूचना नहीं' : 'No notifications'}
                                </p>
                            </Card>
                        ) : (
                            filteredNotifications.map((notification) => {
                                const config = categoryConfig[notification.type];
                                const Icon = config.icon;
                                return (
                                    <motion.div
                                        key={notification.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                    >
                                        <Card
                                            onClick={() => markAsRead(notification.id)}
                                            className={`cursor-pointer hover:shadow-md transition-all ${!notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex gap-4">
                                                    {/* Icon */}
                                                    <div className={`shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
                                                        <span className="text-2xl">{notification.icon}</span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <h4 className={`text-base font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                {language === 'hi' ? notification.titleHi : notification.title}
                                                            </h4>
                                                            {!notification.isRead && (
                                                                <div className="w-3 h-3 rounded-full bg-primary shrink-0 mt-1" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-3">
                                                            {language === 'hi' ? notification.messageHi : notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <div className={`flex items-center gap-1 ${config.color}`}>
                                                                <Icon className="w-4 h-4" />
                                                                <span className="font-medium">
                                                                    {language === 'hi' ? config.labelHi : config.label}
                                                                </span>
                                                            </div>
                                                            <span className="text-muted-foreground">•</span>
                                                            <span className="text-muted-foreground">
                                                                {getRelativeTime(notification.timestamp)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer onOpenHelp={() => setShowHelp(true)} />
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
