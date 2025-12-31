import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, Plus, X, Check, Pencil, Trash2 } from 'lucide-react';
import { useProviderData } from '../hooks/useProviderData';

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

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const SERVICE_CATEGORIES = [
  "Preventive", "Acute Care", "Chronic Care", "Vaccinations", "Virtual",
  "Urgent Care", "Minor Procedures", "Diagnostic", "Testing", "IV Therapy",
  "Restorative", "Cosmetic", "Emergency", "Evaluation", "Therapy",
  "Psychiatry", "Facials", "Injectables", "Laser", "Consultation",
  "Massage", "Chiropractic", "Physical Therapy", "Personal Training",
  "Group Fitness", "Wellness", "Nutrition", "Weight Management", "Primary Care", "General"
];

interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  duration: number;
  price: number;
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo: string;
}

interface Photo {
  url: string;
  isPrimary?: boolean;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { provider, updateProvider, loading, refreshProvider } = useProviderData();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [practiceName, setPracticeName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [street, setStreet] = useState('');
  const [suite, setSuite] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceData, setEditingServiceData] = useState<Service | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', category: '', duration: '', price: '' });

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', title: '', bio: '', photo: '' });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberData, setEditingMemberData] = useState<TeamMember | null>(null);

  // Photos state
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Credentials state
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [npiNumber, setNpiNumber] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [education, setEducation] = useState('');
  const [certifications, setCertifications] = useState('');
  const [insuranceAccepted, setInsuranceAccepted] = useState('');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Load provider data
  useEffect(() => {
    if (provider) {
      setPracticeName(provider.practiceName || '');
      setSelectedTypes(provider.providerTypes || []);
      setPhone(provider.contactInfo?.phone || provider.phone || '');
      setEmail(provider.contactInfo?.email || provider.email || '');
      setWebsite(provider.contactInfo?.website || provider.website || '');
      setStreet(provider.address?.street || '');
      setSuite(provider.address?.suite || '');
      setCity(provider.address?.city || '');
      setState(provider.address?.state || '');
      setZip(provider.address?.zip || '');
      setServices((provider.services || []).map((s: any, idx: number) => ({ ...s, id: s.id || s._id || `svc-${idx}` })));
      setTeamMembers(provider.teamMembers || []);
      setPhotos((provider.photos || []).map((p: any) => typeof p === 'string' ? { url: p } : p));
      
      // Credentials
      setLicenseNumber(provider.credentials?.licenseNumber || '');
      setLicenseState(provider.credentials?.licenseState || '');
      setLicenseExpiry(provider.credentials?.licenseExpiry || '');
      setNpiNumber(provider.credentials?.npiNumber || '');
      setYearsExperience(provider.credentials?.yearsExperience || '');
      setEducation(provider.credentials?.education || '');
      setCertifications(provider.credentials?.certifications || '');
      setInsuranceAccepted(provider.credentials?.insuranceAccepted || '');
    }
  }, [provider]);

  const markChanged = () => setHasChanges(true);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
    markChanged();
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      await updateProvider({
        practiceName,
        providerTypes: selectedTypes,
        contactInfo: { phone, email, website },
        address: { street, suite, city, state, zip },
        services,
        teamMembers,
        photos: photos.map((p, idx) => ({ url: p.url, isPrimary: idx === 0 })),
        credentials: {
          licenseNumber,
          licenseState,
          licenseExpiry,
          npiNumber,
          yearsExperience,
          education,
          certifications,
          insuranceAccepted
        }
      });
      setSuccessMessage('Profile updated successfully!');
      setHasChanges(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Photo functions
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    Array.from(e.target.files).forEach(file => {
      if (photos.length >= 5) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('File exceeds 5MB limit');
        return;
      }
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, { url: event.target!.result as string, isPrimary: prev.length === 0 }]);
          markChanged();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (index: number) => {
    if (confirm('Delete this photo?')) {
      setPhotos(prev => prev.filter((_, i) => i !== index));
      markChanged();
    }
  };

