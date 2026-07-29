# Testing Frameworks

## What is a Test Runner

A test runner provides the execution environment for automated tests along with the module system, mocking infrastructure, and coverage reporting. For React applications built on Vite, the choice between the two dominant runners, Vitest and Jest, is primarily a configuration question: one shares Vite's build pipeline, the other requires a parallel setup that must be maintained separately.

## Jest

Jest is Meta's test runner and the most widely adopted in the JavaScript ecosystem. It predates Vite and was built around Node's CommonJS module system with its own transform pipeline.

Running Jest in a Vite project introduces a structural mismatch. It does not use Vite's transforms, so several things that work automatically in the application must be bridged manually:

- `import.meta.env` is undefined, must be shimmed via `globals` in `jest.config.ts` or a custom transform
- Path aliases defined in `vite.config.ts` must be duplicated under `moduleNameMapper` in the Jest config; the two can silently diverge
- TypeScript must be compiled via `ts-jest` or `babel-jest`, each a separate dependency with its own version constraints
- Native ESM requires `--experimental-vm-modules` in the Node invocation, which conflicts with how Jest historically operates
- Vite plugins and virtual modules are invisible to Jest

The net result is two parallel build configurations that must be kept in sync with every change to the Vite config.

**Pros**

- Largest community, most documentation, broadest Stack Overflow coverage
- Well-understood in teams with prior React testing experience
- Strong isolation: each test file runs in its own module registry
- Established snapshot testing suppor

**Cons**

- Does not integrate with Vite's transform pipeline
- `import.meta.env`, path aliases, and TypeScript each require separate bridging configuration
- Native ESM support is experimental and error-prone
- Configuration overhead is substantially higher in a Vite project than a Webpack one

## Vitest

Vitest is a test runner built on top of Vite. It reads `vite.config.ts` (or a parallel `vitest.config.ts` that extends it) and shares Vite's transform pipeline — path aliases, environment variables, TypeScript resolution, and plugins all work in tests without additional configuration. **Its API is intentionally compatible with Jest:** `describe`, `it`, `test`, `expect`, `vi.fn()`, `vi.mock()`, and `vi.spyOn()` behave identically to their `jest.*` counterparts.

The experimental shared component library (`re-frontend-shared`) uses Vitest with `@testing-library/reac` as the reference setup. The new Pricing UI App and Charlie UI POC both have Vitest configured. The Workbench UI (rehub) currently has no test infrastructure.

**Pros**

- Single configuration shared with the production build, no drift between environments
- `import.meta.env`, path aliases, and Vite plugins work in tests without extra setup
- Module-graph-aware watch mode: only tests affected by a file change are re-run
- Jest-compatible API, migration is largely a `jest.` => `vi.` search-replace
- `@vitest/ui` provides a browser-based dashboard for inspecting test results

**Cons**

- Younger than Jest; some advanced scenarios have fewer community resources
- `@vitest/ui` and some coverage features are still maturing

**Companion Tool:** React Testing Library (nice to have)

This tool is frequently mentioned alongside test runners but operate at different level and is not an alternative to Vitest and Jest.

**React Testing Library**: runs inside Vitest or Jest. It renders components into jsdom using `render()`, queries the result using semantic selectors (`getByRole`, `getByText`, `getByLabelText`), and pairs with `@testing-library/user-event` for interaction simulation. Its philosophy is to test behaviour as a user would experience it rather than inspecting internal component state.

It renders components in isolation, making it possible to test specific behaviours such as user interactions, conditional rendering, and state changes using mocked data and services instead of hitting real APIs.

**Key Considerations**

- **Vite alignment:** Any new application in the ecosystem is Vite-based. **A test runner that requires a separate transform configuration means maintaining two configs in parallel, a maintenance cost that compounds as the application grows.**
- **Shared patterns:** The `re-frontend-shared` library establishes the reference setup — `vitest.config.ts`, `jsdom` environment, `@testing-library/jest-dom` in the setup file. Any new application can use it as a starting point.
- **jsdom vs real browser:** Vitest with jsdom is fast and suitable for unit and component tests, but it cannot exercise real CSS rendering, real navigation, or browser-specific behaviour. For those scenarios, Playwright (or Cypress) is the right tool, it complements rather than replaces the Vitest layer.
- **Developer experience:** For developers used to working with Jest for TypeScript/Node.js, using Vitest is the same, the API is identical and the test creation and maintenance process is no different.
