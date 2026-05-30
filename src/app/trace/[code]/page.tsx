"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import {
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Building,
  Truck,
  Package,
  Leaf,
  Award,
  ExternalLink,
  Share2,
  Download,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { milletTypes } from '@/lib/design-tokens';
import { useTrace } from '@/lib/hooks/useData';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface TraceEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  actor: string;
  actorType: 'farmer' | 'fpo' | 'processor' | 'buyer';
  verified: boolean;
  icon: React.ElementType;
}

const mockTraceData = {
  batchCode: 'FPO-2024-001',
  milletType: 'finger',
  totalQuantity: 2500,
  origin: 'Tumkur, Karnataka',
  harvestDate: new Date('2024-01-10'),
  organic: true,
  certifications: ['FSSAI', 'Organic India'],
  currentStatus: 'delivered',
  farmers: [
    { name: 'Ramesh Kumar', quantity: 500, village: 'Tiptur' },
    { name: 'Lakshmi Devi', quantity: 400, village: 'Gubbi' },
    { name: 'Venkatesh', quantity: 350, village: 'Sira' },
    { name: 'Others', quantity: 1250, village: 'Multiple' },
  ],
};

const defaultTraceEvents: TraceEvent[] = [
  {
    id: '1',
    title: 'Harvested',
    description: 'Finger millet harvested from organic farms',
    location: 'Tiptur, Tumkur',
    timestamp: new Date('2024-01-10'),
    actor: 'Multiple Farmers',
    actorType: 'farmer',
    verified: true,
    icon: Leaf,
  },
  {
    id: '2',
    title: 'Collected at FPO',
    description: 'Aggregated produce from 12 farmers',
    location: 'Green Valley FPO, Tumkur',
    timestamp: new Date('2024-01-15'),
    actor: 'Green Valley FPO',
    actorType: 'fpo',
    verified: true,
    icon: Building,
  },
  {
    id: '3',
    title: 'Quality Tested',
    description: 'Passed quality checks - Grade A',
    location: 'Quality Lab, Tumkur',
    timestamp: new Date('2024-01-16'),
    actor: 'Quality Inspector',
    actorType: 'fpo',
    verified: true,
    icon: Award,
  },
  {
    id: '4',
    title: 'Processed & Packed',
    description: 'Cleaned, graded, and packed in 50kg bags',
    location: 'Processing Unit, Tumkur',
    timestamp: new Date('2024-01-18'),
    actor: 'Millet Processors Ltd.',
    actorType: 'processor',
    verified: true,
    icon: Package,
  },
  {
    id: '5',
    title: 'Dispatched',
    description: 'Shipped via road transport',
    location: 'Tumkur → Bengaluru',
    timestamp: new Date('2024-01-20'),
    actor: 'FastTrack Logistics',
    actorType: 'processor',
    verified: true,
    icon: Truck,
  },
  {
    id: '6',
    title: 'Delivered',
    description: 'Received by buyer',
    location: 'Organic Foods Ltd., Bengaluru',
    timestamp: new Date('2024-01-21'),
    actor: 'Organic Foods Ltd.',
    actorType: 'buyer',
    verified: true,
    icon: CheckCircle,
  },
];

const actorColors = {
  farmer: 'bg-accent/10 text-accent border-accent/30',
  fpo: 'bg-primary/10 text-primary border-primary/30',
  processor: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  buyer: 'bg-terra-500/10 text-terra-600 border-terra-500/30',
};

const iconMapping: Record<string, React.ElementType> = {
  'harvested': Leaf,
  'collected': Building,
  'quality': Award,
  'processed': Package,
  'dispatched': Truck,
  'delivered': CheckCircle,
};

