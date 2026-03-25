import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocations } from '../hooks/useLocations';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import LocationForm from '../components/locations/LocationForm';
import type { Location, LocationCreate } from '../types';

export default function LocationsPage() {
  const { t } = useTranslation();
  const { locations, isLoading, error, createLocation } = useLocations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateLocation = async (data: LocationCreate) => {
    await createLocation(data);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.locations')}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {t('locations.createLocation')}
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('locations.noLocations')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('locations.addLocations')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location: Location) => (
            <Link key={location.id} to={`/locations/${location.id}`}>
              <Card hover>
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