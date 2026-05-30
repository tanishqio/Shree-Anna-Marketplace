'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getQueuedActions, 
  addToQueue, 
  removeFromQueue, 
  updateQueuedAction,
  getSyncState,
  updateSyncState,
  QueuedAction,
  SyncState 
} from './offlineStore';
import { api } from './api';

interface SyncQueueHookResult {
  // State
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  syncError: string | null;
  
  // Actions
  queueAction: (action: Omit<QueuedAction, 'id' | 'retryCount' | 'status'>) => Promise<void>;
  syncNow: () => Promise<void>;
  clearQueue: () => Promise<void>;
  getQueue: () => Promise<QueuedAction[]>;
}

export function useSyncQueue(): SyncQueueHookResult {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const syncInProgress = useRef(false);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        const state = await getSyncState();
        if (state.lastSyncAt) {
          setLastSyncTime(new Date(state.lastSyncAt));
        }
        const queue = await getQueuedActions();
        setPendingCount(queue.filter(a => a.status === 'pending').length);
      } catch (error) {
        console.error('Failed to load sync state:', error);
      }
    };
    loadState();
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncError(null);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !syncInProgress.current) {
      syncNow();
    }
  }, [isOnline, pendingCount]);

  // Queue an action for later sync
  const queueAction = useCallback(async (
    action: Omit<QueuedAction, 'id' | 'retryCount' | 'status'>
  ): Promise<void> => {
    await addToQueue(action);
    setPendingCount(prev => prev + 1);
    
    // Try to sync immediately if online
    if (isOnline && !syncInProgress.current) {
      syncNow();
    }
  }, [isOnline]);

  // Sync all pending actions
  const syncNow = useCallback(async (): Promise<void> => {
    if (syncInProgress.current || !isOnline) return;
    
    syncInProgress.current = true;
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      const queue = await getQueuedActions();
      const pending = queue.filter(a => a.status === 'pending');
      
      for (const action of pending) {
        try {
          // Mark as syncing
          await updateQueuedAction(action.id, { status: 'syncing' });
          
          // Execute the action based on type
          await executeAction(action);
          
          // Remove from queue on success
          await removeFromQueue(action.id);
          setPendingCount(prev => Math.max(0, prev - 1));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // Update retry count
          const newRetryCount = action.retryCount + 1;
          
          if (newRetryCount >= 3) {
            // Mark as error after 3 retries
            await updateQueuedAction(action.id, { 
              status: 'error',
              errorMessage: errorMessage,
              retryCount: newRetryCount
            });
          } else {
            // Revert to pending for retry
            await updateQueuedAction(action.id, { 
              status: 'pending',
              errorMessage: errorMessage,
              retryCount: newRetryCount
            });
          }
          
          console.error(`Failed to sync action ${action.id}:`, error);
        }
      }
      
      // Update last sync time
      const now = new Date().toISOString();
      await updateSyncState({ lastSyncAt: now });
      setLastSyncTime(new Date(now));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setSyncError(errorMessage);
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [isOnline]);

  // Execute a queued action based on its type
  const executeAction = async (action: QueuedAction): Promise<void> => {
    const { type, payload } = action;
    
    switch (type) {
      case 'listing_create':
        await api.post('/listings', payload);
        break;
      case 'offer_accept':
        await api.put(`/offers/${payload.offerId}/accept`, payload);
        break;
      case 'offer_reject':
        await api.put(`/offers/${payload.offerId}/reject`, payload);
        break;
      case 'batch_create':
        await api.post('/batches', payload);
        break;
      case 'consent_create':
        await api.post('/consents', payload);
        break;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  };

  // Clear all queued actions
  const clearQueue = useCallback(async (): Promise<void> => {
    const queue = await getQueuedActions();
    for (const action of queue) {
      await removeFromQueue(action.id);
    }
    setPendingCount(0);
  }, []);

  // Get current queue
  const getQueue = useCallback(async (): Promise<QueuedAction[]> => {
    return getQueuedActions();
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncError,
    queueAction,
    syncNow,
    clearQueue,
    getQueue,
  };
}

// Export a simplified hook for components that just need online status
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
