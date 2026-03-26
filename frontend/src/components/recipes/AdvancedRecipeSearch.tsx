import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';

interface AdvancedRecipeSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export interface SearchFilters {
  search: string;
  ingredients: string[];
  allowSubstitutes: boolean;
  sortBy: string;
}

export default function AdvancedRecipeSearch({ onSearch, onReset }: AdvancedRecipeSearchProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [allowSubstitutes, setAllowSubstitutes] = useState(false);
  const [sortBy, setSortBy] = useState('name_asc');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleSearch = () => {
    onSearch({
      search,
      ingredients,
      allowSubstitutes,
      sortBy,
    });
  };

  const handleReset = () => {
    setSearch('');
    setIngredients([]);
    setAllowSubstitutes(false);
    setSortBy('name_asc');
    onReset();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (ingredientInput.trim()) {
        handleAddIngredient();
      } else {
        handleSearch();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <Input
            label={t('recipes.searchRecipes')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('recipes.searchPlaceholder')}
          />
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('recipes.sortBy')}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="name_asc">{t('recipes.sortNameAsc')}</option>
            <option value="name_desc">{t('recipes.sortNameDesc')}</option>
            <option value="category">{t('recipes.sortCategory')}</option>
            <option value="created_desc">{t('recipes.sortNewest')}</option>
          </select>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          {showAdvanced ? '▼' : '▶'} {t('recipes.advancedSearch')}
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            {/* Ingredient Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recipes.filterByIngredients')}
              </label>
              <div className="flex gap-2">
                <Input
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('recipes.ingredientPlaceholder')}
                />
                <Button
                  onClick={handleAddIngredient}
                  variant="secondary"
                  disabled={!ingredientInput.trim()}
                >
                  {t('common.add')}
                </Button>
              </div>
              
              {/* Ingredient Tags */}
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                    >
                      {ingredient}
                      <button
                        onClick={() => handleRemoveIngredient(ingredient)}
                        className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Allow Substitutes */}
            {ingredients.length > 0 && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowSubstitutes"
                  checked={allowSubstitutes}
                  onChange={(e) => setAllowSubstitutes(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="allowSubstitutes"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  {t('recipes.allowSubstitutes')}
                </label>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSearch} className="flex-1">
            {t('common.search')}
          </Button>
          <Button onClick={handleReset} variant="secondary">
            {t('recipes.resetFilters')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
