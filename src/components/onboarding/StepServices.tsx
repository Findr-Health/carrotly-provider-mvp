import React, { useState } from 'react';
import { Search, Check, Pencil, Plus, X } from 'lucide-react';

interface StepServicesProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

// Service templates based on provider types
const allServices: Record<string, Service[]> = {
  'Medical': [
    { id: 'med-annual-physical', name: 'Annual Physical Exam', category: 'Preventive', duration: 45, price: 150 },
    { id: 'med-wellness-checkup', name: 'Wellness Checkup', category: 'Preventive', duration: 30, price: 125 },
    { id: 'med-sports-physical', name: 'Sports Physical', category: 'Preventive', duration: 30, price: 100 },
    { id: 'med-sick-visit', name: 'Sick Visit', category: 'Acute Care', duration: 20, price: 100 },
    { id: 'med-diabetes', name: 'Diabetes Management', category: 'Chronic Care', duration: 30, price: 125 },
    { id: 'med-hypertension', name: 'Hypertension Follow-up', category: 'Chronic Care', duration: 20, price: 100 },
    { id: 'med-flu-vax', name: 'Flu Vaccination', category: 'Vaccinations', duration: 15, price: 40 },
    { id: 'med-covid-vax', name: 'COVID-19 Vaccination', category: 'Vaccinations', duration: 15, price: 50 },
    { id: 'med-lab-work', name: 'Lab Work / Blood Draw', category: 'Diagnostic', duration: 15, price: 50 },
    { id: 'med-ekg', name: 'EKG/ECG', category: 'Diagnostic', duration: 20, price: 100 },
    { id: 'med-telehealth', name: 'Telehealth Consultation', category: 'Virtual', duration: 20, price: 75 },
  ],
  'Urgent Care': [
    { id: 'uc-basic-visit', name: 'Basic Urgent Care Visit', category: 'Urgent Care Visits', duration: 30, price: 75 },
    { id: 'uc-comprehensive', name: 'Comprehensive Urgent Care Visit', category: 'Urgent Care Visits', duration: 45, price: 150 },
    { id: 'uc-laceration', name: 'Laceration Repair', category: 'Minor Procedures', duration: 30, price: 200 },
    { id: 'uc-splinting', name: 'Splinting/Casting', category: 'Minor Procedures', duration: 30, price: 150 },
    { id: 'uc-xray', name: 'X-Ray', category: 'Diagnostic', duration: 20, price: 100 },
    { id: 'uc-strep', name: 'Strep Test', category: 'Point-of-Care Testing', duration: 15, price: 35 },
    { id: 'uc-flu-test', name: 'Flu Test', category: 'Point-of-Care Testing', duration: 15, price: 40 },
    { id: 'uc-covid-test', name: 'COVID-19 Test', category: 'Point-of-Care Testing', duration: 15, price: 75 },
    { id: 'uc-uti', name: 'UTI Test & Treatment', category: 'Point-of-Care Testing', duration: 20, price: 85 },
    { id: 'uc-iv-hydration', name: 'IV Hydration Therapy', category: 'IV Therapy', duration: 45, price: 150 },
    { id: 'uc-drug-screen', name: 'Drug Screening', category: 'Occupational Health', duration: 15, price: 50 },
    { id: 'uc-dot-physical', name: 'DOT Physical', category: 'Occupational Health', duration: 45, price: 125 },
  ],
  'Dental': [
    { id: 'dent-cleaning', name: 'Dental Cleaning', category: 'Preventive', duration: 60, price: 120 },
    { id: 'dent-deep-clean', name: 'Deep Cleaning', category: 'Preventive', duration: 90, price: 250 },
    { id: 'dent-exam-xray', name: 'Exam & X-rays', category: 'Preventive', duration: 45, price: 150 },
    { id: 'dent-fluoride', name: 'Fluoride Treatment', category: 'Preventive', duration: 15, price: 40 },
    { id: 'dent-filling', name: 'Filling', category: 'Restorative', duration: 60, price: 200 },
    { id: 'dent-crown', name: 'Crown', category: 'Restorative', duration: 120, price: 1200 },
    { id: 'dent-root-canal', name: 'Root Canal', category: 'Restorative', duration: 90, price: 1000 },
    { id: 'dent-extraction', name: 'Tooth Extraction', category: 'Restorative', duration: 45, price: 200 },
    { id: 'dent-whitening', name: 'Teeth Whitening', category: 'Cosmetic', duration: 60, price: 400 },
    { id: 'dent-veneers', name: 'Veneers (per tooth)', category: 'Cosmetic', duration: 120, price: 1500 },
    { id: 'dent-emergency', name: 'Emergency Dental Exam', category: 'Emergency', duration: 30, price: 150 },
  ],
  'Mental Health': [
    { id: 'mh-initial', name: 'Initial Psychiatric Evaluation', category: 'Evaluation', duration: 60, price: 250 },
    { id: 'mh-therapy-60', name: 'Individual Therapy (60 min)', category: 'Therapy', duration: 60, price: 150 },
    { id: 'mh-therapy-45', name: 'Individual Therapy (45 min)', category: 'Therapy', duration: 45, price: 125 },
    { id: 'mh-couples', name: 'Couples Therapy', category: 'Therapy', duration: 60, price: 175 },
    { id: 'mh-family', name: 'Family Therapy', category: 'Therapy', duration: 75, price: 200 },
    { id: 'mh-group', name: 'Group Therapy Session', category: 'Therapy', duration: 90, price: 75 },
    { id: 'mh-med-mgmt', name: 'Medication Management', category: 'Psychiatry', duration: 30, price: 150 },
    { id: 'mh-psych-followup', name: 'Psychiatric Follow-up', category: 'Psychiatry', duration: 30, price: 125 },
    { id: 'mh-crisis', name: 'Crisis Intervention', category: 'Urgent', duration: 60, price: 200 },
    { id: 'mh-telehealth', name: 'Telehealth Session', category: 'Virtual', duration: 50, price: 140 },
  ],
  'Skincare/Aesthetics': [
    { id: 'skin-facial', name: 'Classic Facial', category: 'Facials', duration: 60, price: 120 },
    { id: 'skin-hydrafacial', name: 'HydraFacial', category: 'Facials', duration: 60, price: 200 },
    { id: 'skin-chemical-peel', name: 'Chemical Peel', category: 'Facials', duration: 45, price: 150 },
    { id: 'skin-microderm', name: 'Microdermabrasion', category: 'Facials', duration: 45, price: 125 },
    { id: 'skin-botox', name: 'Botox (per area)', category: 'Injectables', duration: 30, price: 350 },
    { id: 'skin-filler', name: 'Dermal Filler (per syringe)', category: 'Injectables', duration: 45, price: 650 },
    { id: 'skin-laser-hair', name: 'Laser Hair Removal', category: 'Laser', duration: 30, price: 200 },
    { id: 'skin-ipl', name: 'IPL Photofacial', category: 'Laser', duration: 45, price: 300 },
    { id: 'skin-consultation', name: 'Skin Consultation', category: 'Consultation', duration: 30, price: 75 },
    { id: 'skin-acne', name: 'Acne Treatment', category: 'Treatment', duration: 45, price: 150 },
  ],
  'Massage/Bodywork': [
    { id: 'mass-swedish-60', name: 'Swedish Massage (60 min)', category: 'Massage', duration: 60, price: 90 },
    { id: 'mass-swedish-90', name: 'Swedish Massage (90 min)', category: 'Massage', duration: 90, price: 130 },
    { id: 'mass-deep-60', name: 'Deep Tissue Massage (60 min)', category: 'Massage', duration: 60, price: 110 },
    { id: 'mass-deep-90', name: 'Deep Tissue Massage (90 min)', category: 'Massage', duration: 90, price: 150 },
    { id: 'mass-sports', name: 'Sports Massage', category: 'Massage', duration: 60, price: 110 },
    { id: 'mass-prenatal', name: 'Prenatal Massage', category: 'Massage', duration: 60, price: 100 },
    { id: 'mass-hot-stone', name: 'Hot Stone Massage', category: 'Massage', duration: 75, price: 130 },
    { id: 'chiro-adjust', name: 'Chiropractic Adjustment', category: 'Chiropractic', duration: 30, price: 75 },
    { id: 'chiro-initial', name: 'Chiropractic Initial Evaluation', category: 'Chiropractic', duration: 60, price: 150 },
    { id: 'pt-session', name: 'Physical Therapy Session', category: 'Physical Therapy', duration: 45, price: 125 },
  ],
  'Fitness/Training': [
    { id: 'fit-pt-single', name: 'Personal Training Session', category: 'Personal Training', duration: 60, price: 80 },
    { id: 'fit-pt-pack5', name: 'Personal Training (5 Pack)', category: 'Personal Training', duration: 60, price: 350 },
    { id: 'fit-pt-pack10', name: 'Personal Training (10 Pack)', category: 'Personal Training', duration: 60, price: 650 },
    { id: 'fit-assessment', name: 'Fitness Assessment', category: 'Assessment', duration: 60, price: 100 },
    { id: 'fit-nutrition', name: 'Nutrition Consultation', category: 'Coaching', duration: 45, price: 75 },
    { id: 'fit-group', name: 'Small Group Training', category: 'Group', duration: 60, price: 35 },
    { id: 'fit-bootcamp', name: 'Bootcamp Class', category: 'Group', duration: 45, price: 25 },
    { id: 'fit-hiit', name: 'HIIT Class', category: 'Group', duration: 45, price: 25 },
    { id: 'fit-strength', name: 'Strength Training Class', category: 'Group', duration: 60, price: 25 },
    { id: 'fit-virtual', name: 'Virtual Training Session', category: 'Virtual', duration: 45, price: 60 },
  ],
  'Yoga/Pilates': [
    { id: 'yoga-drop-in', name: 'Yoga Class (Drop-in)', category: 'Yoga', duration: 60, price: 20 },
    { id: 'yoga-private', name: 'Private Yoga Session', category: 'Yoga', duration: 60, price: 100 },
    { id: 'yoga-hot', name: 'Hot Yoga Class', category: 'Yoga', duration: 75, price: 25 },
    { id: 'yoga-restorative', name: 'Restorative Yoga', category: 'Yoga', duration: 75, price: 22 },
    { id: 'yoga-prenatal', name: 'Prenatal Yoga', category: 'Yoga', duration: 60, price: 22 },
    { id: 'pilates-mat', name: 'Pilates Mat Class', category: 'Pilates', duration: 55, price: 25 },
    { id: 'pilates-reformer', name: 'Pilates Reformer Class', category: 'Pilates', duration: 55, price: 40 },
    { id: 'pilates-private', name: 'Private Pilates Session', category: 'Pilates', duration: 55, price: 90 },
    { id: 'meditation', name: 'Guided Meditation', category: 'Mindfulness', duration: 30, price: 15 },
    { id: 'breathwork', name: 'Breathwork Session', category: 'Mindfulness', duration: 45, price: 25 },
  ],
  'Nutrition/Wellness': [
    { id: 'nutr-initial', name: 'Initial Nutrition Consultation', category: 'Nutrition', duration: 60, price: 150 },
    { id: 'nutr-followup', name: 'Nutrition Follow-up', category: 'Nutrition', duration: 30, price: 75 },
    { id: 'nutr-meal-plan', name: 'Custom Meal Plan', category: 'Nutrition', duration: 45, price: 125 },
    { id: 'well-health-coach', name: 'Health Coaching Session', category: 'Wellness', duration: 60, price: 100 },
    { id: 'well-lifestyle', name: 'Lifestyle Assessment', category: 'Wellness', duration: 90, price: 175 },
    { id: 'well-detox', name: 'Detox Program Consultation', category: 'Wellness', duration: 45, price: 100 },
    { id: 'well-weight', name: 'Weight Management Session', category: 'Wellness', duration: 45, price: 85 },
    { id: 'well-stress', name: 'Stress Management Session', category: 'Wellness', duration: 60, price: 90 },
    { id: 'well-sleep', name: 'Sleep Consultation', category: 'Wellness', duration: 45, price: 85 },
    { id: 'well-functional', name: 'Functional Medicine Consult', category: 'Holistic', duration: 60, price: 200 },
  ],
  'Pharmacy/RX': [
    { id: 'rx-consult', name: 'Pharmacist Consultation', category: 'Consultation', duration: 15, price: 25 },
    { id: 'rx-med-review', name: 'Medication Review', category: 'Consultation', duration: 30, price: 50 },
    { id: 'rx-immunization', name: 'Immunization Administration', category: 'Immunizations', duration: 15, price: 35 },
    { id: 'rx-flu-shot', name: 'Flu Shot', category: 'Immunizations', duration: 10, price: 40 },
    { id: 'rx-covid-vax', name: 'COVID-19 Vaccine', category: 'Immunizations', duration: 15, price: 0 },
    { id: 'rx-bp-check', name: 'Blood Pressure Check', category: 'Screenings', duration: 10, price: 0 },
    { id: 'rx-glucose', name: 'Blood Glucose Test', category: 'Screenings', duration: 10, price: 15 },
    { id: 'rx-compound', name: 'Custom Compounding', category: 'Compounding', duration: 30, price: 50 },
    { id: 'rx-delivery', name: 'Prescription Delivery', category: 'Services', duration: 0, price: 10 },
    { id: 'rx-sync', name: 'Medication Synchronization', category: 'Services', duration: 15, price: 0 },
  ],
};

