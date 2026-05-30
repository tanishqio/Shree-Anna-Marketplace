"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Activity,
  ShieldCheck,
  BarChart3,
  Server,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  ChevronRight,
  Loader2,
  Volume2,
  VolumeX,
  Search,
  IndianRupee,
  Package,
  Scale
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GovernmentSchemesHub } from '@/components/GovernmentSchemesHub';
import { OfflineSyncIndicator } from '@/components/OfflineSyncIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
// import { useAdminDashboard } from '@/lib/hooks/useData'; // TODO: Implement this hook

export default function AdminDashboard() {
  const [role, setRole] = useState('admin');
  const { user, isLoading: authLoading } = useAuth();
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  // Fetch real admin dashboard stats
  // const { data: adminStats, isLoading: statsLoading } = useAdminDashboard(); // TODO: Re-enable after implementing hook
  const adminStats: any = null; // Mock for now
  const statsLoading = false;

  const isLoading = authLoading || statsLoading;

  // Calculate display stats from API data
  const stats = adminStats?.stats || {
    users: { total: 0, farmers: 0, fpos: 0, buyers: 0 },
    marketplace: { listings: 0, active_listings: 0, batches: 0, orders: 0 },
    fpos: { total: 0, verified: 0 },
    activity: { events_24h: 0 },
    payments: { total_completed: 0 }
  };

  const displayStats = {
    totalUsers: stats.users.total.toLocaleString(),
    totalTransactions: stats.payments.total_completed > 0
      ? `₹${(stats.payments.total_completed / 10000000).toFixed(1)}Cr`
      : '₹0',
    activeListings: stats.marketplace.active_listings.toLocaleString(),
    volumeTraded: stats.marketplace.orders > 0
      ? `${stats.marketplace.orders} Orders`
      : '0'
  };

  // Top categories (would come from a specific API in production)
  const topCategories = [
    { name: 'Finger Millet', percentage: 45, color: 'bg-primary' },
    { name: 'Pearl Millet', percentage: 30, color: 'bg-accent' },
    { name: 'Foxtail Millet', percentage: 15, color: 'bg-terra-500' },
    { name: 'Others', percentage: 10, color: 'bg-muted' }
  ];

  // Activity feed placeholder (TODO: Connect to /admin/activity endpoint when available)
  const activityFeed = [
    { id: '1', icon: Users, message: `${stats.users.farmers} farmers registered`, time: 'Recent', color: 'bg-primary' },
    { id: '2', icon: Package, message: `${stats.marketplace.active_listings} active listings`, time: 'Current', color: 'bg-accent' },
    { id: '3', icon: TrendingUp, message: `${stats.activity.events_24h} events in 24h`, time: 'Today', color: 'bg-terra-500' },
  ];

  // Verification queue placeholder (TODO: Connect to /admin/verification endpoint when available)
  const verificationQueue = stats.fpos.total > stats.fpos.verified
    ? [{ id: '1', name: 'Pending FPOs', type: 'FPO', entity: `${stats.fpos.total - stats.fpos.verified} unverified`, status: 'Awaiting Review' }]
    : [];

  const userName = user?.name || 'Admin';

  // Page voice descriptions
  const pageVoice = {
    en: `Welcome to the Admin Dashboard. Platform has ${displayStats.totalUsers} total users and ${displayStats.activeListings} active listings. Total transactions are ${displayStats.totalTransactions}.`,
    hi: `एडमिन डैशबोर्ड में आपका स्वागत है। प्लेटफॉर्म पर ${displayStats.totalUsers} कुल उपयोगकर्ता और ${displayStats.activeListings} सक्रिय लिस्टिंग हैं। कुल लेनदेन ${displayStats.totalTransactions} है।`,
    kn: `ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ. ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನಲ್ಲಿ ${displayStats.totalUsers} ಒಟ್ಟು ಬಳಕೆದಾರರು ಮತ್ತು ${displayStats.activeListings} ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳಿವೆ.`,
    te: `అడ్మిన్ డాష్‌బోర్డ్‌కు స్వాగతం. ప్లాట్‌ఫారమ్‌లో ${displayStats.totalUsers} మొత్తం వినియోగదారులు మరియు ${displayStats.activeListings} యాక్టివ్ లిస్టింగ్‌లు ఉన్నాయి.`,
    ta: `நிர்வாகி டாஷ்போர்டுக்கு வரவேற்கிறோம். தளத்தில் ${displayStats.totalUsers} மொத்த பயனர்கள் மற்றும் ${displayStats.activeListings} செயலில் உள்ள பட்டியல்கள் உள்ளன.`,
    mr: `अॅडमिन डॅशबोर्डवर स्वागत आहे. प्लॅटफॉर्मवर ${displayStats.totalUsers} एकूण वापरकर्ते आणि ${displayStats.activeListings} सक्रिय यादी आहेत.`,
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(pageVoice[language] || pageVoice.en);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold">
                {language === 'hi' ? `स्वागत है, ${userName}! 👋` : `Welcome, ${userName}! 👋`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === 'hi' ? 'प्लेटफ़ॉर्म प्रशासन अवलोकन' : 'Platform Administration Overview'}
              </p>
            </div>
            <button
              onClick={handleSpeak}
              className={`p-3 rounded-full transition-all ${isSpeaking
                ? 'bg-primary text-primary-foreground animate-pulse'
                : 'bg-muted hover:bg-muted/80'
                }`}
              title={isSpeaking ? 'Stop' : 'Listen'}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <OfflineSyncIndicator />
            <Button asChild size="lg" className="touch-target">
              <Link href="/admin/health">
                <Activity className="w-5 h-5 mr-2" />
                {language === 'hi' ? 'सिस्टम स्वास्थ्य' : 'Platform Health'}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Users',
              value: displayStats.totalUsers,
              icon: Users,
              color: 'bg-primary/10 text-primary',
            },
            {
              label: 'Transactions',
              value: displayStats.totalTransactions,
              icon: IndianRupee,
              color: 'bg-accent/10 text-accent',
            },
            {
              label: 'Active Listings',
              value: displayStats.activeListings,
              icon: Package,
              color: 'bg-terra-500/10 text-terra-600',
            },
            {
              label: 'Orders',
              value: displayStats.volumeTraded,
              icon: Scale,
              color: 'bg-sky-500/10 text-sky-600',
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card rounded-2xl border border-border p-4 sm:p-6"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'User Management', icon: Users, href: '/admin/users', color: 'bg-primary' },
                  { label: 'Verify Listings', icon: ShieldCheck, href: '/admin/verification', color: 'bg-terra-500' },
                  { label: 'Schemes', icon: FileText, href: '/admin/schemes', color: 'bg-accent' },
                  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-sky-500' },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors touch-target"
                  >
                    <div className={`w-12 h-12 rounded-full ${action.color} text-white flex items-center justify-center`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Activity Feed */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Platform Activity</h2>
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-4">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Queue */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Verification Queue</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/verification">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {verificationQueue.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.entity} • {item.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" className="bg-accent hover:bg-accent/90">
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Status */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Platform Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Server</span>
                  <Badge className="bg-accent text-white">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-accent text-white">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sync Service</span>
                  <Badge className="bg-accent text-white">Operational</Badge>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Top Categories
              </h3>
              <div className="space-y-4">
                {topCategories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.name}</span>
                      <span className="font-medium">{cat.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${cat.color} h-2 rounded-full`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Government Schemes */}
            <GovernmentSchemesHub compact />

            {/* Admin Tip */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 sm:p-6 border border-primary/20">
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Admin Insight
              </h3>
              <p className="text-sm text-muted-foreground">
                32 new FPOs registered this week. Consider scheduling a bulk onboarding session to verify their documents.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Registrations
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
