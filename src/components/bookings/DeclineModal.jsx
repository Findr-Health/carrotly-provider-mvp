// components/bookings/DeclineModal.jsx
import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

const DECLINE_REASONS = [
  { id: 'schedule', label: 'Schedule conflict', description: 'I\'m not available at this time' },
  { id: 'fully_booked', label: 'Fully booked', description: 'My schedule is full for this period' },
  { id: 'service', label: 'Service unavailable', description: 'I don\'t offer this service currently' },
  { id: 'location', label: 'Location issue', description: 'Patient is outside my service area' },
  { id: 'other', label: 'Other reason', description: 'Specify your reason below' }
];

export default function DeclineModal({ booking, onDecline, onCancel, loading }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const patientName = booking.patient 
    ? `${booking.patient.firstName || ''} ${booking.patient.lastName || ''}`.trim() || 'Patient'
    : 'Unknown Patient';

  const handleDecline = () => {
    const reason = selectedReason === 'other' 
      ? customReason 
      : DECLINE_REASONS.find(r => r.id === selectedReason)?.label || customReason;
    onDecline(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-red-900">Decline Booking</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You're declining <span className="font-medium">{patientName}'s</span> booking request.
            Please select a reason:
          </p>

          {/* Reason Selection */}
          <div className="space-y-2 mb-4">
            {DECLINE_REASONS.map((reason) => (
              <button
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedReason === reason.id
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className="font-medium text-gray-900">{reason.label}</p>
                <p className="text-sm text-gray-500">{reason.description}</p>
              </button>
            ))}
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please explain your reason..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 resize-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
              rows={3}
            />
          )}

          {/* Warning */}
          <div className="bg-amber-50 rounded-lg p-3 mb-6 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              The patient will be notified and their payment hold will be released. 
              Consider proposing an alternative time instead.
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
              onClick={handleDecline}
              disabled={loading || !selectedReason || (selectedReason === 'other' && !customReason.trim())}
              className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Declining...
                </>
              ) : (
                'Decline Booking'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}