export default function TracePage() {
  const params = useParams();
  const code = params.code as string;
  const [isSharing, setIsSharing] = useState(false);
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();

  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: 'Welcome to Product Traceability. Here you can view the complete journey of your millets from farm to table. Track harvesting, quality checks, processing, and delivery stages. Scan QR codes to verify product authenticity.',
      hi: 'उत्पाद ट्रेसेबिलिटी में आपका स्वागत है। यहाँ आप खेत से थाली तक अपने बाजरे की पूरी यात्रा देख सकते हैं। कटाई, गुणवत्ता जांच, प्रोसेसिंग और डिलीवरी चरणों को ट्रैक करें। उत्पाद की प्रामाणिकता सत्यापित करने के लिए क्यूआर कोड स्कैन करें।',
      kn: 'ಉತ್ಪನ್ನ ಟ್ರೇಸೆಬಿಲಿಟಿಗೆ ಸ್ವಾಗತ. ಇಲ್ಲಿ ನೀವು ಹೊಲದಿಂದ ತಟ್ಟೆಗೆ ನಿಮ್ಮ ಸಿರಿಧಾನ್ಯಗಳ ಸಂಪೂರ್ಣ ಪ್ರಯಾಣವನ್ನು ವೀಕ್ಷಿಸಬಹುದು. ಕೊಯ್ಲು, ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ, ಸಂಸ್ಕರಣೆ ಮತ್ತು ವಿತರಣಾ ಹಂತಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
      te: 'ఉత్పత్తి ట్రేసెబిలిటీకి స్వాగతం. ఇక్కడ మీరు పొలం నుండి ప్లేట్ వరకు మీ చిరుధాన్యాల పూర్తి ప్రయాణాన్ని చూడవచ్చు. పంటకోత, నాణ్యత తనిఖీలు, ప్రాసెసింగ్ మరియు డెలివరీ దశలను ట్రాక్ చేయండి.',
      ta: 'தயாரிப்பு தடமறிதலுக்கு வரவேற்கிறோம். இங்கே நீங்கள் வயல் முதல் தட்டு வரை உங்கள் சிறுதானியங்களின் முழுமையான பயணத்தைப் பார்க்கலாம். அறுவடை, தரச்சோதனை, பதப்படுத்தல் மற்றும் விநியோக நிலைகளைக் கண்காணிக்கவும்.',
      mr: 'उत्पादन ट्रेसेबिलिटीमध्ये आपले स्वागत आहे. येथे तुम्ही शेतापासून ताटापर्यंत तुमच्या ज्वारी-बाजरीचा संपूर्ण प्रवास पाहू शकता. कापणी, गुणवत्ता तपासणी, प्रक्रिया आणि वितरण टप्पे ट्रॅक करा.',
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  // Fetch trace data from API
  const { data: apiTraceData, isLoading, error } = useTrace(code);

  // Use API data or mock
  const traceData = useMemo(() => {
    if (apiTraceData) {
      return {
        batchCode: apiTraceData.batch_code,
        milletType: apiTraceData.millet_type,
        totalQuantity: apiTraceData.total_quantity,
        origin: apiTraceData.origin,
        harvestDate: new Date(apiTraceData.harvest_date),
        organic: apiTraceData.is_organic,
        certifications: apiTraceData.certifications || ['FSSAI'],
        currentStatus: apiTraceData.status,
        farmers: apiTraceData.farmers || mockTraceData.farmers,
      };
    }
    return mockTraceData;
  }, [apiTraceData]);

  const traceEvents: TraceEvent[] = useMemo(() => {
    if (apiTraceData?.timeline && apiTraceData.timeline.length > 0) {
      return apiTraceData.timeline.map((event, idx) => ({
        id: `${idx}`,
        title: event.event,
        description: event.event,
        location: event.location,
        timestamp: new Date(event.timestamp),
        actor: event.actor,
        actorType: event.actor_type as 'farmer' | 'fpo' | 'processor' | 'buyer',
        verified: event.verified,
        icon: iconMapping[event.event.toLowerCase()] || CheckCircle,
      }));
    }
    return defaultTraceEvents;
  }, [apiTraceData]);

  const millet = milletTypes.find(m => m.id === traceData.milletType);

  const handleShare = async () => {
    setIsSharing(true);
    const shareUrl = `${window.location.origin}/trace/${code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trace: ${traceData.batchCode}`,
          text: `Track this millet batch: ${traceData.batchCode}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
    setIsSharing(false);
  };

  const handleDownload = () => {
    // Create a simple certificate text
    const cert = `
SHREE ANNA - TRACEABILITY CERTIFICATE
=====================================

Batch Code: ${traceData.batchCode}
Product: ${millet?.name || traceData.milletType}
Quantity: ${traceData.totalQuantity} kg
Origin: ${traceData.origin}
Harvest Date: ${traceData.harvestDate.toLocaleDateString()}
Organic: ${traceData.organic ? 'Yes' : 'No'}
Certifications: ${traceData.certifications.join(', ')}

Contributing Farmers:
${traceData.farmers.map(f => `- ${f.name} (${f.village}): ${f.quantity} kg`).join('\n')}

Verified by Shree Anna Blockchain Traceability
`;
    const blob = new Blob([cert], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-certificate-${traceData.batchCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading trace data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Verified Traceability
          </div>
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
              Batch: {traceData.batchCode}
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
          <p className="text-muted-foreground">
            Complete journey from farm to your hands
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center">
            <p className="text-sm">Using demo data - API temporarily unavailable</p>
          </div>
        )}

        {/* Product Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-8"
        >
          <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white shadow-md flex items-center justify-center">
                <span className="text-4xl">🌾</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{millet?.name}</h2>
                <p className="text-muted-foreground">{millet?.nameHi}</p>
                <div className="flex gap-2 mt-2">
                  {traceData.organic && (
                    <Badge className="bg-accent text-white">Organic</Badge>
                  )}
                  {traceData.certifications.map((cert) => (
                    <Badge key={cert} variant="outline">{cert}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-semibold">{traceData.totalQuantity} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Origin</p>
                <p className="font-semibold">{traceData.origin}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Harvest Date</p>
                <p className="font-semibold">
                  {traceData.harvestDate.toLocaleDateString('en-IN', { 
                    day: 'numeric', month: 'long', year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Farmers</p>
                <p className="font-semibold">{traceData.farmers.length}+ farmers</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 mb-8"
        >
          <h3 className="font-heading font-semibold text-lg mb-6">Journey Timeline</h3>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {traceEvents.map((event, idx) => {
                const Icon = event.icon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="relative pl-16"
                  >
                    {/* Icon */}
                    <div className={`absolute left-0 w-12 h-12 rounded-full border-2 flex items-center justify-center bg-card ${actorColors[event.actorType]}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        {event.verified && (
                          <Badge className="bg-accent/10 text-accent text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.timestamp.toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {event.actor}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Farmer Contributors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6 mb-8"
        >
          <h3 className="font-heading font-semibold text-lg mb-4">Contributing Farmers</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {traceData.farmers.map((farmer, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">👨‍🌾</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{farmer.name}</p>
                  <p className="text-xs text-muted-foreground">{farmer.village}</p>
                </div>
                <p className="text-sm font-medium">{farmer.quantity} kg</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* QR Code & Share */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6 text-center"
        >
          <h3 className="font-heading font-semibold text-lg mb-4">Share This Trace</h3>
          <QRCodeDisplay
            value={`${typeof window !== 'undefined' ? window.location.origin : 'https://shreenna.in'}/trace/${traceData.batchCode}`}
            size={180}
            showActions={false}
          />
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" onClick={handleShare} disabled={isSharing}>
              <Share2 className="w-4 h-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Powered by <span className="font-semibold text-primary">Shree Anna</span> Blockchain Traceability</p>
          <a href="https://shreenna.in" className="inline-flex items-center gap-1 text-primary hover:underline mt-1">
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </main>
    </div>
  );
}
