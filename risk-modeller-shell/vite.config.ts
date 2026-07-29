import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { fileURLToPath, URL } from 'node:url';

// Module Federation HOST configuration.
// This shell is the HOST that lazily loads the risk-modeller-ui remote.
// The remote exposes `./RiskModellerApp` via its remoteEntry.js.
// See: ../.ai/docs/Micro-Frontend-Architecture.md
export default defineConfig(({ mode }) => {
  // Load env at serve/build time to resolve the remote URL.
  // VITE_RISK_MODELLER_REMOTE_URL must NOT contain secrets — it is inlined
  // into the bundle and visible to the browser.
  // API_PROXY_TARGET is server-only (no VITE_ prefix) and must NOT be bundled.
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.API_PROXY_TARGET ?? 'http://localhost:7192';
  const proxy = {
    '/api': {
      target: apiProxyTarget,
      changeOrigin: true,
    },
  };

  // In development: remote dev server serves remoteEntry.js at the root path.
  // In production/preview: built assets are under /assets/.
  const riskModellerRemoteUrl =
    env.VITE_RISK_MODELLER_REMOTE_URL ??
    (mode === 'development'
      ? 'http://localhost:3030/remoteEntry.js'
      : 'http://localhost:3030/assets/remoteEntry.js');

  return {
    plugins: [
      react(),
      federation({
        name: 'riskModellerShell',
        // Remotes consumed by this host. The key is the module namespace used
        // in imports: `import X from 'riskModeller/RiskModellerApp'`.
        remotes: {
          riskModeller: riskModellerRemoteUrl,
        },
        // Must match the `shared` config in the remote so the host's singleton
        // instances (React, MUI, Router) are reused rather than duplicated.
        shared: {
          react: { requiredVersion: false },
          'react-dom': { requiredVersion: false },
          'react-router-dom': { requiredVersion: false },
          '@mui/material': { requiredVersion: false },
          '@emotion/react': { requiredVersion: false },
          '@emotion/styled': { requiredVersion: false },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { proxy },
    preview: { proxy },
    build: {
      target: 'esnext',
      minify: false,
    },
  };
});
