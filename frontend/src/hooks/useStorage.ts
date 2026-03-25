import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { StorageItem, StorageItemCreate } from '../types';

export function useStorage() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<StorageItem[]>('/storage');
      setItems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch storage items');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const createItem = async (data: StorageItemCreate) => {
    const response = await api.post<StorageItem>('/storage', data);
    setItems([...items, response.data]);
    return response.data;
  };

  const updateItem = async (id: number, data: Partial<StorageItemCreate>) => {
    const response = await api.put<StorageItem>(`/storage/${id}`, data);
    setItems(items.map(i => i.id === id ? response.data : i));
    return response.data;
  };

  const deleteItem = async (id: number) => {
    await api.delete(`/storage/${id}`);
    setItems(items.filter(i => i.id !== id));
  };

  return {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  };
}

export function useStorageItem(id: number) {
  const [item, setItem] = useState<StorageItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<StorageItem>(`/storage/${id}`);
        setItem(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch storage item');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  return { item, isLoading, error };
}

// Made with Bob