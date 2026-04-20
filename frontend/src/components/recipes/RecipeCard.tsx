import { Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import Card from '../common/Card';
import { calculateTotalTime, formatTimeForDisplay } from '../../utils/timeUtils';

interface RecipeCardProps {
  recipe: Recipe;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (recipeId: number) => void;
}

export default function RecipeCard({ recipe, selectable = false, selected = false, onSelect }: RecipeCardProps) {
  const titleImage = recipe.images?.find(img => img.id === recipe.title_image_id);
  const imageUrl = titleImage?.filepath ? `/api${titleImage.filepath}` : null;

  const totalTime = calculateTotalTime(recipe.preparation_time, recipe.cooking_time);
  const showTimes = recipe.preparation_time !== '0:00' || recipe.cooking_time !== '0:00';

  const cardContent = (
    <>
      {imageUrl && (
        <div className="mb-4 -mx-6 -mt-6">
          <img
            src={imageUrl}
            alt={recipe.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </div>
      )}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {recipe.name}
        </h3>
        {recipe.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}
        {recipe.categories && recipe.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {recipe.categories.slice(0, 3).map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:backdrop-blur-sm dark:text-primary-200"
              >
                {cat.category_name}
              </span>
            ))}
            {recipe.categories.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700/60 dark:backdrop-blur-sm dark:text-gray-200">
                +{recipe.categories.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="space-y-2">
          {showTimes && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
              <span className="flex items-center gap-1">
                ⏱️ <span className="font-medium">{formatTimeForDisplay(totalTime)}</span>
              </span>
              <span className="text-gray-400 dark:text-gray-500">|</span>
              <span>🔪 {formatTimeForDisplay(recipe.preparation_time)}</span>
              <span>🔥 {formatTimeForDisplay(recipe.cooking_time)}</span>
            </div>
          )}
          {(recipe.ingredients || recipe.steps) && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
              {recipe.ingredients && <span>🥘 {recipe.ingredients.length} ingredients</span>}
              {recipe.steps && <span>📝 {recipe.steps.length} steps</span>}
            </div>
          )}
      </div>
    </>
  );

  if (selectable) {
    return (
      <Card
        hover
        className={`h-full relative cursor-pointer ${selected ? 'ring-4 ring-blue-500 dark:ring-blue-400' : ''}`}
        onClick={() => onSelect?.(recipe.id)}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Link to={`/recipes/${recipe.id}`}>
      <Card hover className="h-full">
        {cardContent}
      </Card>
    </Link>
  );
}

// Made with Bob