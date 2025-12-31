import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Upload, X, Camera, Search, Pencil, AlertCircle, FileText, Users, Plus } from 'lucide-react';
import FindrLogo from '../../components/branding/FindrLogo';
import { submitProviderProfile } from '../../services/api';


const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

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
}
const allServices: Record<string, Service[]> = {
  'Medical': [
    { id: 'med-annual-physical', name: 'Annual Physical Exam', category: 'Preventive', duration: 45, price: 150 },
    { id: 'med-wellness-checkup', name: 'Wellness Checkup', category: 'Preventive', duration: 30, price: 125 },
    { id: 'med-sick-visit', name: 'Sick Visit', category: 'Acute Care', duration: 20, price: 100 },
    { id: 'med-diabetes', name: 'Diabetes Management', category: 'Chronic Care', duration: 30, price: 125 },
    { id: 'med-flu-vax', name: 'Flu Vaccination', category: 'Vaccinations', duration: 15, price: 40 },
    { id: 'med-telehealth', name: 'Telehealth Consultation', category: 'Virtual', duration: 20, price: 75 },
  ],
  'Urgent Care': [
    { id: 'uc-basic-visit', name: 'Basic Urgent Care Visit', category: 'Urgent Care', duration: 30, price: 75 },
    { id: 'uc-comprehensive', name: 'Comprehensive Visit', category: 'Urgent Care', duration: 45, price: 150 },
    { id: 'uc-laceration', name: 'Laceration Repair', category: 'Minor Procedures', duration: 30, price: 200 },
    { id: 'uc-xray', name: 'X-Ray', category: 'Diagnostic', duration: 20, price: 100 },
    { id: 'uc-strep', name: 'Strep Test', category: 'Testing', duration: 15, price: 35 },
    { id: 'uc-iv-hydration', name: 'IV Hydration Therapy', category: 'IV Therapy', duration: 45, price: 150 },
  ],
  'Dental': [
    { id: 'dent-cleaning', name: 'Dental Cleaning', category: 'Preventive', duration: 60, price: 120 },
    { id: 'dent-exam-xray', name: 'Exam & X-rays', category: 'Preventive', duration: 45, price: 150 },
    { id: 'dent-filling', name: 'Filling', category: 'Restorative', duration: 60, price: 200 },
    { id: 'dent-crown', name: 'Crown', category: 'Restorative', duration: 120, price: 1200 },
    { id: 'dent-whitening', name: 'Teeth Whitening', category: 'Cosmetic', duration: 60, price: 400 },
    { id: 'dent-emergency', name: 'Emergency Dental Exam', category: 'Emergency', duration: 30, price: 150 },
  ],
  'Mental Health': [
    { id: 'mh-initial', name: 'Initial Evaluation', category: 'Evaluation', duration: 60, price: 250 },
    { id: 'mh-therapy-60', name: 'Individual Therapy (60 min)', category: 'Therapy', duration: 60, price: 150 },
    { id: 'mh-therapy-45', name: 'Individual Therapy (45 min)', category: 'Therapy', duration: 45, price: 125 },
    { id: 'mh-couples', name: 'Couples Therapy', category: 'Therapy', duration: 60, price: 175 },
    { id: 'mh-med-mgmt', name: 'Medication Management', category: 'Psychiatry', duration: 30, price: 150 },
    { id: 'mh-telehealth', name: 'Telehealth Session', category: 'Virtual', duration: 50, price: 140 },
  ],
  'Skincare/Aesthetics': [
    { id: 'skin-facial', name: 'Classic Facial', category: 'Facials', duration: 60, price: 120 },
    { id: 'skin-hydrafacial', name: 'HydraFacial', category: 'Facials', duration: 60, price: 200 },
    { id: 'skin-botox', name: 'Botox (per area)', category: 'Injectables', duration: 30, price: 350 },
    { id: 'skin-filler', name: 'Dermal Filler', category: 'Injectables', duration: 45, price: 650 },
    { id: 'skin-laser-hair', name: 'Laser Hair Removal', category: 'Laser', duration: 30, price: 200 },
    { id: 'skin-consultation', name: 'Skin Consultation', category: 'Consultation', duration: 30, price: 75 },
  ],
  'Massage/Bodywork': [
    { id: 'mass-swedish-60', name: 'Swedish Massage (60 min)', category: 'Massage', duration: 60, price: 90 },
    { id: 'mass-deep-60', name: 'Deep Tissue Massage (60 min)', category: 'Massage', duration: 60, price: 110 },
    { id: 'mass-sports', name: 'Sports Massage', category: 'Massage', duration: 60, price: 110 },
    { id: 'mass-hot-stone', name: 'Hot Stone Massage', category: 'Massage', duration: 75, price: 130 },
    { id: 'chiro-adjust', name: 'Chiropractic Adjustment', category: 'Chiropractic', duration: 30, price: 75 },
    { id: 'pt-session', name: 'Physical Therapy Session', category: 'Physical Therapy', duration: 45, price: 125 },
  ],
  'Fitness/Training': [
    { id: 'fit-pt-single', name: 'Personal Training Session', category: 'Personal Training', duration: 60, price: 80 },
    { id: 'fit-assessment', name: 'Fitness Assessment', category: 'Assessment', duration: 60, price: 100 },
    { id: 'fit-nutrition', name: 'Nutrition Consultation', category: 'Coaching', duration: 45, price: 75 },
    { id: 'fit-group', name: 'Small Group Training', category: 'Group', duration: 60, price: 35 },
    { id: 'fit-bootcamp', name: 'Bootcamp Class', category: 'Group', duration: 45, price: 25 },
    { id: 'fit-virtual', name: 'Virtual Training Session', category: 'Virtual', duration: 45, price: 60 },
  ],
  'Yoga/Pilates': [
    { id: 'yoga-drop-in', name: 'Yoga Class (Drop-in)', category: 'Yoga', duration: 60, price: 20 },
    { id: 'yoga-private', name: 'Private Yoga Session', category: 'Yoga', duration: 60, price: 100 },
    { id: 'yoga-hot', name: 'Hot Yoga Class', category: 'Yoga', duration: 75, price: 25 },
    { id: 'pilates-mat', name: 'Pilates Mat Class', category: 'Pilates', duration: 55, price: 25 },
    { id: 'pilates-reformer', name: 'Pilates Reformer Class', category: 'Pilates', duration: 55, price: 40 },
    { id: 'meditation', name: 'Guided Meditation', category: 'Mindfulness', duration: 30, price: 15 },
  ],
  'Nutrition/Wellness': [
    { id: 'nutr-initial', name: 'Initial Nutrition Consultation', category: 'Nutrition', duration: 60, price: 150 },
    { id: 'nutr-followup', name: 'Nutrition Follow-up', category: 'Nutrition', duration: 30, price: 75 },
    { id: 'nutr-meal-plan', name: 'Custom Meal Plan', category: 'Nutrition', duration: 45, price: 125 },
    { id: 'well-health-coach', name: 'Health Coaching Session', category: 'Wellness', duration: 60, price: 100 },
    { id: 'well-weight', name: 'Weight Management Session', category: 'Wellness', duration: 45, price: 85 },
    { id: 'well-functional', name: 'Functional Medicine Consult', category: 'Holistic', duration: 60, price: 200 },
  ],
  'Pharmacy/RX': [
    { id: 'rx-consult', name: 'Pharmacist Consultation', category: 'Consultation', duration: 15, price: 25 },
    { id: 'rx-med-review', name: 'Medication Review', category: 'Consultation', duration: 30, price: 50 },
    { id: 'rx-immunization', name: 'Immunization', category: 'Immunizations', duration: 15, price: 35 },
    { id: 'rx-flu-shot', name: 'Flu Shot', category: 'Immunizations', duration: 10, price: 40 },
    { id: 'rx-bp-check', name: 'Blood Pressure Check', category: 'Screenings', duration: 10, price: 0 },
    { id: 'rx-compound', name: 'Custom Compounding', category: 'Compounding', duration: 30, price: 50 },
  ],
};

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

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customizedServices, setCustomizedServices] = useState<Record<string, { price: number; duration: number }>>({});
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

    Array.from(files).forEach(file => {
      if (photos.length >= 5) return;
      if (file.size > 5 * 1024 * 1024) return;
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos(prev => [...prev, e.target!.result as string]);
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
      bio: newMemberBio,
    };

    setTeamMembers(prev => [...prev, newMember]);
    setAddingMember(false);
    setNewMemberPhoto('');
    setNewMemberName('');
    setNewMemberTitle('');
    setNewMemberBio('');
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

  const getAvailableServices = () => {
    return selectedTypes.flatMap(type => allServices[type] || []);
  };

  // Get all services from all provider types
  const getAllServices = () => {
    const allServicesList: Service[] = [];
    Object.values(allServices).forEach(services => {
      services.forEach(service => {
        if (!allServicesList.find(s => s.id === service.id)) {
          allServicesList.push(service);
        }
      });
    });
    return allServicesList;
  };

  // Get unique categories from all services
  const serviceCategories = Array.from(
    new Set(getAllServices().map(s => s.category))
  ).sort();

  const addCustomService = () => {
    if (!customServiceName.trim() || !customServiceDuration || !customServicePrice) {
      alert('Please fill in service name, duration, and price');
      return;
    }
    if (activeCategory === 'all') {
      alert('Please select a category first');
      return;
    }
    const newService: Service = {
      id: `custom-${Date.now()}`,
      name: customServiceName.trim(),
      description: customServiceDescription.trim(),
      category: activeCategory,
      duration: parseInt(customServiceDuration),
      price: parseFloat(customServicePrice)
    };
    setCustomServices(prev => [...prev, newService]);
    setSelectedServices(prev => [...prev, newService.id]);
    setCustomServiceName('');
    setCustomServiceDuration('');
    setCustomServicePrice('');    setCustomServiceDescription('');
    setShowAddCustomService(false);
  };

  const getAllServicesWithCustom = () => {
    return [...getAllServices(), ...customServices];
  };

  const startEdit = (serviceId: string) => {
    const service = getAllServicesWithCustom().find(s => s.id === serviceId);
    const customized = customizedServices[serviceId];
    
    if (service) {
      setEditingService(serviceId);
      setEditPrice((customized?.price || service.price).toString());
      setEditDuration((customized?.duration || service.duration).toString());
      setEditDescription(customized?.description || service.description || '');
    }
  };

  const saveEdit = () => {
    if (!editingService) return;
    
    const price = parseFloat(editPrice);
    const duration = parseInt(editDuration);
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (isNaN(duration) || duration <= 0) {
      alert('Please enter a valid duration');
      return;
    }
    
    setCustomizedServices(prev => ({
      ...prev,
      [editingService]: { price, duration, description: editDescription }
    }));
    
    setEditingService(null);
  };

  const cancelEdit = () => {
    setEditingService(null);
    setEditDuration('');
    setEditPrice('');
  };

  const deleteService = (serviceId: string) => {
    if (!confirm('Are you sure you want to remove this service?')) return;
    setSelectedServices(prev => prev.filter(id => id !== serviceId));
    setCustomServices(prev => prev.filter(s => s.id !== serviceId));
    setCustomizedServices(prev => {
      const newCustomized = { ...prev };
      delete newCustomized[serviceId];
      return newCustomized;
    });
    setEditingService(null);
  };

  const getServiceDetails = (service: Service) => {
    const customized = customizedServices[service.id];
    return {
      price: customized?.price || service.price,
      duration: customized?.duration || service.duration,
      description: customized?.description || service.description || '',
      isCustomized: !!customized
    };
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
  if (photos.length === 0) newErrors.photos = 'Upload at least 1 photo';
  
  if (!signature.trim()) newErrors.signature = 'Signature required';
  if (!agreedToTerms) newErrors.terms = 'Must agree to terms';
  if (!password.trim()) newErrors.password = 'Password required';
  else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
  if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  setLoading(true);

  try {
    const businessDataStr = sessionStorage.getItem('businessData');
    const businessData = businessDataStr ? JSON.parse(businessDataStr) : {};

    const servicesData = getAllServicesWithCustom()
      .filter(s => selectedServices.includes(s.id))
      .map(service => {
        const details = getServiceDetails(service);
        return {
          id: service.id,
          name: service.name,
          category: service.category,
          duration: details.duration,
          price: details.price
        };
      });

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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Provider Type(s) * <span className="text-gray-500 font-normal">(Select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {providerTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleType(type.id)}
                        className={`relative p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          selectedTypes.includes(type.id)
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-300 bg-white'
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{type.label}</span>
                        {selectedTypes.includes(type.id) && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-teal-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.providerTypes && <p className="mt-2 text-sm text-red-600">{errors.providerTypes}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <input
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
          
            {/* SECTION 3: PHOTOS */}
            <div className="pb-8 border-b border-gray-200">
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
              <p className="text-gray-600 mb-6">Select the services you offer and customize pricing</p>
              
              <div className="space-y-4">
                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    All Services
                  </button>
                  {serviceCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Search services..."
                />

                {/* Add Custom Service */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{selectedServices.length} services selected</p>
                  {activeCategory !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setShowAddCustomService(!showAddCustomService)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                      {showAddCustomService ? 'Cancel' : '+ Create Custom Service'}
                    </button>
                  )}
                </div>

                {showAddCustomService && activeCategory !== 'all' && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Create a {activeCategory} Service</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={customServiceName}
                          onChange={(e) => setCustomServiceName(e.target.value)}
                          placeholder="Service name *"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={customServiceDuration}
                            onChange={(e) => setCustomServiceDuration(e.target.value)}
                            placeholder="Duration *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <span className="text-sm text-gray-500">min</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">$</span>
                          <input
                            type="number"
                            value={customServicePrice}
                            onChange={(e) => setCustomServicePrice(e.target.value)}
                            placeholder="Price *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <textarea
                        value={customServiceDescription}
                        onChange={(e) => setCustomServiceDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addCustomService}
                      className="mt-3 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
                    >
                      Add Service
                    </button>
                  </div>
                )}


                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                  {getAllServicesWithCustom()
                    .filter(s => {
                      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                           s.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map(service => {
                      const isSelected = selectedServices.includes(service.id);
                      const details = getServiceDetails(service);
                      const isEditing = editingService === service.id;

                      return (
                        <div
                          key={service.id}
                          className={`p-4 border-2 rounded-lg transition ${isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <button
                              type="button"
                              onClick={() => toggleService(service.id)}
                              className="flex items-start gap-2 text-left flex-1"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="mt-1 w-4 h-4 text-teal-600 rounded"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{service.name}</h4>
                                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{service.category}</span>
                              </div>
                            </button>
                            {isSelected && !isEditing && (
                              <button
                                type="button"
                                onClick={() => startEdit(service.id)}
                                className="p-1 text-gray-400 hover:text-teal-600 transition"
                                title="Edit pricing"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="mt-2 space-y-2 pl-6">
                              <div className="flex gap-2 items-center">
                                <input
                                  type="number"
                                  value={editDuration}
                                  onChange={(e) => setEditDuration(e.target.value)}
                                  placeholder="Duration"
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-600">min</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-600">$</span>
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  placeholder="Price"
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Description (optional)"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteService(service.id)}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pl-6">
                              <p className={`text-sm ${details.isCustomized ? 'text-teal-600 font-medium' : 'text-gray-600'}`}>
                                {details.duration} min • ${details.price}
                                {details.isCustomized && <span className="text-xs ml-1">(edited)</span>}
                              </p>
                              {details.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {details.description.length > 60 ? details.description.substring(0, 60) + '...' : details.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
                {errors.services && <p className="text-sm text-red-600">{errors.services}</p>}
              </div>
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

           {/* SECTION 6: AGREEMENT */}
            <div className="pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Provider Agreement *</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-3">Provider Participation Agreement Summary</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>By signing below, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Maintain required professional insurance ($1M/$3M)</li>
                    <li>Comply with HIPAA and state regulations</li>
                    <li>Provide accurate service listings and pricing</li>
                    <li>Platform fee: 15% + Stripe processing fees</li>
                    <li>30-day termination notice</li>
                    <li>Binding arbitration for disputes</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowAgreementModal(true)}
                    className="text-teal-600 hover:underline font-medium mt-4 flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    View full agreement (16 sections)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type Your Full Legal Name to Sign *
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 font-serif text-lg ${
                      errors.signature ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.signature && <p className="mt-1 text-sm text-red-600">{errors.signature}</p>}
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and agree to the Provider Participation Agreement, including all 16 sections covering independent contractor status, insurance requirements, payment terms, HIPAA compliance, and dispute resolution. *
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

            {/* 7. CREATE PASSWORD */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Create Password *</h2>
              <p className="text-gray-600 mb-6">Create a password to secure your account and access your dashboard.</p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
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
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Approval →'}
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                You'll receive an email within 24-48 hours with your approval status
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
                <h3 className="text-lg font-semibold text-gray-900">Full Agreement (16 Sections)</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">1. Purpose & Relationship</h4>
                    <p>Provider acknowledges independent-contractor status and that Findr Health provides no medical advice or referrals.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">2. Provider Obligations</h4>
                    <p>Provider confirms required credentials, insurance ($1M/$3M general liability), and compliance with HIPAA, FTC, and state law.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">3. Listings, Pricing & Subscriptions</h4>
                    <p>Provider agrees to accurate listings, clear fees, and ROSCA/FTC compliance for recurring offers.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">4. Payments & Settlement</h4>
                    <p>Provider appoints Findr Health as limited payment collection agent. Platform fee: 15% of booking value plus Stripe processing fees (2.9% + $0.30).</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">5. Payment Reserves & Refunds</h4>
                    <p>Provider authorizes delayed release, reserves, and set-offs for refunds/chargebacks.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">6. Cancellations & Refunds</h4>
                    <p>Provider acknowledges refund transparency and Findr Health refund authority; state-law overrides apply.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">7. Data Protection & HIPAA</h4>
                    <p>Provider will protect PHI; Business Associate Agreement applies if PHI is exchanged; breach notice within 10 business days required.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">8. Marketing & Conduct</h4>
                    <p>Provider agrees to TCPA/CAN-SPAM consent requirements and professional conduct standards.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">9. Reviews & Ratings</h4>
                    <p>Provider will not block, buy, or manipulate reviews; Consumer Review Fairness Act and FTC Fake Reviews Rule apply.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">10. Insurance & Indemnification</h4>
                    <p>Provider accepts required insurance limits and indemnification duties.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">11. Intellectual Property</h4>
                    <p>Provider grants display license for content; acknowledges Findr Health IP; unlawful content may be removed.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">12. Term & Termination</h4>
                    <p>30-day termination notice required; immediate suspension for fraud/violation; refunds for unserved bookings.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">13. Limitation of Liability</h4>
                    <p>Liability cap equal to fees retained by Findr Health in prior 12 months (exceptions for gross negligence/fraud apply).</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">14. Dispute Resolution</h4>
                    <p>AAA arbitration with small-claims carve-out and 30-day opt-out right; mass-claims staged processing.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">15. Confidentiality & Accessibility</h4>
                    <p>Provider agrees to confidentiality and ADA/WCAG cooperation for accessibility.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">16. Amendments & Notices</h4>
                    <p>30-day prospective updates via email/dashboard; right to terminate before effective date.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Version 2025 | Effective Date: {new Date().toLocaleDateString()}
                  </p>
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
