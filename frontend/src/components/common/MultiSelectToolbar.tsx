import { useTranslation } from 'react-i18next';
import Button from './Button';

interface MultiSelectToolbarProps {
  isMultiSelectActive: boolean;
  selectedCount: number;
  onToggleMultiSelect: () => void;
  onDelete: () => void;
  onClearSelection?: () => void;
  additionalActions?: React.ReactNode;
}

export default function MultiSelectToolbar({
  isMultiSelectActive,
  selectedCount,
  onToggleMultiSelect,
  onDelete,
  onClearSelection,
  additionalActions,
}: MultiSelectToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Toggle Multi-Select Button */}
      <Button
        onClick={onToggleMultiSelect}
        variant={isMultiSelectActive ? 'primary' : 'secondary'}
        className="flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        {isMultiSelectActive ? t('multiSelect.active') : t('multiSelect.activate')}
      </Button>

      {/* Actions when items are selected */}
      {isMultiSelectActive && selectedCount > 0 && (
        <>
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {selectedCount} {t('multiSelect.selected')}
            </span>
          </div>

          {/* Delete Button */}
          <Button
            onClick={onDelete}
            variant="danger"
            className="flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {t('multiSelect.delete')} ({selectedCount})
          </Button>

          {/* Clear Selection Button */}
          {onClearSelection && (
            <Button
              onClick={onClearSelection}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {t('multiSelect.clearSelection')}
            </Button>
          )}

          {/* Additional custom actions */}
          {additionalActions}
        </>
      )}
    </div>
  );
}

// Made with Bob