import { useState, useEffect } from 'react';
import { Provider } from '../types';

const STORAGE_KEY = 'findr_provider';
const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

export const useProviderData = () => {
  const [provider, setProvider] = useState<Partial<Provider> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProvider = async (providerId: string) => {
    try {
      setLoading(true);
      const response = await fetch(API_URL + '/providers/' + providerId);
      if (!response.ok) {
        throw new Error('Failed to fetch provider');
      }
      const data = await response.json();
      setProvider(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem('providerId', providerId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProvider = async () => {
      const providerId = localStorage.getItem('providerId');
      if (providerId) {
        await fetchProvider(providerId);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setProvider(parsed);
            if (parsed._id) {
              await fetchProvider(parsed._id);
            }
          } catch (e) {
            console.error('Error parsing stored provider data:', e);
          }
        }
        setLoading(false);
      }
    };
    loadProvider();
  }, []);

  const updateProvider = async (data: Partial<Provider>) => {
    const providerId = localStorage.getItem('providerId') || provider?._id;
    if (!providerId) {
      const updated = { ...provider, ...data };
      setProvider(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    try {
      setLoading(true);
      const response = await fetch(API_URL + '/providers/' + providerId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update provider');
      }
      const updated = await response.json();
      setProvider(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshProvider = async () => {
    const providerId = localStorage.getItem('providerId') || provider?._id;
    if (providerId) {
      return await fetchProvider(providerId);
    }
    return null;
  };

  const clearProvider = () => {
    setProvider(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('providerId');
  };

  return { provider, loading, error, updateProvider, refreshProvider, clearProvider, fetchProvider };
};
