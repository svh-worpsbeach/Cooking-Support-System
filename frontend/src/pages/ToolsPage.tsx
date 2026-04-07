import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTools } from '../hooks/useTools';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import ToolForm from '../components/tools/ToolForm';
import MultiSelectToolbar from '../components/common/MultiSelectToolbar';
import type { CookingTool, CookingToolCreate } from '../types';

export default function ToolsPage() {
  const { t } = useTranslation();
  const { tools, isLoading, error, createTool, deleteTool } = useTools();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedTools, setSelectedTools] = useState<Set<number>>(new Set());

  const handleCreateTool = async (data: CookingToolCreate) => {
    await createTool(data);
    setIsModalOpen(false);
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectActive(!isMultiSelectActive);
    if (isMultiSelectActive) {
      setSelectedTools(new Set());
    }
  };

  const toggleToolSelection = (toolId: number) => {
    const newSelection = new Set(selectedTools);
    if (newSelection.has(toolId)) {
      newSelection.delete(toolId);
    } else {
      newSelection.add(toolId);
    }
    setSelectedTools(newSelection);
  };

  const handleDeleteSelected = async () => {
    if (selectedTools.size === 0) return;
    
    const count = selectedTools.size;
    if (!window.confirm(t('multiSelect.confirmDelete', { count }))) return;

    try {
      await Promise.all(
        Array.from(selectedTools).map(id => deleteTool(id))
      );
      setSelectedTools(new Set());
      setIsMultiSelectActive(false);
    } catch (err) {
      console.error('Failed to delete tools:', err);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.tools')}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {t('tools.createTool')}
        </Button>
      </div>

      {/* Multi-Select Toolbar */}
      <MultiSelectToolbar
        isMultiSelectActive={isMultiSelectActive}
        selectedCount={selectedTools.size}
        onToggleMultiSelect={handleToggleMultiSelect}
        onDelete={handleDeleteSelected}
        onClearSelection={() => setSelectedTools(new Set())}
      />

      {tools.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔪</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('tools.noTools')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('tools.startTracking')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool: CookingTool) => (
            <div key={tool.id} className="relative">
              {isMultiSelectActive && (
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedTools.has(tool.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleToolSelection(tool.id);
                    }}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              )}
              <Link to={`/tools/${tool.id}`} onClick={(e) => isMultiSelectActive && e.preventDefault()}>
                <Card hover className={isMultiSelectActive && selectedTools.has(tool.id) ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}>
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
          </div>
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