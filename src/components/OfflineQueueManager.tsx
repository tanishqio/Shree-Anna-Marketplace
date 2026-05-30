"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Cloud,
  ChevronDown,
  Trash2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncApi } from '@/lib/api';

// Types for offline queue management
export interface QueuedAction {
  id: string;
  type: 'listing_create' | 'listing_update' | 'offer_accept' | 'offer_reject' | 'consent_record' | 'profile_update';
  payload: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  description: string;
}

interface OfflineQueueManagerProps {
  onSync?: (actions: QueuedAction[]) => Promise<void>;
  onActionComplete?: (action: QueuedAction) => void;
  className?: string;
}

// Simulated IndexedDB-like storage
const STORAGE_KEY = 'shree_anna_offline_queue';

export function OfflineQueueManager({
  onSync,
  onActionComplete,
  className = '',
}: OfflineQueueManagerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);

  // Load queue from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setQueue(parsed.map((item: QueuedAction) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      }

      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        // Auto-sync when coming back online
        syncQueue();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Persist queue to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
  }, [queue]);

  const addToQueue = useCallback((action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    const newAction: QueuedAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending',
    };
    setQueue((prev) => [...prev, newAction]);
    return newAction.id;
  }, []);

  const removeFromQueue = useCallback((actionId: string) => {
    setQueue((prev) => prev.filter((a) => a.id !== actionId));
  }, []);

  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing || queue.length === 0) return;

    setIsSyncing(true);
    setSyncProgress(0);

    const pendingActions = queue.filter((a) => a.status === 'pending' || a.status === 'failed');
    let completed = 0;

    for (const action of pendingActions) {
      try {
        // Update status to syncing
        setQueue((prev) =>
          prev.map((a) => (a.id === action.id ? { ...a, status: 'syncing' as const } : a))
        );

        // Use syncApi to push changes
        await syncApi.push([{
            type: action.type,
            action: action.method,
            data: action.payload,
            client_temp_id: action.id
        }]);

        // Mark as completed
        setQueue((prev) =>
          prev.map((a) => (a.id === action.id ? { ...a, status: 'completed' as const } : a))
        );
        onActionComplete?.(action);

        completed++;
        setSyncProgress((completed / pendingActions.length) * 100);
      } catch (error) {
        // Mark as failed with retry increment
        setQueue((prev) =>
          prev.map((a) =>
            a.id === action.id
              ? { ...a, status: 'failed' as const, retryCount: a.retryCount + 1 }
              : a
          )
        );
      }
    }

    // Clean up completed actions after a delay
    setTimeout(() => {
      setQueue((prev) => prev.filter((a) => a.status !== 'completed'));
    }, 2000);

    setLastSyncTime(new Date());
    setIsSyncing(false);
    setSyncProgress(0);
  }, [isOnline, isSyncing, queue, onActionComplete]);

  const pendingCount = queue.filter((a) => a.status === 'pending' || a.status === 'failed').length;
  const syncingCount = queue.filter((a) => a.status === 'syncing').length;

  const actionTypeLabels: Record<QueuedAction['type'], string> = {
    listing_create: 'New Listing',
    listing_update: 'Update Listing',
    offer_accept: 'Accept Offer',
    offer_reject: 'Reject Offer',
    consent_record: 'Voice Consent',
    profile_update: 'Profile Update',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Status Banner - shown when offline or syncing */}
      <AnimatePresence>
        {(!isOnline || pendingCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-16 left-0 right-0 z-40 ${
              !isOnline ? 'bg-destructive/90' : 'bg-primary/90'
            } text-white px-4 py-2 flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              {!isOnline ? (
                <>
                  <WifiOff className="w-4 h-4 offline-pulse" />
                  <span className="text-sm font-medium">
                    Offline — Changes saved locally
                  </span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">
                    Syncing {syncingCount} changes...
                  </span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {pendingCount} changes waiting to sync
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isOnline && pendingCount > 0 && !isSyncing && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={syncQueue}
                  className="h-7 text-xs"
                >
                  Sync Now
                </Button>
              )}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Progress Bar */}
      <AnimatePresence>
        {isSyncing && syncProgress > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-[calc(4rem+2.5rem)] left-0 right-0 z-40 h-1 bg-muted"
          >
            <motion.div
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${syncProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Dropdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[calc(4rem+2.5rem)] left-0 right-0 z-30 bg-card border-b border-border shadow-lg max-h-64 overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-3">
              {/* Status Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-accent" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-destructive" />
                  )}
                  <span className={isOnline ? 'text-accent' : 'text-destructive'}>
                    {isOnline ? 'Connected' : 'Offline'}
                  </span>
                  {lastSyncTime && (
                    <span className="text-muted-foreground">
                      • Last synced: {lastSyncTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Pending Actions List */}
              {queue.length > 0 ? (
                <div className="space-y-2">
                  {queue
                    .filter((a) => a.status !== 'completed')
                    .map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                      >
                        <div className="shrink-0">
                          {action.status === 'syncing' ? (
                            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                          ) : action.status === 'failed' ? (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {actionTypeLabels[action.type]}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {action.description}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(action.timestamp).toLocaleTimeString()}
                          </span>
                          {action.status === 'failed' && (
                            <span className="text-xs text-destructive">
                              Failed ({action.retryCount}x)
                            </span>
                          )}
                          <button
                            onClick={() => removeFromQueue(action.id)}
                            className="p-1 hover:bg-destructive/10 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Check className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All changes synced!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for using offline queue
export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  const addToQueue = useCallback(
    (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
      const newAction: QueuedAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        retryCount: 0,
        status: 'pending',
      };

      // Save to localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newAction]));
      }

      setQueue((prev) => [...prev, newAction]);
      return newAction.id;
    },
    []
  );

  return { queue, addToQueue };
}

// Compact indicator for navbar
export function OfflineIndicator({ className = '' }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPendingCount(parsed.filter((a: QueuedAction) => a.status === 'pending').length);
      }

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

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        !isOnline
          ? 'bg-destructive/10 text-destructive'
          : 'bg-primary/10 text-primary'
      } ${className}`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3 h-3 offline-pulse" />
          <span>Offline</span>
        </>
      ) : (
        <>
          <Cloud className="w-3 h-3" />
          <span>{pendingCount} pending</span>
        </>
      )}
    </div>
  );
}
