import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGuests } from '../hooks/useGuests';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import GuestForm from '../components/guests/GuestForm';
import type { Guest, GuestCreate } from '../types';

export default function GuestsPage() {
  const { t } = useTranslation();
  const { guests, isLoading, error, createGuest, updateGuest, deleteGuest } = useGuests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuestId, setDeletingGuestId] = useState<number | null>(null);

  const handleCreateGuest = async (data: GuestCreate) => {
    await createGuest(data);
    setIsModalOpen(false);
  };

  const handleUpdateGuest = async (data: GuestCreate) => {
    if (editingGuest) {
      await updateGuest(editingGuest.id, data);
      setEditingGuest(null);
      setIsModalOpen(false);
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

      {guests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('guests.noGuests')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('guests.addGuests')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests.map((guest: Guest) => (
            <Card key={guest.id}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {guest.name}
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
                {(guest.address_city || guest.address_country) && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span>📍</span>
                    <span>
                      {[guest.address_city, guest.address_country].filter(Boolean).join(', ')}
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
    </div>
  );
}

// Made with Bob