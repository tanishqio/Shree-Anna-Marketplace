"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Filter,
  MapPin,
  Star,
  ChevronRight,
  Heart,
  Grid,
  List,
  SlidersHorizontal,
  Loader2,
  Volume2,
  VolumeX,
  ShoppingCart,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { BuyNowModal } from '@/components/BuyNowModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { milletTypes, qualityGrades } from '@/lib/design-tokens';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useListings } from '@/lib/hooks/useData';

interface Listing {
  id: string;
  farmer_id: string;
  farmer_name?: string;
  farmer_rating?: number;
  farmer_location?: string;
  millet_type: string;
  quantity: number;
  price_per_kg: number;
  quality_grade: string;
  organic: boolean;
  verified?: boolean;
  images?: string[];
  created_at: string;
}

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
  photos?: string; // JSON string of URLs
}

function transformApiListing(apiListing: ApiListing): Listing {
  let images: string[] = [];
  try {
    if (apiListing.photos) {
      const parsed = JSON.parse(apiListing.photos);
      if (Array.isArray(parsed)) {
        images = parsed;
      } else if (typeof parsed === 'string') {
        images = [parsed];
      }
    }
  } catch (e) {
    // console.warn('Failed to parse photos', e);
  }

  return {
    id: apiListing.id,
    farmer_id: apiListing.owner_id || '',
    farmer_name: 'Farmer', // API doesn't return farmer name yet
    farmer_location: [apiListing.district, apiListing.state].filter(Boolean).join(', ') || 'India',
    millet_type: apiListing.crop,
    quantity: apiListing.qty_kg,
    price_per_kg: apiListing.min_price_per_qtl / 100, // Convert quintal to kg
    quality_grade: apiListing.quality_grade || 'standard',
    organic: apiListing.is_organic,
    verified: true,
    images: images.length > 0 ? images : undefined,
    created_at: apiListing.created_at,
  };
}

