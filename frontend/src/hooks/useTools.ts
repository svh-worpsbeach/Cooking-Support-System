import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CookingTool, CookingToolCreate, ToolWishlist, ToolWishlistCreate } from '../types';

export function useTools() {
  const [tools, setTools] = useState<CookingTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<CookingTool[]>('/tools');
      setTools(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tools');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const createTool = async (data: CookingToolCreate) => {
    const response = await api.post<CookingTool>('/tools', data);
    setTools([...tools, response.data]);
    return response.data;
  };

  const updateTool = async (id: number, data: Partial<CookingToolCreate>) => {
    const response = await api.put<CookingTool>(`/tools/${id}`, data);
    setTools(tools.map(t => t.id === id ? response.data : t));
    return response.data;
  };

  const deleteTool = async (id: number) => {
    await api.delete(`/tools/${id}`);
    setTools(tools.filter(t => t.id !== id));
  };

  return {
    tools,
    isLoading,
    error,
    createTool,
    updateTool,
    deleteTool,
    refetch: fetchTools,
  };
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<ToolWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ToolWishlist[]>('/tools/wishlist');
      setWishlist(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch wishlist');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const createWishlistItem = async (data: ToolWishlistCreate) => {
    const response = await api.post<ToolWishlist>('/tools/wishlist', data);
    setWishlist([...wishlist, response.data]);
    return response.data;
  };

  const deleteWishlistItem = async (id: number) => {
    await api.delete(`/tools/wishlist/${id}`);
    setWishlist(wishlist.filter(w => w.id !== id));
  };

  return {
    wishlist,
    isLoading,
    error,
    createWishlistItem,
    deleteWishlistItem,
    refetch: fetchWishlist,
  };
}

export function useTool(id: number) {
  const [tool, setTool] = useState<CookingTool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<CookingTool>(`/tools/${id}`);
        setTool(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tool');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  return { tool, isLoading, error };
}

// Made with Bob