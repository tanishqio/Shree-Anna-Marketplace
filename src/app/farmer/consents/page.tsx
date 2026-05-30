"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  ArrowLeft,
  Phone,
  User,
  Shield,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface VoiceConsent {
  id: string;
  type: 'offer_accept' | 'listing_create' | 'proxy_consent' | 'kyc_verify' | 'payment_confirm';
  title: string;
  titleHi: string;
  description: string;
  audioUrl: string;
  duration: number;
  timestamp: Date;
  otpVerified: boolean;
  otpCode?: string;
  proxyInfo?: {
    name: string;
    phone: string;
    relationship: string;
  };
  relatedOrder?: string;
  amount?: number;
  status: 'verified' | 'pending' | 'expired';
}

const mockConsents: VoiceConsent[] = [
  {
    id: 'VC-001',
    type: 'offer_accept',
    title: 'Offer Acceptance',
    titleHi: 'प्रस्ताव स्वीकृति',
    description: 'Accepted offer from Organic Foods Ltd. for 300kg Ragi at ₹48/kg',
    audioUrl: '#',
    duration: 8,
    timestamp: new Date(Date.now() - 86400000),
    otpVerified: true,
    otpCode: '847291',
    relatedOrder: 'ORD-2024-001',
    amount: 14400,
    status: 'verified',
  },
  {
    id: 'VC-002',
    type: 'listing_create',
    title: 'Listing Creation',
    titleHi: 'लिस्टिंग निर्माण',
    description: 'Created new listing for 200kg Pearl Millet (Bajra)',
    audioUrl: '#',
    duration: 12,
    timestamp: new Date(Date.now() - 172800000),
    otpVerified: true,
    otpCode: '563842',
    status: 'verified',
  },
  {
    id: 'VC-003',
    type: 'proxy_consent',
    title: 'Proxy Consent',
    titleHi: 'प्रॉक्सी सहमति',
    description: 'Authorized FPO staff to handle listing on behalf',
    audioUrl: '#',
    duration: 15,
    timestamp: new Date(Date.now() - 259200000),
    otpVerified: true,
    otpCode: '192736',
    proxyInfo: {
      name: 'Venkat Kumar',
      phone: '+91 87654 32109',
      relationship: 'FPO Collection Staff',
    },
    status: 'verified',
  },
  {
    id: 'VC-004',
    type: 'payment_confirm',
    title: 'Payment Confirmation',
    titleHi: 'भुगतान पुष्टि',
    description: 'Confirmed receipt of payment ₹8,250 for Foxtail Millet',
    audioUrl: '#',
    duration: 6,
    timestamp: new Date(Date.now() - 345600000),
    otpVerified: true,
    otpCode: '472819',
    relatedOrder: 'ORD-2024-003',
    amount: 8250,
    status: 'verified',
  },
  {
    id: 'VC-005',
    type: 'kyc_verify',
    title: 'KYC Verification',
    titleHi: 'केवाईसी सत्यापन',
    description: 'Voice verification for identity confirmation',
    audioUrl: '#',
    duration: 20,
    timestamp: new Date(Date.now() - 604800000),
    otpVerified: true,
    otpCode: '938472',
    status: 'verified',
  },
  {
    id: 'VC-006',
    type: 'offer_accept',
    title: 'Offer Acceptance',
    titleHi: 'प्रस्ताव स्वीकृति',
    description: 'Pending verification for offer acceptance',
    audioUrl: '#',
    duration: 10,
    timestamp: new Date(Date.now() - 3600000),
    otpVerified: false,
    status: 'pending',
  },
];

const consentTypeConfig = {
  offer_accept: {
    label: 'Offer Accepted',
    labelHi: 'प्रस्ताव स्वीकार',
    color: 'bg-accent/10 text-accent border-accent/20',
    icon: CheckCircle,
  },
  listing_create: {
    label: 'Listing Created',
    labelHi: 'लिस्टिंग बनाई',
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: FileText,
  },
  proxy_consent: {
    label: 'Proxy Consent',
    labelHi: 'प्रॉक्सी सहमति',
    color: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    icon: User,
  },
  kyc_verify: {
    label: 'KYC Verification',
    labelHi: 'केवाईसी सत्यापन',
    color: 'bg-terra-500/10 text-terra-600 border-terra-500/20',
    icon: Shield,
  },
  payment_confirm: {
    label: 'Payment Confirmed',
    labelHi: 'भुगतान पुष्टि',
    color: 'bg-accent/10 text-accent border-accent/20',
    icon: CheckCircle,
  },
};

