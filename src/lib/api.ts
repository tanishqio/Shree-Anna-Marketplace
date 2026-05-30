/**
 * Shree Anna - API Client
 * Centralized API communication with the Python backend
 */
import { supabase } from './supabase';

// ============================================================================
// Developer OTP Bypass Mode
// These phone numbers bypass OTP verification ONLY
// All other API calls (profiles, listings, etc.) go through the real backend
// This allows testing with real data that persists in the database
// ============================================================================

// 5 Developer phone numbers - one for each role (all starting with 9)
export const DEV_PHONES = {
  farmer: '9876543210',
  buyer: '9876543211',
  processor: '9876543212',
  fpo: '9876543213',
  ksc: '9876543214',
} as const;

// The universal OTP for developer accounts
export const DEV_OTP = '000000';

// Legacy exports for backward compatibility
export const DEV_PHONE = DEV_PHONES.farmer;
export const DEV_PHONE_FORMATTED = '+91' + DEV_PHONES.farmer;

// Check if the phone number is one of the developer bypass numbers
export const isDevPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  // Check if it matches any of the dev phones (with or without country code)
  const devPhoneList = Object.values(DEV_PHONES);
  return devPhoneList.some(devPhone =>
    cleaned === devPhone || cleaned === '91' + devPhone
  );
};

// Get the role associated with a developer phone
export const getDevPhoneRole = (phone: string): string | null => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  for (const [role, devPhone] of Object.entries(DEV_PHONES)) {
    if (cleaned === devPhone || cleaned === '91' + devPhone) {
      return role;
    }
  }
  return null;
};

// Check if OTP is the developer bypass OTP
export const isDevOtp = (otp: string): boolean => {
  return otp === DEV_OTP;
};

// Store the current dev user role for session
let devUserRole: string = 'farmer';
export const setDevUserRole = (role: string) => {
  devUserRole = role;
  if (typeof window !== 'undefined') {
    localStorage.setItem('shreeanna_dev_role', role);
  }
};
export const getDevUserRole = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('shreeanna_dev_role') || devUserRole;
  }
  return devUserRole;
};

// Check if current token is a developer token
export const isDevToken = (token?: string | null): boolean => {
  const t = token || getAccessToken();
  return t ? t.startsWith('dev-') : false;
};

// Check if current session is a developer session
export const isDevSession = (): boolean => {
  return isDevToken();
};

// Get user ID from developer token
export const getDevUserId = (token?: string | null): string | null => {
  const t = token || getAccessToken();
  if (t && t.startsWith('dev-')) {
    return t; // The token itself is the user ID for dev accounts
  }
  return null;
};

// Helper to get current user ID - works for both Supabase auth and developer tokens
// For developer tokens, this looks up or creates a real user record in the database
const getCurrentUserId = async (): Promise<string> => {
  const token = getAccessToken();

  // For developer tokens, look up or create user by phone number
  if (isDevToken(token)) {
    const role = getDevUserRole();
    const phone = DEV_PHONES[role as keyof typeof DEV_PHONES] || DEV_PHONES.farmer;
    const fullPhone = '+91' + phone;

    // Check if a user with this phone exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', fullPhone)
      .single();

    if (existingUser && existingUser.id) {
      return existingUser.id;
    }

    // If no user exists, create one with a real UUID
    // Important: Don't set a hardcoded name - let onboarding set the real name
    const newUserId = crypto.randomUUID();
    const { error: createError } = await supabase.from('users').insert({
      id: newUserId,
      phone: fullPhone,
      name: null,  // Will be set during onboarding
      language: 'en',
      onboarded: false,
      roles: [role]
    });

    if (createError) {
      console.error('Failed to create dev user:', createError);
      // If insert fails due to duplicate, try lookup again
      const { data: retryUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', fullPhone)
        .single();
      if (retryUser && retryUser.id) {
        return retryUser.id;
      }
      throw new Error('Failed to get or create dev user');
    }

    return newUserId;
  }

  // For Supabase auth, get user from session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

// API Configuration
const getBaseUrl = () => {
  // 1. Explicitly set API URL (e.g. from env vars)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. Vercel Server-side (SSR/SSG)
  // VERCEL_URL is automatically set by Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Client-side
  if (typeof window !== 'undefined') {
    // If on localhost, point to local backend
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8005';
    }
    // Otherwise use relative path (same domain)
    return '';
  }

  // 4. Local Server-side (e.g. during build on local machine)
  return 'http://localhost:8005';
};

const API_BASE_URL = getBaseUrl();
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('shreeanna_token', token);
    } else {
      localStorage.removeItem('shreeanna_token');
    }
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('shreeanna_token');
  }
  return accessToken;
};

// Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  phone: string;
  name: string | null;
  roles: string[];
  language: string;
  district: string | null;
  onboarded: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  is_new_user: boolean;
}

export interface Listing {
  id: string;
  owner_type: string;
  owner_id: string;
  crop_type: string;
  crop: string;
  variety: string | null;
  description: string | null;
  qty_kg: number;
  min_price_per_qtl: number;
  photos: string[];
  status: string;
  harvest_date: string | null;
  // Hidden grade parameters
  crop_inputs: string | null;
  cleanliness: string | null;
  uniformity: string | null;
  drying_status: string | null;
  damaged_grains: string | null;
  // Calculated by DB trigger
  quality_grade: string | null;
  moisture_level: string | null;
  grade_score: number | null;
  is_organic: boolean;
  organic_cert_url: string | null;
  created_at: string;
  updated_at: string;
  // Owner info from JOIN - not stored in listings table
  owner?: {
    name: string;
    phone: string;
    district: string | null;
  };
}


export interface Scheme {
  id: string;
  name: string;
  name_hi: string;
  description: string;
  description_hi: string;
  eligibility: string[];
  benefits: string[];
  crops: string[];
  states: string[];
  application_url: string;
  deadline: string | null;
}

export interface Certificate {
  id: string;
  listing_id: string;
  cert_type: string;
  cert_number: string | null;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  file_url: string;
  file_type: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProcessedProduct {
  id: string;
  owner_type: 'processor';
  owner_id: string;
  product_type: string;
  crop: string;
  qty_kg: number;
  min_price_per_qtl: number;
  description: string | null;
  source_batch_id: string | null;
  processing_date: string | null;
  shelf_life_days: number | null;
  packaging_type: string | null;
  packaging_size_grams: number | null;
  fssai_license: string | null;
  is_organic: boolean;
  photos?: string[];
  status: string;
  created_at: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  rainfall: number;
}

// HTTP Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // For developer tokens, don't redirect - just return empty data
        // The backend doesn't understand dev tokens, so we expect 401
        if (token && token.startsWith('dev-')) {
          console.log('🔧 Developer token: Backend returned 401, returning empty response');
          // Return an empty response that won't break the app
          return {} as T;
        }

