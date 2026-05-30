"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Calendar,
  IndianRupee,
  ChevronRight,
  ArrowLeft,
  Navigation as NavigationIcon,
  User,
  Building,
  Star,
  FileText,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useOrders } from '@/lib/hooks/useData';
import { ordersApi, Order as ApiOrder } from '@/lib/api';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface DisplayOrder {
  id: string;
  milletType: string;
  milletName: string;
  milletNameHi: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  buyerName: string;
  buyerCompany: string;
  buyerPhone: string;
  buyerRating: number;
  status: 'pending_pickup' | 'in_transit' | 'delivered' | 'completed';
  pickupDate: Date;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: Date;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedArrival?: Date;
  timeline: {
    event: string;
    timestamp: Date;
    completed: boolean;
  }[];
}

// Transform API order to display format
const transformOrder = (order: ApiOrder): DisplayOrder => ({
  id: order.id,
  milletType: 'finger',
  milletName: 'Finger Millet (Ragi)',
  milletNameHi: 'रागी',
  quantity: order.quantity_kg,
  pricePerKg: order.price_per_qtl / 100,
  totalAmount: order.total_amount,
  buyerName: 'Buyer',
  buyerCompany: 'Company',
  buyerPhone: '+91 XXXXXXXXXX',
  buyerRating: 4.5,
  status: order.status as DisplayOrder['status'],
  pickupDate: new Date(order.pickup_date || Date.now()),
  pickupAddress: order.pickup_address || 'Pickup location',
  deliveryAddress: order.delivery_address || 'Delivery location',
  createdAt: new Date(order.created_at),
  vehicleNumber: order.vehicle_number,
  driverName: order.driver_name,
  driverPhone: order.driver_phone,
  estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000),
  timeline: [
    { event: 'Order Confirmed', timestamp: new Date(order.created_at), completed: true },
    { event: 'Pickup Scheduled', timestamp: new Date(order.created_at), completed: order.status !== 'pending_pickup' },
    { event: 'Picked Up', timestamp: new Date(order.pickup_date || Date.now()), completed: ['in_transit', 'delivered', 'completed'].includes(order.status) },
    { event: 'In Transit', timestamp: new Date(Date.now()), completed: ['delivered', 'completed'].includes(order.status) },
    { event: 'Delivered', timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000), completed: ['delivered', 'completed'].includes(order.status) },
    { event: 'Payment Released', timestamp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), completed: order.status === 'completed' },
  ],
});

