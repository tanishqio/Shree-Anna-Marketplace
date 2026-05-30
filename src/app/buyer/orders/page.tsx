"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  IndianRupee,
  Star,
  Volume2,
  VolumeX,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { milletTypes } from '@/lib/design-tokens';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useOrders } from '@/lib/hooks/useData';
import { Loader2 } from 'lucide-react';

interface Order {
  id: string;
  listingId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  milletType: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDelivery?: Date;
  deliveredDate?: Date;
  trackingId?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    listingId: '1',
    farmerId: 'f1',
    farmerName: 'Ramesh Kumar',
    farmerPhone: '+91 98765 43210',
    farmerLocation: 'Tumkur, Karnataka',
    milletType: 'finger',
    quantity: 200,
    pricePerKg: 45,
    totalAmount: 9000,
    status: 'shipped',
    orderDate: new Date('2024-01-20'),
    expectedDelivery: new Date('2024-01-25'),
    trackingId: 'TRK123456',
    paymentStatus: 'paid',
  },
  {
    id: 'ORD-2024-002',
    listingId: '2',
    farmerId: 'f2',
    farmerName: 'Lakshmi Devi',
    farmerPhone: '+91 98765 43211',
    farmerLocation: 'Anantapur, AP',
    milletType: 'foxtail',
    quantity: 100,
    pricePerKg: 55,
    totalAmount: 5500,
    status: 'delivered',
    orderDate: new Date('2024-01-15'),
    expectedDelivery: new Date('2024-01-20'),
    deliveredDate: new Date('2024-01-19'),
    paymentStatus: 'paid',
  },
  {
    id: 'ORD-2024-003',
    listingId: '3',
    farmerId: 'f3',
    farmerName: 'Venkatesh Reddy',
    farmerPhone: '+91 98765 43212',
    farmerLocation: 'Warangal, Telangana',
    milletType: 'pearl',
    quantity: 500,
    pricePerKg: 38,
    totalAmount: 19000,
    status: 'confirmed',
    orderDate: new Date('2024-01-22'),
    expectedDelivery: new Date('2024-01-28'),
    paymentStatus: 'paid',
  },
  {
    id: 'ORD-2024-004',
    listingId: '1',
    farmerId: 'f1',
    farmerName: 'Ramesh Kumar',
    farmerPhone: '+91 98765 43210',
    farmerLocation: 'Tumkur, Karnataka',
    milletType: 'finger',
    quantity: 150,
    pricePerKg: 46,
    totalAmount: 6900,
    status: 'pending',
    orderDate: new Date('2024-01-23'),
    paymentStatus: 'pending',
  },
];

