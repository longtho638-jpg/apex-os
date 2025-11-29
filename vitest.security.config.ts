import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['scripts/security-test.ts'],
    environment: 'node',
    globals: true,
    testTimeout: 30000, // Increase timeout for API calls
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
