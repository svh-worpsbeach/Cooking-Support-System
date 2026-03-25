import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useStorage } from '../hooks/useStorage';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import StorageForm from '../components/storage/StorageForm';
import type { StorageItem, StorageItemCreate } from '../types';

export default function StoragePage() {
  const { t } = useTranslation();
  const { items, isLoading, error, createItem } = useStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateItem = async (data: StorageItemCreate) => {
    await createItem(data);
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

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, StorageItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.storage')}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {t('storage.createItem')}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏺</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('storage.noItems')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('storage.startTracking')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map((item: StorageItem) => (
                  <Link key={item.id} to={`/storage/${item.id}`}>
                    <Card hover>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {item.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {item.quantity && (
                        <p>📦 {item.quantity} {item.unit}</p>
                      )}
                      {item.expiry_date && (
                        <p className={new Date(item.expiry_date) < new Date() ? 'text-red-600 dark:text-red-400' : ''}>
                          📅 {t('locations.expires')}: {new Date(item.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                      {item.location && (
                        <p>🏠 {item.location.name}</p>
                      )}
                    </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('storage.createItem')}
        size="lg"
      >
        <StorageForm
          onSubmit={handleCreateItem}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Made with Bob