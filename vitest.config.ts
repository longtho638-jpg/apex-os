import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
        include: ['src/**/*.test.{ts,tsx}', 'backend/**/*.test.{ts,tsx}'],
        exclude: ['mobile/**/*', 'node_modules/**/*'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