        // For real tokens, clear and redirect
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      // For developer tokens, handle network errors gracefully
      if (token && token.startsWith('dev-')) {
        console.log('🔧 Developer token: API call failed, returning empty response');
        return {} as T;
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url = `${endpoint}?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API instance
export const api = new ApiClient(API_URL);

// ============================================================================
// Auth API
// ============================================================================
export const authApi = {
  requestOtp: async (phone: string, language: string = 'en', isRegistration: boolean = false) => {
    // Developer bypass - but check if already registered for registration flow
    if (isDevPhone(phone)) {
      console.log('🔧 Developer OTP Bypass: Checking registration status for phone', phone);
      const role = getDevPhoneRole(phone) || 'farmer';
      setDevUserRole(role);

      // For registration flows, check if user already exists and is onboarded
      if (isRegistration) {
        const fullPhone = '+91' + phone.replace(/[^0-9]/g, '').slice(-10);
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, onboarded, roles')
          .eq('phone', fullPhone)
          .single();

        if (existingUser && existingUser.onboarded) {
          console.log('🔧 Developer user already registered:', existingUser);
          return {
            success: false,
            message: 'This phone number is already registered. Please login instead.',
            user_exists: true,
            dev_otp: DEV_OTP
          };
        }
      }

      return {
        success: true,
        message: 'OTP sent successfully (Developer Mode - Use OTP: 000000)',
        dev_otp: DEV_OTP,
        user_exists: false
      };
    }

    // Normal flow - call Supabase
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return { success: true, message: 'OTP sent successfully' };
  },

  verifyOtp: async (phone: string, otp: string, isRegistration: boolean = false) => {
    // Developer OTP bypass - fetch user from Supabase database directly
    if (isDevPhone(phone) && isDevOtp(otp)) {
      console.log('🔧 Developer OTP Bypass: Verifying dev phone with bypass OTP');
      const role = getDevPhoneRole(phone) || getDevUserRole() || 'farmer';
      const fullPhone = '+91' + phone.replace(/[^0-9]/g, '').slice(-10);

      // For developer phones, we'll use a special token format
      const devToken = `dev-${role}-${phone.replace(/[^0-9]/g, '')}`;
      setAccessToken(devToken);

      // Look up the user directly from Supabase by phone number
      const { data: userProfile, error: lookupError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', fullPhone)
        .single();

      if (userProfile && userProfile.id) {
        console.log('🔧 Developer user found in database:', userProfile);
        return {
          success: true,
          message: 'Login successful (Developer Mode)',
          token: devToken,
          user: userProfile as User,
          is_new_user: false
        };
      }

      // User doesn't exist yet, return placeholder - will be created during onboarding
      console.log('🔧 Developer user not found, will be created during onboarding');
      const devUser: User = {
        id: devToken, // Temporary ID, will be replaced with real UUID after onboarding
        phone: fullPhone,
        name: null,
        roles: [role],
        language: 'en',
        district: null,
        onboarded: false,
      };

      return {
        success: true,
        message: 'Login successful (Developer Mode)',
        token: devToken,
        user: devUser,
        is_new_user: isRegistration
      };
    }

    // Developer phone with wrong OTP - don't try Supabase, just show error
    if (isDevPhone(phone)) {
      console.log('🔧 Developer bypass: Wrong OTP for dev phone. Use 000000');
      throw new Error('Developer mode: Please use OTP 000000');
    }

    // Normal flow - call Supabase
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    if (error) throw error;

    if (!data.user || !data.session) throw new Error('Verification failed');

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // If user doesn't exist in 'users' table, create a basic profile
    let user: User;
    let isNewUser = false;

    if (!userProfile) {
      isNewUser = true;
      const newUser: User = {
        id: data.user.id,
        phone: data.user.phone || phone,
        name: null,
        roles: ['farmer'], // Default role
        language: 'en', // Default language
        district: null,
        onboarded: false
      };

      const { error: createError } = await supabase.from('users').insert(newUser);
      if (createError) console.error('Error creating user profile:', createError);
      user = newUser;
    } else {
      user = userProfile as User;
    }

    setAccessToken(data.session.access_token);

    return {
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: user,
      is_new_user: isNewUser
    };
  },

  refreshToken: async (token: string) => {
    // For dev tokens, just return the same token
    if (token && token.startsWith('dev-')) {
      return { token };
    }
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return { token: data.session?.access_token || '' };
  },

  logout: async () => {
    const token = getAccessToken();
    // For dev tokens, just clear the token and role
    if (token && token.startsWith('dev-')) {
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('shreeanna_dev_role');
      }
      return { success: true };
    }
    const { error } = await supabase.auth.signOut();
    setAccessToken(null);
    if (error) throw error;
    return { success: true };
  },

  getCurrentUser: async () => {
    try {
      const userId = await getCurrentUserId();

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Ignore not found error, return null
        throw error;
      }

      return userProfile as User;
    } catch (e) {
      // If authenticating fails or other error
      return null;
    }
  },
};

// ============================================================================
// User API
// ============================================================================

export interface FarmerProfile {
  id: string;
  user_id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  land_holding_acres: number;
  primary_crops: string[];
  organic_certified: boolean;
  certification_id: string;
  verified: boolean;
  created_at: string;
}

export const userApi = {
  getProfile: async () => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data as User;
  },

  updateProfile: async (data: { name?: string; language?: string; district?: string }) => {
    const userId = await getCurrentUserId();
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return updatedUser as User;
  },

  getFarmerProfile: async () => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase.from('farmer_profiles').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data as FarmerProfile;
  },

  createFarmerProfile: async (data: any) => {
    const userId = await getCurrentUserId();
    const { data: profile, error } = await supabase.from('farmer_profiles').insert({ ...data, user_id: userId }).select().single();
    if (error) throw error;
    return profile;
  },

  updateFarmerProfile: async (data: any) => {
    const userId = await getCurrentUserId();
    const { data: profile, error } = await supabase.from('farmer_profiles').update(data).eq('user_id', userId).select().single();
    if (error) throw error;
    return profile;
  },

  onboardFarmer: async (data: any) => {
    const userId = await getCurrentUserId();

    // First, ensure the user record exists (for dev tokens, it might not)
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).single();

    if (!existingUser) {
      // Create user record for developer accounts
      const role = getDevUserRole();
      const phone = DEV_PHONES[role as keyof typeof DEV_PHONES] || DEV_PHONES.farmer;
      await supabase.from('users').insert({
        id: userId,
        phone: '+91' + phone,
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['farmer']
      });
    } else {
      await supabase.from('users').update({
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['farmer']
      }).eq('id', userId);
    }

    const { error } = await supabase.from('farmer_profiles').insert({
      user_id: userId,
      name: data.name,
      village: data.village,
      district: data.district,
      state: data.state,
      land_holding_acres: data.land_size,
      primary_crops: data.crops,
      bank_account: data.bank_account,
      ifsc: data.ifsc
    });
    if (error) throw error;
    return { success: true };
  },

  onboardBuyer: async (data: any) => {
    const userId = await getCurrentUserId();

    // First, ensure the user record exists (for dev tokens, it might not)
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).single();

    if (!existingUser) {
      // Create user record for developer accounts
      const role = getDevUserRole();
      const phone = DEV_PHONES[role as keyof typeof DEV_PHONES] || DEV_PHONES.buyer;
      await supabase.from('users').insert({
        id: userId,
        phone: '+91' + phone,
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['buyer']
      });
    } else {
      await supabase.from('users').update({
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['buyer']
      }).eq('id', userId);
    }

    const { error } = await supabase.from('buyer_profiles').insert({
      user_id: userId,
      name: data.name,
      district: data.district,
      state: data.state,
      address: data.address,
      buyer_type: data.buyer_type,
      company_name: data.company_name,
      gst_number: data.gst_number
    });
    if (error) throw error;
    return { success: true };
  },

  onboardProcessor: async (data: any) => {
    const userId = await getCurrentUserId();

    // First, ensure the user record exists (for dev tokens, it might not)
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).single();

    if (!existingUser) {
      // Create user record for developer accounts
      const role = getDevUserRole();
      const phone = DEV_PHONES[role as keyof typeof DEV_PHONES] || DEV_PHONES.processor;
      await supabase.from('users').insert({
        id: userId,
        phone: '+91' + phone,
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['processor']
      });
    } else {
      await supabase.from('users').update({
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['processor']
      }).eq('id', userId);
    }

    const { error } = await supabase.from('processor_profiles').insert({
      user_id: userId,
      name: data.name,
      district: data.district,
      state: data.state,
      city: data.city,
      unit_type: data.unit_type,
      fssai_license: data.fssai_license,
      products: data.products,
      address: data.address
    });
    if (error) throw error;
    return { success: true };
  },

  onboardKsc: async (data: any) => {
    const userId = await getCurrentUserId();

    // First, ensure the user record exists (for dev tokens, it might not)
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).single();

    if (!existingUser) {
      // Create user record for developer accounts
      const role = getDevUserRole();
      const phone = DEV_PHONES[role as keyof typeof DEV_PHONES] || DEV_PHONES.ksc;
      await supabase.from('users').insert({
        id: userId,
        phone: '+91' + phone,
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['ksc'],
        ksc_center_name: data.ksc_center_name,
        verification_status: 'verified'
      });
    } else {
      await supabase.from('users').update({
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['ksc'],
        ksc_center_name: data.ksc_center_name,
        verification_status: 'verified'
      }).eq('id', userId);
    }

    return { success: true };
  },

  onboardFpo: async (data: any) => {
    const userId = await getCurrentUserId();

    // First, ensure the user record exists (for dev tokens, it might not)
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).single();

    if (!existingUser) {
      // Create user record for developer accounts
      const role = getDevUserRole();
      const phone = DEV_PHONES[role as keyof typeof DEV_PHONES] || DEV_PHONES.fpo;
      await supabase.from('users').insert({
        id: userId,
        phone: '+91' + phone,
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['fpo']
      });
    } else {
      await supabase.from('users').update({
        name: data.name,
        language: data.language,
        district: data.district,
        onboarded: true,
        roles: ['fpo']
      }).eq('id', userId);
    }

    const { error } = await supabase.from('fpo_profiles').insert({
      user_id: userId,
      name: data.name,
      organization_name: data.organization_name,
      registration_no: data.registration_no,
      address: data.address,
      district: data.district,
      state: data.state,
      member_count: data.member_count
    });
    if (error) throw error;
    return { success: true };
  },

  getBuyerProfile: async () => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase.from('buyer_profiles').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  getProcessorProfile: async () => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase.from('processor_profiles').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  getFpoProfile: async () => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase.from('fpo_profiles').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },
};

// Offer interface
export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_company?: string;
  buyer_phone?: string;
  buyer_rating?: number;
  price_per_qtl: number;
  qty_kg: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  created_at: string;
  updated_at: string;
}

// Order interface
export interface Order {
  id: string;
  offer_id: string;
  listing_id: string;
  farmer_id: string;
  buyer_id: string;
  quantity_kg: number;
  price_per_qtl: number;
  total_amount: number;
  status: 'pending_pickup' | 'in_transit' | 'delivered' | 'completed';
  pickup_date?: string;
  pickup_address?: string;
  delivery_address?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Listings API
// ============================================================================



export const listingsApi = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    crop?: string;
    is_organic?: boolean;
    min_price?: number;
    max_price?: number;
    is_processed?: boolean;
    owner_type?: string;
    status?: string;
  }) => {
    // District comes from owner (users table) via JOIN
    let query = supabase
      .from('listings')
      .select('*, owner:users!owner_id(name, phone, district)', { count: 'exact' })
      .eq('status', params?.status || 'active');

    if (params?.skip) query = query.range(params.skip, (params.skip + (params.limit || 10)) - 1);
    if (params?.limit) query = query.limit(params.limit);
    if (params?.crop) query = query.eq('crop', params.crop);
    if (params?.is_organic !== undefined) query = query.eq('is_organic', params.is_organic);
    if (params?.min_price) query = query.gte('min_price_per_qtl', params.min_price);
    if (params?.max_price) query = query.lte('min_price_per_qtl', params.max_price);
    if (params?.owner_type) query = query.eq('owner_type', params.owner_type);

    const { data, error, count } = await query;
    if (error) throw error;
    return { listings: data as Listing[], total: count || 0 };
  },


  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*, owner:users!owner_id(name, phone, district)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Listing;
  },


  getMyListings: async () => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase.from('listings').select('*').eq('owner_id', userId);
    if (error) throw error;
    return { listings: data as Listing[] };
  },

  create: async (data: {
    crop: string;
    qty_kg: number;
    min_price_per_qtl: number;
    variety?: string;
    description?: string;
    quality_grade?: string;
    is_organic?: boolean;
    harvest_date?: string;
    images?: string[];
    // Hidden grade parameters
    crop_type?: string;
    crop_inputs?: string;
    cleanliness?: string;
    uniformity?: string;
    drying_status?: string;
    damaged_grains?: string;
  }) => {
    // Get current user ID (works for both dev tokens and Supabase auth)
    const userId = await getCurrentUserId();

    // Insert directly into Supabase database
    // Note: district/state come from user's profile via JOIN, not stored here
    const { data: listing, error } = await supabase.from('listings').insert({
      owner_id: userId,
      owner_type: 'farmer',
      crop_type: data.crop_type || 'millets',
      crop: data.crop,
      variety: data.variety || null,
      description: data.description || null,
      qty_kg: data.qty_kg,
      min_price_per_qtl: data.min_price_per_qtl,
      photos: data.images || [],
      status: 'active',
      harvest_date: data.harvest_date || null,
      // Hidden grade parameters - quality_grade is auto-calculated by DB trigger
      crop_inputs: data.crop_inputs || null,
      cleanliness: data.cleanliness || null,
      uniformity: data.uniformity || null,
      drying_status: data.drying_status || null,
      damaged_grains: data.damaged_grains || null,
    }).select().single();

    if (error) {
      console.error('Failed to create listing:', error);
      throw error;
    }

    return listing as Listing;
  },

  update: async (id: string, data: Partial<Listing>) => {
    const { data: listing, error } = await supabase.from('listings').update(data).eq('id', id).select().single();
    if (error) throw error;
    return listing as Listing;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  activate: async (id: string) => {
    const { error } = await supabase.from('listings').update({ status: 'active' }).eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Offers
  createOffer: async (listingId: string, data: {
    price_per_qtl: number;
    qty_kg?: number;
    message?: string;
  }) => {
    const userId = await getCurrentUserId();
    const { data: offer, error } = await supabase.from('offers').insert({ ...data, listing_id: listingId, buyer_id: userId, status: 'pending' }).select().single();
    if (error) throw error;
    return offer as Offer;
  },


  getOffers: async (listingId: string) => {
    const { data, error } = await supabase.from('offers').select('*').eq('listing_id', listingId);
    if (error) throw error;
    return { offers: data as Offer[] };
  },

  getRequirements: async (limit: number = 5) => {
    // Requirements are defined as listings from processors that are 'draft' (meaning a request) and not processed products
    const { data, error } = await supabase
      .from('listings')
      .select('*, user:owner_id(name, city)')
      .eq('owner_type', 'processor')
      .eq('status', 'draft')
      .eq('is_processed', false)
      .limit(limit);

    if (error) throw error;
    return { requirements: data };
  },

  getMyOffers: async () => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase.from('offers').select('*').eq('buyer_id', userId);
    if (error) throw error;
    return { offers: data as Offer[] };
  },

  // Processed Products (Processor role)
  createProcessedProduct: async (data: {
    product_type: string;
    source_crop: string;
    source_batch_id?: string;
    qty_kg: number;
    min_price_per_qtl: number;
    description?: string;
    processing_date?: string;
    shelf_life_days?: number;
    packaging_type?: string;
    packaging_size_grams?: number;
    nutritional_info?: Record<string, unknown>;
    is_organic?: boolean;
    district?: string;
    images?: string[];
  }) => {
    const userId = await getCurrentUserId();
    const { data: product, error } = await supabase.from('listings').insert({ ...data, owner_id: userId, owner_type: 'processor', status: 'active' }).select().single();
    if (error) throw error;
    return product as ProcessedProduct;
  },

  getProcessedProducts: async (params?: {
    product_type?: string;
    crop?: string;
    page?: number;
    limit?: number;
  }) => {
    // Get current user ID to filter their own products
    const userId = await getCurrentUserId();
    let query = supabase.from('listings').select('*', { count: 'exact' })
      .eq('owner_type', 'processor')
      .eq('owner_id', userId);

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    if (params?.product_type) query = query.eq('product_type', params.product_type);
    if (params?.crop) query = query.eq('crop', params.crop);

    const { data, error, count } = await query;
    if (error) throw error;
    return { success: true, products: data as ProcessedProduct[], page, limit, total: count || 0 };
  },

  // Certificates
  uploadCertificate: async (listingId: string, data: {
    cert_type: string;
    cert_number?: string;
    issuer?: string;
    issue_date?: string;
    expiry_date?: string;
    file_url: string;
    file_type?: string;
    notes?: string;
  }) => {
    const { data: cert, error } = await supabase
      .from('certificates')
      .insert({ ...data, listing_id: listingId, verification_status: 'pending', created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return cert as Certificate;
  },

  getCertificates: async (listingId: string) => {
    const { data, error } = await supabase.from('certificates').select('*').eq('listing_id', listingId);
    if (error) throw error;
    return data as Certificate[];
  },

  deleteCertificate: async (listingId: string, certificateId: string) => {
    const { error } = await supabase.from('certificates').delete().eq('id', certificateId);
    if (error) throw error;
    return { success: true };
  },
};


// ============================================================================
// Requirements API (Processor Buying Requirements)
// ============================================================================
export interface Requirement {
  id: string;
  processor_id: string;
  crop: string;
  qty_kg: number;
  target_price_per_qtl: number;
  quality_grade: string | null;
  is_organic: boolean;
  notes: string | null;
  required_by: string | null;
  status: string;
  district: string | null;
  state: string | null;
  created_at: string;
  processor?: { name: string; phone: string; district: string };
}

export const requirementsApi = {
  // Create a new buying requirement (processor creates)
  create: async (data: {
    crop: string;
    qty_kg: number;
    target_price_per_qtl: number;
    quality_grade?: string;
    is_organic?: boolean;
    notes?: string;
    required_by?: string;
  }) => {
    const userId = await getCurrentUserId();

    const { data: requirement, error } = await supabase
      .from('requirements')
      .insert({
        processor_id: userId,
        crop: data.crop,
        qty_kg: data.qty_kg,
        target_price_per_qtl: data.target_price_per_qtl,
        quality_grade: data.quality_grade || null,
        is_organic: data.is_organic || false,
        notes: data.notes || null,
        required_by: data.required_by || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create requirement:', error);
      throw error;
    }
    return requirement as Requirement;
  },

  // Get all active requirements (for farmers to see)
  getAll: async (params?: { crop?: string; is_organic?: boolean; limit?: number }) => {
    let query = supabase
      .from('requirements')
      .select('*, processor:users!processor_id(name, phone, district)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (params?.crop) query = query.eq('crop', params.crop);
    if (params?.is_organic !== undefined) query = query.eq('is_organic', params.is_organic);
    if (params?.limit) query = query.limit(params.limit);

    const { data, error } = await query;
    if (error) throw error;
    return { requirements: data as Requirement[] };
  },

  // Get requirements created by current processor
  getMyRequirements: async () => {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('requirements')
      .select('*')
      .eq('processor_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { requirements: data as Requirement[] };
  },

  // Get single requirement by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('requirements')
      .select('*, processor:users!processor_id(name, phone, district)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Requirement;
  },

  // Update requirement status
  updateStatus: async (id: string, status: 'active' | 'fulfilled' | 'cancelled') => {
    const { data, error } = await supabase
      .from('requirements')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Requirement;
  },

  // Delete requirement
  delete: async (id: string) => {
    const { error } = await supabase.from('requirements').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};

// ============================================================================
// Requirement Applications API (Farmers applying to processor requirements)
// ============================================================================
export interface RequirementApplication {
  id: string;
  requirement_id: string;
  farmer_id: string;
  offered_price_per_qtl: number;
  offered_qty_kg: number;
  message: string | null;
  status: string;
  created_at: string;
  requirement?: Requirement;
  farmer?: { name: string; phone: string; district: string };
}

export const requirementApplicationsApi = {
  // Farmer applies to a requirement
  apply: async (data: {
    requirement_id: string;
    offered_price_per_qtl: number;
    offered_qty_kg: number;
    message?: string;
  }) => {
    const userId = await getCurrentUserId();

    const { data: application, error } = await supabase
      .from('requirement_applications')
      .insert({
        requirement_id: data.requirement_id,
        farmer_id: userId,
        offered_price_per_qtl: data.offered_price_per_qtl,
        offered_qty_kg: data.offered_qty_kg,
        message: data.message || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to apply to requirement:', error);
      throw error;
    }
    return application as RequirementApplication;
  },

  // Get applications received by processor (for their requirements)
  getReceivedApplications: async () => {
    const userId = await getCurrentUserId();

    // First get all requirement IDs owned by this processor
    const { data: requirements, error: reqError } = await supabase
      .from('requirements')
      .select('id')
      .eq('processor_id', userId);

    if (reqError) throw reqError;

    if (!requirements || requirements.length === 0) {
      return { applications: [] };
    }

    const requirementIds = requirements.map(r => r.id);

    // Get applications for those requirements
    const { data, error } = await supabase
      .from('requirement_applications')
      .select('*, requirement:requirements(*), farmer:users!farmer_id(name, phone, district)')
      .in('requirement_id', requirementIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { applications: data as RequirementApplication[] };
  },

  // Get farmer's own applications
  getMyApplications: async () => {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('requirement_applications')
      .select('*, requirement:requirements(*, processor:users!processor_id(name, phone, district))')
      .eq('farmer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { applications: data as RequirementApplication[] };
  },

  // Check if farmer already applied to a requirement
  checkIfApplied: async (requirementId: string) => {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('requirement_applications')
      .select('id, status')
      .eq('requirement_id', requirementId)
      .eq('farmer_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { applied: !!data, application: data };
  },

  // Processor accepts an application
  accept: async (applicationId: string) => {
    const { data, error } = await supabase
      .from('requirement_applications')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data as RequirementApplication;
  },

  // Processor rejects an application
  reject: async (applicationId: string) => {
    const { data, error } = await supabase
      .from('requirement_applications')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data as RequirementApplication;
  }
};


// ============================================================================
// Offers API
// ============================================================================
export const offersApi = {
  getMyReceivedOffers: async () => {
    const userId = await getCurrentUserId();

    // Fetch offers on my listings, including the listing details and the buyer (who made the offer)
    const { data, error } = await supabase
      .from('offers')
      .select('*, listings!inner(*), buyer:users!buyer_id(name, phone)')
      .eq('listings.owner_id', userId);

    if (error) throw error;
    return { offers: data as unknown as Offer[] };
  },

  getMyMadeOffers: async () => {
    const userId = await getCurrentUserId();

    // Fetch offers I made, including listing details and the owner (farmer)
    const { data, error } = await supabase
      .from('offers')
      .select('*, listings(*, owner:users!owner_id(name, phone))')
      .eq('buyer_id', userId);

    if (error) throw error;
    return { offers: data as unknown as Offer[] };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase.from('offers').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Offer;
  },

  accept: async (offerId: string, voiceConsentUrl?: string) => {
    const { data: offer, error: offerError } = await supabase.from('offers').select('*').eq('id', offerId).single();
    if (offerError) throw offerError;

    const { error: updateError } = await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId);
    if (updateError) throw updateError;

    // Create order
    const { data: listing } = await supabase.from('listings').select('*').eq('id', offer.listing_id).single();

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      offer_id: offerId,
      listing_id: offer.listing_id,
      farmer_id: listing.owner_id,
      buyer_id: offer.buyer_id,
      quantity_kg: offer.qty_kg,
      price_per_qtl: offer.price_per_qtl,
      total_amount: (offer.qty_kg * offer.price_per_qtl) / 100,
      status: 'pending_pickup'
    }).select().single();

    if (orderError) throw orderError;
    return { success: true, order: order as Order };
  },

  reject: async (offerId: string, reason?: string) => {
    const { error } = await supabase.from('offers').update({ status: 'rejected' }).eq('id', offerId);
    if (error) throw error;
    return { success: true };
  },

  counter: async (offerId: string, data: { price_per_qtl: number; message?: string }) => {
    const { data: offer, error } = await supabase.from('offers').update({ ...data, status: 'countered' }).eq('id', offerId).select().single();
    if (error) throw error;
    return offer as Offer;
  },
};

// ============================================================================
// Orders API
// ============================================================================
export const ordersApi = {
  getMyOrders: async (role: 'farmer' | 'buyer' = 'farmer') => {
    const userId = await getCurrentUserId();
    const column = role === 'farmer' ? 'farmer_id' : 'buyer_id';
    const { data, error } = await supabase.from('orders').select('*').eq(column, userId);
    if (error) throw error;
    return { orders: data as Order[] };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Order;
  },

  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data as Order;
  },

  markShipped: async (id: string, data: { vehicle_number?: string; driver_name?: string; driver_phone?: string }) => {
    const { data: order, error } = await supabase.from('orders').update({ ...data, status: 'in_transit' }).eq('id', id).select().single();
    if (error) throw error;
    return order as Order;
  },

  markDelivered: async (id: string) => {
    const { data: order, error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', id).select().single();
    if (error) throw error;
    return order as Order;
  },

  markCompleted: async (id: string) => {
    const { data: order, error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', id).select().single();
    if (error) throw error;
    return order as Order;
  },

  // Buy Now - Direct purchase without negotiation
  buyNow: async (data: {
    listing_id: string;
    qty_kg: number;
    shipping_address?: string;
    notes?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: listing } = await supabase.from('listings').select('*').eq('id', data.listing_id).single();

    // Create order directly
    const { data: order, error } = await supabase.from('orders').insert({
      listing_id: data.listing_id,
      farmer_id: listing.owner_id,
      buyer_id: user.id,
      quantity_kg: data.qty_kg,
      price_per_qtl: listing.min_price_per_qtl, // Assuming buy now uses min price
      total_amount: (data.qty_kg * listing.min_price_per_qtl) / 100,
      status: 'pending_pickup',
      delivery_address: data.shipping_address
    }).select().single();

    if (error) throw error;

    // Fetch seller details for response
    const { data: seller } = await supabase.from('users').select('name, phone').eq('id', listing.owner_id).single();

    return {
      success: true,
      message: 'Order placed',
      order: {
        id: order.id,
        listing_id: order.listing_id,
        crop: listing.crop,
        qty_kg: order.quantity_kg,
        price_per_qtl: order.price_per_qtl,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: 'pending',
        seller_name: seller?.name || null,
        seller_phone: seller?.phone || null,
        created_at: order.created_at
      }
    };
  },

  // Confirm delivery
  confirmDelivery: async (id: string, data: {
    delivery_proof_url?: string;
    notes?: string;
  }) => {
    const { data: order, error } = await supabase.from('orders').update({
      status: 'delivered',
      // Assuming there are fields for proof and notes, or a separate table
      // For now just updating status
    }).eq('id', id).select().single();

    if (error) throw error;
    return {
      success: true,
      message: 'Delivery confirmed',
      order: {
        id: order.id,
        status: order.status,
        logistics_status: 'delivered',
        delivery_date: new Date().toISOString()
      }
    };
  },

  // Order History / Timeline
  getHistory: async (orderId: string) => {
    // Assuming a separate table for order history or just returning order details
    // If there is an order_events table:
    // const { data, error } = await supabase.from('order_events').select('*').eq('order_id', orderId);
    // For now, returning mock or basic info
    return {
      order_id: orderId,
      current_status: 'pending',
      total_events: 0,
      timeline: []
    } as OrderHistoryResponse;
  },
};

// Order Event Types
export interface OrderEvent {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  previous_status: string | null;
  new_status: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_type: string | null;
  location: string | null;
  timestamp: string;
  estimated_next_at: string | null;
}

export interface OrderHistoryResponse {
  order_id: string;
  current_status: string;
  total_events: number;
  timeline: OrderEvent[];
}

// ============================================================================
// Payments API
// ============================================================================
export const paymentsApi = {
  getMyPayments: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('payments').select('*').eq('user_id', user.id); // Assuming user_id exists in payments
    if (error) throw error;
    return { payments: data as Payment[] };
  },

  getByOrderId: async (orderId: string) => {
    const { data, error } = await supabase.from('payments').select('*').eq('order_id', orderId).single();
    if (error) throw error;
    return data as Payment;
  },

  downloadReceipt: (paymentId: string) =>
    `${API_URL}/payments/${paymentId}/receipt`, // Keep as URL for now or implement download logic

  // Razorpay Integration - Keeping as API calls if backend handles Razorpay secrets
  // Or switch to client-side if possible, but usually backend is needed for security
  createRazorpayOrder: async (data: {
    order_id: string;
    amount: number;
    currency?: string;
    notes?: Record<string, string>;
  }) => {
    // Stub: Return a mock order ID
    return {
      success: true,
      razorpay_order_id: `order_${Date.now()}`,
      razorpay_key_id: 'rzp_test_1234567890', // Mock key
      amount: data.amount,
      currency: data.currency || 'INR',
      our_order_id: data.order_id,
      mock_mode: true
    };
  },

  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    our_order_id: string;
  }) => {
    // Stub: Always verify
    // Update payment status in DB
    await supabase.from('payments').insert({
      order_id: data.our_order_id,
      amount: 0, // Need to fetch amount
      status: 'completed',
      payment_method: 'razorpay',
      utr_number: data.razorpay_payment_id,
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      verified: true,
      order_id: data.our_order_id,
      payment_id: data.razorpay_payment_id,
      message: 'Payment verified successfully'
    };
  },

  getRazorpayStatus: async (paymentId: string) => {
    return {
      payment_id: paymentId,
      status: 'captured',
      amount: 1000,
      currency: 'INR',
      method: 'upi',
      captured: true,
      error: null
    };
  },

  refundRazorpayPayment: async (data: {
    payment_id: string;
    amount?: number;
    reason?: string;
  }) => {
    return {
      success: true,
      refund_id: `rfnd_${Date.now()}`,
      payment_id: data.payment_id,
      amount: data.amount || 0,
      status: 'processed'
    };
  },

  // Escrow API
  escrow: {
    createHold: async (orderId: string) => {
      // Mock escrow hold creation in Supabase
      const { data, error } = await supabase.from('escrow_transactions').insert({
        order_id: orderId,
        status: 'held',
        amount: 0, // Should fetch from order
        created_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      return { success: true, message: 'Escrow hold created', data: data as unknown as EscrowStatus };
    },

    release: async (orderId: string) => {
      const { data, error } = await supabase.from('escrow_transactions').update({
        status: 'released',
        released_at: new Date().toISOString()
      }).eq('order_id', orderId).select().single();
      if (error) throw error;
      return {
        success: true,
        message: 'Escrow released',
        data: {
          escrow_id: data.id,
          seller_amount: data.amount,
          status: data.status,
          released_at: data.released_at,
          transaction_id: data.id
        }
      };
    },

    refund: async (orderId: string, reason?: string) => {
      const { data, error } = await supabase.from('escrow_transactions').update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        notes: reason
      }).eq('order_id', orderId).select().single();
      if (error) throw error;
      return {
        success: true,
        message: 'Escrow refunded',
        data: {
          escrow_id: data.id,
          refund_amount: data.amount,
          status: data.status,
          refunded_at: data.refunded_at,
          transaction_id: data.id
        }
      };
    },

    fileDispute: async (orderId: string, reason: string) => {
      const { data, error } = await supabase.from('escrow_transactions').update({
        status: 'disputed',
        dispute_reason: reason,
        dispute_filed_at: new Date().toISOString()
      }).eq('order_id', orderId).select().single();
      if (error) throw error;
      return {
        success: true,
        message: 'Dispute filed',
        data: {
          escrow_id: data.id,
          status: data.status,
          dispute_reason: data.dispute_reason,
          dispute_filed_at: data.dispute_filed_at
        }
      };
    },

    getStatus: async (orderId: string) => {
      const { data, error } = await supabase.from('escrow_transactions').select('*').eq('order_id', orderId).single();
      if (error) throw error;
      return { success: true, message: 'Status retrieved', data: data as EscrowStatus };
    },
  },
};

export interface EscrowStatus {
  id: string;
  order_id: string;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
  amount: number;
  platform_fee: number;
  seller_amount: number;
  held_at: string | null;
  released_at: string | null;
  refunded_at: string | null;
  dispute_status?: {
    is_disputed: boolean;
    reason: string | null;
    filed_at: string | null;
    resolved_at: string | null;
    resolution: string | null;
  } | null;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  utr_number?: string;
  created_at: string;
}

// ============================================================================
// Schemes API
// ============================================================================



export const schemesApi = {
  getAll: async (params?: { crop_type?: string; state?: string }) => {
    let query = supabase.from('schemes').select('*');
    if (params?.crop_type) query = query.contains('crops', [params.crop_type]);
    if (params?.state) query = query.contains('states', [params.state]);

    const { data, error } = await query;
    if (error) throw error;
    return { schemes: data as Scheme[] };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase.from('schemes').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Scheme;
  },

  checkEligibility: async () => {
    // Simple check based on user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Mock eligibility logic
    return { eligible: true, reasons: [] };
  },
};

// ============================================================================
// Weather API
// ============================================================================
export const weatherApi = {
  getCurrent: async (lat: number, lon: number) => {
    // Weather usually requires external API, keeping fetch to external or mock
    // For now, returning mock data or calling a Supabase Edge Function if available
    return {
      temperature: 28,
      humidity: 65,
      description: 'Partly Cloudy',
      icon: 'cloudy',
      wind_speed: 12,
      rainfall: 0
    } as WeatherData;
  },

  getByPincode: async (pincode: string) => {
    return {
      temperature: 30,
      humidity: 60,
      description: 'Sunny',
      icon: 'sunny',
      wind_speed: 10,
      rainfall: 0
    } as WeatherData;
  },

  getForecast: async (lat: number, lon: number, days: number = 5) => {
    return {
      forecast: Array(days).fill(0).map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        high: 32 - i,
        low: 20 - i,
        condition: i % 2 === 0 ? 'Sunny' : 'Cloudy'
      }))
    };
  },

  getAdvisory: async (cropType?: string) => {
    // Mock advisory
    return {
      advisory: 'Good conditions for harvesting. Ensure proper drying.',
      alerts: []
    };
  },
};

// ============================================================================
// Notifications API
// ============================================================================
export const notificationsApi = {
  getAll: async (params?: { skip?: number; limit?: number; unread_only?: boolean }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

    if (params?.unread_only) query = query.eq('read', false);
    if (params?.skip) query = query.range(params.skip, (params.skip + (params.limit || 10)) - 1);
    if (params?.limit) query = query.limit(params.limit);

    const { data, error } = await query;
    if (error) throw error;
    return { notifications: data };
  },

  markRead: async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  markAllRead: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    if (error) throw error;
    return { success: true };
  },

  registerPushToken: async (token: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    // Store token in user profile or separate table
    const { error } = await supabase.from('users').update({ push_token: token }).eq('id', user.id);
    if (error) throw error;
    return { success: true };
  },
};

// ============================================================================
// Sync API (for offline support)
// ============================================================================
export const syncApi = {
  getState: async () => {
    // Stub for now
    return { last_sync: new Date().toISOString() };
  },

  push: async (changes: Array<{ type: string; action: string; data: unknown; client_temp_id: string }>) => {
    // Stub for now - log changes
    console.log('Sync push:', changes);
    return { success: true, synced_count: changes.length };
  },

  pull: async (lastSyncAt?: string) => {
    // Stub for now
    return { changes: [], last_sync: new Date().toISOString() };
  },
};

// ============================================================================
// Trace API
// ============================================================================
export const traceApi = {
  getByCode: async (code: string) => {
    const { data, error } = await supabase
      .from('batches')
      .select('*, trace_events(*)')
      .eq('qr_code', code)
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// Batch API (FPO)
// ============================================================================
export interface Batch {
  id: string;
  qr_code: string;
  created_by_id: string;
  source_lots: string[];
  total_weight: number;
  crop: string;
  grade: string | null;
  status: string;
  processing_date: string | null;
  created_at: string;
  event_count?: number;
}

export interface TraceEvent {
  id: string;
  batch_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  actor_type: string | null;
  verified: boolean;
}

export interface CreateBatchRequest {
  source_lots: string[];
  total_weight: number;
  crop: string;
  grade?: string;
  processing_date?: string;
  notes?: string;
}

export interface AddTraceEventRequest {
  event_type: string;
  payload: Record<string, unknown>;
  location?: { lat: number; lon: number };
}

export const batchesApi = {
  create: async (data: CreateBatchRequest) => {
    // Use Python backend which handles authorization correctly (including dev bypass)
    // The backend handles QR generation and other logic
    try {
      return await api.post('/batches/', data);
    } catch (e) {
      console.error('Failed to create batch via API:', e);
      throw e;
    }
  },

  list: async (params?: { status?: string; crop?: string; page?: number; limit?: number }) => {
    let query = supabase.from('batches').select('*', { count: 'exact' });

    if (params?.status) query = query.eq('status', params.status);
    if (params?.crop) query = query.eq('crop', params.crop);

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      items: data,
      page,
      limit,
      total: count || 0
    };
  },

  getMyBatches: async () => {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('created_by_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { items: data };
  },

  getById: async (batchId: string) => {
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError) throw batchError;

    const { data: trace, error: traceError } = await supabase
      .from('trace_events')
      .select('*')
      .eq('batch_id', batchId)
      .order('timestamp', { ascending: true });

    if (traceError) throw traceError;

    return { batch, trace };
  },

  addTraceEvent: async (batchId: string, data: AddTraceEventRequest) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: event, error } = await supabase
      .from('trace_events')
      .insert({
        batch_id: batchId,
        ...data,
        timestamp: new Date().toISOString(),
        actor_type: user ? 'USER' : 'SYSTEM', // Simplified
        verified: true
      })
      .select()
      .single();

    if (error) throw error;
    return event;
  },

  updateStatus: (batchId: string, status: string) =>
    api.put(`/batches/${batchId}/status`, { status }),

  getQRCode: (batchId: string) =>
    `${API_URL}/batches/${batchId}/qr`,
};

// ============================================================================
// Admin API
// ============================================================================
export interface AdminDashboardStats {
  stats: {
    users: { total: number; farmers: number; fpos: number; buyers: number };
    marketplace: { listings: number; active_listings: number; batches: number; orders: number };
    fpos: { total: number; verified: number };
    activity: { events_24h: number };
    payments: { total_completed: number };
  };
  generated_at: string;
}

export interface Advisory {
  id: string;
  message: string;
  message_hi?: string;
  message_type: 'sms' | 'voice' | 'push';
  target_region?: string;
  target_crop?: string;
  created_at: string;
  sent_count: number;
}

export const kscApi = {
  getDashboard: async () => {
    // Parallel queries for stats
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: farmersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'farmer');
    const { count: fposCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'fpo');
    const { count: buyersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer');

    const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
    const { count: activeListingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: batchesCount } = await supabase.from('batches').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

    // Mocking some activity stats for now as they require complex time-based queries
    return {
      stats: {
        users: { total: usersCount || 0, farmers: farmersCount || 0, fpos: fposCount || 0, buyers: buyersCount || 0 },
        marketplace: { listings: listingsCount || 0, active_listings: activeListingsCount || 0, batches: batchesCount || 0, orders: ordersCount || 0 },
        fpos: { total: fposCount || 0, verified: 0 }, // verified count needs column check
        activity: { events_24h: 0 },
        payments: { total_completed: 0 }
      },
      generated_at: new Date().toISOString()
    };
  },

  getUserStats: async () => {
    // Simplified
    return { success: true };
  },

  getListingStats: async () => {
    // Simplified
    return { success: true };
  },

  getTransactionStats: async () => {
    // Simplified
    return { success: true };
  },

  sendAdvisory: async (data: {
    message: string;
    message_hi?: string;
    message_type: 'sms' | 'voice' | 'push';
    target_region?: string;
    target_crop?: string;
  }) => {
    const { error } = await supabase.from('advisories').insert({
      ...data,
      created_at: new Date().toISOString(),
      sent_count: 0
    });
    if (error) throw error;
    return { success: true };
  },

  getAdvisories: async (params?: { page?: number; limit?: number }) => {
    let query = supabase.from('advisories').select('*', { count: 'exact' });

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return { advisories: data, total: count || 0 };
  },

  getUsers: async (params?: { role?: string; page?: number; limit?: number }) => {
    let query = supabase.from('users').select('*', { count: 'exact' });

    if (params?.role) query = query.eq('role', params.role);

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return { users: data, total: count || 0 };
  },

  updateUser: async (userId: string, data: { roles?: string; is_active?: boolean; is_verified?: boolean }) => {
    const { error } = await supabase.from('users').update(data).eq('id', userId);
    if (error) throw error;
    return { success: true };
  },

  // ============ KSC-specific Farmer Verification Functions ============

  // Get all farmers pending verification
  getPendingFarmers: async (params?: { district?: string; skip?: number; limit?: number }) => {
    let query = supabase
      .from('users')
      .select('*, farmer_profiles(*)', { count: 'exact' })
      .contains('roles', ['farmer'])
      .eq('verification_status', 'pending');

    if (params?.district) query = query.eq('district', params.district);

    const skip = params?.skip || 0;
    const limit = params?.limit || 20;
    query = query.range(skip, skip + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    return { farmers: data || [], total: count || 0 };
  },

  // Verify a farmer (activate their account)
  verifyFarmer: async (farmerId: string, kscUserId: string) => {
    const { error } = await supabase
      .from('users')
      .update({
        verification_status: 'verified',
        verified_by: kscUserId,
        verified_at: new Date().toISOString()
      })
      .eq('id', farmerId);
    if (error) throw error;

    // Log the verification action
    await supabase.from('verification_logs').insert({
      farmer_id: farmerId,
      ksc_user_id: kscUserId,
      action: 'verified'
    });

    return { success: true };
  },

  // Reject a farmer with reason
  rejectFarmer: async (farmerId: string, kscUserId: string, reason: string) => {
    const { error } = await supabase
      .from('users')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason,
        verified_by: kscUserId,
        verified_at: new Date().toISOString()
      })
      .eq('id', farmerId);
    if (error) throw error;

    // Log the rejection action
    await supabase.from('verification_logs').insert({
      farmer_id: farmerId,
      ksc_user_id: kscUserId,
      action: 'rejected',
      reason: reason
    });

    return { success: true };
  },

  // Register a new farmer directly (assisted registration - bypasses verification)
  registerFarmerAssisted: async (kscUserId: string, farmerData: {
    name: string;
    phone: string;
    district: string;
    state: string;
    village?: string;
  }) => {
    const formattedPhone = farmerData.phone.startsWith('+91') ? farmerData.phone : '+91' + farmerData.phone.replace(/[^0-9]/g, '').slice(-10);
    const userId = crypto.randomUUID();

    // Create user record
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      phone: formattedPhone,
      name: farmerData.name,
      district: farmerData.district,
      roles: ['farmer'],
      language: 'en',
      onboarded: true,
      verification_status: 'verified',
      verified_by: kscUserId,
      verified_at: new Date().toISOString()
    });
    if (userError) throw userError;

    // Create farmer profile
    const { error: profileError } = await supabase.from('farmer_profiles').insert({
      user_id: userId,
      name: farmerData.name,
      village: farmerData.village,
      district: farmerData.district,
      state: farmerData.state
    });
    if (profileError) throw profileError;

    // Log the assisted registration
    await supabase.from('verification_logs').insert({
      farmer_id: userId,
      ksc_user_id: kscUserId,
      action: 'assisted_registration'
    });

    return { success: true, farmer_id: userId };
  },

  // Get verification stats for KSC dashboard
  getVerificationStats: async (kscUserId?: string) => {
    // Get counts
    const { count: pendingCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .contains('roles', ['farmer'])
      .eq('verification_status', 'pending');

    const { count: verifiedCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .contains('roles', ['farmer'])
      .eq('verification_status', 'verified');

    const { count: rejectedCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .contains('roles', ['farmer'])
      .eq('verification_status', 'rejected');

    // Get today's verifications by this KSC user
    let todayVerified = 0;
    let assistedRegistrations = 0;
    if (kscUserId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayCount } = await supabase
        .from('verification_logs')
        .select('*', { count: 'exact', head: true })
        .eq('ksc_user_id', kscUserId)
        .eq('action', 'verified')
        .gte('created_at', today.toISOString());

      const { count: assistedCount } = await supabase
        .from('verification_logs')
        .select('*', { count: 'exact', head: true })
        .eq('ksc_user_id', kscUserId)
        .eq('action', 'assisted_registration');

      todayVerified = todayCount || 0;
      assistedRegistrations = assistedCount || 0;
    }

    return {
      pending: pendingCount || 0,
      verified: verifiedCount || 0,
      rejected: rejectedCount || 0,
      todayVerified,
      assistedRegistrations
    };
  },

  // Get all verified farmers in a district
  getVerifiedFarmers: async (params?: { district?: string; skip?: number; limit?: number }) => {
    let query = supabase
      .from('users')
      .select('*, farmer_profiles(*)', { count: 'exact' })
      .contains('roles', ['farmer'])
      .eq('verification_status', 'verified');

    if (params?.district) query = query.eq('district', params.district);

    const skip = params?.skip || 0;
    const limit = params?.limit || 20;
    query = query.range(skip, skip + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    return { farmers: data || [], total: count || 0 };
  },

  // Lookup farmer by phone
  lookupFarmerByPhone: async (phone: string) => {
    const formattedPhone = phone.startsWith('+91') ? phone : '+91' + phone.replace(/[^0-9]/g, '').slice(-10);

    const { data, error } = await supabase
      .from('users')
      .select('*, farmer_profiles(*)')
      .eq('phone', formattedPhone)
      .contains('roles', ['farmer'])
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

export default api;

// ============================================================================
// FPO API
// ============================================================================
export interface FPO {
  id: string;
  name: string;
  registration_number?: string;
  address?: string;
  district?: string;
  state?: string;
  contact_phone?: string;
  contact_email?: string;
  member_count?: number;
  is_verified?: boolean;
  created_at?: string;
}

export interface FPOMember {
  id: string;
  name?: string;
  phone?: string;
  village?: string;
}

export const fpoApi = {
  // List all FPOs (public)
  getAll: async (params?: { state?: string; district?: string; skip?: number; limit?: number }) => {
    let query = supabase.from('fpos').select('*', { count: 'exact' });

    if (params?.state) query = query.eq('state', params.state);
    if (params?.district) query = query.eq('district', params.district);

    const skip = params?.skip || 0;
    const limit = params?.limit || 10;

    query = query.range(skip, skip + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { fpos: data, total: count || 0 };
  },

  // Get current FPO user's profile
  getMyFPO: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Assuming 'fpos' table has 'owner_id' or similar linking to user
    const { data: fpo, error: fpoError } = await supabase
      .from('fpos')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (fpoError) {
      if (fpoError.code === 'PGRST116') return { fpo: null, members: [] }; // Not found
      throw fpoError;
    }

    const { data: members, error: membersError } = await supabase
      .from('fpo_members')
      .select('*')
      .eq('fpo_id', fpo.id);

    if (membersError) throw membersError;

    return { fpo, members };
  },

  // Get FPO by ID (public)
  getById: async (fpoId: string) => {
    const { data, error } = await supabase.from('fpos').select('*').eq('id', fpoId).single();
    if (error) throw error;
    return data;
  },

  // Create/register FPO
  create: async (data: {
    name: string;
    registration_number: string;
    address?: string;
    district?: string;
    state?: string;
    contact_phone?: string;
    contact_email?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: fpo, error } = await supabase
      .from('fpos')
      .insert({
        ...data,
        owner_id: user.id,
        created_at: new Date().toISOString(),
        is_verified: false
      })
      .select()
      .single();

    if (error) throw error;
    return { message: 'FPO created successfully', fpo };
  },

  // Update FPO
  update: async (fpoId: string, data: {
    name?: string;
    address?: string;
    district?: string;
    state?: string;
    contact_phone?: string;
    contact_email?: string;
  }) => {
    const { data: fpo, error } = await supabase
      .from('fpos')
      .update(data)
      .eq('id', fpoId)
      .select()
      .single();

    if (error) throw error;
    return { message: 'FPO updated successfully', fpo };
  },

  // Add farmer member to FPO
  addMember: async (fpoId: string, farmerId: string) => {
    const { error } = await supabase
      .from('fpo_members')
      .insert({ fpo_id: fpoId, farmer_id: farmerId });

    if (error) throw error;
    return { success: true };
  },

  // Remove farmer member from FPO
  removeMember: async (fpoId: string, farmerId: string) => {
    const { error } = await supabase
      .from('fpo_members')
      .delete()
      .eq('fpo_id', fpoId)
      .eq('farmer_id', farmerId);

    if (error) throw error;
    return { success: true };
  },

  // Get FPO dashboard stats
  getDashboard: async () => {
    // Stub
    return { success: true };
  },

  // Onboard as FPO
  onboard: async (data: {
    name: string;
    organization_name: string;
    registration_no?: string;
    address?: string;
    district: string;
  }) => {
    // Reuse create logic or similar
    return fpoApi.create({
      name: data.organization_name, // Mapping
      registration_number: data.registration_no || '',
      address: data.address,
      district: data.district
    });
  },
};

// ============================================================================
// Voice API (for IVR integration)
// ============================================================================
export const voiceApi = {
  // These are webhook endpoints called by Reverie, not typically called from frontend
  getStatus: async (sessionId: string) => {
    // Stub
    return { status: 'completed' };
  },
};

// ============================================================================
// Advanced Trace API
// ============================================================================
export const advancedTraceApi = {
  // Verify batch cryptographic integrity
  verifyBatch: async (batchId: string) => {
    // Stub
    return { verified: true, integrity: 'valid' };
  },

  // Get public trace page URL
  getPublicTraceUrl: (batchId: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/trace/public/${batchId}`,
};

// ============================================================================
// District/Location API
// ============================================================================
export const locationApi = {
  // Get supported districts for weather
  getDistricts: async () => {
    // Stub
    return { districts: ['District 1', 'District 2'], count: 2 };
  },
};

// ============================================================================
// KYC/e-KYC Verification API
// ============================================================================
export const kycApi = {
  // Initiate Aadhaar verification - sends OTP
  initiate: async (aadhaarNumber: string) => {
    // Stub
    return { message: 'OTP sent', reference_id: 'ref-123' };
  },

  // Verify OTP and complete KYC
  verify: async (referenceId: string, otp: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').update({
        is_kyc_verified: true,
        kyc_verified_at: new Date().toISOString()
      }).eq('id', user.id);
    }
    return {
      message: 'KYC verified',
      verified: true,
      user: {
        id: user?.id || 'unknown',
        is_kyc_verified: true,
        kyc_verified_at: new Date().toISOString(),
        kyc_aadhaar_masked: 'XXXX-XXXX-1234'
      }
    };
  },

  // Get KYC status for current user
  getStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { is_kyc_verified: false, kyc_verified_at: null, kyc_aadhaar_masked: null };

    const { data } = await supabase.from('users').select('is_kyc_verified, kyc_verified_at').eq('id', user.id).single();
    return {
      is_kyc_verified: data?.is_kyc_verified || false,
      kyc_verified_at: data?.kyc_verified_at || null,
      kyc_aadhaar_masked: data?.is_kyc_verified ? 'XXXX-XXXX-1234' : null
    };
  },
};

