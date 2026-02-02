/**
 * Decline Booking Modal
 * Allows provider to decline booking with reason and optional custom message
 */

import { useState } from 'react';
import { X, AlertTriangle, Loader } from 'lucide-react';
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
  };
  requestedStart: string;
  providerTimezone: string;
}

interface DeclineModalProps {
  booking: Booking;
  onClose: () => void;
}

const DECLINE_REASONS = [
  {
    id: 'slot_unavailable',
    label: 'Time slot no longer available',
    description: 'Someone else booked this slot first'
  },
  {
    id: 'outside_service_area',
    label: 'Outside my service area',
    description: 'Patient location is too far'
  },
  {
    id: 'service_not_offered',
    label: 'Service not offered anymore',
    description: 'This service is no longer available'
  },
  {
    id: 'not_qualified',
    label: 'Not qualified for this service',
    description: 'Patient needs a different specialist'
  },
  {
    id: 'personal_conflict',
    label: 'Personal conflict',
    description: 'Unexpected personal scheduling conflict'
  },
  {
    id: 'other',
    label: 'Other reason',
    description: 'Specify a custom reason below'
  }
];

export default function DeclineModal({ booking, onClose }: DeclineModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { declineBooking } = useBookingsStore();
  
  const displayTime = formatInTimeZone(
    booking.requestedStart,
    booking.providerTimezone,
    'EEEE, MMM dd, yyyy \'at\' h:mm a zzz'
  );
  
  const handleDecline = async () => {
    if (!selectedReason) {
      setError('Please select a reason for declining');
      return;
    }
    
    if (selectedReason === 'other' && !customMessage.trim()) {
      setError('Please provide a custom reason');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const reason = selectedReason === 'other' 
      ? customMessage 
      : DECLINE_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;
    
    try {
      await declineBooking(booking._id, reason);
      
      // Success
      toast.success(
        <div>
          <p className="font-semibold">Booking Declined</p>
          <p className="text-sm">Patient has been notified</p>
        </div>,
        {
          duration: 4000
        }
      );
      
      onClose();
      
    } catch (error: any) {
      setError(error.message || 'Failed to decline booking');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-labelledby="decline-title"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <X className="w-6 h-6 text-red-600" aria-hidden="true" />
            </div>
            <h2 id="decline-title" className="text-xl font-bold text-gray-900">
              Decline Booking Request
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
              <div className="pt-2 border-t border-gray-300">
                <span className="text-sm text-gray-600">Requested Time</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{displayTime}</p>
              </div>
            </div>
          </div>
          
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                This action cannot be undone
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                The patient will be notified immediately and their deposit will be refunded.
              </p>
            </div>
          </div>
          
          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Why are you declining this booking? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {DECLINE_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`
                    flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedReason === reason.id 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="decline-reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                    disabled={isSubmitting}
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {reason.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {reason.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Custom Message (shown if "other" or always for additional context) */}
          {selectedReason && (
            <div>
              <label htmlFor="custom-message" className="block text-sm font-medium text-gray-900 mb-2">
                {selectedReason === 'other' ? (
                  <>Custom reason <span className="text-red-500">*</span></>
                ) : (
                  <>Additional message <span className="text-gray-500">(optional)</span></>
                )}
              </label>
              <textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={
                  selectedReason === 'other'
                    ? 'Please explain why you\'re declining this booking...'
                    : 'Add any additional context for the patient...'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
                required={selectedReason === 'other'}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  This will be sent to {booking.patient.name}
                </p>
                <span className="text-xs text-gray-500">
                  {customMessage.length}/500
                </span>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
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
            onClick={handleDecline}
            disabled={isSubmitting || !selectedReason || (selectedReason === 'other' && !customMessage.trim())}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                Declining...
              </>
            ) : (
              <>
                <X className="w-5 h-5 mr-2" aria-hidden="true" />
                Decline & Notify Patient
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
