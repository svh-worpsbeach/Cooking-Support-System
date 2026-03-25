import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Location, LocationCreate } from '../types';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Location[]>('/locations');
      setLocations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch locations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const createLocation = async (data: LocationCreate) => {
    const response = await api.post<Location>('/locations', data);
    setLocations([...locations, response.data]);
    return response.data;
  };

  const updateLocation = async (id: number, data: Partial<LocationCreate>) => {
    const response = await api.put<Location>(`/locations/${id}`, data);
    setLocations(locations.map(l => l.id === id ? response.data : l));
    return response.data;
  };

  const deleteLocation = async (id: number) => {
    await api.delete(`/locations/${id}`);
    setLocations(locations.filter(l => l.id !== id));
  };

  return {
    locations,
    isLoading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    refetch: fetchLocations,
  };
}

export function useLocation(id: number) {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Location>(`/locations/${id}`);
        setLocation(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch location');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  return { location, isLoading, error };
}

// Made with Bob