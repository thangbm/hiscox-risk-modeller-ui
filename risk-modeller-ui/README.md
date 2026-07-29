# Risk Modeller UI

React + Vite **Module Federation remote** for the Hiscox RE micro-frontend
platform. This app handles operations against Moody's Cloud RMS (Intelligent
Risk Platform). All API work is delegated to a separate **C# / Azure Functions**
backend (`Hiscox.RiskModeller.Api`) that acts as the integration layer.

This remote is loaded at runtime by the **Rehub** host shell. It can also run
standalone for day-to-day feature work.

## Stack

- **Build:** Vite + `@originjs/vite-plugin-federation` (remote, `esnext` output)
- **UI:** React 19, MUI 7 + Emotion (shared singletons with the host)
- **State:** Zustand (client UI state) + TanStack React Query (server state)
- **Testing:** Vitest + React Testing Library + jsdom + MSW
- **Lint:** ESLint flat config (`eslint.config.js`)

See `.ai/docs/` for the architecture, shared-library, structure,
state-management and testing decisions this app follows.

## Getting started

```powershell
npm install
npm run dev      # http://localhost:3030 (standalone)
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Standalone dev server on port 3030 |
| `npm run build` | `tsc --noEmit` + production build (emits `remoteEntry.js`) |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |

## Backend

The backend is a separate Azure Functions (isolated worker) project. Currently
consumed endpoint:

```bash
curl -X GET 'http://localhost:7192/api/status' -H 'accept: application/json'
```

The landing page renders this `GET /api/status` response live.

### Avoiding CORS in local dev

The client calls the API on a **same-origin** path (`VITE_API_BASE_URL=/api`).
The Vite dev server proxies `/api` to the backend server-to-server (see
`server.proxy` in `vite.config.ts`), so the browser never makes a cross-origin
request and no CORS config is needed on the backend. The proxy target is
`API_PROXY_TARGET` (default `http://localhost:7192`), a server-only variable that
is not bundled into the client.

## Module Federation

- **Remote name:** `riskModeller`
- **Exposed module:** `./RiskModellerApp` -> `src/app/RiskModellerApp.tsx`
  (this name is a public API — version/deprecate, do not rename silently)
- **Shared singletons:** `react`, `react-dom`, `react-router-dom`,
  `@mui/material`, `@emotion/react`, `@emotion/styled`

### Host wiring (Rehub side)

```ts
// vite.config.ts (host)
remotes: {
  riskModeller: 'http://localhost:3030/assets/remoteEntry.js',
}
```

```tsx
// host router
const RiskModellerApp = lazy(() => import('riskModeller/RiskModellerApp'))

<Route
  path="/risk-modeller/*"
  element={
	<Suspense fallback={<Spinner />}>
	  <ErrorBoundary>
		<RiskModellerApp />
	  </ErrorBoundary>
	</Suspense>
  }
/>
```

The host provides the Router, the shared MUI `ThemeProvider` and the MSAL auth
context. This remote provides only its own React Query client and routes.

## Project structure

Follows `.ai/docs/React-Project-Structure-Proposal.md`: production code in
`src/`, tests mirroring it in `tests/`, `@/` alias for `src/`.

```text
src/
  app/            router, providers, query client, error boundary,
				  RiskModellerApp.tsx (federation entry), routes/
  components/     app-local reusable components (PageHeader)
  features/       vertical slices (status/: api, hooks, components, index)
  hooks/          cross-feature hooks
  stores/         global Zustand stores (home for cross-feature stores)
  mocks/          MSW handlers + fixtures
  stubs/          frontend-shared.tsx (TEMP @re/frontend-shared + MSAL stub)
  types/          shared API/common types
  utils/          apiClient
tests/            mirrors src/
```

## Deferred: `@re/frontend-shared` + MSAL

`@re/frontend-shared` is not yet published. `src/stubs/frontend-shared.tsx` is a
clearly-marked stub mirroring its future public surface (`theme`, `AuthProvider`,
`useAuth`). When the package ships:

1. `npm install @re/frontend-shared`
2. Replace imports of `@/stubs/frontend-shared` with `@re/frontend-shared`
3. Delete the stub and enable the commented `@re/frontend-shared` singleton in
   `vite.config.ts`
