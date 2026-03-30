import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Detailed initialization debug output
console.group('🚀 Frontend API Initialization');
console.log('📋 Configuration Source Analysis:');
console.log('  ├─ VITE_API_URL (from env):', import.meta.env.VITE_API_URL || '❌ NOT SET');
console.log('  ├─ Fallback value:', 'http://localhost:8000/api');
console.log('  └─ Final API_BASE_URL:', API_BASE_URL);
console.log('');
console.log('🔍 Configuration Details:');
console.log('  ├─ Build mode:', import.meta.env.MODE);
console.log('  ├─ Is production:', import.meta.env.PROD);
console.log('  ├─ Is development:', import.meta.env.DEV);
console.log('  └─ Base URL:', import.meta.env.BASE_URL);
console.log('');
console.log('📝 How VITE_API_URL is set:');
console.log('  1. Docker build arg: VITE_API_URL in docker-compose.yml');
console.log('  2. Local .env file: VITE_API_URL=... in frontend/.env');
console.log('  3. Fallback: http://localhost:8000/api (if not set)');
console.log('');
console.log('✅ Active configuration:', {
  source: import.meta.env.VITE_API_URL ? 'Environment Variable' : 'Fallback Default',
  value: API_BASE_URL,
  timestamp: new Date().toISOString()
});
console.groupEnd();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // Request made but no response
      console.error('❌ Network Error (No Response):', {
        url: error.config?.url,
        message: error.message,
        request: error.request
      });
    } else {
      // Something else happened
      console.error('❌ Request Setup Error:', {
        message: error.message,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

export default api;

// Made with Bob
