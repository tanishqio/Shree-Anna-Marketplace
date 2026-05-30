"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ShieldCheck,
    Search,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Clock,
    ChevronLeft,
    Loader2,
    User,
    Eye,
    Filter,
    Calendar,
    RefreshCw,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { kscApi } from '@/lib/api';

interface PendingFarmer {
    id: string;
    name: string;
    phone: string;
    district: string | null;
    created_at: string;
    farmer_profiles?: any[];
}

export default function VerificationQueue() {
    const [role, setRole] = useState('ksc');
    const { user, isLoading: authLoading } = useAuth();
    const { language } = useLanguage();

    const [farmers, setFarmers] = useState<PendingFarmer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Rejection modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState<PendingFarmer | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Details modal state
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [farmerDetails, setFarmerDetails] = useState<PendingFarmer | null>(null);

    const fetchFarmers = async () => {
        setIsLoading(true);
        try {
            const params: { district?: string } = {};
            if (filterDistrict !== 'all') params.district = filterDistrict;

            const result = await kscApi.getPendingFarmers(params);
            setFarmers(result.farmers || []);
        } catch (error) {
            console.error('Error fetching farmers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchFarmers();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, filterDistrict]);

    const handleVerify = async (farmer: PendingFarmer) => {
        if (!user) return;
        setIsProcessing(true);
        try {
            await kscApi.verifyFarmer(farmer.id, user.id);
            setFarmers(prev => prev.filter(f => f.id !== farmer.id));
        } catch (error) {
            console.error('Error verifying farmer:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const openRejectModal = (farmer: PendingFarmer) => {
        setSelectedFarmer(farmer);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!user || !selectedFarmer || !rejectionReason.trim()) return;
        setIsProcessing(true);
        try {
            await kscApi.rejectFarmer(selectedFarmer.id, user.id, rejectionReason);
            setFarmers(prev => prev.filter(f => f.id !== selectedFarmer.id));
            setRejectModalOpen(false);
            setSelectedFarmer(null);
        } catch (error) {
            console.error('Error rejecting farmer:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const openDetailsModal = (farmer: PendingFarmer) => {
        setFarmerDetails(farmer);
        setDetailsModalOpen(true);
    };

    // Filter and sort farmers
    const filteredFarmers = farmers
        .filter(f => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return f.name?.toLowerCase().includes(query) || f.phone?.includes(query);
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            return 0;
        });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation currentRole={role} onRoleChange={setRole} />
                <main className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">
                            {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentRole={role} onRoleChange={setRole} />

            <main className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/ksc/dashboard">
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-2">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                                {language === 'hi' ? 'सत्यापन कतार' : 'Verification Queue'}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {language === 'hi'
                                    ? `${filteredFarmers.length} किसान सत्यापन की प्रतीक्षा कर रहे हैं`
                                    : `${filteredFarmers.length} farmers awaiting verification`}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={fetchFarmers} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {language === 'hi' ? 'रीफ्रेश' : 'Refresh'}
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-card rounded-2xl border border-border p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={language === 'hi' ? 'नाम या फ़ोन से खोजें...' : 'Search by name or phone...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                                <SelectTrigger className="w-[160px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="District" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{language === 'hi' ? 'सभी जिले' : 'All Districts'}</SelectItem>
                                    <SelectItem value="bangalore_urban">Bangalore Urban</SelectItem>
                                    <SelectItem value="tumkur">Tumkur</SelectItem>
                                    <SelectItem value="hassan">Hassan</SelectItem>
                                    <SelectItem value="mysore">Mysore</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">{language === 'hi' ? 'नवीनतम' : 'Newest'}</SelectItem>
                                    <SelectItem value="oldest">{language === 'hi' ? 'पुराना' : 'Oldest'}</SelectItem>
                                    <SelectItem value="name">{language === 'hi' ? 'नाम' : 'Name'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Farmers List */}
                <div className="space-y-4">
                    {filteredFarmers.length === 0 ? (
                        <div className="bg-card rounded-2xl border border-border p-12 text-center">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-accent" />
                            <h3 className="text-xl font-semibold mb-2">
                                {language === 'hi' ? 'कोई लंबित सत्यापन नहीं!' : 'No Pending Verifications!'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {language === 'hi'
                                    ? 'सभी किसान सत्यापित हैं। बढ़िया काम!'
                                    : 'All farmers have been verified. Great job!'}
                            </p>
                            <Button asChild>
                                <Link href="/ksc/register-farmer">
                                    {language === 'hi' ? 'नया किसान पंजीकृत करें' : 'Register New Farmer'}
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredFarmers.map((farmer, index) => (
                                <motion.div
                                    key={farmer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-card rounded-2xl border border-border p-4 sm:p-6"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Farmer Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-lg">{farmer.name || 'Unnamed Farmer'}</h3>
                                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {language === 'hi' ? 'लंबित' : 'Pending'}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-4 h-4" /> {farmer.phone}
                                                    </span>
                                                    {farmer.district && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" /> {farmer.district}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" /> {formatDate(farmer.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 ml-16 lg:ml-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDetailsModal(farmer)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                {language === 'hi' ? 'विवरण' : 'Details'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => openRejectModal(farmer)}
                                                disabled={isProcessing}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                {language === 'hi' ? 'अस्वीकार' : 'Reject'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-accent hover:bg-accent/90"
                                                onClick={() => handleVerify(farmer)}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                )}
                                                {language === 'hi' ? 'सत्यापित करें' : 'Verify'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </main>

            {/* Rejection Modal */}
            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-destructive" />
                            {language === 'hi' ? 'किसान अस्वीकार करें' : 'Reject Farmer'}
                        </DialogTitle>
                        <DialogDescription>
                            {language === 'hi'
                                ? `${selectedFarmer?.name} को अस्वीकार करने का कारण दर्ज करें`
                                : `Enter the reason for rejecting ${selectedFarmer?.name}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder={language === 'hi' ? 'अस्वीकृति का कारण...' : 'Reason for rejection...'}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectionReason.trim() || isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {language === 'hi' ? 'अस्वीकार करें' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
            <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            {language === 'hi' ? 'किसान विवरण' : 'Farmer Details'}
                        </DialogTitle>
                    </DialogHeader>
                    {farmerDetails && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{farmerDetails.name || 'Unnamed'}</h3>
                                    <p className="text-muted-foreground">{farmerDetails.phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-sm text-muted-foreground">{language === 'hi' ? 'जिला' : 'District'}</p>
                                    <p className="font-medium">{farmerDetails.district || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{language === 'hi' ? 'पंजीकरण तिथि' : 'Registration Date'}</p>
                                    <p className="font-medium">{formatDate(farmerDetails.created_at)}</p>
                                </div>
                            </div>

                            {farmerDetails.farmer_profiles && farmerDetails.farmer_profiles[0] && (
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{language === 'hi' ? 'गाँव' : 'Village'}</p>
                                        <p className="font-medium">{farmerDetails.farmer_profiles[0].village || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{language === 'hi' ? 'भूमि (एकड़)' : 'Land (acres)'}</p>
                                        <p className="font-medium">{farmerDetails.farmer_profiles[0].land_holding_acres || '-'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                            {language === 'hi' ? 'बंद करें' : 'Close'}
                        </Button>
                        <Button
                            className="bg-accent hover:bg-accent/90"
                            onClick={() => {
                                if (farmerDetails) handleVerify(farmerDetails);
                                setDetailsModalOpen(false);
                            }}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {language === 'hi' ? 'सत्यापित करें' : 'Verify'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
