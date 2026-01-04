import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, Phone, Mail, Globe, AlertCircle } from 'lucide-react';
import { ServiceSelector, ServiceList, ServiceEditor, Service } from '../components/services';
import { PROVIDER_TYPES } from '../constants/providerTypes';


const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const providerTypes = [
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'dental', label: 'Dental', icon: '🦷' },
  { id: 'cosmetic', label: 'Cosmetic', icon: '✨' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'massage', label: 'Massage', icon: '💆' },
  { id: 'mentalHealth', label: 'Mental Health', icon: '🧠' },
  { id: 'skincare', label: 'Skincare', icon: '🧴' },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const [practiceName, setPracticeName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [suite, setSuite] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [services, setServices] = useState<Service[]>(provider?.services || []);
  const [editingService, setEditingService] = useState<{ service: Service; index: number } | null>(null);


  useEffect(() => {
    // Check if verified
    const verified = sessionStorage.getItem('verified');
    if (!verified) {
      navigate('/onboarding');
      return;
    }

    // Load business data
    const businessData = sessionStorage.getItem('businessData');
    if (!businessData) {
      navigate('/onboarding');
      return;
    }

    try {
      const data = JSON.parse(businessData);
      setPracticeName(data.name || '');
      setEmail(data.email || '');
      
      // Parse address
      const addressParts = (data.address || '').split(',');
      if (addressParts.length >= 3) {
        setStreet(addressParts[0].trim());
        setCity(addressParts[1].trim());
        
        const stateZip = addressParts[2].trim().split(' ');
        if (stateZip.length >= 2) {
          setState(stateZip[0]);
          setZip(stateZip[1]);
        }
      }

      // Mock phone (in real app, would come from Google Places)
      setPhone('(406) 555-0123');
    } catch (error) {
      console.error('Error loading data:', error);
      navigate('/onboarding');
    }
  }, [navigate]);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
    if (errors.providerTypes) {
      setErrors({ ...errors, providerTypes: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!practiceName.trim()) newErrors.practiceName = 'Practice name is required';
    if (selectedTypes.length === 0) newErrors.providerTypes = 'Please select at least one type';
    if (!phone.trim()) newErrors.phone = 'Phone is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    if (!street.trim()) newErrors.street = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';
    if (!zip.trim()) newErrors.zip = 'ZIP code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to sessionStorage and navigate to manual wizard (starting at photos)
    const onboardingData = {
      practiceName,
      providerTypes: selectedTypes,
      phone,
      email,
      streetAddress: street,
      suite,
      city,
      state,
      zipCode: zip,
      website,
      autoFilled: true,
      verified: true
    };

    sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    
    // Navigate to wizard starting at photos (step 3)
    navigate('/onboarding/complete-profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <img 
              src="/findr-logo.svg" 
              alt="Findr Health" 
              className="h-40 w-auto"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Step 2 of 7: Confirm & Edit</span>
            <span className="text-sm font-medium text-teal-600">29%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: '29%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-8">
            <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-6">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 mb-1">Verified! ✓</p>
                <p className="text-sm text-green-800">
                  We've pre-filled your information. Please review and make any needed changes.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Information</h2>
            <p className="text-gray-600">
              Review the details we found and add any missing information.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Practice Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Practice or Business Name *
              </label>
              <input
                type="text"
                value={practiceName}
                onChange={(e) => setPracticeName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.practiceName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Smith Family Medicine"
              />
              {errors.practiceName && (
                <p className="mt-1 text-sm text-red-600">{errors.practiceName}</p>
              )}
            </div>

            {/* Provider Types */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What type of services do you provide? *{' '}
                <span className="text-gray-500 font-normal">(Select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {providerTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleType(type.id)}
                    className={`relative p-4 border-2 rounded-xl flex items-center gap-3 transition-all ${
                      selectedTypes.includes(type.id)
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{type.icon}</span>
                    <span className="font-medium text-gray-900">{type.label}</span>
                    {selectedTypes.includes(type.id) && (
                      <Check className="absolute top-2 right-2 w-5 h-5 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
              {errors.providerTypes && (
                <p className="mt-2 text-sm text-teal-600">{errors.providerTypes}</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(406) 555-0123"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="contact@practice.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Address</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Suite or Unit Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={suite}
                  onChange={(e) => setSuite(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Suite 201"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Bozeman"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select...</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.zip ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="59715"
                    maxLength={5}
                  />
                  {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip}</p>}
                </div>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Practice Website <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="https://yourpractice.com"
              />
            </div>

            {/* Info Box */}
            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-teal-900">
                  Next, you'll add photos and select your services. This should only take a few more minutes!
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/onboarding/verify')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
              >
                Continue to Photos →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
