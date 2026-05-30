"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Leaf,
  Search,
  ShoppingCart,
  Filter,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Star,
  Package,
  Wheat,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";

// =============================================================================
// Types
// =============================================================================

interface Product {
  id: string;
  crop: string;
  variety: string | null;
  description: string | null;
  qty_available_kg: number;
  price_per_kg: number;
  min_order_kg: number;
  max_order_kg: number | null;
  is_organic: boolean;
  is_processed: boolean;
  product_type: string | null;
  quality_grade: string | null;
  district: string | null;
  state: string | null;
  seller_name: string | null;
  photo_url: string | null;
  photos: string[];
  shelf_life_days: number | null;
  packaging_size_grams: number | null;
  created_at: string;
}

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

import { shopApi } from "@/lib/api";

// =============================================================================
// API Helpers
// =============================================================================

async function fetchProducts(params: Record<string, string> = {}) {
  const { products, total } = await shopApi.getProducts(params);
  return { 
      products: products.map(p => ({
          id: p.id,
          crop: p.crop,
          variety: p.variety,
          description: p.description,
          qty_available_kg: p.qty_kg,
          price_per_kg: p.min_price_per_qtl / 100,
          min_order_kg: 1,
          max_order_kg: p.qty_kg,
          is_organic: p.is_organic,
          is_processed: p.owner_type === 'processor',
          product_type: null,
          quality_grade: p.quality_grade,
          district: p.district,
          state: p.state,
          seller_name: 'Seller',
          photo_url: p.photos?.[0] || null,
          photos: p.photos || [],
          shelf_life_days: null,
          packaging_size_grams: null,
          created_at: p.created_at
      })), 
      total, 
      page: 1, 
      limit: 50 
  };
}

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
          is_available: true
      })),
      item_count: items.length,
      total_amount
  };
}

async function addToCart(token: string, listingId: string, qtyKg: number) {
  return shopApi.addToCart(listingId, qtyKg);
}

async function updateCartItem(token: string, itemId: string, qtyKg: number) {
  return shopApi.updateCartItem(itemId, qtyKg);
}

async function removeFromCart(token: string, itemId: string) {
  return shopApi.removeFromCart(itemId);
}

