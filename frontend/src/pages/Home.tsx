import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { useEvents } from '../hooks/useEvents';
import { useTools } from '../hooks/useTools';
import { useStorage } from '../hooks/useStorage';
import { useLocations } from '../hooks/useLocations';
import { useGuests } from '../hooks/useGuests';
import Card from '../components/common/Card';

interface StatCardProps {
  title: string;
  count: number;
  icon: string;
  color: string;
  link: string;
}

function StatCard({ title, count, icon, color, link }: StatCardProps) {
  return (
    <Link
      to={link}
      className="block p-6 bg-white/90 dark:bg-gray-800/75 backdrop-blur-md rounded-lg shadow-md border border-gray-200/30 dark:border-gray-700/30 hover:shadow-lg transition-all hover:scale-105"
    >
      <div className="flex flex-col items-center space-y-3">
        <div className={`text-4xl ${color}`}>{icon}</div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white">{count}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300 text-center">{title}</div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { recipes } = useRecipes();
  const { events } = useEvents();
  const { tools } = useTools();
  const { items } = useStorage();
  const { locations } = useLocations();
  const { guests } = useGuests();

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

  const statistics = [
    {
      title: t('nav.recipes'),
      count: recipes.length,
      icon: '📖',
      color: 'text-blue-600 dark:text-blue-400',
      link: '/recipes',
    },
    {
      title: t('nav.events'),
      count: events.length,
      icon: '🎉',
      color: 'text-purple-600 dark:text-purple-400',
      link: '/events',
    },
    {
      title: t('nav.tools'),
      count: tools.length,
      icon: '🔪',
      color: 'text-orange-600 dark:text-orange-400',
      link: '/tools',
    },
    {
      title: t('nav.storage'),
      count: items.length,
      icon: '🏺',
      color: 'text-green-600 dark:text-green-400',
      link: '/storage',
    },
    {
      title: t('nav.locations'),
      count: locations.length,
      icon: '📍',
      color: 'text-red-600 dark:text-red-400',
      link: '/locations',
    },
    {
      title: t('nav.guests'),
      count: guests.length,
      icon: '👥',
      color: 'text-pink-600 dark:text-pink-400',
      link: '/guests',
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

      {/* Statistics Section */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('home.statistics')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statistics.map((stat) => (
            <StatCard
              key={stat.link}
              title={stat.title}
              count={stat.count}
              icon={stat.icon}
              color={stat.color}
              link={stat.link}
            />
          ))}
        </div>
      </Card>

      {/* Features Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('home.features')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}

// Made with Bob
