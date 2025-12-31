import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

export interface SearchResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photoReference?: string;
}

export interface PlaceDetails {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: {
    weekday_text: string[];
    open_now: boolean;
  };
  types?: string[];
}

export const searchBusiness = async (businessName: string, zipCode?: string): Promise<{
  results: SearchResult[];
  autoSelected: boolean;
}> => {
  try {
    const response = await axios.post(`${API_URL}/api/search/business`, {
      businessName,
      zipCode
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  try {
    const response = await axios.get(`${API_URL}/api/google/place/${placeId}`);
    return response.data.place;
  } catch (error) {
    console.error('Place details error:', error);
    throw error;
  }
};
