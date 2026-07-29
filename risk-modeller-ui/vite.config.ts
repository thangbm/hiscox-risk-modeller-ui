import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { fileURLToPath, URL } from 'node:url';

// Module Federation remote configuration.
// This app is a REMOTE consumed by the Rehub host shell. It exposes its root
// component; the host lazy-loads it via the URL published in `remoteEntry.js`.
// See: .ai/docs/Micro-Frontend-Architecture.md
export default defineConfig(({ mode }) => {
  // Server-only env. Loaded with no prefix filter so we can read the
  // non-VITE_ proxy target, which must NOT be bundled into the client.
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.API_PROXY_TARGET ?? 'http://localhost:7192';
  const proxy = {
    '/api': {
      target: apiProxyTarget,
      changeOrigin: true,
    },
  };

  return {
    plugins: [
      react(),
      federation({
        name: 'riskModeller',
        filename: 'remoteEntry.js',
        // Exposed module names are a PUBLIC API. Treat like a REST contract:
        // version or deprecate rather than rename silently.
        exposes: {
          './RiskModellerApp': './src/app/RiskModellerApp.tsx',
        },
        // Shared deps so the host's single instance is reused at runtime (no
        // duplicate React/MUI in memory). vite-plugin-federation dedupes shared
        // modules in the share scope by default; `requiredVersion: false` lets MF
        // reuse whatever compatible version the host already loaded.
        shared: {
          react: { requiredVersion: false },
          'react-dom': { requiredVersion: false },
          'react-router-dom': { requiredVersion: false },
          '@mui/material': { requiredVersion: false },
          '@emotion/react': { requiredVersion: false },
          '@emotion/styled': { requiredVersion: false },
          // Enable once @re/frontend-shared is published and the stub is removed:
          // '@re/frontend-shared': { requiredVersion: false },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Dev-server proxy: the browser calls the SAME origin (/api on the dev port)
    // and Vite forwards the request to the backend server-to-server. No
    // cross-origin request is made, so there is no CORS. Requires the client to
    // use a same-origin base path: set VITE_API_BASE_URL=/api in .env.development.
    server: { proxy },
    // preview.proxy mirrors server.proxy so `vite preview` (build + serve)
    // forwards /api to the backend the same way the dev server does.
    preview: { proxy },
    build: {
      // Hard requirement of vite-plugin-federation's output format.
      target: 'esnext',
      // Recommended OFF during initial integration to make federation errors
      // easier to diagnose. Re-enable once integration is stable.
      minify: false,
    },
  };
});
