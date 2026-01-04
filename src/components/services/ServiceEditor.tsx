// components/services/ServiceEditor.tsx
// Modal for editing a single service with variants support
// Used in both onboarding and dashboard

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { Service, ServiceVariant } from '../../types/services';
import { getCategoryIcon } from '../../constants/providerTypes';

interface ServiceEditorProps {
  service: Service;
  categories: string[];
  onSave: (service: Service) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function ServiceEditor({
  service,
  categories,
  onSave,
  onCancel,
  onDelete
}: ServiceEditorProps) {
  // Form state
  const [formData, setFormData] = useState<Service>({
    ...service,
    variants: service.variants || []
  });

  // Update form when service changes
  useEffect(() => {
    setFormData({
      ...service,
      variants: service.variants || []
    });
  }, [service]);

  // Update field
  const updateField = <K extends keyof Service>(field: K, value: Service[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add variant
  const addVariant = () => {
    const newVariant: ServiceVariant = {
      name: '',
      price: formData.basePrice || 0,
      duration: formData.duration || 60,
      isDefault: formData.variants.length === 0
    };
    updateField('variants', [...formData.variants, newVariant]);
    updateField('hasVariants', true);
  };

  // Update variant
  const updateVariant = (index: number, field: keyof ServiceVariant, value: any) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: value };
    updateField('variants', updated);
  };

  // Set variant as default
  const setDefaultVariant = (index: number) => {
    const updated = formData.variants.map((v, i) => ({
      ...v,
      isDefault: i === index
    }));
    updateField('variants', updated);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    const updated = formData.variants.filter((_, i) => i !== index);
    updateField('variants', updated);
    if (updated.length === 0) {
      updateField('hasVariants', false);
    }
  };

  // Handle save
  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Service name is required');
      return;
    }
    if (!formData.category) {
      alert('Category is required');
      return;
    }
    if (!formData.basePrice || formData.basePrice <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    onSave({
      ...formData,
      shortDescription: formData.description?.substring(0, 100) || ''
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this service?')) {
      onDelete?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Edit Service</h3>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => updateField('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => updateField('isActive', !formData.isActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isActive ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={e => updateField('duration', parseInt(e.target.value) || 0)}
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
                value={formData.basePrice}
                onChange={e => updateField('basePrice', parseFloat(e.target.value) || 0)}
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
                value={formData.description || ''}
                onChange={e => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Describe what this service includes..."
              />
            </div>
          </div>

          {/* Variants Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">Pricing Options</h4>
                <p className="text-sm text-gray-500">
                  Add different pricing tiers for this service
                </p>
              </div>
              <button
                onClick={addVariant}
                className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            </div>

            {formData.variants.length > 0 ? (
              <div className="space-y-3">
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-300 cursor-grab mt-1" />
                      
                      <div className="flex-1 grid grid-cols-12 gap-3">
                        {/* Variant Name */}
                        <div className="col-span-12 md:col-span-5">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Option Name
                          </label>
                          <input
                            type="text"
                            value={variant.name}
                            onChange={e => updateVariant(index, 'name', e.target.value)}
                            placeholder="e.g., 60 minutes"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        {/* Price */}
                        <div className="col-span-6 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={e => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                            min={0}
                          />
                        </div>

                        {/* Duration */}
                        <div className="col-span-6 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Duration
                          </label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={variant.duration}
                              onChange={e => updateVariant(index, 'duration', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                              min={5}
                            />
                            <span className="text-xs text-gray-500 ml-1">min</span>
                          </div>
                        </div>

                        {/* Default Checkbox */}
                        <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                          <button
                            onClick={() => removeVariant(index)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                            title="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Description & Default Toggle */}
                    <div className="mt-3 ml-8 flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          checked={variant.isDefault}
                          onChange={() => setDefaultVariant(index)}
                          className="w-4 h-4 text-teal-600"
                        />
                        <span className="text-gray-600">Default option</span>
                      </label>
                    </div>

                    {/* Variant Description */}
                    <div className="mt-2 ml-8">
                      <input
                        type="text"
                        value={variant.description || ''}
                        onChange={e => updateVariant(index, 'description', e.target.value)}
                        placeholder="Optional description for this option..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">
                  No pricing options added. The base price will be used.
                </p>
                <button
                  onClick={addVariant}
                  className="mt-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  + Add pricing option
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete Service
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
