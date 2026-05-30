/**
 * src/lib/hooks/index.ts
 * Re-exports all hooks for backward compatibility.
 * New code should import directly from '@/hooks'
 */
export { useAuth } from '@/hooks/useAuth';
export { useLanguage, LanguageProvider } from '@/hooks/useLanguage';
export { useIsMobile } from '@/hooks/use-mobile';
export {
  useListings,
  useMyListings,
  useListing,
  useOrders,
  usePayments,
  useBatches,
  useTrace,
  useReceivedOffers,
  useMadeOffers,
} from '@/hooks/useData';
