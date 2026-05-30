"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Package,
  Loader2,
  ChevronRight
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LogisticsTrackerProps {
  orderId: string;
  currentStatus: 'pending_pickup' | 'in_transit' | 'delivered' | 'completed';
  trackingNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  pickupAddress: string;
  deliveryAddress: string;
  onSchedulePickup?: (data: PickupData) => Promise<void>;
  onStatusUpdate?: () => void;
}

interface PickupData {
  pickup_date: string;
  pickup_slot: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
}

// Mock pickup slots
const PICKUP_SLOTS = [
  { id: 'morning', label: '9:00 AM - 12:00 PM', labelHi: 'सुबह 9 - 12 बजे' },
  { id: 'afternoon', label: '12:00 PM - 3:00 PM', labelHi: 'दोपहर 12 - 3 बजे' },
  { id: 'evening', label: '3:00 PM - 6:00 PM', labelHi: 'शाम 3 - 6 बजे' },
];

export function LogisticsTracker({
  orderId,
  currentStatus,
  trackingNumber,
  vehicleNumber,
  driverName,
  driverPhone,
  pickupAddress,
  deliveryAddress,
  onSchedulePickup,
  onStatusUpdate,
}: LogisticsTrackerProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  
  // Schedule form state
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('');
  const [newVehicleNumber, setNewVehicleNumber] = useState(vehicleNumber || '');
  const [newDriverName, setNewDriverName] = useState(driverName || '');
  const [newDriverPhone, setNewDriverPhone] = useState(driverPhone || '');

  const handleSchedulePickup = async () => {
    if (!pickupDate || !pickupSlot) return;
    
    setIsScheduling(true);
    try {
      if (onSchedulePickup) {
        await onSchedulePickup({
          pickup_date: pickupDate,
          pickup_slot: pickupSlot,
          vehicle_number: newVehicleNumber || undefined,
          driver_name: newDriverName || undefined,
          driver_phone: newDriverPhone || undefined,
        });
      }
      setScheduleSuccess(true);
      setTimeout(() => {
        setShowScheduleModal(false);
        setScheduleSuccess(false);
        onStatusUpdate?.();
      }, 2000);
    } catch (err) {
      console.error('Failed to schedule pickup:', err);
    } finally {
      setIsScheduling(false);
    }
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const statusSteps = [
    { key: 'pending_pickup', label: 'Pickup Pending', icon: Package },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === currentStatus);

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex justify-between items-center mb-4">
          {statusSteps.map((step, idx) => {
            const isActive = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive 
                      ? isCurrent 
                        ? 'bg-primary text-white' 
                        : 'bg-accent text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-1 text-center ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    idx < currentStepIndex ? 'bg-accent' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tracking Number */}
        {trackingNumber && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Tracking Number</p>
              <p className="font-mono font-semibold">{trackingNumber}</p>
            </div>
            <Button variant="outline" size="sm">
              <MapPin className="w-4 h-4 mr-1" />
              Track
            </Button>
          </div>
        )}
      </div>

      {/* Vehicle/Driver Info */}
      {(vehicleNumber || driverName) && currentStatus === 'in_transit' && (
        <div className="bg-sky-500/5 rounded-xl border border-sky-500/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Truck className="w-5 h-5 text-sky-600" />
            <span className="font-semibold">In Transit</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {vehicleNumber && (
              <div className="p-2 bg-white/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Vehicle</p>
                <p className="font-medium">{vehicleNumber}</p>
              </div>
            )}
            {driverName && (
              <div className="p-2 bg-white/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Driver</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{driverName}</span>
                  {driverPhone && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => window.location.href = `tel:${driverPhone}`}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Addresses */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <Package className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pickup Location</p>
            <p className="text-sm">{pickupAddress}</p>
          </div>
        </div>
        <div className="ml-4 border-l-2 border-dashed border-muted h-4" />
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Delivery Location</p>
            <p className="text-sm">{deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* Schedule Pickup Button */}
      {currentStatus === 'pending_pickup' && onSchedulePickup && (
        <Button 
          onClick={() => setShowScheduleModal(true)}
          className="w-full"
          size="lg"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Pickup
        </Button>
      )}

      {/* Schedule Pickup Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Schedule Pickup
            </DialogTitle>
            <DialogDescription>
              Choose a date and time slot for pickup
            </DialogDescription>
          </DialogHeader>

          {scheduleSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Pickup Scheduled!</h3>
              <p className="text-muted-foreground">
                You'll receive a confirmation SMS shortly
              </p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Pickup Date *</label>
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={minDateStr}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Time Slot *</label>
                  <Select value={pickupSlot} onValueChange={setPickupSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {PICKUP_SLOTS.map(slot => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Vehicle Details (Optional)</p>
                  <div className="space-y-3">
                    <Input
                      placeholder="Vehicle Number (e.g., KA 01 AB 1234)"
                      value={newVehicleNumber}
                      onChange={(e) => setNewVehicleNumber(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Driver Name"
                        value={newDriverName}
                        onChange={(e) => setNewDriverName(e.target.value)}
                      />
                      <Input
                        placeholder="Driver Phone"
                        value={newDriverPhone}
                        onChange={(e) => setNewDriverPhone(e.target.value)}
                        type="tel"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSchedulePickup}
                  disabled={!pickupDate || !pickupSlot || isScheduling}
                >
                  {isScheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Pickup
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
