import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvent } from '../hooks/useEvents';
import { useShoppingLists } from '../hooks/useShoppingLists';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EventForm from '../components/events/EventForm';
import type { EventCreate } from '../types';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { event, isLoading, error } = useEvent(Number(id));
  const { createFromEvent } = useShoppingLists();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingShoppingList, setIsCreatingShoppingList] = useState(false);

  const handleEditEvent = async (data: EventCreate) => {
    try {
      await api.put(`/events/${id}`, data);
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update event:', err);
      alert(t('errors.saveFailed'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('events.deleteConfirm'))) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert(t('errors.deleteFailed'));
      setIsDeleting(false);
    }
  };

  const handleCreateShoppingList = async () => {
    if (!id) return;
    
    setIsCreatingShoppingList(true);
    try {
      const shoppingList = await createFromEvent(Number(id));
      if (shoppingList) {
        navigate(`/shopping-lists/${shoppingList.id}`);
      } else {
        alert(t('shoppingLists.createError'));
      }
    } catch (err) {
      console.error('Failed to create shopping list:', err);
      alert(t('shoppingLists.createError'));
    } finally {
      setIsCreatingShoppingList(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || t('errors.loadFailed')}</p>
        <Button onClick={() => navigate('/events')}>{t('common.back')} {t('nav.events')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
        >
          ← {t('common.back')} {t('nav.events')}
        </Link>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateShoppingList}
            disabled={isCreatingShoppingList}
            className="flex items-center gap-2"
          >
            {isCreatingShoppingList ? (
              <>
                <LoadingSpinner size="sm" />
                {t('shoppingLists.creating')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('shoppingLists.createFromEvent')}
              </>
            )}
          </Button>
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

      {/* Event Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{event.name}</h1>
        {event.description && (
          <p className="text-lg text-gray-600 dark:text-gray-300">{event.description}</p>
        )}
      </div>

      {/* Event Details */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('events.eventDetails')}</h2>
        <div className="space-y-3">
          {event.event_date && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{t('events.date')}</div>
                <div className="text-gray-600 dark:text-gray-300">
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )}
          {event.theme && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{t('events.theme')}</div>
                <div className="text-gray-600 dark:text-gray-300">{event.theme}</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Participants and Courses - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('events.participants')} ({event.participants?.length || 0})
          </h2>
          <div className="space-y-3">
            {event.participants && event.participants.length > 0 ? (
              event.participants.map((participant) => (
                <div key={participant.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">👤</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{participant.name}</div>
                    {participant.dietary_restrictions && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        🥗 {participant.dietary_restrictions}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('events.noParticipants')}
              </p>
            )}
          </div>
        </Card>

        {/* Courses */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('events.menu')} ({event.courses?.length || 0} {t('events.courses')})
          </h2>
          <div className="space-y-4">
            {event.courses && event.courses.length > 0 ? (
              event.courses
                .sort((a, b) => a.course_number - b.course_number)
                .map((course) => (
                  <div key={course.id} className="border-l-4 border-primary-500 dark:border-primary-400 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {t('events.course')} {course.course_number}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{course.course_name}</span>
                    </div>
                    {course.recipes && course.recipes.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {course.recipes.map((courseRecipe) => (
                          <div key={courseRecipe.id} className="ml-4">
                            {courseRecipe.recipe ? (
                              <Link
                                to={`/recipes/${courseRecipe.recipe.id}`}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
                              >
                                🍽️ {courseRecipe.recipe.name}
                              </Link>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                🍽️ Recipe #{courseRecipe.recipe_id}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('events.noCourses')}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Shopping List */}
      {event.shopping_list && event.shopping_list.items && event.shopping_list.items.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('events.shoppingList')} ({event.shopping_list.items.length} {t('events.items')})
          </h2>
          <div className="space-y-2">
            {event.shopping_list.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded ${
                  item.checked === 1 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked === 1}
                  readOnly
                  className="w-5 h-5 text-primary-600 dark:text-primary-400 rounded"
                />
                <div className="flex-1">
                  <span className={item.checked === 1 ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                    {item.name}
                  </span>
                  {item.amount && (
                    <span className="text-gray-600 dark:text-gray-300 ml-2">
                      ({item.amount}
                      {item.unit && ` ${item.unit}`})
                    </span>
                  )}
                  {item.shop && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {item.shop}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('events.editEvent')}
        size="lg"
      >
        <EventForm
          initialData={{
            name: event.name,
            description: event.description || '',
            theme: event.theme || '',
            event_date: event.event_date || '',
            participants: event.participants?.map(p => ({
              name: p.name,
              dietary_restrictions: p.dietary_restrictions || '',
            })) || [],
            courses: event.courses?.map(c => ({
              course_number: c.course_number,
              course_name: c.course_name,
            })) || [],
          }}
          onSubmit={handleEditEvent}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Made with Bob