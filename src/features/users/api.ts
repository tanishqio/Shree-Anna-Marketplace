/**
 * features/users/api.ts
 * User profiles — get, update, onboard for each role
 * Extracted from src/lib/api.ts
 */
export {
  userApi,
  setAccessToken,
  getAccessToken,
  API_URL,
  api,
} from '@/lib/api';

export type {
  User,
  FarmerProfile,
  ApiResponse,
  AuthResponse,
} from '@/lib/api';
