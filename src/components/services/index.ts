// components/services/index.ts
// Export all service-related components

export { default as ServiceSelector } from './ServiceSelector';
export { default as ServiceList } from './ServiceList';
export { default as ServiceEditor } from './ServiceEditor';

// Re-export types for convenience
export type {
  Service,
  ServiceVariant,
  ServiceTemplate,
  ServiceSelectorProps,
  ServiceListProps,
  ServiceEditorProps
} from '../../types/services';
