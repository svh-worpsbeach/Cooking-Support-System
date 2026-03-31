import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Guest, GuestCreate } from '../types';

export function useGuests(search?: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuests = async (searchTerm?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/guests?${queryString}` : '/guests';
      
      const response = await api.get<Guest[]>(url);
      setGuests(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch guests');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests(search);
  }, [search]);

  const createGuest = async (data: GuestCreate) => {
    const response = await api.post<Guest>('/guests', data);
    setGuests([...guests, response.data]);
    return response.data;
  };

  const updateGuest = async (id: number, data: Partial<GuestCreate>) => {
    const response = await api.put<Guest>(`/guests/${id}`, data);
    setGuests(guests.map(g => g.id === id ? response.data : g));
    return response.data;
  };

  const deleteGuest = async (id: number) => {
    await api.delete(`/guests/${id}`);
    setGuests(guests.filter(g => g.id !== id));
  };

  return {
    guests,
    isLoading,
    error,
    createGuest,
    updateGuest,
    deleteGuest,
    refetch: fetchGuests,
  };
}

export function useGuest(id: number) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Guest>(`/guests/${id}`);
        setGuest(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch guest');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuest();
  }, [id]);

  return { guest, isLoading, error };
}

// Made with Bob