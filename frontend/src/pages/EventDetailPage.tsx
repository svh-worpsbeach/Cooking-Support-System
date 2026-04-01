import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvent } from '../hooks/useEvents';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { EventCreate } from '../types';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { event, isLoading, error } = useEvent(Number(id));
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [editData, setEditData] = useState<EventCreate>({
    name: '',
    description: '',
    theme: '',
    event_date: '',
    participants: [],
    courses: [],
  });

  const handleEditToggle = () => {
    if (!isEditMode && event) {
      // Entering edit mode - initialize form
      setEditData({
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
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/events/${id}`, editData);
      setIsEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update event:', err);
      alert(t('errors.saveFailed'));
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (event) {
      setEditData({
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
      });
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

  // Participant management
  const addParticipant = () => {
    setEditData({
      ...editData,
      participants: [...(editData.participants || []), { name: '', dietary_restrictions: '' }],
    });
  };

  const removeParticipant = (index: number) => {
    setEditData({
      ...editData,
      participants: (editData.participants || []).filter((_, i) => i !== index),
    });
  };

  const updateParticipant = (index: number, field: 'name' | 'dietary_restrictions', value: string) => {
    const updated = [...(editData.participants || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, participants: updated });
  };

  // Course management
  const addCourse = () => {
    const courses = editData.courses || [];
    const nextNumber = courses.length > 0
      ? Math.max(...courses.map(c => c.course_number)) + 1
      : 1;
    setEditData({
      ...editData,
      courses: [...courses, { course_number: nextNumber, course_name: '' }],
    });
  };

  const removeCourse = (index: number) => {
    setEditData({
      ...editData,
      courses: (editData.courses || []).filter((_, i) => i !== index),
    });
  };

  const updateCourse = (index: number, field: 'course_number' | 'course_name', value: string | number) => {
    const updated = [...(editData.courses || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, courses: updated });
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
          {isEditMode ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? `${t('common.save')}...` : t('common.save')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditToggle}
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
            </>
          )}
        </div>
      </div>

      {/* Event Header */}
      <div>
        {isEditMode ? (
          <div className="space-y-4">
            <Input
              label={t('events.name')}
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              required
              className="text-4xl font-bold"
            />
            <Textarea
              label={t('events.description')}
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={3}
              className="text-lg"
            />
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{event.name}</h1>
            {event.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300">{event.description}</p>
            )}
          </>
        )}
      </div>

      {/* Event Details */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('events.eventDetails')}</h2>
        <div className="space-y-3">
          {isEditMode ? (
            <>
              <Input
                label={t('events.date')}
                type="date"
                value={editData.event_date}
                onChange={(e) => setEditData({ ...editData, event_date: e.target.value })}
              />
              <Input
                label={t('events.theme')}
                value={editData.theme}
                onChange={(e) => setEditData({ ...editData, theme: e.target.value })}
                placeholder="e.g., Italian Night, BBQ Party"
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </Card>

      {/* Participants */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('events.participants')} ({isEditMode ? (editData.participants || []).length : event.participants?.length || 0})
          </h2>
          {isEditMode && (
            <Button size="sm" onClick={addParticipant}>
              + {t('events.addParticipant')}
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {isEditMode ? (
            (editData.participants || []).length > 0 ? (
              (editData.participants || []).map((participant, index) => (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      label={t('events.participantName')}
                      value={participant.name}
                      onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                      required
                      placeholder="Name"
                    />
                    <Input
                      label={t('events.dietaryRestrictions')}
                      value={participant.dietary_restrictions}
                      onChange={(e) => updateParticipant(index, 'dietary_restrictions', e.target.value)}
                      placeholder="e.g., Vegetarian, Gluten-free"
                    />
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeParticipant(index)}
                    className="self-start"
                  >
                    ✕
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('events.noParticipants')}
              </p>
            )
          ) : (
            event.participants && event.participants.length > 0 ? (
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
            )
          )}
        </div>
      </Card>

      {/* Courses */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('events.menu')} ({isEditMode ? (editData.courses || []).length : event.courses?.length || 0} {t('events.courses')})
          </h2>
          {isEditMode && (
            <Button size="sm" onClick={addCourse}>
              + {t('events.addCourse')}
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {isEditMode ? (
            (editData.courses || []).length > 0 ? (
              (editData.courses || [])
                .sort((a, b) => a.course_number - b.course_number)
                .map((course, index) => (
                  <div key={index} className="flex gap-3 p-3 border-l-4 border-primary-500 dark:border-primary-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        label={t('events.courseNumber')}
                        type="number"
                        value={course.course_number}
                        onChange={(e) => updateCourse(index, 'course_number', parseInt(e.target.value))}
                        required
                        min="1"
                      />
                      <Input
                        label={t('events.courseName')}
                        value={course.course_name}
                        onChange={(e) => updateCourse(index, 'course_name', e.target.value)}
                        required
                        placeholder="e.g., Appetizer, Main Course, Dessert"
                      />
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeCourse(index)}
                      className="self-start"
                    >
                      ✕
                    </Button>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('events.noCourses')}
              </p>
            )
          ) : (
            event.courses && event.courses.length > 0 ? (
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
            )
          )}
        </div>
      </Card>

      {/* Shopping List - Only in view mode */}
      {!isEditMode && event.shopping_list && event.shopping_list.items && event.shopping_list.items.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('events.shoppingList')} ({event.shopping_list.items.length} {t('events.items')})
          </h2>
          <div className="space-y-2">
            {event.shopping_list.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded ${
                  item.is_purchased ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.is_purchased}
                  readOnly
                  className="w-5 h-5 text-primary-600 dark:text-primary-400 rounded"
                />
                <div className="flex-1">
                  <span className={item.is_purchased ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                    {item.item_name}
                  </span>
                  {item.quantity && (
                    <span className="text-gray-600 dark:text-gray-300 ml-2">
                      ({item.quantity}
                      {item.unit && ` ${item.unit}`})
                    </span>
                  )}
                  {item.source && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {t('events.from')} {item.source}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Made with Bob