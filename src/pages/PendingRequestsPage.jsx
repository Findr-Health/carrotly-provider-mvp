// pages/PendingRequestsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  Calendar, 
  X, 
  AlertTriangle,
  ArrowLeft,
  Filter,
  RefreshCw,
  User,
  DollarSign,
  Mail,
  Phone
} from 'lucide-react';
import { usePendingBookings } from '../hooks/useBookings';
import RescheduleModal from '../components/bookings/RescheduleModal';
import DeclineModal from '../components/bookings/DeclineModal';
import ConfirmationModal from '../components/bookings/ConfirmationModal';

function formatTimeRemaining(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;
  
  if (diff <= 0) return { text: 'Expired', urgent: true };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours < 4) return { text: `${hours}h ${minutes}m`, urgent: true };
  if (hours < 12) return { text: `${hours}h ${minutes}m`, urgent: false };
  return { text: `${Math.floor(hours / 24)}d ${hours % 24}h`, urgent: false };
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  };
}

export default function PendingRequestsPage({ providerId }) {
  const navigate = useNavigate();
  const { bookings, loading, error, refetch, confirmBooking, declineBooking, rescheduleBooking } = usePendingBookings(providerId);
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency' | 'date' | 'amount'

  // Sort bookings
  const sortedBookings = [...(bookings || [])].sort((a, b) => {
    if (sortBy === 'urgency') {
      const aExpiry = new Date(a.confirmation?.expiresAt);
      const bExpiry = new Date(b.confirmation?.expiresAt);
      return aExpiry - bExpiry;
    }
    if (sortBy === 'date') {
      const aDate = new Date(a.dateTime?.requestedStart);
      const bDate = new Date(b.dateTime?.requestedStart);
      return aDate - bDate;
    }
    if (sortBy === 'amount') {
      return (b.service?.price || 0) - (a.service?.price || 0);
    }
    return 0;
  });

  const handleConfirm = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    const result = await confirmBooking(selectedBooking._id);
    setActionLoading(false);
    if (result.success) {
      setShowConfirmModal(false);
      setSelectedBooking(null);
    } else {
      alert('Failed to confirm: ' + result.error);
    }
  };

  const handleDecline = async (reason) => {
    if (!selectedBooking) return;
    setActionLoading(true);
    const result = await declineBooking(selectedBooking._id, reason);
    setActionLoading(false);
    if (result.success) {
      setShowDeclineModal(false);
      setSelectedBooking(null);
    } else {
      alert('Failed to decline: ' + result.error);
    }
  };

  const handleReschedule = async (proposedStart, message) => {
    if (!selectedBooking) return;
    setActionLoading(true);
    const result = await rescheduleBooking(selectedBooking._id, proposedStart, message);
    setActionLoading(false);
    if (result.success) {
      setShowRescheduleModal(false);
      setSelectedBooking(null);
    } else {
      alert('Failed to reschedule: ' + result.error);
    }
  };

  const urgentCount = sortedBookings.filter(b => {
    const remaining = formatTimeRemaining(b.confirmation?.expiresAt);
    return remaining.urgent;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pending Requests</h1>
                <p className="text-sm text-gray-500">
                  {sortedBookings.length} request{sortedBookings.length !== 1 ? 's' : ''} awaiting your response
                  {urgentCount > 0 && (
                    <span className="text-red-600 font-medium ml-2">
                      ({urgentCount} urgent)
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="urgency">Sort by Urgency</option>
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
              
              <button
                onClick={refetch}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Error loading bookings: {error}</p>
          </div>
        )}

        {sortedBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No pending booking requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map((booking) => {
              const timeRemaining = formatTimeRemaining(booking.confirmation?.expiresAt);
              const dateTime = formatDateTime(booking.dateTime?.requestedStart);
              const patientName = booking.patient 
                ? `${booking.patient.firstName || ''} ${booking.patient.lastName || ''}`.trim() || 'Patient'
                : 'Unknown Patient';

              return (
                <div
                  key={booking._id}
                  className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                    timeRemaining.urgent 
                      ? 'border-red-200 shadow-red-100' 
                      : 'border-gray-100'
                  }`}
                >
                  {/* Urgent Banner */}
                  {timeRemaining.urgent && (
                    <div className="bg-red-500 text-white text-sm font-medium px-4 py-1.5 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Expires in {timeRemaining.text} - Respond now!
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Left: Patient & Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-teal-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Patient Name & Booking Number */}
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {patientName}
                              </h3>
                              <span className="text-xs text-gray-400 font-mono">
                                {booking.bookingNumber}
                              </span>
                            </div>
                            
                            {/* Contact Info */}
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              {booking.patient?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {booking.patient.email}
                                </span>
                              )}
                              {booking.patient?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  {booking.patient.phone}
                                </span>
                              )}
                            </div>

                            {/* Service Details */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {booking.service?.name || 'Service'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {booking.service?.duration || 30} minutes
                                    {booking.service?.category && ` • ${booking.service.category}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-green-600">
                                    ${((booking.service?.price || 0) / 100).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Date/Time & Expiry */}
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">{dateTime.date}</span>
                                <span>at</span>
                                <span className="font-medium">{dateTime.time}</span>
                              </div>
                              
                              {!timeRemaining.urgent && (
                                <div className="flex items-center gap-1.5 text-amber-600">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {timeRemaining.text} to respond
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 ml-6">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowConfirmModal(true);
                          }}
                          className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowRescheduleModal(true);
                          }}
                          className="px-6 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                          <Calendar className="w-5 h-5" />
                          Propose New Time
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDeclineModal(true);
                          }}
                          className="px-6 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Decline Request
                        </button>
                      </div>
                    </div>

                    {/* Patient Notes */}
                    {booking.notes?.patientNotes && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Patient notes:</span> {booking.notes.patientNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showConfirmModal && selectedBooking && (
        <ConfirmationModal
          booking={selectedBooking}
          onConfirm={handleConfirm}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedBooking(null);
          }}
          loading={actionLoading}
        />
      )}

      {showDeclineModal && selectedBooking && (
        <DeclineModal
          booking={selectedBooking}
          onDecline={handleDecline}
          onCancel={() => {
            setShowDeclineModal(false);
            setSelectedBooking(null);
          }}
          loading={actionLoading}
        />
      )}

      {showRescheduleModal && selectedBooking && (
        <RescheduleModal
          booking={selectedBooking}
          onReschedule={handleReschedule}
          onCancel={() => {
            setShowRescheduleModal(false);
            setSelectedBooking(null);
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}