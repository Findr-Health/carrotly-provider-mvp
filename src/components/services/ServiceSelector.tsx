// components/services/ServiceSelector.tsx
// Main service selection component - works in both onboarding and profile editing
// Features: Tabbed multi-type support, Quick Start templates, custom services, variants

import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Sparkles,
  X,
  Clock,
  DollarSign,
  Edit2
} from 'lucide-react';
import { useServiceTemplates } from '../../hooks/useServiceTemplates';
import { 
  Service, 
  ServiceTemplate, 
  ServiceVariant,
  templateToService,
  formatServicePrice 
} from '../../types/services';
import { 
  getProviderTypeInfo, 
  getCategoryIcon,
  normalizeProviderTypes 
} from '../../constants/providerTypes';

interface ServiceSelectorProps {
  providerTypes: string[];
  selectedServices: Service[];
  onServicesChange: (services: Service[]) => void;
  mode?: 'onboarding' | 'editing';
}

export default function ServiceSelector({
  providerTypes,
  selectedServices,
  onServicesChange,
  mode = 'onboarding'
}: ServiceSelectorProps) {
  // Normalize provider types for API calls
  const normalizedTypes = normalizeProviderTypes(providerTypes);
  
  // Template fetching hook
  const {
    templates,
    popularTemplates,
    categories,
    loading,
    error,
    activeProviderType,
    setActiveProviderType
  } = useServiceTemplates({ providerTypes: normalizedTypes });

  // Local state
  const [activeTab, setActiveTab] = useState<'quickstart' | 'browse' | 'custom'>('quickstart');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [customDescriptions, setCustomDescriptions] = useState<Record<string, string>>({});
  const [customDurations, setCustomDurations] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Custom service form state
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
  const [customVariants, setCustomVariants] = useState<ServiceVariant[]>([]);

  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ description: string; basePrice: number; duration: number }>({ description: "", basePrice: 0, duration: 60 });

  // Filter templates by search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const query = searchQuery.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  // Group filtered templates by category
  const groupedTemplates = useMemo(() => {
    return categories.reduce((acc, category) => {
      const categoryTemplates = filteredTemplates.filter(t => t.category === category);
      if (categoryTemplates.length > 0) {
        acc[category] = categoryTemplates;
      }
      return acc;
    }, {} as Record<string, ServiceTemplate[]>);
  }, [categories, filteredTemplates]);

  // Check if a service with this name already exists
  const serviceExists = (name: string): boolean => {
    return selectedServices.some(s => s.name.toLowerCase() === name.toLowerCase());
  };

  // Toggle template selection
  const toggleTemplate = (template: ServiceTemplate) => {
    if (serviceExists(template.name)) return;

    const newSelected = new Set(selectedTemplateIds);
    if (newSelected.has(template._id)) {
      newSelected.delete(template._id);
    } else {
      newSelected.add(template._id);
      // Set default price if not already set
      if (!customPrices[template._id]) {
        setCustomPrices(prev => ({
          ...prev,
          [template._id]: template.suggestedPriceMin
        }));
      }
    }
    setSelectedTemplateIds(newSelected);
  };

  // Update custom price for a template
  const updateTemplatePrice = (templateId: string, price: number) => {
    setCustomPrices(prev => ({ ...prev, [templateId]: price }));
  };

  const updateTemplateDescription = (templateId: string, description: string) => {
    setCustomDescriptions(prev => ({ ...prev, [templateId]: description }));
  };

  const updateTemplateDuration = (templateId: string, duration: number) => {
    setCustomDurations(prev => ({ ...prev, [templateId]: duration }));
  };
  // Add selected templates as services
  const handleAddSelectedTemplates = () => {
    const newServices = templates
      .filter(t => selectedTemplateIds.has(t._id))
      .map(template => {
        const service = templateToService(template, customPrices[template._id]);
        if (customDescriptions[template._id]) {
          service.description = customDescriptions[template._id];
        }
        if (customDurations[template._id]) {
          service.duration = customDurations[template._id];
        }
        return service;
      });

    onServicesChange([...selectedServices, ...newServices]);
    setSelectedTemplateIds(new Set());
    setCustomPrices({});
    setCustomDescriptions({});
    setCustomDurations({});
  };

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

  // Add variant to custom service
  const addCustomVariant = () => {
    setCustomVariants([
      ...customVariants,
      {
        name: '',
        price: customService.basePrice || 0,
        duration: customService.duration || 60,
        isDefault: customVariants.length === 0
      }
    ]);
  };

  // Update variant
  const updateVariant = (index: number, field: keyof ServiceVariant, value: any) => {
    const updated = [...customVariants];
    updated[index] = { ...updated[index], [field]: value };
    setCustomVariants(updated);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    setCustomVariants(customVariants.filter((_, i) => i !== index));
  };

  // Add custom service
  const handleAddCustomService = () => {
    if (!customService.name?.trim() || !customService.category) {
      return;
    }

    const newService: Service = {
      name: customService.name.trim(),
      description: customService.description || '',
      shortDescription: (customService.description || '').substring(0, 100),
      category: customService.category,
      basePrice: customService.basePrice || 0,
      duration: customService.duration || 60,
      hasVariants: customVariants.length > 0,
      variants: customVariants,
      isActive: true
    };

    onServicesChange([...selectedServices, newService]);
    
    // Reset form
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
    setCustomVariants([]);
    setShowCustomForm(false);
  };

  // Remove a service
  const removeService = (index: number) => {
    const updated = [...selectedServices];
    updated.splice(index, 1);
    onServicesChange(updated);
  };

  // Start editing a service
  const startEdit = (index: number) => {
    const service = selectedServices[index];
    setEditingIndex(index);
    setEditForm({
      description: service.description || "",
      basePrice: service.basePrice || service.price || 0,
      duration: service.duration || 60
    });
  };

  // Save edits
  const saveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...selectedServices];
    updated[editingIndex] = {
      ...updated[editingIndex],
      description: editForm.description,
      basePrice: editForm.basePrice,
      duration: editForm.duration
    };
    onServicesChange(updated);
    setEditingIndex(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800">
              ✓ {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} added
            </h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedServices.map((service, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-lg border border-green-100"
              >
                {editingIndex === index ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg"></span>
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
                        <input
                          type="number"
                          value={editForm.duration === 0 ? "" : editForm.duration}
                          onChange={(e) => setEditForm({ ...editForm, duration: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min={5}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Price ($)</label>
                        <input
                          type="number"
                          value={editForm.basePrice === 0 ? "" : editForm.basePrice}
                          onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min={0}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        rows={2}
                        placeholder="Service description..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={saveEdit} className="px-3 py-1 bg-teal-500 text-white text-sm rounded hover:bg-teal-600">
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg"></span>
                      <div>
                        <span className="font-medium text-gray-900">{service.name}</span>
                        <div className="text-sm text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {service.duration} min
                          <span className="mx-2">•</span>
                          <DollarSign className="w-3 h-3 inline" />
                          {service.basePrice || service.price}
                        </div>
                        {service.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{service.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => startEdit(index)}
                        className="text-gray-400 hover:text-teal-600 p-1"
                        title="Edit service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button type="button"
                        onClick={() => removeService(index)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Remove service"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Type Tabs (if multiple types selected) */}
      {normalizedTypes.length > 1 && (
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          {normalizedTypes.map(type => {
            const typeInfo = getProviderTypeInfo(type);
            const isActive = activeProviderType === type;
            return (
              <button type="button"
                key={type}
                onClick={() => setActiveProviderType(type)}
                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{typeInfo.icon}</span>
                {typeInfo.label}
              </button>
            );
          })}
        </div>
      )}

      {/* View Tabs */}
      <div className="flex border-b border-gray-200">
        <button type="button"
          onClick={() => setActiveTab('quickstart')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'quickstart'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Quick Start
        </button>
        <button type="button"
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'browse'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="w-4 h-4" />
          Browse All
        </button>
        <button type="button"
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'custom'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          Custom Service
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <span className="ml-3 text-gray-600">Loading services...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Quick Start Tab */}
      {!loading && activeTab === 'quickstart' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-1">Quick Start</h3>
            <p className="text-blue-700 text-sm">
              Popular services for {getProviderTypeInfo(activeProviderType || '').label} providers. 
              Customize prices and add with one click.
            </p>
          </div>

          {popularTemplates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No popular templates available. Try the "Browse All" tab.
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {popularTemplates.map(template => {
                  const alreadyAdded = serviceExists(template.name);
                  const isSelected = selectedTemplateIds.has(template._id);

                  return (
                    <div
                      key={template._id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        alreadyAdded
                          ? 'border-green-300 bg-green-50 cursor-default'
                          : isSelected
                          ? 'border-teal-500 bg-teal-50 cursor-pointer'
                          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                      onClick={() => !alreadyAdded && toggleTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              alreadyAdded
                                ? "bg-green-500 border-green-500"
                                : isSelected
                                ? "bg-teal-500 border-teal-500"
                                : "border-gray-300"
                            }`}
                          >
                            {(isSelected || alreadyAdded) && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              {alreadyAdded && (
                                <span className="text-xs text-green-600 font-medium">✓ Added</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm mt-0.5">
                              {template.shortDescription}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {template.category}
                              </span>
                              {template.suggestedVariants && template.suggestedVariants.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                  {template.suggestedVariants.length} pricing options
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        
                        {/* Duration & Price Inputs */}
                        <div className="flex gap-4" onClick={e => e.stopPropagation()}>
                          <div className="text-right">
                            <label className="text-xs text-gray-500 block mb-1">Duration</label>
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={customDurations[template._id] === 0 ? "" : (customDurations[template._id] ?? template.suggestedDuration)}
                                onChange={e => updateTemplateDuration(template._id, e.target.value === "" ? 0 : parseInt(e.target.value))}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                min={5}
                                disabled={alreadyAdded}
                              />
                              <span className="text-gray-400 ml-1 text-sm">min</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <label className="text-xs text-gray-500 block mb-1">Price</label>
                            <div className="flex items-center">
                              <span className="text-gray-400 mr-1">$</span>
                              <input
                                type="number"
                                value={customPrices[template._id] === 0 ? "" : (customPrices[template._id] ?? template.suggestedPriceMin)}
                                onChange={e => updateTemplatePrice(template._id, e.target.value === "" ? 0 : parseInt(e.target.value))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                min={0}
                                disabled={alreadyAdded}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Suggested: ${template.suggestedPriceMin}-${template.suggestedPriceMax}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description Input - shows when selected */}
                      {isSelected && (
                        <div className="mt-3" onClick={e => e.stopPropagation()}>
                          <label className="text-xs text-gray-500 block mb-1">Description (optional)</label>
                          <textarea
                            value={customDescriptions[template._id] ?? template.description}
                            onChange={e => updateTemplateDescription(template._id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            rows={2}
                            placeholder="Customize the service description..."
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedTemplateIds.size > 0 && (
                <div className="mt-6 flex justify-end">
                  <button type="button"
                    onClick={handleAddSelectedTemplates}
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                  >
                    Add {selectedTemplateIds.size} Selected Service{selectedTemplateIds.size !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Browse All Tab */}
      {!loading && activeTab === 'browse' && (
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
          <div className="space-y-3">
            {Object.keys(groupedTemplates).map(category => (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                <button type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    
                    {category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">
                      {groupedTemplates[category].length} services
                    </span>
                    {expandedCategories.has(category) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedCategories.has(category) && (
                  <div className="p-4 space-y-2">
                    {groupedTemplates[category].map(template => {
                      const alreadyAdded = serviceExists(template.name);
                      const isSelected = selectedTemplateIds.has(template._id);

                      return (
                        <div
                          key={template._id}
                          className={`p-3 rounded-lg border transition-all ${
                            alreadyAdded
                              ? 'border-green-300 bg-green-50 cursor-default'
                              : isSelected
                              ? 'border-teal-500 bg-teal-50 cursor-pointer'
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                          }`}
                          onClick={() => !alreadyAdded && toggleTemplate(template)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-teal-500 border-teal-500'
                                    : 'border-gray-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">{template.name}</span>
                                {alreadyAdded && (
                                  <span className="text-xs text-gray-500 ml-2">✓ Added</span>
                                )}
                                <p className="text-sm text-gray-500">
                                  {template.suggestedDuration} min
                                </p>
                              </div>
                            </div>
                            <span className="text-gray-600">
                              ${template.suggestedPriceMin}-${template.suggestedPriceMax}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedTemplateIds.size > 0 && (
            <div className="mt-6 flex justify-end">
              <button type="button"
                onClick={handleAddSelectedTemplates}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
              >
                Add {selectedTemplateIds.size} Selected Service{selectedTemplateIds.size !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom Service Tab */}
      {!loading && activeTab === 'custom' && (
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Create Custom Service</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={customService.name || ''}
                  onChange={e => setCustomService({ ...customService, name: e.target.value })}
                  placeholder="e.g., Deep Tissue Massage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={customService.category || ''}
                  onChange={e => setCustomService({ ...customService, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={customService.duration || ''}
                  onChange={e => setCustomService({ ...customService, duration: parseInt(e.target.value) || 0 })}
                  placeholder="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  min={5}
                  step={5}
                />
              </div>

              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price ($) *
                </label>
                <input
                  type="number"
                  value={customService.basePrice || ''}
                  onChange={e => setCustomService({ ...customService, basePrice: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  min={0}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={customService.description || ''}
                  onChange={e => setCustomService({ ...customService, description: e.target.value })}
                  placeholder="Describe what this service includes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Variants Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="font-medium text-gray-900">Pricing Options (Optional)</h5>
                  <p className="text-sm text-gray-500">Add different pricing tiers for this service</p>
                </div>
                <button type="button"
                  onClick={addCustomVariant}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>

              {customVariants.length > 0 && (
                <div className="space-y-3">
                  {customVariants.map((variant, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={variant.name}
                            onChange={e => updateVariant(index, 'name', e.target.value)}
                            placeholder="Option name (e.g., 60 minutes)"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <span className="text-gray-400 text-sm mr-1">$</span>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={e => updateVariant(index, 'price', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={variant.duration}
                              onChange={e => updateVariant(index, 'duration', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                              min={5}
                            />
                            <span className="text-gray-400 text-sm ml-1">min</span>
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button type="button"
                            onClick={() => removeVariant(index)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Button */}
            <div className="mt-6 flex justify-end">
              <button type="button"
                onClick={handleAddCustomService}
                disabled={!customService.name?.trim() || !customService.category || !customService.basePrice}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Add Custom Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
