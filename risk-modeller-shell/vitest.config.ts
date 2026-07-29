import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Vitest shares Vite's transform pipeline: the `@/` alias, env vars, TypeScript
// resolution and plugins all work in tests with no parallel config to maintain.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
});
