import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTool } from '../hooks/useTools';
import { useLocations } from '../hooks/useLocations';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { CookingToolCreate } from '../types';

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tool, isLoading, error } = useTool(Number(id));
  const { locations } = useLocations();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [editData, setEditData] = useState<CookingToolCreate>({
    name: '',
    description: '',
    storage_location: '',
    location_id: undefined,
  });

  const handleEditToggle = () => {
    if (!isEditMode && tool) {
      // Entering edit mode - initialize form
      setEditData({
        name: tool.name,
        description: tool.description || '',
        storage_location: tool.storage_location || '',
        location_id: tool.location_id,
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/tools/${id}`, editData);
      setIsEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update tool:', err);
      alert(t('errors.saveFailed'));
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (tool) {
      setEditData({
        name: tool.name,
        description: tool.description || '',
        storage_location: tool.storage_location || '',
        location_id: tool.location_id,
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('tools.deleteConfirm'))) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.delete(`/tools/${id}`);
      navigate('/tools');
    } catch (err) {
      console.error('Failed to delete tool:', err);
      alert(t('errors.deleteFailed'));
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (error || !tool) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || t('errors.loadFailed')}</p>
        <Button onClick={() => navigate('/tools')}>{t('common.back')} {t('nav.tools')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/tools"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
        >
          ← {t('common.back')} {t('nav.tools')}
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

      {/* Tool Image */}
      {tool.image_path && !isEditMode && (
        <div className="w-full h-96 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={tool.image_path}
            alt={tool.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Tool Header */}
      <div>
        {isEditMode ? (
          <div className="space-y-4">
            <Input
              label={t('tools.name')}
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              required
              className="text-4xl font-bold"
            />
            <Textarea
              label={t('tools.description')}
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={3}
              className="text-lg"
            />
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{tool.name}</h1>
            {tool.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300">{tool.description}</p>
            )}
          </>
        )}
      </div>

      {/* Tool Details */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('tools.details')}</h2>
        <div className="space-y-4">
          {isEditMode ? (
            <>
              <Input
                label={t('tools.storageLocation')}
                value={editData.storage_location}
                onChange={(e) => setEditData({ ...editData, storage_location: e.target.value })}
                placeholder="e.g., Top drawer, Cabinet 3"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tools.location')}
                </label>
                <select
                  value={editData.location_id || ''}
                  onChange={(e) => setEditData({ ...editData, location_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">{t('tools.selectLocation')}</option>
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
              {tool.storage_location && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{t('tools.storageLocation')}</div>
                    <div className="text-gray-600 dark:text-gray-300">{tool.storage_location}</div>
                  </div>
                </div>
              )}
              {tool.location && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{t('tools.location')}</div>
                    <div className="text-gray-600 dark:text-gray-300">
                      <Link
                        to={`/locations/${tool.location.id}`}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
                      >
                        {tool.location.name}
                      </Link>
                      {tool.location.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {tool.location.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {!isEditMode && (
            <>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{t('tools.added')}</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {new Date(tool.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
              {tool.updated_at !== tool.created_at && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{t('tools.lastUpdated')}</div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {new Date(tool.updated_at).toLocaleDateString('en-US', {
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