"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Search,
    MapPin,
    Star,
    ChevronRight,
    Heart,
    Grid,
    List,
    Loader2,
    ShoppingCart,
    SlidersHorizontal,
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

export default function ProcessorMarketplacePage() {
    const [role, setRole] = useState('processor');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMillet, setSelectedMillet] = useState<string>('all');
    const [selectedQuality, setSelectedQuality] = useState<string>('all');
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [buyNowOpen, setBuyNowOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const { language } = useLanguage();
    const [showFilters, setShowFilters] = useState(false);

    // Fetch listings from API - Only Raw Materials (is_processed=false)
    const { data: apiData, isLoading, error } = useListings({
        category: selectedMillet !== 'all' ? selectedMillet : undefined,
        search: searchQuery || undefined,
        is_processed: false,
        owner_type: 'farmer' // Explicitly fetch from farmers
    });

    const handleBuyNow = (listing: Listing) => {
        const millet = getMillet(listing.millet_type);
        setSelectedListing({
            ...listing,
            millet_name: millet?.name || listing.millet_type,
        } as Listing & { millet_name: string });
        setBuyNowOpen(true);
    };

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
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold">
                            Raw Material Marketplace 🌽
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Source high-quality raw millets directly from farmers for processing
                        </p>
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
                                placeholder="Search by farmer name or location..."
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

                            return (
                                <motion.div
                                    key={listing.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group ${viewMode === 'list' ? 'flex' : ''}`}
                                >
                                    {viewMode === 'list' ? (
                                        <>
                                            <div className="relative w-48 h-full shrink-0">
                                                <img
                                                    src={image}
                                                    alt={millet?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{millet?.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{millet?.nameHi}</p>
                                                    </div>
                                                    <Button variant="outline" onClick={() => handleBuyNow(listing)}>
                                                        <ShoppingCart className="w-4 h-4 mr-2" /> Buy
                                                    </Button>
                                                </div>
                                                {/* More list view details here if needed */}
                                                <div className="mt-2 flex items-center gap-4">
                                                    <span className="font-bold text-lg">₹{listing.price_per_kg}/kg</span>
                                                    <span className="text-sm text-muted-foreground">{listing.quantity} kg available</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Grid view content */}
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
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{millet?.name || listing.millet_type}</h3>
                                                        <p className="text-sm text-muted-foreground">{millet?.nameHi}</p>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize">
                                                        {listing.quality_grade}
                                                    </Badge>
                                                </div>

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
                                                </div>

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

                                                <div className="flex gap-2 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 h-12"
                                                        onClick={() => handleBuyNow(listing)}
                                                    >
                                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                                        Buy
                                                    </Button>
                                                    <Button asChild className="flex-1 h-12">
                                                        <Link href={`/buyer/listing/${listing.id}`}>
                                                            View
                                                            <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {filteredListings.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">No listings found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                    </div>
                )}
            </main>

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
