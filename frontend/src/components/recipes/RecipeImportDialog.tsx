import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface RecipeImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (recipeId: number) => void;
}

export default function RecipeImportDialog({
  isOpen,
  onClose,
  onImportSuccess,
}: RecipeImportDialogProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedSites, setSupportedSites] = useState<string[]>([]);

  // Load supported sites when dialog opens
  useState(() => {
    if (isOpen) {
      fetch(`${import.meta.env.VITE_API_URL}/recipes/import/supported-sites`)
        .then(res => res.json())
        .then(data => setSupportedSites(data.supported_sites || []))
        .catch(err => console.error('Failed to load supported sites:', err));
    }
  });

  const handleImport = async () => {
    if (!url.trim()) {
      setError(t('recipes.import.urlRequired'));
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('url', url.trim());

      const response = await fetch(`${import.meta.env.VITE_API_URL}/recipes/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('recipes.import.failed'));
      }

      const recipe = await response.json();
      onImportSuccess(recipe.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('recipes.import.failed'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setError(null);
    onClose();
  };

  const exampleUrls = [
    'https://www.chefkoch.de/rezepte/1208161226570428/Der-perfekte-Pfannkuchen-gelingt-einfach-immer.html',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('recipes.import.title')}
    >
      <div className="space-y-4">
        {/* Supported Sites Info */}
        {supportedSites.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
              {t('recipes.import.supportedSites')}:
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
              {supportedSites.map((site) => (
                <li key={site}>{site}</li>
              ))}
            </ul>
          </div>
        )}

        {/* URL Input */}
        <div>
          <Input
            label={t('recipes.import.urlLabel')}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.chefkoch.de/rezepte/..."
            disabled={isImporting}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('recipes.import.urlHint')}
          </p>
        </div>

        {/* Example URLs */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('recipes.import.examples')}:
          </p>
          <div className="space-y-1">
            {exampleUrls.map((exampleUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setUrl(exampleUrl)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline block truncate w-full text-left"
                disabled={isImporting}
              >
                {exampleUrl}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Import Info */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('recipes.import.info')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isImporting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={isImporting || !url.trim()}
          >
            {isImporting ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {t('recipes.import.importing')}
              </span>
            ) : (
              t('recipes.import.import')
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Made with Bob