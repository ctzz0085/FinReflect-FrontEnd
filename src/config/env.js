// Public OAuth client ID, safe to commit. The client secret is never used here.
const GOOGLE_WEB_CLIENT_ID = '654227653169-q5tbt8n9b1v2l37im8t33teqk8ctctv1.apps.googleusercontent.com';

const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:8085',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.finadvisor.com',
  },
  production: {
    API_BASE_URL: 'https://api.finadvisor.com',
  },
};

const getEnvVars = () => {
  const environment = __DEV__ ? 'development' : 'production';
  return { ...ENV[environment], GOOGLE_WEB_CLIENT_ID };
};

export default getEnvVars;
