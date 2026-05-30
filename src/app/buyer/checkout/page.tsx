"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  CheckCircle,
  ChevronRight,
  Plus,
  Edit2,
  Shield,
  Truck,
  Clock,
  Volume2,
  VolumeX,
  Lock,
  Gift,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { milletTypes } from '@/lib/design-tokens';
import { useLanguage } from '@/lib/hooks/useLanguage';

const mockAddresses = [
  {
    id: '1',
    name: 'Home',
    recipient: 'John Doe',
    phone: '+91 98765 43210',
    address: '123, Main Street, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Office',
    recipient: 'John Doe',
    phone: '+91 98765 43211',
    address: '456, Business Park, Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    isDefault: false,
  },
];

const mockCartItems = [
  {
    id: '1',
    milletType: 'finger',
    variety: 'GPU-28',
    quantity: 50,
    pricePerKg: 45,
    farmerName: 'Ramesh Kumar',
    isOrganic: true,
  },
  {
    id: '2',
    milletType: 'pearl',
    variety: 'HHB-67',
    quantity: 100,
    pricePerKg: 38,
    farmerName: 'Suresh Patil',
    isOrganic: false,
  },
];

const paymentMethods = [
  { id: 'upi', name: 'UPI', nameHi: 'यूपीआई', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', name: 'Credit/Debit Card', nameHi: 'क्रेडिट/डेबिट कार्ड', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', name: 'Net Banking', nameHi: 'नेट बैंकिंग', icon: Building2, description: 'All major banks' },
  { id: 'wallet', name: 'Wallet', nameHi: 'वॉलेट', icon: Wallet, description: 'Paytm, Amazon Pay' },
  { id: 'cod', name: 'Cash on Delivery', nameHi: 'डिलीवरी पर भुगतान', icon: CreditCard, description: '+₹50 handling fee' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [role, setRole] = useState('buyer');
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0].id);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const uiText = {
    back: language === 'hi' ? 'वापस' : language === 'kn' ? 'ಹಿಂದೆ' : language === 'te' ? 'వెనుకకు' : language === 'ta' ? 'பின்' : language === 'mr' ? 'मागे' : 'Back',
    checkout: language === 'hi' ? 'चेकआउट' : language === 'kn' ? 'ಚೆಕ್‌ಔಟ್' : language === 'te' ? 'చెక్అవుట్' : language === 'ta' ? 'செக்அவுட்' : language === 'mr' ? 'चेकआउट' : 'Checkout',
    deliveryAddress: language === 'hi' ? 'डिलीवरी पता' : language === 'kn' ? 'ಡೆಲಿವರಿ ವಿಳಾಸ' : language === 'te' ? 'డెలివరీ అడ్రస్' : language === 'ta' ? 'டெலிவரி முகவரி' : language === 'mr' ? 'डिलिव्हरी पत्ता' : 'Delivery Address',
    addAddress: language === 'hi' ? 'पता जोड़ें' : language === 'kn' ? 'ವಿಳಾಸ ಸೇರಿಸಿ' : language === 'te' ? 'అడ్రస్ జోడించు' : language === 'ta' ? 'முகவரி சேர்' : language === 'mr' ? 'पत्ता जोडा' : 'Add Address',
    paymentMethod: language === 'hi' ? 'भुगतान विधि' : language === 'kn' ? 'ಪಾವತಿ ವಿಧಾನ' : language === 'te' ? 'చెల్లింపు పద్ధతి' : language === 'ta' ? 'கட்டண முறை' : language === 'mr' ? 'पेमेंट पद्धत' : 'Payment Method',
    orderSummary: language === 'hi' ? 'ऑर्डर सारांश' : language === 'kn' ? 'ಆರ್ಡರ್ ಸಾರಾಂಶ' : language === 'te' ? 'ఆర్డర్ సారాంశం' : language === 'ta' ? 'ஆர்டர் சுருக்கம்' : language === 'mr' ? 'ऑर्डर सारांश' : 'Order Summary',
    subtotal: language === 'hi' ? 'उप-योग' : language === 'kn' ? 'ಉಪ-ಮೊತ್ತ' : language === 'te' ? 'ఉప-మొత్తం' : language === 'ta' ? 'துணை-மொத்தம்' : language === 'mr' ? 'उप-एकूण' : 'Subtotal',
    platformFee: language === 'hi' ? 'प्लेटफॉर्म शुल्क' : 'Platform Fee',
    deliveryFee: language === 'hi' ? 'डिलीवरी शुल्क' : 'Delivery Fee',
    total: language === 'hi' ? 'कुल' : language === 'kn' ? 'ಒಟ್ಟು' : language === 'te' ? 'మొత్తం' : language === 'ta' ? 'மொத்தம்' : language === 'mr' ? 'एकूण' : 'Total',
    placeOrder: language === 'hi' ? 'ऑर्डर करें' : language === 'kn' ? 'ಆರ್ಡರ್ ಮಾಡಿ' : language === 'te' ? 'ఆర్డర్ చేయండి' : language === 'ta' ? 'ஆர்டர் செய்' : language === 'mr' ? 'ऑर्डर करा' : 'Place Order',
    processing: language === 'hi' ? 'प्रोसेसिंग...' : 'Processing...',
    securePayment: language === 'hi' ? 'सुरक्षित भुगतान' : 'Secure Payment',
    freeDelivery: language === 'hi' ? 'मुफ्त डिलीवरी' : 'Free Delivery',
    estimatedDelivery: language === 'hi' ? 'अनुमानित डिलीवरी' : 'Estimated Delivery',
    default: language === 'hi' ? 'डिफ़ॉल्ट' : 'Default',
    enterUpi: language === 'hi' ? 'यूपीआई आईडी दर्ज करें' : 'Enter UPI ID',
    organic: language === 'hi' ? 'जैविक' : 'Organic',
  };

  const subtotal = mockCartItems.reduce((sum, item) => sum + (item.quantity * item.pricePerKg), 0);
  const platformFee = Math.round(subtotal * 0.02);
  const deliveryFee = subtotal > 5000 ? 0 : 200;
  const codFee = paymentMethod === 'cod' ? 50 : 0;
  const total = subtotal + platformFee + deliveryFee + codFee;

  const getMillet = (type: string) => milletTypes.find(m => m.id === type);
  const selectedAddressData = mockAddresses.find(a => a.id === selectedAddress);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push('/buyer/orders/ORD-2024-001?success=true');
  };

  const speakCheckout = () => {
    const text = language === 'hi'
      ? `चेकआउट पेज। कुल राशि ${total} रुपये है। भुगतान विधि चुनें और ऑर्डर करें।`
      : `Checkout page. Total amount is ${total} rupees. Select payment method and place order.`;
    speak(text);
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
            <h1 className="text-2xl font-bold">{uiText.checkout}</h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={isSpeaking ? stopSpeaking : speakCheckout}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {uiText.deliveryAddress}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setShowAddAddress(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  {uiText.addAddress}
                </Button>
              </div>

              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                <div className="space-y-3">
                  {mockAddresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedAddress === address.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={address.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{address.name}</span>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">{uiText.default}</Badge>
                          )}
                        </div>
                        <p className="text-sm">{address.recipient}</p>
                        <p className="text-sm text-muted-foreground">{address.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                {uiText.paymentMethod}
              </h2>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={method.id} />
                        <Icon className="w-6 h-6 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {language === 'hi' ? method.nameHi : method.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </label>
                    );
                  })}
                </div>
              </RadioGroup>

              {paymentMethod === 'upi' && (
                <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                  <Label htmlFor="upi">{uiText.enterUpi}</Label>
                  <Input
                    id="upi"
                    placeholder="name@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">{uiText.orderSummary}</h2>
              <div className="space-y-4">
                {mockCartItems.map((item) => {
                  const millet = getMillet(item.milletType);
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                        <span className="text-2xl">🌾</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{millet?.name || item.milletType}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.variety} • {item.farmerName}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {item.isOrganic && (
                            <Badge className="bg-accent/10 text-accent text-xs">{uiText.organic}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.quantity * item.pricePerKg).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} kg × ₹{item.pricePerKg}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">{uiText.orderSummary}</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{uiText.subtotal}</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{uiText.platformFee}</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{uiText.deliveryFee}</span>
                  {deliveryFee === 0 ? (
                    <span className="text-accent">{uiText.freeDelivery}</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">COD Fee</span>
                    <span>₹{codFee}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{uiText.total}</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{uiText.estimatedDelivery}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddress || !paymentMethod}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isProcessing ? uiText.processing : `${uiText.placeOrder} • ₹${total.toLocaleString()}`}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>{uiText.securePayment}</span>
              </div>
            </div>

            {/* Delivery Address Preview */}
            {selectedAddressData && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-sm text-muted-foreground mb-2">{uiText.deliveryAddress}</p>
                <p className="font-medium">{selectedAddressData.recipient}</p>
                <p className="text-sm text-muted-foreground">{selectedAddressData.address}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAddressData.city}, {selectedAddressData.state} - {selectedAddressData.pincode}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
