// pages/BookingsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  User,
  ArrowLeft
} from 'lucide-react';
import { useAllBookings } from '../hooks/useBookings';

const STATUS_CONFIG = {
  pending_confirmation: { 
    label: 'Pending', 
    color: 'bg-amber-100 text-amber-700',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle 
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle 
  },
  cancelled_patient: { 
    label: 'Cancelled', 
    color: 'bg-gray-100 text-gray-600',
    icon: XCircle 
  },
  cancelled_provider: { 
    label: 'Cancelled', 
    color: 'bg-gray-100 text-gray-600',
    icon: XCircle 
  },
  expired: { 
    label: 'Expired', 
    color: 'bg-red-100 text-red-700',
    icon: AlertCircle 
  },
  reschedule_proposed: { 
    label: 'Reschedule Pending', 
    color: 'bg-purple-100 text-purple-700',
    icon: Calendar 
  },
  no_show: { 
    label: 'No Show', 
    color: 'bg-red-100 text-red-700',
    icon: XCircle 
  }
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { 
    label: status, 
    color: 'bg-gray-100 text-gray-600',
    icon: AlertCircle 
  };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export default function BookingsPage({ providerId }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { bookings, loading, pagination, setParams, refetch } = useAllBookings(providerId, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 20
  });

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setParams(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      skip: 0
    }));
  };

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const patientName = `${b.patient?.firstName || ''} ${b.patient?.lastName || ''}`.toLowerCase();
    const serviceName = (b.service?.name || '').toLowerCase();
    const bookingNumber = (b.bookingNumber || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return patientName.includes(query) || serviceName.includes(query) || bookingNumber.includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
                <p className="text-sm text-gray-500">
                  {pagination.total} total bookings
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient, service, or booking number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-300"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending_confirmation">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled_patient">Cancelled by Patient</option>
              <option value="cancelled_provider">Cancelled by Provider</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search or filters' : 'Bookings will appear here'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Patient</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Service</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Date & Time</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => {
                  const dateTime = new Date(booking.dateTime?.confirmedStart || booking.dateTime?.requestedStart);
                  const patientName = booking.patient 
                    ? `${booking.patient.firstName || ''} ${booking.patient.lastName || ''}`.trim() || 'Patient'
                    : 'Unknown';

                  return (
                    <tr 
                      key={booking._id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patientName}</p>
                            <p className="text-xs text-gray-500">{booking.bookingNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{booking.service?.name || 'Service'}</p>
                        <p className="text-xs text-gray-500">{booking.service?.duration || 30} min</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          ${((booking.service?.price || 0) / 100).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/bookings/${booking._id}`)}
                          className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setParams(prev => ({ ...prev, skip: Math.max(0, prev.skip - pagination.limit) }))}
                disabled={pagination.skip === 0}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setParams(prev => ({ ...prev, skip: prev.skip + pagination.limit }))}
                disabled={pagination.skip + pagination.limit >= pagination.total}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}