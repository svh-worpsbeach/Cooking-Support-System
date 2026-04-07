import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import EventForm from '../components/events/EventForm';
import MultiSelectToolbar from '../components/common/MultiSelectToolbar';
import type { Event, EventCreate } from '../types';

export default function EventsPage() {
  const { t } = useTranslation();
  const { events, isLoading, error, createEvent, deleteEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());

  const handleCreateEvent = async (data: EventCreate) => {
    await createEvent(data);
    setIsModalOpen(false);
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectActive(!isMultiSelectActive);
    if (isMultiSelectActive) {
      setSelectedEvents(new Set());
    }
  };

  const toggleEventSelection = (eventId: number) => {
    const newSelection = new Set(selectedEvents);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEvents(newSelection);
  };

  const handleDeleteSelected = async () => {
    if (selectedEvents.size === 0) return;
    
    const count = selectedEvents.size;
    if (!window.confirm(t('multiSelect.confirmDelete', { count }))) return;

    try {
      await Promise.all(
        Array.from(selectedEvents).map(id => deleteEvent(id))
      );
      setSelectedEvents(new Set());
      setIsMultiSelectActive(false);
    } catch (err) {
      console.error('Failed to delete events:', err);
      alert(t('errors.deleteFailed'));
    }
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.events')}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {t('events.createEvent')}
        </Button>
      </div>

      {/* Multi-Select Toolbar */}
      <MultiSelectToolbar
        isMultiSelectActive={isMultiSelectActive}
        selectedCount={selectedEvents.size}
        onToggleMultiSelect={handleToggleMultiSelect}
        onDelete={handleDeleteSelected}
        onClearSelection={() => setSelectedEvents(new Set())}
      />

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('events.noEvents')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('events.startPlanning')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: Event) => (
            <div key={event.id} className="relative">
              {isMultiSelectActive && (
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleEventSelection(event.id);
                    }}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              )}
              <Link to={`/events/${event.id}`} onClick={(e) => isMultiSelectActive && e.preventDefault()}>
                <Card hover className={isMultiSelectActive && selectedEvents.has(event.id) ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {event.name}
                </h3>
                {event.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}
                {event.event_date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    📅 {new Date(event.event_date).toLocaleDateString()}
                  </p>
                )}
                {(event.participants || event.courses) && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    {event.participants && <span>👥 {event.participants.length} {t('events.participants')}</span>}
                    {event.courses && <span>🍽️ {event.courses.length} {t('events.courses')}</span>}
                  </div>
                )}
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('events.createEvent')}
        size="lg"
      >
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Made with Bob