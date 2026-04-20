import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface CategoryData {
  category: string;
  count: number;
}

interface CategoryCloudProps {
  onCategoryClick: (category: string) => void;
  selectedCategories: string[];
}

export default function CategoryCloud({ onCategoryClick, selectedCategories }: CategoryCloudProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/recipes/categories/cloud`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching category cloud:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFontSize = (count: number, maxCount: number) => {
    // Scale font size between 0.875rem (14px) and 1.5rem (24px)
    const minSize = 0.875;
    const maxSize = 1.5;
    const ratio = count / maxCount;
    return minSize + (maxSize - minSize) * ratio;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const maxCount = Math.max(...categories.map(c => c.count));

  return (
    <div className="bg-white/90 dark:bg-gray-800/75 backdrop-blur-md rounded-lg shadow border border-gray-200/30 dark:border-gray-700/30 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        {t('recipes.categoryCloud')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategories.includes(cat.category);
          const fontSize = getFontSize(cat.count, maxCount);
          
          return (
            <button
              key={cat.category}
              onClick={() => onCategoryClick(cat.category)}
              className={`
                inline-flex items-center px-3 py-1 rounded-full transition-all
                ${isSelected
                  ? 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500/90 dark:hover:bg-primary-600/90 dark:backdrop-blur-sm'
                  : 'bg-gray-100 dark:bg-gray-700/60 dark:backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/70'
                }
              `}
              style={{ fontSize: `${fontSize}rem` }}
            >
              {cat.category}
              <span className="ml-1.5 text-xs opacity-75">({cat.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Made with Bob
