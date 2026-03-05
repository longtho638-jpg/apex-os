import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['src/**/*.test.{ts,tsx}', 'backend/**/*.test.{ts,tsx}'],
    exclude: ['mobile/**/*', 'node_modules/**/*', '.next/**/*'],
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}', 'backend/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
      exclude: [
        'src/app/**/*',
        'src/components/ui/**/*',
        'src/components/marketing/**/*',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@backend': path.resolve(__dirname, './backend'),
      '@apex-os/vibe-payment': path.resolve(__dirname, './packages/vibe-payment/src/index.ts'),
    },
  },
});
