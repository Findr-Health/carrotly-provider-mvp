import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FindrLogo from '../components/branding/FindrLogo';
import { Eye, EyeOff } from 'lucide-react';

export default function ProviderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Legacy code flow for providers without passwords
  const [useLegacyLogin, setUseLegacyLogin] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [providerId, setProviderId] = useState('');

  const API_URL = 'https://fearless-achievement-production.up.railway.app/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL + '/providers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if provider needs legacy login (no password set)
        if (data.legacyLogin) {
          setProviderId(data.providerId);
          setUseLegacyLogin(true);
          setError('');
          return;
        }
        throw new Error(data.error || 'Login failed');
      }

      // Store auth data
      localStorage.setItem('providerToken', data.token);
      localStorage.setItem('providerId', data.providerId);
      if (data.provider) {
        localStorage.setItem('providerData', JSON.stringify(data.provider));
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL + '/providers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      setProviderId(data.providerId);
      setCodeSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL + '/providers/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      localStorage.setItem('providerToken', data.token);
      localStorage.setItem('providerId', data.providerId);
      if (data.provider) {
        localStorage.setItem('providerData', JSON.stringify(data.provider));
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL + '/providers');
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const providers = await response.json();
      
      if (providers && providers.length > 0) {
        const provider = providers[0];
        localStorage.setItem('providerId', provider._id);
        const essentialData = {
          _id: provider._id,
          practiceName: provider.practiceName,
          providerTypes: provider.providerTypes,
          contactInfo: provider.contactInfo,
          address: provider.address
        };
        localStorage.setItem('providerData', JSON.stringify(essentialData));
        navigate('/dashboard');
      } else {
        setError('No providers found. Please complete onboarding first.');
      }
    } catch (err: any) {
      console.error('Demo login error:', err);
      setError('Failed to load provider data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Legacy code verification UI
  if (useLegacyLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <FindrLogo size="md" showText={true} />
            <p className="text-gray-600 mt-2">Provider Portal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {codeSent ? 'Enter Verification Code' : 'Verify Your Account'}
            </h2>
            <p className="text-gray-600 mb-6">
              {codeSent 
                ? 'We sent a code to ' + email
                : 'Your account uses verification codes. We\'ll send one to your email.'
              }
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {!codeSent ? (
              <div className="space-y-4">
                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
                <button
                  onClick={() => { setUseLegacyLogin(false); setError(''); }}
                  className="w-full text-gray-600 py-2 hover:text-gray-900"
                >
                  Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setCodeSent(false); setCode(''); setError(''); }}
                  className="w-full text-gray-600 py-2 hover:text-gray-900"
                >
                  Resend code
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main login UI with password
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <FindrLogo size="md" showText={true} />
          <p className="text-gray-600 mt-2">Provider Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Sign in to manage your practice</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Demo: Quick access (testing only)'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              New provider?{' '}
              <button
                onClick={() => navigate('/onboarding')}
                className="text-teal-600 font-semibold hover:text-teal-700"
              >
                Register your practice
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
