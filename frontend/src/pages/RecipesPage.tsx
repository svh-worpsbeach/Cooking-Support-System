import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecipes, type RecipeFilters } from '../hooks/useRecipes';
import RecipeList from '../components/recipes/RecipeList';
import RecipeForm from '../components/recipes/RecipeForm';
import CategoryCloud from '../components/recipes/CategoryCloud';
import AdvancedRecipeSearch from '../components/recipes/AdvancedRecipeSearch';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { RecipeCreate } from '../types';

export default function RecipesPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { recipes, isLoading, error, createRecipe, refetch } = useRecipes(filters);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateRecipe = async (data: RecipeCreate) => {
    await createRecipe(data);
    setIsModalOpen(false);
  };

  const handleCategoryClick = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    const newFilters = {
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined,
    };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const handleSearch = (searchFilters: RecipeFilters) => {
    const newFilters = {
      ...searchFilters,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    setSelectedCategories([]);
    refetch({});
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

      <AdvancedRecipeSearch onSearch={handleSearch} onReset={handleReset} />

      <CategoryCloud
        onCategoryClick={handleCategoryClick}
        selectedCategories={selectedCategories}
      />

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
