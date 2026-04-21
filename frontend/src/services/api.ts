import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

type CommonLogLevel = 'INFO' | 'ERROR';
type CommonLogSource = 'frontend';

const pendingRequestTimes = new Map<string, number>();

function formatApacheTimestamp(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const timezoneOffsetMinutes = -date.getTimezoneOffset();
  const sign = timezoneOffsetMinutes >= 0 ? '+' : '-';
  const offsetHours = String(Math.floor(Math.abs(timezoneOffsetMinutes) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(timezoneOffsetMinutes) % 60).padStart(2, '0');

  return `${day}/${month}/${year}:${hours}:${minutes}:${seconds} ${sign}${offsetHours}${offsetMinutes}`;
}

function buildFullUrl(baseURL?: string, url?: string): string {
  if (!url) return baseURL || '-';
  if (/^https?:\/\//i.test(url)) return url;
  if (!baseURL) return url;
  return `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

function getRequestKey(method?: string, fullUrl?: string): string {
  return `${(method || 'GET').toUpperCase()} ${fullUrl || '-'}`;
}

function logCommonEvent({
  level,
  source,
  method,
  url,
  status,
  responseSize,
  durationMs,
  message = '-',
  userAgent = navigator.userAgent,
  referer = window.location.href,
}: {
  level: CommonLogLevel;
  source: CommonLogSource;
  method: string;
  url: string;
  status: number;
  responseSize: number;
  durationMs: number;
  message?: string;
  userAgent?: string;
  referer?: string;
}) {
  const timestamp = formatApacheTimestamp(new Date());
  const line = `browser - - [${timestamp}] "${method} ${url} HTTP/1.1" ${status} ${responseSize} "${referer}" "${userAgent}" source=${source} duration_ms=${durationMs.toFixed(2)} message="${String(message).replace(/"/g, "'")}"`;

  if (level === 'ERROR') {
    console.error(line);
  } else {
    console.log(line);
  }
}

logCommonEvent({
  level: 'INFO',
  source: 'frontend',
  method: 'SYSTEM',
  url: API_BASE_URL,
  status: 200,
  responseSize: 0,
  durationMs: 0,
  message: `frontend_api_initialized mode=${import.meta.env.MODE} source=${import.meta.env.VITE_API_URL ? 'env' : 'fallback'}`,
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const method = (config.method || 'GET').toUpperCase();
    const fullUrl = buildFullUrl(config.baseURL, config.url);
    const requestKey = getRequestKey(method, fullUrl);
    pendingRequestTimes.set(requestKey, performance.now());

    logCommonEvent({
      level: 'INFO',
      source: 'frontend',
      method,
      url: fullUrl,
      status: 0,
      responseSize: 0,
      durationMs: 0,
      message: `request_started headers=${JSON.stringify(config.headers ?? {})} body=${JSON.stringify(config.data ?? null)}`,
    });

    return config;
  },
  (error) => {
    logCommonEvent({
      level: 'ERROR',
      source: 'frontend',
      method: 'UNKNOWN',
      url: '-',
      status: 0,
      responseSize: 0,
      durationMs: 0,
      message: `request_setup_error error=${error?.message ?? 'unknown'}`,
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const method = (response.config.method || 'GET').toUpperCase();
    const fullUrl = buildFullUrl(response.config.baseURL, response.config.url);
    const requestKey = getRequestKey(method, fullUrl);
    const startTime = pendingRequestTimes.get(requestKey) ?? performance.now();
    pendingRequestTimes.delete(requestKey);
    const durationMs = performance.now() - startTime;
    const responseBody = JSON.stringify(response.data ?? '');
    const responseSize = new TextEncoder().encode(responseBody).length;

    logCommonEvent({
      level: 'INFO',
      source: 'frontend',
      method,
      url: fullUrl,
      status: response.status,
      responseSize,
      durationMs,
      message: `response_received status_text=${response.statusText} body=${responseBody}`,
    });

    return response;
  },
  (error) => {
    const method = (error.config?.method || 'GET').toUpperCase();
    const fullUrl = buildFullUrl(error.config?.baseURL, error.config?.url);
    const requestKey = getRequestKey(method, fullUrl);
    const startTime = pendingRequestTimes.get(requestKey) ?? performance.now();
    pendingRequestTimes.delete(requestKey);
    const durationMs = performance.now() - startTime;
    const responseBody = JSON.stringify(error.response?.data ?? error.message ?? '');
    const responseSize = new TextEncoder().encode(responseBody).length;
    const status = error.response?.status ?? 0;

    logCommonEvent({
      level: 'ERROR',
      source: 'frontend',
      method,
      url: fullUrl,
      status,
      responseSize,
      durationMs,
      message: `request_failed error=${error.message} body=${responseBody}`,
    });

    return Promise.reject(error);
  }
);

export default api;

// Made with Bob
