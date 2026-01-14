import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ExternalLink, CheckCircle, AlertCircle, Loader2, DollarSign, Building, RefreshCw } from 'lucide-react';
import { useProviderData } from '../hooks/useProviderData';

const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

interface StripeStatus {
  connected: boolean;
  onboardingComplete: boolean;
  accountId: string | null;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  email?: string;
}

export default function Payments() {
  const navigate = useNavigate();
  const { provider } = useProviderData();
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (provider?._id) {
      fetchStatus();
    }
  }, [provider?._id]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/connect/status/${provider._id}`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch Stripe status:', err);
      setError('Failed to load payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError('');
      
      const res = await fetch(`${API_URL}/connect/onboarding-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          providerId: provider._id,
          returnUrl: `${window.location.origin}/payments?stripe=complete`,
          refreshUrl: `${window.location.origin}/payments?stripe=refresh`
        })
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to generate onboarding link');
      }
    } catch (err) {
      console.error('Connect error:', err);
      setError('Failed to connect with Stripe');
    } finally {
      setConnecting(false);
    }
  };

  const handleDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/connect/dashboard-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: provider._id })
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Dashboard link error:', err);
      setError('Failed to open Stripe dashboard');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Stripe account? You will stop receiving payouts.')) {
      return;
    }
    
    try {
      await fetch(`${API_URL}/connect/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: provider._id })
      });
      
      await fetchStatus();
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe') === 'complete') {
      fetchStatus();
      window.history.replaceState({}, '', '/payments');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-bold text-gray-900">Payment Settings</h1>
              <p className="text-sm text-gray-600">Manage how you receive payments</p>
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

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${status?.onboardingComplete ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CreditCard className={`w-6 h-6 ${status?.onboardingComplete ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Stripe Connect</h2>
                  <p className="text-sm text-gray-600">Receive payments from patient bookings</p>
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
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Bank Account</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Connect with Stripe to receive payments directly to your bank account when patients book your services.
                </p>
                
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                >
                  {connecting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  {connecting ? 'Connecting...' : 'Connect with Stripe'}
                </button>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Platform Fee Structure</h4>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">10% + $1.50 per booking (max $35)</span>
                  </div>
                </div>
              </div>
            ) : !status.onboardingComplete ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Setup</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Your Stripe account is created but setup is incomplete. Please finish the onboarding to receive payments.
                </p>
                
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
                >
                  {connecting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ExternalLink className="w-5 h-5" />
                  )}
                  {connecting ? 'Loading...' : 'Complete Setup'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Connected & Ready</p>
                    <p className="text-sm text-green-700">Your account is set up to receive payments</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Account ID</p>
                    <p className="font-mono text-sm text-gray-900">{status.accountId}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-sm text-gray-900">{status.email || 'Not available'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Charges</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      {status.chargesEnabled ? (
                        <><CheckCircle className="w-4 h-4 text-green-600" /> Enabled</>
                      ) : (
                        <><AlertCircle className="w-4 h-4 text-red-600" /> Disabled</>
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Payouts</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      {status.payoutsEnabled ? (
                        <><CheckCircle className="w-4 h-4 text-green-600" /> Enabled</>
                      ) : (
                        <><AlertCircle className="w-4 h-4 text-red-600" /> Disabled</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDashboard}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Stripe Dashboard
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Platform Fee Structure</h4>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">10% + $1.50 per booking (max $35)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">How Payments Work</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• When a patient books and pays, funds are held by Stripe</li>
            <li>• After the appointment, funds are transferred to your account</li>
            <li>• Payouts typically arrive within 2-3 business days</li>
            <li>• View all transactions in your Stripe Dashboard</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
