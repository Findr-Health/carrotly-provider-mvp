import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, CheckCircle, X, Calendar, Phone, Mail, 
  AlertTriangle, RefreshCw, ChevronRight, MessageSquare,
  DollarSign, User
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

interface BookingRequest {
  _id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  serviceName: string;
  servicePrice: number;
  requestedDate: string;
  requestedTime: string;
  status: 'pending_confirmation' | 'reschedule_proposed';
  createdAt: string;
  expiresAt: string;
  patientNote?: string;
  proposedDate?: string;
  proposedTime?: string;
}

export default function PendingRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<BookingRequest | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState<BookingRequest | null>(null);
  
  const providerId = localStorage.getItem('providerId');

  const fetchRequests = useCallback(async () => {
    if (!providerId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/bookings/provider/${providerId}/pending`);
      
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.bookings || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const confirmBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-provider-id': providerId || '' }
      });
      
      if (!response.ok) throw new Error('Failed to confirm booking');
      
      await fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const declineBooking = async (bookingId: string, reason: string) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-provider-id': providerId || '' },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) throw new Error('Failed to decline booking');
      
      setShowDeclineModal(null);
      await fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const proposeReschedule = async (bookingId: string, newDate: string, newTime: string, message: string) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-provider-id': providerId || '' },
        body: JSON.stringify({ 
          proposedStart: `${newDate}T${newTime}:00`,
          message 
        })
      });
      
      if (!response.ok) throw new Error('Failed to propose reschedule');
      
      setShowRescheduleModal(null);
      await fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getTimeUntilExpiry = (expiresAt: string): { text: string; urgent: boolean } => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return { text: 'Expired', urgent: true };
    if (hoursLeft < 2) return { text: `${Math.round(hoursLeft * 60)} min left`, urgent: true };
    if (hoursLeft < 6) return { text: `${Math.round(hoursLeft)} hours left`, urgent: true };
    return { text: `${Math.round(hoursLeft)} hours left`, urgent: false };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (!providerId) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Booking Requests</h1>
                <p className="text-sm text-gray-500">
                  {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        {/* Loading State */}
        {loading && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending booking requests at the moment.</p>
          </div>
        )}

        {/* Request Cards */}
        <div className="space-y-4">
          {requests.map((request) => {
            const expiry = getTimeUntilExpiry(request.expiresAt);
            const isLoading = actionLoading === request._id;
            
            return (
              <div 
                key={request._id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  expiry.urgent 
                    ? 'border-amber-300 shadow-amber-100 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Urgency Banner */}
                {expiry.urgent && (
                  <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 rounded-t-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      ⏰ URGENT — {expiry.text}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Patient Info Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.patientName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          {request.patientEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {request.patientEmail}
                            </span>
                          )}
                          {request.patientPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {request.patientPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!expiry.urgent && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {expiry.text}
                      </span>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Requested Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(request.requestedDate)} at {formatTime(request.requestedTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-medium text-gray-900">{request.serviceName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-gray-900">{formatPrice(request.servicePrice)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Note */}
                  {request.patientNote && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-blue-700 mb-1">Patient Note</p>
                          <p className="text-sm text-blue-900">{request.patientNote}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reschedule Proposed Status */}
                  {request.status === 'reschedule_proposed' && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                      <p className="text-sm text-purple-800">
                        <span className="font-medium">Reschedule proposed:</span>{' '}
                        {formatDate(request.proposedDate!)} at {formatTime(request.proposedTime!)}
                        <span className="text-purple-600 ml-2">— Waiting for patient response</span>
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending_confirmation' && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => confirmBooking(request._id)}
                        disabled={isLoading}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Confirm
                      </button>
                      
                      <button
                        onClick={() => setShowRescheduleModal(request)}
                        disabled={isLoading}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-teal-500 hover:text-teal-700 transition font-medium disabled:opacity-50"
                      >
                        <Calendar className="w-4 h-4" />
                        Propose New Time
                      </button>
                      
                      <button
                        onClick={() => setShowDeclineModal(request)}
                        disabled={isLoading}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-red-600 rounded-lg hover:border-red-300 hover:bg-red-50 transition font-medium disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <RescheduleModal
          booking={showRescheduleModal}
          onClose={() => setShowRescheduleModal(null)}
          onSubmit={(date, time, message) => proposeReschedule(showRescheduleModal._id, date, time, message)}
          loading={actionLoading === showRescheduleModal._id}
        />
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <DeclineModal
          booking={showDeclineModal}
          onClose={() => setShowDeclineModal(null)}
          onSubmit={(reason) => declineBooking(showDeclineModal._id, reason)}
          loading={actionLoading === showDeclineModal._id}
        />
      )}
    </div>
  );
}

// Reschedule Modal Component
function RescheduleModal({ 
  booking, 
  onClose, 
  onSubmit, 
  loading 
}: { 
  booking: BookingRequest;
  onClose: () => void;
  onSubmit: (date: string, time: string, message: string) => void;
  loading: boolean;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time) {
      onSubmit(date, time, message);
    }
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 7; hour <= 19; hour++) {
    for (let min of ['00', '30']) {
      const h = hour.toString().padStart(2, '0');
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      timeSlots.push({
        value: `${h}:${min}`,
        label: `${displayHour}:${min} ${ampm}`
      });
    }
  }

  // Generate dates for next 30 days
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push({
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Propose Alternative Time</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Original Request:</span>{' '}
              {new Date(booking.requestedDate).toLocaleDateString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric' 
              })} at {booking.requestedTime}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Date *</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select date...</option>
                {dates.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Time *</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select time...</option>
                {timeSlots.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Patient <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Let the patient know why you're suggesting a different time..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !date || !time}
              className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Send Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Decline Modal Component
function DeclineModal({ 
  booking, 
  onClose, 
  onSubmit, 
  loading 
}: { 
  booking: BookingRequest;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const reasons = [
    { value: 'not_available', label: 'I\'m not available at this time' },
    { value: 'fully_booked', label: 'My schedule is fully booked' },
    { value: 'service_unavailable', label: 'This service is temporarily unavailable' },
    { value: 'other', label: 'Other reason' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'other' ? reason : reasons.find(r => r.value === selectedReason)?.label || reason;
    onSubmit(finalReason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Decline Booking Request</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> The patient's card hold will be released and they will not be charged.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Why are you declining?</label>
            <div className="space-y-2">
              {reasons.map(r => (
                <label key={r.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={selectedReason === r.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Please specify</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                required
                placeholder="Reason for declining..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedReason || (selectedReason === 'other' && !reason)}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Decline Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
