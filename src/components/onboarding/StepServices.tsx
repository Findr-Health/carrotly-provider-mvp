// src/components/onboarding/StepServices.tsx
// Updated Services Step with Quick Start Templates and Category System

import React, { useState, useEffect } from 'react';
import { Check, Plus, Search, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';

// Types
interface ServiceTemplate {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  suggestedDuration: number;
  suggestedVariants?: {
    name: string;
    priceModifier: number;
    durationModifier: number;
    description?: string;
  }[];
  isPopular: boolean;
}

interface Service {
  _id?: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  basePrice: number;
  duration: number;
  hasVariants: boolean;
  variants: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    isDefault: boolean;
  }[];
  isActive: boolean;
}

interface StepServicesProps {
  providerTypes: string[];
  services: Service[];
  onServicesChange: (services: Service[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

export default function StepServices({
  providerTypes,
  services,
  onServicesChange,
  onNext,
  onBack
}: StepServicesProps) {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'custom'>('quickstart');
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customService, setCustomService] = useState<Partial<Service>>({
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    duration: 60,
    hasVariants: false,
    variants: [],
    isActive: true
  });

  // Fetch templates based on provider types
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // Get primary provider type (first one)
        const primaryType = providerTypes[0];
        if (!primaryType) return;

        // Fetch categories
        const catRes = await fetch(`${API_BASE_URL}/service-templates/categories?providerType=${encodeURIComponent(primaryType)}`);
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.categories);
          // Expand first category by default
          if (catData.categories.length > 0) {
            setExpandedCategories(new Set([catData.categories[0]]));
          }
        }

        // Fetch templates
        const templatesRes = await fetch(`${API_BASE_URL}/service-templates?providerType=${encodeURIComponent(primaryType)}`);
        const templatesData = await templatesRes.json();
        if (templatesData.success) {
          setTemplates(templatesData.templates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [providerTypes]);

  // Toggle template selection
  const toggleTemplate = (templateId: string) => {
    const newSelected = new Set(selectedTemplateIds);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
      // Set default price
      const template = templates.find(t => t._id === templateId);
      if (template && !customPrices[templateId]) {
        setCustomPrices(prev => ({
          ...prev,
          [templateId]: template.suggestedPriceMin
        }));
      }
    }
    setSelectedTemplateIds(newSelected);
  };

  // Update custom price for a template
  const updateCustomPrice = (templateId: string, price: number) => {
    setCustomPrices(prev => ({ ...prev, [templateId]: price }));
  };

  // Add selected templates as services
  const handleAddSelectedServices = () => {
    const newServices: Service[] = templates
      .filter(t => selectedTemplateIds.has(t._id))
      .map(template => {
        const customPrice = customPrices[template._id] || template.suggestedPriceMin;
        
        return {
          name: template.name,
          description: template.description,
          shortDescription: template.shortDescription,
          category: template.category,
          basePrice: customPrice,
          duration: template.suggestedDuration,
          hasVariants: (template.suggestedVariants?.length || 0) > 0,
          variants: template.suggestedVariants?.map(v => ({
            name: v.name,
            description: v.description,
            price: customPrice + v.priceModifier,
            duration: template.suggestedDuration + v.durationModifier,
            isDefault: false
          })) || [],
          isActive: true
        };
      });

    onServicesChange([...services, ...newServices]);
    setSelectedTemplateIds(new Set());
    setCustomPrices({});
  };

  // Add custom service
  const handleAddCustomService = () => {
    if (!customService.name || !customService.category || !customService.basePrice) {
      return;
    }

    const newService: Service = {
      name: customService.name || '',
      description: customService.description || '',
      shortDescription: (customService.description || '').substring(0, 100),
      category: customService.category || '',
      basePrice: customService.basePrice || 0,
      duration: customService.duration || 60,
      hasVariants: false,
      variants: [],
      isActive: true
    };

    onServicesChange([...services, newService]);
    setCustomService({
      name: '',
      description: '',
      category: '',
      basePrice: 0,
      duration: 60,
      hasVariants: false,
      variants: [],
      isActive: true
    });
    setShowCustomForm(false);
  };

