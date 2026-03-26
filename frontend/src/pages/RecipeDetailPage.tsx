import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecipe } from '../hooks/useRecipes';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecipeForm from '../components/recipes/RecipeForm';
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
        })) || []
      );
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    if (!recipe) return;
    
    setIsSaving(true);
    try {
      // Prepare full data with edited ingredients and steps
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
    setEditSteps(editSteps.filter((_, i) => i !== index));
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

      {/* Section 1: Title and Categories */}
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

      {/* Section 2: Ingredients and Title Image Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients */}
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
            <div className="space-y-4">
              {editIngredients.map((ingredient, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t('recipes.ingredientName')}
                      value={ingredient.name}
                      onChange={(e) => handleUpdateIngredient(index, 'name', e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label={t('recipes.amount')}
                        type="number"
                        step="0.01"
                        value={ingredient.amount}
                        onChange={(e) => handleUpdateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label={t('recipes.unit')}
                        value={ingredient.unit}
                        onChange={(e) => handleUpdateIngredient(index, 'unit', e.target.value)}
                      />
                    </div>
                  </div>
                  <Input
                    label={t('recipes.description')}
                    value={ingredient.description}
                    onChange={(e) => handleUpdateIngredient(index, 'description', e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      {t('common.remove')}
                    </Button>
                  </div>
                </div>
              ))}
              {editIngredients.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  {t('recipes.noIngredients')}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((ingredient) => (
                    <div key={ingredient.id} className="flex items-start gap-4">
                      <div className="w-24 flex-shrink-0 text-right text-gray-600 dark:text-gray-400">
                        {ingredient.amount && (
                          <span>
                            {ingredient.amount}
                            {ingredient.unit && ` ${ingredient.unit}`}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{ingredient.name}</div>
                        {ingredient.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {ingredient.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  {t('recipes.noIngredients')}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Title Image */}
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

      {/* Section 3: Preparation Steps */}
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
          <div className="space-y-4">
            {editSteps.map((step, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      label={t('recipes.stepContent')}
                      value={step.content}
                      onChange={(e) => handleUpdateStep(index, e.target.value)}
                      rows={4}
                      required
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveStep(index)}
                      >
                        {t('common.remove')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {editSteps.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('recipes.noSteps')}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
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
                    <div key={step.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Left Column: Step Text */}
                      <div className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center font-semibold">
                          {step.step_number}
                        </span>
                        <div className="flex-1 pt-1 space-y-3">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {step.content}
                          </p>
                          
                          {step.ingredient_refs && step.ingredient_refs.length > 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
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
                        </div>
                      </div>

                      {/* Right Column: Step Image */}
                      <div className="flex items-center justify-center">
                        {stepImageUrl ? (
                          <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                            <img
                              src={stepImageUrl}
                              alt={`Step ${step.step_number}`}
                              className={`${getStepImageClasses()} object-cover`}
                            />
                          </div>
                        ) : (
                          <div className={`${getStepImageClasses()} bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-600`}>
                            <span className="text-4xl">📷</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('recipes.noSteps')}
              </p>
            )}
          </div>
        )}
      </Card>

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