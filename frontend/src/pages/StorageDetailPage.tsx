import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStorageItem } from '../hooks/useStorage';
import { useLocations } from '../hooks/useLocations';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { StorageItemCreate } from '../types';

export default function StorageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { item, isLoading, error } = useStorageItem(Number(id));
  const { locations } = useLocations();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [editData, setEditData] = useState<StorageItemCreate>({
    name: '',
    category: '',
    quantity: undefined,
    unit: '',
    expiry_date: '',
    location_id: undefined,
  });

  // Calculate expiry status - must be before early returns to follow React Hooks rules
  const { isExpired, isExpiringSoon } = useMemo(() => {
    if (!item?.expiry_date) {
      return { isExpired: false, isExpiringSoon: false };
    }
    
    const now = new Date();
    const expiryDate = new Date(item.expiry_date);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const expired = expiryDate < now;
    const expiringSoon = expiryDate < sevenDaysFromNow && !expired;
    
    return { isExpired: expired, isExpiringSoon: expiringSoon };
  }, [item]);

  const handleEditToggle = () => {
    if (!isEditMode && item) {
      // Entering edit mode - initialize form
      setEditData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || '',
        expiry_date: item.expiry_date || '',
        location_id: item.location_id,
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/storage/${id}`, editData);
      setIsEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update storage item:', err);
      alert(t('errors.saveFailed'));
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (item) {
      setEditData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || '',
        expiry_date: item.expiry_date || '',
        location_id: item.location_id,
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('storage.deleteConfirm'))) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.delete(`/storage/${id}`);
      navigate('/storage');
    } catch (err) {
      console.error('Failed to delete storage item:', err);
      alert(t('errors.deleteFailed'));
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || t('errors.loadFailed')}</p>
        <Button onClick={() => navigate('/storage')}>{t('common.back')} {t('nav.storage')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/storage"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
        >
          ← {t('common.back')} {t('nav.storage')}
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

      {/* Item Header */}
      <div>
        {isEditMode ? (
          <div className="space-y-4">
            <Input
              label={t('storage.name')}
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              required
              className="text-4xl font-bold"
            />
            <Input
              label={t('storage.category')}
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              required
              placeholder="e.g., Herbs, Spices, Oils"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{item.name}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* Expiry Warning */}
      {!isEditMode && isExpired && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-semibold">{t('storage.expired')}</div>
              <div className="text-sm">
                {t('storage.expiredOn')} {new Date(item.expiry_date!).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isEditMode && isExpiringSoon && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <span className="text-2xl">⏰</span>
            <div>
              <div className="font-semibold">{t('storage.expiringSoon')}</div>
              <div className="text-sm">
                {t('storage.expiresOn')} {new Date(item.expiry_date!).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('storage.details')}</h2>
        <div className="space-y-4">
          {isEditMode ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('storage.quantity')}
                  type="number"
                  step="0.01"
                  value={editData.quantity || ''}
                  onChange={(e) => setEditData({ ...editData, quantity: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Amount"
                />
                <Input
                  label={t('storage.unit')}
                  value={editData.unit}
                  onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                  placeholder="e.g., grams, ml, pieces"
                />
              </div>
              <Input
                label={t('storage.expiryDate')}
                type="date"
                value={editData.expiry_date}
                onChange={(e) => setEditData({ ...editData, expiry_date: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('storage.location')}
                </label>
                <select
                  value={editData.location_id || ''}
                  onChange={(e) => setEditData({ ...editData, location_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">{t('storage.selectLocation')}</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {item.quantity && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{t('storage.quantity')}</div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {item.quantity}
                      {item.unit && ` ${item.unit}`}
                    </div>
                  </div>
                </div>
              )}
              {item.expiry_date && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{t('storage.expiryDate')}</div>
                    <div className={isExpired ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-gray-300'}>
                      {new Date(item.expiry_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {isExpired && ` (${t('storage.expired')})`}
                      {isExpiringSoon && ` (${t('storage.expiringSoon')})`}
                    </div>
                  </div>
                </div>
              )}
              {item.location && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{t('storage.location')}</div>
                    <div className="text-gray-600 dark:text-gray-300">
                      <Link
                        to={`/locations/${item.location.id}`}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
                      >
                        {item.location.name}
                      </Link>
                      {item.location.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.location.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{t('storage.added')}</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
              {item.updated_at !== item.created_at && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{t('storage.lastUpdated')}</div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {new Date(item.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

// Made with Bob