  const setPhotoPrimary = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      const [photo] = newPhotos.splice(index, 1);
      newPhotos.unshift(photo);
      return newPhotos;
    });
    markChanged();
  };

  // Service functions
  const addService = () => {
    if (!newService.name || !newService.price || !newService.duration) return;
    
    const service: Service = {
      id: `svc-${Date.now()}`,
      name: newService.name,
      description: newService.description,
      category: newService.category || 'General',
      duration: parseInt(newService.duration),
      price: parseFloat(newService.price)
    };
    
    setServices([...services, service]);
    setNewService({ name: '', description: '', category: '', duration: '', price: '' });
    setShowAddService(false);
    markChanged();
  };

  const startEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setEditingServiceData({ ...service });
  };

  const cancelEditService = () => {
    setEditingServiceId(null);
    setEditingServiceData(null);
  };

  const saveEditService = () => {
    if (!editingServiceData) return;
    setServices(services.map(s => 
      s.id === editingServiceData.id ? editingServiceData : s
    ));
    setEditingServiceId(null);
    setEditingServiceData(null);
    markChanged();
  };

  const deleteService = (id: string) => {
    if (confirm('Delete this service?')) {
      setServices(services.filter(s => s.id !== id));
      markChanged();
    }
  };

  // Team functions
  const addTeamMember = () => {
    if (!newMember.name || !newMember.title) return;
    
    const member: TeamMember = {
      id: `tm-${Date.now()}`,
      ...newMember
    };
    
    setTeamMembers([...teamMembers, member]);
    setNewMember({ name: '', title: '', bio: '', photo: '' });
    setShowAddMember(false);
    markChanged();
  };

  const deleteTeamMember = (id: string) => {
    if (confirm('Remove this team member?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      markChanged();
    }
  };
const startEditMember = (member: TeamMember) => {
  setEditingMemberId(member.id);
  setEditingMemberData({ ...member });
};

const handleChangePassword = async () => {
  setPasswordError('');
  setPasswordSuccess('');
  
  if (!currentPassword) {
    setPasswordError('Current password is required');
    return;
  }
  if (!newPassword || newPassword.length < 8) {
    setPasswordError('New password must be at least 8 characters');
    return;
  }
  if (newPassword !== confirmNewPassword) {
    setPasswordError('New passwords do not match');
    return;
  }
  
  setChangingPassword(true);
  try {
    const response = await fetch(`${API_URL}/providers/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: provider?._id,
        currentPassword,
        password: newPassword
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to change password');
    }
    
    setPasswordSuccess('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  } catch (err: any) {
    setPasswordError(err.message || 'Failed to change password');
  } finally {
    setChangingPassword(false);
  }
};

const saveEditMember = () => {
  if (!editingMemberData) return;
  setTeamMembers(teamMembers.map(m => 
    m.id === editingMemberId ? editingMemberData : m
  ));
  setEditingMemberId(null);
  setEditingMemberData(null);
  markChanged();
};

const cancelEditMember = () => {
  setEditingMemberId(null);
  setEditingMemberData(null);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!provider) {
    navigate('/login');
    return null;
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'location', label: 'Location' },
    { id: 'services', label: 'Services' },
    { id: 'team', label: 'Team' },
    { id: 'photos', label: 'Photos' },
    { id: 'credentials', label: 'Credentials' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-sm text-gray-600">{provider.practiceName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice or Business Name
              </label>
              <input
                type="text"
                value={practiceName}
                onChange={(e) => { setPracticeName(e.target.value); markChanged(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Types
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {providerTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleType(type.id)}
                    className={`relative p-3 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      selectedTypes.includes(type.id)
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-medium text-gray-900 text-xs text-center">{type.label}</span>
                    {selectedTypes.includes(type.id) && (
                      <Check className="absolute top-1 right-1 w-4 h-4 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => { setWebsite(e.target.value); markChanged(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="https://"
              />
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => { setStreet(e.target.value); markChanged(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suite / Unit (optional)
              </label>
              <input
                type="text"
                value={suite}
                onChange={(e) => { setSuite(e.target.value); markChanged(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => { setState(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => { setZip(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Services ({services.length})</h3>
              <button 
                onClick={() => setShowAddService(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            {/* Add Service Form */}
            {showAddService && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">New Service</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Service name *"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Category</option>
                      {SERVICE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Duration (min) *"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Price ($) *"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={addService}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Add Service
                  </button>
                  <button
                    onClick={() => { setShowAddService(false); setNewService({ name: '', description: '', category: '', duration: '', price: '' }); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Services List */}
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="p-4 bg-gray-50 rounded-lg">
                  {editingServiceId === service.id && editingServiceData ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editingServiceData.name}
                          onChange={(e) => setEditingServiceData({ ...editingServiceData, name: e.target.value })}
                          placeholder="Service name"
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <select
                          value={editingServiceData.category}
                          onChange={(e) => setEditingServiceData({ ...editingServiceData, category: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Category</option>
                          {SERVICE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={editingServiceData.duration}
                          onChange={(e) => setEditingServiceData({ ...editingServiceData, duration: parseInt(e.target.value) || 0 })}
                          placeholder="Duration (min)"
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="number"
                          value={editingServiceData.price}
                          onChange={(e) => setEditingServiceData({ ...editingServiceData, price: parseFloat(e.target.value) || 0 })}
                          placeholder="Price ($)"
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <textarea
                        value={editingServiceData.description || ''}
                        onChange={(e) => setEditingServiceData({ ...editingServiceData, description: e.target.value })}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditService}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditService}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => { deleteService(editingServiceData.id); setEditingServiceId(null); setEditingServiceData(null); }}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.category} - {service.duration} min - ${service.price}</p>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => startEditService(service)}
                          className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-gray-500 text-center py-8">No services added yet. Click "Add Service" to get started.</p>
              )}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Team Members ({teamMembers.length})</h3>
              <button 
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
                Add Team Member
              </button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">New Team Member</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Title/Role *"
                      value={newMember.title}
                      onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <textarea
                    placeholder="Bio (optional)"
                    value={newMember.bio}
                    onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={addTeamMember}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Add Member
                  </button>
                  <button
                    onClick={() => { setShowAddMember(false); setNewMember({ name: '', title: '', bio: '', photo: '' }); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Team List */}
            <div className="space-y-3">
              {teamMembers.map((member) => (
  <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
    {editingMemberId === member.id ? (
      /* Edit Mode */
      <div className="space-y-3">
        <input
          type="text"
          value={editingMemberData?.name || ''}
          onChange={(e) => setEditingMemberData({...editingMemberData!, name: e.target.value})}
          placeholder="Name *"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          value={editingMemberData?.title || ''}
          onChange={(e) => setEditingMemberData({...editingMemberData!, title: e.target.value})}
          placeholder="Title"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <textarea
          value={editingMemberData?.bio || ''}
          onChange={(e) => setEditingMemberData({...editingMemberData!, bio: e.target.value})}
          placeholder="Bio"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <div className="flex gap-2">
          <button onClick={saveEditMember} className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">Save</button>
          <button onClick={cancelEditMember} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">Cancel</button>
        </div>
      </div>
    ) : (
      /* View Mode */
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-teal-600 font-bold text-lg">
            {member.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{member.name}</p>
          <p className="text-sm text-teal-600">{member.title}</p>
          {member.bio && <p className="text-sm text-gray-600 mt-1">{member.bio}</p>}
        </div>
        <button
          onClick={() => startEditMember(member)}
          className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteTeamMember(member.id)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}
 </div>
))}
              {teamMembers.length === 0 && (
                <p className="text-gray-500 text-center py-8">No team members added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Photos ({photos.length}/5)</h3>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${
                photos.length >= 5 
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                  : 'border-gray-300 bg-gray-50 hover:border-teal-400 cursor-pointer'
              }`}
              onClick={() => photos.length < 5 && document.getElementById('photoInput')?.click()}
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
              
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-700 mb-1">
                {photos.length >= 5 ? 'Maximum photos reached' : 'Click to upload photos'}
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG up to 5MB each
              </p>
            </div>

            {/* Photo Gallery */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={photo.url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-teal-600 text-white text-xs rounded font-medium">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {idx !== 0 && (
                        <button
                          onClick={() => setPhotoPrimary(idx)}
                          className="p-2 bg-white rounded-full text-teal-600 hover:bg-teal-50"
                          title="Set as primary"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deletePhoto(idx)}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No photos uploaded yet. Add photos to showcase your practice.
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4">
              The first photo will be your primary photo shown to patients. Hover over a photo to set it as primary or delete it.
            </p>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => { setLicenseNumber(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., MD12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License State
                </label>
                <select
                  value={licenseState}
                  onChange={(e) => { setLicenseState(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select State</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => { setLicenseExpiry(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NPI Number
                </label>
                <input
                  type="text"
                  value={npiNumber}
                  onChange={(e) => { setNpiNumber(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="10-digit NPI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={yearsExperience}
                  onChange={(e) => { setYearsExperience(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => { setEducation(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., MD, Harvard Medical School"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </label>
              <textarea
                value={certifications}
                onChange={(e) => { setCertifications(e.target.value); markChanged(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
                placeholder="List certifications, one per line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Accepted
              </label>
              <textarea
                value={insuranceAccepted}
                onChange={(e) => { setInsuranceAccepted(e.target.value); markChanged(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
                placeholder="List accepted insurance plans, one per line"
              />
            </div>
          </div>
        )}
        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-6">Change Password</h3>
            
            {passwordError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Minimum 8 characters"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Re-enter new password"
                />
              </div>
              
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
