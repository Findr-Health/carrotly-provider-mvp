const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

// Search API
export const searchBusiness = async (businessName: string, zipCode?: string) => {
  try {
    const response = await fetch(`${API_URL}/search/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, zipCode })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Search failed');
    }
    return response.json();
  } catch (error: any) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string) => {
  try {
    const response = await fetch(`${API_URL}/search/place/${placeId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch place details');
    }
    return response.json();
  } catch (error: any) {
    console.error('Place details error:', error);
    throw error;
  }
};

// Verification API
export interface SendCodeResponse {
  success: boolean;
  message?: string;
  expiresAt?: string;
  error?: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message?: string;
  error?: string;
  attemptsRemaining?: number;
}

export const sendVerificationCode = async (
  providerId: string, 
  email: string
): Promise<SendCodeResponse> => {
  try {
    const response = await fetch(`${API_URL}/verification/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, email })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification code');
    }
    return data;
  } catch (error: any) {
    console.error('Send code error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const verifyCode = async (
  providerId: string, 
  code: string
): Promise<VerifyCodeResponse> => {
  try {
    const response = await fetch(`${API_URL}/verification/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, code })
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error,
        attemptsRemaining: data.attemptsRemaining
      };
    }
    return data;
  } catch (error: any) {
    console.error('Verify code error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Provider submission
export const submitProviderProfile = async (profileData: any) => {
  try {
    const response = await fetch(`${API_URL}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit profile');
    }
    return response.json();
  } catch (error: any) {
    console.error('Submit profile error:', error);
    throw error;
  }
};

// Provider profile API (for returning providers)
export const getProviderProfile = async (providerId: string) => {
  try {
    const response = await fetch(`${API_URL}/providers/${providerId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }
    return response.json();
  } catch (error: any) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const updateProviderProfile = async (providerId: string, profileData: any) => {
  try {
    const response = await fetch(`${API_URL}/providers/${providerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    return response.json();
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw error;
  }
};
