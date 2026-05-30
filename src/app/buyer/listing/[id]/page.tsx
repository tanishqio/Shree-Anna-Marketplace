"use client";

import React, { useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Star,
  Leaf,
  Shield,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  ChevronRight,
  Package,
  Truck,
  Calendar,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  QrCode,
  Scale,
  Droplets,
  ThermometerSun,
  Award,
  Clock,
  IndianRupee,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { milletTypes, qualityGrades } from '@/lib/design-tokens';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useListing } from '@/lib/hooks/useData';
import { listingsApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

// Mock listing data
const mockListings = [
  {
    id: '1',
    farmerId: 'f1',
    farmerName: 'Ramesh Kumar',
    farmerPhone: '+91 98765 43210',
    farmerRating: 4.8,
    farmerReviews: 56,
    farmerLocation: 'Tumkur, Karnataka',
    farmerJoinedDate: '2022-03-15',
    farmerTotalSales: 156,
    milletType: 'finger',
    variety: 'GPU-28',
    quantity: 500,
    minOrderQty: 50,
    pricePerKg: 45,
    qualityGrade: 'premium',
    organic: true,
    verified: true,
    certifications: ['Organic India', 'FSSAI'],
    harvestDate: '2024-01-10',
    moistureContent: 12,
    foreignMatter: 0.5,
    description: 'Premium quality finger millet (Ragi) grown using traditional organic farming methods. No pesticides or chemical fertilizers used. Ideal for making ragi mudde, ragi malt, and other healthy recipes.',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800',
    ],
    location: {
      village: 'Kunigal',
      taluk: 'Kunigal',
      district: 'Tumkur',
      state: 'Karnataka',
      pincode: '572130',
    },
    deliveryOptions: ['Pickup', 'Local Delivery', 'Shipping'],
    paymentTerms: 'Advance payment or Cash on Delivery',
    createdAt: new Date('2024-01-15'),
    views: 234,
    enquiries: 12,
  },
  {
    id: '2',
    farmerId: 'f2',
    farmerName: 'Lakshmi Devi',
    farmerPhone: '+91 98765 43211',
    farmerRating: 4.5,
    farmerReviews: 34,
    farmerLocation: 'Anantapur, AP',
    farmerJoinedDate: '2023-01-10',
    farmerTotalSales: 89,
    milletType: 'foxtail',
    variety: 'SiA-3156',
    quantity: 300,
    minOrderQty: 25,
    pricePerKg: 55,
    qualityGrade: 'premium',
    organic: false,
    verified: true,
    certifications: ['FSSAI'],
    harvestDate: '2024-01-05',
    moistureContent: 11,
    foreignMatter: 0.3,
    description: 'High-quality foxtail millet suitable for making upma, pulao, and other dishes. Clean and well-sorted grains with excellent taste.',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
    ],
    location: {
      village: 'Penukonda',
      taluk: 'Penukonda',
      district: 'Anantapur',
      state: 'Andhra Pradesh',
      pincode: '515110',
    },
    deliveryOptions: ['Pickup', 'Shipping'],
    paymentTerms: 'Advance payment required',
    createdAt: new Date('2024-01-18'),
    views: 156,
    enquiries: 8,
  },
  {
    id: '3',
    farmerId: 'f3',
    farmerName: 'Venkatesh Reddy',
    farmerPhone: '+91 98765 43212',
    farmerRating: 4.9,
    farmerReviews: 78,
    farmerLocation: 'Warangal, Telangana',
    farmerJoinedDate: '2021-08-20',
    farmerTotalSales: 234,
    milletType: 'pearl',
    variety: 'HHB-67',
    quantity: 1000,
    minOrderQty: 100,
    pricePerKg: 38,
    qualityGrade: 'standard',
    organic: true,
    verified: true,
    certifications: ['Organic India', 'FSSAI', 'APEDA'],
    harvestDate: '2024-01-12',
    moistureContent: 10,
    foreignMatter: 0.4,
    description: 'Organic pearl millet (Bajra) with excellent nutritional value. Perfect for making rotis, khichdi, and traditional recipes. Sourced from sustainable farming practices.',
    images: [
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800',
    ],
    location: {
      village: 'Jangaon',
      taluk: 'Jangaon',
      district: 'Warangal',
      state: 'Telangana',
      pincode: '506167',
    },
    deliveryOptions: ['Pickup', 'Local Delivery', 'Shipping'],
    paymentTerms: 'Flexible payment options available',
    createdAt: new Date('2024-01-20'),
    views: 312,
    enquiries: 18,
  },
];

