import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RecipeCreate, RecipeIngredient } from '../../types';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import ImageCapture from '../common/ImageCapture';
import api from '../../services/api';

interface RecipeFormProps {
  initialData?: Partial<RecipeCreate>;
  onSubmit: (data: RecipeCreate) => Promise<void>;
  onCancel: () => void;
}

export default function RecipeForm({ initialData, onSubmit, onCancel }: RecipeFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RecipeCreate>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    categories: initialData?.categories || [],
    ingredients: initialData?.ingredients || [],
    steps: initialData?.steps || [],
  });

  const [categoryInput, setCategoryInput] = useState('');
  const [ingredientForm, setIngredientForm] = useState<Omit<RecipeIngredient, 'id' | 'recipe_id'>>({
    name: '',
    description: '',
    amount: undefined,
    unit: '',
    order_index: 0,
  });
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [stepContent, setStepContent] = useState('');
  const [stepImages, setStepImages] = useState<Map<number, { file?: File; url?: string; imageId?: number }>>(new Map());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCategory = () => {
    if (categoryInput.trim() && !formData.categories?.includes(categoryInput.trim())) {
      setFormData({
        ...formData,
        categories: [...(formData.categories || []), categoryInput.trim()],
      });
      setCategoryInput('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories?.filter(c => c !== category),
    });
  };

  const addIngredient = () => {
    if (ingredientForm.name.trim()) {
      if (editingIngredientIndex !== null) {
        // Update existing ingredient
        const updatedIngredients = [...(formData.ingredients || [])];
        updatedIngredients[editingIngredientIndex] = {
          ...ingredientForm,
          order_index: editingIngredientIndex,
        };
        setFormData({
          ...formData,
          ingredients: updatedIngredients,
        });
        setEditingIngredientIndex(null);
      } else {
        // Add new ingredient
        setFormData({
          ...formData,
          ingredients: [
            ...(formData.ingredients || []),
            { ...ingredientForm, order_index: formData.ingredients?.length || 0 },
          ],
        });
      }
      setIngredientForm({
        name: '',
        description: '',
        amount: undefined,
        unit: '',
        order_index: 0,
      });
    }
  };

  const editIngredient = (index: number) => {
    const ingredient = formData.ingredients?.[index];
    if (ingredient) {
      setIngredientForm({
        name: ingredient.name,
        description: ingredient.description || '',
        amount: ingredient.amount,
        unit: ingredient.unit || '',
        order_index: ingredient.order_index,
      });
      setEditingIngredientIndex(index);
    }
  };

  const cancelEditIngredient = () => {
    setIngredientForm({
      name: '',
      description: '',
      amount: undefined,
      unit: '',
      order_index: 0,
    });
    setEditingIngredientIndex(null);
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients?.filter((_, i) => i !== index),
    });
  };

  const addStep = () => {
    if (stepContent.trim()) {
      const newStepNumber = (formData.steps?.length || 0) + 1;
      setFormData({
        ...formData,
        steps: [
          ...(formData.steps || []),
          {
            step_number: newStepNumber,
            content: stepContent.trim(),
          },
        ],
      });
      setStepContent('');
    }
  };

  const handleStepImageCapture = async (stepIndex: number, file: File) => {
    if (!initialData) {
      // For new recipes, store the file temporarily
      const url = URL.createObjectURL(file);
      setStepImages(new Map(stepImages.set(stepIndex, { file, url })));
      return;
    }

    // For existing recipes, upload immediately
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('is_process_image', 'true');
      uploadFormData.append('order_index', stepIndex.toString());

      const response = await api.post(`/recipes/${(initialData as { id: number }).id}/images`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageId = response.data.id;
      const imageUrl = `${api.defaults.baseURL}/uploads/recipes/${response.data.filename}`;
      
      setStepImages(new Map(stepImages.set(stepIndex, { imageId, url: imageUrl })));
      
      // Update the step with the image ID
      const updatedSteps = [...(formData.steps || [])];
      if (updatedSteps[stepIndex]) {
        updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], step_image_id: imageId };
        setFormData({ ...formData, steps: updatedSteps });
      }
    } catch (error) {
      console.error('Error uploading step image:', error);
      alert('Failed to upload image');
    }
  };

  const removeStepImage = async (stepIndex: number) => {
    const imageData = stepImages.get(stepIndex);
    if (imageData?.imageId && initialData) {
      try {
        await api.delete(`/recipes/${(initialData as { id: number }).id}/images/${imageData.imageId}`);
      } catch (error) {
        console.error('Error deleting step image:', error);
      }
    }
    
    if (imageData?.url && imageData.file) {
      URL.revokeObjectURL(imageData.url);
    }
    
    const newStepImages = new Map(stepImages);
    newStepImages.delete(stepIndex);
    setStepImages(newStepImages);
    
    // Update the step to remove image ID
    const updatedSteps = [...(formData.steps || [])];
    if (updatedSteps[stepIndex]) {
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], step_image_id: undefined };
      setFormData({ ...formData, steps: updatedSteps });
    }
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps?.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        step_number: i + 1,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <Input
          label="Recipe Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter recipe name"
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Describe your recipe"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Categories</h3>
        <div className="flex gap-2">
          <Input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            placeholder="Add category"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
          />
          <Button type="button" onClick={addCategory}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.categories?.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
            >
              {category}
              <button
                type="button"
                onClick={() => removeCategory(category)}
                className="hover:text-primary-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            value={ingredientForm.name}
            onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
            placeholder="Ingredient name"
          />
          <Input
            label="Description"
            value={ingredientForm.description}
            onChange={(e) => setIngredientForm({ ...ingredientForm, description: e.target.value })}
            placeholder="Optional description"
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={ingredientForm.amount || ''}
            onChange={(e) => setIngredientForm({ ...ingredientForm, amount: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="Amount"
          />
          <Input
            label="Unit"
            value={ingredientForm.unit}
            onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
            placeholder="e.g., cups, grams"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={addIngredient} variant="secondary">
            {editingIngredientIndex !== null ? 'Update Ingredient' : 'Add Ingredient'}
          </Button>
          {editingIngredientIndex !== null && (
            <Button type="button" onClick={cancelEditIngredient} variant="ghost">
              Cancel Edit
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {formData.ingredients?.map((ingredient, index) => (
            <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded">
              <div className="w-24 flex-shrink-0 text-right text-gray-600">
                {ingredient.amount && (
                  <span>
                    {ingredient.amount}
                    {ingredient.unit && ` ${ingredient.unit}`}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{ingredient.name}</div>
                {ingredient.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {ingredient.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => editIngredient(index)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('recipes.steps')}</h3>
        <Textarea
          value={stepContent}
          onChange={(e) => setStepContent(e.target.value)}
          rows={3}
          placeholder={t('recipes.stepContent')}
        />
        <Button type="button" onClick={addStep} variant="secondary">
          {t('recipes.addStep')}
        </Button>
        <div className="space-y-4">
          {formData.steps?.map((step, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-full font-medium">
                  {step.step_number}
                </span>
                <p className="flex-1 text-gray-700 dark:text-gray-300">{step.content}</p>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  {t('common.remove')}
                </button>
              </div>
              
              <div className="ml-11">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('recipes.stepImage')}
                </label>
                <ImageCapture
                  onImageCapture={(file) => handleStepImageCapture(index, file)}
                  currentImageUrl={stepImages.get(index)?.url}
                  onRemove={() => removeStepImage(index)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </form>
  );
}

// Made with Bob