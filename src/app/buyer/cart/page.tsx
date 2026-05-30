"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Truck,
  Shield,
  Clock,
  Star,
  MapPin,
  Volume2,
  VolumeX,
  AlertCircle,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { milletTypes } from '@/lib/design-tokens';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface CartItem {
  id: string;
  listingId: string;
  milletType: string;
  variety: string;
  quantity: number;
  pricePerKg: number;
  minOrder: number;
  maxAvailable: number;
  farmerName: string;
  farmerLocation: string;
  farmerRating: number;
  qualityGrade: string;
  isOrganic: boolean;
  selected: boolean;
}

const mockCartItems: CartItem[] = [
  {
    id: '1',
    listingId: '101',
    milletType: 'finger',
    variety: 'GPU-28',
    quantity: 50,
    pricePerKg: 45,
    minOrder: 10,
    maxAvailable: 500,
    farmerName: 'Ramesh Kumar',
    farmerLocation: 'Tumkur, Karnataka',
    farmerRating: 4.8,
    qualityGrade: 'Premium',
    isOrganic: true,
    selected: true,
  },
  {
    id: '2',
    listingId: '102',
    milletType: 'pearl',
    variety: 'HHB-67',
    quantity: 100,
    pricePerKg: 38,
    minOrder: 20,
    maxAvailable: 300,
    farmerName: 'Suresh Patil',
    farmerLocation: 'Dharwad, Karnataka',
    farmerRating: 4.6,
    qualityGrade: 'Standard',
    isOrganic: false,
    selected: true,
  },
  {
    id: '3',
    listingId: '103',
    milletType: 'foxtail',
    variety: 'SIA-326',
    quantity: 25,
    pricePerKg: 55,
    minOrder: 5,
    maxAvailable: 200,
    farmerName: 'Lakshmi Devi',
    farmerLocation: 'Anantapur, AP',
    farmerRating: 4.9,
    qualityGrade: 'Premium',
    isOrganic: true,
    selected: false,
  },
];

