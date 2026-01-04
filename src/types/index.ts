export interface Provider {
  _id?: string;
  id?: string;
  
  // Step 1: Basics
  practiceName: string;
  providerTypes: string[];
  phone?: string;
  email?: string;
  
  // Contact Info
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  
  // Step 2: Location
  address?: {
    street?: string;
    suite?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  website?: string;
  
  // Description
  description?: string;
  
  // Step 3: Photos
  photos?: Array<{
    url: string;
    isPrimary?: boolean;
    caption?: string;
  }>;
  
  // Step 4: Services
  services?: Array<{
    _id?: string;
    id?: string;
    name: string;
    category?: string;
    description?: string;
    shortDescription?: string;
    duration?: number;
    price?: number;
    basePrice?: number;
    hasVariants?: boolean;
    variants?: Array<{
      name: string;
      description?: string;
      price: number;
      duration?: number;
      isDefault?: boolean;
    }>;
    isActive?: boolean;
    sortOrder?: number;
  }>;
  
  // Step 5: Credentials
  credentials?: {
    licenseNumber?: string;
    licenseState?: string;
    licenseExpiry?: string;
    npiNumber?: string;
    yearsExperience?: string;
    education?: string;
    certifications?: string;
    insuranceAccepted?: string;
  };
  
  // Team Members
  teamMembers?: Array<{
    _id?: string;
    id?: string;
    name: string;
    title?: string;
    bio?: string;
    photo?: string;
    serviceIds?: string[];
    rating?: number;
    reviewCount?: number;
    acceptsBookings?: boolean;
  }>;
  
  // Calendar
  calendar?: {
    provider?: string;
    calendarId?: string;
    businessHours?: {
      monday?: { enabled?: boolean; start?: string; end?: string };
      tuesday?: { enabled?: boolean; start?: string; end?: string };
      wednesday?: { enabled?: boolean; start?: string; end?: string };
      thursday?: { enabled?: boolean; start?: string; end?: string };
      friday?: { enabled?: boolean; start?: string; end?: string };
      saturday?: { enabled?: boolean; start?: string; end?: string };
      sunday?: { enabled?: boolean; start?: string; end?: string };
    };
  };
  
  // Cancellation Policy
  cancellationPolicy?: {
    tier?: 'standard' | 'moderate';
    allowFeeWaiver?: boolean;
  };
  
  // Step 7: Agreement
  agreement?: {
    initials?: Record<number, string>;
    signature?: string;
    title?: string;
    agreedDate?: string;
    ipAddress?: string;
    version?: string;
  };
  
  // Metadata
  createdAt?: string;
  completedAt?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  
  // Stats
  rating?: number;
  reviewCount?: number;
}

export interface Service {
  _id?: string;
  id?: string;
  name: string;
  duration?: number;
  price?: number;
  category?: string;
  description?: string;
}

export interface TeamMember {
  _id?: string;
  id?: string;
  name: string;
  title?: string;
  bio?: string;
  photo?: string;
  serviceIds?: string[];
}

export interface ProviderType {
  value: string;
  label: string;
  icon: string;
  serviceCategories: string[];
}

export interface ProviderStats {
  views: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  bookings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  rating: number;
  reviewCount: number;
  revenue: {
    thisMonth: number;
  };
}

export interface Booking {
  id: string;
  patientName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  duration: number;
}

export interface Review {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  patientName: string;
  date: string;
  verified: boolean;
}
