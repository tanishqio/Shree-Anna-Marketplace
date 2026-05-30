"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShoppingCart, CheckCircle, AlertCircle, CreditCard, ArrowRight } from 'lucide-react';
import { ordersApi, paymentsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { RazorpayCheckout } from './RazorpayCheckout';

interface Listing {
  id: string;
  millet_type: string;
  millet_name?: string;
  quantity: number;
  price_per_kg: number;
  farmer_name?: string;
  farmer_location?: string;
}

interface BuyNowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
  language?: string;
}

const translations = {
  en: {
    title: 'Buy Now',
    subtitle: 'Complete your purchase',
    quantity: 'Quantity (kg)',
    maxAvailable: 'Maximum available',
    shippingAddress: 'Shipping Address',
    shippingPlaceholder: 'Enter your delivery address',
    notes: 'Order Notes (Optional)',
    notesPlaceholder: 'Any special instructions',
    totalAmount: 'Total Amount',
    confirmPurchase: 'Proceed to Payment',
    processing: 'Processing...',
    success: 'Order Placed & Paid!',
    successMessage: 'Your order has been placed and payment confirmed.',
    viewOrder: 'View Order',
    continueShopping: 'Continue Shopping',
    error: 'Error',
    invalidQuantity: 'Please enter a valid quantity',
    loginRequired: 'Please login to make a purchase',
    paymentStep: 'Complete Payment',
    orderCreated: 'Order created! Complete payment below.',
    paymentSuccess: 'Payment Successful',
    paymentFailed: 'Payment Failed',
  },
  hi: {
    title: 'अभी खरीदें',
    subtitle: 'अपनी खरीदारी पूरी करें',
    quantity: 'मात्रा (किग्रा)',
    maxAvailable: 'अधिकतम उपलब्ध',
    shippingAddress: 'शिपिंग पता',
    shippingPlaceholder: 'अपना डिलीवरी पता दर्ज करें',
    notes: 'ऑर्डर नोट्स (वैकल्पिक)',
    notesPlaceholder: 'कोई विशेष निर्देश',
    totalAmount: 'कुल राशि',
    confirmPurchase: 'भुगतान करें',
    processing: 'प्रोसेसिंग...',
    success: 'ऑर्डर और भुगतान पूर्ण!',
    successMessage: 'आपका ऑर्डर और भुगतान सफल रहा।',
    viewOrder: 'ऑर्डर देखें',
    continueShopping: 'खरीदारी जारी रखें',
    error: 'त्रुटि',
    invalidQuantity: 'कृपया एक मान्य मात्रा दर्ज करें',
    loginRequired: 'खरीदारी करने के लिए कृपया लॉगिन करें',
    paymentStep: 'भुगतान करें',
    orderCreated: 'ऑर्डर बन गया! नीचे भुगतान करें।',
    paymentSuccess: 'भुगतान सफल',
    paymentFailed: 'भुगतान विफल',
  },
};

export function BuyNowModal({ open, onOpenChange, listing, language = 'en' }: BuyNowModalProps) {
  const router = useRouter();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [quantity, setQuantity] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'order' | 'payment' | 'success'>('order');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdOrderAmount, setCreatedOrderAmount] = useState<number>(0);

  const handleClose = () => {
    if (!isLoading) {
      setQuantity('');
      setShippingAddress('');
      setNotes('');
      setError(null);
      setStep('order');
      setCreatedOrderId(null);
      setCreatedOrderAmount(0);
      onOpenChange(false);
    }
  };

  const handleSubmit = async () => {
    if (!listing) return;
    
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0 || qty > listing.quantity) {
      setError(t.invalidQuantity);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await ordersApi.buyNow({
        listing_id: listing.id,
        qty_kg: qty,
        shipping_address: shippingAddress || undefined,
        notes: notes || undefined,
      });

      if (response.success) {
        setCreatedOrderId(response.order.id);
        setCreatedOrderAmount(response.order.total_amount);
        setStep('payment'); // Move to payment step
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (err: any) {
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        setError(t.loginRequired);
      } else {
        setError(err?.message || 'Failed to create order. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setStep('success');
  };

  const handlePaymentFailure = (errorMsg: string) => {
    setError(errorMsg);
  };

  const totalAmount = listing ? (parseFloat(quantity) || 0) * listing.price_per_kg : 0;

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'order' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                {t.title}
              </DialogTitle>
              <DialogDescription>
                {t.subtitle} - {listing.millet_name || listing.millet_type}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Listing Summary */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{listing.millet_name || listing.millet_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing.farmer_name} • {listing.farmer_location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{listing.price_per_kg}/kg</p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">{t.quantity}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={listing.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`1 - ${listing.quantity}`}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  {t.maxAvailable}: {listing.quantity} kg
                </p>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <Label htmlFor="address">{t.shippingAddress}</Label>
                <Textarea
                  id="address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={t.shippingPlaceholder}
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={2}
                />
              </div>

              {/* Total */}
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t.totalAmount}</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || !quantity} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    {t.confirmPurchase}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'payment' && createdOrderId && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {t.paymentStep}
              </DialogTitle>
              <DialogDescription>
                {t.orderCreated}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <RazorpayCheckout
                orderId={createdOrderId}
                amount={createdOrderAmount}
                cropName={listing.millet_name || listing.millet_type}
                sellerName={listing.farmer_name}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={() => setStep('order')}
              />
              
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg mt-4">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                {t.success}
              </DialogTitle>
              <DialogDescription>
                {t.successMessage}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium">Order #{createdOrderId?.slice(0, 8)}</p>
              <p className="text-muted-foreground">
                {quantity} kg × ₹{listing.price_per_kg} = ₹{createdOrderAmount.toFixed(2)}
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                {t.continueShopping}
              </Button>
              <Button
                onClick={() => {
                  handleClose();
                  router.push(`/buyer/orders/${createdOrderId}`);
                }}
                className="w-full sm:w-auto"
              >
                {t.viewOrder}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