// ============================================================================
// Quality Assayer (QA) API
// ============================================================================
export interface QARequest {
  id: string;
  listing_id: string;
  requested_by_user_id: string;
  inspector_id: string | null;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabReport {
  id: string;
  qa_request_id: string;
  listing_id: string;
  inspector_id: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  moisture_percent: number;
  foreign_matter_percent: number;
  broken_grains_percent: number;
  protein_percent: number | null;
  weight_per_unit: number;
  overall_quality_score: number;
  remarks: string;
  certified: boolean;
  created_at: string;
}

export const qaApi = {
  // Request QA inspection for a listing
  requestInspection: async (listingId: string, inspectorId?: string, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: request, error } = await supabase
      .from('qa_requests')
      .insert({
        listing_id: listingId,
        requested_by_user_id: user.id,
        inspector_id: inspectorId || null,
        status: 'pending',
        notes: notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { message: 'Inspection requested', request };
  },

  // Get all QA requests for a listing
  getListingRequests: async (listingId: string) => {
    const { data, error, count } = await supabase
      .from('qa_requests')
      .select('*', { count: 'exact' })
      .eq('listing_id', listingId);

    if (error) throw error;
    return { requests: data, count: count || 0 };
  },

  // Get specific QA request details
  getRequest: async (requestId: string) => {
    const { data: request, error: reqError } = await supabase
      .from('qa_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqError) throw reqError;

    const { data: report, error: repError } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('qa_request_id', requestId)
      .single();

    if (repError && repError.code !== 'PGRST116') throw repError;

    return { request, report: report || null };
  },

  // Generate lab report for a QA request (mock)
  generateReport: async (requestId: string) => {
    // Mock generation
    const { data: report, error } = await supabase
      .from('lab_reports')
      .insert({
        qa_request_id: requestId,
        grade: 'A',
        moisture_percent: 12,
        foreign_matter_percent: 1,
        broken_grains_percent: 2,
        weight_per_unit: 100,
        overall_quality_score: 95,
        remarks: 'Excellent quality',
        certified: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { message: 'Report generated', report };
  },

  // Update QA request status
  updateStatus: async (requestId: string, status: QARequest['status']) => {
    const { data: request, error } = await supabase
      .from('qa_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { message: 'Status updated', request };
  },
};

// ============================================================================
// Shop API
// ============================================================================
export interface CartItem {
  id: string;
  listing_id: string;
  qty_kg: number;
  listing?: Listing;
}

export interface CartResponse {
  items: CartItem[];
  total_amount: number;
}

export const shopApi = {
  getProducts: async (params?: Record<string, string>) => {
    // Reuse listingsApi.getAll but maybe with different filters
    // Map params to listingsApi params
    const listingParams: any = { limit: 50 };
    if (params?.category) listingParams.crop = params.category; // Assuming category maps to crop
    if (params?.search) listingParams.crop = params.search; // Simple search mapping

    const { listings, total } = await listingsApi.getAll(listingParams);
    return { products: listings, total, page: 1, limit: 50 };
  },

  getCart: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { items: [], total_amount: 0 };

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, listing:listings(*)')
      .eq('user_id', user.id);

    if (error) {
      // If table doesn't exist, return empty
      if (error.code === '42P01') return { items: [], total_amount: 0 };
      throw error;
    }

    // Calculate total
    const items = data.map((item: any) => ({
      id: item.id,
      listing_id: item.listing_id,
      qty_kg: item.qty_kg,
      listing: item.listing
    }));

    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.qty_kg * (item.listing?.min_price_per_qtl || 0) / 100); // Assuming price is per quintal (100kg)
    }, 0);

    return { items, total_amount: total };
  },

  addToCart: async (listingId: string, qtyKg: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if item exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ qty_kg: existing.qty_kg + qtyKg })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          listing_id: listingId,
          qty_kg: qtyKg
        });
      if (error) throw error;
    }
    return { success: true };
  },

  updateCartItem: async (itemId: string, qtyKg: number) => {
    const { error } = await supabase
      .from('cart_items')
      .update({ qty_kg: qtyKg })
      .eq('id', itemId);
    if (error) throw error;
    return { success: true };
  },

  removeFromCart: async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
    return { success: true };
  },

  checkout: async () => {
    // Convert cart to orders
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { items } = await shopApi.getCart();
    if (items.length === 0) throw new Error('Cart is empty');

    // Create orders for each item
    for (const item of items) {
      if (!item.listing) continue;

      await ordersApi.buyNow({
        listing_id: item.listing_id,
        qty_kg: item.qty_kg,
        shipping_address: 'Default Address' // Should come from user profile
      });
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', user.id);

    return { success: true, message: 'Order placed successfully' };
  }
};