// Transform API listing to display format
interface ApiListing {
  id: string;
  crop: string;
  qty_kg: number;
  min_price_per_qtl: number;
  quality_grade?: string;
  is_organic: boolean;
  district?: string;
  state?: string;
  created_at: string;
  owner_id?: string;
  description?: string;
}

function transformApiToDisplayListing(api: ApiListing) {
  return {
    id: api.id,
    farmerId: api.owner_id || 'f1',
    farmerName: 'Farmer', // API doesn't return this yet
    farmerPhone: '+91 98765 43210',
    farmerRating: 4.5,
    farmerReviews: 10,
    farmerLocation: [api.district, api.state].filter(Boolean).join(', ') || 'India',
    farmerJoinedDate: '2023-01-01',
    farmerTotalSales: 50,
    milletType: api.crop,
    variety: 'Standard',
    quantity: api.qty_kg,
    minOrderQty: Math.min(50, api.qty_kg),
    pricePerKg: Math.round(api.min_price_per_qtl / 100),
    qualityGrade: api.quality_grade || 'standard',
    organic: api.is_organic,
    verified: true,
    certifications: api.is_organic ? ['Organic'] : [],
    harvestDate: api.created_at,
    moistureContent: 12,
    foreignMatter: 0.5,
    description: api.description || 'Quality millet produce from local farmer.',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800'],
    location: {
      district: api.district || 'District',
      state: api.state || 'State',
    },
    deliveryOptions: ['Pickup', 'Local Delivery'],
    paymentTerms: 'Contact farmer for details',
    createdAt: new Date(api.created_at),
    views: 0,
    enquiries: 0,
  };
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [role, setRole] = useState('buyer');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [offerQuantity, setOfferQuantity] = useState(100);
  const [offerPrice, setOfferPrice] = useState(0);
  const [offerMessage, setOfferMessage] = useState('');
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  // Fetch listing from API
  const { data: apiListing, isLoading, error } = useListing(id);
  
  // Transform API data or fallback to mock
  const mockListing = mockListings.find(l => l.id === id) || mockListings[0];
  const listing = apiListing 
    ? transformApiToDisplayListing(apiListing as unknown as ApiListing)
    : mockListing;
  
  const millet = milletTypes.find(m => m.id === listing.milletType);
  const quality = qualityGrades.find(q => q.id === listing.qualityGrade);

  // Set initial offer price
  React.useEffect(() => {
    setOfferPrice(listing.pricePerKg);
  }, [listing.pricePerKg]);

  // UI Text translations
  const uiText = {
    backToListings: language === 'hi' ? 'लिस्टिंग पर वापस' : language === 'te' ? 'జాబితాలకు తిరిగి' : language === 'kn' ? 'ಪಟ್ಟಿಗಳಿಗೆ ಹಿಂತಿರುಗಿ' : language === 'ta' ? 'பட்டியல்களுக்குத் திரும்பு' : language === 'mr' ? 'यादीवर परत' : 'Back to listings',
    verified: language === 'hi' ? 'सत्यापित' : language === 'te' ? 'ధృవీకరించబడింది' : language === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : language === 'ta' ? 'சரிபார்க்கப்பட்டது' : language === 'mr' ? 'सत्यापित' : 'Verified',
    organic: language === 'hi' ? 'जैविक' : language === 'te' ? 'సేంద్రీయ' : language === 'kn' ? 'ಸಾವಯವ' : language === 'ta' ? 'இயற்கை' : language === 'mr' ? 'सेंद्रिय' : 'Organic',
    perKg: language === 'hi' ? 'प्रति किलो' : language === 'te' ? 'కిలోకు' : language === 'kn' ? 'ಪ್ರತಿ ಕೆಜಿ' : language === 'ta' ? 'கிலோவுக்கு' : language === 'mr' ? 'प्रति किलो' : 'per kg',
    available: language === 'hi' ? 'उपलब्ध' : language === 'te' ? 'అందుబాటులో' : language === 'kn' ? 'ಲಭ್ಯವಿದೆ' : language === 'ta' ? 'கிடைக்கும்' : language === 'mr' ? 'उपलब्ध' : 'Available',
    minOrder: language === 'hi' ? 'न्यूनतम ऑर्डर' : language === 'te' ? 'కనీస ఆర్డర్' : language === 'kn' ? 'ಕನಿಷ್ಠ ಆದೇಶ' : language === 'ta' ? 'குறைந்தபட்ச ஆர்டர்' : language === 'mr' ? 'किमान ऑर्डर' : 'Min. Order',
    makeOffer: language === 'hi' ? 'ऑफर दें' : language === 'te' ? 'ఆఫర్ చేయండి' : language === 'kn' ? 'ಆಫರ್ ಮಾಡಿ' : language === 'ta' ? 'சலுகை செய்யுங்கள்' : language === 'mr' ? 'ऑफर द्या' : 'Make Offer',
    contactFarmer: language === 'hi' ? 'किसान से संपर्क करें' : language === 'te' ? 'రైతును సంప్రదించండి' : language === 'kn' ? 'ರೈತರನ್ನು ಸಂಪರ್ಕಿಸಿ' : language === 'ta' ? 'விவசாயியை தொடர்பு கொள்ளுங்கள்' : language === 'mr' ? 'शेतकऱ्याशी संपर्क साधा' : 'Contact Farmer',
    description: language === 'hi' ? 'विवरण' : language === 'te' ? 'వివరణ' : language === 'kn' ? 'ವಿವರಣೆ' : language === 'ta' ? 'விளக்கம்' : language === 'mr' ? 'वर्णन' : 'Description',
    qualityDetails: language === 'hi' ? 'गुणवत्ता विवरण' : language === 'te' ? 'నాణ్యత వివరాలు' : language === 'kn' ? 'ಗುಣಮಟ್ಟದ ವಿವರಗಳು' : language === 'ta' ? 'தரம் விவரங்கள்' : language === 'mr' ? 'गुणवत्ता तपशील' : 'Quality Details',
    moisture: language === 'hi' ? 'नमी' : language === 'te' ? 'తేమ' : language === 'kn' ? 'ತೇವಾಂಶ' : language === 'ta' ? 'ஈரப்பதம்' : language === 'mr' ? 'आर्द्रता' : 'Moisture',
    foreignMatter: language === 'hi' ? 'विदेशी पदार्थ' : language === 'te' ? 'విదేశీ పదార్థం' : language === 'kn' ? 'ವಿದೇಶಿ ವಸ್ತು' : language === 'ta' ? 'வெளிநாட்டு பொருள்' : language === 'mr' ? 'परदेशी पदार्थ' : 'Foreign Matter',
    harvestDate: language === 'hi' ? 'कटाई की तारीख' : language === 'te' ? 'పంట తేదీ' : language === 'kn' ? 'ಕೊಯ್ಲು ದಿನಾಂಕ' : language === 'ta' ? 'அறுவடை தேதி' : language === 'mr' ? 'कापणी तारीख' : 'Harvest Date',
    certifications: language === 'hi' ? 'प्रमाणपत्र' : language === 'te' ? 'ధృవపత్రాలు' : language === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರಗಳು' : language === 'ta' ? 'சான்றிதழ்கள்' : language === 'mr' ? 'प्रमाणपत्रे' : 'Certifications',
    location: language === 'hi' ? 'स्थान' : language === 'te' ? 'స్థానం' : language === 'kn' ? 'ಸ್ಥಳ' : language === 'ta' ? 'இடம்' : language === 'mr' ? 'स्थान' : 'Location',
    delivery: language === 'hi' ? 'डिलीवरी' : language === 'te' ? 'డెలివరీ' : language === 'kn' ? 'ವಿತರಣೆ' : language === 'ta' ? 'டெலிவரி' : language === 'mr' ? 'डिलिव्हरी' : 'Delivery',
    payment: language === 'hi' ? 'भुगतान' : language === 'te' ? 'చెల్లింపు' : language === 'kn' ? 'ಪಾವತಿ' : language === 'ta' ? 'கட்டணம்' : language === 'mr' ? 'पेमेंट' : 'Payment',
    aboutFarmer: language === 'hi' ? 'किसान के बारे में' : language === 'te' ? 'రైతు గురించి' : language === 'kn' ? 'ರೈತರ ಬಗ್ಗೆ' : language === 'ta' ? 'விவசாயி பற்றி' : language === 'mr' ? 'शेतकऱ्याबद्दल' : 'About Farmer',
    memberSince: language === 'hi' ? 'सदस्य तब से' : language === 'te' ? 'నుండి సభ్యుడు' : language === 'kn' ? 'ಸದಸ್ಯರು ಇಂದ' : language === 'ta' ? 'உறுப்பினர் முதல்' : language === 'mr' ? 'सदस्य पासून' : 'Member since',
    totalSales: language === 'hi' ? 'कुल बिक्री' : language === 'te' ? 'మొత్తం అమ్మకాలు' : language === 'kn' ? 'ಒಟ್ಟು ಮಾರಾಟ' : language === 'ta' ? 'மொத்த விற்பனை' : language === 'mr' ? 'एकूण विक्री' : 'Total Sales',
    reviews: language === 'hi' ? 'समीक्षाएं' : language === 'te' ? 'సమీక్షలు' : language === 'kn' ? 'ವಿಮರ್ಶೆಗಳು' : language === 'ta' ? 'மதிப்புரைகள்' : language === 'mr' ? 'पुनरावलोकने' : 'reviews',
    traceOrigin: language === 'hi' ? 'उत्पत्ति ट्रेस करें' : language === 'te' ? 'మూలాన్ని గుర్తించండి' : language === 'kn' ? 'ಮೂಲವನ್ನು ಪತ್ತೆಹಚ್ಚಿ' : language === 'ta' ? 'தோற்றத்தைக் கண்டறியவும்' : language === 'mr' ? 'मूळ शोधा' : 'Trace Origin',
    submitOffer: language === 'hi' ? 'ऑफर जमा करें' : language === 'te' ? 'ఆఫర్ సమర్పించండి' : language === 'kn' ? 'ಆಫರ್ ಸಲ್ಲಿಸಿ' : language === 'ta' ? 'சலுகை சமர்ப்பிக்கவும்' : language === 'mr' ? 'ऑफर सबमिट करा' : 'Submit Offer',
    quantity: language === 'hi' ? 'मात्रा' : language === 'te' ? 'పరిమాణం' : language === 'kn' ? 'ಪ್ರಮಾಣ' : language === 'ta' ? 'அளவு' : language === 'mr' ? 'प्रमाण' : 'Quantity',
    yourPrice: language === 'hi' ? 'आपकी कीमत' : language === 'te' ? 'మీ ధర' : language === 'kn' ? 'ನಿಮ್ಮ ಬೆಲೆ' : language === 'ta' ? 'உங்கள் விலை' : language === 'mr' ? 'तुमची किंमत' : 'Your Price',
    message: language === 'hi' ? 'संदेश' : language === 'te' ? 'సందేశం' : language === 'kn' ? 'ಸಂದೇಶ' : language === 'ta' ? 'செய்தி' : language === 'mr' ? 'संदेश' : 'Message',
    call: language === 'hi' ? 'कॉल करें' : language === 'te' ? 'కాల్ చేయండి' : language === 'kn' ? 'ಕರೆ ಮಾಡಿ' : language === 'ta' ? 'அழைக்கவும்' : language === 'mr' ? 'कॉल करा' : 'Call',
    whatsapp: language === 'hi' ? 'व्हाट्सएप' : 'WhatsApp',
  };

  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: `Viewing ${millet?.name || 'millet'} listing from ${listing.farmerName}. Price is ${listing.pricePerKg} rupees per kilogram. ${listing.quantity} kilograms available. Quality grade is ${quality?.name || listing.qualityGrade}. ${listing.organic ? 'This is organic produce.' : ''} ${listing.verified ? 'Farmer is verified.' : ''}`,
      hi: `${listing.farmerName} की ${millet?.nameHi || 'बाजरा'} लिस्टिंग देख रहे हैं। कीमत ${listing.pricePerKg} रुपये प्रति किलो है। ${listing.quantity} किलोग्राम उपलब्ध है।`,
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  const handleSubmitOffer = async () => {
    setIsSubmittingOffer(true);
    try {
      await listingsApi.createOffer(listing.id, {
        qty_kg: offerQuantity,
        price_per_qtl: offerPrice * 100, // Convert kg to quintal
        message: offerMessage || undefined,
      });
      alert(`Offer submitted: ${offerQuantity}kg at ₹${offerPrice}/kg`);
      setShowMakeOffer(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit offer';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading listing...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6">
        {/* Back button */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {uiText.backToListings}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={speakPageContent}
              className="touch-target"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="relative aspect-[4/3]">
                <img
                  src={listing.images[selectedImage]}
                  alt={millet?.name || 'Millet'}
                  className="w-full h-full object-cover"
                />
                {listing.organic && (
                  <Badge className="absolute top-4 left-4 bg-accent text-white">
                    <Leaf className="w-3 h-3 mr-1" />
                    {uiText.organic}
                  </Badge>
                )}
                {listing.verified && (
                  <Badge className="absolute top-4 right-4 bg-primary text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    {uiText.verified}
                  </Badge>
                )}
              </div>
              {listing.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-3">{uiText.description}</h2>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>

            {/* Quality Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">{uiText.qualityDetails}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <Droplets className="w-6 h-6 mx-auto mb-2 text-sky-500" />
                  <p className="text-sm text-muted-foreground">{uiText.moisture}</p>
                  <p className="font-semibold">{listing.moistureContent}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <Scale className="w-6 h-6 mx-auto mb-2 text-terra-500" />
                  <p className="text-sm text-muted-foreground">{uiText.foreignMatter}</p>
                  <p className="font-semibold">{listing.foreignMatter}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">{uiText.harvestDate}</p>
                  <p className="font-semibold">{new Date(listing.harvestDate).toLocaleDateString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <Award className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">{uiText.certifications}</p>
                  <p className="font-semibold">{listing.certifications.length}</p>
                </div>
              </div>
              
              {listing.certifications.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="bg-accent/10">
                      <CheckCircle className="w-3 h-3 mr-1 text-accent" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Location & Delivery */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {uiText.location}
                  </h3>
                  <p className="text-muted-foreground">
                    {(listing.location as { village?: string }).village && `${(listing.location as { village?: string }).village}, `}
                    {(listing.location as { taluk?: string }).taluk && `${(listing.location as { taluk?: string }).taluk}, `}
                    {listing.location.district}, {listing.location.state}
                    {(listing.location as { pincode?: string }).pincode && <><br />PIN: {(listing.location as { pincode?: string }).pincode}</>}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    {uiText.delivery}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.deliveryOptions.map((option, idx) => (
                      <Badge key={idx} variant="secondary">{option}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{listing.paymentTerms}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing and Actions */}
          <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto space-y-6 scrollbar-thin lg:pb-6">
            {/* Pricing Card */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold">{millet?.name || listing.milletType}</h1>
                  <p className="text-muted-foreground">{millet?.nameHi}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {listing.variety} • {quality?.name || listing.qualityGrade}
                  </p>
                </div>
                <Badge className={quality?.color || 'bg-primary/10 text-primary'}>
                  {quality?.name || listing.qualityGrade}
                </Badge>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-primary">₹{listing.pricePerKg}</span>
                <span className="text-muted-foreground">/{uiText.perKg}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Package className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{uiText.available}</p>
                  <p className="font-semibold">{listing.quantity} kg</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Scale className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{uiText.minOrder}</p>
                  <p className="font-semibold">{listing.minOrderQty} kg</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Dialog open={showMakeOffer} onOpenChange={setShowMakeOffer}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 text-lg">
                      <IndianRupee className="w-5 h-5 mr-2" />
                      {uiText.makeOffer}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{uiText.makeOffer}</DialogTitle>
                      <DialogDescription>
                        {language === 'hi' ? 'अपना प्रस्ताव विवरण दर्ज करें' : 'Enter your offer details'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium">{uiText.quantity} (kg)</label>
                        <div className="mt-2">
                          <Slider
                            value={[offerQuantity]}
                            onValueChange={(v) => setOfferQuantity(v[0])}
                            min={listing.minOrderQty}
                            max={listing.quantity}
                            step={10}
                          />
                          <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                            <span>{listing.minOrderQty} kg</span>
                            <span className="font-semibold text-foreground">{offerQuantity} kg</span>
                            <span>{listing.quantity} kg</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">{uiText.yourPrice} (₹/kg)</label>
                        <Input
                          type="number"
                          value={offerPrice}
                          onChange={(e) => setOfferPrice(Number(e.target.value))}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === 'hi' ? `सूची मूल्य: ₹${listing.pricePerKg}/kg` : `Listed price: ₹${listing.pricePerKg}/kg`}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">{uiText.message}</label>
                        <Textarea
                          value={offerMessage}
                          onChange={(e) => setOfferMessage(e.target.value)}
                          placeholder={language === 'hi' ? 'किसान के लिए कोई संदेश (वैकल्पिक)' : 'Any message for the farmer (optional)'}
                          className="mt-2"
                        />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between text-sm">
                          <span>{language === 'hi' ? 'कुल राशि' : 'Total Amount'}</span>
                          <span className="font-bold">₹{(offerQuantity * offerPrice).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowMakeOffer(false)}>
                        {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                      </Button>
                      <Button onClick={handleSubmitOffer}>
                        {uiText.submitOffer}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showContact} onOpenChange={setShowContact}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12 text-lg">
                      <Phone className="w-5 h-5 mr-2" />
                      {uiText.contactFarmer}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{uiText.contactFarmer}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{listing.farmerName}</p>
                          <p className="text-muted-foreground">{listing.farmerLocation}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button asChild className="h-12">
                          <a href={`tel:${listing.farmerPhone}`}>
                            <Phone className="w-4 h-4 mr-2" />
                            {uiText.call}
                          </a>
                        </Button>
                        <Button asChild variant="outline" className="h-12 bg-green-50 hover:bg-green-100 border-green-200">
                          <a href={`https://wa.me/${listing.farmerPhone.replace(/\s+/g, '')}`} target="_blank">
                            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                            {uiText.whatsapp}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/trace/${listing.id}`}>
                    <QrCode className="w-4 h-4 mr-2" />
                    {uiText.traceOrigin}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Farmer Info Card */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4">{uiText.aboutFarmer}</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{listing.farmerName}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="font-medium">{listing.farmerRating}</span>
                    <span className="text-muted-foreground">({listing.farmerReviews} {uiText.reviews})</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                  <p className="text-muted-foreground">{uiText.memberSince}</p>
                  <p className="font-medium">{new Date(listing.farmerJoinedDate).getFullYear()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground mb-1" />
                  <p className="text-muted-foreground">{uiText.totalSales}</p>
                  <p className="font-medium">{listing.farmerTotalSales}</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-4">
                {language === 'hi' ? 'प्रोफ़ाइल देखें' : 'View Profile'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
