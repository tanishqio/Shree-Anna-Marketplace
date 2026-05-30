"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PendingAction {
  id: string;
  type: 'listing' | 'offer' | 'update';
  description: string;
  timestamp: Date;
}

interface OfflineSyncIndicatorProps {
  isOnline?: boolean;
  pendingActions?: PendingAction[];
  onSync?: () => Promise<void>;
  className?: string;
}

export function OfflineSyncIndicator({
  isOnline: isOnlineProp,
  pendingActions = [],
  onSync,
  className = '',
}: OfflineSyncIndicatorProps) {
  const [isOnline, setIsOnline] = useState(isOnlineProp ?? true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await onSync?.();
      setLastSynced(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = pendingActions.length;

  return (
    <div className={`relative ${className}`}>
      {/* Main indicator button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
          ${isOnline 
            ? pendingCount > 0 
              ? 'bg-primary/10 text-primary' 
              : 'bg-accent/10 text-accent'
            : 'bg-destructive/10 text-destructive'
          }
        `}
      >
        {isOnline ? (
          pendingCount > 0 ? (
            <>
              <Cloud className="w-4 h-4" />
              <span>{pendingCount} pending</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              <span className="hidden sm:inline">Online</span>
            </>
          )
        ) : (
          <>
            <WifiOff className="w-4 h-4 offline-pulse" />
            <span>Offline</span>
            {pendingCount > 0 && (
              <span className="bg-destructive text-white text-xs px-1.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Details dropdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-card rounded-xl shadow-xl border border-border z-50"
          >
            {/* Status header */}
            <div className={`p-4 rounded-t-xl ${isOnline ? 'bg-accent/10' : 'bg-destructive/10'}`}>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-accent" />
                ) : (
                  <WifiOff className="w-5 h-5 text-destructive" />
                )}
                <span className="font-medium">
                  {isOnline ? 'Connected' : 'No Internet Connection'}
                </span>
              </div>
              {lastSynced && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last synced: {lastSynced.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Pending actions */}
            {pendingCount > 0 && (
              <div className="p-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Pending Actions</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {pendingActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-start gap-2 text-sm p-2 bg-muted rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{action.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sync button */}
            {isOnline && pendingCount > 0 && (
              <div className="p-4 border-t border-border">
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* All synced message */}
            {isOnline && pendingCount === 0 && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2 text-accent">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">All data synced!</span>
                </div>
              </div>
            )}

            {/* Offline message */}
            {!isOnline && (
              <div className="p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Changes will be saved locally and synced when you&apos;re back online.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
