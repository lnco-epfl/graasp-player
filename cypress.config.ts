import { defineConfig } from 'cypress';

export default defineConfig({
  chromeWebSecurity: false,
  video: false,
  retries: {
    runMode: 2,
  },
  env: {
    GRAASP_COMPOSE_HOST:
      process.env.VITE_GRAASP_BUILDER_HOST || 'http://localhost:3111',
    GRAASP_LIBRARY_HOST:
      process.env.VITE_GRAASP_LIBRARY_HOST || 'http://localhost:3005',
    GRAASP_ANALYTICS_HOST:
      process.env.VITE_GRAASP_ANALYTICS_HOST || 'http://localhost:3012',
    API_HOST: process.env.VITE_GRAASP_API_HOST || 'http://localhost:3000',
    AUTHENTICATION_HOST:
      process.env.VITE_GRAASP_AUTH_HOST || 'http://localhost:3001',
  },
  e2e: {
    baseUrl: `http://localhost:${process.env.VITE_PORT || 3112}`,
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
