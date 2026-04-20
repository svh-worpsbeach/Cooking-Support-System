import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      title: t('nav.recipes'),
      description: 'Manage your recipes with ingredients, steps, and images',
      link: '/recipes',
      icon: '📖',
    },
    {
      title: t('nav.events'),
      description: 'Plan cooking events with courses and shopping lists',
      link: '/events',
      icon: '🎉',
    },
    {
      title: t('nav.tools'),
      description: 'Track your cooking tools and equipment',
      link: '/tools',
      icon: '🔪',
    },
    {
      title: t('nav.storage'),
      description: 'Manage herbs, spices, and supplies',
      link: '/storage',
      icon: '🏺',
    },
    {
      title: t('nav.locations'),
      description: 'Organize storage locations for tools and supplies',
      link: '/locations',
      icon: '📍',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('common.appName')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Your comprehensive cooking management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {features.map((feature) => (
          <Link
            key={feature.link}
            to={feature.link}
            className="block p-6 bg-white/90 dark:bg-gray-800/75 backdrop-blur-md rounded-lg shadow-md border border-gray-200/30 dark:border-gray-700/30 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {feature.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Made with Bob
