/**
 * Root components barrel — organized by domain.
 * New code should import from domain-specific paths:
 *   import { Navigation } from '@/components/layout'
 *   import { BuyNowModal } from '@/components/features/marketplace'
 *   import { WeatherWidget } from '@/components/common'
 *
 * Legacy imports via '@/components/ComponentName' still work unchanged.
 */

// Layout
export * from './layout';

// Common
export * from './common';

// Voice
export * from './voice';

// Features
export * from './features/auth';
export * from './features/marketplace';
export * from './features/orders';
export * from './features/payments';
export * from './features/kyc';
export * from './features/quality';
export * from './features/notifications';
export * from './features/offline';
export * from './features/traceability';