export default function ConsentHistoryPage() {
  const router = useRouter();
  const [role, setRole] = useState('farmer');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Language and TTS support
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();
  
  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: 'Voice Consent History. View all your recorded voice consents for offer acceptances, listing creations, proxy consents, and payment confirmations. All consents are verified with OTP for your security.',
      hi: 'वॉइस कंसेंट हिस्ट्री। ऑफर स्वीकृति, लिस्टिंग निर्माण, प्रॉक्सी सहमति और भुगतान पुष्टि के लिए अपनी सभी रिकॉर्ड की गई आवाज़ सहमतियाँ देखें। आपकी सुरक्षा के लिए सभी सहमतियाँ ओटीपी से सत्यापित हैं।',
      kn: 'ವಾಯ್ಸ್ ಕನ್ಸೆಂಟ್ ಹಿಸ್ಟರಿ. ಆಫರ್ ಸ್ವೀಕೃತಿ, ಲಿಸ್ಟಿಂಗ್ ರಚನೆ, ಪ್ರಾಕ್ಸಿ ಒಪ್ಪಿಗೆ ಮತ್ತು ಪಾವತಿ ದೃಢೀಕರಣಗಳಿಗಾಗಿ ನಿಮ್ಮ ಎಲ್ಲಾ ರೆಕಾರ್ಡ್ ಮಾಡಿದ ವಾಯ್ಸ್ ಕನ್ಸೆಂಟ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ. ನಿಮ್ಮ ಭದ್ರತೆಗಾಗಿ ಎಲ್ಲಾ ಒಪ್ಪಿಗೆಗಳನ್ನು ಒಟಿಪಿಯಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
      te: 'వాయిస్ కన్సెంట్ హిస్టరీ. ఆఫర్ స్వీకరణ, లిస్టింగ్ సృష్టి, ప్రాక్సీ సమ్మతి మరియు చెల్లింపు నిర్ధారణల కోసం మీ అన్ని రికార్డ్ చేసిన వాయిస్ సమ్మతులను చూడండి. మీ భద్రత కోసం అన్ని సమ్మతులు OTPతో ధృవీకరించబడ్డాయి.',
      ta: 'குரல் ஒப்புதல் வரலாறு. சலுகை ஏற்றுக்கொள்ளல், பட்டியல் உருவாக்கம், ப்ராக்ஸி ஒப்புதல் மற்றும் கட்டண உறுதிப்படுத்தல்களுக்கான உங்கள் அனைத்து பதிவுசெய்யப்பட்ட குரல் ஒப்புதல்களையும் பார்க்கவும். உங்கள் பாதுகாப்பிற்காக அனைத்து ஒப்புதல்களும் OTPயுடன் சரிபார்க்கப்படுகின்றன.',
      mr: 'व्हॉइस कन्सेंट हिस्ट्री। ऑफर स्वीकृती, लिस्टिंग निर्मिती, प्रॉक्सी संमती आणि पेमेंट पुष्टीकरणासाठी तुमच्या सर्व रेकॉर्ड केलेल्या व्हॉइस संमती पहा। तुमच्या सुरक्षिततेसाठी सर्व संमती ओटीपीने सत्यापित केल्या आहेत.',
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
      // In real app: audioRef.current?.pause();
    } else {
      setPlayingId(id);
      // In real app: audioRef.current?.play();
    }
  };

  const filteredConsents = mockConsents.filter(c => {
    if (typeFilter === 'all') return true;
    return c.type === typeFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-accent/10 text-accent border-accent/20"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'pending':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'expired':
        return <Badge className="bg-muted text-muted-foreground"><AlertCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              Voice Consent History
            </h1>
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
          <p className="text-muted-foreground mt-2">
            आपकी आवाज़ सहमति का रिकॉर्ड • Your voice consent records
          </p>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 sm:p-6 mb-6 border border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Your Consent is Protected</h3>
              <p className="text-sm text-muted-foreground">
                All voice consents are securely stored and can be used as legal proof. 
                Each consent is verified with OTP for authenticity.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredConsents.length} consent records
          </p>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="offer_accept">Offer Accepted</SelectItem>
              <SelectItem value="listing_create">Listing Created</SelectItem>
              <SelectItem value="proxy_consent">Proxy Consent</SelectItem>
              <SelectItem value="payment_confirm">Payment Confirmed</SelectItem>
              <SelectItem value="kyc_verify">KYC Verification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Consent Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredConsents.map((consent, idx) => {
              const config = consentTypeConfig[consent.type];
              const TypeIcon = config.icon;
              const isExpanded = expandedId === consent.id;

              return (
                <motion.div
                  key={consent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  {/* Main Content */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.color.split(' ')[0]}`}>
                        <TypeIcon className={`w-6 h-6 ${config.color.split(' ')[1]}`} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={config.color}>{config.label}</Badge>
                          {getStatusBadge(consent.status)}
                        </div>
                        <p className="font-medium mb-1">{consent.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {consent.timestamp.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {consent.duration}s
                          </span>
                          {consent.amount && (
                            <span className="font-medium text-accent">
                              ₹{consent.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Audio Player */}
                    <div className="mt-4 p-3 rounded-xl bg-muted/50 flex items-center gap-3">
                      <Button
                        variant={playingId === consent.id ? "default" : "outline"}
                        size="icon"
                        className="shrink-0 h-10 w-10 rounded-full"
                        onClick={() => togglePlay(consent.id)}
                      >
                        {playingId === consent.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: playingId === consent.id ? '100%' : '0%' }}
                            transition={{ duration: consent.duration }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{playingId === consent.id ? '0:00' : '0:00'}</span>
                          <span>0:{consent.duration.toString().padStart(2, '0')}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : consent.id)}
                      className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View Details
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-border pt-4 space-y-4">
                          {/* OTP Verification */}
                          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-4 h-4 text-accent" />
                              <span className="font-medium text-sm">OTP Verification</span>
                            </div>
                            {consent.otpVerified ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Verified with OTP:</span>
                                <span className="font-mono font-medium tracking-wider bg-white px-2 py-0.5 rounded">
                                  {consent.otpCode}
                                </span>
                                <CheckCircle className="w-4 h-4 text-accent" />
                              </div>
                            ) : (
                              <p className="text-sm text-primary">Awaiting OTP verification</p>
                            )}
                          </div>

                          {/* Proxy Info */}
                          {consent.proxyInfo && (
                            <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-sky-600" />
                                <span className="font-medium text-sm">Proxy Authorization</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Name:</span>
                                  <span className="ml-2 font-medium">{consent.proxyInfo.name}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Role:</span>
                                  <span className="ml-2">{consent.proxyInfo.relationship}</span>
                                </div>
                                <div className="col-span-2 flex items-center">
                                  <span className="text-muted-foreground">Phone:</span>
                                  <span className="ml-2">{consent.proxyInfo.phone}</span>
                                  <Button variant="ghost" size="sm" className="ml-2 h-6 px-2">
                                    <Phone className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Recorded at:</span>
                            <span className="font-medium">
                              {consent.timestamp.toLocaleString('en-IN', {
                                dateStyle: 'full',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>

                          {/* Related Order */}
                          {consent.relatedOrder && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Related Order:</span>
                              <Button variant="link" className="h-auto p-0 font-medium">
                                {consent.relatedOrder}
                              </Button>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Download className="w-4 h-4 mr-2" />
                              Download Audio
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <FileText className="w-4 h-4 mr-2" />
                              Get Certificate
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredConsents.length === 0 && (
            <div className="text-center py-12">
              <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">No consent records</h3>
              <p className="text-muted-foreground">
                Your voice consent recordings will appear here
              </p>
            </div>
          )}
        </div>

        {/* Help Note */}
        <div className="mt-8 p-4 rounded-xl bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            Need help with consent records? Call our helpline
          </p>
          <Button variant="link" className="text-primary">
            <Phone className="w-4 h-4 mr-2" />
            1800-XXX-XXXX (Toll Free)
          </Button>
        </div>
      </main>
    </div>
  );
}
