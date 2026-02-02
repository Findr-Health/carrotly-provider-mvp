import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PendingRequestsWidget() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingBookings();
    const interval = setInterval(loadPendingBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingBookings = async () => {
    try {
      const providerId = localStorage.getItem('providerId');
      if (!providerId) return;
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bookings/provider/${providerId}/pending`
      );
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to load pending bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      const providerId = localStorage.getItem('providerId');
      await fetch(`${import.meta.env.VITE_API_URL}/bookings/${id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId,
        },
      });
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      alert('Failed to confirm booking');
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm('Decline this booking request?')) return;
    try {
      const providerId = localStorage.getItem('providerId');
      await fetch(`${import.meta.env.VITE_API_URL}/bookings/${id}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId,
        },
        body: JSON.stringify({ reason: 'Provider declined' }),
      });
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      alert('Failed to decline booking');
    }
  };

  if (loading || bookings.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-xl">⏳</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-amber-900">
              Pending Booking Requests
            </h2>
            <p className="text-sm text-amber-700">
              {bookings.length} request{bookings.length !== 1 ? 's' : ''} need your response
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {bookings.slice(0, 3).map((booking) => (
          <div key={booking._id} className="bg-white rounded-lg p-4 border border-amber-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {booking.patient?.firstName} {booking.patient?.lastName}
                </div>
                <p className="text-sm text-gray-600">
                  {booking.service?.name} • ${((booking.service?.price || 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(booking.dateTime?.requestedStart).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleConfirm(booking._id)}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleDecline(booking._id)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