export default function CartPage() {
  const router = useRouter();
  const [role, setRole] = useState('buyer');
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const uiText = {
    back: language === 'hi' ? 'वापस' : language === 'kn' ? 'ಹಿಂದೆ' : language === 'te' ? 'వెనుకకు' : language === 'ta' ? 'பின்' : language === 'mr' ? 'मागे' : 'Back',
    cart: language === 'hi' ? 'कार्ट' : language === 'kn' ? 'ಕಾರ್ಟ್' : language === 'te' ? 'కార్ట్' : language === 'ta' ? 'கார்ட்' : language === 'mr' ? 'कार्ट' : 'Cart',
    items: language === 'hi' ? 'आइटम' : language === 'kn' ? 'ಐಟಂಗಳು' : language === 'te' ? 'వస్తువులు' : language === 'ta' ? 'பொருட்கள்' : language === 'mr' ? 'वस्तू' : 'items',
    selectAll: language === 'hi' ? 'सभी चुनें' : language === 'kn' ? 'ಎಲ್ಲಾ ಆಯ್ಕೆಮಾಡಿ' : language === 'te' ? 'అన్ని ఎంచుకోండి' : language === 'ta' ? 'அனைத்தையும் தேர்ந்தெடு' : language === 'mr' ? 'सर्व निवडा' : 'Select All',
    removeSelected: language === 'hi' ? 'चुने हुए हटाएं' : language === 'kn' ? 'ಆಯ್ಕೆಮಾಡಿದ ತೆಗೆದುಹಾಕಿ' : language === 'te' ? 'ఎంచుకున్నవి తొలగించు' : language === 'ta' ? 'தேர்ந்தெடுத்ததை நீக்கு' : language === 'mr' ? 'निवडलेले काढा' : 'Remove Selected',
    organic: language === 'hi' ? 'जैविक' : language === 'kn' ? 'ಸಾವಯವ' : language === 'te' ? 'సేంద్రీయ' : language === 'ta' ? 'இயற்கை' : language === 'mr' ? 'सेंद्रिय' : 'Organic',
    emptyCart: language === 'hi' ? 'आपकी कार्ट खाली है' : language === 'kn' ? 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿ ಇದೆ' : language === 'te' ? 'మీ కార్ట్ ఖాళీగా ఉంది' : language === 'ta' ? 'உங்கள் கார்ட் காலியாக உள்ளது' : language === 'mr' ? 'तुमची कार्ट रिकामी आहे' : 'Your cart is empty',
    browseMarketplace: language === 'hi' ? 'मार्केटप्लेस ब्राउज़ करें' : language === 'kn' ? 'ಮಾರುಕಟ್ಟೆ ಬ್ರೌಸ್ ಮಾಡಿ' : language === 'te' ? 'మార్కెట్‌ప్లేస్ బ్రౌజ్ చేయండి' : language === 'ta' ? 'சந்தையை உலாவுங்கள்' : language === 'mr' ? 'मार्केटप्लेस ब्राउझ करा' : 'Browse Marketplace',
    orderSummary: language === 'hi' ? 'ऑर्डर सारांश' : language === 'kn' ? 'ಆರ್ಡರ್ ಸಾರಾಂಶ' : language === 'te' ? 'ఆర్డర్ సారాంశం' : language === 'ta' ? 'ஆர்டர் சுருக்கம்' : language === 'mr' ? 'ऑर्डर सारांश' : 'Order Summary',
    subtotal: language === 'hi' ? 'उप-योग' : language === 'kn' ? 'ಉಪ-ಮೊತ್ತ' : language === 'te' ? 'ఉప-మొత్తం' : language === 'ta' ? 'துணை-மொத்தம்' : language === 'mr' ? 'उप-एकूण' : 'Subtotal',
    platformFee: language === 'hi' ? 'प्लेटफॉर्म शुल्क' : language === 'kn' ? 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕ' : language === 'te' ? 'ప్లాట్‌ఫారమ్ ఫీజు' : language === 'ta' ? 'தளம் கட்டணம்' : language === 'mr' ? 'प्लॅटफॉर्म शुल्क' : 'Platform Fee',
    deliveryFee: language === 'hi' ? 'डिलीवरी शुल्क' : language === 'kn' ? 'ಡೆಲಿವರಿ ಶುಲ್ಕ' : language === 'te' ? 'డెలివరీ ఫీజు' : language === 'ta' ? 'டெலிவரி கட்டணம்' : language === 'mr' ? 'डिलिव्हरी शुल्क' : 'Delivery Fee',
    total: language === 'hi' ? 'कुल' : language === 'kn' ? 'ಒಟ್ಟು' : language === 'te' ? 'మొత్తం' : language === 'ta' ? 'மொத்தம்' : language === 'mr' ? 'एकूण' : 'Total',
    applyCoupon: language === 'hi' ? 'कूपन लगाएं' : language === 'kn' ? 'ಕೂಪನ್ ಅನ್ವಯಿಸಿ' : language === 'te' ? 'కూపన్ వర్తించు' : language === 'ta' ? 'கூப்பன் பயன்படுத்து' : language === 'mr' ? 'कूपन लागू करा' : 'Apply Coupon',
    proceedToCheckout: language === 'hi' ? 'चेकआउट के लिए आगे बढ़ें' : language === 'kn' ? 'ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ' : language === 'te' ? 'చెక్అవుట్‌కి కొనసాగండి' : language === 'ta' ? 'செக்அவுட்டிற்கு தொடரவும்' : language === 'mr' ? 'चेकआउटला पुढे जा' : 'Proceed to Checkout',
    couponApplied: language === 'hi' ? 'कूपन लागू' : language === 'kn' ? 'ಕೂಪನ್ ಅನ್ವಯಿಸಲಾಗಿದೆ' : language === 'te' ? 'కూపన్ వర్తించబడింది' : language === 'ta' ? 'கூப்பன் பயன்படுத்தப்பட்டது' : language === 'mr' ? 'कूपन लागू' : 'Coupon Applied',
    freeDelivery: language === 'hi' ? 'मुफ्त डिलीवरी' : language === 'kn' ? 'ಉಚಿತ ಡೆಲಿವರಿ' : language === 'te' ? 'ఉచిత డెలివరీ' : language === 'ta' ? 'இலவச டெலிவரி' : language === 'mr' ? 'मोफत डिलिव्हरी' : 'Free Delivery',
    securePayment: language === 'hi' ? 'सुरक्षित भुगतान' : language === 'kn' ? 'ಸುರಕ್ಷಿತ ಪಾವತಿ' : language === 'te' ? 'సురక్షిత చెల్లింపు' : language === 'ta' ? 'பாதுகாப்பான கட்டணம்' : language === 'mr' ? 'सुरक्षित पेमेंट' : 'Secure Payment',
    qualityAssured: language === 'hi' ? 'गुणवत्ता सुनिश्चित' : language === 'kn' ? 'ಗುಣಮಟ್ಟ ಖಾತ್ರಿ' : language === 'te' ? 'నాణ్యత హామీ' : language === 'ta' ? 'தரம் உறுதி' : language === 'mr' ? 'गुणवत्ता खात्री' : 'Quality Assured',
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.quantity * item.pricePerKg), 0);
  const platformFee = Math.round(subtotal * 0.02);
  const deliveryFee = subtotal > 5000 ? 0 : 200;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + platformFee + deliveryFee - discount;

  const getMillet = (type: string) => milletTypes.find(m => m.id === type);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(item.minOrder, Math.min(item.maxAvailable, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const toggleSelect = (id: string) => {
    setCartItems(items =>
      items.map(item => item.id === id ? { ...item, selected: !item.selected } : item)
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(items => items.map(item => ({ ...item, selected: !allSelected })));
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const removeSelected = () => {
    setCartItems(items => items.filter(item => !item.selected));
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'millet10') {
      setCouponApplied(true);
    }
  };

  const speakCart = () => {
    const text = language === 'hi'
      ? `आपकी कार्ट में ${cartItems.length} आइटम हैं। कुल राशि ${total} रुपये है।`
      : `Your cart has ${cartItems.length} items. Total amount is ${total} rupees.`;
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
            <div>
              <h1 className="text-2xl font-bold">{uiText.cart}</h1>
              <p className="text-muted-foreground">{cartItems.length} {uiText.items}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={isSpeaking ? stopSpeaking : speakCart}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{uiText.emptyCart}</h2>
            <p className="text-muted-foreground mb-6">
              {language === 'hi' ? 'अभी खरीदारी शुरू करें' : 'Start shopping now'}
            </p>
            <Button asChild>
              <Link href="/marketplace">{uiText.browseMarketplace}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <div className="flex items-center justify-between bg-card rounded-xl border p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={cartItems.every(item => item.selected)}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span>{uiText.selectAll}</span>
                </label>
                {selectedItems.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={removeSelected}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    {uiText.removeSelected}
                  </Button>
                )}
              </div>

              {/* Items */}
              {cartItems.map((item) => {
                const millet = getMillet(item.milletType);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-card rounded-2xl border border-border p-4"
                  >
                    <div className="flex gap-4">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleSelect(item.id)}
                        className="mt-1"
                      />
                      <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">🌾</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{millet?.name || item.milletType}</h3>
                            <p className="text-sm text-muted-foreground">{millet?.nameHi} • {item.variety}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{item.qualityGrade}</Badge>
                          {item.isOrganic && (
                            <Badge className="bg-accent/10 text-accent text-xs">{uiText.organic}</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.farmerName}, {item.farmerLocation}</span>
                          <span className="ml-2">⭐ {item.farmerRating}</span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, -10)}
                              disabled={item.quantity <= item.minOrder}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <div className="w-20 text-center">
                              <span className="font-semibold">{item.quantity}</span>
                              <span className="text-sm text-muted-foreground"> kg</span>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, 10)}
                              disabled={item.quantity >= item.maxAvailable}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">₹{(item.quantity * item.pricePerKg).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">₹{item.pricePerKg}/kg</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit space-y-4">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">{uiText.orderSummary}</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{uiText.subtotal} ({selectedItems.length} {uiText.items})</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{uiText.platformFee} (2%)</span>
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
                  {couponApplied && (
                    <div className="flex justify-between text-sm text-accent">
                      <span>Discount (10%)</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{uiText.total}</span>
                    <span className="text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyCoupon}
                      disabled={!couponCode || couponApplied}
                    >
                      {couponApplied ? <CheckCircle className="w-4 h-4 text-accent" /> : uiText.applyCoupon}
                    </Button>
                  </div>
                  {couponApplied && (
                    <p className="text-xs text-accent mt-2 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {uiText.couponApplied}: MILLET10
                    </p>
                  )}
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  disabled={selectedItems.length === 0}
                  asChild
                >
                  <Link href="/buyer/checkout">
                    {uiText.proceedToCheckout}
                  </Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-card rounded-xl border p-3 text-center">
                  <Truck className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs">{uiText.freeDelivery}</p>
                </div>
                <div className="bg-card rounded-xl border p-3 text-center">
                  <Shield className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs">{uiText.securePayment}</p>
                </div>
                <div className="bg-card rounded-xl border p-3 text-center">
                  <CheckCircle className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs">{uiText.qualityAssured}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
