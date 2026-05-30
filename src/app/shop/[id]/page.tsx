"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Leaf,
  ShoppingCart,
  Plus,
  Minus,
  MapPin,
  Calendar,
  Package,
  Wheat,
  AlertCircle,
  ArrowLeft,
  Star,
  Shield,
  Clock,
  User,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";

// =============================================================================
// Types
// =============================================================================

interface ProductDetail {
  id: string;
  crop: string;
  variety: string | null;
  description: string | null;
  qty_available_kg: number;
  price_per_kg: number;
  min_order_kg: number;
  max_order_kg: number | null;
  is_organic: boolean;
  organic_cert_url: string | null;
  is_processed: boolean;
  product_type: string | null;
  quality_grade: string | null;
  moisture_level: number | null;
  harvest_date: string | null;
  district: string | null;
  state: string | null;
  seller: {
    id: string | null;
    name: string | null;
    district: string | null;
  };
  photos: string[];
  shelf_life_days: number | null;
  packaging_type: string | null;
  packaging_size_grams: number | null;
  fssai_license: string | null;
  nutritional_info: NutritionalInfo | null;
  source_batch_id: string | null;
  created_at: string;
}

interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  iron?: number;
  calcium?: number;
  serving_size?: string;
}

interface TraceEvent {
  event_type: string;
  description: string;
  actor_name: string | null;
  location: string | null;
  timestamp: string;
}

// =============================================================================
import { listingsApi, shopApi, traceApi } from "@/lib/api";

// =============================================================================
// API Helpers
// =============================================================================

async function fetchProduct(productId: string): Promise<ProductDetail> {
  const listing = await listingsApi.getById(productId);
  return {
      id: listing.id,
      crop: listing.crop,
      variety: listing.variety,
      description: listing.description,
      qty_available_kg: listing.qty_kg,
      price_per_kg: listing.min_price_per_qtl / 100,
      min_order_kg: 1,
      max_order_kg: listing.qty_kg,
      is_organic: listing.is_organic,
      organic_cert_url: listing.organic_cert_url,
      is_processed: listing.owner_type === 'processor',
      product_type: null,
      quality_grade: listing.quality_grade,
      moisture_level: listing.moisture_level,
      harvest_date: listing.harvest_date,
      district: listing.district,
      state: listing.state,
      seller: {
          id: listing.owner_id,
          name: 'Seller',
          district: listing.district
      },
      photos: listing.photos || [],
      shelf_life_days: null,
      packaging_type: null,
      packaging_size_grams: null,
      fssai_license: null,
      nutritional_info: null,
      source_batch_id: null,
      created_at: listing.created_at
  };
}

async function addToCart(token: string, listingId: string, qtyKg: number) {
  return shopApi.addToCart(listingId, qtyKg);
}

async function fetchTraceability(batchId: string): Promise<TraceEvent[]> {
  try {
    const data = await traceApi.getByCode(batchId);
    return (data as any).trace_events || [];
  } catch (e) {
    return [];
  }
}

// =============================================================================
// Nutritional Info Component
// =============================================================================

