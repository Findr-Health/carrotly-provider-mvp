// src/hooks/useBookings.ts
import { useState, useEffect, useCallback } from 'react';
import { bookingsAPI } from '../services/api';

interface Booking {
  _id: string;
  bookingNumber: string;
  patient: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  service: {
    name: string;
    price: number;
    duration: number;
    category?: string;
  };
  dateTime: {
    requestedStart: string;
    requestedEnd: string;
    confirmedStart?: string;
    confirmedEnd?: string;
  };
  confirmation: {
    required: boolean;
    expiresAt?: string;
    remindersSent: number;
  };
  status: string;
  bookingType: string;
  notes?: {
    patientNotes?: string;
  };
}

interface UsePendingBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  declineBooking: (bookingId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  rescheduleBooking: (bookingId: string, proposedStart: string, message?: string) => Promise<{ success: boolean; error?: string }>;
}

export function usePendingBookings(providerId: string): UsePendingBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await bookingsAPI.getPending(providerId);
      setBookings(data.bookings || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const confirmBooking = async (bookingId: string) => {
    try {
      await bookingsAPI.confirm(bookingId, providerId);
      await fetchBookings();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to confirm' };
    }
  };

  const declineBooking = async (bookingId: string, reason: string) => {
    try {
      await bookingsAPI.decline(bookingId, providerId, reason);
      await fetchBookings();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to decline' };
    }
  };

  const rescheduleBooking = async (bookingId: string, proposedStart: string, message?: string) => {
    try {
      await bookingsAPI.reschedule(bookingId, providerId, proposedStart, message);
      await fetchBookings();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reschedule' };
    }
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    confirmBooking,
    declineBooking,
    rescheduleBooking
  };
}

interface UseAllBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  pagination: { total: number; limit: number; skip: number };
  setParams: React.Dispatch<React.SetStateAction<any>>;
  refetch: () => Promise<void>;
}

export function useAllBookings(providerId: string, initialParams = {}): UseAllBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, skip: 0 });
  const [params, setParams] = useState(initialParams);

  const fetchBookings = useCallback(async () => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await bookingsAPI.getAll(providerId, params);
      setBookings(data.bookings || []);
      setPagination(data.pagination || { total: 0, limit: 20, skip: 0 });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [providerId, params]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    pagination,
    setParams,
    refetch: fetchBookings
  };
}
