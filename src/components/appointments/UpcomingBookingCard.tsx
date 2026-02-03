/**
 * Upcoming Booking Card Component
 * Display confirmed upcoming appointments
 */
import { Calendar, Clock, User, Mail, Phone, DollarSign } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

interface Booking {
  _id: string;
  patient: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  service: {
    name: string;
    category: string;
    duration: number;
    price: number;
  };
  requestedStart: string;
  requestedEnd: string;
  providerTimezone: string;
  status: string;
  patientNote?: string;
  totalAmount: number;
}

interface UpcomingBookingCardProps {
  booking: Booking;
  past?: boolean;
}

export default function UpcomingBookingCard({ booking, past = false }: UpcomingBookingCardProps) {
  const timezone = booking.providerTimezone || 'America/Los_Angeles';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          {/* Patient Avatar */}
          <div className="flex-shrink-0">
            {booking.patient.avatar ? (
              <img 
                src={booking.patient.avatar} 
                alt={booking.patient.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <User className="w-6 h-6 text-teal-600" />
              </div>
            )}
          </div>
          
          {/* Booking Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.patient.name}
              </h3>
              {past && (
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  Completed
                </span>
              )}
            </div>
            
            {/* Service */}
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="font-medium text-gray-900">{booking.service.name}</span>
              <span className="mx-2">•</span>
              <span>{booking.service.category}</span>
              <span className="mx-2">•</span>
              <span>{booking.service.duration} min</span>
            </div>
            
            {/* Date & Time */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                <span>{formatInTimeZone(new Date(booking.requestedStart), timezone, 'EEE, MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                <span>
                  {formatInTimeZone(new Date(booking.requestedStart), timezone, 'h:mm a')}
                  {' - '}
                  {formatInTimeZone(new Date(booking.requestedEnd), timezone, 'h:mm a z')}
                </span>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {booking.patient.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1.5" />
                  <span>{booking.patient.email}</span>
                </div>
              )}
              {booking.patient.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1.5" />
                  <span>{booking.patient.phone}</span>
                </div>
              )}
            </div>
            
            {/* Patient Note */}
            {booking.patientNote && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Note:</span> {booking.patientNote}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Price */}
        <div className="flex-shrink-0 text-right ml-4">
          <div className="flex items-center text-lg font-bold text-gray-900">
            <DollarSign className="w-5 h-5 text-gray-400 -ml-1" />
            {booking.totalAmount.toFixed(2)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
      </div>
      
      {/* Actions */}
      {!past && (
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Reschedule
          </button>
          <button className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
            View Details
          </button>
        </div>
      )}
    </div>
  );
}
