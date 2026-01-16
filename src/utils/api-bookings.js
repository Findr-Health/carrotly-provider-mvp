// Booking API functions - Add to utils/api.js

// ============================================================================
// BOOKING API
// ============================================================================

export const bookingsAPI = {
  // Get provider's pending booking requests
  getPending: async (providerId) => {
    const response = await api.get(`/bookings/provider/${providerId}/pending`);
    return response.data;
  },

  // Get all provider bookings with filters
  getAll: async (providerId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.skip) queryParams.append('skip', params.skip);
    
    const query = queryParams.toString();
    const response = await api.get(`/bookings/provider/${providerId}${query ? '?' + query : ''}`);
    return response.data;
  },

  // Get single booking
  getById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Provider confirms booking
  confirm: async (bookingId, providerId) => {
    const response = await api.post(`/bookings/${bookingId}/confirm`, {}, {
      headers: { 'x-provider-id': providerId }
    });
    return response.data;
  },

  // Provider declines booking
  decline: async (bookingId, providerId, reason) => {
    const response = await api.post(`/bookings/${bookingId}/decline`, { reason }, {
      headers: { 'x-provider-id': providerId }
    });
    return response.data;
  },

  // Provider proposes reschedule
  reschedule: async (bookingId, providerId, proposedStart, message) => {
    const response = await api.post(`/bookings/${bookingId}/reschedule`, {
      proposedStart,
      message
    }, {
      headers: { 'x-provider-id': providerId }
    });
    return response.data;
  },

  // Get booking history/audit trail
  getHistory: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/history`);
    return response.data;
  }
};