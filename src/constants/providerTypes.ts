// constants/providerTypes.ts
// Single source of truth for provider types across the Findr Health platform
// These names match exactly with the backend service templates

import { ProviderTypeId, ProviderTypeInfo } from '../types/services';

// ============================================
// PROVIDER TYPES - Master list
// ============================================
export const PROVIDER_TYPES: ProviderTypeInfo[] = [
  { id: 'Medical', label: 'Medical', icon: '🏥' },
  { id: 'Urgent Care', label: 'Urgent Care', icon: '🚑' },
  { id: 'Dental', label: 'Dental', icon: '🦷' },
  { id: 'Mental Health', label: 'Mental Health', icon: '🧠' },
  { id: 'Skincare', label: 'Skincare', icon: '✨' },
  { id: 'Massage', label: 'Massage', icon: '💆' },
  { id: 'Fitness', label: 'Fitness', icon: '💪' },
  { id: 'Yoga/Pilates', label: 'Yoga/Pilates', icon: '🧘' },
  { id: 'Nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'Pharmacy/Rx', label: 'Pharmacy/Rx', icon: '💊' },
];

// ============================================
// CATEGORY ICONS - for display
// ============================================
export const CATEGORY_ICONS: Record<string, string> = {
  // General
  'Uncategorized': '📦',
  
  // Medical / Urgent Care
  'Consultation': '👨‍⚕️',
  'Preventive': '🛡️',
  'Diagnostic': '🔬',
  'Treatment': '💊',
  'Procedures': '🏥',
  'Walk-in Visit': '🚶',
  'Minor Procedures': '🩹',
  
  // Dental
  'Restorative': '🦷',
  'Cosmetic': '✨',
  'Surgical': '⚕️',
  
  // Mental Health
  'Assessment': '📋',
  'Individual Therapy': '🧠',
  'Couples/Family': '👨‍👩‍👧',
  'Group': '👥',
  'Psychiatry': '💭',
  
  // Skincare
  'Facials': '🧴',
  'Injectables': '💉',
  'Acne Treatment': '✨',
  'Body Treatment': '🧖',
  
  // Massage
  'Relaxation': '🌸',
  'Therapeutic': '🤲',
  'Sports': '🏃',
  'Specialty': '⭐',
  
  // Fitness
  'Personal Training': '💪',
  'Group Class': '🏋️',
  
  // Yoga/Pilates
  'Private Session': '🧘',
  'Workshop': '📚',
  
  // Nutrition
  'Meal Planning': '🥗',
  'Program': '📊',
  
  // Pharmacy
  'Compounding': '⚗️',
  'Immunization': '💉',
  'Weight Loss': '⚖️',
};

// ============================================
// LEGACY NAME MAPPING
// Maps old provider type names to new names
// Used for backward compatibility
// ============================================
export const LEGACY_PROVIDER_TYPE_MAP: Record<string, ProviderTypeId> = {
  // Old name -> New name
  'Skincare/Aesthetics': 'Skincare',
  'Massage/Bodywork': 'Massage',
  'Fitness/Training': 'Fitness',
  'Nutrition/Wellness': 'Nutrition',
  'Pharmacy/RX': 'Pharmacy/Rx',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get provider type info by ID
 */
export function getProviderTypeInfo(typeId: string): ProviderTypeInfo {
  // Check if it's a legacy name and map it
  const normalizedId = LEGACY_PROVIDER_TYPE_MAP[typeId] || typeId;
  return PROVIDER_TYPES.find(t => t.id === normalizedId) || { 
    id: typeId as ProviderTypeId, 
    label: typeId, 
    icon: '🏢' 
  };
}

/**
 * Normalize a provider type name (handles legacy names)
 */
export function normalizeProviderType(typeName: string): ProviderTypeId {
  return (LEGACY_PROVIDER_TYPE_MAP[typeName] || typeName) as ProviderTypeId;
}

/**
 * Normalize an array of provider types
 */
export function normalizeProviderTypes(types: string[]): ProviderTypeId[] {
  return types.map(normalizeProviderType);
}

/**
 * Get icon for a category
 */
export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || '📦';
}

/**
 * Check if a provider type is valid
 */
export function isValidProviderType(typeId: string): boolean {
  const normalizedId = LEGACY_PROVIDER_TYPE_MAP[typeId] || typeId;
  return PROVIDER_TYPES.some(t => t.id === normalizedId);
}
