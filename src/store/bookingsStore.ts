/**
 * Bookings Store - Zustand State Management
 * Handles booking data, actions, and real-time updates
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

interface Booking {
  _id: string;
  patient: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  isReturningPatient: boolean;
  previousBookingCount: number;
  service: {
    name: string;
    category: string;
    duration: number;
    price: number;
  };
  requestedStart: string;
  requestedEnd: string;
  providerTimezone: string;
  patientTimezone: string;
  status: string;
  patientNote?: string;
  totalAmount: number;
  depositAmount: number;
  paymentStatus: string;
  expiresAt: string;
  confirmedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  proposedTimes?: Array<{ start: string; end: string }>;
  createdAt: string;
  updatedAt: string;
}

interface BookingsState {
  // Data
  bookings: Booking[];
  totalCount: number;
  pendingCount: number;
  urgentCount: number;
  upcomingCount: number;
  
  // Loading states
  loading: boolean;
  actionLoading: string | null;
  error: string | null;
  
  // WebSocket
  ws: WebSocket | null;
  connected: boolean;
  
  // Optimistic updates
  optimisticUpdates: Map<string, Booking>;
  
  // Actions
  fetchBookings: (providerId: string, status: string, limit?: number, offset?: number) => Promise<void>;
  confirmBooking: (bookingId: string, note?: string) => Promise<void>;
  declineBooking: (bookingId: string, reason: string) => Promise<void>;
  suggestTimes: (bookingId: string, times: Array<{start: string, end: string}>, message: string) => Promise<void>;
  
  // Real-time
  connectWebSocket: (providerId: string) => void;
  disconnectWebSocket: () => void;
  
  // Optimistic updates
  updateBookingOptimistic: (booking: Booking) => void;
  rollbackOptimisticUpdate: (bookingId: string) => void;
  
  // Helpers
  markUrgent: (bookingId: string) => void;
  removeBooking: (bookingId: string) => void;
  addBooking: (booking: Booking) => void;
}

export const useBookingsStore = create<BookingsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      bookings: [],
      totalCount: 0,
      pendingCount: 0,
      urgentCount: 0,
      upcomingCount: 0,
      loading: false,
      actionLoading: null,
      error: null,
      ws: null,
      connected: false,
      optimisticUpdates: new Map(),
      
      // Fetch bookings
      fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(
            `${API_URL}/bookings/provider/${providerId}?status=${status}&limit=${limit}&offset=${offset}`,
            {
              headers: {
                'x-provider-id': providerId,
                'x-provider-id': providerId
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch bookings');
          }
          
          const data = await response.json();
          
          set({
            bookings: data.bookings,
            totalCount: data.totalCount,
            pendingCount: status === 'pending' ? data.totalCount : get().pendingCount,
            urgentCount: data.urgentCount,
            loading: false
          });
          
        } catch (error) {
          set({ 
            error: error.message || 'Failed to fetch bookings',
            loading: false
          });
        }
      },
      
      // Confirm booking
      confirmBooking: async (bookingId, note) => {
        const providerId = localStorage.getItem('providerId');
        set({ actionLoading: bookingId });
        
        // Generate idempotency key
        const idempotencyKey = `confirm-${bookingId}-${Date.now()}`;
        
        try {
          const response = await fetch(
            `${API_URL}/bookings/${bookingId}/confirm`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-provider-id': providerId,
                'x-provider-id': providerId,
                'Idempotency-Key': idempotencyKey
              },
              body: JSON.stringify({ note })
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to confirm booking');
          }
          
          const data = await response.json();
          
          // Remove from pending list
          set(state => ({
            bookings: state.bookings.filter(b => b._id !== bookingId),
            pendingCount: Math.max(0, state.pendingCount - 1),
            urgentCount: Math.max(0, state.urgentCount - 1),
            actionLoading: null
          }));
          
        } catch (error) {
          set({ 
            error: error.message || 'Failed to confirm booking',
            actionLoading: null
          });
          throw error;
        }
      },
      
      // Decline booking
      declineBooking: async (bookingId, reason) => {
        const providerId = localStorage.getItem('providerId');
        set({ actionLoading: bookingId });
        
        try {
          const response = await fetch(
            `${API_URL}/bookings/${bookingId}/decline`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-provider-id': providerId,
                'x-provider-id': providerId
              },
              body: JSON.stringify({ reason })
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to decline booking');
          }
          
          // Remove from pending list
          set(state => ({
            bookings: state.bookings.filter(b => b._id !== bookingId),
            pendingCount: Math.max(0, state.pendingCount - 1),
            urgentCount: Math.max(0, state.urgentCount - 1),
            actionLoading: null
          }));
          
        } catch (error) {
          set({ 
            error: error.message || 'Failed to decline booking',
            actionLoading: null
          });
          throw error;
        }
      },
      
      // Suggest alternative times
      suggestTimes: async (bookingId, times, message) => {
        const providerId = localStorage.getItem('providerId');
        set({ actionLoading: bookingId });
        
        try {
          const response = await fetch(
            `${API_URL}/bookings/${bookingId}/suggest-times`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-provider-id': providerId,
                'x-provider-id': providerId
              },
              body: JSON.stringify({ 
                proposedTimes: times,
                message 
              })
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to suggest alternative times');
          }
          
          const data = await response.json();
          
          // Update booking in list
          set(state => ({
            bookings: state.bookings.map(b => 
              b._id === bookingId ? data.booking : b
            ),
            actionLoading: null
          }));
          
        } catch (error) {
          set({ 
            error: error.message || 'Failed to suggest times',
            actionLoading: null
          });
          throw error;
        }
      },
      
      // Connect WebSocket
      connectWebSocket: (providerId) => {
        const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
        const ws = new WebSocket(`${wsUrl}/bookings/realtime?userId=${providerId}&type=provider`);
        
        ws.onopen = () => {
          console.log('📡 WebSocket connected');
          set({ connected: true });
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('📨 WebSocket message:', message);
            
            switch (message.type) {
              case 'booking.new':
                get().addBooking(message.data);
                break;
                
              case 'booking.cancelled':
                get().removeBooking(message.data.bookingId);
                break;
                
              case 'booking.expiring_soon':
                get().markUrgent(message.data.bookingId);
                break;
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          set({ connected: false });
        };
        
        ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          set({ connected: false, ws: null });
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (!get().ws) {
              console.log('🔄 Attempting to reconnect WebSocket...');
              get().connectWebSocket(providerId);
            }
          }, 5000);
        };
        
        set({ ws });
      },
      
      // Disconnect WebSocket
      disconnectWebSocket: () => {
        const { ws } = get();
        if (ws) {
          ws.close();
          set({ ws: null, connected: false });
        }
      },
      
      // Optimistic update
      updateBookingOptimistic: (booking) => {
        set(state => {
          const updates = new Map(state.optimisticUpdates);
          updates.set(booking._id, booking);
          
          return {
            bookings: state.bookings.map(b => 
              b._id === booking._id ? booking : b
            ),
            optimisticUpdates: updates
          };
        });
      },
      
      // Rollback optimistic update
      rollbackOptimisticUpdate: (bookingId) => {
        set(state => {
          const updates = new Map(state.optimisticUpdates);
          const original = updates.get(bookingId);
          updates.delete(bookingId);
          
          return {
            bookings: original 
              ? state.bookings.map(b => b._id === bookingId ? original : b)
              : state.bookings,
            optimisticUpdates: updates
          };
        });
      },
      
      // Helper: Mark booking as urgent
      markUrgent: (bookingId) => {
        set(state => ({
          urgentCount: state.urgentCount + 1
        }));
      },
      
      // Helper: Remove booking from list
      removeBooking: (bookingId) => {
        set(state => ({
          bookings: state.bookings.filter(b => b._id !== bookingId),
          pendingCount: Math.max(0, state.pendingCount - 1)
        }));
      },
      
      // Helper: Add new booking to list
      addBooking: (booking) => {
        set(state => ({
          bookings: [booking, ...state.bookings],
          pendingCount: state.pendingCount + 1,
          urgentCount: isBookingUrgent(booking) ? state.urgentCount + 1 : state.urgentCount
        }));
      }
    }),
    { name: 'bookings-store' }
  )
);

// Helper: Check if booking is urgent
function isBookingUrgent(booking: Booking): boolean {
  const expiresAt = new Date(booking.expiresAt);
  const now = new Date();
  const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilExpiry < 6 && hoursUntilExpiry > 0;
}
