// components/bookings/RescheduleModal.jsx
import React, { useState } from 'react';
import { Calendar, Clock, X, Loader2, MessageSquare } from 'lucide-react';

export default function RescheduleModal({ booking, onReschedule, onCancel, loading }) {
  const originalDate = new Date(booking.dateTime?.requestedStart);
  
  // Default to same time tomorrow
  const tomorrow = new Date(originalDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(
    originalDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [message, setMessage] = useState('');

  const patientName = booking.patient 
    ? `${booking.patient.firstName || ''} ${booking.patient.lastName || ''}`.trim() || 'Patient'
    : 'Unknown Patient';

  const handleReschedule = () => {
    const proposedStart = new Date(`${selectedDate}T${selectedTime}`);
    onReschedule(proposedStart.toISOString(), message);
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-blue-900">Propose New Time</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Propose an alternative time for <span className="font-medium">{patientName}'s</span> appointment.
          </p>

          {/* Original Request */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-500 mb-1">Originally requested:</p>
            <p className="font-medium text-gray-900">
              {originalDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })} at {originalDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </p>
          </div>

          {/* Date Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              New Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>

          {/* Time Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              New Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>
                  {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Message to Patient (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., I have a conflict at the original time, but I'm available on..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              rows={3}
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">
              The patient will have 24 hours to accept or decline your proposed time. 
              If they don't respond, the booking will be cancelled.
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
              onClick={handleReschedule}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Send Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}