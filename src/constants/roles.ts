/**
 * User roles across the Shree Anna platform.
 * Used for role-based routing, UI rendering, and API calls.
 */

export const ROLES = {
  FARMER: 'farmer',
  BUYER: 'buyer',
  FPO: 'fpo',
  PROCESSOR: 'processor',
  ADMIN: 'admin',
  KSC: 'ksc',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/** Roles that can create listings */
export const SELLER_ROLES: Role[] = [ROLES.FARMER, ROLES.FPO];

/** Roles that can place orders */
export const BUYER_ROLES: Role[] = [ROLES.BUYER, ROLES.PROCESSOR];

/** Display labels for each role */
export const ROLE_LABELS: Record<Role, string> = {
  farmer: 'Farmer',
  buyer: 'Buyer',
  fpo: 'Farmer Producer Organisation',
  processor: 'Processor',
  admin: 'Admin',
  ksc: 'Krishi Seva Kendra',
};

/** Hindi labels for each role */
export const ROLE_LABELS_HI: Record<Role, string> = {
  farmer: 'किसान',
  buyer: 'खरीदार',
  fpo: 'किसान उत्पादक संगठन',
  processor: 'प्रसंस्करणकर्ता',
  admin: 'व्यवस्थापक',
  ksc: 'कृषि सेवा केंद्र',
};
