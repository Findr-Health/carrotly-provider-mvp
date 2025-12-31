import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface StepBasicsProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  isFirstStep: boolean;
}

const providerTypes = [
  { id: 'Medical', label: 'Medical', icon: '🏥' },
  { id: 'Urgent Care', label: 'Urgent Care', icon: '🚑' },
  { id: 'Dental', label: 'Dental', icon: '🦷' },
  { id: 'Mental Health', label: 'Mental Health', icon: '🧠' },
  { id: 'Skincare/Aesthetics', label: 'Skincare/Aesthetics', icon: '✨' },
  { id: 'Massage/Bodywork', label: 'Massage/Bodywork', icon: '💆' },
  { id: 'Fitness/Training', label: 'Fitness/Training', icon: '💪' },
  { id: 'Yoga/Pilates', label: 'Yoga/Pilates', icon: '🧘' },
  { id: 'Nutrition/Wellness', label: 'Nutrition/Wellness', icon: '🥗' },
  { id: 'Pharmacy/RX', label: 'Pharmacy/RX', icon: '💊' },
];

export const StepBasics: React.FC<StepBasicsProps> = ({ data, onNext, onBack, isFirstStep }) => {
  const [practiceName, setPracticeName] = useState(data.practiceName || '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(data.providerTypes || []);
  const [phone, setPhone] = useState(data.phone || '');
  const [email, setEmail] = useState(data.email || '');
  const [errors, setErrors] = useState<any>({});

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext({
      practiceName,
      providerTypes: selectedTypes,
      phone,
      email,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 1 of 7: The Basics</h2>
        <p className="text-gray-600">Let's start with some basic information. Takes about 2 minutes.</p>
      </div>

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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          What type of services do you provide? *{' '}
          <span className="text-gray-500 font-normal">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {providerTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleType(type.id)}
              className={`relative p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                selectedTypes.includes(type.id)
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 bg-white'
              }`}
            >
              <span className="text-3xl">{type.icon}</span>
              <span className="font-medium text-gray-900 text-sm text-center">{type.label}</span>
              {selectedTypes.includes(type.id) && (
                <Check className="absolute top-2 right-2 w-5 h-5 text-teal-600" />
              )}
            </button>
          ))}
        </div>
        {errors.providerTypes && (
          <p className="mt-2 text-sm text-red-600">{errors.providerTypes}</p>
        )}
      </div>

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
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
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
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Check className="w-4 h-4 text-teal-600" />
        <span>Required fields only • Optional details in Step 5</span>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
        >
          Continue to Location →
        </button>
      </div>
    </form>
  );
};

export default StepBasics;
