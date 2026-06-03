import setupCoverage from '@cypress/code-coverage/task.js';
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
  chromeWebSecurity: false,
  video: false,
  retries: {
    runMode: 2,
  },
  env: {
    GRAASP_BUILDER_HOST:
      process.env.VITE_GRAASP_BUILDER_HOST || 'http://localhost:3111',
    GRAASP_ANALYTICS_HOST:
      process.env.VITE_GRAASP_ANALYTICS_HOST || 'http://localhost:3012',
    GRAASP_API_HOST:
      process.env.VITE_GRAASP_API_HOST || 'http://localhost:3000',
    GRAASP_AUTH_HOST:
      process.env.VITE_GRAASP_AUTH_HOST || 'http://localhost:3001',
    GRAASP_ACCOUNT_HOST:
      process.env.VITE_GRAASP_ACCOUNT_HOST || 'http://localhost:3114',
  },
  e2e: {
    baseUrl: `http://localhost:${process.env.VITE_PORT || 3112}`,
    setupNodeEvents(on, config) {
      on('file:preprocessor', vitePreprocessor());
      setupCoverage(on, config);
      return config;
    },
  },
});
