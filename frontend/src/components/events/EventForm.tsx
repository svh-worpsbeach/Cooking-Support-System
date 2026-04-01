import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventCreate, EventParticipant, EventCourse } from '../../types';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { useGuests } from '../../hooks/useGuests';
import { useRecipes } from '../../hooks/useRecipes';

interface EventFormProps {
  initialData?: Partial<EventCreate>;
  onSubmit: (data: EventCreate) => Promise<void>;
  onCancel: () => void;
}

export default function EventForm({ initialData, onSubmit, onCancel }: EventFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventCreate>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    theme: initialData?.theme || '',
    event_date: initialData?.event_date || '',
    participants: initialData?.participants || [],
    courses: initialData?.courses || [],
  });

  // Fetch guests and recipes for type-ahead
  const [guestSearch, setGuestSearch] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [debouncedGuestSearch, setDebouncedGuestSearch] = useState('');
  const [debouncedRecipeSearch, setDebouncedRecipeSearch] = useState('');
  const { guests } = useGuests(debouncedGuestSearch);
  const { recipes } = useRecipes({ search: debouncedRecipeSearch });

  // Participant form state
  const [participantForm, setParticipantForm] = useState<Omit<EventParticipant, 'id' | 'event_id'>>({
    name: '',
    dietary_restrictions: '',
  });
  const [editingParticipantIndex, setEditingParticipantIndex] = useState<number | null>(null);

  // Course form state
  const [courseForm, setCourseForm] = useState<Omit<EventCourse, 'id' | 'event_id' | 'recipes'>>({
    course_number: 1,
    course_name: '',
  });
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null);

  // Debounce guest search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGuestSearch(guestSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [guestSearch]);

  // Debounce recipe search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRecipeSearch(recipeSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [recipeSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Participant management
  const addParticipant = () => {
    if (participantForm.name.trim()) {
      if (editingParticipantIndex !== null) {
        const updatedParticipants = [...(formData.participants || [])];
        updatedParticipants[editingParticipantIndex] = participantForm;
        setFormData({ ...formData, participants: updatedParticipants });
        setEditingParticipantIndex(null);
      } else {
        setFormData({
          ...formData,
          participants: [...(formData.participants || []), participantForm],
        });
      }
      setParticipantForm({ name: '', dietary_restrictions: '' });
    }
  };

  const editParticipant = (index: number) => {
    const participant = formData.participants?.[index];
    if (participant) {
      setParticipantForm({
        name: participant.name,
        dietary_restrictions: participant.dietary_restrictions || '',
      });
      setEditingParticipantIndex(index);
    }
  };

  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participants: formData.participants?.filter((_, i) => i !== index),
    });
  };

  const cancelEditParticipant = () => {
    setParticipantForm({ name: '', dietary_restrictions: '' });
    setEditingParticipantIndex(null);
  };

  // Course management
  const addCourse = () => {
    if (courseForm.course_name.trim()) {
      if (editingCourseIndex !== null) {
        const updatedCourses = [...(formData.courses || [])];
        updatedCourses[editingCourseIndex] = courseForm;
        setFormData({ ...formData, courses: updatedCourses });
        setEditingCourseIndex(null);
      } else {
        setFormData({
          ...formData,
          courses: [
            ...(formData.courses || []),
            { ...courseForm, course_number: (formData.courses?.length || 0) + 1 },
          ],
        });
      }
      setCourseForm({ course_number: 1, course_name: '' });
    }
  };

  const editCourse = (index: number) => {
    const course = formData.courses?.[index];
    if (course) {
      setCourseForm({
        course_number: course.course_number,
        course_name: course.course_name,
      });
      setEditingCourseIndex(index);
    }
  };

  const removeCourse = (index: number) => {
    setFormData({
      ...formData,
      courses: formData.courses?.filter((_, i) => i !== index).map((course, i) => ({
        ...course,
        course_number: i + 1,
      })),
    });
  };

  const cancelEditCourse = () => {
    setCourseForm({ course_number: 1, course_name: '' });
    setEditingCourseIndex(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Event Information</h2>
        <Input
          label="Event Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter event name"
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Describe the event"
        />
        <Input
          label="Theme"
          value={formData.theme}
          onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
          placeholder="e.g., Italian Night, BBQ Party"
        />
        <Input
          label="Event Date"
          type="datetime-local"
          value={formData.event_date}
          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
        />
      </div>

      {/* Guest Management Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('events.guestManagement')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('events.participantName')}
            value={participantForm.name}
            onChange={(e) => {
              setParticipantForm({ ...participantForm, name: e.target.value });
              setGuestSearch(e.target.value);
            }}
            placeholder={t('events.participantNamePlaceholder')}
          />
          <Input
            label={t('events.dietaryRestrictions')}
            value={participantForm.dietary_restrictions}
            onChange={(e) => setParticipantForm({ ...participantForm, dietary_restrictions: e.target.value })}
            placeholder={t('events.dietaryRestrictionsPlaceholder')}
          />
        </div>
        {guestSearch && guests.length > 0 && (
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {guests.map((guest) => (
              <button
                key={guest.id}
                type="button"
                onClick={() => {
                  setParticipantForm({
                    name: `${guest.first_name} ${guest.last_name}`,
                    dietary_restrictions: [
                      guest.intolerances,
                      guest.favorites,
                      guest.dietary_notes
                    ].filter(Boolean).join(', ') || '',
                  });
                  setGuestSearch('');
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">{guest.first_name} {guest.last_name}</div>
                {(guest.email || guest.phone) && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {guest.email || guest.phone}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button type="button" onClick={addParticipant} variant="secondary">
            {editingParticipantIndex !== null ? t('events.updateParticipant') : t('events.addParticipant')}
          </Button>
          {editingParticipantIndex !== null && (
            <Button type="button" onClick={cancelEditParticipant} variant="ghost">
              {t('common.cancelEdit')}
            </Button>
          )}
        </div>
      </div>

      {/* Two-column layout for Participants and Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('events.participants')}</h2>
          <div className="space-y-2">
            {formData.participants?.map((participant, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-2xl">👤</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{participant.name}</div>
                  {participant.dietary_restrictions && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      🥗 {participant.dietary_restrictions}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => editParticipant(index)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('events.courses')}</h2>
          <Input
            label={t('events.courseName')}
            value={courseForm.course_name}
            onChange={(e) => {
              setCourseForm({ ...courseForm, course_name: e.target.value });
              setRecipeSearch(e.target.value);
            }}
            placeholder={t('events.courseNamePlaceholder')}
          />
          {recipeSearch && recipes.length > 0 && (
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => {
                    setCourseForm({
                      ...courseForm,
                      course_name: recipe.name,
                    });
                    setRecipeSearch('');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">{recipe.name}</div>
                  {(recipe.description || recipe.categories.length > 0) && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {recipe.description || recipe.categories.map(c => c.category_name).join(', ')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" onClick={addCourse} variant="secondary">
              {editingCourseIndex !== null ? t('events.updateCourse') : t('events.addCourse')}
            </Button>
            {editingCourseIndex !== null && (
              <Button type="button" onClick={cancelEditCourse} variant="ghost">
                {t('common.cancelEdit')}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {formData.courses?.map((course, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-600 dark:bg-primary-500 text-white rounded-full font-medium">
                  {course.course_number}
                </span>
                <div className="flex-1 font-medium text-gray-900 dark:text-gray-100">{course.course_name}</div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => editCourse(index)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCourse(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? t('events.editEvent') : t('events.createEvent')}
        </Button>
      </div>
    </form>
  );
}

// Made with Bob