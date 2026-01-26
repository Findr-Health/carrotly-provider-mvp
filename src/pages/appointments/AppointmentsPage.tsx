/**
 * Appointments Page - Main View
 * Tabbed interface for Pending, Upcoming, and Past bookings
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { List, Calendar, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { useBookingsStore } from '../../store/bookingsStore';
import { useProviderData } from '../../hooks/useProviderData';
import PendingRequestCard from '../../components/appointments/PendingRequestCard';
import UpcomingBookingCard from '../../components/appointments/UpcomingBookingCard';
import CalendarView from '../../components/appointments/CalendarView';
import AlertBanner from '../../components/AlertBanner';

type ViewMode = 'list' | 'calendar';
type TabValue = 'pending' | 'upcoming' | 'past';

export default function AppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState<TabValue>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { provider } = useProviderData();
  const providerId = provider?._id || localStorage.getItem('providerId');
  
  const {
    bookings,
    loading,
    error,
    pendingCount,
    urgentCount,
    upcomingCount,
    connected,
    fetchBookings,
    connectWebSocket,
    disconnectWebSocket
  } = useBookingsStore();
  
  // Check for filter query param (e.g., ?filter=urgent)
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'urgent') {
      setActiveTab('pending');
    }
  }, [searchParams]);
  
  // Fetch bookings on mount and tab change
  useEffect(() => {
    if (providerId) {
      fetchBookings(providerId, activeTab);
    }
  }, [providerId, activeTab, fetchBookings]);
  
  // Connect WebSocket for real-time updates
  useEffect(() => {
    if (providerId && !connected) {
      connectWebSocket(providerId);
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [providerId, connected, connectWebSocket, disconnectWebSocket]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings(providerId, activeTab);
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    // Clear filter param if switching away from pending
    if (tab !== 'pending') {
      searchParams.delete('filter');
      setSearchParams(searchParams);
    }
  };
  
  // Filter urgent bookings if needed
  const displayBookings = searchParams.get('filter') === 'urgent'
    ? bookings.filter(b => isBookingUrgent(b))
    : bookings;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert Banner */}
      <AlertBanner />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Appointments
            </h1>
            <p className="text-sm text-gray-600">
              Manage your booking requests and scheduled appointments
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'list' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'calendar' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                aria-label="Calendar view"
                aria-pressed={viewMode === 'calendar'}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              aria-label="Refresh appointments"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Export Button */}
            <button
              className="hidden sm:flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Export appointments"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Appointment tabs">
              <Tab
                active={activeTab === 'pending'}
                onClick={() => handleTabChange('pending')}
                label="Pending"
                count={pendingCount}
                urgent={urgentCount > 0}
              />
              <Tab
                active={activeTab === 'upcoming'}
                onClick={() => handleTabChange('upcoming')}
                label="Upcoming"
                count={upcomingCount}
              />
              <Tab
                active={activeTab === 'past'}
                onClick={() => handleTabChange('past')}
                label="Past"
              />
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {loading && bookings.length === 0 ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onRetry={handleRefresh} />
            ) : displayBookings.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div>
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    {activeTab === 'pending' && displayBookings.map((booking) => (
                      <PendingRequestCard key={booking._id} booking={booking} />
                    ))}
                    {activeTab === 'upcoming' && displayBookings.map((booking) => (
                      <UpcomingBookingCard key={booking._id} booking={booking} />
                    ))}
                    {activeTab === 'past' && displayBookings.map((booking) => (
                      <UpcomingBookingCard key={booking._id} booking={booking} past />
                    ))}
                  </div>
                ) : (
                  <CalendarView bookings={displayBookings} status={activeTab} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  urgent?: boolean;
}

function Tab({ active, onClick, label, count, urgent }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative py-4 px-1 border-b-2 font-medium text-sm transition-colors
        ${active 
          ? 'border-teal-500 text-teal-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
      role="tab"
      aria-selected={active}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`
            ml-2 px-2 py-0.5 rounded-full text-xs font-bold
            ${urgent 
              ? 'bg-red-100 text-red-600' 
              : active 
              ? 'bg-teal-100 text-teal-600' 
              : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      <p className="mt-4 text-sm text-gray-600">Loading appointments...</p>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-red-500 mb-4">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <p className="text-sm text-gray-900 font-medium mb-2">Failed to load appointments</p>
      <p className="text-sm text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState({ tab }: { tab: TabValue }) {
  const messages = {
    pending: {
      title: 'No pending requests',
      description: 'When patients book appointments, they\'ll appear here for you to confirm or decline.'
    },
    upcoming: {
      title: 'No upcoming appointments',
      description: 'Confirmed appointments will appear here.'
    },
    past: {
      title: 'No past appointments',
      description: 'Your completed appointments will appear here.'
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Calendar className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-sm text-gray-900 font-medium mb-2">{messages[tab].title}</p>
      <p className="text-sm text-gray-600 text-center max-w-md">{messages[tab].description}</p>
    </div>
  );
}

// Helper: Check if booking is urgent (< 6 hours until expiry)
function isBookingUrgent(booking: any): boolean {
  const expiresAt = new Date(booking.expiresAt);
  const now = new Date();
  const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilExpiry < 6 && hoursUntilExpiry > 0;
}
