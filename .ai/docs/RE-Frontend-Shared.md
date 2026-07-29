# RE Frontend Shared

`@re/frontend-shared` is the common UI component library and design system for all RE frontend applications. It ships a themed MUI component set, CSS design tokens, shared hooks, and the application layout shell that every app in the ReHub ecosystem mounts.

The library has one job: solve each UI problem once and let every team benefit. A bug fixed in `Button` is fixed everywhere. A spacing token updated in the theme propagates across every screen in Workbench, Charlie, and Pricing without a single application owning that decision.

It will be published to Azure Artifacts as a versioned npm package. Each application installs it independently on its own schedule, there is no forced lockstep across teams.

### Why This Exists

Without a shared library, the same UI problems get solved differently in each application. A confirm dialog in Workbench looks different from one in Charlie. A status badge in Pricing uses a different colour convention from the same concept in the claims list. Pagination controls are slightly off in each app. These small differences accumulate into a product that feels inconsistent even when individual screens look fine in isolation.

Beyond visual drift, duplicated components mean duplicated bugs. A fix to a focusable dropdown has to be discovered, applied, and deployed by three teams instead of one.

RE-Frontend-Shared removes both problems. The library is the single answer to: "How do we render a confirm dialog?" Every app that asks that question gets the same answer.

---

### Visual Identity Across the ReHub Platform

All RE applications are experienced by users as a single product under one URL and one navigation. The `AppLayout` component and the shared MUI theme are what make that feel true at the UI level.

### MUI Theme

Each application wraps its React tree with the shared `ThemeProvider` once at the root. From that point, every MUI component (buttons, inputs, dialogs, typography) picks up the same palette, sizing, and font configuration automatically:

```tsx
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@re/frontend-shared';

export const App = () => (
  <ThemeProvider theme={theme}>
	{/* All MUI components inherit the shared theme */}
  </ThemeProvider>
);
```

**Design Tokens**

The theme is also exposed as CSS custom properties via `theme.css`. Components and application stylesheets use these tokens rather than hardcoding values, so a colour change in the design system propagates everywhere without a component-level change:

| Token | Value | usage |
| --- | --- | --- |
| `--color-primary` | `#DA291C` | Buttons, active states, focus rings |
| `--color-bg-body` | `#F3F6F8` | Page background across all apps |
| `--color-bg-paper` | `#FFFFFF` | Cards, dialogs, panels |
| `--font-family` | `Helvetica Neue, Arial` | All body text |
| `--font-size-base` | `14px` | Base text size |

### AppLayout

The `AppLayout` component is the visual frame of every RE application: fixed header with the RE logo, desktop navigation with submenus, user menu with sign-out, and a responsive mobile drawer. Every team uses this shell rather than building their own. The result is that users can navigate between the modules and never notice they crossed an application boundary: same header, same navigation behaviour, same visual weight.

**Component Library**
Some components were already created to be used in the RE apps, for instance:

`AppLayout`: The application shell every RE app mounts: fixed header with the RE logo, desktop navigation with submenus, user menu, and a responsive mobile drawer.

`Button`: Action button with a four-tier hierarchy (primary, secondary, tertiary, quaternary) that maps to the RE visual weight scale.

`Tag`: Colour-coded status chip used to surface record state at a glance, available in eight palette variants.

`TextField`: MUI TextField wrapped with RE border radius, focus ring, and compact sizing so inputs look consistent across all forms.

`DropdownSearch`: Accessible single and multi-select dropdown with live search, option grouping, and a clear button.

`ConfirmDialog`: Reusable confirmation modal with an optional icon, configurable labels, and a built-in loading state for async confirm actions.

`LoadingOverlay`: Full-area spinner backdrop that blocks interaction while an async operation is in progress.

`Pagination`: Combines a record count label with MUI page buttons, themed to match the rest of the library.

`TinymceIcons`: Over 200 SVG icons exported as individual typed React components, ready to pass as a component reference or render directly as JSX.

### Custom Hooks

