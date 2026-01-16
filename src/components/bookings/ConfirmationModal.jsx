// components/bookings/ConfirmationModal.jsx
import React from 'react';
import { CheckCircle, Calendar, User, X, Loader2 } from 'lucide-react';

export default function ConfirmationModal({ booking, onConfirm, onCancel, loading }) {
  const dateTime = new Date(booking.dateTime?.requestedStart);
  const patientName = booking.patient 
    ? `${booking.patient.firstName || ''} ${booking.patient.lastName || ''}`.trim() || 'Patient'
    : 'Unknown Patient';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-green-900">Confirm Booking</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You're about to confirm this booking request:
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">{patientName}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                {dateTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
                {' at '}
                {dateTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{booking.service?.name}</span>
                <span className="font-semibold text-green-600">
                  ${((booking.service?.price || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The patient will be notified immediately, and their payment will be captured.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}