function NutritionCard({ info }: { info: NutritionalInfo }) {
  const nutrients = [
    { label: "Calories", value: info.calories, unit: "kcal" },
    { label: "Protein", value: info.protein, unit: "g" },
    { label: "Carbohydrates", value: info.carbs, unit: "g" },
    { label: "Fat", value: info.fat, unit: "g" },
    { label: "Fiber", value: info.fiber, unit: "g" },
    { label: "Iron", value: info.iron, unit: "mg" },
    { label: "Calcium", value: info.calcium, unit: "mg" },
  ].filter((n) => n.value !== undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nutritional Information</CardTitle>
        {info.serving_size && (
          <p className="text-sm text-gray-500">Per {info.serving_size}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {nutrients.map((nutrient) => (
            <div
              key={nutrient.label}
              className="flex justify-between p-2 bg-gray-50 rounded"
            >
              <span className="text-gray-600">{nutrient.label}</span>
              <span className="font-medium">
                {nutrient.value}
                {nutrient.unit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Farm to Fork Journey
// =============================================================================

function TraceabilityJourney({ events }: { events: TraceEvent[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Farm to Fork Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Traceability information not available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Farm to Fork Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {events.map((event, index) => (
            <div key={index} className="flex gap-4 pb-6 last:pb-0">
              {/* Timeline line */}
              {index < events.length - 1 && (
                <div className="absolute left-4 top-8 bottom-6 w-0.5 bg-green-200" />
              )}

              {/* Icon */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{event.event_type}</h4>
                <p className="text-sm text-gray-600">{event.description}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  {event.actor_name && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {event.actor_name}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(event.timestamp).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Main Product Detail Page
// =============================================================================

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProduct(productId);
        setProduct(data);
        setQuantity(data.min_order_kg);

        // Load traceability if available
        if (data.source_batch_id) {
          const events = await fetchTraceability(data.source_batch_id);
          setTraceEvents(events);
        }
      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!token) {
      router.push(`/auth/login?redirect=/shop/${productId}`);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(token, productId, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/shop">
              <Button>Back to Shop</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const totalPrice = quantity * product.price_per_kg;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/shop" className="hover:text-gray-700">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{product.crop}</span>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {addedToCart && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Added to cart! <Link href="/shop" className="underline">Continue shopping</Link> or{" "}
              <Link href="/shop/checkout" className="underline">checkout</Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.photos.length > 0 ? (
                <img
                  src={product.photos[selectedImage]}
                  alt={product.crop}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Wheat className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 
                      ${selectedImage === index ? "border-green-500" : "border-gray-200"}`}
                  >
                    <img
                      src={photo}
                      alt={`${product.crop} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {product.is_organic && (
                  <Badge className="bg-green-600">
                    <Leaf className="h-3 w-3 mr-1" />
                    Organic
                  </Badge>
                )}
                {product.is_processed && (
                  <Badge className="bg-purple-600">Processed</Badge>
                )}
                {product.quality_grade && (
                  <Badge variant="outline">Grade {product.quality_grade}</Badge>
                )}
                {product.fssai_license && (
                  <Badge variant="outline" className="bg-blue-50">
                    <Shield className="h-3 w-3 mr-1" />
                    FSSAI
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900">{product.crop}</h1>
              {product.variety && (
                <p className="text-lg text-gray-600">{product.variety}</p>
              )}
              {product.product_type && (
                <p className="text-sm text-purple-600 capitalize">
                  {product.product_type}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-600">
                ₹{product.price_per_kg}
              </span>
              <span className="text-lg text-gray-500">/kg</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-700">{product.description}</p>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>
                  {product.district}
                  {product.state && `, ${product.state}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-gray-400" />
                <span>{product.qty_available_kg} kg available</span>
              </div>
              {product.harvest_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    Harvested:{" "}
                    {new Date(product.harvest_date).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
              {product.shelf_life_days && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{product.shelf_life_days} days shelf life</span>
                </div>
              )}
            </div>

            {/* Seller Info */}
            {product.seller.name && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{product.seller.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.seller.district}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add to Cart */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Quantity (kg)</span>
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

                <div className="flex items-center justify-between text-lg">
                  <span>Total:</span>
                  <span className="font-bold text-green-600">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.qty_available_kg < product.min_order_kg}
                >
                  {addingToCart ? (
                    "Adding..."
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              {product.nutritional_info && (
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              )}
              <TabsTrigger value="traceability">Traceability</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Product Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crop Type</span>
                          <span className="font-medium">{product.crop}</span>
                        </div>
                        {product.variety && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Variety</span>
                            <span className="font-medium">{product.variety}</span>
                          </div>
                        )}
                        {product.quality_grade && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quality Grade</span>
                            <span className="font-medium">
                              {product.quality_grade}
                            </span>
                          </div>
                        )}
                        {product.moisture_level && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Moisture Level</span>
                            <span className="font-medium">
                              {product.moisture_level}%
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Organic</span>
                          <span className="font-medium">
                            {product.is_organic ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {product.is_processed && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Processing Details
                        </h3>
                        <div className="space-y-2">
                          {product.product_type && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Product Type</span>
                              <span className="font-medium capitalize">
                                {product.product_type}
                              </span>
                            </div>
                          )}
                          {product.packaging_type && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Packaging</span>
                              <span className="font-medium capitalize">
                                {product.packaging_type}
                              </span>
                            </div>
                          )}
                          {product.packaging_size_grams && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pack Size</span>
                              <span className="font-medium">
                                {product.packaging_size_grams}g
                              </span>
                            </div>
                          )}
                          {product.shelf_life_days && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shelf Life</span>
                              <span className="font-medium">
                                {product.shelf_life_days} days
                              </span>
                            </div>
                          )}
                          {product.fssai_license && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">FSSAI License</span>
                              <span className="font-medium">
                                {product.fssai_license}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {product.nutritional_info && (
              <TabsContent value="nutrition" className="mt-4">
                <NutritionCard info={product.nutritional_info} />
              </TabsContent>
            )}

            <TabsContent value="traceability" className="mt-4">
              <TraceabilityJourney events={traceEvents} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
