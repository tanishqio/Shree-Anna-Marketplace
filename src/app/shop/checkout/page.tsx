"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingCart,
  MapPin,
  Phone,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Wheat,
  Loader2,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";

// =============================================================================
// Types
// =============================================================================

interface CartItem {
  id: string;
  listing_id: string;
  crop: string;
  variety: string | null;
  qty_kg: number;
  price_per_kg: number;
  total_price: number;
  seller_name: string | null;
  photo_url: string | null;
  available_qty: number;
  is_available: boolean;
}

interface CartResponse {
  items: CartItem[];
  item_count: number;
  total_amount: number;
}

interface CheckoutOrder {
  order_id: string;
  seller_id: string;
  total_amount: number;
  total_qty_kg: number;
  item_count: number;
}

import { shopApi } from "@/lib/api";

// =============================================================================
// API Helpers
// =============================================================================

async function fetchCart(token: string): Promise<CartResponse> {
  const { items, total_amount } = await shopApi.getCart();
  return {
      items: items.map((item: any) => ({
          id: item.id,
          listing_id: item.listing_id,
          crop: item.listing?.crop || 'Unknown',
          variety: item.listing?.variety || null,
          qty_kg: item.qty_kg,
          price_per_kg: (item.listing?.min_price_per_qtl || 0) / 100,
          total_price: (item.qty_kg * (item.listing?.min_price_per_qtl || 0)) / 100,
          seller_name: 'Seller',
          photo_url: item.listing?.photos?.[0] || null,
          available_qty: item.listing?.qty_kg || 0,
          is_available: item.listing?.status === 'active'
      })),
      item_count: items.length,
      total_amount
  };
}

async function checkout(
  token: string,
  data: { shipping_address: string; phone?: string; notes?: string }
): Promise<{ success: boolean; orders: CheckoutOrder[]; total_amount: number }> {
  await shopApi.checkout();
  return { 
      success: true, 
      orders: [], 
      total_amount: 0 
  };
}

// =============================================================================
// Main Checkout Page
// =============================================================================

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<CheckoutOrder[]>([]);

  // Form state
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/auth/login?redirect=/shop/checkout");
      return;
    }

    async function loadCart() {
      try {
        const data = await fetchCart(token!);
        if (data.items.length === 0) {
          router.push("/shop");
          return;
        }
        setCart(data);
      } catch (err) {
        setError("Failed to load cart");
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    if (shippingAddress.length < 10) {
      setError("Please enter a complete shipping address");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await checkout(token, {
        shipping_address: shippingAddress,
        phone: phone || undefined,
        notes: notes || undefined,
      });

      setCreatedOrders(result.orders);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-lg mx-auto text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              {createdOrders.length} order(s) have been created. You will receive
              SMS notifications with order updates.
            </p>

            <div className="space-y-3 mb-6">
              {createdOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-600">
                    Order #{order.order_id.slice(0, 8)}
                  </span>
                  <Badge variant="secondary">
                    ₹{order.total_amount.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Link href="/buyer/dashboard">
                <Button>View Orders</Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  if (!cart) return null;

  // Check for unavailable items
  const hasUnavailableItems = cart.items.some((item) => !item.is_available);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/shop">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">{cart.item_count} item(s) in your cart</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasUnavailableItems && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some items in your cart are no longer available. Please remove them
              before proceeding.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address including pincode"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Contact Phone (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions for delivery"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting || hasUnavailableItems}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Place Order - ₹{cart.total_amount.toFixed(2)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-3 ${
                        !item.is_available ? "opacity-50" : ""
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                        {item.photo_url ? (
                          <img
                            src={item.photo_url}
                            alt={item.crop}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Wheat className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.crop}</h4>
                        <p className="text-xs text-gray-500">
                          {item.qty_kg} kg × ₹{item.price_per_kg}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          ₹{item.total_price.toFixed(2)}
                        </span>
                        {!item.is_available && (
                          <p className="text-xs text-red-600">Unavailable</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <hr className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{cart.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      ₹{cart.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
