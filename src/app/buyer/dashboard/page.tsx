"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  ShoppingBag,
  FileText,
  TrendingUp,
  MessageSquare,
  History,
  ChevronRight,
  Loader2,
  Volume2,
  VolumeX,
  Search,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  MapPin,
  Star
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { GovernmentSchemesHub } from '@/components/GovernmentSchemesHub';
import { OfflineSyncIndicator } from '@/components/OfflineSyncIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { milletTypes } from '@/lib/design-tokens';
import { useListings, useOrders, useMadeOffers } from '@/lib/hooks/useData';

export default function BuyerDashboard() {
  const [role, setRole] = useState('buyer');
  const { user, isLoading: authLoading } = useAuth();
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  // Fetch real data from APIs
  const { data: listingsData, isLoading: listingsLoading } = useListings({ limit: 4 });
  const { data: orders, isLoading: ordersLoading } = useOrders('buyer');
  const { data: madeOffers, isLoading: offersLoading } = useMadeOffers();

  const isLoading = authLoading || listingsLoading || ordersLoading || offersLoading;

  // Transform listings for display - owner info (name, district) comes from users table via JOIN
  const recommendedListings = listingsData?.items?.slice(0, 4).map(listing => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listingWithOwner = listing as any;
    return {
      id: listing.id,
      farmerName: listingWithOwner.owner?.name || 'Farmer',
      milletType: listing.crop,
      quantity: listing.qty_kg,
      price: listing.min_price_per_qtl / 100,
      // Use owner's district from users table - no need to store in listings
      location: listingWithOwner.owner?.district || 'India',
      rating: 4.5,
      image: listing.photos?.[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
    };
  }) || [];

  // Calculate stats from real data
  const pendingOffers = madeOffers?.filter(o => o.status === 'pending') || [];
  const totalOrders = orders?.length || 0;
  const totalVolume = orders?.reduce((sum, o) => sum + (o.quantity_kg || 0), 0) || 0;

  const stats = {
    totalProcurements: totalOrders,
    activeRequests: pendingOffers.length,
    pendingQuotes: pendingOffers.length,
    totalVolume: totalVolume > 0 ? `${totalVolume.toLocaleString()} kg` : '0 kg'
  };

  // Market trends (would come from a market prices API in production)
  const marketTrends = [
    { name: 'Finger Millet', price: 45, change: 12, trend: 'up' as const },
    { name: 'Pearl Millet', price: 38, change: -5, trend: 'down' as const },
    { name: 'Foxtail Millet', price: 55, change: 8, trend: 'up' as const },
    { name: 'Sorghum', price: 42, change: 2, trend: 'up' as const }
  ];

  const userName = user?.name || 'Buyer';

  // Page voice descriptions
  const pageVoice = {
    en: `Welcome to your buyer dashboard ${userName}. You have ${stats.activeRequests} active purchase requests and ${stats.pendingQuotes} pending quotes. Total volume procured is ${stats.totalVolume}. Finger millet supply is up 12%.`,
    hi: `${userName}, आपके खरीदार डैशबोर्ड में स्वागत है। आपके पास ${stats.activeRequests} सक्रिय खरीद अनुरोध और ${stats.pendingQuotes} लंबित कोट्स हैं। कुल खरीद मात्रा ${stats.totalVolume} है।`,
    kn: `${userName}, ನಿಮ್ಮ ಖರೀದಿದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಬಳಿ ${stats.activeRequests} ಸಕ್ರಿಯ ಖರೀದಿ ವಿನಂತಿಗಳು ಮತ್ತು ${stats.pendingQuotes} ಬಾಕಿ ಇರುವ ಕೋಟ್‌ಗಳಿವೆ.`,
    te: `${userName}, మీ కొనుగోలుదారు డాష్‌బోర్డ్‌కు స్వాగతం. మీకు ${stats.activeRequests} యాక్టివ్ కొనుగోలు అభ్యర్థనలు మరియు ${stats.pendingQuotes} పెండింగ్ కోట్‌లు ఉన్నాయి.`,
    ta: `${userName}, உங்கள் வாங்குபவர் டாஷ்போர்டுக்கு வரவேற்கிறோம். உங்களிடம் ${stats.activeRequests} செயலில் உள்ள கொள்முதல் கோரிக்கைகள் மற்றும் ${stats.pendingQuotes} நிலுவையில் உள்ள மேற்கோள்கள் உள்ளன.`,
    mr: `${userName}, तुमच्या खरेदीदार डॅशबोर्डवर स्वागत आहे. तुमच्याकडे ${stats.activeRequests} सक्रिय खरेदी विनंत्या आणि ${stats.pendingQuotes} प्रलंबित कोट्स आहेत.`,
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
                {language === 'hi' ? 'यह आपका खरीदार डैशबोर्ड है' : 'Here\'s your procurement dashboard'}
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
              <Link href="/marketplace">
                <Search className="w-5 h-5 mr-2" />
                {language === 'hi' ? 'मार्केटप्लेस देखें' : 'Browse Marketplace'}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Orders',
              value: stats.totalProcurements,
              icon: CheckCircle,
              color: 'bg-accent/10 text-accent',
            },
            {
              label: 'Pending Offers',
              value: stats.activeRequests,
              icon: FileText,
              color: 'bg-primary/10 text-primary',
            },
            {
              label: 'Pending Quotes',
              value: stats.pendingQuotes,
              icon: MessageSquare,
              color: 'bg-terra-500/10 text-terra-600',
            },
            {
              label: 'Volume Procured',
              value: stats.totalVolume,
              icon: ShoppingBag,
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
                  { label: 'Marketplace', icon: Search, href: '/marketplace', color: 'bg-primary' },
                  { label: 'View Listings', icon: Leaf, href: '/marketplace', color: 'bg-terra-500' },
                  { label: 'My Offers', icon: MessageSquare, href: '/buyer/offers', color: 'bg-accent' },
                  { label: 'Order History', icon: History, href: '/buyer/orders', color: 'bg-sky-500' },
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

            {/* Recommended Listings from Real API */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Available Listings</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/marketplace">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              {recommendedListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No listings available</p>
                  <Button asChild className="mt-4">
                    <Link href="/marketplace">Browse Marketplace</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {recommendedListings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/marketplace/${listing.id}`}
                      className="border border-border rounded-xl p-3 flex gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-2xl">🌾</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">{getMilletName(listing.milletType)}</h3>
                          <div className="flex items-center text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {listing.rating}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{listing.farmerName}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          {listing.location}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <p className="font-semibold text-primary">₹{listing.price}/kg</p>
                          <p className="text-xs text-muted-foreground">{listing.quantity} kg avail</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Offers from Real API */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">My Pending Offers</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/buyer/offers">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {pendingOffers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending offers</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/marketplace">Browse listings to make offers</Link>
                    </Button>
                  </div>
                ) : (
                  pendingOffers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Offer #{offer.id.slice(0, 8)}</h3>
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Recent Orders</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/buyer/orders">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {orders && orders.length > 0 ? (
                  orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                      <div>
                        <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity_kg} kg • ₹{order.total_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={`
                          ${order.status === 'pending_pickup' ? 'bg-yellow-500/10 text-yellow-600' : ''}
                          ${order.status === 'in_transit' ? 'bg-blue-500/10 text-blue-600' : ''}
                          ${order.status === 'delivered' ? 'bg-accent/10 text-accent' : ''}
                          ${order.status === 'completed' ? 'bg-accent/10 text-accent' : ''}
                        `}>
                          {order.status?.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Price Trends Widget */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Market Price Trends
              </h3>
              <div className="space-y-4">
                {marketTrends.map((trend) => (
                  <div key={trend.name} className="flex items-center justify-between">
                    <span className="font-medium">{trend.name}</span>
                    <div className="text-right">
                      <p className="font-semibold">₹{trend.price}/kg</p>
                      <div className={`flex items-center justify-end text-xs ${trend.trend === 'up' ? 'text-accent' : 'text-red-500'}`}>
                        {trend.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(trend.change)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View Detailed Report
              </Button>
            </div>

            {/* Government Schemes */}
            <GovernmentSchemesHub compact />

            {/* Today's Tip */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 sm:p-6 border border-primary/20">
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Today&apos;s Tip
              </h3>
              <p className="text-sm text-muted-foreground">
                Finger millet supply is up 12% this week. It&apos;s a good time to negotiate bulk rates with FPOs in Karnataka.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Analysis
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