const statusConfig = {
  pending: { label: 'Pending', labelHi: 'लंबित', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  confirmed: { label: 'Confirmed', labelHi: 'पुष्टि', color: 'bg-sky-500/10 text-sky-600', icon: CheckCircle },
  shipped: { label: 'Shipped', labelHi: 'भेज दिया', color: 'bg-primary/10 text-primary', icon: Truck },
  delivered: { label: 'Delivered', labelHi: 'पहुंचाया', color: 'bg-accent/10 text-accent', icon: Package },
  cancelled: { label: 'Cancelled', labelHi: 'रद्द', color: 'bg-red-500/10 text-red-600', icon: AlertCircle },
};

export default function BuyerOrdersPage() {
  const [role, setRole] = useState('buyer');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  // Fetch orders from API
  const { data: apiOrders, isLoading } = useOrders('buyer');
  
  // Transform API orders to display format
  const transformedOrders: Order[] = (apiOrders || []).map((apiOrder) => ({
    id: apiOrder.id,
    listingId: apiOrder.listing_id || '',
    farmerId: apiOrder.farmer_id || '',
    farmerName: 'Farmer',
    farmerPhone: apiOrder.driver_phone || 'Contact via app',
    farmerLocation: apiOrder.pickup_address || 'India',
    milletType: 'finger', // API doesn't include crop type
    quantity: apiOrder.quantity_kg,
    pricePerKg: Math.round(apiOrder.price_per_qtl / 100),
    totalAmount: apiOrder.total_amount,
    status: apiOrder.status === 'completed' || apiOrder.status === 'delivered' 
      ? 'delivered' 
      : apiOrder.status === 'in_transit' 
        ? 'shipped' 
        : 'pending',
    orderDate: new Date(apiOrder.created_at),
    expectedDelivery: apiOrder.pickup_date ? new Date(apiOrder.pickup_date) : undefined,
    paymentStatus: 'paid' as const,
  }));

  // Use API data or fallback to mock
  const orders = transformedOrders.length > 0 ? transformedOrders : mockOrders;

  const uiText = {
    title: language === 'hi' ? 'मेरे ऑर्डर' : language === 'te' ? 'నా ఆర్డర్‌లు' : language === 'kn' ? 'ನನ್ನ ಆದೇಶಗಳು' : language === 'ta' ? 'எனது ஆர்டர்கள்' : language === 'mr' ? 'माझे ऑर्डर' : 'My Orders',
    subtitle: language === 'hi' ? 'अपने ऑर्डर ट्रैक करें और प्रबंधित करें' : language === 'te' ? 'మీ ఆర్డర్‌లను ట్రాక్ చేయండి మరియు నిర్వహించండి' : language === 'kn' ? 'ನಿಮ್ಮ ಆದೇಶಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ' : language === 'ta' ? 'உங்கள் ஆர்டர்களைக் கண்காணித்து நிர்வகிக்கவும்' : language === 'mr' ? 'तुमचे ऑर्डर ट्रॅक करा आणि व्यवस्थापित करा' : 'Track and manage your orders',
    searchPlaceholder: language === 'hi' ? 'ऑर्डर खोजें...' : language === 'te' ? 'ఆర్డర్‌లు శోధించండి...' : language === 'kn' ? 'ಆದೇಶಗಳನ್ನು ಹುಡುಕಿ...' : language === 'ta' ? 'ஆர்டர்களைத் தேடுங்கள்...' : language === 'mr' ? 'ऑर्डर शोधा...' : 'Search orders...',
    all: language === 'hi' ? 'सभी' : language === 'te' ? 'అన్నీ' : language === 'kn' ? 'ಎಲ್ಲಾ' : language === 'ta' ? 'அனைத்தும்' : language === 'mr' ? 'सर्व' : 'All',
    active: language === 'hi' ? 'सक्रिय' : language === 'te' ? 'యాక్టివ్' : language === 'kn' ? 'ಸಕ್ರಿಯ' : language === 'ta' ? 'செயலில்' : language === 'mr' ? 'सक्रिय' : 'Active',
    completed: language === 'hi' ? 'पूर्ण' : language === 'te' ? 'పూర్తయింది' : language === 'kn' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : language === 'ta' ? 'முடிந்தது' : language === 'mr' ? 'पूर्ण' : 'Completed',
    orderedOn: language === 'hi' ? 'ऑर्डर किया' : language === 'te' ? 'ఆర్డర్ చేసారు' : language === 'kn' ? 'ಆದೇಶಿಸಲಾಗಿದೆ' : language === 'ta' ? 'ஆர்டர் செய்யப்பட்டது' : language === 'mr' ? 'ऑर्डर केले' : 'Ordered on',
    expectedDelivery: language === 'hi' ? 'अपेक्षित डिलीवरी' : language === 'te' ? 'అంచనా డెలివరీ' : language === 'kn' ? 'ನಿರೀಕ್ಷಿತ ವಿತರಣೆ' : language === 'ta' ? 'எதிர்பார்க்கப்படும் டெலிவரி' : language === 'mr' ? 'अपेक्षित डिलिव्हरी' : 'Expected Delivery',
    trackOrder: language === 'hi' ? 'ऑर्डर ट्रैक करें' : language === 'te' ? 'ఆర్డర్ ట్రాక్ చేయండి' : language === 'kn' ? 'ಆದೇಶ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : language === 'ta' ? 'ஆர்டரைக் கண்காணிக்கவும்' : language === 'mr' ? 'ऑर्डर ट्रॅक करा' : 'Track Order',
    viewDetails: language === 'hi' ? 'विवरण देखें' : language === 'te' ? 'వివరాలు చూడండి' : language === 'kn' ? 'ವಿವರಗಳನ್ನು ನೋಡಿ' : language === 'ta' ? 'விவரங்களைக் காண்க' : language === 'mr' ? 'तपशील पहा' : 'View Details',
    contactFarmer: language === 'hi' ? 'किसान से संपर्क करें' : language === 'te' ? 'రైతును సంప్రదించండి' : language === 'kn' ? 'ರೈತರನ್ನು ಸಂಪರ್ಕಿಸಿ' : language === 'ta' ? 'விவசாயியை தொடர்பு கொள்ளுங்கள்' : language === 'mr' ? 'शेतकऱ्याशी संपर्क साधा' : 'Contact Farmer',
    reorder: language === 'hi' ? 'फिर से ऑर्डर करें' : language === 'te' ? 'మళ్ళీ ఆర్డర్ చేయండి' : language === 'kn' ? 'ಮತ್ತೆ ಆದೇಶಿಸಿ' : language === 'ta' ? 'மீண்டும் ஆர்டர் செய்யுங்கள்' : language === 'mr' ? 'पुन्हा ऑर्डर करा' : 'Reorder',
    rateOrder: language === 'hi' ? 'ऑर्डर रेट करें' : language === 'te' ? 'ఆర్డర్ రేట్ చేయండి' : language === 'kn' ? 'ಆದೇಶ ರೇಟ್ ಮಾಡಿ' : language === 'ta' ? 'ஆர்டரை மதிப்பிடுங்கள்' : language === 'mr' ? 'ऑर्डर रेट करा' : 'Rate Order',
    noOrders: language === 'hi' ? 'कोई ऑर्डर नहीं मिला' : language === 'te' ? 'ఆర్డర్‌లు కనుగొనబడలేదు' : language === 'kn' ? 'ಯಾವುದೇ ಆದೇಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : language === 'ta' ? 'ஆர்டர்கள் இல்லை' : language === 'mr' ? 'कोणतेही ऑर्डर सापडले नाहीत' : 'No orders found',
  };

  const speakPageContent = () => {
    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const content: Record<string, string> = {
      en: `You have ${orders.length} orders. ${activeOrders} are active and ${completedOrders} are completed.`,
      hi: `आपके पास ${orders.length} ऑर्डर हैं। ${activeOrders} सक्रिय हैं और ${completedOrders} पूर्ण हैं।`,
    };
    if (isSpeaking) stopSpeaking();
    else speak(content[language] || content.en);
  };

  const getMillet = (id: string) => milletTypes.find(m => m.id === id);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'active' && ['pending', 'confirmed', 'shipped'].includes(order.status)) ||
      (activeTab === 'completed' && order.status === 'delivered');
    return matchesSearch && matchesTab;
  });

  const stats = [
    { label: language === 'hi' ? 'कुल ऑर्डर' : 'Total Orders', value: orders.length, icon: Package },
    { label: language === 'hi' ? 'सक्रिय' : 'Active', value: orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length, icon: Truck },
    { label: language === 'hi' ? 'पूर्ण' : 'Completed', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle },
    { label: language === 'hi' ? 'कुल खर्च' : 'Total Spent', value: `₹${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}`, icon: IndianRupee },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading orders...</p>
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
              <h1 className="text-2xl sm:text-3xl font-heading font-bold">{uiText.title}</h1>
              <p className="text-muted-foreground mt-1">{uiText.subtitle}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={speakPageContent}>
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
          <Button asChild>
            <Link href="/marketplace">
              <Package className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'और खरीदें' : 'Browse More'}
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={uiText.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">{uiText.all}</TabsTrigger>
              <TabsTrigger value="active">{uiText.active}</TabsTrigger>
              <TabsTrigger value="completed">{uiText.completed}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, idx) => {
            const millet = getMillet(order.milletType);
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{order.id}</h3>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {language === 'hi' ? status.labelHi : status.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {uiText.orderedOn} {order.orderDate.toLocaleDateString()}
                        </span>
                        {order.expectedDelivery && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            {uiText.expectedDelivery}: {order.expectedDelivery.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                          <span className="text-2xl">🌾</span>
                        </div>
                        <div>
                          <p className="font-medium">{millet?.name || order.milletType}</p>
                          <p className="text-sm text-muted-foreground">{millet?.nameHi}</p>
                          <p className="text-sm">
                            {order.quantity} kg × ₹{order.pricePerKg}/kg
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{order.farmerName}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{order.farmerLocation}</span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">₹{order.totalAmount.toLocaleString()}</p>
                      <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'} className="mt-1">
                        {order.paymentStatus === 'paid' ? (language === 'hi' ? 'भुगतान हो गया' : 'Paid') : (language === 'hi' ? 'भुगतान लंबित' : 'Payment Pending')}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                    {order.status === 'shipped' && order.trackingId && (
                      <Button size="sm" variant="default">
                        <Truck className="w-4 h-4 mr-1" />
                        {uiText.trackOrder}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/buyer/orders/${order.id}`}>
                        {uiText.viewDetails}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Phone className="w-4 h-4 mr-1" />
                      {uiText.contactFarmer}
                    </Button>
                    {order.status === 'delivered' && (
                      <>
                        <Button size="sm" variant="ghost">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          {uiText.reorder}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Star className="w-4 h-4 mr-1" />
                          {uiText.rateOrder}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{uiText.noOrders}</p>
              <Button asChild className="mt-4">
                <Link href="/marketplace">{language === 'hi' ? 'खरीदारी शुरू करें' : 'Start Shopping'}</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
