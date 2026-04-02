import type { Recipe } from '../../types';
import RecipeCard from './RecipeCard';
import EmptyState from '../common/EmptyState';

interface RecipeListProps {
  recipes: Recipe[];
  onCreateNew?: () => void;
  selectable?: boolean;
  selectedRecipes?: Set<number>;
  onRecipeSelect?: (recipeId: number) => void;
}

export default function RecipeList({
  recipes,
  onCreateNew,
  selectable = false,
  selectedRecipes = new Set(),
  onRecipeSelect
}: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <EmptyState
        icon="📖"
        title="No recipes yet"
        description="Start building your recipe collection by creating your first recipe."
        action={onCreateNew ? {
          label: 'Create Recipe',
          onClick: onCreateNew,
        } : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          selectable={selectable}
          selected={selectedRecipes.has(recipe.id)}
          onSelect={onRecipeSelect}
        />
      ))}
    </div>
  );
}

// Made with Bob