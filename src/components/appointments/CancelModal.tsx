/**
 * Cancel Booking Modal
 * Allows provider to cancel a confirmed booking with reason
 */
import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  booking: {
    _id: string;
    patient: { name: string };
    service: { name: string };
    requestedStart: string;
    totalAmount: number;
  };
}

export default function CancelModal({ isOpen, onClose, onConfirm, booking }: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedReasons = [
    'Provider illness/emergency',
    'Schedule conflict',
    'Office closure',
    'Equipment unavailable',
    'Other'
  ];

  const handleSubmit = async () => {
    const finalReason = reason === 'Other' ? customReason : reason;
    
    if (!finalReason) {
      setError('Please select or enter a cancellation reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(finalReason);
      onClose();
      setReason('');
      setCustomReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calculate refund (24hr policy: >24hrs = 100%, else provider keeps fee)
  const appointmentDate = new Date(booking.requestedStart);
  const now = new Date();
  const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const refundPercent = hoursUntil >= 24 ? 100 : 0;
  const refundAmount = (booking.totalAmount * refundPercent) / 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Cancel Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-900">This will cancel the appointment</p>
              <p className="text-orange-700 mt-1">
                Patient will be notified immediately and receive a ${refundAmount.toFixed(2)} refund ({refundPercent}%).
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-sm text-gray-600">Patient: <span className="font-medium text-gray-900">{booking.patient.name}</span></p>
            <p className="text-sm text-gray-600">Service: <span className="font-medium text-gray-900">{booking.service.name}</span></p>
            <p className="text-sm text-gray-600">
              Date: <span className="font-medium text-gray-900">{new Date(booking.requestedStart).toLocaleString()}</span>
            </p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason *
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((r) => (
                <label key={r} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          {reason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter cancellation reason..."
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            disabled={loading}
          >
            Keep Appointment
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason || (reason === 'Other' && !customReason)}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Cancelling...' : 'Cancel Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
