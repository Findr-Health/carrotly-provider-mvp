import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, ExternalLink, CheckCircle, AlertCircle, Loader2, RefreshCw, Unlink } from 'lucide-react';
import { useProviderData } from '../hooks/useProviderData';

const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

interface CalendarStatus {
  connected: boolean;
  provider: string | null;
  email: string | null;
  calendarId: string | null;
  syncDirection: string | null;
}

export default function CalendarSettings() {
  const navigate = useNavigate();
  const { provider } = useProviderData();
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (provider && provider._id) {
      fetchStatus();
    }
  }, [provider?._id]);

  // Check URL params for return from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const calendarStatus = params.get('calendar');
    
    if (calendarStatus === 'success') {
      fetchStatus();
      window.history.replaceState({}, '', '/calendar');
    } else if (calendarStatus === 'error') {
      setError(params.get('reason') || 'Failed to connect calendar');
      window.history.replaceState({}, '', '/calendar');
    }
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/calendar/status/${provider._id}`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch calendar status:', err);
      setError('Failed to load calendar status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setConnecting(true);
      setError('');
      
      const res = await fetch(`${API_URL}/calendar/google/auth/${provider._id}`);
      const data = await res.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError('Failed to generate authorization link');
      }
    } catch (err) {
      console.error('Connect error:', err);
      setError('Failed to connect with Google');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your calendar? Your availability will revert to manual settings.')) {
      return;
    }
    
    try {
      await fetch(`${API_URL}/calendar/disconnect/${provider._id}`, {
        method: 'POST'
      });
      await fetchStatus();
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Calendar Integration</h1>
              <p className="text-sm text-gray-600">Sync your calendar for real-time availability</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${status?.connected ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CalendarIcon className={`w-6 h-6 ${status?.connected ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Calendar Sync</h2>
                  <p className="text-sm text-gray-600">Automatically show your real availability</p>
                </div>
              </div>
              <button 
                onClick={fetchStatus}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh status"
              >
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {!status?.connected ? (
              /* Not Connected State */
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Calendar</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Sync your calendar so patients see your real-time availability. No more double bookings!
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleConnectGoogle}
                    disabled={connecting}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-lg font-semibold hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {connecting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    {connecting ? 'Connecting...' : 'Connect Google Calendar'}
                  </button>
                  
                  <p className="text-sm text-gray-500">
                    Microsoft Outlook coming soon
                  </p>
                </div>
              </div>
            ) : (
              /* Connected State */
              <div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Calendar Connected</p>
                    <p className="text-sm text-green-700">Your availability is syncing automatically</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Provider</p>
                    <p className="font-medium text-gray-900 capitalize flex items-center gap-2">
                      {status.provider === 'google' && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      {status.provider} Calendar
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Account</p>
                    <p className="font-medium text-gray-900">{status.email || 'Connected'}</p>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
                >
                  <Unlink className="w-4 h-4" />
                  Disconnect Calendar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">How Calendar Sync Works</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>We only see <strong>when</strong> you're busy, not appointment details (HIPAA-friendly)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Patients see real-time availability based on your calendar</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>New bookings are automatically added to your calendar</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Works alongside your existing scheduling system</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
