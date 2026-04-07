import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocations } from '../hooks/useLocations';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import LocationForm from '../components/locations/LocationForm';
import MultiSelectToolbar from '../components/common/MultiSelectToolbar';
import type { Location, LocationCreate } from '../types';

export default function LocationsPage() {
  const { t } = useTranslation();
  const { locations, isLoading, error, createLocation, deleteLocation } = useLocations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set());

  const handleCreateLocation = async (data: LocationCreate) => {
    await createLocation(data);
    setIsModalOpen(false);
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectActive(!isMultiSelectActive);
    if (isMultiSelectActive) {
      setSelectedLocations(new Set());
    }
  };

  const toggleLocationSelection = (locationId: number) => {
    const newSelection = new Set(selectedLocations);
    if (newSelection.has(locationId)) {
      newSelection.delete(locationId);
    } else {
      newSelection.add(locationId);
    }
    setSelectedLocations(newSelection);
  };

  const handleDeleteSelected = async () => {
    if (selectedLocations.size === 0) return;
    
    const count = selectedLocations.size;
    if (!window.confirm(t('multiSelect.confirmDelete', { count }))) return;

    try {
      await Promise.all(
        Array.from(selectedLocations).map(id => deleteLocation(id))
      );
      setSelectedLocations(new Set());
      setIsMultiSelectActive(false);
    } catch (err) {
      console.error('Failed to delete locations:', err);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.locations')}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {t('locations.createLocation')}
        </Button>
      </div>

      {/* Multi-Select Toolbar */}
      <MultiSelectToolbar
        isMultiSelectActive={isMultiSelectActive}
        selectedCount={selectedLocations.size}
        onToggleMultiSelect={handleToggleMultiSelect}
        onDelete={handleDeleteSelected}
        onClearSelection={() => setSelectedLocations(new Set())}
      />

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('locations.noLocations')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('locations.addLocations')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location: Location) => (
            <div key={location.id} className="relative">
              {isMultiSelectActive && (
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedLocations.has(location.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleLocationSelection(location.id);
                    }}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              )}
              <Link to={`/locations/${location.id}`} onClick={(e) => isMultiSelectActive && e.preventDefault()}>
                <Card hover className={isMultiSelectActive && selectedLocations.has(location.id) ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {location.name}
              </h3>
              {location.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {location.description}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('locations.created')}: {new Date(location.created_at).toLocaleDateString()}
              </p>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('locations.createLocation')}
        size="lg"
      >
        <LocationForm
          onSubmit={handleCreateLocation}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Made with Bob