import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

interface CalendarStatus {
  connected: boolean;
  provider: 'google' | 'microsoft' | null;
  email: string | null;
  calendarId: string | null;
  syncDirection: string | null;
  connectedAt: string | null;
  tokenExpiry: string | null;
  tokenValid: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}

export default function Calendar() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<'google' | 'microsoft' | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const providerId = localStorage.getItem('providerId');
  
  useEffect(() => {
    if (!providerId) { navigate('/login'); return; }
    fetchStatus();
    
    const params = new URLSearchParams(window.location.search);
    const calendarResult = params.get('calendar');
    const calendarProvider = params.get('provider');
    
    if (calendarResult === 'success') {
      setSuccess('Calendar connected successfully' + (calendarProvider ? ' via ' + calendarProvider : '') + '!');
      window.history.replaceState({}, '', '/calendar');
      setTimeout(fetchStatus, 500);
    } else if (calendarResult === 'error') {
      setError(params.get('reason') || 'Failed to connect calendar');
      window.history.replaceState({}, '', '/calendar');
    }
  }, [providerId, navigate]);
  
  const fetchStatus = async () => {
    if (!providerId) return;
    try {
      setLoading(true);
      const response = await fetch(API_URL + '/calendar/status/' + providerId);
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch calendar status:', err);
      setError('Failed to load calendar status');
    } finally {
      setLoading(false);
    }
  };
  
  const connectGoogle = async () => {
    if (!providerId) return;
    try {
      setConnecting('google');
      setError(null);
      const response = await fetch(API_URL + '/calendar/google/auth/' + providerId);
      const data = await response.json();
      if (data.authUrl) { window.location.href = data.authUrl; }
      else { throw new Error('No auth URL returned'); }
    } catch (err: any) {
      setError(err.message || 'Failed to connect Google Calendar');
      setConnecting(null);
    }
  };
  
  const connectMicrosoft = async () => {
    if (!providerId) return;
    try {
      setConnecting('microsoft');
      setError(null);
      const response = await fetch(API_URL + '/calendar/microsoft/auth/' + providerId);
      const data = await response.json();
      if (data.error) { throw new Error(data.error); }
      if (data.authUrl) { window.location.href = data.authUrl; }
      else { throw new Error('No auth URL returned'); }
    } catch (err: any) {
      setError(err.message || 'Failed to connect Microsoft Calendar');
      setConnecting(null);
    }
  };
  
  const disconnect = async () => {
    if (!providerId || !window.confirm('Are you sure you want to disconnect your calendar?')) return;
    try {
      setDisconnecting(true);
      setError(null);
      const response = await fetch(API_URL + '/calendar/disconnect/' + providerId, { method: 'POST' });
      if (!response.ok) { throw new Error('Failed to disconnect'); }
      setSuccess('Calendar disconnected successfully');
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect calendar');
    } finally {
      setDisconnecting(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900">← Back</button>
              <h1 className="text-xl font-semibold text-gray-900">Calendar Settings</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <span className="text-green-600">✓</span> {success}
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">×</button>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <span className="text-red-600">⚠</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendar Connection</h2>
          
          {status?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-2xl">{status.provider === 'google' ? '📅' : status.provider === 'microsoft' ? '📧' : '📆'}</span>
                <div className="flex-1">
                  <p className="font-medium text-green-800">
                    {status.provider === 'google' ? 'Google Calendar' : status.provider === 'microsoft' ? 'Microsoft Outlook' : 'Calendar'} Connected
                  </p>
                  <p className="text-sm text-green-600">{status.email}</p>
                </div>
                <span className={'px-3 py-1 rounded-full text-sm font-medium ' + (status.provider === 'google' ? 'bg-blue-100 text-blue-800' : status.provider === 'microsoft' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800')}>
                  {status.provider === 'google' ? 'Google' : status.provider === 'microsoft' ? 'Microsoft' : status.provider}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="text-gray-500 text-xs uppercase tracking-wide">Connected At</label>
                  <p className="text-gray-900 font-medium">{formatDate(status.connectedAt)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="text-gray-500 text-xs uppercase tracking-wide">Sync Direction</label>
                  <p className="text-gray-900 font-medium">{status.syncDirection || 'two-way'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="text-gray-500 text-xs uppercase tracking-wide">Last Sync</label>
                  <p className="text-gray-900 font-medium">{formatDate(status.lastSyncAt)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="text-gray-500 text-xs uppercase tracking-wide">Token Status</label>
                  <p className={'font-medium ' + (status.tokenValid ? 'text-green-600' : 'text-red-600')}>
                    {status.tokenValid ? '✓ Valid' : '⚠ Expired - Reconnect required'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <button onClick={disconnect} disabled={disconnecting} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50">
                  {disconnecting ? 'Disconnecting...' : 'Disconnect Calendar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">Connect your calendar to automatically sync your availability and receive booking notifications.</p>
              
              <button onClick={connectGoogle} disabled={connecting !== null} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700">{connecting === 'google' ? 'Connecting...' : 'Connect Google Calendar'}</span>
              </button>
              
              <button onClick={connectMicrosoft} disabled={connecting !== null} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <svg className="w-6 h-6" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span className="font-medium text-gray-700">{connecting === 'microsoft' ? 'Connecting...' : 'Connect Microsoft Outlook'}</span>
              </button>
              
              <p className="text-sm text-gray-500 text-center mt-4">Your calendar data is encrypted and never shared with other users.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How Calendar Sync Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900">Real-time Availability</p>
                <p className="text-sm text-gray-600">Your calendar events block time slots automatically</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900">Automatic Event Creation</p>
                <p className="text-sm text-gray-600">Bookings appear on your calendar instantly</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900">No Double Bookings</p>
                <p className="text-sm text-gray-600">Patients only see times you're actually free</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
