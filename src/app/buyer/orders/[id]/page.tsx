"use client";

import React, { useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  IndianRupee,
  Star,
  Volume2,
  VolumeX,
  AlertCircle,
  FileText,
  Download,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { milletTypes } from '@/lib/design-tokens';
import { useLanguage } from '@/lib/hooks/useLanguage';

const mockOrder = {
  id: 'ORD-2024-001',
  listingId: '1',
  farmerId: 'f1',
  farmerName: 'Ramesh Kumar',
  farmerPhone: '+91 98765 43210',
  farmerLocation: 'Tumkur, Karnataka',
  farmerRating: 4.8,
  milletType: 'finger',
  variety: 'GPU-28',
  quantity: 200,
  pricePerKg: 45,
  totalAmount: 9000,
  platformFee: 180,
  deliveryFee: 200,
  grandTotal: 9380,
  status: 'shipped',
  orderDate: new Date('2024-01-20'),
  confirmedDate: new Date('2024-01-20'),
  shippedDate: new Date('2024-01-22'),
  expectedDelivery: new Date('2024-01-25'),
  trackingId: 'TRK123456789',
  paymentStatus: 'paid',
  paymentMethod: 'UPI',
  transactionId: 'UPI123456789',
  deliveryAddress: {
    name: 'Buyer Name',
    phone: '+91 98765 12345',
    address: '123, Main Street, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
  },
  qualityDetails: {
    grade: 'Premium',
    moisture: '12%',
    foreignMatter: '0.5%',
    organic: true,
  },
  timeline: [
    { status: 'Order Placed', date: new Date('2024-01-20T10:30:00'), completed: true },
    { status: 'Payment Confirmed', date: new Date('2024-01-20T10:35:00'), completed: true },
    { status: 'Order Confirmed by Farmer', date: new Date('2024-01-20T14:00:00'), completed: true },
    { status: 'Shipped', date: new Date('2024-01-22T09:00:00'), completed: true },
    { status: 'Out for Delivery', date: null, completed: false },
    { status: 'Delivered', date: null, completed: false },
  ],
};

const statusConfig = {
  pending: { label: 'Pending', labelHi: 'लंबित', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  confirmed: { label: 'Confirmed', labelHi: 'पुष्टि', color: 'bg-sky-500/10 text-sky-600', icon: CheckCircle },
  shipped: { label: 'Shipped', labelHi: 'भेज दिया', color: 'bg-primary/10 text-primary', icon: Truck },
  delivered: { label: 'Delivered', labelHi: 'पहुंचाया', color: 'bg-accent/10 text-accent', icon: Package },
  cancelled: { label: 'Cancelled', labelHi: 'रद्द', color: 'bg-red-500/10 text-red-600', icon: AlertCircle },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [role, setRole] = useState('buyer');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [copied, setCopied] = useState(false);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const order = mockOrder;
  const millet = milletTypes.find(m => m.id === order.milletType);
  const status = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  const uiText = {
    back: language === 'hi' ? 'वापस' : 'Back',
    orderDetails: language === 'hi' ? 'ऑर्डर विवरण' : 'Order Details',
    trackingId: language === 'hi' ? 'ट्रैकिंग आईडी' : 'Tracking ID',
    orderedOn: language === 'hi' ? 'ऑर्डर की तारीख' : 'Ordered on',
    expectedDelivery: language === 'hi' ? 'अपेक्षित डिलीवरी' : 'Expected Delivery',
    orderTimeline: language === 'hi' ? 'ऑर्डर टाइमलाइन' : 'Order Timeline',
    itemDetails: language === 'hi' ? 'आइटम विवरण' : 'Item Details',
    deliveryAddress: language === 'hi' ? 'डिलीवरी पता' : 'Delivery Address',
    farmerDetails: language === 'hi' ? 'किसान विवरण' : 'Farmer Details',
    paymentDetails: language === 'hi' ? 'भुगतान विवरण' : 'Payment Details',
    qualityDetails: language === 'hi' ? 'गुणवत्ता विवरण' : 'Quality Details',
    subtotal: language === 'hi' ? 'उप-योग' : 'Subtotal',
    platformFee: language === 'hi' ? 'प्लेटफॉर्म शुल्क' : 'Platform Fee',
    deliveryFee: language === 'hi' ? 'डिलीवरी शुल्क' : 'Delivery Fee',
    total: language === 'hi' ? 'कुल' : 'Total',
    paid: language === 'hi' ? 'भुगतान हो गया' : 'Paid',
    contactFarmer: language === 'hi' ? 'किसान से संपर्क करें' : 'Contact Farmer',
    trackShipment: language === 'hi' ? 'शिपमेंट ट्रैक करें' : 'Track Shipment',
    downloadInvoice: language === 'hi' ? 'इनवॉइस डाउनलोड करें' : 'Download Invoice',
    traceOrigin: language === 'hi' ? 'उत्पत्ति ट्रेस करें' : 'Trace Origin',
    rateOrder: language === 'hi' ? 'ऑर्डर रेट करें' : 'Rate Order',
    reorder: language === 'hi' ? 'फिर से ऑर्डर करें' : 'Reorder',
    needHelp: language === 'hi' ? 'मदद चाहिए?' : 'Need Help?',
    reportIssue: language === 'hi' ? 'समस्या रिपोर्ट करें' : 'Report Issue',
    organic: language === 'hi' ? 'जैविक' : 'Organic',
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(order.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {uiText.back}
            </Button>
            <div>
              <h1 className="text-xl font-bold">{order.id}</h1>
              <p className="text-sm text-muted-foreground">
                {uiText.orderedOn} {order.orderDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={`${status.color} text-sm px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {language === 'hi' ? status.labelHi : status.label}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Info */}
            {order.trackingId && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{uiText.trackingId}</p>
                    <p className="font-mono font-semibold">{order.trackingId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyTrackingId}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button size="sm">
                      <Truck className="w-4 h-4 mr-1" />
                      {uiText.trackShipment}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {uiText.expectedDelivery}: <span className="font-medium text-foreground">{order.expectedDelivery.toLocaleDateString()}</span>
                </p>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">{uiText.orderTimeline}</h2>
              <div className="relative">
                {order.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.completed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      {idx < order.timeline.length - 1 && (
                        <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full ${
                          item.completed ? 'bg-accent' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`font-medium ${item.completed ? '' : 'text-muted-foreground'}`}>
                        {item.status}
                      </p>
                      {item.date && (
                        <p className="text-sm text-muted-foreground">
                          {item.date.toLocaleDateString()} at {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">{uiText.itemDetails}</h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center">
                  <span className="text-4xl">🌾</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{millet?.name || order.milletType}</h3>
                  <p className="text-sm text-muted-foreground">{millet?.nameHi}</p>
                  <p className="text-sm text-muted-foreground">Variety: {order.variety}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{order.qualityDetails.grade}</Badge>
                    {order.qualityDetails.organic && (
                      <Badge className="bg-accent/10 text-accent">{uiText.organic}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.quantity} kg</p>
                  <p className="text-sm text-muted-foreground">₹{order.pricePerKg}/kg</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Moisture</p>
                  <p className="font-medium">{order.qualityDetails.moisture}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Foreign Matter</p>
                  <p className="font-medium">{order.qualityDetails.foreignMatter}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Grade</p>
                  <p className="font-medium">{order.qualityDetails.grade}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">{uiText.deliveryAddress}</h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{order.deliveryAddress.name}</p>
                  <p className="text-muted-foreground">{order.deliveryAddress.address}</p>
                  <p className="text-muted-foreground">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {order.deliveryAddress.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">{uiText.paymentDetails}</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{uiText.subtotal}</span>
                  <span>₹{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{uiText.platformFee}</span>
                  <span>₹{order.platformFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{uiText.deliveryFee}</span>
                  <span>₹{order.deliveryFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{uiText.total}</span>
                  <span className="text-primary">₹{order.grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">{uiText.paid}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.paymentMethod} • {order.transactionId}
                </p>
              </div>
            </div>

            {/* Farmer Info */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">{uiText.farmerDetails}</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">👨‍🌾</span>
                </div>
                <div>
                  <p className="font-medium">{order.farmerName}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span>{order.farmerRating}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 inline mr-1" />
                {order.farmerLocation}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${order.farmerPhone}`}>
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://wa.me/${order.farmerPhone.replace(/\s+/g, '')}`} target="_blank">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                {uiText.downloadInvoice}
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/trace/${order.listingId}`}>
                  <QrCode className="w-4 h-4 mr-2" />
                  {uiText.traceOrigin}
                </Link>
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-start text-destructive">
                <AlertCircle className="w-4 h-4 mr-2" />
                {uiText.reportIssue}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