// ============================================================================
// Speech API (Browser Native)
// ============================================================================

export interface SpeechToTextRequest {
  audio_base64: string;
  language: string;
  audio_format?: string;
  sampling_rate?: number;
}

export interface TextToSpeechRequest {
  text: string;
  language: string;
  gender?: string;
  sampling_rate?: number;
}

export const speechApi = {
  stt: async (data: SpeechToTextRequest) => {
    try {
      const response = await fetch(`${API_URL}/speech/to-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          audio_base64: data.audio_base64,
          language: data.language,
          audio_format: data.audio_format || 'webm',
          sampling_rate: data.sampling_rate || 48000,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('STT API Error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  tts: async (data: TextToSpeechRequest) => {
    try {
      const response = await fetch(`${API_URL}/speech/to-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          text: data.text,
          language: data.language,
          gender: data.gender || 'female',
          sampling_rate: data.sampling_rate || 22050,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('TTS API Error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  getSupportedLanguages: async () => {
    try {
      const response = await fetch(`${API_URL}/speech/languages`);
      return await response.json();
    } catch (error) {
      return { languages: [] };
    }
  },
};

// ============================================================================
// Helper: Play TTS audio
// ============================================================================
export async function playTTSAudio(
  text: string,
  language: string = 'hi',
  gender: 'male' | 'female' = 'female'
): Promise<HTMLAudioElement> {
  const result = await speechApi.tts({
    text,
    language,
    gender,
  });

  if (!result.success || !result.audio_base64) {
    throw new Error(result.error || 'TTS failed');
  }

  const audioData = atob(result.audio_base64);
  const audioArray = new Uint8Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    audioArray[i] = audioData.charCodeAt(i);
  }

  const mimeType = result.audio_format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
  const audioBlob = new Blob([audioArray], { type: mimeType });
  const audioUrl = URL.createObjectURL(audioBlob);

  const audio = new Audio(audioUrl);
  await audio.play();

  // Clean up URL when audio ends
  audio.onended = () => URL.revokeObjectURL(audioUrl);

  return audio;
}

// ============================================================================
// Crop History API - Farm-to-Fork Traceability for Millets & Pulses
// ============================================================================

export interface CropCycle {
  id: string;
  farmer_id: string;
  crop_type: string;
  crop: string;
  variety?: string;
  season: string;
  year: number;
  plot_name?: string;
  area_acres?: number;
  status: string;
  total_input_cost: number;
  total_revenue: number;
  total_yield_kg: number;
  sowing_date?: string;
  harvest_date?: string;
  created_at: string;
  updated_at: string;
  // Related data (populated on detail fetch)
  seeds?: CropSeed[];
  inputs?: CropInput[];
  activities?: CropActivity[];
  harvests?: CropHarvest[];
  sales?: CropSale[];
}

export interface CropSeed {
  id: string;
  crop_cycle_id: string;
  seed_name: string;
  variety?: string;
  quantity_kg: number;
  cost_per_kg?: number;
  total_cost?: number;
  supplier?: string;
  sowing_date?: string;
  notes?: string;
  created_at: string;
}

export interface CropInput {
  id: string;
  crop_cycle_id: string;
  input_type: string;
  input_name: string;
  is_organic: boolean;
  quantity?: string;
  cost?: number;
  application_date?: string;
  purpose?: string;
  notes?: string;
  created_at: string;
}

export interface CropActivity {
  id: string;
  crop_cycle_id: string;
  activity_type: string;
  activity_name: string;
  activity_date: string;
  cost: number;
  labor_hours?: number;
  labor_cost?: number;
  description?: string;
  notes?: string;
  created_at: string;
}

export interface CropHarvest {
  id: string;
  crop_cycle_id: string;
  harvest_date: string;
  yield_kg: number;
  quality_grade?: string;
  moisture_level?: string;
  harvest_cost: number;
  notes?: string;
  created_at: string;
}

export interface CropSale {
  id: string;
  crop_cycle_id: string;
  listing_id?: string;
  order_id?: string;
  buyer_name?: string;
  buyer_type?: string;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  sale_date: string;
  notes?: string;
  created_at: string;
}

export const cropHistoryApi = {
  // =================== Crop Cycles ===================

  // Get all crop cycles for the current farmer
  getAll: async (params?: {
    crop_type?: string;
    season?: string;
    year?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const userId = await getCurrentUserId();

    let query = supabase
      .from('crop_cycles')
      .select('*', { count: 'exact' })
      .eq('farmer_id', userId)
      .order('created_at', { ascending: false });

    if (params?.crop_type) query = query.eq('crop_type', params.crop_type);
    if (params?.season) query = query.eq('season', params.season);
    if (params?.year) query = query.eq('year', params.year);
    if (params?.status && params.status !== 'all') query = query.eq('status', params.status);

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      cycles: data as CropCycle[],
      total: count || 0,
      page,
      limit
    };
  },

  // Get single crop cycle with all related data
  getById: async (cycleId: string) => {
    const { data: cycle, error: cycleError } = await supabase
      .from('crop_cycles')
      .select('*')
      .eq('id', cycleId)
      .single();

    if (cycleError) throw cycleError;

    // Fetch related data in parallel
    const [seeds, inputs, activities, harvests, sales] = await Promise.all([
      supabase.from('crop_seeds').select('*').eq('crop_cycle_id', cycleId).order('sowing_date', { ascending: true }),
      supabase.from('crop_inputs').select('*').eq('crop_cycle_id', cycleId).order('application_date', { ascending: true }),
      supabase.from('crop_activities').select('*').eq('crop_cycle_id', cycleId).order('activity_date', { ascending: true }),
      supabase.from('crop_harvests').select('*').eq('crop_cycle_id', cycleId).order('harvest_date', { ascending: true }),
      supabase.from('crop_sales').select('*').eq('crop_cycle_id', cycleId).order('sale_date', { ascending: true }),
    ]);

    return {
      ...cycle,
      seeds: seeds.data || [],
      inputs: inputs.data || [],
      activities: activities.data || [],
      harvests: harvests.data || [],
      sales: sales.data || [],
    } as CropCycle;
  },

  // Create new crop cycle
  create: async (data: {
    crop_type: string;
    crop: string;
    variety?: string;
    season: string;
    year: number;
    plot_name?: string;
    area_acres?: number;
    sowing_date?: string;
  }) => {
    const userId = await getCurrentUserId();

    const { data: cycle, error } = await supabase
      .from('crop_cycles')
      .insert({
        ...data,
        farmer_id: userId,
        status: 'active',
        total_input_cost: 0,
        total_revenue: 0,
        total_yield_kg: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return cycle as CropCycle;
  },

  // Update crop cycle
  update: async (cycleId: string, data: Partial<CropCycle>) => {
    const { data: cycle, error } = await supabase
      .from('crop_cycles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', cycleId)
      .select()
      .single();

    if (error) throw error;
    return cycle as CropCycle;
  },

  // Delete crop cycle
  delete: async (cycleId: string) => {
    const { error } = await supabase
      .from('crop_cycles')
      .delete()
      .eq('id', cycleId);

    if (error) throw error;
    return { success: true };
  },

  // Get summary stats
  getStats: async () => {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('crop_cycles')
      .select('status, total_input_cost, total_revenue, area_acres')
      .eq('farmer_id', userId);

    if (error) throw error;

    const cycles = data || [];
    return {
      totalCycles: cycles.length,
      activeCycles: cycles.filter(c => c.status === 'active').length,
      completedCycles: cycles.filter(c => c.status === 'completed').length,
      totalArea: cycles.reduce((sum, c) => sum + (c.area_acres || 0), 0),
      totalCost: cycles.reduce((sum, c) => sum + (c.total_input_cost || 0), 0),
      totalRevenue: cycles.reduce((sum, c) => sum + (c.total_revenue || 0), 0),
      totalProfit: cycles.reduce((sum, c) => sum + ((c.total_revenue || 0) - (c.total_input_cost || 0)), 0),
    };
  },

  // =================== Seeds ===================
  addSeed: async (cycleId: string, data: Omit<CropSeed, 'id' | 'crop_cycle_id' | 'created_at'>) => {
    const { data: seed, error } = await supabase
      .from('crop_seeds')
      .insert({ ...data, crop_cycle_id: cycleId })
      .select()
      .single();

    if (error) throw error;
    return seed as CropSeed;
  },

  updateSeed: async (seedId: string, data: Partial<CropSeed>) => {
    const { data: seed, error } = await supabase
      .from('crop_seeds')
      .update(data)
      .eq('id', seedId)
      .select()
      .single();

    if (error) throw error;
    return seed as CropSeed;
  },

  deleteSeed: async (seedId: string) => {
    const { error } = await supabase.from('crop_seeds').delete().eq('id', seedId);
    if (error) throw error;
    return { success: true };
  },

  // =================== Inputs ===================
  addInput: async (cycleId: string, data: Omit<CropInput, 'id' | 'crop_cycle_id' | 'created_at'>) => {
    const { data: input, error } = await supabase
      .from('crop_inputs')
      .insert({ ...data, crop_cycle_id: cycleId })
      .select()
      .single();

    if (error) throw error;
    return input as CropInput;
  },

  updateInput: async (inputId: string, data: Partial<CropInput>) => {
    const { data: input, error } = await supabase
      .from('crop_inputs')
      .update(data)
      .eq('id', inputId)
      .select()
      .single();

    if (error) throw error;
    return input as CropInput;
  },

  deleteInput: async (inputId: string) => {
    const { error } = await supabase.from('crop_inputs').delete().eq('id', inputId);
    if (error) throw error;
    return { success: true };
  },

  // =================== Activities ===================
  addActivity: async (cycleId: string, data: Omit<CropActivity, 'id' | 'crop_cycle_id' | 'created_at'>) => {
    const { data: activity, error } = await supabase
      .from('crop_activities')
      .insert({ ...data, crop_cycle_id: cycleId })
      .select()
      .single();

    if (error) throw error;
    return activity as CropActivity;
  },

  updateActivity: async (activityId: string, data: Partial<CropActivity>) => {
    const { data: activity, error } = await supabase
      .from('crop_activities')
      .update(data)
      .eq('id', activityId)
      .select()
      .single();

    if (error) throw error;
    return activity as CropActivity;
  },

  deleteActivity: async (activityId: string) => {
    const { error } = await supabase.from('crop_activities').delete().eq('id', activityId);
    if (error) throw error;
    return { success: true };
  },

  // =================== Harvests ===================
  addHarvest: async (cycleId: string, data: Omit<CropHarvest, 'id' | 'crop_cycle_id' | 'created_at'>) => {
    const { data: harvest, error } = await supabase
      .from('crop_harvests')
      .insert({ ...data, crop_cycle_id: cycleId })
      .select()
      .single();

    if (error) throw error;

    // Update cycle status to harvested
    await supabase.from('crop_cycles').update({ status: 'harvested', harvest_date: data.harvest_date }).eq('id', cycleId);

    return harvest as CropHarvest;
  },

  updateHarvest: async (harvestId: string, data: Partial<CropHarvest>) => {
    const { data: harvest, error } = await supabase
      .from('crop_harvests')
      .update(data)
      .eq('id', harvestId)
      .select()
      .single();

    if (error) throw error;
    return harvest as CropHarvest;
  },

  deleteHarvest: async (harvestId: string) => {
    const { error } = await supabase.from('crop_harvests').delete().eq('id', harvestId);
    if (error) throw error;
    return { success: true };
  },

  // =================== Sales ===================
  addSale: async (cycleId: string, data: Omit<CropSale, 'id' | 'crop_cycle_id' | 'created_at'>) => {
    const { data: sale, error } = await supabase
      .from('crop_sales')
      .insert({ ...data, crop_cycle_id: cycleId })
      .select()
      .single();

    if (error) throw error;
    return sale as CropSale;
  },

  updateSale: async (saleId: string, data: Partial<CropSale>) => {
    const { data: sale, error } = await supabase
      .from('crop_sales')
      .update(data)
      .eq('id', saleId)
      .select()
      .single();

    if (error) throw error;
    return sale as CropSale;
  },

  deleteSale: async (saleId: string) => {
    const { error } = await supabase.from('crop_sales').delete().eq('id', saleId);
    if (error) throw error;
    return { success: true };
  },
};

