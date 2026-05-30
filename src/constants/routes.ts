/**
 * All application route paths as typed constants.
 * Prevents magic strings scattered across the codebase.
 * Usage: import { ROUTES } from '@/constants/routes'
 *        router.push(ROUTES.FARMER.DASHBOARD)
 */

export const ROUTES = {
  HOME: '/',
  MARKETPLACE: '/marketplace',
  SCHEMES: '/schemes',
  CALCULATOR: '/calculator',
  HELP: '/help',
  WHY_SHREE_ANNA: '/why-shree-anna',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  SHOP: '/shop',

  KRISHI_DARPAN: {
    ROOT: '/krishi-darpan',
    PATHSHALA: '/krishi-darpan/pathshala',
    ADVISORY: '/advisory',
  },

  TRACE: (code: string) => `/trace/${code}`,

  FARMER: {
    ROOT: '/farmer',
    REGISTER: '/farmer/register',
    DASHBOARD: '/farmer/dashboard',
    LISTINGS: '/farmer/listings',
    CREATE_LISTING: '/farmer/listing/create',
    OFFERS: '/farmer/offers',
    ORDERS: '/farmer/orders',
    PAYMENTS: '/farmer/payments',
    EARNINGS: '/farmer/earnings',
    CROP_HISTORY: '/farmer/crop-history',
    CONSENTS: '/farmer/consents',
    PROFILE: '/farmer/profile',
  },

  BUYER: {
    ROOT: '/buyer',
    REGISTER: '/buyer/register',
    DASHBOARD: '/buyer/dashboard',
    ORDERS: '/buyer/orders',
    CART: '/buyer/cart',
    CHECKOUT: '/buyer/checkout',
    PROFILE: '/buyer/profile',
    LISTING: (id: string) => `/buyer/listing/${id}`,
  },

  FPO: {
    ROOT: '/fpo',
    REGISTER: '/fpo/register',
    DASHBOARD: '/fpo/dashboard',
    MEMBERS: '/fpo/members',
    PROFILE: '/fpo/profile',
  },

  PROCESSOR: {
    ROOT: '/processor',
    REGISTER: '/processor/register',
    DASHBOARD: '/processor/dashboard',
    MARKETPLACE: '/processor/marketplace',
    BATCHES: '/processor/batches',
    CREATE_BATCH: '/processor/batches/create',
    OFFERS: '/processor/offers',
    PRODUCTS: '/processor/products',
    REQUIREMENTS: '/processor/requirements',
    CREATE_REQUIREMENT: '/processor/requirements/create',
    PROFILE: '/processor/profile',
  },

  ADMIN: {
    ROOT: '/admin',
    REGISTER: '/admin/register',
    DASHBOARD: '/admin/dashboard',
    PROFILE: '/admin/profile',
  },

  KSC: {
    ROOT: '/ksc',
    REGISTER: '/ksc/register',
    DASHBOARD: '/ksc/dashboard',
    REGISTER_FARMER: '/ksc/register-farmer',
    VERIFY: '/ksc/verify',
    PROFILE: '/ksc/profile',
  },
} as const;
