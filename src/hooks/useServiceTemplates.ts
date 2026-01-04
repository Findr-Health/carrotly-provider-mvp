// hooks/useServiceTemplates.ts
// Hook for fetching and managing service templates from the API

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ServiceTemplate, 
  GroupedTemplates,
  ProviderTypeId 
} from '../types/services';
import { normalizeProviderType } from '../constants/providerTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

interface UseServiceTemplatesOptions {
  providerTypes: string[];
  autoFetch?: boolean;
}

interface UseServiceTemplatesReturn {
  templates: ServiceTemplate[];
  groupedTemplates: GroupedTemplates;
  popularTemplates: ServiceTemplate[];
  categories: string[];
  loading: boolean;
  error: string | null;
  activeProviderType: string | null;
  setActiveProviderType: (type: string) => void;
  refetch: () => Promise<void>;
}

export function useServiceTemplates({
  providerTypes,
  autoFetch = true
}: UseServiceTemplatesOptions): UseServiceTemplatesReturn {
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProviderType, setActiveProviderType] = useState<string | null>(null);
  
  // Track previous provider types to detect changes
  const prevTypesRef = useRef<string[]>([]);

  // Normalize provider types
  const normalizedTypes = providerTypes.map(normalizeProviderType);

  // Reset when provider types change
  useEffect(() => {
    const typesChanged = JSON.stringify(normalizedTypes) !== JSON.stringify(prevTypesRef.current);
    
    if (typesChanged) {
      prevTypesRef.current = normalizedTypes;
      
      // If current active type is no longer in the list, reset
      if (normalizedTypes.length > 0) {
        if (!activeProviderType || !normalizedTypes.includes(activeProviderType as ProviderTypeId)) {
          setActiveProviderType(normalizedTypes[0]);
        }
      } else {
        setActiveProviderType(null);
        setTemplates([]);
        setCategories([]);
      }
    }
  }, [normalizedTypes, activeProviderType]);

  // Fetch templates for active provider type
  const fetchTemplates = useCallback(async () => {
    if (!activeProviderType) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch categories
      const catResponse = await fetch(
        `${API_BASE_URL}/service-templates/categories?providerType=${encodeURIComponent(activeProviderType)}`
      );
      const catData = await catResponse.json();
      
      if (catData.success) {
        setCategories(catData.categories);
      }

      // Fetch templates
      const templatesResponse = await fetch(
        `${API_BASE_URL}/service-templates?providerType=${encodeURIComponent(activeProviderType)}`
      );
      const templatesData = await templatesResponse.json();

      if (templatesData.success) {
        setTemplates(templatesData.templates);
      } else {
        setError(templatesData.message || 'Failed to fetch templates');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [activeProviderType]);

  // Auto-fetch when active type changes
  useEffect(() => {
    if (autoFetch && activeProviderType) {
      fetchTemplates();
    }
  }, [autoFetch, activeProviderType, fetchTemplates]);

  // Group templates by category
  const groupedTemplates: GroupedTemplates = categories.reduce((acc, category) => {
    acc[category] = templates.filter(t => t.category === category);
    return acc;
  }, {} as GroupedTemplates);

  // Get popular templates
  const popularTemplates = templates.filter(t => t.isPopular);

  return {
    templates,
    groupedTemplates,
    popularTemplates,
    categories,
    loading,
    error,
    activeProviderType,
    setActiveProviderType,
    refetch: fetchTemplates
  };
}

// ============================================
// Standalone API functions (for non-hook usage)
// ============================================

export async function fetchTemplatesByProviderType(
  providerType: string
): Promise<ServiceTemplate[]> {
  const normalizedType = normalizeProviderType(providerType);
  const response = await fetch(
    `${API_BASE_URL}/service-templates?providerType=${encodeURIComponent(normalizedType)}`
  );
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch templates');
  }
  
  return data.templates;
}

export async function fetchCategoriesByProviderType(
  providerType: string
): Promise<string[]> {
  const normalizedType = normalizeProviderType(providerType);
  const response = await fetch(
    `${API_BASE_URL}/service-templates/categories?providerType=${encodeURIComponent(normalizedType)}`
  );
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch categories');
  }
  
  return data.categories;
}

export async function fetchPopularTemplates(
  providerType: string
): Promise<ServiceTemplate[]> {
  const normalizedType = normalizeProviderType(providerType);
  const response = await fetch(
    `${API_BASE_URL}/service-templates/popular?providerType=${encodeURIComponent(normalizedType)}`
  );
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch popular templates');
  }
  
  return data.templates;
}
