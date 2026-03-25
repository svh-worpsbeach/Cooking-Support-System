import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import EventForm from '../components/events/EventForm';
import type { Event, EventCreate } from '../types';

export default function EventsPage() {
  const { t } = useTranslation();
  const { events, isLoading, error, createEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateEvent = async (data: EventCreate) => {
    await createEvent(data);
    setIsModalOpen(false);
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

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('events.noEvents')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('events.startPlanning')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: Event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card hover>
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