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
  return ENV[environment];
};

export default getEnvVars;
