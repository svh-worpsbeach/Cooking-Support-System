import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGuests } from '../hooks/useGuests';
import { useEvents } from '../hooks/useEvents';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import GuestForm from '../components/guests/GuestForm';
import EventForm from '../components/events/EventForm';
import MultiSelectToolbar from '../components/common/MultiSelectToolbar';
import type { Guest, GuestCreate, Event, EventCreate } from '../types';

export default function GuestsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { guests, isLoading, error, createGuest, updateGuest, deleteGuest } = useGuests('');
  const { events, createEvent, updateEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuestId, setDeletingGuestId] = useState<number | null>(null);
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<Set<number>>(new Set());
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isAddToEventModalOpen, setIsAddToEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleCreateGuest = async (data: GuestCreate) => {
    try {
      await createGuest(data);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create guest:', err);
      alert(t('errors.saveFailed'));
    }
  };

  const handleUpdateGuest = async (data: GuestCreate) => {
    if (editingGuest) {
      try {
        await updateGuest(editingGuest.id, data);
        setEditingGuest(null);
        setIsModalOpen(false);
      } catch (err) {
        console.error('Failed to update guest:', err);
        alert(t('errors.saveFailed'));
      }
    }
  };

  const handleDeleteGuest = async (id: number) => {
    if (window.confirm(t('guests.deleteConfirm'))) {
      setDeletingGuestId(id);
      try {
        await deleteGuest(id);
      } finally {
        setDeletingGuestId(null);
      }
    }
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectActive(!isMultiSelectActive);
    if (isMultiSelectActive) {
      setSelectedGuests(new Set());
    }
  };

  // Multi-select handlers
  const toggleGuestSelection = (guestId: number) => {
    const newSelection = new Set(selectedGuests);
    if (newSelection.has(guestId)) {
      newSelection.delete(guestId);
    } else {
      newSelection.add(guestId);
    }
    setSelectedGuests(newSelection);
  };

  const handleDeleteSelected = async () => {
    if (selectedGuests.size === 0) return;
    
    const count = selectedGuests.size;
    if (!window.confirm(t('multiSelect.confirmDelete', { count }))) return;

    try {
      await Promise.all(
        Array.from(selectedGuests).map(id => deleteGuest(id))
      );
      setSelectedGuests(new Set());
      setIsMultiSelectActive(false);
    } catch (err) {
      console.error('Failed to delete guests:', err);
      alert(t('errors.deleteFailed'));
    }
  };

  const handleCreateEventWithGuests = async (data: EventCreate) => {
    const selectedGuestData = guests
      .filter(g => selectedGuests.has(g.id))
      .map(g => ({
        name: `${g.first_name} ${g.last_name}`,
        dietary_restrictions: [g.intolerances, g.favorites, g.dietary_notes].filter(Boolean).join(', ') || '',
      }));

    const eventData = {
      ...data,
      participants: [...(data.participants || []), ...selectedGuestData],
    };

    await createEvent(eventData);
    setIsCreateEventModalOpen(false);
    setSelectedGuests(new Set());
    navigate('/events');
  };

  const handleAddGuestsToEvent = async (data: EventCreate) => {
    if (!selectedEvent) return;

    const selectedGuestData = guests
      .filter(g => selectedGuests.has(g.id))
      .map(g => ({
        name: `${g.first_name} ${g.last_name}`,
        dietary_restrictions: [g.intolerances, g.favorites, g.dietary_notes].filter(Boolean).join(', ') || '',
      }));

    const eventData = {
      ...data,
      participants: [...(data.participants || []), ...selectedGuestData],
    };

    await updateEvent(selectedEvent.id, eventData);
    setIsAddToEventModalOpen(false);
    setSelectedEvent(null);
    setSelectedGuests(new Set());
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.guests')}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {t('guests.createGuest')}
        </Button>
      </div>

      {/* Multi-Select Toolbar */}
      <MultiSelectToolbar
        isMultiSelectActive={isMultiSelectActive}
        selectedCount={selectedGuests.size}
        onToggleMultiSelect={handleToggleMultiSelect}
        onDelete={handleDeleteSelected}
        onClearSelection={() => setSelectedGuests(new Set())}
        additionalActions={
          selectedGuests.size > 0 && (
            <>
              <Button onClick={() => setIsCreateEventModalOpen(true)} variant="secondary">
                🎉 {t('guests.createEventWithSelected')} ({selectedGuests.size})
              </Button>
              <Button onClick={() => setIsAddToEventModalOpen(true)} variant="secondary">
                ➕ {t('guests.addToEvent')} ({selectedGuests.size})
              </Button>
            </>
          )
        }
      />

      {guests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('guests.noGuests')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('guests.addGuests')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests.map((guest: Guest) => (
            <Card
              key={guest.id}
              className={`relative ${isMultiSelectActive && selectedGuests.has(guest.id) ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}`}
            >
              {isMultiSelectActive && (
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedGuests.has(guest.id)}
                    onChange={() => toggleGuestSelection(guest.id)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              )}
              <div className={`flex items-start justify-between mb-3 ${isMultiSelectActive ? 'ml-8' : ''}`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {guest.first_name} {guest.last_name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(guest)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    disabled={deletingGuestId === guest.id}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm disabled:opacity-50"
                  >
                    {deletingGuestId === guest.id ? '...' : t('common.delete')}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {guest.email && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span>📧</span>
                    <span>{guest.email}</span>
                  </div>
                )}
                {guest.phone && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span>📞</span>
                    <span>{guest.phone}</span>
                  </div>
                )}
                {(guest.city || guest.country) && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span>📍</span>
                    <span>
                      {[guest.city, guest.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {guest.intolerances && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{t('guests.intolerances')}</div>
                    <div className="text-gray-700 dark:text-gray-300">{guest.intolerances}</div>
                  </div>
                )}
                {guest.favorites && (
                  <div className="mt-2">
                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{t('guests.favorites')}</div>
                    <div className="text-gray-700 dark:text-gray-300">{guest.favorites}</div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingGuest ? t('guests.editGuest') : t('guests.createGuest')}
        size="lg"
      >
        <GuestForm
          initialData={editingGuest || undefined}
          onSubmit={editingGuest ? handleUpdateGuest : handleCreateGuest}
          onCancel={closeModal}
        />
      </Modal>

      {/* Create Event with Selected Guests Modal */}
      <Modal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        title={t('guests.createEventWithSelected')}
        size="xl"
      >
        <EventForm
          initialData={{
            name: '',
            description: '',
            theme: '',
            event_date: '',
            participants: guests
              .filter(g => selectedGuests.has(g.id))
              .map(g => ({
                name: `${g.first_name} ${g.last_name}`,
                dietary_restrictions: [g.intolerances, g.favorites, g.dietary_notes].filter(Boolean).join(', ') || '',
              })),
            courses: [],
          }}
          onSubmit={handleCreateEventWithGuests}
          onCancel={() => setIsCreateEventModalOpen(false)}
        />
      </Modal>

      {/* Add to Event Modal */}
      <Modal
        isOpen={isAddToEventModalOpen}
        onClose={() => {
          setIsAddToEventModalOpen(false);
          setSelectedEvent(null);
        }}
        title={t('guests.addToEvent')}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('guests.selectEventToAdd')}
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
                    📅 {new Date(event.event_date).toLocaleDateString()}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Edit Event Modal (for adding guests) */}
      {selectedEvent && (
        <Modal
          isOpen={isAddToEventModalOpen && selectedEvent !== null}
          onClose={() => {
            setIsAddToEventModalOpen(false);
            setSelectedEvent(null);
          }}
          title={`${t('guests.addToEvent')}: ${selectedEvent.name}`}
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
            onSubmit={handleAddGuestsToEvent}
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