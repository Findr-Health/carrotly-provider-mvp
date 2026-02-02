/**
 * Alert Banner Component
 * Shows urgent notification for bookings expiring soon
 */

import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useBookingsStore } from '../store/bookingsStore';
import { useState } from 'react';

export default function AlertBanner() {
  const navigate = useNavigate();
  const { urgentCount } = useBookingsStore();
  const [dismissed, setDismissed] = useState(false);
  
  // Don't show if no urgent bookings or if dismissed
  if (urgentCount === 0 || dismissed) return null;
  
  const handleRespond = () => {
    navigate('/appointments?filter=urgent');
  };
  
  const handleDismiss = () => {
    setDismissed(true);
    // Re-show on next urgent booking
    setTimeout(() => setDismissed(false), 60000); // Reset after 1 minute
  };
  
  return (
    <div
      className="bg-red-50 border-l-4 border-red-500 p-4 shadow-md"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="flex-shrink-0">
            <AlertTriangle 
              className="w-6 h-6 text-red-500 animate-pulse" 
              aria-hidden="true" 
            />
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-red-900">
              {urgentCount} {urgentCount === 1 ? 'booking request' : 'booking requests'} expiring soon
            </h3>
            <p className="text-sm text-red-700 mt-1">
              These requests will be automatically declined if not responded to within the next few hours.
              Please review and respond as soon as possible.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleRespond}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Respond to urgent booking requests"
          >
            Respond Now
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Dismiss urgent notification"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact version for Dashboard
export function AlertBannerCompact() {
  const navigate = useNavigate();
  const { urgentCount } = useBookingsStore();
  
  if (urgentCount === 0) return null;
  
  return (
    <button
      onClick={() => navigate('/appointments?filter=urgent')}
      className="w-full bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors text-left"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              {urgentCount} urgent {urgentCount === 1 ? 'request' : 'requests'}
            </p>
            <p className="text-xs text-red-700">
              Expiring in next 6 hours
            </p>
          </div>
        </div>
        
        <div className="text-sm font-medium text-red-600">
          View →
        </div>
      </div>
    </button>
  );
}
