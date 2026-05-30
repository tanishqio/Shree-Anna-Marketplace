'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Shield, IndianRupee } from 'lucide-react';
import { paymentsApi } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayCheckoutProps {
  orderId: string;
  amount: number;
  cropName: string;
  sellerName?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  onCancel?: () => void;
}

export function RazorpayCheckout({
  orderId,
  amount,
  cropName,
  sellerName,
  buyerName,
  buyerEmail,
  buyerPhone,
  onSuccess,
  onFailure,
  onCancel,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Handle mock payment (for development)
  const handleMockPayment = async (razorpayOrderId: string) => {
    setStatus('processing');
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock payment response
    const mockPaymentId = `pay_mock_${Date.now()}`;
    const mockSignature = 'mock_signature_for_testing';
    
    try {
      const verifyRes = await paymentsApi.verifyRazorpayPayment({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
        our_order_id: orderId,
      });
      
      if (verifyRes.success) {
        setStatus('success');
        onSuccess(mockPaymentId);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      setStatus('failed');
      setError('Mock payment verification failed');
      onFailure('Mock payment verification failed');
    }
  };

  // Initiate payment
  const initiatePayment = async () => {
    setLoading(true);
    setError(null);
    setStatus('idle');

    try {
      // Create Razorpay order
      const orderRes = await paymentsApi.createRazorpayOrder({
        order_id: orderId,
        amount: amount,
        currency: 'INR',
        notes: {
          crop: cropName,
          seller: sellerName || 'Unknown',
        },
      });

      if (!orderRes.success) {
        throw new Error('Failed to create payment order');
      }

      setMockMode(orderRes.mock_mode);

      // If mock mode, use simulated payment
      if (orderRes.mock_mode) {
        await handleMockPayment(orderRes.razorpay_order_id);
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderRes.razorpay_key_id,
        amount: orderRes.amount * 100, // Razorpay expects paise
        currency: orderRes.currency,
        name: 'Shree Anna Marketplace',
        description: `Purchase: ${cropName}`,
        order_id: orderRes.razorpay_order_id,
        prefill: {
          name: buyerName,
          email: buyerEmail,
          contact: buyerPhone,
        },
        notes: {
          our_order_id: orderId,
        },
        theme: {
          color: '#16a34a', // Green theme
        },
        handler: async (response: RazorpayResponse) => {
          setStatus('processing');
          
          try {
            // Verify payment
            const verifyRes = await paymentsApi.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              our_order_id: orderId,
            });

            if (verifyRes.verified) {
              setStatus('success');
              onSuccess(response.razorpay_payment_id);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            setStatus('failed');
            const errorMsg = err instanceof Error ? err.message : 'Payment verification failed';
            setError(errorMsg);
            onFailure(errorMsg);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onCancel?.();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment initiation failed';
      setError(errorMsg);
      onFailure(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Complete your purchase securely
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Item:</span>
            <span className="font-medium">{cropName}</span>
          </div>
          {sellerName && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Seller:</span>
              <span>{sellerName}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono text-xs">{orderId.slice(0, 12)}...</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-xl font-bold text-green-600 flex items-center">
                <IndianRupee className="h-5 w-5" />
                {amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Mock Mode Badge */}
        {mockMode && (
          <Badge variant="outline" className="w-full justify-center py-1 text-orange-600 border-orange-300">
            🧪 Test Mode - No real payment
          </Badge>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {status === 'success' && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Payment successful! Your order is confirmed.
            </AlertDescription>
          </Alert>
        )}

        {/* Pay Button */}
        {status !== 'success' && (
          <Button
            onClick={initiatePayment}
            disabled={loading || status === 'processing'}
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
          >
            {loading || status === 'processing' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay Now - ₹{amount.toLocaleString('en-IN')}
              </>
            )}
          </Button>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="h-4 w-4" />
          <span>Secured by Razorpay</span>
        </div>

        {/* Payment Methods */}
        <div className="flex justify-center gap-3 pt-2">
          <Badge variant="secondary" className="text-xs">UPI</Badge>
          <Badge variant="secondary" className="text-xs">Cards</Badge>
          <Badge variant="secondary" className="text-xs">Net Banking</Badge>
          <Badge variant="secondary" className="text-xs">Wallets</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default RazorpayCheckout;
