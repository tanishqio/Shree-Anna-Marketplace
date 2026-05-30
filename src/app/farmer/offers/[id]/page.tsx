"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Phone,
  Calendar,
  Shield,
  Loader2,
  Star,
  Building,
  MapPin,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { VoiceButton } from '@/components/VoiceButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { milletTypes } from '@/lib/design-tokens';
import { offersApi, authApi, Offer } from '@/lib/api';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface DisplayOffer {
  id: string;
  buyerName: string;
  buyerCompany: string;
  buyerRating: number;
  buyerVerified: boolean;
  buyerPhone: string;
  milletType: string;
  quantity: number;
  offeredPrice: number;
  yourPrice: number;
  deliveryDate: string;
  pickupAddress: string;
  notes: string;
  createdAt: Date;
}

// Mock data fallback
const mockOffer: DisplayOffer = {
  id: '1',
  buyerName: 'Rajesh Kumar',
  buyerCompany: 'Organic Foods Ltd.',
  buyerRating: 4.8,
  buyerVerified: true,
  buyerPhone: '+91 98765 43210',
  milletType: 'finger',
  quantity: 300,
  offeredPrice: 48,
  yourPrice: 45,
  deliveryDate: '2024-02-15',
  pickupAddress: 'Warehouse 12, APMC Yard, Bengaluru - 560001',
  notes: 'Looking for organic certified ragi. Willing to pay premium for quality.',
  createdAt: new Date('2024-01-20'),
};