For reference: [React Hooks](https://www.w3schools.com/react/react_hooks.asp)

`useDebounce`: Generic debounce with configurable delay (default 300 ms)

### Component Usage example

```tsx
import { ThemeProvider } from '@mui/material/styles';
import { theme, Button, ConfirmDialog, Tag } from '@re/frontend-shared';
import { useState } from 'react';

export const App = () => {
  const [open, setOpen] = useState(false);

  return (
	<ThemeProvider theme={theme}>
	  <Tag label="Open" color="green" />
	  <Button tier="primary" onClick={() => setOpen(true)}>Delete record</Button>
	  <ConfirmDialog
		open={open}
		title="Delete record"
		message="This action cannot be undone."
		confirmLabel="Delete"
		onCancel={() => setOpen(false)}
		onConfirm={() => setOpen(false)}
	  />
	</ThemeProvider>
  );
};
```

#### Pros

- **Consistency by default**: Every component implements the same visual rules, spacing, and interaction patterns. Teams get consistency without having to coordinate or review each other's implementations.
- **Fix once, fix everywhere:** A bug in a shared component is patched in one place and picked up by all consuming applications on their next upgrade. There is no equivalent fix-in-three-repos workflow.
- **Faster delivery for new apps:** A new application starts from a working AppLayout, a full theme, and a set of tested components on day one. No team needs to build a confirm dialog or a search dropdown from scratch.
- **Storybook as a living catalogue:** Every component has stories covering defaults, variants, states, and interactive controls. Teams can browse and test components before installing anything.
- Typed public API: All component props are exported as named TypeScript interfaces. Consumer applications get autocomplete and compile-time checks.
- **Peer dependencies**: No runtime duplication. The library ships no bundled copy of React, MUI, or Emotion. Consuming apps provide their own, so Module Federation's singleton negotiation works cleanly: one React instance, one MUI theme context, no duplication in memory.
- **Independent versioning:** Each application upgrades on its own schedule. A non-breaking change in `v1.1.0` does not force Workbench and Pricing to release on the same day.

#### Cons

- **Upgrade coordination for breaking changes:** A change that affects the public API of a component (renamed prop, removed variant, changed behaviour) requires each consuming application to update before it can adopt the new version. The library minimises this by keeping components generic and domain-agnostic, but it cannot eliminate it entirely.
- **Generic over specific:** The library is intentionally domain-agnostic. A one-off UI pattern that belongs only to a single application does not belong here and must live in that app. Teams sometimes want to add domain-specific behaviour, the right answer is a local wrapper in the consuming app, not a prop that makes the shared component aware of a business rule.
- **Version skew across apps**: If Workbench is on `v1.2.0` and Pricing still on `v1.0.0`, they may behave differently for the same component. This is by design, independent upgrades, but requires teams to track which version they are on and upgrade before the gap becomes too large.

### How to Install

Configure the Azure Artifacts scoped registry once per machine:

```bash
npm config set @re:registry https://pkgs.dev.azure.com/<org>/_packaging/<feed>/npm/registry/
```

**Install the package:**

```bash
npm install @re/frontend-shared
```

**Install peer dependencies if not already present in your application:**

```bash
npm install react react-dom @mui/material @mui/icons-material @emotion/react @emotion/styled react-router-dom
```

Wrap your app root with `ThemeProvider` once, passing the shared `theme`. Do not create a custom MUI theme in the consuming application, using the shared theme is what guarantees visual consistency across all RE apps.

### Local Development and Testing

When developing changes to the library alongside a consuming application, the package is not republished to Azure Artifacts for every iteration. Instead:

```powershell
# In re-frontend-shared — build and pack a local tarball

npm run build

npm pack

# Produces: re-frontend-shared-x.x.x.tgz

# In the consuming app — install from the local path

npm install ../re-frontend-shared/re-frontend-shared-x.x.x.tgz
```

Re-run `npm pack` after each change in the library and reinstall in the consuming app to see the update. Re-running `npm run storybook` in the library repo is the fastest way to iterate on a component in isolation before wiring it into an app.

### Storybook

Storybook is the primary development environment and component documentation for the library. It runs locally at `http://localhost:6006` with:

```bash
npm run storybook
```

Every component has stories covering the default rendering, all variants, interactive states, and where relevant, responsive examples. The Controls panel lets you tweak props live without writing code. The Docs tab shows auto-generated API documentation from TypeScript types and JSDoc.

### Relationship to the Micro-Frontend Architecture

RE applications are integrated via Module Federation. Workbench (rehub-react) is the host shell. Charlie UI and Pricing Module are remotes that are loaded at runtime into the shell's router without a page reload.

The frontend shared library plays a specific role in making this work smoothly:

It provides the `AppLayout` shell and navigation that the host renders persistently, so the user sees one cohesive UI regardless of which remote is mounted.

It is declared as a shared singleton in each remote's Module Federation config. At runtime, the browser reuses the single copy that was loaded by the host rather than downloading duplicate copies per remote. This is possible precisely because the library ships no runtime dependencies of its own, the host already loaded React and MUI, and the remotes share those instances.

Auth context (MSAL token) is passed from the host to remotes via a React context that lives in RE-Frontend-Shared. Remotes never initialise their own MSAL instance; they consume the context the shell provides. This is also why the AppLayout's user menu and sign-out behaviour is consistent regardless of which remote the user is currently viewing.
