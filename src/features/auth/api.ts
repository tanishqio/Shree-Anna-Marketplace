/**
 * features/auth/api.ts
 * Authentication — OTP request, verification, logout, session management
 * Extracted from src/lib/api.ts
 */
export {
  authApi,
  DEV_PHONES,
  DEV_OTP,
  DEV_PHONE,
  DEV_PHONE_FORMATTED,
  isDevPhone,
  getDevPhoneRole,
  isDevOtp,
  setDevUserRole,
  getDevUserRole,
  isDevToken,
  isDevSession,
  getDevUserId,
} from '@/lib/api';
