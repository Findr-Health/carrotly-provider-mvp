/**
 * Suggest Alternative Times Modal
 * Allows provider to propose up to 3 alternative time slots
 */

import { useState } from 'react';
import { Calendar, X, Loader, Plus, Trash2, Clock } from 'lucide-react';
import { format, addDays, setHours, setMinutes, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useBookingsStore } from '../../store/bookingsStore';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  patient: {
    name: string;
  };
  service: {
    name: string;
    duration: number;
  };
  requestedStart: string;
  providerTimezone: string;
}

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface SuggestTimesModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function SuggestTimesModal({ booking, onClose }: SuggestTimesModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), startTime: '09:00', endTime: '09:30' }
  ]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { suggestTimes } = useBookingsStore();
  
  const originalTime = formatInTimeZone(
    booking.requestedStart,
    booking.providerTimezone,
    'EEEE, MMM dd, yyyy \'at\' h:mm a'
  );
  
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = setMinutes(setHours(new Date(), hours), minutes);
    const end = new Date(start.getTime() + duration * 60000);
    return format(end, 'HH:mm');
  };
  
  const addTimeSlot = () => {
    if (timeSlots.length >= 3) {
      setError('Maximum 3 alternative times allowed');
      return;
    }
    
    const lastSlot = timeSlots[timeSlots.length - 1];
    const newDate = lastSlot.date;
    const [hours, minutes] = lastSlot.startTime.split(':').map(Number);
    const newStartTime = format(setMinutes(setHours(new Date(), hours + 1), minutes), 'HH:mm');
    const newEndTime = calculateEndTime(newStartTime, booking.service.duration);
    
    setTimeSlots([
      ...timeSlots,
      { date: newDate, startTime: newStartTime, endTime: newEndTime }
    ]);
    setError(null);
  };
  
  const removeTimeSlot = (index: number) => {
    if (timeSlots.length === 1) {
      setError('At least one alternative time is required');
      return;
    }
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
    setError(null);
  };
  
  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate end time when start time changes
    if (field === 'startTime') {
      updated[index].endTime = calculateEndTime(value, booking.service.duration);
    }
    
    setTimeSlots(updated);
    setError(null);
  };
  
  const validateTimeSlots = (): boolean => {
    // Check for duplicate times
    const uniqueTimes = new Set(
      timeSlots.map(slot => `${slot.date}_${slot.startTime}`)
    );
    
    if (uniqueTimes.size !== timeSlots.length) {
      setError('Duplicate time slots detected. Each time must be unique.');
      return false;
    }
    
    // Check that all times are in the future
    const now = new Date();
    for (const slot of timeSlots) {
      const slotDateTime = parseISO(`${slot.date}T${slot.startTime}`);
      if (slotDateTime <= now) {
        setError('All suggested times must be in the future');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateTimeSlots()) {
      return;
    }
    
    if (!message.trim()) {
      setError('Please add a message to explain the alternative times');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Format time slots for API
    const formattedTimes = timeSlots.map(slot => ({
      start: `${slot.date}T${slot.startTime}:00`,
      end: `${slot.date}T${slot.endTime}:00`
    }));
    
    try {
      await suggestTimes(booking._id, formattedTimes, message);
      
      // Success
      toast.success(
        <div>
          <p className="font-semibold">Alternative Times Sent! 📅</p>
          <p className="text-sm">Patient will be notified to choose a new time</p>
        </div>,
        {
          duration: 5000
        }
      );
      
      onClose();
      
    } catch (error: any) {
      setError(error.message || 'Failed to send alternative times');
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
      aria-labelledby="suggest-title"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Calendar className="w-6 h-6 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <h2 id="suggest-title" className="text-xl font-bold text-gray-900">
                Suggest Alternative Times
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Propose up to 3 different times for {booking.patient.name}
              </p>
            </div>
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
          {/* Original Request */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Patient's original request:</p>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-900">{originalTime}</p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {booking.service.name} • {booking.service.duration} minutes
            </p>
          </div>
          
          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Alternative time slots <span className="text-red-500">*</span>
              </label>
              {timeSlots.length < 3 && (
                <button
                  onClick={addTimeSlot}
                  className="flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                  Add Time Slot
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900">
                      Option {index + 1}
                    </span>
                    {timeSlots.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Remove option ${index + 1}`}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label 
                        htmlFor={`date-${index}`}
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Date
                      </label>
                      <input
                        id={`date-${index}`}
                        type="date"
                        value={slot.date}
                        onChange={(e) => updateTimeSlot(index, 'date', e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label 
                        htmlFor={`start-${index}`}
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Start Time
                      </label>
                      <input
                        id={`start-${index}`}
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label 
                        htmlFor={`end-${index}`}
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        End Time
                      </label>
                      <input
                        id={`end-${index}`}
                        type="time"
                        value={slot.endTime}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 cursor-not-allowed"
                        disabled
                        title="Auto-calculated based on service duration"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Duration: {booking.service.duration} minutes (auto-calculated)
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
              Message to patient <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Sorry, I'm not available at your requested time. Would one of these alternative times work for you?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Explain why the original time doesn't work
              </p>
              <span className="text-xs text-gray-500">
                {message.length}/500
              </span>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <X className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <Calendar className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">What happens next?</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Patient receives your suggested times</li>
                <li>They can choose one or request different times</li>
                <li>Once they select, you'll receive a new booking request</li>
              </ul>
            </div>
          </div>
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
            onClick={handleSubmit}
            disabled={isSubmitting || timeSlots.length === 0 || !message.trim()}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 mr-2" aria-hidden="true" />
                Send Proposal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
