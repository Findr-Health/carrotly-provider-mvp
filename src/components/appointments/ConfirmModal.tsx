/**
 * Confirm Booking Modal
 * Handles booking confirmation with optimistic updates, error handling, and retry logic
 */

import { useState } from 'react';
import { CheckCircle, X, Loader, AlertTriangle } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { useBookingsStore } from '../../store/bookingsStore';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  patient: {
    name: string;
    email: string;
  };
  service: {
    name: string;
    duration: number;
  };
  requestedStart: string;
  providerTimezone: string;
  totalAmount: number;
}

interface ConfirmModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function ConfirmModal({ booking, onClose }: ConfirmModalProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { confirmBooking, updateBookingOptimistic, rollbackOptimisticUpdate } = useBookingsStore();
  
  const displayTime = formatInTimeZone(
    booking.requestedStart,
    booking.providerTimezone,
    'EEEE, MMM dd, yyyy \'at\' h:mm a zzz'
  );
  
  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    
    // Optimistic update
    const optimisticBooking = { 
      ...booking, 
      status: 'confirmed',
      confirmedAt: new Date().toISOString()
    };
    updateBookingOptimistic(optimisticBooking);
    
    // Close modal immediately for better UX
    onClose();
    
    try {
      await confirmBooking(booking._id, note);
      
      // Success toast
      toast.success(
        <div>
          <p className="font-semibold">Booking Confirmed! 🎉</p>
          <p className="text-sm">Confirmation sent to {booking.patient.name}</p>
        </div>,
        {
          duration: 5000,
          icon: '✅'
        }
      );
      
    } catch (error: any) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(booking._id);
      
      // Show error with retry option
      toast.error(
        (t) => (
          <div>
            <p className="font-semibold">Failed to confirm booking</p>
            <p className="text-sm mb-2">{error.message || 'Please try again'}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleConfirm();
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Retry
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity
        }
      );
      
      setError(error.message || 'Failed to confirm booking');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-labelledby="confirm-title"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="w-6 h-6 text-teal-600" aria-hidden="true" />
            </div>
            <h2 id="confirm-title" className="text-xl font-bold text-gray-900">
              Confirm Booking
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Patient</span>
                <span className="text-sm font-semibold text-gray-900">{booking.patient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service</span>
                <span className="text-sm font-semibold text-gray-900">{booking.service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-semibold text-gray-900">{booking.service.duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-semibold text-gray-900">${booking.totalAmount}</span>
              </div>
              <div className="pt-2 border-t border-gray-300">
                <span className="text-sm text-gray-600">Date & Time</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{displayTime}</p>
              </div>
            </div>
          </div>
          
          {/* What will happen */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">This will:</p>
            <div className="space-y-2">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-gray-700">Send confirmation email and SMS to patient</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-gray-700">Block this time slot in your calendar</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-gray-700">Charge ${booking.totalAmount} to patient's card</span>
              </div>
            </div>
          </div>
          
          {/* Optional Note */}
          <div>
            <label htmlFor="confirmation-note" className="block text-sm font-medium text-gray-900 mb-2">
              Add a personal note <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="confirmation-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Looking forward to meeting you! Please arrive 5 minutes early."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              rows={3}
              maxLength={500}
              aria-describedby="note-hint"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p id="note-hint" className="text-xs text-gray-500">
                This message will be included in the confirmation email
              </p>
              <span className="text-xs text-gray-500">
                {note.length}/500
              </span>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Failed to confirm booking</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                Confirm & Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
