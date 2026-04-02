import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecipe } from '../hooks/useRecipes';
import { useShoppingLists } from '../hooks/useShoppingLists';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecipeForm from '../components/recipes/RecipeForm';
import ImageCapture from '../components/common/ImageCapture';
import { calculateTotalTime, formatTimeForDisplay } from '../utils/timeUtils';
import type { RecipeCreate } from '../types';

interface EditIngredient {
  id?: number;
  name: string;
  description: string;
  amount: number;
  unit: string;
  order_index: number;
}

interface EditStep {
  id?: number;
  step_number: number;
  content: string;
  step_image_id?: number;
}

interface StepImageData {
  file?: File;
  url?: string;
  imageId?: number;
  action?: 'keep' | 'update' | 'delete' | 'detach';
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { recipe, isLoading, error } = useRecipe(Number(id));
  const { stepImageSize } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdvancedEditModalOpen, setIsAdvancedEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingShoppingList, setIsCreatingShoppingList] = useState(false);
  const { createFromRecipe } = useShoppingLists();

  // Simple edit form state (for basic fields only)
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    preparation_time: '',
    cooking_time: '',
  });

  // Ingredients and steps edit state
  const [editIngredients, setEditIngredients] = useState<EditIngredient[]>([]);
  const [editSteps, setEditSteps] = useState<EditStep[]>([]);
  
  // Image management state
  const [titleImageData, setTitleImageData] = useState<{ file?: File; url?: string; imageId?: number; action?: 'keep' | 'update' | 'delete' }>({ action: 'keep' });
  const [stepImages, setStepImages] = useState<Map<number, StepImageData>>(new Map());
  // const titleImageInputRef = useRef<HTMLInputElement>(null); // Currently unused

  const handleEditToggle = () => {
    if (!isEditMode && recipe) {
      // Entering edit mode - initialize form
      setEditData({
        name: recipe.name,
        description: recipe.description || '',
        preparation_time: recipe.preparation_time || '0:00',
        cooking_time: recipe.cooking_time || '0:00',
      });
      
      // Initialize ingredients
      setEditIngredients(
        recipe.ingredients?.map(ing => ({
          id: ing.id,
          name: ing.name,
          description: ing.description || '',
          amount: ing.amount || 0,
          unit: ing.unit || '',
          order_index: ing.order_index,
        })) || []
      );
      
      // Initialize steps
      setEditSteps(
        recipe.steps?.map(step => ({
          id: step.id,
          step_number: step.step_number,
          content: step.content,
          step_image_id: step.step_image_id,
        })) || []
      );
      
      // Initialize title image
      const titleImg = recipe.images?.find(img => img.id === recipe.title_image_id);
      if (titleImg) {
        setTitleImageData({
          url: `${import.meta.env.VITE_API_URL}${titleImg.filepath}`,
          imageId: titleImg.id,
          action: 'keep'
        });
      } else {
        setTitleImageData({ action: 'keep' });
      }
      
      // Initialize step images
      const newStepImages = new Map<number, StepImageData>();
      recipe.steps?.forEach((step, index) => {
        if (step.step_image_id) {
          const stepImg = recipe.images?.find(img => img.id === step.step_image_id);
          if (stepImg) {
            newStepImages.set(index, {
              url: `${import.meta.env.VITE_API_URL}${stepImg.filepath}`,
              imageId: stepImg.id,
              action: 'keep'
            });
          }
        }
      });
      setStepImages(newStepImages);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    if (!recipe) return;
    
    setIsSaving(true);
    try {
      // 1. Handle title image
      if (titleImageData.action === 'delete' && titleImageData.imageId) {
        await api.delete(`/recipes/${id}/images/${titleImageData.imageId}`);
      } else if (titleImageData.action === 'update' && titleImageData.file) {
        // Delete old if exists
        if (titleImageData.imageId) {
          await api.delete(`/recipes/${id}/images/${titleImageData.imageId}`);
        }
        // Upload new
        const formData = new FormData();
        formData.append('file', titleImageData.file);
        formData.append('is_process_image', 'false');
        await api.post(`/recipes/${id}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      // 2. Handle step images
      for (const [stepIndex, imageData] of stepImages.entries()) {
        const step = editSteps[stepIndex];
        if (!step) continue;
        
        if (imageData.action === 'delete' && imageData.imageId) {
          await api.delete(`/recipes/${id}/images/${imageData.imageId}`);
          step.step_image_id = undefined;
        } else if (imageData.action === 'detach') {
          step.step_image_id = undefined;
        } else if (imageData.action === 'update' && imageData.file) {
          // Delete old if exists
          if (imageData.imageId) {
            await api.delete(`/recipes/${id}/images/${imageData.imageId}`);
          }
          // Upload new
          const formData = new FormData();
          formData.append('file', imageData.file);
          formData.append('is_process_image', 'true');
          formData.append('order_index', stepIndex.toString());
          const response = await api.post(`/recipes/${id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          step.step_image_id = response.data.id;
        }
      }
      
      // 3. Update recipe data
      const fullData: RecipeCreate = {
        name: editData.name,
        description: editData.description,
        preparation_time: editData.preparation_time,
        cooking_time: editData.cooking_time,
        categories: recipe.categories?.map(c => c.category_name) || [],
        ingredients: editIngredients.map((ing, idx) => ({
          name: ing.name,
          description: ing.description,
          amount: ing.amount,
          unit: ing.unit,
          order_index: idx,
        })),
        steps: editSteps.map((step, idx) => ({
          step_number: idx + 1,
          content: step.content,
          step_image_id: step.step_image_id,
        })),
      };

      await api.put(`/recipes/${id}`, fullData);
      setIsEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update recipe:', err);
      alert(t('errors.saveFailed'));
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (recipe) {
      setEditData({
        name: recipe.name,
        description: recipe.description || '',
        preparation_time: recipe.preparation_time || '0:00',
        cooking_time: recipe.cooking_time || '0:00',
      });
      setEditIngredients([]);
      setEditSteps([]);
      setTitleImageData({ action: 'keep' });
      setStepImages(new Map());
    }
  };

  // Ingredient handlers
  const handleAddIngredient = () => {
    setEditIngredients([
      ...editIngredients,
      {
        name: '',
        description: '',
        amount: 0,
        unit: '',
        order_index: editIngredients.length,
      },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof EditIngredient, value: string | number) => {
    const updated = [...editIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setEditIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setEditIngredients(editIngredients.filter((_, i) => i !== index));
  };

  // Step handlers
  const handleAddStep = () => {
    setEditSteps([
      ...editSteps,
      {
        step_number: editSteps.length + 1,
        content: '',
      },
    ]);
  };

  const handleUpdateStep = (index: number, content: string) => {
    const updated = [...editSteps];
    updated[index] = { ...updated[index], content };
    setEditSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    // Remove step image data if exists
    const newStepImages = new Map(stepImages);
    newStepImages.delete(index);
    // Reindex remaining images
    const reindexedImages = new Map<number, StepImageData>();
    newStepImages.forEach((data, idx) => {
      if (idx > index) {
        reindexedImages.set(idx - 1, data);
      } else {
        reindexedImages.set(idx, data);
      }
    });
    setStepImages(reindexedImages);
    setEditSteps(editSteps.filter((_, i) => i !== index));
  };
  
  // Title image handlers - Currently unused, prepared for future implementation
  // const handleTitleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const url = URL.createObjectURL(file);
  //     setTitleImageData({ file, url, action: 'update', imageId: titleImageData.imageId });
  //   }
  // };
  
  // const handleTitleImageDelete = () => {
  //   if (titleImageData.url && titleImageData.file) {
  //     URL.revokeObjectURL(titleImageData.url);
  //   }
  //   setTitleImageData({ action: 'delete', imageId: titleImageData.imageId });
  // };
  
  // Step image handlers
  const handleStepImageCapture = (stepIndex: number, file: File) => {
    const url = URL.createObjectURL(file);
    const currentData = stepImages.get(stepIndex);
    setStepImages(new Map(stepImages.set(stepIndex, {
      file,
      url,
      action: 'update',
      imageId: currentData?.imageId
    })));
  };
  
  const handleStepImageDelete = (stepIndex: number) => {
    const imageData = stepImages.get(stepIndex);
    if (imageData?.url && imageData.file) {
      URL.revokeObjectURL(imageData.url);
    }
    if (imageData?.imageId) {
      setStepImages(new Map(stepImages.set(stepIndex, {
        action: 'delete',
        imageId: imageData.imageId
      })));
    } else {
      const newStepImages = new Map(stepImages);
      newStepImages.delete(stepIndex);
      setStepImages(newStepImages);
    }
  };
  
  const handleAdvancedEdit = async (data: RecipeCreate) => {
    try {
      await api.put(`/recipes/${id}`, data);
      setIsAdvancedEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update recipe:', err);
      alert('Failed to update recipe');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('recipes.deleteConfirm'))) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.delete(`/recipes/${id}`);
      navigate('/recipes');
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      alert(t('errors.deleteFailed'));
      setIsDeleting(false);
    }
  };

  const handleCreateShoppingList = async () => {
    if (!recipe) return;
    
    setIsCreatingShoppingList(true);
    try {
      const newList = await createFromRecipe(recipe.id);
      navigate(`/shopping-lists/${newList.id}`);
    } catch (err) {
      console.error('Failed to create shopping list:', err);
      alert(t('shoppingLists.createError'));
      setIsCreatingShoppingList(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || t('errors.loadFailed')}</p>
        <Button onClick={() => navigate('/recipes')}>{t('common.back')} {t('nav.recipes')}</Button>
      </div>
    );
  }

  const titleImage = recipe.images?.find(img => img.id === recipe.title_image_id);
  const imageUrl = titleImage
    ? `${import.meta.env.VITE_API_URL}${titleImage.filepath}`
    : null;

  // Prepare initial data for advanced edit form
  const initialFormData: Partial<RecipeCreate> = recipe ? {
    name: recipe.name,
    description: recipe.description,
    preparation_time: recipe.preparation_time,
    cooking_time: recipe.cooking_time,
    categories: recipe.categories?.map(c => c.category_name) || [],
    ingredients: recipe.ingredients?.map(ing => ({
      name: ing.name,
      description: ing.description,
      amount: ing.amount,
      unit: ing.unit,
      order_index: ing.order_index,
    })) || [],
    steps: recipe.steps?.map(step => ({
      step_number: step.step_number,
      content: step.content,
    })) || [],
  } : {};

  const totalTime = calculateTotalTime(recipe.preparation_time, recipe.cooking_time);
  const showTimes = recipe.preparation_time !== '0:00' || recipe.cooking_time !== '0:00';

  // Get step image size classes
  const getStepImageClasses = () => {
    switch (stepImageSize) {
      case 'small':
        return 'w-48 h-32';
      case 'large':
        return 'w-96 h-64';
      case 'medium':
      default:
        return 'w-64 h-48';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/recipes"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
        >
          ← {t('common.back')} {t('nav.recipes')}
        </Link>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdvancedEditModalOpen(true)}
              >
                {t('recipes.advancedEdit')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? `${t('common.save')}...` : t('common.save')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateShoppingList}
                disabled={isCreatingShoppingList}
              >
                {isCreatingShoppingList ? t('shoppingLists.creating') : t('shoppingLists.createFromRecipe')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditToggle}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? `${t('common.delete')}...` : t('common.delete')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Section 1: Title, Description and Title Image Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Title and Description (50%) */}
        <div>
          {isEditMode ? (
            <div className="space-y-4">
              <Input
                label={t('recipes.name')}
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                required
                className="text-4xl font-bold"
              />
              <Textarea
                label={t('recipes.description')}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={3}
                className="text-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('recipes.prepTime')}
                  type="time"
                  value={editData.preparation_time}
                  onChange={(e) => setEditData({ ...editData, preparation_time: e.target.value })}
                />
                <Input
                  label={t('recipes.cookTime')}
                  type="time"
                  value={editData.cooking_time}
                  onChange={(e) => setEditData({ ...editData, cooking_time: e.target.value })}
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 {t('recipes.advancedEditHint')}
                </p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{recipe.name}</h1>
              {recipe.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{recipe.description}</p>
              )}
              
              {/* Time Information */}
              {showTimes && (
                <div className="flex flex-wrap items-center gap-6 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('recipes.totalTime')}</div>
                      <div className="text-lg font-semibold">{formatTimeForDisplay(totalTime)}</div>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔪</span>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('recipes.prepTime')}</div>
                      <div className="text-lg font-semibold">{formatTimeForDisplay(recipe.preparation_time)}</div>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('recipes.cookTime')}</div>
                      <div className="text-lg font-semibold">{formatTimeForDisplay(recipe.cooking_time)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories */}
              {recipe.categories && recipe.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {recipe.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {cat.category_name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Title Image (50%) */}
        {!isEditMode && imageUrl && (
          <Card className="flex items-center justify-center">
            <img
              src={imageUrl}
              alt={recipe.name}
              className="w-full h-auto max-h-96 object-cover rounded-lg"
            />
          </Card>
        )}
      </div>

      {/* Section 2: Ingredients and Steps in Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients Table - 50% Width */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('recipes.ingredients')}</h2>
              {isEditMode && (
                <Button variant="secondary" size="sm" onClick={handleAddIngredient}>
                  + {t('recipes.addIngredient')}
                </Button>
              )}
            </div>
            
            {isEditMode ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                      <th className="text-left p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('recipes.amount')}</th>
                      <th className="text-left p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('recipes.unit')}</th>
                      <th className="text-left p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('recipes.ingredientName')}</th>
                      <th className="text-left p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('recipes.description')}</th>
                      <th className="w-10 p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editIngredients.map((ingredient, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={ingredient.amount}
                            onChange={(e) => handleUpdateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={ingredient.unit}
                            onChange={(e) => handleUpdateIngredient(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={ingredient.name}
                            onChange={(e) => handleUpdateIngredient(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={ingredient.description}
                            onChange={(e) => handleUpdateIngredient(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title={t('common.remove')}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {editIngredients.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    {t('recipes.noIngredients')}
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                      <th className="text-right p-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-20">{t('recipes.amount')}</th>
                      <th className="text-left p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('recipes.ingredientName')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.ingredients && recipe.ingredients.length > 0 ? (
                      recipe.ingredients
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((ingredient) => (
                          <tr key={ingredient.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="p-2 text-right text-gray-600 dark:text-gray-400 text-sm">
                              {ingredient.amount && (
                                <span>
                                  {ingredient.amount}
                                  {ingredient.unit && ` ${ingredient.unit}`}
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              <div className="font-medium text-gray-900 dark:text-gray-100">{ingredient.name}</div>
                              {ingredient.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {ingredient.description}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-gray-500 dark:text-gray-400 text-center py-4">
                          {t('recipes.noIngredients')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Steps Table - 50% Width */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('recipes.steps')}</h2>
              {isEditMode && (
                <Button variant="secondary" size="sm" onClick={handleAddStep}>
                  + {t('recipes.addStep')}
                </Button>
              )}
            </div>
            
            {isEditMode ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                      <th className="text-center p-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-12">#</th>
                      <th className="text-left p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('recipes.stepContent')}</th>
                      <th className="text-center p-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">{t('recipes.stepImage')}</th>
                      <th className="w-10 p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editSteps.map((step, index) => {
                      const stepImageData = stepImages.get(index);
                      const showImage = stepImageData && stepImageData.url && stepImageData.action !== 'delete';
                      
                      return (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-2 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 text-white text-sm font-semibold">
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-2">
                            <textarea
                              value={step.content}
                              onChange={(e) => handleUpdateStep(index, e.target.value)}
                              rows={3}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
                              required
                            />
                          </td>
                          <td className="p-2 text-center">
                            {showImage ? (
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  src={stepImageData.url}
                                  alt={`Step ${index + 1}`}
                                  className="w-24 h-24 object-cover rounded border border-gray-300 dark:border-gray-600"
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) handleStepImageCapture(index, file);
                                      };
                                      input.click();
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                                    title={t('recipes.updateImage')}
                                  >
                                    🔄
                                  </button>
                                  <button
                                    onClick={() => handleStepImageDelete(index)}
                                    className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded"
                                    title={t('recipes.deleteImage')}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <ImageCapture
                                onImageCapture={(file) => handleStepImageCapture(index, file)}
                              />
                            )}
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => handleRemoveStep(index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title={t('common.remove')}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {editSteps.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    {t('recipes.noSteps')}
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                      <th className="text-center p-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-12">#</th>
                      <th className="text-left p-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('recipes.stepContent')}</th>
                      <th className="text-center p-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">{t('recipes.stepImage')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.steps && recipe.steps.length > 0 ? (
                      recipe.steps
                        .sort((a, b) => a.step_number - b.step_number)
                        .map((step) => {
                          const stepImage = step.step_image_id
                            ? recipe.images?.find(img => img.id === step.step_image_id)
                            : null;
                          const stepImageUrl = stepImage
                            ? `${import.meta.env.VITE_API_URL}${stepImage.filepath}`
                            : null;

                          return (
                            <tr key={step.id} className="border-b border-gray-200 dark:border-gray-700">
                              <td className="p-2 text-center align-top">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 text-white text-sm font-semibold">
                                  {step.step_number}
                                </span>
                              </td>
                              <td className="p-2 align-top">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                  {step.content}
                                </p>
                                {step.ingredient_refs && step.ingredient_refs.length > 0 && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    <span className="font-medium">{t('recipes.ingredients')}: </span>
                                    {step.ingredient_refs.map((ref, idx) => {
                                      const ingredient = recipe.ingredients?.find(
                                        (i) => i.id === ref.ingredient_id
                                      );
                                      return ingredient ? (
                                        <span key={ref.id}>
                                          {idx > 0 && ', '}
                                          {ingredient.name}
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                )}
                              </td>
                              <td className="p-2 text-center align-top">
                                {stepImageUrl ? (
                                  <img
                                    src={stepImageUrl}
                                    alt={`Step ${step.step_number}`}
                                    className={`${getStepImageClasses()} object-cover rounded border-2 border-gray-200 dark:border-gray-700 mx-auto`}
                                  />
                                ) : (
                                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-400 dark:text-gray-600 mx-auto">
                                    <span className="text-2xl">📷</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-gray-500 dark:text-gray-400 text-center py-4">
                          {t('recipes.noSteps')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Process Images - Removed from main view, only in advanced edit */}

      {/* Advanced Edit Modal */}
      <Modal
        isOpen={isAdvancedEditModalOpen}
        onClose={() => setIsAdvancedEditModalOpen(false)}
        title={t('recipes.editRecipe')}
        size="xl"
      >
        <RecipeForm
          initialData={initialFormData}
          onSubmit={handleAdvancedEdit}
          onCancel={() => setIsAdvancedEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Made with Bob