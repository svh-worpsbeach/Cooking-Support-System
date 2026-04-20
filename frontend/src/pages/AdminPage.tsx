import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDateTime } from '../utils/timeUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface DatabaseConfig {
  database_type: string;
  database_url: string;
  pool_size?: number;
  max_overflow?: number;
  pool_pre_ping?: boolean;
  echo_sql: boolean;
}

interface SystemConfig {
  database: DatabaseConfig;
  cors_origins: string[];
  upload_directories: Record<string, string>;
}

interface SystemStats {
  database_size?: string;
  total_recipes: number;
  total_events: number;
  total_tools: number;
  total_storage_items: number;
  total_locations: number;
  uptime?: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  message: string;
  details?: Record<string, any>;
}

interface LogsResponse {
  logs: LogEntry[];
  total_count: number;
  page: number;
  page_size: number;
}

export default function AdminPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'config' | 'logs' | 'stats'>('config');
  const [logPage, setLogPage] = useState(1);
  const [logLevel, setLogLevel] = useState<string>('');
  const [logSource, setLogSource] = useState<string>('');
  const [seedStatus, setSeedStatus] = useState<any>(null);
  const [pollingSeedStatus, setPollingSeedStatus] = useState(false);

  // Fetch system configuration
  const { data: config, isLoading: configLoading } = useQuery<SystemConfig>({
    queryKey: ['admin', 'config'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/config`);
      return response.data;
    },
  });

  // Fetch system statistics
  const { data: stats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/stats`);
      return response.data;
    },
  });

  // Fetch logs
  const { data: logsData, isLoading: logsLoading } = useQuery<LogsResponse>({
    queryKey: ['admin', 'logs', logPage, logLevel, logSource],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: logPage.toString(),
        page_size: '50',
      });
      if (logLevel) params.append('level', logLevel);
      if (logSource) params.append('source', logSource);
      
      const response = await axios.get(`${API_URL}/admin/logs?${params}`);
      return response.data;
    },
  });

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`${API_URL}/admin/logs/clear`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] });
      alert(t('admin.logsCleared'));
    },
  });

  // Load seed data mutation
  const loadSeedDataMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${API_URL}/admin/data/seed`);
      return response.data;
    },
    onSuccess: () => {
      // Start polling for status
      setPollingSeedStatus(true);
      pollSeedStatus();
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Poll seed status
  const pollSeedStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/data/seed/status`);
      const status = response.data;
      setSeedStatus(status);

      if (status.is_loading) {
        // Continue polling
        setTimeout(pollSeedStatus, 1000);
      } else {
        // Finished
        setPollingSeedStatus(false);
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        
        if (status.error) {
          alert(`Error: ${status.error}`);
        } else {
          alert(t('admin.seedDataLoaded'));
        }
      }
    } catch (error: any) {
      console.error('Error polling seed status:', error);
      setPollingSeedStatus(false);
    }
  };

  // Clear all data mutation
  const clearAllDataMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`${API_URL}/admin/data/clear`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      alert(t('admin.allDataCleared'));
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    },
  });

  const handleClearLogs = () => {
    if (window.confirm(t('admin.clearLogsConfirm'))) {
      clearLogsMutation.mutate();
    }
  };

  const handleLoadSeedData = () => {
    if (window.confirm(t('admin.loadSeedDataConfirm'))) {
      setSeedStatus(null);
      loadSeedDataMutation.mutate();
    }
  };

  const handleClearAllData = () => {
    if (window.confirm(t('admin.clearAllDataConfirm'))) {
      clearAllDataMutation.mutate();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return formatDateTime(timestamp);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 dark:text-red-400';
      case 'WARNING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'INFO':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('admin.title')}
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'config'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {t('admin.configuration')}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {t('admin.statistics')}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {t('admin.logs')}
          </button>
        </nav>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Data Management Section */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.dataManagement')}
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleLoadSeedData}
                variant="primary"
                disabled={loadSeedDataMutation.isPending || clearAllDataMutation.isPending || pollingSeedStatus}
              >
                {pollingSeedStatus ? t('admin.loadingSeedData') : t('admin.loadSeedData')}
              </Button>
              <Button
                onClick={handleClearAllData}
                variant="danger"
                disabled={loadSeedDataMutation.isPending || clearAllDataMutation.isPending || pollingSeedStatus}
              >
                {clearAllDataMutation.isPending ? t('admin.clearingData') : t('admin.clearAllData')}
              </Button>
            </div>
            
            {/* Seed Status Progress */}
            {seedStatus && seedStatus.is_loading && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.seedProgress')}: {seedStatus.progress}%
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {seedStatus.message}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${seedStatus.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {t('admin.seedData')}: {t('admin.loadSeedDataConfirm')}
            </p>
          </Card>

          {configLoading ? (
            <LoadingSpinner />
          ) : config ? (
            <>
              {/* Database Configuration */}
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('admin.database')}
                </h2>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.databaseType')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {config.database.database_type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.databaseUrl')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">
                      {config.database.database_url}
                    </dd>
                  </div>
                  {config.database.pool_size && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('admin.poolSize')}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {config.database.pool_size}
                      </dd>
                    </div>
                  )}
                  {config.database.max_overflow && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('admin.maxOverflow')}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {config.database.max_overflow}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.echoSql')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {config.database.echo_sql ? t('common.yes') : t('common.no')}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* CORS Configuration */}
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('admin.corsOrigins')}
                </h2>
                <ul className="space-y-2">
                  {config.cors_origins.map((origin, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded"
                    >
                      {origin}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Upload Directories */}
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('admin.uploadDirectories')}
                </h2>
                <dl className="space-y-3">
                  {Object.entries(config.upload_directories).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                        {key}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div>
          {statsLoading ? (
            <LoadingSpinner />
          ) : stats ? (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('admin.statistics')}
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.database_size && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.databaseSize')}
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.database_size}
                    </dd>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.totalRecipes')}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total_recipes}
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.totalEvents')}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total_events}
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.totalTools')}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total_tools}
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.totalStorageItems')}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total_storage_items}
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.totalLocations')}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total_locations}
                  </dd>
                </div>
              </dl>
            </Card>
          ) : null}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.filterByLevel')}
                </label>
                <select
                  value={logLevel}
                  onChange={(e) => {
                    setLogLevel(e.target.value);
                    setLogPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('admin.allLevels')}</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.filterBySource')}
                </label>
                <input
                  type="text"
                  value={logSource}
                  onChange={(e) => {
                    setLogSource(e.target.value);
                    setLogPage(1);
                  }}
                  placeholder={t('admin.allSources')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] })}
                  variant="secondary"
                >
                  {t('admin.refresh')}
                </Button>
              </div>
              <div>
                <Button onClick={handleClearLogs} variant="danger">
                  {t('admin.clearLogs')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Logs List */}
          {logsLoading ? (
            <LoadingSpinner />
          ) : logsData && logsData.logs.length > 0 ? (
            <>
              <div className="space-y-2">
                {logsData.logs.map((log, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(
                            log.level
                          )} bg-opacity-10`}
                        >
                          {log.level}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {log.source}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                              {t('admin.details')}
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {logsData.total_count > 50 && (
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {t('admin.page')} {logsData.page} ({logsData.total_count} {t('admin.itemsPerPage')})
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                        disabled={logPage === 1}
                        variant="secondary"
                      >
                        {t('common.previous')}
                      </Button>
                      <Button
                        onClick={() => setLogPage((p) => p + 1)}
                        disabled={logsData.logs.length < 50}
                        variant="secondary"
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <p className="text-center text-gray-500 dark:text-gray-400">{t('admin.noLogs')}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Made with Bob