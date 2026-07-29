# Micro-Frontend Architecture

## Overview

Users see a single application (one URL, one navigation bar, one auth session) while each team ships independently. Rehub is the host shell that owns routing, auth, and layout. RE-Frontend-Shared is the common component library that keeps the UI consistent across apps without forcing coordinated releases.

### Module Federation

Several standard micro-frontend patterns were evaluated: reverse proxy / CDN routing (each app is a standalone SPA behind an infrastructure router, causing full-page reloads on cross-app navigation), Single-SPA (a dedicated orchestration framework that mounts and unmounts apps via lifecycle hooks), iFrame composition (apps run in fully isolated browser contexts communicating via postMessage), and Web Components (apps expose custom HTML elements mounted by a thin shell router). All of these were ruled out due to trade-offs around page reloads, cross-app state sharing, auth continuity, and developer experience.

Module Federation was chosen because it solves the hardest problems without introducing a new framework or requiring infrastructure-level routing changes. The decisive factor was that the Workbench team had already proved it works in production with our Vite stack, removing all implementation risk.

### How Module Federation Works

Module Federation is a capability built into modern bundlers (Webpack, Vite via plugin, Rspack) that allows one application (the host) to load code from a separately built and deployed application (a remote) at runtime. The two apps never share a build step and have no compile-time coupling.

Each remote publishes a small manifest file called remoteEntry.js alongside its normal production build. This manifest maps the names of exposed modules to the actual hashed filenames produced by that remote's build. Each remote publishes its own remoteEntry.js, and Rehub references each URL via a dedicated environment variable. Rehub never bundles remote code, it is fetched by the browser only when the user navigates to a route that needs it.

When the user navigates to a different module in the header, Rehub's router triggers a dynamic import for that remote's exposed module. The browser fetches the `remoteEntry.js`, resolves the module name to the correct chunk filename, downloads only the chunks needed for that route, and mounts the component without a page reload. For example, navigating to a Pricing route loads the main component from the Pricing Module remote without downloading any of the exposed components. Each is independently loadable.

Dependency deduplication is handled automatically through the shared configuration. All apps declare `react`, `react-dom`, and `react-router-dom` as shared singleton libraries. At runtime, Module Federation checks what is already loaded in the browser and reuses it if the version is compatible, preventing duplicate React instances in memory without forcing all apps to pin the exact same version.

### Authentication

MSAL is initialised exactly once inside Rehub. The token is made available to remote apps via a React context provided by RE-Frontend-Shared. Apps never run their own MSAL initialisation; they consume the context the Rehub provides. The user authenticates once and the session is available across all remotes without any cross-app coordination.

### Error Isolation

Each remote route in Rehub is wrapped in a Suspense boundary (which shows a loading spinner while chunks are being fetched) and an `ErrorBoundary`. If a remote's remoteEntry.js is unreachable or a chunk fails to load, the error is contained to that route. The rest of Rehub and any other remote routes remain fully functional.

## Developer Workflow

Day-to-day feature work: run only your own app. Each app has a standalone dev server and works independently with no need to start the shell.

Integration testing (routing, auth context, shared layout): run your remote alongside Rehub. Switching between a local remote and a deployed one is a single environment variable change, update the corresponding remote entry URL in Rehub's `.env.development` to point at your local `remoteEntry.js`.

### What Each New Remote Needs

Any team adding a new remote configures their Vite build with `vite-plugin-federation` as a remote, declares the exposes map (which components or pages the host can load), and sets `build.target` to `esnext`, which is a hard requirement of the plugin's output format. Setting `build.minify` to `false` during initial integration is strongly recommended as it makes diagnosing federation errors significantly easier, it can be re-enabled once the integration is stable.

On the Rehub side, a new environment variable is added for the remote's `remoteEntry.js` URL, and a new lazy-loaded, route is added pointing at the exposed component, wrapped in Suspense and an `ErrorBoundary`.

Example: adding a new app called My Module:

1. Add the remote entry URL to Rehub's .env files:

`VITE_MY_MODULE_REMOTE_URL=https://my-module.example.com/remoteEntry.js`

2. Register the remote in Rehub's vite.config.ts federation plugin:

```ts
   remotes: {
	 myModule: 'https://my-module.example.com/remoteEntry.js',
   }
```

3. Add the lazy-loaded route in Rehub's router:

```tsx
   const MyModuleDashboard = lazy(() => import('myModule/MyModuleDashboard'))

   <Route
	 path="/my-module/*"
	 element={
	   <Suspense fallback={<Spinner />}>
		 <ErrorBoundary>
		   <MyModuleDashboard />
		 </ErrorBoundary>
	   </Suspense>
	 }
   />
```

Remotes consume the auth token from the shared MSAL context provided by RE-Frontend-Shared and never initialise their own MSAL instance.

### Things to Pay Attention To

- **ESNext-only output**: All remotes must build targeting esnext. This is a hard constraint of the plugin and rules out supporting older browsers.
- **First-load latency**: The first time a user visits a remote's route, the browser fetches the `remoteEntry.js` and the initial chunks. Subsequent visits use the browser cache. Preload hints in Rehub's HTML for commonly visited remotes can reduce perceived latency on first visit.
- **Exposed module names are a public API:** If a remote renames or removes an exposed module (e.g. renaming PricingDashboard to PricingHome), any lazy import in Rehub referencing the old name fails at runtime. Treat exposed names the same as a REST API contract: version or deprecate rather than rename silently.
- **Shared library versioning:** RE-Frontend-Shared is a versioned package and each app upgrades on its own schedule. Because the library is designed to be stable and generic, upgrades should be infrequent and low-risk.
