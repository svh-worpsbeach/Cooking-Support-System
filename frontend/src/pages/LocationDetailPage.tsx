import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../hooks/useLocations';
import { useTools } from '../hooks/useTools';
import { useStorage } from '../hooks/useStorage';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { LocationCreate } from '../types';

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { location, isLoading, error } = useLocation(Number(id));
  const { tools } = useTools();
  const { items: storageItems } = useStorage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [editData, setEditData] = useState<LocationCreate>({
    name: '',
    description: '',
  });

  // Initialize edit data when location loads or edit mode is enabled
  useState(() => {
    if (location && isEditMode) {
      setEditData({
        name: location.name,
        description: location.description || '',
      });
    }
  });

  const handleEditToggle = () => {
    if (!isEditMode && location) {
      // Entering edit mode - initialize form
      setEditData({
        name: location.name,
        description: location.description || '',
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/locations/${id}`, editData);
      setIsEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update location:', err);
      alert(t('errors.saveFailed'));
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (location) {
      setEditData({
        name: location.name,
        description: location.description || '',
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('locations.deleteConfirm'))) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.delete(`/locations/${id}`);
      navigate('/locations');
    } catch (err) {
      console.error('Failed to delete location:', err);
      alert(t('errors.deleteFailed'));
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (error || !location) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || t('errors.loadFailed')}</p>
        <Button onClick={() => navigate('/locations')}>{t('common.back')} {t('nav.locations')}</Button>
      </div>
    );
  }

  const locationTools = tools.filter(tool => tool.location_id === location.id);
  const locationStorage = storageItems.filter(item => item.location_id === location.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/locations"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
        >
          ← {t('common.back')} {t('nav.locations')}
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

      {/* Location Header */}
      <div>
        {isEditMode ? (
          <div className="space-y-4">
            <Input
              label={t('locations.name')}
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              required
              className="text-4xl font-bold"
            />
            <Textarea
              label={t('locations.description')}
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={3}
              className="text-lg"
            />
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{location.name}</h1>
            {location.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300">{location.description}</p>
            )}
          </>
        )}
      </div>

      {/* Location Details */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('locations.details')}</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('locations.created')}</div>
              <div className="text-gray-600 dark:text-gray-300">
                {new Date(location.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
          {location.updated_at !== location.created_at && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{t('locations.lastUpdated')}</div>
                <div className="text-gray-600 dark:text-gray-300">
                  {new Date(location.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tools at this Location */}
      {locationTools.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('locations.tools')} ({locationTools.length})
          </h2>
          <div className="space-y-2">
            {locationTools.map((tool) => (
              <Link
                key={tool.id}
                to={`/tools/${tool.id}`}
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔪</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{tool.name}</div>
                    {tool.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                        {tool.description}
                      </div>
                    )}
                    {tool.storage_location && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        📍 {tool.storage_location}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400 dark:text-gray-500">→</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Storage Items at this Location */}
      {locationStorage.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('locations.storageItems')} ({locationStorage.length})
          </h2>
          <div className="space-y-2">
            {locationStorage.map((item) => (
              <Link
                key={item.id}
                to={`/storage/${item.id}`}
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏺</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 mr-2">
                        {item.category}
                      </span>
                      {item.quantity && (
                        <span>
                          {item.quantity}
                          {item.unit && ` ${item.unit}`}
                        </span>
                      )}
                    </div>
                    {item.expiry_date && (
                      <div className={`text-sm ${
                        new Date(item.expiry_date) < new Date()
                          ? 'text-red-600 dark:text-red-400 font-semibold'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        📅 {t('locations.expires')}: {new Date(item.expiry_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400 dark:text-gray-500">→</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {locationTools.length === 0 && locationStorage.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-gray-600 dark:text-gray-400">{t('locations.noItemsAtLocation')}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

// Made with Bob