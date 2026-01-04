// components/services/ServiceList.tsx
// Displays services grouped by category - used in Review step and Dashboard
// Features: Category accordion, edit/delete actions, toggle active

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Trash2, 
  Clock, 
  DollarSign,
  GripVertical,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  Service, 
  formatServicePrice,
  getServicePrice 
} from '../../types/services';
import { getCategoryIcon } from '../../constants/providerTypes';

interface ServiceListProps {
  services: Service[];
  editable?: boolean;
  showActions?: boolean;
  onEdit?: (service: Service, index: number) => void;
  onDelete?: (index: number) => void;
  onToggleActive?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export default function ServiceList({
  services,
  editable = false,
  showActions = true,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder
}: ServiceListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group services by category
  const groupedServices = services.reduce((acc, service, index) => {
    const category = service.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ service, originalIndex: index });
    return acc;
  }, {} as Record<string, { service: Service; originalIndex: number }[]>);

  const categories = Object.keys(groupedServices).sort();

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

  // Expand all by default if few categories
  React.useEffect(() => {
    if (categories.length <= 3) {
      setExpandedCategories(new Set(categories));
    }
  }, [services]);

  if (services.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <span className="text-4xl mb-2 block">💼</span>
        <p className="text-gray-500">No services added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const categoryServices = groupedServices[category];
        const isExpanded = expandedCategories.has(category);
        const activeCount = categoryServices.filter(s => s.service.isActive !== false).length;

        return (
          <div 
            key={category} 
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <span className="font-medium text-gray-700">{category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {activeCount}/{categoryServices.length} active
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Services in Category */}
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {categoryServices.map(({ service, originalIndex }) => (
                  <ServiceRow
                    key={originalIndex}
                    service={service}
                    index={originalIndex}
                    editable={editable}
                    showActions={showActions}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={onToggleActive}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">
          Total: {services.length} service{services.length !== 1 ? 's' : ''} in {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
        </span>
        <span className="text-sm font-medium text-gray-700">
          Price range: ${Math.min(...services.map(getServicePrice))} - ${Math.max(...services.map(getServicePrice))}
        </span>
      </div>
    </div>
  );
}

// ============================================
// ServiceRow Component
// ============================================
interface ServiceRowProps {
  service: Service;
  index: number;
  editable: boolean;
  showActions: boolean;
  onEdit?: (service: Service, index: number) => void;
  onDelete?: (index: number) => void;
  onToggleActive?: (index: number) => void;
}

function ServiceRow({
  service,
  index,
  editable,
  showActions,
  onEdit,
  onDelete,
  onToggleActive
}: ServiceRowProps) {
  const isActive = service.isActive !== false;

  return (
    <div 
      className={`p-4 hover:bg-gray-50 transition-colors ${
        !isActive ? 'opacity-50 bg-gray-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Service Info */}
        <div className="flex items-center gap-3 flex-1">
          {editable && (
            <GripVertical className="w-5 h-5 text-gray-300 cursor-grab flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{service.name}</span>
              {!isActive && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                  Inactive
                </span>
              )}
              {service.hasVariants && service.variants?.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                  {service.variants.length} options
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {service.duration} min
              </span>
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                {formatServicePrice(service)}
              </span>
            </div>
            {service.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {service.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && editable && (
          <div className="flex items-center gap-2 ml-4">
            {/* Toggle Active */}
            {onToggleActive && (
              <button
                onClick={() => onToggleActive(index)}
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={isActive ? 'Deactivate' : 'Activate'}
              >
                {isActive ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Edit */}
            {onEdit && (
              <button
                onClick={() => onEdit(service, index)}
                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Edit service"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this service?')) {
                    onDelete(index);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Variants (if expanded) */}
      {service.hasVariants && service.variants?.length > 0 && (
        <div className="mt-3 ml-8 pl-3 border-l-2 border-gray-200 space-y-1">
          {service.variants.map((variant, vIndex) => (
            <div key={vIndex} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {variant.name}
                {variant.isDefault && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </span>
              <span className="text-gray-500">
                {variant.duration} min • ${variant.price}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
