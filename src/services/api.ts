// src/services/api.ts
// Complete API - includes existing functions + booking management
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photoReference?: string;
}

export interface PlaceDetails {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: {
    weekday_text: string[];
    open_now: boolean;
  };
  types?: string[];
}

export interface SendCodeResponse {
  success: boolean;
  message?: string;
  expiresAt?: string;
  error?: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message?: string;
  error?: string;
  attemptsRemaining?: number;
}

// ============================================================================
// SEARCH API
// ============================================================================

export const searchBusiness = async (businessName: string, zipCode?: string): Promise<{
  results: SearchResult[];
  autoSelected: boolean;
}> => {
  try {
    const response = await axios.post(`${API_URL}/search/business`, {
      businessName,
      zipCode
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  try {
    const response = await axios.get(`${API_URL}/google/place/${placeId}`);
    return response.data.place;
  } catch (error) {
    console.error('Place details error:', error);
    throw error;
  }
};

// ============================================================================
// VERIFICATION API
// ============================================================================

export const sendVerificationCode = async (
  providerId: string, 
  email: string
): Promise<SendCodeResponse> => {
  try {
    const response = await fetch(`${API_URL}/verification/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, email })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification code');
    }
    return data;
  } catch (error: any) {
    console.error('Send code error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const verifyCode = async (
  providerId: string, 
  code: string
): Promise<VerifyCodeResponse> => {
  try {
    const response = await fetch(`${API_URL}/verification/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, code })
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error,
        attemptsRemaining: data.attemptsRemaining
      };
    }
    return data;
  } catch (error: any) {
    console.error('Verify code error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================================================
// PROVIDER API
// ============================================================================

export const submitProviderProfile = async (profileData: any) => {
  try {
    const response = await fetch(`${API_URL}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit profile');
    }
    return response.json();
  } catch (error: any) {
    console.error('Submit profile error:', error);
    throw error;
  }
};

export const getProviderProfile = async (providerId: string) => {
  try {
    const response = await fetch(`${API_URL}/providers/${providerId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }
    return response.json();
  } catch (error: any) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const updateProviderProfile = async (providerId: string, profileData: any) => {
  try {
    const response = await fetch(`${API_URL}/providers/${providerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    return response.json();
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// ============================================================================
// BOOKINGS API (NEW)
// ============================================================================

export const bookingsAPI = {
  // Get provider's pending booking requests
  getPending: async (providerId: string) => {
    const response = await axios.get(`${API_URL}/bookings/provider/${providerId}/pending`);
    return response.data;
  },

  // Get all provider bookings with filters
  getAll: async (providerId: string, params: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());
    
    const query = queryParams.toString();
    const response = await axios.get(`${API_URL}/bookings/provider/${providerId}${query ? '?' + query : ''}`);
    return response.data;
  },

  // Get single booking
  getById: async (bookingId: string) => {
    const response = await axios.get(`${API_URL}/bookings/${bookingId}`);
    return response.data;
  },

  // Provider confirms booking
  confirm: async (bookingId: string, providerId: string) => {
    const response = await axios.post(`${API_URL}/bookings/${bookingId}/confirm`, {}, {
      headers: { 'x-provider-id': providerId }
    });
    return response.data;
  },

  // Provider declines booking
  decline: async (bookingId: string, providerId: string, reason: string) => {
    const response = await axios.post(`${API_URL}/bookings/${bookingId}/decline`, { reason }, {
      headers: { 'x-provider-id': providerId }
    });
    return response.data;
  },

  // Provider proposes reschedule
  reschedule: async (bookingId: string, providerId: string, proposedStart: string, message?: string) => {
    const response = await axios.post(`${API_URL}/bookings/${bookingId}/reschedule`, {
      proposedStart,
      message
    }, {
      headers: { 'x-provider-id': providerId }
    });
    return response.data;
  },

  // Get booking history/audit trail
  getHistory: async (bookingId: string) => {
    const response = await axios.get(`${API_URL}/bookings/${bookingId}/history`);
    return response.data;
  }
};

export default axios;
