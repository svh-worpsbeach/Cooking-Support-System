import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Recipe, RecipeCreate } from '../types';

export interface RecipeFilters {
  search?: string;
  categories?: string[];
  ingredients?: string[];
  allowSubstitutes?: boolean;
  sortBy?: string;
}

export function useRecipes(filters?: RecipeFilters) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async (customFilters?: RecipeFilters) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      const activeFilters = customFilters || filters || {};
      
      if (activeFilters.search) {
        params.append('search', activeFilters.search);
      }
      if (activeFilters.categories && activeFilters.categories.length > 0) {
        activeFilters.categories.forEach(cat => params.append('categories', cat));
      }
      if (activeFilters.ingredients && activeFilters.ingredients.length > 0) {
        activeFilters.ingredients.forEach(ing => params.append('ingredients', ing));
      }
      if (activeFilters.allowSubstitutes !== undefined) {
        params.append('allow_substitutes', String(activeFilters.allowSubstitutes));
      }
      if (activeFilters.sortBy) {
        params.append('sort_by', activeFilters.sortBy);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/recipes?${queryString}` : '/recipes';
      
      const response = await api.get<Recipe[]>(url);
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const createRecipe = async (data: RecipeCreate) => {
    const response = await api.post<Recipe>('/recipes', data);
    setRecipes([...recipes, response.data]);
    return response.data;
  };

  const updateRecipe = async (id: number, data: Partial<RecipeCreate>) => {
    const response = await api.put<Recipe>(`/recipes/${id}`, data);
    setRecipes(recipes.map(r => r.id === id ? response.data : r));
    return response.data;
  };

  const deleteRecipe = async (id: number) => {
    await api.delete(`/recipes/${id}`);
    setRecipes(recipes.filter(r => r.id !== id));
  };

  return {
    recipes,
    isLoading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    refetch: fetchRecipes,
  };
}

export function useRecipe(id: number) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Recipe>(`/recipes/${id}`);
        setRecipe(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch recipe');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  return { recipe, isLoading, error };
}

// Made with Bob