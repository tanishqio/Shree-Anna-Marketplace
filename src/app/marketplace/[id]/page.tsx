"use client";

import React, { useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  IndianRupee,
  ShoppingCart,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  Award,
  Leaf,
  QrCode,
  Check,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { milletTypes } from '@/lib/design-tokens';
import { useLanguage } from '@/lib/hooks/useLanguage';

const mockListings = [
  {
    id: '1',
    farmerId: 'f1',
    farmerName: 'Ramesh Kumar',
    farmerPhone: '+91 98765 43210',
    farmerLocation: 'Tumkur, Karnataka',
    farmerRating: 4.8,
    farmerReviews: 56,
    farmerVerified: true,
    milletType: 'finger',
    variety: 'GPU-28',
    quantity: 500,
    pricePerKg: 45,
    minOrder: 10,
    qualityGrade: 'Premium',
    isOrganic: true,
    certifications: ['NPOP Organic', 'FSSAI'],
    harvestDate: new Date('2024-01-10'),
    description: 'Premium quality finger millet (ragi) grown organically. Rich in calcium and iron. Perfect for making ragi mudde, ragi roti, and ragi malt.',
    descriptionHi: 'जैविक रूप से उगाई गई प्रीमियम गुणवत्ता वाली रागी। कैल्शियम और आयरन से भरपूर। रागी मुद्दे, रागी रोटी और रागी माल्ट बनाने के लिए उपयुक्त।',
    specifications: {
      moisture: '12%',
      foreignMatter: '0.5%',
      damagedGrains: '1%',
      otherVariety: '0.5%',
    },
    photos: ['/millet1.jpg', '/millet2.jpg', '/millet3.jpg'],
    soldCount: 1200,
    views: 3500,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    farmerId: 'f2',
    farmerName: 'Suresh Patil',
    farmerPhone: '+91 87654 32109',
    farmerLocation: 'Dharwad, Karnataka',
    farmerRating: 4.6,
    farmerReviews: 42,
    farmerVerified: true,
    milletType: 'pearl',
    variety: 'HHB-67',
    quantity: 300,
    pricePerKg: 38,
    minOrder: 20,
    qualityGrade: 'Standard',
    isOrganic: false,
    certifications: ['FSSAI'],
    harvestDate: new Date('2024-01-05'),
    description: 'Fresh pearl millet (bajra) with high nutritional value. Ideal for making bhakri and porridge.',
    descriptionHi: 'उच्च पोषण मूल्य वाली ताज़ी बाजरा। भाखरी और दलिया बनाने के लिए आदर्श।',
    specifications: {
      moisture: '13%',
      foreignMatter: '0.8%',
      damagedGrains: '1.5%',
      otherVariety: '1%',
    },
    photos: ['/millet2.jpg'],
    soldCount: 800,
    views: 2200,
    createdAt: new Date('2024-01-12'),
  },
];

const reviews = [
  { id: 1, name: 'Anita Sharma', rating: 5, date: '2024-01-18', comment: 'Excellent quality! The ragi was fresh and had great taste.' },
  { id: 2, name: 'Raj Kumar', rating: 4, date: '2024-01-15', comment: 'Good product, delivery was on time.' },
  { id: 3, name: 'Priya Devi', rating: 5, date: '2024-01-10', comment: 'Very happy with the purchase. Will buy again.' },
];

export default function MarketplaceListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [role, setRole] = useState('buyer');
  const [quantity, setQuantity] = useState(50);
  const [currentImage, setCurrentImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const listing = mockListings.find(l => l.id === id) || mockListings[0];
  const millet = milletTypes.find(m => m.id === listing.milletType);

  const uiText = {
    back: language === 'hi' ? 'वापस' : language === 'kn' ? 'ಹಿಂದೆ' : language === 'te' ? 'వెనుకకు' : language === 'ta' ? 'பின்' : language === 'mr' ? 'मागे' : 'Back',
    verified: language === 'hi' ? 'सत्यापित' : 'Verified',
    organic: language === 'hi' ? 'जैविक' : language === 'kn' ? 'ಸಾವಯವ' : language === 'te' ? 'సేంద్రీయ' : language === 'ta' ? 'இயற்கை' : language === 'mr' ? 'सेंद्रिय' : 'Organic',
    perKg: language === 'hi' ? 'प्रति किलो' : '/kg',
    available: language === 'hi' ? 'उपलब्ध' : 'Available',
    minOrder: language === 'hi' ? 'न्यूनतम ऑर्डर' : 'Min Order',
    quantity: language === 'hi' ? 'मात्रा' : 'Quantity',
    addToCart: language === 'hi' ? 'कार्ट में जोड़ें' : language === 'kn' ? 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' : language === 'te' ? 'కార్ట్‌కి జోడించు' : language === 'ta' ? 'கார்ட்டில் சேர்' : language === 'mr' ? 'कार्टमध्ये जोडा' : 'Add to Cart',
    buyNow: language === 'hi' ? 'अभी खरीदें' : language === 'kn' ? 'ಈಗ ಖರೀದಿಸಿ' : language === 'te' ? 'ఇప్పుడు కొనండి' : language === 'ta' ? 'இப்போது வாங்கு' : language === 'mr' ? 'आता खरेदी करा' : 'Buy Now',
    contactSeller: language === 'hi' ? 'विक्रेता से संपर्क करें' : 'Contact Seller',
    sellerInfo: language === 'hi' ? 'विक्रेता जानकारी' : 'Seller Information',
    description: language === 'hi' ? 'विवरण' : 'Description',
    specifications: language === 'hi' ? 'विनिर्देश' : 'Specifications',
    reviews: language === 'hi' ? 'समीक्षाएं' : 'Reviews',
    qualityGrade: language === 'hi' ? 'गुणवत्ता ग्रेड' : 'Quality Grade',
    harvestDate: language === 'hi' ? 'कटाई तिथि' : 'Harvest Date',
    certifications: language === 'hi' ? 'प्रमाणपत्र' : 'Certifications',
    moisture: language === 'hi' ? 'नमी' : 'Moisture',
    foreignMatter: language === 'hi' ? 'विदेशी पदार्थ' : 'Foreign Matter',
    damagedGrains: language === 'hi' ? 'क्षतिग्रस्त अनाज' : 'Damaged Grains',
    freeDelivery: language === 'hi' ? 'मुफ्त डिलीवरी' : 'Free Delivery',
    qualityAssured: language === 'hi' ? 'गुणवत्ता सुनिश्चित' : 'Quality Assured',
    securePayment: language === 'hi' ? 'सुरक्षित भुगतान' : 'Secure Payment',
    traceability: language === 'hi' ? 'ट्रेसेबिलिटी' : 'Traceability',
    sold: language === 'hi' ? 'बिका' : 'Sold',
    totalAmount: language === 'hi' ? 'कुल राशि' : 'Total Amount',
  };

  const speakListing = () => {
    const text = language === 'hi'
      ? `${millet?.nameHi || listing.milletType}, ${listing.quantity} किलो उपलब्ध, ${listing.pricePerKg} रुपये प्रति किलो। ${listing.isOrganic ? 'जैविक प्रमाणित।' : ''} ${listing.farmerName} द्वारा ${listing.farmerLocation} से।`
      : `${millet?.name || listing.milletType}, ${listing.quantity} kg available at ${listing.pricePerKg} rupees per kg. ${listing.isOrganic ? 'Organically certified.' : ''} By ${listing.farmerName} from ${listing.farmerLocation}.`;
    speak(text);
  };

  const totalAmount = quantity * listing.pricePerKg;

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/marketplace" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            {uiText.back}
          </Link>
          <span>/</span>
          <span>{millet?.name || listing.milletType}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl">🌾</span>
              </div>
              
              {listing.photos.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={() => setCurrentImage(i => (i - 1 + listing.photos.length) % listing.photos.length)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() => setCurrentImage(i => (i + 1) % listing.photos.length)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              <div className="absolute top-4 left-4 flex gap-2">
                {listing.isOrganic && (
                  <Badge className="bg-accent text-white">
                    <Leaf className="w-3 h-3 mr-1" />
                    {uiText.organic}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-background/80">{listing.qualityGrade}</Badge>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={isSpeaking ? stopSpeaking : speakListing}
                  className="bg-background/80"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="bg-background/80"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" className="bg-background/80">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {listing.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    className={`w-16 h-16 rounded-xl bg-muted flex-shrink-0 flex items-center justify-center border-2 ${
                      currentImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImage(idx)}
                  >
                    <span className="text-2xl">🌾</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{listing.variety}</Badge>
                <span className="text-sm text-muted-foreground">{listing.soldCount}+ {uiText.sold}</span>
              </div>
              <h1 className="text-3xl font-bold mb-1">
                {language === 'hi' ? millet?.nameHi : millet?.name || listing.milletType}
              </h1>
              <p className="text-muted-foreground">{millet?.nameHi}</p>
              
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-4xl font-bold text-primary">₹{listing.pricePerKg}</span>
                <span className="text-muted-foreground">{uiText.perKg}</span>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="text-muted-foreground">
                  {uiText.available}: <span className="text-foreground font-medium">{listing.quantity} kg</span>
                </span>
                <span className="text-muted-foreground">
                  {uiText.minOrder}: <span className="text-foreground font-medium">{listing.minOrder} kg</span>
                </span>
              </div>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div>
              <Label className="text-base font-semibold">{uiText.quantity} (kg)</Label>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(q => Math.max(listing.minOrder, q - 10))}
                    disabled={quantity <= listing.minOrder}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(listing.minOrder, Math.min(listing.quantity, parseInt(e.target.value) || listing.minOrder)))}
                    className="w-20 mx-2 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(q => Math.min(listing.quantity, q + 10))}
                    disabled={quantity >= listing.quantity}
                  >
                    +
                  </Button>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-muted-foreground">{uiText.totalAmount}</p>
                  <p className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button size="lg" variant="outline" className="flex-1" asChild>
                <Link href="/buyer/cart">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {uiText.addToCart}
                </Link>
              </Button>
              <Button size="lg" className="flex-1" asChild>
                <Link href="/buyer/checkout">
                  {uiText.buyNow}
                </Link>
              </Button>
            </div>

            <Separator />

            {/* Seller Info */}
            <div className="bg-muted/50 rounded-2xl p-4">
              <h3 className="font-semibold mb-3">{uiText.sellerInfo}</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">👨‍🌾</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{listing.farmerName}</span>
                    {listing.farmerVerified && (
                      <Badge className="bg-blue-500/10 text-blue-600">
                        <Check className="w-3 h-3 mr-1" />
                        {uiText.verified}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span>{listing.farmerRating}</span>
                    <span>({listing.farmerReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{listing.farmerLocation}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${listing.farmerPhone}`}>
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://wa.me/${listing.farmerPhone.replace(/\s+/g, '')}`} target="_blank">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <Truck className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs">{uiText.freeDelivery}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <Shield className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs">{uiText.qualityAssured}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <Award className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs">{uiText.securePayment}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <QrCode className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs">{uiText.traceability}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="description">{uiText.description}</TabsTrigger>
            <TabsTrigger value="specifications">{uiText.specifications}</TabsTrigger>
            <TabsTrigger value="reviews">{uiText.reviews}</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="bg-card rounded-2xl border p-6">
              <p className="text-muted-foreground leading-relaxed">
                {language === 'hi' ? listing.descriptionHi : listing.description}
              </p>
              
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">{uiText.qualityGrade}</p>
                  <p className="font-semibold">{listing.qualityGrade}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">{uiText.harvestDate}</p>
                  <p className="font-semibold">{listing.harvestDate.toLocaleDateString()}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">{uiText.certifications}</p>
                  <p className="font-semibold">{listing.certifications.join(', ')}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <div className="bg-card rounded-2xl border p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">{uiText.moisture}</span>
                  <span className="font-medium">{listing.specifications.moisture}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">{uiText.foreignMatter}</span>
                  <span className="font-medium">{listing.specifications.foreignMatter}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">{uiText.damagedGrains}</span>
                  <span className="font-medium">{listing.specifications.damagedGrains}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Other Variety</span>
                  <span className="font-medium">{listing.specifications.otherVariety}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{listing.farmerRating}</p>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(listing.farmerRating) ? 'fill-primary text-primary' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{listing.farmerReviews} reviews</p>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm">👤</span>
                        </div>
                        <span className="font-medium">{review.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
