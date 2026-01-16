// components/bookings/PendingRequestsWidget.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Calendar, X, AlertTriangle } from 'lucide-react';

function formatTimeRemaining(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatPrice(cents) {
  return (cents / 100).toFixed(2);
}

export default function PendingRequestsWidget({ 
  bookings, 
  onConfirm, 
  onDecline, 
  onReschedule,
  loading 
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 mb-6 animate-pulse">
        <div className="h-6 bg-amber-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-24 bg-white/50 rounded-lg"></div>
          <div className="h-24 bg-white/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return null;
  }

  const urgentCount = bookings.filter(b => {
    const expiresAt = new Date(b.confirmation?.expiresAt);
    return (expiresAt - new Date()) < 4 * 60 * 60 * 1000;
  }).length;

  return (
    <div className={`bg-gradient-to-r ${urgentCount > 0 ? 'from-red-50 to-orange-50 border-red-200' : 'from-amber-50 to-yellow-50 border-amber-200'} border-2 rounded-xl p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${urgentCount > 0 ? 'bg-red-100' : 'bg-amber-100'} rounded-full flex items-center justify-center`}>
            {urgentCount > 0 ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <Clock className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${urgentCount > 0 ? 'text-red-900' : 'text-amber-900'}`}>
              Pending Booking Requests
            </h2>
            <p className={`text-sm ${urgentCount > 0 ? 'text-red-700' : 'text-amber-700'}`}>
              {bookings.length} request{bookings.length !== 1 ? 's' : ''} need{bookings.length === 1 ? 's' : ''} your response
              {urgentCount > 0 && (
                <span className="font-medium text-red-600 ml-1">
                  ({urgentCount} expiring soon!)
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/bookings/pending')}
          className={`${urgentCount > 0 ? 'text-red-700 hover:text-red-900' : 'text-amber-700 hover:text-amber-900'} font-medium text-sm flex items-center gap-1`}
        >
          View All
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Booking Cards */}
      <div className="space-y-3">
        {bookings.slice(0, 3).map((booking) => {
          const expiresAt = new Date(booking.confirmation?.expiresAt);
          const isUrgent = (expiresAt - new Date()) < 4 * 60 * 60 * 1000;
          const patientName = booking.patient 
            ? `${booking.patient.firstName || ''} ${booking.patient.lastName || ''}`.trim() || booking.patient.email
            : 'Unknown Patient';

          return (
            <div
              key={booking._id}
              className={`bg-white rounded-lg p-4 border-2 transition-all hover:shadow-md ${
                isUrgent ? 'border-red-300 shadow-red-100' : 'border-amber-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Patient & Urgency */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">
                      {patientName}
                    </span>
                    {isUrgent && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap animate-pulse">
                        ⚠️ Expires soon
                      </span>
                    )}
                  </div>
                  
                  {/* Service Info */}
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{booking.service?.name || 'Service'}</span>
                    <span className="mx-2">•</span>
                    <span className="text-green-600 font-medium">${formatPrice(booking.service?.price || 0)}</span>
                  </p>
                  
                  {/* Date/Time */}
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateTime(booking.dateTime?.requestedStart)}
                  </p>
                  
                  {/* Expiry */}
                  <p className={`text-xs mt-1.5 font-medium ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatTimeRemaining(booking.confirmation?.expiresAt)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => onConfirm(booking._id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReschedule(booking)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => onDecline(booking)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more indicator */}
      {bookings.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/bookings/pending')}
            className={`text-sm font-medium ${urgentCount > 0 ? 'text-red-600 hover:text-red-700' : 'text-amber-600 hover:text-amber-700'}`}
          >
            +{bookings.length - 3} more requests →
          </button>
        </div>
      )}
    </div>
  );
}