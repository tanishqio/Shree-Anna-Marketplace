/**
 * Shree Anna - Data Fetching Hooks
 * Custom hooks for fetching data from the API
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listingsApi,
  weatherApi,
  schemesApi,
  notificationsApi,
  offersApi,
  ordersApi,
  paymentsApi,
  traceApi,
  batchesApi,
  kscApi,
  Listing,
  Scheme,
  Offer,
  Order,
  Payment,
  Batch,
  TraceEvent,
  AdminDashboardStats,
} from '../api';

// Generic fetch state
interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook for fetching listings
export function useListings(filters?: {
  category?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
  is_processed?: boolean;
  owner_type?: string;
}): FetchState<{ items: Listing[]; total: number }> {
  const [data, setData] = useState<{ items: Listing[]; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingsApi.getAll({
        crop: filters?.category,
        district: filters?.state,
        skip: filters?.page ? (filters.page - 1) * (filters.limit || 20) : 0,
        limit: filters?.limit || 20,
        is_processed: filters?.is_processed,
        owner_type: filters?.owner_type,
      });
      // Handle both old format (listings/total) and new format (data.items/data.pagination)
      const apiResponse = response as unknown as {
        data?: { items: Listing[]; pagination?: { total: number } };
        listings?: Listing[];
        total?: number;
      };

      if (apiResponse.data?.items) {
        setData({
          items: apiResponse.data.items,
          total: apiResponse.data.pagination?.total || apiResponse.data.items.length,
        });
      } else if (apiResponse.listings) {
        setData({
          items: apiResponse.listings,
          total: apiResponse.total || apiResponse.listings.length,
        });
      } else {
        setData({ items: [], total: 0 });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.category, filters?.state, filters?.page, filters?.limit, filters?.is_processed, filters?.owner_type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching a single listing
export function useListing(id: string): FetchState<Listing> {
  const [data, setData] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const listing = await listingsApi.getById(id);
      setData(listing);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch listing';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching farmer's own listings
export function useMyListings(): FetchState<Listing[]> {
  const [data, setData] = useState<Listing[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingsApi.getMyListings();
      setData(response.listings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch your listings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching offers on a listing
export function useOffers(listingId: string): FetchState<unknown[]> {
  const [data, setData] = useState<unknown[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!listingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingsApi.getOffers(listingId);
      // Handle both array response and object with offers property
      const offersData = Array.isArray(response) ? response : (response as { offers?: unknown[] }).offers || [];
      setData(offersData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch offers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching weather
export function useWeather(lat?: number, lon?: number): FetchState<{
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
}> {
  const [data, setData] = useState<{
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (lat === undefined || lon === undefined) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const weather = await weatherApi.getCurrent(lat, lon);
      setData(weather);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching government schemes
export function useSchemes(filters?: {
  category?: string;
  state?: string;
}): FetchState<Scheme[]> {
  const [data, setData] = useState<Scheme[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await schemesApi.getAll({
        crop_type: filters?.category,
        state: filters?.state,
      });
      setData(response.schemes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch schemes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.category, filters?.state]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching FPO data
export function useFPO(id: string): FetchState<{
  id: string;
  name: string;
  members: number;
  location: string;
}> {
  const [data, setData] = useState<{
    id: string;
    name: string;
    members: number;
    location: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      // FPO endpoint would need to be added
      // For now, set loading to false
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch FPO data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching notifications
export function useNotifications(): FetchState<Array<{
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}>> {
  const [data, setData] = useState<Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsApi.getAll();
      setData(response.notifications as unknown as Array<{
        id: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
      }>);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching farmer's received offers
export function useReceivedOffers(): FetchState<Offer[]> {
  const [data, setData] = useState<Offer[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await offersApi.getMyReceivedOffers();
      setData(response.offers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch offers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching buyer's made offers
export function useMadeOffers(): FetchState<Offer[]> {
  const [data, setData] = useState<Offer[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await offersApi.getMyMadeOffers();
      setData(response.offers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch offers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching a single offer
export function useOffer(id: string): FetchState<Offer> {
  const [data, setData] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const offer = await offersApi.getById(id);
      setData(offer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch offer';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching orders
export function useOrders(role: 'farmer' | 'buyer' = 'farmer'): FetchState<Order[]> {
  const [data, setData] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ordersApi.getMyOrders(role);
      setData(response.orders);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching a single order
export function useOrder(id: string): FetchState<Order> {
  const [data, setData] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const order = await ordersApi.getById(id);
      setData(order);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching payments
export function usePayments(): FetchState<Payment[]> {
  const [data, setData] = useState<Payment[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentsApi.getMyPayments();
      setData(response.payments);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch payments';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching trace data
export function useTrace(code: string): FetchState<{
  batch_code: string;
  millet_type: string;
  total_quantity: number;
  origin: string;
  harvest_date: string;
  is_organic: boolean;
  certifications: string[];
  status: string;
  timeline: Array<{
    event: string;
    timestamp: string;
    location: string;
    actor: string;
    actor_type: string;
    verified: boolean;
  }>;
  farmers: Array<{
    name: string;
    quantity: number;
    village: string;
  }>;
}> {
  const [data, setData] = useState<{
    batch_code: string;
    millet_type: string;
    total_quantity: number;
    origin: string;
    harvest_date: string;
    is_organic: boolean;
    certifications: string[];
    status: string;
    timeline: Array<{
      event: string;
      timestamp: string;
      location: string;
      actor: string;
      actor_type: string;
      verified: boolean;
    }>;
    farmers: Array<{
      name: string;
      quantity: number;
      village: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!code) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await traceApi.getByCode(code);
      // Handle response wrapped in data property
      const apiResponse = response as unknown as { data?: typeof data };
      if (apiResponse.data) {
        setData(apiResponse.data);
      } else {
        setData(response as typeof data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trace data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching batches (FPO)
export function useBatches(filters?: { status?: string; crop?: string }): FetchState<Batch[]> {
  const [data, setData] = useState<Batch[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await batchesApi.list(filters);
      setData(response.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch batches';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching single batch with trace
export function useBatch(batchId: string | null): FetchState<{ batch: Batch; trace: TraceEvent[] }> {
  const [data, setData] = useState<{ batch: Batch; trace: TraceEvent[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!batchId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await batchesApi.getById(batchId);
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch batch';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (batchId) fetchData();
  }, [fetchData, batchId]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching KSC dashboard stats
export function useKscDashboard(): FetchState<AdminDashboardStats> {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await kscApi.getDashboard();
      setData(stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch KSC dashboard';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Hook for fetching Admin dashboard stats
export function useAdminDashboard(): FetchState<AdminDashboardStats> {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual admin API when available
      // For now, using KSC dashboard as placeholder since they share the same type
      const stats = await kscApi.getDashboard();
      setData(stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch admin dashboard';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
