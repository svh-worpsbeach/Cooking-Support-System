import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecipes } from '../hooks/useRecipes';
import RecipeList from '../components/recipes/RecipeList';
import RecipeForm from '../components/recipes/RecipeForm';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { RecipeCreate } from '../types';

export default function RecipesPage() {
  const { t } = useTranslation();
  const { recipes, isLoading, error, createRecipe } = useRecipes();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateRecipe = async (data: RecipeCreate) => {
    await createRecipe(data);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.recipes')}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {t('recipes.createRecipe')}
        </Button>
      </div>

      <RecipeList recipes={recipes} onCreateNew={() => setIsModalOpen(true)} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('recipes.createRecipe')}
        size="xl"
      >
        <RecipeForm
          onSubmit={handleCreateRecipe}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Made with Bob
