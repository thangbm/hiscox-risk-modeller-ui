# React Project Structure Proposal

This document describes the proposed folder structure for our React projects. The goal is a consistent, predictable layout that separates production code from tooling and scales as the project grows.

**Project Root**

```text
re-app/
  public/
  src/
  tests/
  .env.example
  .eslintrc.json
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
```

`public/` holds static assets served as-is (favicon, robots.txt, manifests). Everything else lives inside `src/` or `tests/`.

### src/ Structure

```text
src/
  app
	routes/
	app.tsx
	provider.tsx
	router.tsx
  assets/
	fonts/
	images/
	icons/
  components/        ← optional
	PricingCard/
	  PricingCard.tsx
	  PricingCard.module.css
	SummaryBanner/
	  SummaryBanner.tsx
	  SummaryBanner.module.css
	index.ts
  features/
	auth/
	  api/
		authApi.ts
	  components/
		LoginForm.tsx
	  hooks/
		useAuth.ts
	  stores/
		authStore.ts
	  types/
		auth.ts
	  utils/
		authUtils.ts
	  index.ts
	dashboard/
	  api/
	  components/
	  hooks/
	  stores/
	  index.ts
  hooks/
	useDebounce.ts
	useLocalStorage.ts
  stores/
	index.ts
  mocks/
  types/
	api.ts
	common.ts
  utils/             ← optional
	formatDate.ts
	validators.ts
  main.tsx
```

`app/` is the application layer. It contains the router, route definitions and the root provider that wraps the app with context providers. For small apps or in early stages, this folder is not necessary and a single `App.tsx` at the root of `src/` is enough. It becomes useful when the number of routes grows and keeping routing and providers in one place makes the structure easier to navigate.

`components/` is optional. It holds UI components that are reused across multiple features within the same app but are specific to that project. A good example is a pricing card that appears in a few different screens but has no reason to live in a shared library used by other apps. If a component is generic enough to be useful across projects, it belongs in the frontend shared library instead.

`features/` groups everything related to a product domain including its local components, hooks, API calls, state and types, so the code for a feature can be found and changed in one place. Not every feature needs all subfolders, only the ones that are necessary.

`hooks/` holds custom hooks that are not tied to any single feature and can be used anywhere in the application.

`stores/` contains the global state configuration (Redux store, Zustand stores, or equivalent).

`mocks/` holds shared mock data and handlers used across test files, such as API response fixtures or MSW request handlers.

`types/` holds shared TypeScript interfaces and type aliases used across the project.

`utils/` is optional. It can be added when there are plain functions like formatters, validators or helpers that are reused across multiple features or components and don't belong to any specific one. Can also have tests utilities if necessary.

### tests/ Structure

Test files live in a top-level `tests/` directory that mirrors the structure of `src/`. This keeps `src/` free of tooling files and gives one place to audit coverage across the whole project.

```text
tests/
  app/
	router.test.tsx
  components/
	PricingCard/
	  PricingCard.test.tsx
	SummaryBanner/
	  SummaryBanner.test.tsx
  features/
	auth/
	  api/
		authApi.test.ts
	  components/
		LoginForm.test.tsx
	  hooks/
		useAuth.test.ts
	dashboard/
	  components/
  hooks/
	useDebounce.test.ts
	useLocalStorage.test.ts
```

Every folder in `src/` has a matching folder in `tests/`. A test file for `src/components/PricingCard/PricingCard.tsx` lives at `tests/components/PricingCard/PricingCard.test.tsx`.

### Import Convention

Because test files are outside `src/`, they import using the `@/` path alias configured in `vitest.config.ts`:

```tsx
// tests/components/PricingCard/PricingCard.test.tsx
import { PricingCard } from '@/components/PricingCard/PricingCard';
```

The alias must be declared in both `vite.config.ts` and `tsconfig.json` so Vite and TypeScript resolve it consistently.

Key Principles

Production code and test code are separated by directory, not by file naming convention. The `src/` tree is what ships and the `tests/` tree is tooling.

Features are vertical slices. All code for a feature, including its components, hooks, API calls, state and types, lives under `features/<name>/` rather than being split by type across the whole project.

Shared code lives at the top level. A component or hook that is used by two or more features moves out of its feature folder and into `components/` or `hooks/`.

Each component folder owns its own styles. Nothing from a component folder is imported directly except through the component's public interface.

The structure mirrors itself. Every test path maps one-to-one to a source path, making it easy to check whether a file has a test or to find the test for a given source file.

### Reference

This structure is inspired by Bulletproof React, one of the most referenced examples of scalable React project architecture in the community.

https://github.com/alan2207/bulletproof-react
