import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Upload, X, Camera, Search, Pencil, AlertCircle, FileText, Users, Plus } from 'lucide-react';
import FindrLogo from '../../components/branding/FindrLogo';
import { submitProviderProfile } from '../../services/api';
// New imports for service components
import { ServiceSelector, ServiceList, Service } from '../../components/services';
import { PROVIDER_TYPES, normalizeProviderTypes } from '../../constants/providerTypes';


const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

interface TeamMember {
  id: string;
  photo: string;
  name: string;
  title: string;
  bio: string;
  serviceIds?: string[];
}
interface TeamMember {
  id: string;
  photo: string;
  name: string;
  title: string;
  bio: string;
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

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

  const [description, setDescription] = useState('');
  const [businessHours, setBusinessHours] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  });

  const [photos, setPhotos] = useState<string[]>([]);

  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [showAddCustomService, setShowAddCustomService] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceDuration, setCustomServiceDuration] = useState('');
  const [customServiceDescription, setCustomServiceDescription] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [customServices, setCustomServices] = useState<Service[]>([]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [education, setEducation] = useState('');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberPhoto, setNewMemberPhoto] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberTitle, setNewMemberTitle] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');
  const [newMemberServiceIds, setNewMemberServiceIds] = useState<string[]>([]);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberTitle, setEditMemberTitle] = useState('');
  const [editMemberBio, setEditMemberBio] = useState('');
  const [editMemberPhoto, setEditMemberPhoto] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState<'standard' | 'moderate'>('standard');
  const [allowFeeWaiver, setAllowFeeWaiver] = useState(true);

  const [signature, setSignature] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem('verified');
    const businessData = sessionStorage.getItem('businessData');
    
    if (verified && businessData) {
      setIsVerified(true);
      try {
        const data = JSON.parse(businessData);
        setPracticeName(data.name || '');
        setEmail(data.email || '');
        
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
        setPhone('(406) 555-0123');
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, []);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const filesToProcess = Array.from(files).slice(0, 5 - photos.length);
    
    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 5MB)`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos(prev => {
            if (prev.length >= 5) return prev;
            return [...prev, e.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleTeamPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be under 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setNewMemberPhoto(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const addTeamMember = () => {
    if (!newMemberName.trim() || !newMemberTitle.trim()) {
      alert('Name and title are required');
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      photo: newMemberPhoto,
      name: newMemberName,
      title: newMemberTitle,
      serviceIds: newMemberServiceIds,
      bio: newMemberBio,
    };

    setTeamMembers(prev => [...prev, newMember]);
    setAddingMember(false);
    setNewMemberPhoto('');
    setNewMemberName('');
    setNewMemberTitle('');
    setNewMemberBio('');
    setNewMemberServiceIds([]);
  };

  const removeTeamMember = (id: string) => {
      setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const startEditMember = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setEditMemberName(member.name);
    setEditMemberTitle(member.title);
    setEditMemberBio(member.bio);
    setEditMemberPhoto(member.photo);
  };

  const saveEditMember = () => {
    if (!editingMemberId || !editMemberName.trim()) return;
    setTeamMembers(prev => prev.map(m =>
      m.id === editingMemberId
        ? { ...m, name: editMemberName, title: editMemberTitle, bio: editMemberBio, photo: editMemberPhoto }
        : m
    ));
    setEditingMemberId(null);
    setEditMemberName('');
    setEditMemberTitle('');
    setEditMemberBio('');
    setEditMemberPhoto('');
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setEditMemberName('');
    setEditMemberTitle('');
    setEditMemberBio('');
    setEditMemberPhoto('');
  };

  const cancelAddMember = () => {
    setAddingMember(false);
    setNewMemberPhoto('');
    setNewMemberName('');
    setNewMemberTitle('');
    setNewMemberBio('');
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmitWithoutSignature = async () => {
    // Validate everything except signature/agreement
    const newErrors: any = {};
    
    if (!practiceName.trim()) newErrors.practiceName = 'Required';
    if (selectedTypes.length === 0) newErrors.providerTypes = 'Select at least one';
    if (!phone.trim()) newErrors.phone = 'Required';
    if (!email.trim()) newErrors.email = 'Required';
    if (!street.trim()) newErrors.street = 'Required';
    if (!city.trim()) newErrors.city = 'Required';
    if (!state) newErrors.state = 'Required';
    if (!zip.trim()) newErrors.zip = 'Required';
    if (photos.length === 0) newErrors.photos = 'Upload at least 1 photo';
    if (services.length < 1) newErrors.services = 'Add at least one service';
    if (!password.trim()) newErrors.password = 'Password required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Scroll to first error field
      const errorFieldMap: Record<string, string> = {
        practiceName: 'practiceName',
        providerTypes: 'providerTypes',
        phone: 'phone',
        email: 'email',
        street: 'street',
        city: 'city',
        state: 'state',
        zip: 'zip',
        photos: 'photos',
        password: 'password-input',
        confirmPassword: 'confirm-password-input'
      };
      
      const firstErrorKey = Object.keys(newErrors)[0];
      const elementId = errorFieldMap[firstErrorKey];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    // Confirm with user
    const confirmed = window.confirm(
      'Save your profile without signing the agreement?\n\n' +
      'You can sign the agreement later from your Provider Dashboard, but your profile won\'t be reviewed until you sign.'
    );
    
    if (!confirmed) return;

    setLoading(true);

    try {
      const businessDataStr = sessionStorage.getItem('businessData');
      const businessData = businessDataStr ? JSON.parse(businessDataStr) : {};

      const servicesData = services.map(service => ({
  name: service.name,
  description: service.description,
  shortDescription: service.shortDescription,
  category: service.category,
  duration: service.duration,
  basePrice: service.basePrice,
  price: service.basePrice, // Legacy field support
  hasVariants: service.hasVariants,
  variants: service.variants,
  isActive: service.isActive
}));

      const profileData = {
        placeId: businessData.placeId,
        practiceName,
        description,
        providerTypes: selectedTypes,
        phone,
        email,
        address: { street, suite, city, state, zip },
        website,
        calendar: { businessHours },
        photos,
        services: servicesData,
        optionalInfo: {
          licenseNumber,
          licenseState,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
          education
        },
        teamMembers,
        cancellationPolicy: {
          tier: cancellationPolicy,
          allowFeeWaiver: allowFeeWaiver
        },
        password,
        // No agreement data - will be signed later
        agreement: null
      };

      const result = await submitProviderProfile(profileData);

      if (result.providerId) {
        localStorage.setItem('providerId', result.providerId);
        sessionStorage.setItem('submittedProvider', JSON.stringify({ 
          _id: result.providerId, 
          practiceName, 
          providerTypes: selectedTypes, 
          contactInfo: { email, phone }, 
          address: { street, suite, city, state, zip },
          needsSignature: true
        }));
        sessionStorage.setItem('providerId', result.providerId);
      }

      sessionStorage.removeItem('businessData');
      sessionStorage.removeItem('selectedPlace');
      localStorage.removeItem('onboardingData');

      // Navigate to completion page with sign-later flag
      navigate('/complete?signLater=true');

    } catch (error: any) {
      console.error('Submission error:', error);
      alert('Failed to submit: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
  
  if (!practiceName.trim()) newErrors.practiceName = 'Required';
  if (selectedTypes.length === 0) newErrors.providerTypes = 'Select at least one';
  if (!phone.trim()) newErrors.phone = 'Required';
  if (!email.trim()) newErrors.email = 'Required';
  if (!street.trim()) newErrors.street = 'Required';
  if (!city.trim()) newErrors.city = 'Required';
  if (!state) newErrors.state = 'Required';
  if (!zip.trim()) newErrors.zip = 'Required';
  if (services.length < 1) newErrors.services = 'Add at least one service';
  if (photos.length === 0) newErrors.photos = 'Upload at least 1 photo';
  if (!signature.trim()) newErrors.signature = 'Signature required';
  if (!agreedToTerms) newErrors.terms = 'Must agree to terms';
  if (!password.trim()) newErrors.password = 'Password required';
  else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
  if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    
    // Scroll to first error field
    const errorFieldMap: Record<string, string> = {
      practiceName: 'practiceName',
      providerTypes: 'providerTypes',
      phone: 'phone',
      email: 'email',
      street: 'street',
      city: 'city',
      state: 'state',
      zip: 'zip',
      photos: 'photos',
      password: 'password-input',
      confirmPassword: 'confirm-password-input',
      signature: 'signature-input',
      terms: 'signature-input'
    };
    
    const firstErrorKey = Object.keys(newErrors)[0];
    const elementId = errorFieldMap[firstErrorKey];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
    return;
  }

  setLoading(true);

  try {
    const businessDataStr = sessionStorage.getItem('businessData');
    const businessData = businessDataStr ? JSON.parse(businessDataStr) : {};

    const servicesData = services.map(service => ({
  name: service.name,
  description: service.description,
  shortDescription: service.shortDescription,
  category: service.category,
  duration: service.duration,
  basePrice: service.basePrice,
  price: service.basePrice, // Legacy field support
  hasVariants: service.hasVariants,
  variants: service.variants,
  isActive: service.isActive
}));

    const profileData = {
      placeId: businessData.placeId,
      practiceName,
      description,  // ADD THIS
      providerTypes: selectedTypes,
      phone,
      email,
      address: { street, suite, city, state, zip },
      website,
      calendar: {  // ADD THIS
        businessHours
      },
      photos,
      services: servicesData,
      optionalInfo: {
        licenseNumber,
        licenseState,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
        education
      },
      teamMembers,
      cancellationPolicy: {
        tier: cancellationPolicy,
        allowFeeWaiver: allowFeeWaiver
      },
      password,
      agreement: {
        signature,
        title: '',
        agreedDate: new Date().toISOString(),
        version: '2025'
      }
    };

    const result = await submitProviderProfile(profileData);

    if (result.providerId) {
      localStorage.setItem('providerId', result.providerId);
      sessionStorage.setItem('submittedProvider', JSON.stringify({ _id: result.providerId, practiceName, providerTypes: selectedTypes, contactInfo: { email, phone }, address: { street, suite, city, state, zip } }));
      sessionStorage.setItem('providerId', result.providerId);
    }

    sessionStorage.removeItem('businessData');
    sessionStorage.removeItem('selectedPlace');
    localStorage.removeItem('onboardingData');

    navigate('/complete');

  } catch (error: any) {
    console.error('Submission error:', error);
    alert('Failed to submit: ' + (error.message || 'Unknown error'));
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <FindrLogo size="md" showText={true} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isVerified && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Verified! ✓</p>
                <p className="text-sm text-green-800">We've pre-filled your information. Review and complete the remaining sections.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Fill out all sections below. Fields marked with * are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
          {/* SECTION 1: THE BASICS */}
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. The Basics</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Practice or Business Name *
                  </label>
                  <input
                    id="practiceName"
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                      errors.practiceName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Smith Family Medicine"
                  />
                  {errors.practiceName && <p className="mt-1 text-sm text-red-600">{errors.practiceName}</p>}
                </div>

                {/* Provider Types */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-3">
    What type of services do you provide? *
  </label>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
    {PROVIDER_TYPES.map(type => {
      const isSelected = selectedTypes.includes(type.id);
      return (
        <button
          key={type.id}
          type="button"
          onClick={() => {
            setSelectedTypes(prev =>
              prev.includes(type.id)
                ? prev.filter(t => t !== type.id)
                : [...prev, type.id]
            );
          }}
          className={`relative p-4 rounded-xl border-2 text-center transition-all ${
  isSelected
    ? 'border-teal-500 bg-teal-50'
    : 'border-gray-200 hover:border-gray-300'
}`}
        >
          <span className="text-3xl block mb-2">{type.icon}</span>
          <span className="text-sm font-medium">{type.label}</span>
          {isSelected && (
            <span className="absolute top-2 right-2 text-teal-500">✓</span>
          )}
        </button>
      );
    })}
  </div>
</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(406) 555-0123"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="contact@practice.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Your Practice
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell patients about your practice, specialties, and approach to care..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">This appears on your public profile.</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: LOCATION */}
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Location</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                  <input
                    id="street"
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Suite/Unit <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={suite}
                    onChange={(e) => setSuite(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Suite 201"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Bozeman"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select...</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP *</label>
                    <input
                      id="zip"
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        errors.zip ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="59715"
                      maxLength={5}
                    />
                    {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="https://yourpractice.com"
                  />
                </div>
                {/* Business Hours */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Business Hours
                </label>
                <div className="space-y-3">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <label className="flex items-center gap-2 w-28">
                        <input
                          type="checkbox"
                          checked={businessHours[day].enabled}
                          onChange={(e) => setBusinessHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], enabled: e.target.checked }
                          }))}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                      </label>
                      
                      {businessHours[day].enabled ? (
                        <div className="flex items-center gap-2 flex-1">
                          <select
                            value={businessHours[day].start}
                            onChange={(e) => setBusinessHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day], start: e.target.value }
                            }))}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                          >
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <React.Fragment key={hour}>
                                  <option value={`${hour}:00`}>{i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}</option>
                                  <option value={`${hour}:30`}>{i === 0 ? '12:30 AM' : i < 12 ? `${i}:30 AM` : i === 12 ? '12:30 PM' : `${i - 12}:30 PM`}</option>
                                </React.Fragment>
                              );
                            })}
                          </select>
                          <span className="text-gray-500 text-sm">to</span>
                          <select
                            value={businessHours[day].end}
                            onChange={(e) => setBusinessHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day], end: e.target.value }
                            }))}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                          >
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <React.Fragment key={hour}>
                                  <option value={`${hour}:00`}>{i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}</option>
                                  <option value={`${hour}:30`}>{i === 0 ? '12:30 AM' : i < 12 ? `${i}:30 AM` : i === 12 ? '12:30 PM' : `${i - 12}:30 PM`}</option>
                                </React.Fragment>
                              );
                            })}
                          </select>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Closed</span>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            </div>
          
            {/* SECTION 3: PHOTOS */}
            <div id="photos" className="pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Photos *</h2>
              
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 transition"
                  onClick={() => document.getElementById('photoInput')?.click()}
                >
                  <input
                    id="photoInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={photos.length >= 5}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Click to upload photos</p>
                  <p className="text-sm text-gray-500">{photos.length}/5 photos • Max 5MB each</p>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-teal-500 text-white text-xs px-2 py-0.5 rounded">
                            Primary
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.photos && <p className="text-sm text-red-600">{errors.photos}</p>}
              </div>
            </div>

            {/* SECTION 4: SERVICES */}
<div className="pb-8 border-b border-gray-200">
  <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Services</h2>
  <p className="text-gray-600 mb-6">
    Select services you offer and customize pricing. Add from templates or create custom services.
  </p>
  
  <ServiceSelector
    providerTypes={selectedTypes}
    selectedServices={services}
    onServicesChange={setServices}
    mode="onboarding"
  />
  
  {services.length === 0 && (
    <p className="text-sm text-red-600 mt-2">Add at least one service to continue</p>
  )}
</div>

            {/* SECTION 5: OPTIONAL WITH TEAM */}
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">5. Optional Details</h2>
              <p className="text-gray-600 mb-6">Add credentials and team member profiles to build trust (all optional)</p>
              
              <div className="space-y-8">
                {/* Credentials */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Credentials</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                        <input
                          type="text"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          placeholder="MT12345"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">License State</label>
                        <select
                          value={licenseState}
                          onChange={(e) => setLicenseState(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select...</option>
                          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Years Experience</label>
                        <input
                          type="number"
                          value={yearsExperience}
                          onChange={(e) => setYearsExperience(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          placeholder="10"
                          min="0"
                          max="99"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Education & Training</label>
                      <textarea
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        rows={3}
                        placeholder="MD from Johns Hopkins University..."
                      />
                    </div>
                  </div>
                </div>

                {/* TEAM MEMBERS */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-teal-600" />
                        Team Members
                      </h3>
                      <p className="text-sm text-gray-600">Add photos and bios of your team to build patient trust</p>
                    </div>
                    {!addingMember && (
                      <button
                        type="button"
                        onClick={() => setAddingMember(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Member
                      </button>
                    )}
                  </div>

                  {/* Existing Members */}
                  {teamMembers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {teamMembers.map((member) => (
                    <div key={member.id} className="border-2 border-gray-200 rounded-lg p-4 relative">
                      {editingMemberId === member.id ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="w-20 h-20 flex-shrink-0">
                              {editMemberPhoto ? (
                                <img src={editMemberPhoto} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Users className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={editMemberName}
                                onChange={(e) => setEditMemberName(e.target.value)}
                                placeholder="Name *"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                value={editMemberTitle}
                                onChange={(e) => setEditMemberTitle(e.target.value)}
                                placeholder="Title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                          <textarea
                            value={editMemberBio}
                            onChange={(e) => setEditMemberBio(e.target.value)}
                            placeholder="Bio (optional)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={saveEditMember} className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">Save</button>
                            <button type="button" onClick={cancelEditMember} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">Cancel</button>
                            <button type="button" onClick={() => removeTeamMember(member.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">Delete</button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEditMember(member)}
                              className="p-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTeamMember(member.id)}
                              className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex gap-4">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={member.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              <p className="text-sm text-teal-600">{member.title}</p>
                              {member.bio && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{member.bio}</p>
                              )}
                              {/* Show linked services */}
                              <div className="mt-2">
                                {!member.serviceIds || member.serviceIds.length === 0 ? (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Can perform all services</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {member.serviceIds.slice(0, 3).map((serviceId: string) => {
                                      const service = services.find((s: any) => (s.id || s._id) === serviceId);
                                      return service ? (
                                        <span key={serviceId} className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{service.name}</span>
                                      ) : null;
                                    })}
                                    {member.serviceIds.length > 3 && (
                                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{member.serviceIds.length - 3} more</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                    </div>
                  )}

                  {/* Add Form */}
                  {addingMember && (
                    <div className="border-2 border-teal-300 bg-teal-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Add Team Member</h4>
                      
                      <div className="space-y-4">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition border-2 border-dashed border-gray-400 overflow-hidden"
                            onClick={() => document.getElementById('teamPhotoInput')?.click()}
                          >
                            {newMemberPhoto ? (
                              <img src={newMemberPhoto} alt="Team member" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Click to upload</p>
                              </div>
                            )}
                          </div>
                          <input
                            id="teamPhotoInput"
                            type="file"
                            accept="image/*"
                            onChange={handleTeamPhotoUpload}
                            className="hidden"
                          />
                          <p className="text-xs text-gray-500 mt-2">Max 2MB</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                            <input
                              type="text"
                              value={newMemberName}
                              onChange={(e) => setNewMemberName(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Dr. Jane Smith"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Title/Role *</label>
                            <input
                              type="text"
                              value={newMemberTitle}
                              onChange={(e) => setNewMemberTitle(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Nurse Practitioner"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio (Optional)</label>
                          <textarea
                            value={newMemberBio}
                            onChange={(e) => setNewMemberBio(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            rows={3}
                            placeholder="Brief professional background..."
                            maxLength={300}
                          />
                          <p className="text-xs text-gray-500 mt-1">{newMemberBio.length}/300</p>

                        {/* Service Assignment */}
                        {services.length > 0 && (
                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Services this team member can perform:
                            </label>
                            <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                              <label className="flex items-center gap-2 mb-2 pb-2 border-b">
                                <input
                                  type="checkbox"
                                  checked={newMemberServiceIds.length === 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewMemberServiceIds([]);
                                    }
                                  }}
                                  className="h-4 w-4 text-teal-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-900">All Services</span>
                                <span className="text-xs text-gray-500">(can perform any service)</span>
                              </label>
                              {services.map((service: any) => {
                                const serviceId = service.id || service._id;
                                return (
                                  <label key={serviceId} className="flex items-center gap-2 py-1">
                                    <input
                                      type="checkbox"
                                      checked={newMemberServiceIds.includes(serviceId)}
                                      disabled={newMemberServiceIds.length === 0}
                                      onChange={(e) => {
                                        if (newMemberServiceIds.length === 0) {
                                          setNewMemberServiceIds([serviceId]);
                                        } else if (e.target.checked) {
                                          setNewMemberServiceIds([...newMemberServiceIds, serviceId]);
                                        } else {
                                          setNewMemberServiceIds(newMemberServiceIds.filter((id: string) => id !== serviceId));
                                        }
                                      }}
                                      className="h-4 w-4 text-teal-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">{service.name}</span>
                                    <span className="text-xs text-gray-400">({service.category})</span>
                                  </label>
                                );
                              })}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Leave "All Services" checked if this team member can perform any service.
                            </p>
                          </div>
                        )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={addTeamMember}
                            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-semibold"
                          >
                            Add Member
                          </button>
                          <button
                            type="button"
                            onClick={cancelAddMember}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {teamMembers.length === 0 && !addingMember && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">No team members added yet</p>
                      <p className="text-sm text-gray-500">Adding team members helps build patient trust</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 6: CANCELLATION POLICY */}
            <div className="border-t border-gray-200 pt-8 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">6. Cancellation Policy</h2>
              <p className="text-gray-600 mb-6">Choose the policy that applies to all bookings at your practice.</p>
              
              <div className="space-y-4">
                {/* Standard Policy */}
                <label
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    cancellationPolicy === 'standard'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="cancellationPolicy"
                      value="standard"
                      checked={cancellationPolicy === 'standard'}
                      onChange={() => setCancellationPolicy('standard')}
                      className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900">Standard</span>
                        <span className="ml-2 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Patients can cancel free of charge up to 24 hours before their appointment.
                      </p>
                      <ul className="mt-3 space-y-1 text-sm text-gray-500">
                        <li>• 24+ hours notice: <span className="text-green-600 font-medium">Full refund</span></li>
                        <li>• 12-24 hours notice: <span className="text-yellow-600 font-medium">25% fee</span></li>
                        <li>• Under 12 hours: <span className="text-orange-600 font-medium">50% fee</span></li>
                        <li>• No-show: <span className="text-red-600 font-medium">Full charge</span></li>
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Moderate Policy */}
                <label
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    cancellationPolicy === 'moderate'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="cancellationPolicy"
                      value="moderate"
                      checked={cancellationPolicy === 'moderate'}
                      onChange={() => setCancellationPolicy('moderate')}
                      className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900">Moderate</span>
                        <span className="ml-2 text-xs text-gray-500">Best for specialists & procedures</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Patients can cancel free of charge up to 48 hours before their appointment.
                      </p>
                      <ul className="mt-3 space-y-1 text-sm text-gray-500">
                        <li>• 48+ hours notice: <span className="text-green-600 font-medium">Full refund</span></li>
                        <li>• 24-48 hours notice: <span className="text-yellow-600 font-medium">25% fee</span></li>
                        <li>• Under 24 hours: <span className="text-orange-600 font-medium">50% fee</span></li>
                        <li>• No-show: <span className="text-red-600 font-medium">Full charge</span></li>
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Fee Waiver Option */}
                <div className="border-t pt-4 mt-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowFeeWaiver}
                      onChange={(e) => setAllowFeeWaiver(e.target.checked)}
                      className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 rounded"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Allow fee waivers</span>
                      <p className="text-sm text-gray-500">
                        You can waive cancellation fees on a case-by-case basis from your dashboard.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3 text-sm text-blue-700">
                      <p className="font-medium">Important</p>
                      <p className="mt-1">
                        When you cancel a booking, the patient always receives a full refund.
                        You can change your cancellation policy at any time from your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

           {/* SECTION 7: CREATE PASSWORD */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8" id="password-section">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Create Password *</h2>
              <p className="text-gray-600 mb-6">Create a password to secure your account and access your dashboard.</p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12 ${errors.password ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    id="confirm-password-input"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Re-enter your password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
                <p className="text-sm text-gray-500">Password must be at least 8 characters long.</p>
              </div>
            </div>

            {/* SECTION 8: AGREEMENT */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8" id="agreement-section">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Provider Agreement *</h2>
              
              {/* Download & View Agreement Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Review Before Signing</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Please read the full Provider Participation Agreement before signing. This is a legally binding contract.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                        href="/legal/Findr_Health_Provider_Participation_Agreement.pdf"
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Download Full Agreement
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowAgreementModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                      >
                        View Summary (18 Sections)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Key Terms Summary</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>By signing below, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Maintain required professional liability insurance ($1M/$3M)</li>
                    <li>Authorize background checks and credential verification</li>
                    <li>Comply with HIPAA and state regulations</li>
                    <li>Provide accurate service listings and pricing</li>
                    <li>Platform fee: 10% + $1.50 per booking (capped at $35). Stripe processing: ~2.9% + $0.30 (capped at $35)</li>
                    <li>Class action waiver - individual arbitration only</li>
                    <li>Termination decisions are final and not subject to appeal</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type Your Full Legal Name to Sign *
                  </label>
                  <input
                    id="signature-input"
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 font-serif text-lg ${
                      errors.signature ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.signature && <p className="mt-1 text-sm text-red-600">{errors.signature}</p>}
                  
                  {/* Sign Later Option */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleSubmitWithoutSignature}
                      disabled={loading}
                      className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      <span>Not ready to sign?</span>
                      <span className="underline">Save profile and sign later →</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">You can sign the agreement from your dashboard later</p>
                  </div>
                </div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and agree to the Provider Participation Agreement, including all 18 sections
                  </span>
                </label>
                {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

                {signature && agreedToTerms && (
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                    <p className="text-sm text-green-900">
                      <strong>Signature:</strong> {signature} • <strong>Date:</strong> {new Date().toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="pt-6 border-t border-gray-200">
              {/* Primary Submit - With Signature */}
              <button
                type="submit"
                disabled={loading || !agreedToTerms || !signature.trim()}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Sign & Submit for Approval →'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                {agreedToTerms && signature.trim() 
                  ? "You'll receive an email within 24-48 hours with your approval status"
                  : "You can sign the agreement later from your provider dashboard"
                }
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* AGREEMENT MODAL */}
      {showAgreementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Provider Participation Agreement</h2>
              <button
                onClick={() => setShowAgreementModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Full Agreement (18 Sections)</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">1. Definitions</h4>
                    <p>Key terms defined including Booking, Booking Fee, Cancellation Fee, Listing, Patient, Platform, Platform Fee, Processing Fee, Provider Content, and Services.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">2. Independent Contractor Status</h4>
                    <p>Provider is an independent contractor, not an employee. Provider controls how services are performed. Findr Health provides no medical advice or referrals.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">3. Provider Listing and Account</h4>
                    <p>Provider creates Listings with practice information, services, and pricing. Provider certifies accuracy. Findr Health may review, approve, reject, or remove Listings. Platform operates in United States only.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">4. Fees and Payment</h4>
                    <p>Platform Fee: 10% + $1.50 per booking (capped at $35). Processing Fee: ~2.9% + $0.30 (capped at $35). Findr Health acts as limited payment collection agent. Payouts within 3-5 business days.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">5. Cancellation Policy</h4>
                    <p>Provider selects Standard (24hr) or Moderate (48hr) cancellation policy. Patient cancellation fees apply per policy. Provider cancellations result in full patient refunds.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">6. Licensing and Credentials</h4>
                    <p>Provider certifies valid licenses and credentials. Provider authorizes verification and background checks (criminal, licensure, OIG/SAM screening, malpractice history). Must notify of material changes within 5 business days.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">7. Insurance Requirements</h4>
                    <p>Provider must maintain professional liability insurance: $1M per occurrence, $3M aggregate. Must notify of any changes within 10 business days.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">8. HIPAA and Data Protection</h4>
                    <p>Provider responsible for HIPAA compliance. Findr Health is not a Business Associate. Provider handles all PHI. Must report data breaches within 10 business days.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">9. Provider Conduct</h4>
                    <p>Provider agrees to professional standards, FTC compliance, non-circumvention (no off-platform bookings to avoid fees), audit cooperation, service level expectations (24hr response, 80% acceptance rate), and anti-corruption compliance.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">10. Reviews and Ratings</h4>
                    <p>Provider participates in good faith in review system. No fake reviews, manipulation, or retaliation against negative reviews.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">11. Intellectual Property</h4>
                    <p>Provider grants Findr Health license to use Provider Content. Provider retains ownership. Findr Health owns all Platform IP. Feedback becomes Findr Health property.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">12. Indemnification</h4>
                    <p>Provider indemnifies Findr Health against all claims arising from: Provider's services, negligence, malpractice, Agreement breaches, law violations, and Patient disputes.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">13. Limitation of Liability</h4>
                    <p>Platform provided 'AS IS'. Findr Health not liable for Provider services, Patient outcomes, or consequential damages. No liability for adverse healthcare outcomes. Exceptions for gross negligence or fraud.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">14. Term and Termination</h4>
                    <p>Provider may terminate with 30 days notice. Findr Health may terminate immediately for any breach, license issues, insurance lapse, fraud, patient harm, complaints, or at sole discretion. <strong>Exclusion decisions are FINAL and NOT subject to appeal.</strong></p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">15. Dispute Resolution</h4>
                    <p>30-day informal resolution required. Binding AAA arbitration in Bozeman, Montana. <strong>CLASS ACTION WAIVER</strong> - individual claims only. 1-year statute of limitations. 30-day opt-out right.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">16. Confidentiality</h4>
                    <p>Both parties protect confidential information. Use only for Agreement purposes. Return or destroy upon termination.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">17. General Provisions</h4>
                    <p>Montana law governs. 30-day notice for amendments. No assignment without consent. Force majeure applies. All time periods in Mountain Time.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">18. Data Use and Consent</h4>
                    <p>Findr Health collects business and transaction data. Provider consents to data use for Platform operations, analytics, and marketing. Data may be retained after termination.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Version 2025 | Effective Date: {new Date().toLocaleDateString()}
                    </p>
                      <a
                      href="/legal/Findr_Health_Provider_Participation_Agreement.pdf"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Download Full Document
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAgreementModal(false)}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
