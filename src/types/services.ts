// types/services.ts
// Comprehensive type definitions for the Findr Health service system

// ============================================
// PROVIDER TYPES
// ============================================
export type ProviderTypeId = 
  | 'Medical'
  | 'Urgent Care'
  | 'Dental'
  | 'Mental Health'
  | 'Skincare'
  | 'Massage'
  | 'Fitness'
  | 'Yoga/Pilates'
  | 'Nutrition'
  | 'Pharmacy/Rx';

export interface ProviderTypeInfo {
  id: ProviderTypeId;
  label: string;
  icon: string;
}

// ============================================
// SERVICE VARIANT
// ============================================
export interface ServiceVariant {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  isDefault: boolean;
}

// ============================================
// SERVICE (Full format - new system)
// ============================================
export interface Service {
  _id?: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  basePrice: number;
  duration: number;
  hasVariants: boolean;
  variants: ServiceVariant[];
  isActive: boolean;
  sortOrder?: number;
  
  // Legacy field support - read if basePrice is missing
  price?: number;
}

// ============================================
// SERVICE TEMPLATE (from API)
// ============================================
export interface SuggestedVariant {
  name: string;
  priceModifier: number;
  durationModifier: number;
  description?: string;
}

export interface ServiceTemplate {
  _id: string;
  providerType: ProviderTypeId;
  category: string;
  name: string;
  description: string;
  shortDescription: string;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  suggestedDuration: number;
  suggestedVariants?: SuggestedVariant[];
  isPopular: boolean;
  sortOrder: number;
  isActive: boolean;
}

// ============================================
// GROUPED DATA STRUCTURES
// ============================================
export interface GroupedServices {
  [category: string]: Service[];
}

export interface GroupedTemplates {
  [category: string]: ServiceTemplate[];
}

// ============================================
// API RESPONSES
// ============================================
export interface ServicesResponse {
  success: boolean;
  count: number;
  services: Service[];
}

export interface GroupedServicesResponse {
  success: boolean;
  categories: string[];
  grouped: GroupedServices;
}

export interface ServiceTemplatesResponse {
  success: boolean;
  count: number;
  templates: ServiceTemplate[];
}

export interface CategoriesResponse {
  success: boolean;
  providerType: string;
  categories: string[];
}

// ============================================
// COMPONENT PROPS
// ============================================
export interface ServiceSelectorProps {
  providerTypes: string[];
  selectedServices: Service[];
  onServicesChange: (services: Service[]) => void;
  mode?: 'onboarding' | 'editing';
}

export interface ServiceListProps {
  services: Service[];
  editable?: boolean;
  onEdit?: (service: Service) => void;
  onDelete?: (serviceId: string) => void;
  onToggleActive?: (serviceId: string) => void;
}

export interface ServiceEditorProps {
  service?: Service;
  categories: string[];
  onSave: (service: Service) => void;
  onCancel: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the effective price from a service (handles legacy format)
 */
export function getServicePrice(service: Service): number {
  return service.basePrice ?? service.price ?? 0;
}

/**
 * Get price range for a service (if has variants)
 */
export function getServicePriceRange(service: Service): { min: number; max: number } {
  if (!service.hasVariants || !service.variants?.length) {
    const price = getServicePrice(service);
    return { min: price, max: price };
  }
  
  const prices = service.variants.map(v => v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

/**
 * Format price or price range for display
 */
export function formatServicePrice(service: Service): string {
  const range = getServicePriceRange(service);
  if (range.min === range.max) {
    return `$${range.min}`;
  }
  return `$${range.min} - $${range.max}`;
}

/**
 * Convert a ServiceTemplate to a new Service
 */
export function templateToService(
  template: ServiceTemplate,
  customPrice?: number
): Service {
  const price = customPrice ?? template.suggestedPriceMin;
  
  return {
    name: template.name,
    description: template.description,
    shortDescription: template.shortDescription,
    category: template.category,
    basePrice: price,
    duration: template.suggestedDuration,
    hasVariants: (template.suggestedVariants?.length ?? 0) > 0,
    variants: template.suggestedVariants?.map(v => ({
      name: v.name,
      description: v.description,
      price: price + v.priceModifier,
      duration: template.suggestedDuration + v.durationModifier,
      isDefault: false
    })) ?? [],
    isActive: true
  };
}

/**
 * Normalize a legacy service to new format
 */
export function normalizeService(service: any): Service {
  return {
    _id: service._id,
    name: service.name || '',
    description: service.description || '',
    shortDescription: service.shortDescription || service.description?.substring(0, 100) || '',
    category: service.category || 'Uncategorized',
    basePrice: service.basePrice ?? service.price ?? 0,
    duration: service.duration || 60,
    hasVariants: service.hasVariants ?? false,
    variants: service.variants || [],
    isActive: service.isActive ?? true,
    sortOrder: service.sortOrder ?? 0
  };
}
