// Public OAuth client ID, safe to commit. The client secret is never used here.
const GOOGLE_WEB_CLIENT_ID = '654227653169-q5tbt8n9b1v2l37im8t33teqk8ctctv1.apps.googleusercontent.com';

// Set EXPO_PUBLIC_API_BASE_URL in .env.local to use another backend while developing.
const API_BASE_URL_OVERRIDE = process.env.EXPO_PUBLIC_API_BASE_URL;

const ENV = {
  development: {
    API_BASE_URL: API_BASE_URL_OVERRIDE || 'http://localhost:8085',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.finadvisor.com',
  },
  production: {
    API_BASE_URL: 'https://finreflect-backend.onrender.com',
  },
};

const getEnvVars = () => {
  const environment = __DEV__ ? 'development' : 'production';
  return { ...ENV[environment], GOOGLE_WEB_CLIENT_ID };
};

export default getEnvVars;
