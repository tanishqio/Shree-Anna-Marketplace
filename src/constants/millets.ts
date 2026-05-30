/**
 * Millet crop types supported by the platform.
 * Extracted from design-tokens.ts for reuse outside UI components.
 */

export const MILLET_TYPES = [
  { value: 'jowar', label: 'Jowar (Sorghum)', label_hi: 'ज्वार', emoji: '🌾', color: '#F59E0B' },
  { value: 'bajra', label: 'Bajra (Pearl Millet)', label_hi: 'बाजरा', emoji: '🌿', color: '#10B981' },
  { value: 'ragi', label: 'Ragi (Finger Millet)', label_hi: 'रागी', emoji: '🌱', color: '#8B5CF6' },
  { value: 'foxtail', label: 'Foxtail Millet', label_hi: 'कंगनी', emoji: '🍃', color: '#F97316' },
  { value: 'kodo', label: 'Kodo Millet', label_hi: 'कोदो', emoji: '🌿', color: '#06B6D4' },
  { value: 'little', label: 'Little Millet', label_hi: 'कुटकी', emoji: '🌾', color: '#EC4899' },
  { value: 'barnyard', label: 'Barnyard Millet', label_hi: 'सामा', emoji: '🌿', color: '#84CC16' },
  { value: 'proso', label: 'Proso Millet', label_hi: 'चीना', emoji: '🌱', color: '#EF4444' },
] as const;

export type MilletType = typeof MILLET_TYPES[number]['value'];

export const QUALITY_GRADES = ['A+', 'A', 'B', 'C'] as const;
export type QualityGrade = typeof QUALITY_GRADES[number];

export const QUALITY_GRADE_LABELS: Record<QualityGrade, string> = {
  'A+': 'Premium',
  'A': 'Good',
  'B': 'Standard',
  'C': 'Economy',
};
