import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTool } from '../hooks/useTools';
import { api } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tool, isLoading, error } = useTool(Number(id));
  const [isDeleting, setIsDeleting] = useState(false);

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
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? `${t('common.delete')}...` : t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Tool Image */}
      {tool.image_path && (
        <div className="w-full h-96 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={`${import.meta.env.VITE_API_URL}${tool.image_path}`}
            alt={tool.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Tool Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{tool.name}</h1>
        {tool.description && (
          <p className="text-lg text-gray-600 dark:text-gray-300">{tool.description}</p>
        )}
      </div>

      {/* Tool Details */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('tools.details')}</h2>
        <div className="space-y-4">
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
                    to="/locations"
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
        </div>
      </Card>
    </div>
  );
}

// Made with Bob