const statusConfig = {
  pending_pickup: {
    label: 'Pickup Pending',
    labelHi: 'पिकअप लंबित',
    color: 'bg-primary/10 text-primary',
    icon: Clock,
  },
  in_transit: {
    label: 'In Transit',
    labelHi: 'रास्ते में',
    color: 'bg-sky-500/10 text-sky-600',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    labelHi: 'पहुंचा दिया',
    color: 'bg-accent/10 text-accent',
    icon: CheckCircle,
  },
  completed: {
    label: 'Completed',
    labelHi: 'पूर्ण',
    color: 'bg-accent/10 text-accent',
    icon: CheckCircle,
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const [role, setRole] = useState('farmer');
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Language and TTS support
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();
  
  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: 'My Orders page. View and track your active orders, check delivery status, and see completed transactions. Contact buyers directly and track payments.',
      hi: 'मेरे ऑर्डर पेज। अपने सक्रिय ऑर्डर देखें और ट्रैक करें, डिलीवरी स्थिति जांचें और पूर्ण लेनदेन देखें। खरीदारों से सीधे संपर्क करें और भुगतान ट्रैक करें।',
      kn: 'ನನ್ನ ಆದೇಶಗಳ ಪುಟ. ನಿಮ್ಮ ಸಕ್ರಿಯ ಆದೇಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ವಿತರಣಾ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಪೂರ್ಣಗೊಂಡ ವಹಿವಾಟುಗಳನ್ನು ನೋಡಿ. ಖರೀದಿದಾರರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಪಾವತಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
      te: 'నా ఆర్డర్లు పేజీ. మీ యాక్టివ్ ఆర్డర్లను వీక్షించండి మరియు ట్రాక్ చేయండి, డెలివరీ స్థితిని తనిఖీ చేయండి మరియు పూర్తయిన లావాదేవీలను చూడండి. కొనుగోలుదారులను నేరుగా సంప్రదించండి మరియు చెల్లింపులను ట్రాక్ చేయండి.',
      ta: 'எனது ஆர்டர்கள் பக்கம். உங்கள் செயலில் உள்ள ஆர்டர்களைப் பார்க்கவும் கண்காணிக்கவும், விநியோக நிலையைச் சரிபார்க்கவும் மற்றும் நிறைவடைந்த பரிவர்த்தனைகளைப் பார்க்கவும். கொள்முதலாளர்களை நேரடியாகத் தொடர்பு கொள்ளவும் மற்றும் கட்டணங்களைக் கண்காணிக்கவும்.',
      mr: 'माझे ऑर्डर पेज। तुमचे सक्रिय ऑर्डर पहा आणि ट्रॅक करा, डिलिव्हरी स्थिती तपासा आणि पूर्ण झालेले व्यवहार पहा। खरेदीदारांशी थेट संपर्क साधा आणि पेमेंट ट्रॅक करा.',
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  // Fetch orders from API
  const { data: apiOrders, isLoading, error, refetch } = useOrders('farmer');

  // Use API orders
  const orders = useMemo(() => {
    if (apiOrders && apiOrders.length > 0) {
      return apiOrders.map(transformOrder);
    }
    return [];
  }, [apiOrders]);

  const activeOrders = orders.filter(o => o.status !== 'completed');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const handleMarkDelivered = async (orderId: string) => {
    setIsUpdating(true);
    try {
      await ordersApi.markDelivered(orderId);
      await refetch();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to mark as delivered:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
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

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="text-sm">Using demo data - API temporarily unavailable</p>
          </div>
        )}

        {selectedOrder ? (
          // Order Details View
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Orders
            </button>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Order Header */}
              <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <h1 className="text-xl font-heading font-bold">{selectedOrder.id}</h1>
                  </div>
                  <Badge className={statusConfig[selectedOrder.status].color}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <span className="text-2xl">🌾</span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedOrder.milletName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.milletNameHi}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-accent">
                      ₹{selectedOrder.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.quantity} kg × ₹{selectedOrder.pricePerKg}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Tracking (for in_transit) */}
              {selectedOrder.status === 'in_transit' && (
                <div className="p-6 bg-sky-500/5 border-b border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold">In Transit</p>
                      <p className="text-sm text-muted-foreground">
                        ETA: {selectedOrder.estimatedArrival?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      <NavigationIcon className="w-4 h-4 mr-2" />
                      Track Live
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-white/50">
                      <p className="text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{selectedOrder.vehicleNumber}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/50">
                      <p className="text-muted-foreground">Driver</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{selectedOrder.driverName}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-6">
                <h3 className="font-heading font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {selectedOrder.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.completed 
                            ? 'bg-accent text-white' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {event.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        {idx < selectedOrder.timeline.length - 1 && (
                          <div className={`w-0.5 flex-1 my-1 ${
                            event.completed ? 'bg-accent' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className={`font-medium ${event.completed ? '' : 'text-muted-foreground'}`}>
                          {event.event}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.completed 
                            ? event.timestamp.toLocaleString('en-IN', { 
                                dateStyle: 'medium', 
                                timeStyle: 'short' 
                              })
                            : 'Pending'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Details */}
              <div className="p-6 border-t border-border">
                <h3 className="font-heading font-semibold mb-4">Buyer Details</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{selectedOrder.buyerCompany}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.buyerName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-sm font-medium">{selectedOrder.buyerRating}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => window.location.href = `tel:${selectedOrder.buyerPhone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>

              {/* Addresses */}
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                    <p className="font-medium">{selectedOrder.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Location</p>
                    <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-border bg-muted/30">
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  {selectedOrder.status !== 'completed' && (
                    <Button className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Get Help
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Orders List View
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold">
                  My Orders 📦
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={speakPageContent}
                  className="touch-target"
                  aria-label={isSpeaking ? 'Stop speaking' : 'Read page content aloud'}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-5 h-5 text-destructive" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground mt-1">
                Track your sales and deliveries
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="gap-2">
                  <Truck className="w-4 h-4" />
                  Active ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Completed ({completedOrders.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {(activeTab === 'active' ? activeOrders : completedOrders).map((order, idx) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-card rounded-2xl border border-border p-4 sm:p-6 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-2xl">🌾</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold truncate">{order.milletName}</p>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.quantity} kg • {order.buyerCompany}
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge className={statusConfig[order.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[order.status].label}
                            </Badge>
                            <span className="text-lg font-bold text-accent">
                              ₹{order.totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {order.status === 'in_transit' && order.estimatedArrival && (
                        <div className="mt-4 p-3 rounded-lg bg-sky-500/10 flex items-center gap-3">
                          <Truck className="w-5 h-5 text-sky-600" />
                          <span className="text-sm">
                            Arriving by {order.estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <Button variant="ghost" size="sm" className="ml-auto h-7">
                            Track
                          </Button>
                        </div>
                      )}

                      {order.status === 'pending_pickup' && (
                        <div className="mt-4 p-3 rounded-lg bg-primary/10 flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="text-sm">
                            Pickup on {order.pickupDate.toLocaleDateString('en-IN', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {(activeTab === 'active' ? activeOrders : completedOrders).length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading font-semibold text-lg mb-2">
                      No {activeTab} orders
                    </h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'active' 
                        ? 'Your active orders will appear here'
                        : 'Your completed orders will appear here'
                      }
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}
