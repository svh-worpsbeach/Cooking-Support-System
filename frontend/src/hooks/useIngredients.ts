import { useState, useEffect } from 'react';
import type { Ingredient, IngredientCreate } from '../types';
import api from '../services/api';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Ingredient[]>('/ingredients');
      setIngredients(response.data);
    } catch (err) {
      setError('Failed to fetch ingredients');
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const searchIngredients = async (query: string): Promise<Ingredient[]> => {
    try {
      const response = await api.get<Ingredient[]>('/ingredients/search', {
        params: { q: query, limit: 20 }
      });
      return response.data;
    } catch (err) {
      console.error('Error searching ingredients:', err);
      return [];
    }
  };

  const getIngredient = async (id: number): Promise<Ingredient | null> => {
    try {
      const response = await api.get<Ingredient>(`/ingredients/${id}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching ingredient:', err);
      return null;
    }
  };

  const createIngredient = async (data: IngredientCreate): Promise<Ingredient | null> => {
    try {
      const response = await api.post<Ingredient>('/ingredients', data);
      await fetchIngredients();
      return response.data;
    } catch (err) {
      console.error('Error creating ingredient:', err);
      return null;
    }
  };

  const updateIngredient = async (
    id: number,
    data: Partial<IngredientCreate>
  ): Promise<boolean> => {
    try {
      await api.put(`/ingredients/${id}`, data);
      await fetchIngredients();
      return true;
    } catch (err) {
      console.error('Error updating ingredient:', err);
      return false;
    }
  };

  const deleteIngredient = async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/ingredients/${id}`);
      await fetchIngredients();
      return true;
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      return false;
    }
  };

  return {
    ingredients,
    loading,
    error,
    fetchIngredients,
    searchIngredients,
    getIngredient,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  };
};

// Made with Bob
