import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTools } from '../hooks/useTools';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import ToolForm from '../components/tools/ToolForm';
import type { CookingTool, CookingToolCreate } from '../types';

export default function ToolsPage() {
  const { t } = useTranslation();
  const { tools, isLoading, error, createTool } = useTools();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTool = async (data: CookingToolCreate) => {
    await createTool(data);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.tools')}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {t('tools.createTool')}
        </Button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔪</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('tools.noTools')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('tools.startTracking')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool: CookingTool) => (
            <Link key={tool.id} to={`/tools/${tool.id}`}>
              <Card hover>
              {tool.image_path && (
                <div className="mb-4 -mx-6 -mt-6">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${tool.image_path}`}
                    alt={tool.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {tool.name}
              </h3>
              {tool.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {tool.description}
                </p>
              )}
              {tool.storage_location && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📍 {tool.storage_location}
                </p>
              )}
              {tool.location && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  🏠 {tool.location.name}
                </p>
              )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('tools.createTool')}
        size="lg"
      >
        <ToolForm
          onSubmit={handleCreateTool}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Made with Bob