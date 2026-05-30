/**
 * Shree Anna - Zod Schemas for API Validation
 * Runtime validation for all API requests and responses
 */

import { z } from 'zod';

// ============================================================================
// Auth Schemas
// ============================================================================

export const PhoneSchema = z.string().regex(/^\+91\d{10}$/, 'Phone must be in format +91XXXXXXXXXX');

export const RequestOTPRequestSchema = z.object({
  phone: PhoneSchema,
});

export const RequestOTPResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const VerifyOTPRequestSchema = z.object({
  phone: PhoneSchema,
  otp: z.string().min(4).max(6),
});

export const UserSchema = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string().nullable().optional(),
  roles: z.string(),
  is_active: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  created_at: z.string().optional(),
});

export const VerifyOTPResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  user: UserSchema,
});

// ============================================================================
// Listing Schemas
// ============================================================================

export const CreateListingRequestSchema = z.object({
  crop: z.string().min(1, 'Crop type is required'),
  qty_kg: z.number().positive('Quantity must be positive'),
  min_price_per_qtl: z.number().positive('Price must be positive'),
  quality_grade: z.enum(['premium', 'standard', 'economy']).optional(),
  is_organic: z.boolean().optional(),
  description: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const ListingSchema = z.object({
  id: z.string(),
  owner_id: z.string(),
  crop: z.string(),
  qty_kg: z.number(),
  min_price_per_qtl: z.number(),
  quality_grade: z.string().nullable(),
  is_organic: z.boolean(),
  status: z.string(),
  description: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export const ListingsResponseSchema = z.object({
  items: z.array(ListingSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

// ============================================================================
// Offer Schemas
// ============================================================================

export const CreateOfferRequestSchema = z.object({
  listing_id: z.string(),
  price_per_qtl: z.number().positive(),
  quantity_kg: z.number().positive().optional(),
  message: z.string().optional(),
});

export const OfferSchema = z.object({
  id: z.string(),
  listing_id: z.string(),
  buyer_id: z.string(),
  price_per_qtl: z.number(),
  quantity_kg: z.number().nullable().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'countered', 'expired']),
  message: z.string().nullable().optional(),
  created_at: z.string(),
});

export const OffersResponseSchema = z.object({
  offers: z.array(OfferSchema),
});

// ============================================================================
// Batch & Trace Schemas
// ============================================================================

export const CreateBatchRequestSchema = z.object({
  source_lots: z.array(z.string()),
  total_weight: z.number().positive(),
  crop: z.string(),
  grade: z.string().optional(),
  processing_date: z.string().optional(),
  notes: z.string().optional(),
});

export const BatchSchema = z.object({
  id: z.string(),
  qr_code: z.string(),
  created_by_id: z.string(),
  source_lots: z.array(z.string()),
  total_weight: z.number(),
  crop: z.string(),
  grade: z.string().nullable(),
  status: z.string(),
  created_at: z.string(),
});

export const TraceEventSchema = z.object({
  id: z.string(),
  batch_id: z.string(),
  event_type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  timestamp: z.string(),
  actor_type: z.string().nullable().optional(),
  verified: z.boolean(),
  payload_hash: z.string().optional(),
  server_signature: z.string().optional(),
});

export const BatchTraceResponseSchema = z.object({
  batch: BatchSchema,
  trace: z.array(TraceEventSchema),
});

// ============================================================================
// Consent Schemas
// ============================================================================

export const CreateConsentRequestSchema = z.object({
  farmer_id: z.string(),
  proxy_user_id: z.string().optional(),
  scope: z.string(),
  audio_media_id: z.string().optional(),
  otp_hash: z.string().optional(),
});

export const ConsentSchema = z.object({
  id: z.string(),
  farmer_id: z.string(),
  proxy_user_id: z.string().nullable().optional(),
  scope: z.string(),
  audio_url: z.string().nullable().optional(),
  verified: z.boolean(),
  created_at: z.string(),
});

// ============================================================================
// Weather Schemas
// ============================================================================

export const WeatherDataSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  description: z.string(),
  icon: z.string().optional(),
  wind_speed: z.number().optional(),
  feels_like: z.number().optional(),
});

export const WeatherResponseSchema = z.object({
  location: z.string().optional(),
  current: WeatherDataSchema,
  advisory: z.string().nullable().optional(),
});

// ============================================================================
// Sync Schemas
// ============================================================================

export const SyncPushItemSchema = z.object({
  type: z.string(),
  action: z.string(),
  data: z.record(z.string(), z.unknown()),
  client_temp_id: z.string(),
});

export const SyncPushRequestSchema = z.object({
  changes: z.array(SyncPushItemSchema),
});

export const SyncPushResponseSchema = z.object({
  results: z.array(z.object({
    client_temp_id: z.string(),
    server_id: z.string().nullable(),
    status: z.enum(['success', 'conflict', 'error']),
    message: z.string().optional(),
  })),
});

export const SyncPullResponseSchema = z.object({
  changes: z.array(z.object({
    type: z.string(),
    action: z.string(),
    data: z.record(z.string(), z.unknown()),
    server_timestamp: z.string(),
  })),
  server_time: z.string(),
});

// ============================================================================
// Media Schemas
// ============================================================================

export const MediaUploadResponseSchema = z.object({
  media_id: z.string(),
  url: z.string(),
  hash: z.string().optional(),
});

// ============================================================================
// Admin Schemas
// ============================================================================

export const AdminDashboardStatsSchema = z.object({
  stats: z.object({
    users: z.object({
      total: z.number(),
      farmers: z.number(),
      fpos: z.number(),
      buyers: z.number(),
    }),
    marketplace: z.object({
      listings: z.number(),
      active_listings: z.number(),
      batches: z.number(),
      orders: z.number(),
    }),
    fpos: z.object({
      total: z.number(),
      verified: z.number(),
    }),
    activity: z.object({
      events_24h: z.number(),
    }),
    payments: z.object({
      total_completed: z.number(),
    }),
  }),
  generated_at: z.string(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type RequestOTPRequest = z.infer<typeof RequestOTPRequestSchema>;
export type VerifyOTPRequest = z.infer<typeof VerifyOTPRequestSchema>;
export type VerifyOTPResponse = z.infer<typeof VerifyOTPResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateListingRequest = z.infer<typeof CreateListingRequestSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type CreateOfferRequest = z.infer<typeof CreateOfferRequestSchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type CreateBatchRequest = z.infer<typeof CreateBatchRequestSchema>;
export type Batch = z.infer<typeof BatchSchema>;
export type TraceEvent = z.infer<typeof TraceEventSchema>;
export type CreateConsentRequest = z.infer<typeof CreateConsentRequestSchema>;
export type Consent = z.infer<typeof ConsentSchema>;
export type WeatherData = z.infer<typeof WeatherDataSchema>;
export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;
export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;
export type SyncPushResponse = z.infer<typeof SyncPushResponseSchema>;
export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;
export type MediaUploadResponse = z.infer<typeof MediaUploadResponseSchema>;
export type AdminDashboardStats = z.infer<typeof AdminDashboardStatsSchema>;
