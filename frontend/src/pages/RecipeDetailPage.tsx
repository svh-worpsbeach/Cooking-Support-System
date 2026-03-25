import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecipe } from '../hooks/useRecipes';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecipeForm from '../components/recipes/RecipeForm';
import type { RecipeCreate, Recipe } from '../types';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { recipe, isLoading, error } = useRecipe(Number(id));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEdit = async (data: RecipeCreate) => {
    try {
      await api.put(`/recipes/${id}`, data);
      setIsEditModalOpen(false);
      window.location.reload(); // Reload to show updated data
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

  const titleImage = recipe.images?.find(img => img.id === recipe.title_image_id);
  const imageUrl = titleImage
    ? `${import.meta.env.VITE_API_URL}${titleImage.filepath}`
    : null;

  // Prepare initial data for edit form
  const initialFormData: Partial<RecipeCreate> = recipe ? {
    name: recipe.name,
    description: recipe.description,
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/recipes"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
        >
          ← {t('common.back')} {t('nav.recipes')}
        </Link>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
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
        </div>
      </div>

      {/* Title Image */}
      {imageUrl && (
        <div className="w-full h-96 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Recipe Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{recipe.name}</h1>
        {recipe.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">{recipe.description}</p>
        )}
      </div>

      {/* Categories */}
      {recipe.categories && recipe.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
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

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('recipes.ingredients')}</h2>
          <div className="space-y-3">
            {recipe.ingredients
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
              ))}
          </div>
        </Card>
      )}

      {/* Steps */}
      {recipe.steps && recipe.steps.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('recipes.steps')}</h2>
          <ol className="space-y-6">
            {recipe.steps
              .sort((a, b) => a.step_number - b.step_number)
              .map((step) => {
                const stepImage = step.step_image_id
                  ? recipe.images?.find(img => img.id === step.step_image_id)
                  : null;
                const stepImageUrl = stepImage
                  ? `${import.meta.env.VITE_API_URL}${stepImage.filepath}`
                  : null;

                return (
                  <li key={step.id} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center font-semibold">
                      {step.step_number}
                    </span>
                    <div className="flex-1 pt-1 space-y-3">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {step.content}
                      </p>
                      
                      {stepImageUrl && (
                        <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img
                            src={stepImageUrl}
                            alt={`Step ${step.step_number}`}
                            className="w-full max-w-md h-auto object-cover"
                          />
                        </div>
                      )}
                      
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
                  </li>
                );
              })}
          </ol>
        </Card>
      )}

      {/* Process Images */}
      {recipe.images && recipe.images.filter(img => img.is_process_image).length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('recipes.processImages')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recipe.images
              .filter(img => img.is_process_image)
              .sort((a, b) => a.order_index - b.order_index)
              .map((image) => (
                <div key={image.id} className="rounded-lg overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${image.filepath}`}
                    alt={`Process step ${image.order_index}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('recipes.editRecipe')}
        size="xl"
      >
        <RecipeForm
          initialData={initialFormData}
          onSubmit={handleEdit}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Made with Bob