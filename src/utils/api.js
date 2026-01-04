// utils/api.js - Updated with Service Template endpoints
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('providerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('providerToken');
      localStorage.removeItem('providerUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/admin/login', { email, password }),
  providerLogin: (email, password) => api.post('/providers/login', { email, password }),
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerUser');
  },
};

export const providersAPI = {
  // Get all providers with optional filters
  getAll: (params) => api.get('/admin/providers', { params }),
  
  // Get single provider by ID
  getById: (id) => api.get(`/admin/providers/${id}`),
  
  // Create new provider
  create: (data) => api.post('/admin/providers', data),
  
  // FULL provider update - updates all fields
  update: (id, data) => api.put(`/admin/providers/${id}`, data),
  
  // Delete provider
  delete: (id) => api.delete(`/admin/providers/${id}`),
  
  // Update status only
  updateStatus: (id, status) => api.patch(`/admin/providers/${id}/status`, { status }),
};

// ========================================
// SERVICE TEMPLATES API (NEW)
// ========================================
export const serviceTemplatesAPI = {
  // Get all templates for a provider type
  getByProviderType: (providerType) => 
    api.get('/service-templates', { params: { providerType } }),
  
  // Get popular/recommended templates for quick onboarding
  getPopular: (providerType) => 
    api.get('/service-templates/popular', { params: { providerType } }),
  
  // Get allowed categories for a provider type
  getCategories: (providerType) => 
    api.get('/service-templates/categories', { params: { providerType } }),
  
  // Get templates grouped by category
  getGrouped: (providerType) => 
    api.get('/service-templates/grouped', { params: { providerType } }),
  
  // Convert templates to services (for bulk creation)
  bulkCreateServices: (providerId, templateIds, customizations) => 
    api.post('/service-templates/bulk-create-services', {
      providerId,
      templateIds,
      customizations
    }),
};

// ========================================
// PROVIDER SERVICES API (UPDATED)
// ========================================
export const servicesAPI = {
  // Get all services for a provider
  getByProvider: (providerId) => 
    api.get(`/providers/${providerId}/services`),
  
  // Get services grouped by category
  getGrouped: (providerId) => 
    api.get(`/providers/${providerId}/services/grouped`),
  
  // Get single service
  getById: (providerId, serviceId) => 
    api.get(`/providers/${providerId}/services/${serviceId}`),
  
  // Create a single service
  create: (providerId, data) => 
    api.post(`/providers/${providerId}/services`, data),
  
  // Bulk create services (from templates or custom)
  bulkCreate: (providerId, services) => 
    api.post(`/providers/${providerId}/services/bulk`, { services }),
  
  // Update a service
  update: (providerId, serviceId, data) => 
    api.put(`/providers/${providerId}/services/${serviceId}`, data),
  
  // Delete a service
  delete: (providerId, serviceId) => 
    api.delete(`/providers/${providerId}/services/${serviceId}`),
  
  // Reorder services within a category
  reorder: (providerId, category, serviceIds) => 
    api.put(`/providers/${providerId}/services/reorder`, { category, serviceIds }),
  
  // ---- Service Variants ----
  
  // Add variant to a service
  addVariant: (providerId, serviceId, variant) => 
    api.post(`/providers/${providerId}/services/${serviceId}/variants`, variant),
  
  // Update a variant
  updateVariant: (providerId, serviceId, variantId, data) => 
    api.put(`/providers/${providerId}/services/${serviceId}/variants/${variantId}`, data),
  
  // Delete a variant
  deleteVariant: (providerId, serviceId, variantId) => 
    api.delete(`/providers/${providerId}/services/${serviceId}/variants/${variantId}`),
};

export const teamAPI = {
  // Add team member
  add: (providerId, data) => api.post(`/admin/providers/${providerId}/team`, data),
  
  // Delete team member
  delete: (providerId, memberId) => 
    api.delete(`/admin/providers/${providerId}/team/${memberId}`),
};

export const photosAPI = {
  // Add photo
  add: (providerId, data) => api.post(`/admin/providers/${providerId}/photos`, data),
  
  // Delete photo
  delete: (providerId, photoId) => 
    api.delete(`/admin/providers/${providerId}/photos/${photoId}`),
};

export const dashboardAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/admin/dashboard/stats'),
};

export default api;
