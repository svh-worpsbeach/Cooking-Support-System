import { useState, useEffect } from 'react';
import type {
  ShoppingList,
  ShoppingListCreate,
  ShoppingListFromEvent,
  ShoppingListFromRecipe
} from '../types';
import api from '../services/api';

export const useShoppingLists = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShoppingLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ShoppingList[]>('/shopping-lists/');
      setShoppingLists(response.data);
    } catch (err) {
      setError('Failed to fetch shopping lists');
      console.error('Error fetching shopping lists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const getShoppingList = async (id: number): Promise<ShoppingList | null> => {
    try {
      const response = await api.get<ShoppingList>(`/shopping-lists/${id}/`);
      return response.data;
    } catch (err) {
      console.error('Error fetching shopping list:', err);
      return null;
    }
  };

  const createShoppingList = async (data: ShoppingListCreate): Promise<ShoppingList | null> => {
    try {
      const response = await api.post<ShoppingList>('/shopping-lists/', data);
      await fetchShoppingLists();
      return response.data;
    } catch (err) {
      console.error('Error creating shopping list:', err);
      return null;
    }
  };

  const createFromEvent = async (
    eventId: number, 
    data: ShoppingListFromEvent = {}
  ): Promise<ShoppingList | null> => {
    try {
      const response = await api.post<ShoppingList>(
        `/shopping-lists/from-event/${eventId}/`,
        data
      );
      await fetchShoppingLists();
      return response.data;
    } catch (err) {
      console.error('Error creating shopping list from event:', err);
      return null;
    }
  };

  const createFromRecipe = async (
    recipeId: number,
    data: ShoppingListFromRecipe = {}
  ): Promise<ShoppingList | null> => {
    try {
      const response = await api.post<ShoppingList>(
        `/shopping-lists/from-recipe/${recipeId}/`,
        data
      );
      await fetchShoppingLists();
      return response.data;
    } catch (err) {
      console.error('Error creating shopping list from recipe:', err);
      return null;
    }
  };

  const updateShoppingList = async (
    id: number,
    data: Partial<ShoppingListCreate>
  ): Promise<boolean> => {
    try {
      await api.put(`/shopping-lists/${id}/`, data);
      await fetchShoppingLists();
      return true;
    } catch (err) {
      console.error('Error updating shopping list:', err);
      return false;
    }
  };

  const deleteShoppingList = async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/shopping-lists/${id}/`);
      await fetchShoppingLists();
      return true;
    } catch (err) {
      console.error('Error deleting shopping list:', err);
      return false;
    }
  };

  const toggleItemChecked = async (
    listId: number,
    itemId: number,
    checked: number
  ): Promise<boolean> => {
    try {
      await api.put(`/shopping-lists/${listId}/items/${itemId}/`, { checked });
      return true;
    } catch (err) {
      console.error('Error toggling item:', err);
      return false;
    }
  };

  return {
    shoppingLists,
    loading,
    error,
    fetchShoppingLists,
    getShoppingList,
    createShoppingList,
    createFromEvent,
    createFromRecipe,
    updateShoppingList,
    deleteShoppingList,
    toggleItemChecked,
  };
};

// Made with Bob
