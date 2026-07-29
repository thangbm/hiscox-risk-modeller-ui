# Hiscox Risk Modeller UI

React + Vite **Module Federation remote** for the Hiscox RE micro-frontend
platform. This app handles operations against Moody's Cloud RMS (Intelligent
Risk Platform). All API work is delegated to a separate **C# / Azure Functions**
backend (`Hiscox.RiskModeller.Api`) that acts as the integration layer.

The remote is loaded at runtime by the **Rehub** host shell, and can also run
standalone for day-to-day feature work.

## Stack

- **Build:** Vite + `@originjs/vite-plugin-federation` (remote, `esnext` output)
- **UI:** React 19, MUI 7 + Emotion (shared singletons with the host)
- **State:** Zustand (client UI state) + TanStack React Query (server state)
- **Routing:** React Router
- **Testing:** Vitest + React Testing Library + jsdom + MSW
- **Lint:** ESLint flat config (`eslint.config.js`)
- **Language:** TypeScript

## Repository layout

```text
.
├─ risk-modeller-ui/      The React + Vite Module Federation remote app
├─ risk-modeller-shell/   Local federation host / dev harness for the remote
├─ .ai/docs/              RE frontend architecture & convention docs
└─ README.md              You are here
```

The application lives in [`risk-modeller-ui`](./risk-modeller-ui). See its
[README](./risk-modeller-ui/README.md) for app-specific details, project
structure and Module Federation host wiring.

## Getting started

```powershell
cd risk-modeller-ui
npm install
npm run dev      # http://localhost:3030 (standalone)
```

### Scripts

Run from `risk-modeller-ui`:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Standalone dev server on port 3030 |
| `npm run build` | `tsc --noEmit` + production build (emits `remoteEntry.js`) |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |

## Backend

The backend is a separate Azure Functions (isolated worker) project. The landing
page renders the `GET /api/status` response live:

```bash
curl -X GET 'http://localhost:7192/api/status' -H 'accept: application/json'
```

In local dev the client calls a **same-origin** path (`VITE_API_BASE_URL=/api`)
and the Vite dev server proxies `/api` to the backend server-to-server (see
`server.proxy` in `vite.config.ts`), so no CORS configuration is needed. The
proxy target is `API_PROXY_TARGET` (default `http://localhost:7192`), a
server-only variable that is never bundled into the client.

## Module Federation

- **Remote name:** `riskModeller`
- **Exposed module:** `./RiskModellerApp` -> `src/app/RiskModellerApp.tsx`
  (this name is a public API — version/deprecate, do not rename silently)
- **Shared singletons:** `react`, `react-dom`, `react-router-dom`,
  `@mui/material`, `@emotion/react`, `@emotion/styled`

The Rehub host provides the Router, the shared MUI `ThemeProvider` and the MSAL
auth context; this remote provides only its own React Query client and routes.

## Architecture docs

Reference documentation for the RE frontend ecosystem lives in
[`.ai/docs`](./.ai/docs):

| Document | Summary |
| --- | --- |
| [Micro-Frontend Architecture](./.ai/docs/Micro-Frontend-Architecture.md) | Module Federation composition: host shell, remotes, shared deps, auth, error isolation, adding a remote. |
| [RE Frontend Shared](./.ai/docs/RE-Frontend-Shared.md) | The `@re/frontend-shared` component library and design system. |
| [State Management](./.ai/docs/State-Management.md) | Redux Toolkit vs Zustand + React Query, with migration examples. |
| [Testing Frameworks](./.ai/docs/Testing-Frameworks.md) | Test runner choice for Vite projects (Vitest vs Jest) and RTL. |
| [React Project Structure Proposal](./.ai/docs/React-Project-Structure-Proposal.md) | Folder structure for React projects: `src/`/`tests/` layout and conventions. |
