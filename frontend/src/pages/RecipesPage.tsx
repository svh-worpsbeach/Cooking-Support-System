import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecipes, type RecipeFilters } from '../hooks/useRecipes';
import { useEvents } from '../hooks/useEvents';
import RecipeList from '../components/recipes/RecipeList';
import RecipeForm from '../components/recipes/RecipeForm';
import RecipeImportDialog from '../components/recipes/RecipeImportDialog';
import CategoryCloud from '../components/recipes/CategoryCloud';
import AdvancedRecipeSearch from '../components/recipes/AdvancedRecipeSearch';
import EventForm from '../components/events/EventForm';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MultiSelectToolbar from '../components/common/MultiSelectToolbar';
import { formatShortDate } from '../utils/timeUtils';
import type { RecipeCreate, Event, EventCreate } from '../types';

export default function RecipesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { recipes, isLoading, error, createRecipe, deleteRecipe, refetch } = useRecipes(filters);
  const { events, createEvent, updateEvent } = useEvents();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<number>>(new Set());
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isAddToEventModalOpen, setIsAddToEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleCreateRecipe = async (data: RecipeCreate) => {
    await createRecipe(data);
    setIsCreateModalOpen(false);
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

  const handleImportSuccess = (recipeId: number) => {
    refetch();
    navigate(`/recipes/${recipeId}`);
  };

  // Multi-select handlers
  const toggleRecipeSelection = (recipeId: number) => {
    const newSelection = new Set(selectedRecipes);
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId);
    } else {
      newSelection.add(recipeId);
    }
    setSelectedRecipes(newSelection);
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectActive(!isMultiSelectActive);
    if (isMultiSelectActive) {
      setSelectedRecipes(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRecipes.size === 0) return;
    
    const count = selectedRecipes.size;
    if (!window.confirm(t('multiSelect.confirmDelete', { count }))) return;

    try {
      await Promise.all(
        Array.from(selectedRecipes).map(id => deleteRecipe(id))
      );
      setSelectedRecipes(new Set());
      setIsMultiSelectActive(false);
    } catch (err) {
      console.error('Failed to delete recipes:', err);
      alert(t('errors.deleteFailed'));
    }
  };

  const handleCreateEventWithRecipes = async (data: EventCreate) => {
    const selectedRecipeData = recipes
      .filter(r => selectedRecipes.has(r.id))
      .map((r, index) => ({
        course_number: index + 1,
        course_name: r.name,
        recipe_ids: [r.id],
      }));

    const eventData = {
      ...data,
      courses: [...(data.courses || []), ...selectedRecipeData],
    };

    await createEvent(eventData);
    setIsCreateEventModalOpen(false);
    setSelectedRecipes(new Set());
    navigate('/events');
  };

  const handleAddRecipesToEvent = async (data: EventCreate) => {
    if (!selectedEvent) return;

    const selectedRecipeData = recipes
      .filter(r => selectedRecipes.has(r.id))
      .map((r, index) => ({
        course_number: (data.courses?.length || 0) + index + 1,
        course_name: r.name,
        recipe_ids: [r.id],
      }));

    const eventData = {
      ...data,
      courses: [...(data.courses || []), ...selectedRecipeData],
    };

    await updateEvent(selectedEvent.id, eventData);
    setIsAddToEventModalOpen(false);
    setSelectedEvent(null);
    setSelectedRecipes(new Set());
  };

  const openAddToEventModal = (event: Event) => {
    setSelectedEvent(event);
    setIsAddToEventModalOpen(true);
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
        <div className="flex gap-2">
          <Button onClick={() => setIsSearchModalOpen(true)} variant="secondary">
            🔍 {t('common.search')}
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)} variant="secondary">
            📥 {t('recipes.import.import')}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            {t('recipes.createRecipe')}
          </Button>
        </div>
      </div>

      {/* Multi-Select Toolbar */}
      <MultiSelectToolbar
        isMultiSelectActive={isMultiSelectActive}
        selectedCount={selectedRecipes.size}
        onToggleMultiSelect={handleToggleMultiSelect}
        onDelete={handleDeleteSelected}
        onClearSelection={() => setSelectedRecipes(new Set())}
        additionalActions={
          selectedRecipes.size > 0 && (
            <>
              <Button onClick={() => setIsCreateEventModalOpen(true)} variant="secondary">
                🎉 {t('recipes.createEventWithSelected')} ({selectedRecipes.size})
              </Button>
              <Button onClick={() => setIsAddToEventModalOpen(true)} variant="secondary">
                ➕ {t('recipes.addToEvent')} ({selectedRecipes.size})
              </Button>
            </>
          )
        }
      />

      <CategoryCloud
        onCategoryClick={handleCategoryClick}
        selectedCategories={selectedCategories}
      />

      <RecipeList
        recipes={recipes}
        onCreateNew={() => setIsCreateModalOpen(true)}
        selectable={isMultiSelectActive}
        selectedRecipes={selectedRecipes}
        onRecipeSelect={toggleRecipeSelection}
      />

      {/* Search Modal */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title={t('recipes.advancedSearch')}
        size="lg"
      >
        <AdvancedRecipeSearch onSearch={handleSearch} onReset={handleReset} />
      </Modal>

      {/* Create Recipe Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('recipes.createRecipe')}
        size="xl"
      >
        <RecipeForm
          onSubmit={handleCreateRecipe}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Import Recipe Modal */}
      <RecipeImportDialog
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Create Event with Selected Recipes Modal */}
      <Modal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        title={t('recipes.createEventWithSelected')}
        size="xl"
      >
        <EventForm
          initialData={{
            name: '',
            description: '',
            theme: '',
            event_date: '',
            participants: [],
            courses: recipes
              .filter(r => selectedRecipes.has(r.id))
              .map((r, index) => ({
                course_number: index + 1,
                course_name: r.name,
                recipe_ids: [r.id],
              })),
          }}
          onSubmit={handleCreateEventWithRecipes}
          onCancel={() => setIsCreateEventModalOpen(false)}
        />
      </Modal>

      {/* Add to Event Modal */}
      <Modal
        isOpen={isAddToEventModalOpen && !selectedEvent}
        onClose={() => {
          setIsAddToEventModalOpen(false);
          setSelectedEvent(null);
        }}
        title={t('recipes.addToEvent')}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('recipes.selectEventToAdd')}
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => openAddToEventModal(event)}
                className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">{event.name}</div>
                {event.event_date && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    📅 {formatShortDate(event.event_date)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Edit Event Modal (for adding recipes) */}
      {selectedEvent && (
        <Modal
          isOpen={isAddToEventModalOpen && selectedEvent !== null}
          onClose={() => {
            setIsAddToEventModalOpen(false);
            setSelectedEvent(null);
          }}
          title={`${t('recipes.addToEvent')}: ${selectedEvent.name}`}
          size="xl"
        >
          <EventForm
            initialData={{
              name: selectedEvent.name,
              description: selectedEvent.description,
              theme: selectedEvent.theme,
              event_date: selectedEvent.event_date,
              participants: selectedEvent.participants || [],
              courses: selectedEvent.courses || [],
            }}
            onSubmit={handleAddRecipesToEvent}
            onCancel={() => {
              setIsAddToEventModalOpen(false);
              setSelectedEvent(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// Made with Bob
