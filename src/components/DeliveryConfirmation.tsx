"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  MapPin,
  Clock,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ordersApi } from '@/lib/api';

interface DeliveryConfirmationProps {
  orderId: string;
  buyerName: string;
  quantity: number;
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeliveryConfirmation({
  orderId,
  buyerName,
  quantity,
  totalAmount,
  isOpen,
  onClose,
  onSuccess,
}: DeliveryConfirmationProps) {
  const [step, setStep] = useState<'photo' | 'confirm' | 'success'>('photo');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofImage(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDelivery = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In production, you would first upload the image to a storage service
      // and get back a URL. For now, we'll simulate this.
      const mockImageUrl = proofImage ? `https://storage.example.com/delivery-proof/${orderId}.jpg` : undefined;
      
      await ordersApi.confirmDelivery(orderId, {
        delivery_proof_url: mockImageUrl,
        notes: notes || undefined,
      });
      
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setStep('photo');
    setProofImage(null);
    setNotes('');
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetState(); onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            {step === 'success' ? 'Delivery Confirmed!' : 'Confirm Delivery'}
          </DialogTitle>
          <DialogDescription>
            Order {orderId.slice(0, 8)} • {quantity} kg to {buyerName}
          </DialogDescription>
        </DialogHeader>

        {step === 'photo' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Photo Upload Area */}
            <div className="border-2 border-dashed border-muted rounded-xl p-6 text-center">
              {proofImage ? (
                <div className="relative">
                  <img
                    src={proofImage}
                    alt="Delivery proof"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setProofImage(null)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Upload Delivery Proof</p>
                    <p className="text-sm text-muted-foreground">
                      Take a photo of the delivered goods
                    </p>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Gallery
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Delivery Notes (Optional)
              </label>
              <Textarea
                placeholder="Any notes about the delivery..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                disabled={!proofImage}
              >
                Continue
              </Button>
            </DialogFooter>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-accent/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden">
                  {proofImage && (
                    <img
                      src={proofImage}
                      alt="Delivery proof"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{quantity} kg delivered</p>
                  <p className="text-sm text-muted-foreground">
                    To: {buyerName}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold text-lg text-accent">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Payment will be released within 24-48 hours</span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-3 text-sm">
              <p className="font-medium text-primary mb-1">Important</p>
              <p className="text-muted-foreground">
                By confirming, you verify that the goods have been delivered in good condition.
                The buyer will be notified and escrow payment will be released.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('photo')}>
                Back
              </Button>
              <Button
                onClick={handleConfirmDelivery}
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Delivery
                  </>
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delivery Confirmed!</h3>
            <p className="text-muted-foreground">
              The buyer has been notified and your payment will be released soon.
            </p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