  // Remove service
  const removeService = (index: number) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    onServicesChange(newServices);
  };

  // Filter templates by search
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group templates by category
  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredTemplates.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, ServiceTemplate[]>);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Popular templates (for Quick Start)
  const popularTemplates = templates.filter(t => t.isPopular);

  const canProceed = services.length >= 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Services</h2>
        <p className="text-gray-600 mt-1">
          Add services you offer. You can customize pricing and add more later.
        </p>
      </div>

      {/* Added Services Summary */}
      {services.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800">
              ✓ {services.length} service{services.length > 1 ? 's' : ''} added
            </h3>
          </div>
          <div className="space-y-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-100"
              >
                <div>
                  <span className="font-medium">{service.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {service.duration} min • ${service.basePrice}
                  </span>
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {service.category}
                  </span>
                </div>
                <button
                  onClick={() => removeService(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('quickstart')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'quickstart'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Quick Start
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'custom'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Browse All / Custom
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <span className="ml-3 text-gray-600">Loading services...</span>
        </div>
      ) : (
        <>
          {/* Quick Start Tab */}
          {activeTab === 'quickstart' && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-1">
                  🚀 Quick Start
                </h3>
                <p className="text-blue-700 text-sm">
                  Select popular services for {providerTypes[0]} providers. Customize prices, then add with one click.
                </p>
              </div>

              {popularTemplates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No popular templates available. Try the "Browse All" tab.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {popularTemplates.map(template => (
                      <div
                        key={template._id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplateIds.has(template._id)
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => toggleTemplate(template._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 mt-0.5 ${
                                selectedTemplateIds.has(template._id)
                                  ? 'bg-teal-500 border-teal-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedTemplateIds.has(template._id) && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-gray-500 text-sm mt-0.5">
                                {template.suggestedDuration} min • {template.shortDescription}
                              </p>
                              <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {template.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right" onClick={e => e.stopPropagation()}>
                            <label className="text-xs text-gray-500 block mb-1">Your Price</label>
                            <div className="flex items-center">
                              <span className="text-gray-400 mr-1">$</span>
                              <input
                                type="number"
                                value={customPrices[template._id] || template.suggestedPriceMin}
                                onChange={e => updateCustomPrice(template._id, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                                min={0}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Suggested: ${template.suggestedPriceMin}-${template.suggestedPriceMax}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTemplateIds.size > 0 && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleAddSelectedServices}
                        className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Add {selectedTemplateIds.size} Selected Service{selectedTemplateIds.size > 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Browse All / Custom Tab */}
          {activeTab === 'custom' && (
            <div>
              {/* Search */}
              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Categories Accordion */}
              <div className="space-y-3 mb-6">
                {categories.map(category => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-700">{category}</span>
                      <div className="flex items-center">
                        <span className="text-gray-500 text-sm mr-2">
                          {templatesByCategory[category]?.length || 0} services
                        </span>
                        {expandedCategories.has(category) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedCategories.has(category) && (
                      <div className="p-4 space-y-3">
                        {templatesByCategory[category]?.length === 0 ? (
                          <p className="text-gray-500 text-sm">No services in this category</p>
                        ) : (
                          templatesByCategory[category]?.map(template => (
                            <div
                              key={template._id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedTemplateIds.has(template._id)
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleTemplate(template._id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                                      selectedTemplateIds.has(template._id)
                                        ? 'bg-teal-500 border-teal-500'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {selectedTemplateIds.has(template._id) && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-medium">{template.name}</span>
                                    <span className="text-gray-500 text-sm ml-2">
                                      {template.suggestedDuration} min
                                    </span>
                                  </div>
                                </div>
                                <span className="text-gray-600">
                                  ${template.suggestedPriceMin}-${template.suggestedPriceMax}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedTemplateIds.size > 0 && (
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={handleAddSelectedServices}
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Add {selectedTemplateIds.size} Selected Service{selectedTemplateIds.size > 1 ? 's' : ''}
                  </button>
                </div>
              )}

              {/* Custom Service Form */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Custom Service
                </button>

                {showCustomForm && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">New Custom Service</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          value={customService.name}
                          onChange={e => setCustomService({ ...customService, name: e.target.value })}
                          placeholder="e.g., Deep Tissue Massage"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={customService.category}
                          onChange={e => setCustomService({ ...customService, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes) *
                        </label>
                        <input
                          type="number"
                          value={customService.duration}
                          onChange={e => setCustomService({ ...customService, duration: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          min={5}
                          step={5}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price ($) *
                        </label>
                        <input
                          type="number"
                          value={customService.basePrice}
                          onChange={e => setCustomService({ ...customService, basePrice: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          min={0}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={customService.description}
                          onChange={e => setCustomService({ ...customService, description: e.target.value })}
                          placeholder="Describe what this service includes..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        onClick={() => setShowCustomForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCustomService}
                        disabled={!customService.name || !customService.category || !customService.basePrice}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add Service
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="text-sm text-gray-500">
          {services.length === 0
            ? 'Add at least 1 service to continue'
            : `${services.length} service${services.length > 1 ? 's' : ''} added`}
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-lg ${
            canProceed
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
