"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Users,
  Package,
  IndianRupee,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Loader2,
  Volume2,
  VolumeX,
  Scale,
  CloudSun,
  ClipboardList,
  BarChart3,
  Leaf
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GovernmentSchemesHub } from '@/components/GovernmentSchemesHub';
import { OfflineSyncIndicator } from '@/components/OfflineSyncIndicator';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { milletTypes } from '@/lib/design-tokens';
import { useBatches, useReceivedOffers, useMyListings } from '@/lib/hooks/useData';

export default function FPODashboard() {
  const [role, setRole] = useState('fpo');
  const { user, isLoading: authLoading } = useAuth();
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  // Fetch real data from APIs
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: receivedOffers, isLoading: offersLoading } = useReceivedOffers();
  const { data: listings, isLoading: listingsLoading } = useMyListings();

  const isLoading = authLoading || batchesLoading || offersLoading || listingsLoading;

  // Calculate stats from real data
  const pendingOffers = receivedOffers?.filter(o => o.status === 'pending') || [];
  const activeListings = listings?.filter(l => l.status === 'active') || [];
  const totalAggregated = batches?.reduce((sum, b) => sum + (b.total_weight || 0), 0) || 0;
  const totalSales = listings?.filter(l => l.status === 'sold').reduce((sum, l) => sum + (l.qty_kg * l.min_price_per_qtl / 100), 0) || 0;

  const stats = {
    totalSales: totalSales > 0 ? `₹${(totalSales / 100000).toFixed(1)}L` : '₹0',
    activeListings: activeListings.length,
    pendingOffers: pendingOffers.length,
    totalAggregated: totalAggregated > 0 ? `${totalAggregated.toLocaleString()} kg` : '0 kg'
  };

  const userName = user?.name || 'FPO Admin';

  // Page voice descriptions
  const pageVoice = {
    en: `Welcome to your FPO dashboard ${userName}. You have ${stats.activeListings} active group listings and ${stats.pendingOffers} pending offers from buyers. Total aggregated quantity is ${stats.totalAggregated}.`,
    hi: `${userName}, आपके एफपीओ डैशबोर्ड में स्वागत है। आपके पास ${stats.activeListings} सक्रिय समूह लिस्टिंग और ${stats.pendingOffers} लंबित खरीदार प्रस्ताव हैं। कुल एकत्रित मात्रा ${stats.totalAggregated} है।`,
    kn: `${userName}, ನಿಮ್ಮ ಎಫ್‌ಪಿಒ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಬಳಿ ${stats.activeListings} ಸಕ್ರಿಯ ಗುಂಪು ಪಟ್ಟಿಗಳು ಮತ್ತು ${stats.pendingOffers} ಬಾಕಿ ಇರುವ ಖರೀದಿದಾರ ಆಫರ್‌ಗಳಿವೆ.`,
    te: `${userName}, మీ FPO డాష్‌బోర్డ్‌కు స్వాగతం. మీకు ${stats.activeListings} యాక్టివ్ గ్రూప్ లిస్టింగ్‌లు మరియు ${stats.pendingOffers} పెండింగ్ కొనుగోలుదారు ఆఫర్‌లు ఉన్నాయి.`,
    ta: `${userName}, உங்கள் FPO டாஷ்போர்டுக்கு வரவேற்கிறோம். உங்களிடம் ${stats.activeListings} செயலில் உள்ள குழு பட்டியல்கள் மற்றும் ${stats.pendingOffers} நிலுவையில் உள்ள வாங்குபவர் சலுகைகள் உள்ளன.`,
    mr: `${userName}, तुमच्या FPO डॅशबोर्डवर स्वागत आहे. तुमच्याकडे ${stats.activeListings} सक्रिय गट यादी आणि ${stats.pendingOffers} प्रलंबित खरेदीदार ऑफर आहेत.`,
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(pageVoice[language] || pageVoice.en);
    }
  };

  const getMilletName = (id: string) => {
    const m = milletTypes.find(t => t.id === id);
    return m ? m.name : id;
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
                {language === 'hi' ? 'यह आपका एफपीओ डैशबोर्ड है' : 'Here\'s your FPO dashboard'}
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
              <Link href="/fpo/listings/create">
                <Plus className="w-5 h-5 mr-2" />
                {language === 'hi' ? 'नई समूह लिस्टिंग' : 'Create Group Listing'}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Group Sales',
              value: stats.totalSales,
              icon: IndianRupee,
              color: 'bg-accent/10 text-accent',
            },
            {
              label: 'Active Listings',
              value: stats.activeListings,
              icon: Package,
              color: 'bg-primary/10 text-primary',
            },
            {
              label: 'Pending Offers',
              value: stats.pendingOffers,
              icon: MessageSquare,
              color: 'bg-terra-500/10 text-terra-600',
            },
            {
              label: 'Total Aggregated',
              value: stats.totalAggregated,
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
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
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
                  { label: 'Add Listing', icon: Plus, href: '/fpo/listings/create', color: 'bg-primary' },
                  { label: 'Manage Members', icon: Users, href: '/fpo/members', color: 'bg-terra-500' },
                  { label: 'Pending Offers', icon: MessageSquare, href: '/fpo/offers', color: 'bg-accent' },
                  { label: 'Payments', icon: IndianRupee, href: '/fpo/payments', color: 'bg-sky-500' },
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

            {/* Aggregated Listings */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Active Listings</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/fpo/listings">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {activeListings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No active listings yet</p>
                    <Button asChild>
                      <Link href="/fpo/listings/create">Create Group Listing</Link>
                    </Button>
                  </div>
                ) : (
                  activeListings.slice(0, 3).map((listing) => (
                    <div key={listing.id} className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{getMilletName(listing.crop)}</h3>
                          <Badge className="bg-primary/10 text-primary">
                            {listing.status}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium text-primary">₹{listing.min_price_per_qtl / 100}/kg</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Scale className="w-3 h-3" /> {listing.qty_kg} kg
                        </span>
                        <span className="flex items-center gap-1">
                          {listing.quality_grade || 'Standard'} Grade
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Offers */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Pending Buyer Offers</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/fpo/offers">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {pendingOffers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending offers</p>
                  </div>
                ) : (
                  pendingOffers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{offer.buyer_name || offer.buyer_company || 'Buyer'}</h3>
                          <Badge variant="outline" className="text-xs">{offer.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {offer.qty_kg} kg @ ₹{offer.price_per_qtl}/qtl
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">₹{(offer.qty_kg * offer.price_per_qtl / 100).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Value</p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/fpo/offers/${offer.id}`}>Review</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Batches */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Recent Batches</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/fpo/batches">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="overflow-x-auto">
                {batches && batches.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Batch Code</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Crop</th>
                        <th className="text-right py-2 text-sm font-medium text-muted-foreground">Weight</th>
                        <th className="text-right py-2 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.slice(0, 4).map((batch) => (
                        <tr key={batch.id} className="border-b border-border last:border-0">
                          <td className="py-3 text-sm font-medium">{batch.qr_code?.slice(0, 12) || batch.id.slice(0, 8)}</td>
                          <td className="py-3 text-sm text-muted-foreground">{getMilletName(batch.crop)}</td>
                          <td className="py-3 text-sm text-right">{batch.total_weight} kg</td>
                          <td className="py-3 text-sm text-right">
                            <Badge variant="outline">{batch.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No batches created yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <WeatherWidget />

            {/* Government Schemes */}
            <GovernmentSchemesHub compact />

            {/* Today's Tip */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 sm:p-6 border border-primary/20">
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Collective Selling Tip
              </h3>
              <p className="text-sm text-muted-foreground">
                Aggregating pearl millet into batches of 5 tons or more attracts larger institutional buyers and better prices.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Strategy
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