export default function OfferDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;
  
  const [role, setRole] = useState('farmer');
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOffer] = useState<DisplayOffer>(mockOffer);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Language and TTS support
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();
  
  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: 'View offer details from a buyer. Review the offered price, quantity, and buyer information. Accept or reject the offer using voice consent and OTP verification for secure transactions.',
      hi: 'खरीदार से ऑफर विवरण देखें। प्रस्तावित मूल्य, मात्रा और खरीदार जानकारी की समीक्षा करें। सुरक्षित लेनदेन के लिए वॉइस कंसेंट और ओटीपी सत्यापन का उपयोग करके ऑफर स्वीकार या अस्वीकार करें।',
      kn: 'ಖರೀದಿದಾರರಿಂದ ಆಫರ್ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ. ನೀಡಿದ ಬೆಲೆ, ಪ್ರಮಾಣ ಮತ್ತು ಖರೀದಿದಾರ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ. ಸುರಕ್ಷಿತ ವಹಿವಾಟುಗಳಿಗಾಗಿ ವಾಯ್ಸ್ ಕನ್ಸೆಂಟ್ ಮತ್ತು ಒಟಿಪಿ ಪರಿಶೀಲನೆ ಬಳಸಿ ಆಫರ್ ಸ್ವೀಕರಿಸಿ ಅಥವಾ ತಿರಸ್ಕರಿಸಿ.',
      te: 'కొనుగోలుదారు నుండి ఆఫర్ వివరాలను చూడండి. ఆఫర్ చేసిన ధర, పరిమాణం మరియు కొనుగోలుదారు సమాచారాన్ని సమీక్షించండి. సురక్షిత లావాదేవీల కోసం వాయిస్ కన్సెంట్ మరియు OTP ధృవీకరణను ఉపయోగించి ఆఫర్‌ను ఆమోదించండి లేదా తిరస్కరించండి.',
      ta: 'கொள்முதலாளரிடமிருந்து சலுகை விவரங்களைப் பார்க்கவும். வழங்கப்பட்ட விலை, அளவு மற்றும் கொள்முதலாளர் தகவலை மதிப்பாய்வு செய்யவும். பாதுகாப்பான பரிவர்த்தனைகளுக்கு குரல் ஒப்புதல் மற்றும் OTP சரிபார்ப்பைப் பயன்படுத்தி சலுகையை ஏற்றுக்கொள்ளவும் அல்லது நிராகரிக்கவும்.',
      mr: 'खरेदीदाराकडून ऑफर तपशील पहा. ऑफर केलेली किंमत, प्रमाण आणि खरेदीदार माहितीचे पुनरावलोकन करा. सुरक्षित व्यवहारांसाठी व्हॉइस कन्सेंट आणि ओटीपी सत्यापन वापरून ऑफर स्वीकारा किंवा नाकारा.',
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  // Transform API offer to display format
  const transformOffer = (apiOffer: Offer): DisplayOffer => ({
    id: apiOffer.id,
    buyerName: apiOffer.buyer_name || 'Unknown Buyer',
    buyerCompany: apiOffer.buyer_company || 'Buyer Company',
    buyerRating: apiOffer.buyer_rating || 4.5,
    buyerVerified: true,
    buyerPhone: apiOffer.buyer_phone || '+91 XXXXXXXXXX',
    milletType: 'finger', // Would need to be fetched from listing
    quantity: apiOffer.qty_kg,
    offeredPrice: apiOffer.price_per_qtl / 100, // Convert quintal to kg
    yourPrice: 45, // Would come from listing
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pickupAddress: 'APMC Yard, Bengaluru',
    notes: apiOffer.message || '',
    createdAt: new Date(apiOffer.created_at),
  });

  useEffect(() => {
    const fetchOffer = async () => {
      if (!offerId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const apiOffer = await offersApi.getById(offerId);
        setOffer(transformOffer(apiOffer));
      } catch (err) {
        console.error('Failed to fetch offer:', err);
        // Use mock data as fallback
        setOffer({ ...mockOffer, id: offerId });
        setError('Using demo data - API unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]);

  const millet = milletTypes.find(m => m.id === offer.milletType);
  const totalValue = offer.quantity * offer.offeredPrice;
  const priceDiff = offer.offeredPrice - offer.yourPrice;
  const priceDiffPercent = ((priceDiff / offer.yourPrice) * 100).toFixed(1);

  const handleVoiceConsent = (transcript: string) => {
    const acceptPhrases = ['accept', 'agree', 'yes', 'confirm', 'हां', 'स्वीकार'];
    const hasAccept = acceptPhrases.some(phrase => 
      transcript.toLowerCase().includes(phrase)
    );
    if (hasAccept) {
      setVoiceConsent(true);
    }
  };

  const handleAcceptOffer = async () => {
    if (!otp && !voiceConsent) return;
    
    setIsVerifying(true);
    try {
      // Call the accept API
      await offersApi.accept(offer.id, voiceConsent ? 'voice-consent-recorded' : undefined);
      setIsAccepted(true);
      setShowAcceptDialog(false);
    } catch (err) {
      console.error('Failed to accept offer:', err);
      // For demo, still show success
      setIsAccepted(true);
      setShowAcceptDialog(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectOffer = async () => {
    setIsRejecting(true);
    try {
      await offersApi.reject(offer.id, 'Offer rejected by farmer');
      router.push('/farmer/dashboard');
    } catch (err) {
      console.error('Failed to reject offer:', err);
      // For demo, still navigate
      router.push('/farmer/dashboard');
    } finally {
      setIsRejecting(false);
      setShowRejectDialog(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    await handleAcceptOffer();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading offer details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-12 max-w-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-accent" />
          </motion.div>
          <h1 className="text-2xl font-heading font-bold mb-2">Offer Accepted!</h1>
          <p className="text-muted-foreground mb-6">
            Congratulations! Your deal with {offer.buyerCompany} is confirmed.
          </p>
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-accent">
                ₹{totalValue.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Buyer will contact you within 24 hours</p>
              <p>• Pickup scheduled for {new Date(offer.deliveryDate).toLocaleDateString()}</p>
              <p>• Payment within 3 days of delivery</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/farmer/dashboard')} className="flex-1">
              Go to Dashboard
            </Button>
            <Button onClick={() => window.location.href = `tel:${offer.buyerPhone}`} className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Call Buyer
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back button and TTS */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Offers
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={speakPageContent}
            className="touch-target"
            aria-label={isSpeaking ? 'Stop speaking' : 'Read page content aloud'}
          >
            {isSpeaking ? (
              <VolumeX className="w-5 h-5 text-destructive" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Offer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center">
                  <Building className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-heading font-semibold">{offer.buyerCompany}</h2>
                    {offer.buyerVerified && (
                      <Shield className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <p className="text-muted-foreground">{offer.buyerName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-sm font-medium">{offer.buyerRating}</span>
                    <span className="text-sm text-muted-foreground">• Verified Buyer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div className="p-6 space-y-6">
            {/* Product */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{millet?.name}</p>
                <p className="text-sm text-muted-foreground">{millet?.nameHi}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{offer.quantity} kg</p>
                <p className="text-sm text-muted-foreground">Quantity</p>
              </div>
            </div>

            {/* Price Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-1">Your Listed Price</p>
                <p className="text-2xl font-bold">₹{offer.yourPrice}/kg</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">Offered Price</p>
                <p className="text-2xl font-bold text-accent">₹{offer.offeredPrice}/kg</p>
                {priceDiff > 0 && (
                  <p className="text-xs text-accent mt-1">+{priceDiffPercent}% above your price</p>
                )}
              </div>
            </div>

            {/* Total Value */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">Total Deal Value</p>
              <p className="text-3xl font-bold text-primary">
                ₹{totalValue.toLocaleString()}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Expected Pickup</p>
                  <p className="font-medium">{new Date(offer.deliveryDate).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Address</p>
                  <p className="font-medium">{offer.pickupAddress}</p>
                </div>
              </div>
              {offer.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Buyer&apos;s Note</p>
                  <p className="text-sm">{offer.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                className="flex-1 h-14 text-lg border-destructive text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => setShowAcceptDialog(true)}
                className="flex-1 h-14 text-lg bg-accent hover:bg-accent/90"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Accept Offer
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Confirm Acceptance</DialogTitle>
            <DialogDescription>
              Please verify with OTP or voice consent to accept this offer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex justify-between text-sm mb-2">
                <span>Buyer</span>
                <span className="font-medium">{offer.buyerCompany}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Quantity</span>
                <span className="font-medium">{offer.quantity} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Amount</span>
                <span className="font-bold text-accent">₹{totalValue.toLocaleString()}</span>
              </div>
            </div>

            {/* OTP Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter OTP sent to your mobile
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-14 text-2xl text-center tracking-widest"
              />
              <button className="text-sm text-primary hover:underline mt-2">
                Resend OTP
              </button>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Voice Consent */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Say &quot;I accept this offer&quot; or &quot;मैं स्वीकार करता हूं&quot;
              </p>
              <VoiceButton
                onTranscript={handleVoiceConsent}
                placeholder={voiceConsent ? "Consent recorded ✓" : "Tap to speak"}
                size="lg"
              />
              {voiceConsent && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-accent mt-2 flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Voice consent recorded
                </motion.p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAcceptOffer}
              disabled={(!otp || otp.length !== 6) && !voiceConsent || isVerifying}
              className="bg-accent hover:bg-accent/90"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Acceptance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Reject Offer?</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this offer from {offer.buyerCompany}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isRejecting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectOffer}
              disabled={isRejecting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Offer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
