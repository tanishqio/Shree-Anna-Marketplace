/**
 * Shree Anna - Offline Sync Store
 * Manages offline queue persistence using IndexedDB via localforage
 */

import localforage from 'localforage';

// Configure localforage for our app
localforage.config({
  name: 'ShreeAnna',
  storeName: 'offlineQueue',
  description: 'Shree Anna offline sync queue and cached data',
});

// Type definitions
export interface QueuedAction {
  id: string;
  type: 'listing_create' | 'offer_accept' | 'offer_reject' | 'batch_create' | 'consent_create';
  payload: Record<string, unknown>;
  clientTempId: string;
  clientTimestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'error' | 'conflict';
  errorMessage?: string;
  serverResponse?: Record<string, unknown>;
  serverId?: string;
  retryCount: number;
}

export interface SyncState {
  lastSyncAt: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

// Keys for different stores
const QUEUE_KEY = 'sync_queue';
const SYNC_STATE_KEY = 'sync_state';
const CACHED_MEDIA_KEY = 'cached_media';

/**
 * Get all queued actions
 */
export async function getQueuedActions(): Promise<QueuedAction[]> {
  try {
    const queue = await localforage.getItem<QueuedAction[]>(QUEUE_KEY);
    return queue || [];
  } catch (error) {
    console.error('Failed to get queued actions:', error);
    return [];
  }
}

/**
 * Add an action to the offline queue
 */
export async function addToQueue(action: Omit<QueuedAction, 'id' | 'retryCount' | 'status'>): Promise<QueuedAction> {
  const queue = await getQueuedActions();
  
  const newAction: QueuedAction = {
    ...action,
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    retryCount: 0,
  };
  
  queue.push(newAction);
  await localforage.setItem(QUEUE_KEY, queue);
  
  return newAction;
}

/**
 * Update an action in the queue
 */
export async function updateQueuedAction(id: string, updates: Partial<QueuedAction>): Promise<void> {
  const queue = await getQueuedActions();
  const index = queue.findIndex(a => a.id === id);
  
  if (index !== -1) {
    queue[index] = { ...queue[index], ...updates };
    await localforage.setItem(QUEUE_KEY, queue);
  }
}

/**
 * Remove an action from the queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueuedActions();
  const filtered = queue.filter(a => a.id !== id);
  await localforage.setItem(QUEUE_KEY, filtered);
}

/**
 * Clear all synced actions from queue
 */
export async function clearSyncedActions(): Promise<void> {
  const queue = await getQueuedActions();
  const pending = queue.filter(a => a.status !== 'synced');
  await localforage.setItem(QUEUE_KEY, pending);
}

/**
 * Get sync state
 */
export async function getSyncState(): Promise<SyncState> {
  try {
    const state = await localforage.getItem<SyncState>(SYNC_STATE_KEY);
    return state || {
      lastSyncAt: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: false,
      pendingCount: 0,
    };
  } catch (error) {
    console.error('Failed to get sync state:', error);
    return {
      lastSyncAt: null,
      isOnline: true,
      isSyncing: false,
      pendingCount: 0,
    };
  }
}

/**
 * Update sync state
 */
export async function updateSyncState(updates: Partial<SyncState>): Promise<void> {
  const state = await getSyncState();
  const newState = { ...state, ...updates };
  await localforage.setItem(SYNC_STATE_KEY, newState);
}

/**
 * Cache media file locally (for offline upload)
 */
export async function cacheMediaFile(
  tempId: string,
  file: File,
  metadata: { type: string; name: string; size: number }
): Promise<void> {
  try {
    const cachedMedia = await localforage.getItem<Record<string, unknown>>(CACHED_MEDIA_KEY) || {};
    
    // Convert file to base64 for storage
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    cachedMedia[tempId] = {
      base64,
      metadata,
      cachedAt: new Date().toISOString(),
    };
    
    await localforage.setItem(CACHED_MEDIA_KEY, cachedMedia);
  } catch (error) {
    console.error('Failed to cache media file:', error);
    throw error;
  }
}

/**
 * Get cached media file
 */
export async function getCachedMedia(tempId: string): Promise<{
  base64: string;
  metadata: { type: string; name: string; size: number };
} | null> {
  try {
    const cachedMedia = await localforage.getItem<Record<string, unknown>>(CACHED_MEDIA_KEY) || {};
    return cachedMedia[tempId] as { base64: string; metadata: { type: string; name: string; size: number } } | null;
  } catch (error) {
    console.error('Failed to get cached media:', error);
    return null;
  }
}

/**
 * Remove cached media file
 */
export async function removeCachedMedia(tempId: string): Promise<void> {
  try {
    const cachedMedia = await localforage.getItem<Record<string, unknown>>(CACHED_MEDIA_KEY) || {};
    delete cachedMedia[tempId];
    await localforage.setItem(CACHED_MEDIA_KEY, cachedMedia);
  } catch (error) {
    console.error('Failed to remove cached media:', error);
  }
}

/**
 * Clear all cached data (for testing/reset)
 */
export async function clearAllCachedData(): Promise<void> {
  await localforage.clear();
}

export default localforage;
