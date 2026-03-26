import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/common/Card';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, glassMode, setGlassMode, stepImageSize, setStepImageSize } = useTheme();

  const themeOptions = [
    { value: 'light', label: t('settings.lightMode'), icon: '☀️' },
    { value: 'dark', label: t('settings.darkMode'), icon: '🌙' },
    { value: 'system', label: t('settings.systemMode'), icon: '💻' },
  ] as const;

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('settings.title')}
      </h1>

      {/* Theme Settings */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('settings.appearance')}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings.theme')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`
                    relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                    ${
                      theme === option.value
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  {theme === option.value && (
                    <span className="absolute top-2 right-2 text-primary-600 dark:text-primary-400">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Glass Mode Toggle */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.glassMode')}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('settings.glassModeDescription')}
                </p>
              </div>
              <button
                onClick={() => setGlassMode(!glassMode)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${glassMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${glassMode ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </label>
          </div>

          {/* Step Image Size Setting */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings.stepImageSize')}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('settings.stepImageSizeDescription')}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setStepImageSize(size)}
                  className={`
                    relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${
                      stepImageSize === size
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`
                    bg-gray-300 dark:bg-gray-600 rounded
                    ${size === 'small' ? 'w-12 h-8' : size === 'large' ? 'w-24 h-16' : 'w-16 h-12'}
                  `} />
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {t(`settings.${size}`)}
                  </span>
                  {stepImageSize === size && (
                    <span className="absolute top-2 right-2 text-primary-600 dark:text-primary-400">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Language Settings */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('settings.language')}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings.selectLanguage')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => i18n.changeLanguage(option.value)}
                  className={`
                    relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                    ${
                      i18n.language === option.value
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <span className="text-2xl">{option.flag}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  {i18n.language === option.value && (
                    <span className="absolute top-2 right-2 text-primary-600 dark:text-primary-400">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('settings.about')}
        </h2>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-medium text-gray-900 dark:text-white">
              {t('common.appName')}
            </span>
          </p>
          <p className="text-sm">
            {t('settings.version')}: 1.0.0
          </p>
        </div>
      </Card>
    </div>
  );
}

// Made with Bob
