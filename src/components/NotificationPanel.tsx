"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Cloud,
    Sprout,
    FileText,
    AlertTriangle,
    ShoppingCart,
    Truck,
    X,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useLanguage } from '@/lib/hooks/useLanguage';
import {
    mockNotifications,
    getNotificationsByType,
    getUnreadCount,
    getUnreadCountByType,
    type NotificationType,
    type Notification,
} from '@/lib/notification-data';

const categoryConfig = {
    weather: {
        label: 'Weather',
        labelHi: 'मौसम',
        icon: Cloud,
        color: 'text-sky-500',
        bgColor: 'bg-sky-50',
    },
    season: {
        label: 'Seasons',
        labelHi: 'मौसम',
        icon: Sprout,
        color: 'text-accent',
        bgColor: 'bg-accent/10',
    },
    scheme: {
        label: 'Schemes',
        labelHi: 'योजनाएं',
        icon: FileText,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
    },
    disaster: {
        label: 'Alerts',
        labelHi: 'चेतावनी',
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
    },
    order: {
        label: 'Orders',
        labelHi: 'ऑर्डर',
        icon: ShoppingCart,
        color: 'text-terra-500',
        bgColor: 'bg-terra-50',
    },
    logistics: {
        label: 'Logistics',
        labelHi: 'रसद',
        icon: Truck,
        color: 'text-earth-600',
        bgColor: 'bg-earth-50',
    },
};

export function NotificationPanel() {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<NotificationType | 'all'>('all');
    const [notifications, setNotifications] = useState(mockNotifications);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getFilteredNotifications = () => {
        if (activeTab === 'all') {
            return notifications;
        }
        return notifications.filter(n => n.type === activeTab);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
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

        if (minutes < 60) {
            return language === 'hi' ? `${minutes} मिनट पहले` : `${minutes}m ago`;
        } else if (hours < 24) {
            return language === 'hi' ? `${hours} घंटे पहले` : `${hours}h ago`;
        } else {
            return language === 'hi' ? `${days} दिन पहले` : `${days}d ago`;
        }
    };

    const categories: (NotificationType | 'all')[] = ['all', 'weather', 'season', 'scheme', 'disaster', 'order', 'logistics'];

    const filteredNotifications = getFilteredNotifications();

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] sm:w-[420px] p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                        <h3 className="font-heading font-semibold text-base">
                            {language === 'hi' ? 'सूचनाएं' : 'Notifications'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {language === 'hi' ? `${unreadCount} अपठित` : `${unreadCount} unread`}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs"
                        >
                            <Check className="w-3 h-3 mr-1" />
                            {language === 'hi' ? 'सभी पढ़ें' : 'Mark all read'}
                        </Button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="flex gap-1 p-2 border-b border-border overflow-x-auto scrollbar-thin">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                    >
                        {language === 'hi' ? 'सभी' : 'All'} ({notifications.length})
                    </button>
                    {(Object.keys(categoryConfig) as NotificationType[]).map(type => {
                        const config = categoryConfig[type];
                        const Icon = config.icon;
                        const count = getUnreadCountByType(type);
                        return (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${activeTab === type
                                    ? `${config.bgColor} ${config.color}`
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-3 h-3" />
                                {language === 'hi' ? config.labelHi : config.label}
                                {count > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">
                                    {language === 'hi' ? 'कोई सूचना नहीं' : 'No notifications'}
                                </p>
                            </div>
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
                                        onClick={() => markAsRead(notification.id)}
                                        className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className={`shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                                                <span className="text-xl">{notification.icon}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {language === 'hi' ? notification.titleHi : notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                    {language === 'hi' ? notification.messageHi : notification.message}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`flex items-center gap-1 ${config.color}`}>
                                                        <Icon className="w-3 h-3" />
                                                        <span className="text-xs font-medium">
                                                            {language === 'hi' ? config.labelHi : config.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {getRelativeTime(notification.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {filteredNotifications.length > 0 && (
                    <div className="p-3 border-t border-border bg-muted/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            asChild
                        >
                            <Link href="/notifications" onClick={() => setIsOpen(false)}>
                                {language === 'hi' ? 'सभी सूचनाएं देखें' : 'View All Notifications'}
                            </Link>
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