// =============================================================================
// Product Card Component
// =============================================================================

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-100">
        {product.photo_url ? (
          <img
            src={product.photo_url}
            alt={product.crop}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Wheat className="h-16 w-16 text-gray-300" />
          </div>
        )}
        {product.is_organic && (
          <Badge className="absolute top-2 left-2 bg-green-600">
            <Leaf className="h-3 w-3 mr-1" />
            Organic
          </Badge>
        )}
        {product.is_processed && (
          <Badge className="absolute top-2 right-2 bg-purple-600">
            Processed
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{product.crop}</h3>
            {product.variety && (
              <p className="text-sm text-gray-600">{product.variety}</p>
            )}
          </div>
          {product.quality_grade && (
            <Badge variant="outline">Grade {product.quality_grade}</Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin className="h-3 w-3" />
          <span>{product.district || "Unknown location"}</span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-2xl font-bold text-green-600">
              ₹{product.price_per_kg}
            </span>
            <span className="text-sm text-gray-500">/kg</span>
          </div>
          <div className="text-right text-sm text-gray-500">
            {product.qty_available_kg} kg available
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => onAddToCart(product)}
            disabled={product.qty_available_kg < product.min_order_kg}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Link href={`/shop/${product.id}`}>
            <Button variant="outline">View</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Cart Sheet Component
// =============================================================================

function CartSheet({
  cart,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  loading,
}: {
  cart: CartResponse;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  loading: boolean;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cart.item_count > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {cart.item_count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {cart.item_count} item(s) in your cart
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div
                key={item.id}
                className={`flex gap-3 p-3 rounded-lg border ${
                  !item.is_available ? "bg-red-50 border-red-200" : ""
                }`}
              >
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                  {item.photo_url ? (
                    <img
                      src={item.photo_url}
                      alt={item.crop}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wheat className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{item.crop}</h4>
                      {item.variety && (
                        <p className="text-xs text-gray-500">{item.variety}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, Math.max(1, item.qty_kg - 1))
                        }
                        className="p-1 rounded border hover:bg-gray-100"
                        disabled={loading}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-12 text-center">{item.qty_kg} kg</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.qty_kg + 1)}
                        className="p-1 rounded border hover:bg-gray-100"
                        disabled={loading || item.qty_kg >= item.available_qty}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-semibold">
                      ₹{item.total_price.toFixed(2)}
                    </span>
                  </div>
                  {!item.is_available && (
                    <p className="text-xs text-red-600 mt-1">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Not enough stock
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <SheetFooter className="mt-6">
            <div className="w-full space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">
                  ₹{cart.total_amount.toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={onCheckout}
                disabled={loading || cart.items.some((i) => !i.is_available)}
              >
                Proceed to Checkout
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

// =============================================================================
// Add to Cart Modal
// =============================================================================

function AddToCartModal({
  product,
  isOpen,
  onClose,
  onAdd,
  loading,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (qty: number) => void;
  loading: boolean;
}) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setQuantity(product.min_order_kg);
    }
  }, [product]);

  if (!product) return null;

  const total = quantity * product.price_per_kg;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            Select quantity for {product.crop}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Price per kg:</span>
            <span className="font-semibold">₹{product.price_per_kg}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Available:</span>
            <span>{product.qty_available_kg} kg</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Quantity (kg):</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setQuantity(Math.max(product.min_order_kg, quantity - 1))
                }
                disabled={quantity <= product.min_order_kg}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={product.min_order_kg}
                max={product.max_order_kg || product.qty_available_kg}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setQuantity(
                    Math.min(
                      product.max_order_kg || product.qty_available_kg,
                      quantity + 1
                    )
                  )
                }
                disabled={
                  quantity >=
                  (product.max_order_kg || product.qty_available_kg)
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold border-t pt-4">
            <span>Total:</span>
            <span className="text-green-600">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onAdd(quantity)} disabled={loading}>
            {loading ? "Adding..." : "Add to Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Main Shop Page
// =============================================================================

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartResponse>({
    items: [],
    item_count: 0,
    total_amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Load products
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const params: Record<string, string> = { sort_by: sortBy };
        if (searchQuery) params.crop = searchQuery;
        if (category && category !== "all") params.category = category;

        const data = await fetchProducts(params);
        setProducts(data.products);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [searchQuery, category, sortBy]);

  // Load cart if authenticated
  const loadCart = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchCart(token);
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleAddToCart = (product: Product) => {
    if (!token) {
      router.push("/auth/login?redirect=/shop");
      return;
    }
    setSelectedProduct(product);
    setIsAddModalOpen(true);
  };

  const confirmAddToCart = async (quantity: number) => {
    if (!token || !selectedProduct) return;
    try {
      setCartLoading(true);
      await addToCart(token, selectedProduct.id, quantity);
      await loadCart();
      setIsAddModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (!token) return;
    try {
      setCartLoading(true);
      await updateCartItem(token, itemId, newQty);
      await loadCart();
    } catch (err) {
      console.error("Failed to update cart:", err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    if (!token) return;
    try {
      setCartLoading(true);
      await removeFromCart(token, itemId);
      await loadCart();
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleCheckout = () => {
    router.push("/shop/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shop Millets</h1>
            <p className="text-gray-600">
              Fresh millets and processed products direct from farmers
            </p>
          </div>

          <div className="flex items-center gap-3">
            {token && (
              <CartSheet
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
                onCheckout={handleCheckout}
                loading={cartLoading}
              />
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search millets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="raw">Raw Millets</SelectItem>
                  <SelectItem value="processed">Processed Products</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add to Cart Modal */}
      <AddToCartModal
        product={selectedProduct}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={confirmAddToCart}
        loading={cartLoading}
      />
    </div>
  );
}
