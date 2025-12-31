import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2 } from 'lucide-react';
import { searchBusiness } from '../../services/api';

export default function SearchBusiness() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim()) {
      setError('Please enter a business name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await searchBusiness(businessName, zipCode);

      if (!data.results || data.results.length === 0) {
        setError('No businesses found. Try entering information manually.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('searchResults', JSON.stringify(data.results));
      sessionStorage.setItem('autoSelected', JSON.stringify(data.autoSelected));

      if (data.autoSelected && data.results.length === 1) {
        sessionStorage.setItem('selectedPlace', JSON.stringify(data.results[0]));
        navigate('/onboarding/verify');
      } else {
        navigate('/onboarding/search-results');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Please try again.');
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    navigate('/onboarding/complete-profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <img 
              src="/findr-logo.svg"  
              alt="Findr Health" 
              className="h-16 w-auto"
            />
            <p className="text-gray-600 font-medium">Provider Onboarding</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Step 1 of 7: Find Business</span>
            <span className="text-sm font-medium text-teal-600">14%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all" style={{ width: '14%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Business</h2>
          <p className="text-gray-600 mb-8">
            Search for your business and we'll automatically fill in your information.
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-teal-500" />
                </div>
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="e.g., Smith Family Medicine"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Zip Code <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="zipCode"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="e.g., 59715"
                maxLength={5}
              />
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Search
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualEntry}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Skip and Enter Manually
              </button>
            </div>
          </form>

          <div className="mt-8 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg p-4">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div className="text-sm text-teal-900">
                <p className="font-semibold mb-1">Tip:</p>
                <p>Enter your exact business name as it appears on Google Maps for best results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
