import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Vitest shares Vite's transform pipeline: the `@/` alias, env vars, TypeScript
// resolution and plugins all work in tests with no parallel config to maintain.
// See: .ai/docs/Testing-Frameworks.md
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
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'test-results/junit.xml',
    },
    coverage: {
      reporter: ['text', 'html', 'cobertura'],
    },
  },
});
