import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/types.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@glin-extension/extension-base': resolve(__dirname, './packages/extension-base/src'),
      '@glin-extension/extension-ui': resolve(__dirname, './packages/extension-ui/src'),
    },
  },
});
