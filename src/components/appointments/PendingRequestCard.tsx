/**
 * Pending Request Card Component
 * Comprehensive booking request card with timezone handling, urgency indicators, and quick actions
 */

import { useState } from 'react';
import { 
  Clock, Calendar, DollarSign, User, Mail, Phone, 
  CheckCircle, X, MessageSquare, ChevronDown, AlertTriangle, Info 
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { differenceInHours, differenceInMinutes } from 'date-fns';
import ConfirmModal from './ConfirmModal';
import DeclineModal from './DeclineModal';
import SuggestTimesModal from './SuggestTimesModal';

interface Booking {
  _id: string;
  patient: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  isReturningPatient: boolean;
  previousBookingCount: number;
  service: {
    name: string;
    category: string;
    duration: number;
    price: number;
  };
  requestedStart: string;
  requestedEnd: string;
  providerTimezone: string;
  patientTimezone: string;
  status: string;
  patientNote?: string;
  totalAmount: number;
  depositAmount: number;
  expiresAt: string;
}

interface PendingRequestCardProps {
  booking: Booking;
}

export default function PendingRequestCard({ booking }: PendingRequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showSuggestTimesModal, setShowSuggestTimesModal] = useState(false);
  
  // Calculate urgency
  const now = new Date();
  const expiresAt = new Date(booking.expiresAt);
  const hoursUntilExpiry = differenceInHours(expiresAt, now);
  const minutesUntilExpiry = differenceInMinutes(expiresAt, now) % 60;
  const isUrgent = hoursUntilExpiry < 6 && hoursUntilExpiry >= 0;
  const isExpired = expiresAt < now;
  
  // Timezone display
  const displayTime = formatInTimeZone(
    booking.requestedStart,
    booking.providerTimezone,
    'MMM dd, yyyy \'at\' h:mm a zzz'
  );
  
  const patientTime = formatInTimeZone(
    booking.requestedStart,
    booking.patientTimezone,
    'h:mm a zzz'
  );
  
  const isDifferentTimezone = booking.providerTimezone !== booking.patientTimezone;
  
  // Check if mobile
  const isMobile = window.innerWidth < 768;
  
  if (isExpired) {
    return (
      <div className="border border-gray-300 rounded-lg p-6 mb-4 bg-gray-50 opacity-60">
        <div className="flex items-center text-gray-600">
          <Clock className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Request Expired</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          This booking request was not responded to within the required timeframe.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div 
        className={`
          border rounded-lg p-6 mb-4 transition-all duration-200
          ${isUrgent 
            ? 'border-red-300 bg-red-50 shadow-lg ring-2 ring-red-200' 
            : 'border-gray-200 bg-white hover:shadow-md'
          }
        `}
      >
        {/* Urgency Badge */}
        {isUrgent && (
          <div 
            className="flex items-center text-red-700 mb-4 pb-3 border-b border-red-200" 
            role="alert"
            aria-live="assertive"
          >
            <Clock className="w-5 h-5 mr-2 animate-pulse" aria-hidden="true" />
            <span className="text-sm font-bold uppercase tracking-wide">
              ⚠️ EXPIRES IN {hoursUntilExpiry}H {minutesUntilExpiry}M
            </span>
          </div>
        )}
        
        {/* Patient Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg flex-shrink-0">
              {booking.patient.avatar ? (
                <img 
                  src={booking.patient.avatar} 
                  alt={booking.patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                booking.patient.name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.patient.name}
                </h3>
                
                {booking.isReturningPatient && (
                  <span 
                    className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full"
                    title="This patient has visited before"
                  >
                    🔄 Returning Patient ({booking.previousBookingCount} visits)
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" aria-hidden="true" />
                  <a 
                    href={`mailto:${booking.patient.email}`}
                    className="hover:text-teal-600 transition-colors"
                  >
                    {booking.patient.email}
                  </a>
                </div>
                
                {booking.patient.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" aria-hidden="true" />
                    <a 
                      href={`tel:${booking.patient.phone}`}
                      className="hover:text-teal-600 transition-colors"
                    >
                      {booking.patient.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Expand Toggle (Mobile) */}
          {isMobile && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
              aria-expanded={isExpanded}
            >
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        
        {/* Booking Details */}
        <div className={`space-y-3 ${isMobile && !isExpanded ? 'hidden' : ''}`}>
          {/* Service Info */}
          <div className="flex items-start bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Service</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {booking.service.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {booking.service.category} • {booking.service.duration} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${booking.totalAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Date & Time */}
          <div className="flex items-center text-gray-700 bg-white border border-gray-200 rounded-lg p-4">
            <Calendar className="w-5 h-5 mr-3 text-teal-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{displayTime}</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Duration: {booking.service.duration} minutes
              </p>
            </div>
          </div>
          
          {/* Timezone Warning */}
          {isDifferentTimezone && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Different Timezone
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  Patient is in <strong>{booking.patientTimezone}</strong>.
                  For them, this appointment is at <strong>{patientTime}</strong>.
                </p>
              </div>
            </div>
          )}
          
          {/* Patient Note */}
          {booking.patientNote && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <MessageSquare className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">Patient's Message</p>
                  <p className="text-sm text-blue-800 italic">
                    "{booking.patientNote}"
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Info */}
          <div className="flex items-start text-sm text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p>
                <strong>${booking.depositAmount}</strong> deposit currently on hold.
                Full <strong>${booking.totalAmount}</strong> will be charged upon confirmation.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Patient can cancel up to 24 hours before appointment for full refund.
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            aria-label={`Confirm booking for ${booking.patient.name}`}
          >
            <CheckCircle className="w-5 h-5 mr-2" aria-hidden="true" />
            Confirm Booking
          </button>
          
          <button
            onClick={() => setShowSuggestTimesModal(true)}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Suggest alternative times"
          >
            <Calendar className="w-5 h-5 mr-2" aria-hidden="true" />
            Suggest New Time
          </button>
          
          <button
            onClick={() => setShowDeclineModal(true)}
            className="sm:w-auto flex items-center justify-center px-6 py-3 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Decline booking"
          >
            <X className="w-5 h-5 sm:mr-0 mr-2" aria-hidden="true" />
            <span className="sm:hidden">Decline</span>
          </button>
        </div>
      </div>
      
      {/* Modals */}
      {showConfirmModal && (
        <ConfirmModal
          booking={booking}
          onClose={() => setShowConfirmModal(false)}
        />
      )}
      
      {showDeclineModal && (
        <DeclineModal
          booking={booking}
          onClose={() => setShowDeclineModal(false)}
        />
      )}
      
      {showSuggestTimesModal && (
        <SuggestTimesModal
          booking={booking}
          onClose={() => setShowSuggestTimesModal(false)}
        />
      )}
    </>
  );
}