export default function MarketplacePage() {
  const [role, setRole] = useState('buyer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMillet, setSelectedMillet] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const handleBuyNow = (listing: Listing) => {
    const millet = getMillet(listing.millet_type);
    setSelectedListing({
      ...listing,
      millet_name: millet?.name || listing.millet_type,
    } as Listing & { millet_name: string });
    setBuyNowOpen(true);
  };

  // Page voice descriptions
  const pageVoice: Record<string, string> = {
    en: 'Welcome to the Millets Marketplace. Browse fresh millets directly from farmers. Use filters to search by millet type, quality, and price. Click on any listing to view details and make an offer.',
    hi: 'मिलेट मार्केटप्लेस में आपका स्वागत है। किसानों से सीधे ताजा मिलेट खरीदें। मिलेट प्रकार, गुणवत्ता और कीमत के अनुसार फ़िल्टर करें।',
    kn: 'ಸಿರಿಧಾನ್ಯ ಮಾರುಕಟ್ಟೆಗೆ ಸ್ವಾಗತ. ರೈತರಿಂದ ನೇರವಾಗಿ ತಾಜಾ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಖರೀದಿಸಿ. ಸಿರಿಧಾನ್ಯ ಪ್ರಕಾರ, ಗುಣಮಟ್ಟ ಮತ್ತು ಬೆಲೆಯ ಮೂಲಕ ಫಿಲ್ಟರ್ ಮಾಡಿ.',
    te: 'చిరుధాన్యాల మార్కెట్‌ప్లేస్‌కు స్వాగతం. రైతుల నుండి నేరుగా తాజా చిరుధాన్యాలను కొనుగోలు చేయండి. చిరుధాన్యం రకం, నాణ్యత మరియు ధర ద్వారా ఫిల్టర్ చేయండి.',
    ta: 'தினை சந்தைக்கு வரவேற்கிறோம். விவசாயிகளிடமிருந்து நேரடியாக புதிய தினைகளை வாங்குங்கள். தினை வகை, தரம் மற்றும் விலை மூலம் வடிகட்டவும்.',
    mr: 'ज्वारी मार्केटप्लेसमध्ये स्वागत आहे. शेतकऱ्यांकडून थेट ताजे ज्वारी खरेदी करा. ज्वारी प्रकार, गुणवत्ता आणि किमतीनुसार फिल्टर करा.',
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(pageVoice[language] || pageVoice.en);
    }
  };

  // Fetch listings from API - Processed Products for Buyers
  const { data: apiData, isLoading, error } = useListings({
    category: selectedMillet !== 'all' ? selectedMillet : undefined,
    search: searchQuery || undefined,
    is_processed: true,
  });

  // Transform API data
  const apiListings = apiData?.items?.map(item => transformApiListing(item as unknown as ApiListing)) || [];
  const listings = apiListings;

  const filteredListings = listings
    .filter((listing: Listing) => {
      const matchesSearch = (listing.farmer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (listing.farmer_location || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMillet = selectedMillet === 'all' || listing.millet_type === selectedMillet;
      const matchesQuality = selectedQuality === 'all' || listing.quality_grade === selectedQuality;
      const matchesPrice = listing.price_per_kg >= priceRange[0] && listing.price_per_kg <= priceRange[1];
      return matchesSearch && matchesMillet && matchesQuality && matchesPrice;
    })
    .sort((a: Listing, b: Listing) => {
      switch (sortBy) {
        case 'price-low': return a.price_per_kg - b.price_per_kg;
        case 'price-high': return b.price_per_kg - a.price_per_kg;
        case 'quantity': return b.quantity - a.quantity;
        case 'rating': return (b.farmer_rating || 0) - (a.farmer_rating || 0);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getMillet = (id: string) => milletTypes.find(m => m.id === id);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold">
                {language === 'hi' ? 'मिलेट मार्केटप्लेस 🌾' : language === 'te' ? 'చిరుధాన్యాల మార్కెట్ 🌾' : language === 'kn' ? 'ಸಿರಿಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ 🌾' : language === 'ta' ? 'தினை சந்தை 🌾' : language === 'mr' ? 'ज्वारी मार्केटप्लेस 🌾' : 'Millets Marketplace 🌾'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === 'hi' ? 'किसानों से सीधे ताजा बाजरा खरीदें' : language === 'te' ? 'రైతుల నుండి నేరుగా తాజా చిరుధాన్యాలను బ్రౌజ్ చేయండి' : language === 'kn' ? 'ರೈತರಿಂದ ನೇರವಾಗಿ ತಾಜಾ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' : language === 'ta' ? 'விவசாயிகளிடமிருந்து நேரடியாக புதிய தினைகளை உலாவுங்கள்' : language === 'mr' ? 'शेतकऱ्यांकडून थेट ताजे ज्वारी खरेदी करा' : 'Browse fresh millets directly from farmers'}
              </p>
            </div>
            <button
              onClick={handleSpeak}
              className={`p-3 rounded-full transition-all ${isSpeaking
                  ? 'bg-primary text-primary-foreground animate-pulse'
                  : 'bg-muted hover:bg-muted/80'
                }`}
              title={isSpeaking ? 'Stop' : 'Listen'}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={language === 'hi' ? 'किसान का नाम या स्थान खोजें...' : language === 'te' ? 'రైతు పేరు లేదా స్థానం ద్వారా శోధించండి...' : language === 'kn' ? 'ರೈತರ ಹೆಸರು ಅಥವಾ ಸ್ಥಳದ ಮೂಲಕ ಹುಡುಕಿ...' : language === 'ta' ? 'விவசாயி பெயர் அல்லது இடம் மூலம் தேடுங்கள்...' : language === 'mr' ? 'शेतकऱ्याचे नाव किंवा स्थान शोधा...' : 'Search by farmer name or location...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Quick filters */}
            <Select value={selectedMillet} onValueChange={setSelectedMillet}>
              <SelectTrigger className="w-full sm:w-[180px] h-12">
                <SelectValue placeholder="Millet Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Millets</SelectItem>
                {milletTypes.map((millet) => (
                  <SelectItem key={millet.id} value={millet.id}>
                    {millet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px] h-12">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="grid sm:grid-cols-3 gap-6">
                {/* Quality Grade */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quality Grade</label>
                  <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {qualityGrades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}/kg
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-3"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `Showing ${filteredListings.length} listings`}
          </p>
          {error && (
            <p className="text-sm text-amber-600">
              Using offline data (API unavailable)
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading listings...</span>
          </div>
        )}

        {/* Listings Grid/List */}
        {!isLoading && (
          <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredListings.map((listing: Listing, idx: number) => {
              const millet = getMillet(listing.millet_type);
              const isFavorite = favorites.includes(listing.id);
              const image = listing.images?.[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';

              if (viewMode === 'list') {
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative w-32 h-32 shrink-0">
                      <img
                        src={image}
                        alt={millet?.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {listing.organic && (
                        <Badge className="absolute top-2 left-2 bg-accent text-white text-xs">Organic</Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{millet?.name}</h3>
                          <p className="text-sm text-muted-foreground">{millet?.nameHi}</p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(listing.id)}
                          className={`p-2 rounded-full ${isFavorite ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                        >
                          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">👨‍🌾</div>
                        <span className="text-sm">{listing.farmer_name || 'Farmer'}</span>
                        <span className="text-muted-foreground">•</span>
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{listing.farmer_location || 'India'}</span>
                        <Star className="w-4 h-4 text-primary fill-primary ml-2" />
                        <span className="text-sm">{listing.farmer_rating || 4.5}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-2xl font-bold text-primary">₹{listing.price_per_kg}</span>
                          <span className="text-muted-foreground">/kg</span>
                          <span className="text-sm text-muted-foreground ml-4">{listing.quantity} kg available</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleBuyNow(listing)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {language === 'hi' ? 'खरीदें' : 'Buy'}
                          </Button>
                          <Button asChild>
                            <Link href={`/buyer/listing/${listing.id}`}>
                              {language === 'hi' ? 'देखें' : 'View'} <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={image}
                      alt={millet?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFavorite ? 'bg-destructive text-white' : 'bg-white/80 text-muted-foreground hover:text-destructive'
                        }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {listing.organic && (
                        <Badge className="bg-accent text-white">Organic</Badge>
                      )}
                      {listing.verified && (
                        <Badge variant="secondary" className="bg-white/90">Verified</Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Millet info */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{millet?.name || listing.millet_type}</h3>
                        <p className="text-sm text-muted-foreground">{millet?.nameHi}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {listing.quality_grade}
                      </Badge>
                    </div>

                    {/* Farmer info */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm">👨‍🌾</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{listing.farmer_name || 'Farmer'}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{listing.farmer_location || 'India'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-sm font-medium">{listing.farmer_rating || 4.5}</span>
                      </div>
                    </div>

                    {/* Price and quantity */}
                    <div className="flex items-end justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-2xl font-bold text-primary">₹{listing.price_per_kg}</p>
                        <p className="text-xs text-muted-foreground">per kg</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{listing.quantity} kg</p>
                        <p className="text-xs text-muted-foreground">available</p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1 h-12"
                        onClick={() => handleBuyNow(listing)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {language === 'hi' ? 'खरीदें' : 'Buy Now'}
                      </Button>
                      <Button asChild className="flex-1 h-12">
                        <Link href={`/buyer/listing/${listing.id}`}>
                          {language === 'hi' ? 'देखें' : 'View'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🌾</span>
            </div>
            <h3 className="text-lg font-medium mb-2">No listings found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </main>

      {/* Buy Now Modal */}
      <BuyNowModal
        open={buyNowOpen}
        onOpenChange={setBuyNowOpen}
        listing={selectedListing ? {
          id: selectedListing.id,
          millet_type: selectedListing.millet_type,
          millet_name: getMillet(selectedListing.millet_type)?.name,
          quantity: selectedListing.quantity,
          price_per_kg: selectedListing.price_per_kg,
          farmer_name: selectedListing.farmer_name,
          farmer_location: selectedListing.farmer_location,
        } : null}
        language={language}
      />
    </div>
  );
}