export const StepServices: React.FC<StepServicesProps> = ({ data, onNext, onBack }) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>(data.services || []);
  const [customizedServices, setCustomizedServices] = useState<Record<string, { price: number; duration: number }>>(data.customizedServices || {});
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customService, setCustomService] = useState({ name: '', category: '', duration: '', price: '' });

  // Get services based on selected provider types
  const providerTypes: string[] = data.providerTypes || [];
  const availableServices: Service[] = providerTypes.flatMap((type: string) => 
    allServices[type] || []
  );

  // Filter services by search
  const filteredServices = availableServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const toggleService = (service: Service) => {
    if (isServiceSelected(service.id)) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      const customized = customizedServices[service.id];
      setSelectedServices(prev => [...prev, {
        ...service,
        price: customized?.price || service.price,
        duration: customized?.duration || service.duration
      }]);
    }
    setError('');
  };

  const startEdit = (serviceId: string) => {
    const service = availableServices.find(s => s.id === serviceId) || 
                    selectedServices.find(s => s.id === serviceId);
    const customized = customizedServices[serviceId];
    
    if (service) {
      setEditingService(serviceId);
      setEditPrice((customized?.price || service.price).toString());
      setEditDuration((customized?.duration || service.duration).toString());
    }
  };

  const saveEdit = () => {
    if (!editingService) return;
    
    const price = parseFloat(editPrice);
    const duration = parseInt(editDuration);
    
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (isNaN(duration) || duration <= 0) {
      alert('Please enter a valid duration');
      return;
    }
    
    setCustomizedServices(prev => ({
      ...prev,
      [editingService]: { price, duration }
    }));

    // Update selected services if this one is selected
    setSelectedServices(prev => prev.map(s => 
      s.id === editingService ? { ...s, price, duration } : s
    ));
    
    setEditingService(null);
  };

  const cancelEdit = () => {
    setEditingService(null);
    setEditPrice('');
    setEditDuration('');
  };

  const getServiceDetails = (service: Service) => {
    const customized = customizedServices[service.id];
    return {
      price: customized?.price ?? service.price,
      duration: customized?.duration ?? service.duration,
      isCustomized: !!customized
    };
  };

  const addCustomService = () => {
    if (!customService.name.trim()) {
      alert('Please enter a service name');
      return;
    }
    
    const price = parseFloat(customService.price);
    const duration = parseInt(customService.duration);
    
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (isNaN(duration) || duration <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    const newService: Service = {
      id: `custom-${Date.now()}`,
      name: customService.name.trim(),
      category: customService.category.trim() || 'Custom',
      duration,
      price
    };

    setSelectedServices(prev => [...prev, newService]);
    setCustomService({ name: '', category: '', duration: '', price: '' });
    setShowCustomForm(false);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length < 2) {
      setError('Please select at least 2 services to continue');
      return;
    }

    onNext({
      services: selectedServices,
      customizedServices
    });
  };

  // Group services by category
  const categories = [...new Set(filteredServices.map(s => s.category))];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 4 of 7: Your Services</h2>
        <p className="text-gray-600">
          Select the services you offer. Choose at least 2 to get started. You can customize pricing.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Selected Count & Add Custom */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedServices.length} services selected
        </div>
        <button
          type="button"
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Custom Service
        </button>
      </div>

      {/* Custom Service Form */}
      {showCustomForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Add Custom Service</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={customService.name}
              onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
              placeholder="Service name *"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              value={customService.category}
              onChange={(e) => setCustomService({ ...customService, category: e.target.value })}
              placeholder="Category (optional)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              value={customService.duration}
              onChange={(e) => setCustomService({ ...customService, duration: e.target.value })}
              placeholder="Duration (min) *"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              value={customService.price}
              onChange={(e) => setCustomService({ ...customService, price: e.target.value })}
              placeholder="Price ($) *"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addCustomService}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium"
            >
              Add Service
            </button>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Selected Custom Services */}
      {selectedServices.filter(s => s.id.startsWith('custom-')).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedServices.filter(s => s.id.startsWith('custom-')).map(service => (
              <div
                key={service.id}
                className="relative p-4 border-2 rounded-xl border-teal-500 bg-teal-50"
              >
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span>{service.duration} min</span>
                      <span>•</span>
                      <span>${service.price}</span>
                      <span className="text-xs text-teal-600">(custom)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedServices(prev => prev.filter(s => s.id !== service.id))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services by Category */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryServices = filteredServices.filter(s => s.category === category);
          if (categoryServices.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryServices.map(service => {
                  const isSelected = isServiceSelected(service.id);
                  const details = getServiceDetails(service);
                  const isEditing = editingService === service.id;

                  return (
                    <div
                      key={service.id}
                      className={`relative p-4 border-2 rounded-xl transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300 bg-white'
                      }`}
                    >
                      {/* Checkbox & Name */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(service)}
                          className="mt-1 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          
                          {isEditing ? (
                            /* Edit Mode */
                            <div className="mt-2 space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={editDuration}
                                  onChange={(e) => setEditDuration(e.target.value)}
                                  placeholder="Duration"
                                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-600 self-center">min</span>
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  placeholder="Price"
                                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-600 self-center">$</span>
                              </div>
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
                              </div>
                            </div>
                          ) : (
                            /* Display Mode */
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{details.duration} min</span>
                                <span>•</span>
                                <span className={details.isCustomized ? 'text-teal-600 font-medium' : ''}>
                                  ${details.price}
                                </span>
                                {details.isCustomized && (
                                  <span className="text-xs text-teal-600">(edited)</span>
                                )}
                              </div>
                              
                              {isSelected && (
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
                          )}
                        </div>
                        
                        {isSelected && !isEditing && (
                          <Check className="w-5 h-5 text-teal-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {availableServices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No preset services available for your provider type(s). Use "Add Custom Service" to create your own.
        </div>
      )}

      {/* Info Box */}
      <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-lg p-4">
        <p className="text-sm text-teal-900">
          <strong>Tip:</strong> Click the pencil icon on selected services to customize pricing and duration. You can also add your own custom services.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
        >
          Continue to Optional Details →
        </button>
      </div>
    </form>
  );
};

export default StepServices;
