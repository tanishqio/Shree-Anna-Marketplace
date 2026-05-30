/**
 * src/features/index.ts
 * Backward-compatible master re-export.
 * All existing code that imports from '@/lib/api' continues to work.
 * New code should import from domain-specific feature files:
 *   import { authApi } from '@/features/auth/api'
 *   import { listingApi } from '@/features/listings/api'
 */
export * from '@/lib/api';
