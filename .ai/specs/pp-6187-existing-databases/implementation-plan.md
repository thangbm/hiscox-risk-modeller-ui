# PP-6187 — Data Import: Existing Databases + Brian Program Scan

> Implementation spec for the first cut of the **Data Import** screen in `risk-modeller-ui`.
> Covers requirements **R1** (Existing Databases panel) and **R2** (Brian program scan) only.
> Source: PP-6187 requirements as supplied in the ticket. UX reference: the prototype listed under
> [Key Files](#key-files).

---

## Status

| Field | Value |
|-------|-------|
| Overall | `not-started` — draft awaiting answers to the open questions |
| Progress | 0 / 8 steps done |
| Last updated | 2026-07-28 by GitHub Copilot |
| Branch / PR | none yet |
| Verification | n/a — no code written |
| Blockers | Endpoint contracts unagreed with backend (Risks Q6). Work can start against MSW mocks, but shapes may change. |

---

## Understanding

The Data Import screen needs two independent, read-mostly panels: one showing which databases are
*already* attached to Data Bridge and registered in Risk Modeller (information only, no interaction
yet), and one that finds candidate EDM/RDM databases on the Brian Z: drive for a given program ID so
a user can tick them and give each a "Hiscox Name". The shaping constraint is that **no filesystem or
database work happens in the browser** — this is a Module Federation remote with a C#/Azure Functions
backend, so all traversal, zip inspection and EDM-vs-RDM classification is the backend's job and the
UI only calls it. A second constraint is that the Existing Databases search must filter **live as you
type**, which drives a client-side filter over an already-fetched list.

- **R1** — collapsible "Existing Databases" panel: name-only list, live search with space-separated
  terms, AND/OR match-mode toggle (default AND), and a refresh control.
- **R2** — Brian program scan: program-ID input, results table (File Name, File Size, File Path),
  per-row checkbox plus select-all, and a Hiscox Name field for ticked rows.

Mirrors the existing `features/status` slice: `api/` + `hooks/` + `components/` behind an `index.ts`,
React Query for server state — see [risk-modeller-ui/src/features/status/hooks/useServiceStatus.ts](risk-modeller-ui/src/features/status/hooks/useServiceStatus.ts).

## Scope

- **In scope:** new `features/data-import` slice (API calls, hooks, Zustand store, components, pure
  utils), a `data-import` route + page, typed contracts in `src/types/api.ts`, MSW handlers and
  fixtures; matching Vitest/RTL tests under `tests/features/data-import/**` and
  `tests/app/routes/`.
- **Out of scope (later tickets):**
  - Z: drive traversal, zip inspection and EDM-vs-RDM classification — owned by
    `Hiscox.RiskModeller.Api`; the UI only consumes the result.
  - Attaching databases to Data Bridge. The requirement says the Hiscox Name "will be the name used
    to attach" with "BRs on different pages", so this cut **captures and validates names only** — no
    submit action, no `POST`.
  - Any interaction with rows in the Existing Databases list ("that will be in another section").
  - A second data source beyond Data Bridge. The contract carries a `source` field so one can be
    added without redesign, but no source-selector UI is built.

## Assumptions

1. Both datasets are **server state** → React Query only. Neither list is copied into Zustand; the
   store holds ids and user-typed names, nothing fetched.
2. Neither backend endpoint exists yet. Contracts in [Design](#design) are proposals; the frontend
   proceeds against MSW mocks so it is not blocked. Falsifiable by backend sign-off.
3. **No new packages.** MUI 7, React Query, Zustand, MSW and Vitest are already in
   `risk-modeller-ui/package.json`; nothing here needs an addition.
4. Filtering of the Existing Databases list is **client-side** — the list is expected to be tens, not
   thousands, of names, and the requirement asks for live filtering while typing.
5. The scan is potentially slow → explicit trigger (button / Enter), never fetch-on-keystroke.
6. `src/utils/apiClient.ts` exposes `get` only. Nothing in this cut needs `post`, so `apiClient` is
   unchanged.
7. **Host ↔ remote contract:** the host owns the top-level Router, `ThemeProvider` and MSAL. The new
   route is registered **relatively** in `src/app/router.tsx`; no `BrowserRouter` is added and no
   theme is created here.
8. The prototype [risk-modeller-ui/src/components/data_import_existing_databases (2).tsx](risk-modeller-ui/src/components/data_import_existing_databases%20(2).tsx)
   is a Tailwind + `lucide-react` mock-up. Neither library is in this stack; the file is untyped and
   unreferenced. It is a **UX reference only** — nothing is imported from it and it is not modified
   by this work.

## Design

### Shared: API contracts (`src/types/api.ts`)

- **`RegisteredDatabase`** (interface) — one registered Data Bridge database:
  `id: string`, `name: string`, `source: string` (`'DataBridge'` today; present so a second source
  needs no reshape). Returned by `GET /api/data-import/databases` wrapped in
  **`RegisteredDatabasesResponse`** — `{ databases: RegisteredDatabase[]; retrievedUtc: string }`.
- **`BrianProgramDatabase`** (interface) — one scan hit: `id` (stable per file path; React key and
  selection key), `fileName`, `filePath` (for zipped hits, archive path + entry),
  `fileSizeBytes: number` (**a number, not a pre-formatted string** — the UI formats and can sort
  later), `kind: 'EDM' | 'RDM'`, `extension: '.mdf' | '.bak'`, `containingArchive: string | null`
  (non-null when found inside a zip).
- **`BrianProgramScanResponse`** — `{ programId: string; databases: BrianProgramDatabase[]; scannedUtc: string }`.
  Returned by `GET /api/data-import/brian-programs/{programId}/databases`.
- **`dataImportApi`** (module) — `getRegisteredDatabases(signal?)` and `scanBrianProgram(programId, signal?)`,
  both via `apiClient.get`, mirroring [risk-modeller-ui/src/features/status/api/statusApi.ts](risk-modeller-ui/src/features/status/api/statusApi.ts).
  `programId` is URL-encoded before interpolation.

UI must handle three server outcomes on the scan: `404` (program/folder not found), `200` with an
empty `databases` array (folder exists, nothing matched), and generic failure.

### State split (`hooks/` + `stores/`)

Server state — React Query, both passing `signal` through to `apiClient`:

| Hook | Key | Notes |
|------|-----|-------|
| `useRegisteredDatabases()` | `['data-import','databases']` | Refresh button calls `refetch()`; `isFetching` drives the spinner. |
| `useBrianProgramScan(programId)` | `['data-import','brian-program', programId]` | `enabled: false`; triggered by `refetch()` on submit. |

Client state — **`useDataImportStore`** (Zustand, module-level `create`, no Provider, fine-grained
selectors). Holds only UI state: `isPanelExpanded` (default `true`), `searchQuery` (`''`),
`matchMode: 'AND' | 'OR'` (default `'AND'`), `programIdInput` (`''`), `submittedProgramId`
(`null`), `selectedFileIds: string[]`, `hiscoxNames: Record<string, string>`. Fetched rows are
**never** written here.

### R1: Existing Databases panel (`features/data-import/components/`)

- **`filterDatabases(names, query, matchMode)`** (pure util, no React) — the whole search rule:
  - `terms = query.trim().split(/\s+/).filter(Boolean)`; empty → return the input unchanged.
  - `AND` → `terms.every(t => name.toLowerCase().includes(t.toLowerCase()))`.
  - `OR` → `terms.some(...)`. Case-insensitive substring, mirroring SQL `LIKE '%term%'`.
- **`ExistingDatabasesPanel`** (component) — MUI `Collapse` plus a header button carrying
  `aria-expanded`; owns loading / error / empty / populated states and the refresh `IconButton`
  (`aria-label="Refresh databases"`, disabled while `isFetching`, `CircularProgress` while running).
  Collapsed state is session-only.
- **`DatabaseSearchBar`** (component) — `TextField` + MUI exclusive `ToggleButtonGroup`
  (`aria-label="Match mode"`, buttons `AND` / `OR`, default `AND`). No debounce: the requirement is
  live filtering and the list is small. Result count (`n of m`) is shown so the AND/OR effect is
  visible.
- **`ExistingDatabaseList`** (component) — renders names only; filtering is `useMemo`'d over
  `(databases, query, matchMode)`. Shows a "no matches" message when the filter empties a non-empty
  list. **No row interaction** — not clickable, not expandable.

### R2: Brian program scan (`features/data-import/components/`)

- **`formatFileSize(bytes)`** (pure util) — bytes → `"1.42 GB"`. Raw bytes stay in the row data.
- **`BrianProgramSearch`** (component) — program-ID `TextField` + submit; commits `programIdInput`
  to `submittedProgramId` and calls `refetch()`. Renders the `idle` state (nothing scanned yet),
  plus loading / `404` / empty / error. No request fires before submit.
- **`BrianProgramResultsTable`** (component) — MUI `Table`, columns: select checkbox, File Name,
  File Size, File Path, Hiscox Name.
  - Header checkbox = select-all / clear-all, `indeterminate` when partially selected.
  - Zipped hits get an inline "in archive" indication derived from `containingArchive` (no extra
    column).
  - **Hiscox Name** `TextField` is enabled only when its row is ticked. Unticking **keeps** the typed
    value in the store so re-ticking does not lose it.
  - Validation (inline `helperText`): required when ticked, trimmed, and unique across ticked rows.
    Character rules are still open — see Risks.
  - Empty result → "No EDM or RDM databases found for program `<id>`".

### Conventions

TS `strict`, named exports, slice exposed through a single `index.ts`, imports via the `@/` alias.
MUI 7 with `sx` and the shared `theme` from `@/stubs/frontend-shared` — no custom theme, no
`.module.css` for MUI components. React Query owns server state, Zustand owns client state, never
both. Tests live under `tests/` mirroring `src/`, render through `renderWithProviders`, and use
semantic queries only — so every control needs an accessible name (`aria-label` on the search box,
match-mode toggle, refresh button, checkboxes and name fields). `userEvent` for typing so live
filtering is exercised keystroke by keystroke. MSW runs with `onUnhandledRequest: 'error'`, so every
new endpoint needs a handler before its test will pass.

## Key Files

- `risk-modeller-ui/src/features/data-import/index.ts` — new slice barrel (public surface).
- `risk-modeller-ui/src/features/data-import/api/dataImportApi.ts` — new typed API calls.
- `risk-modeller-ui/src/features/data-import/hooks/useRegisteredDatabases.ts` — new query hook.
- `risk-modeller-ui/src/features/data-import/hooks/useBrianProgramScan.ts` — new manual-trigger query hook.
- `risk-modeller-ui/src/features/data-import/stores/useDataImportStore.ts` — new Zustand store.
- `risk-modeller-ui/src/features/data-import/utils/filterDatabases.ts` — new AND/OR term matcher.
- `risk-modeller-ui/src/features/data-import/utils/formatFileSize.ts` — new byte formatter.
- `risk-modeller-ui/src/features/data-import/components/*.tsx` — new panel, search bar, list, scan
  input and results table.
- `risk-modeller-ui/src/app/routes/DataImportPage.tsx` — new page; R1 left, R2 main.
- [risk-modeller-ui/src/app/router.tsx](risk-modeller-ui/src/app/router.tsx) — add the relative
  `data-import` route.
- [risk-modeller-ui/src/types/api.ts](risk-modeller-ui/src/types/api.ts) — add the contracts above.
- [risk-modeller-ui/src/mocks/handlers.ts](risk-modeller-ui/src/mocks/handlers.ts) +
  `src/mocks/data/dataImport.ts` — add handlers and fixtures (program `61741`, plus an unknown-id 404).
- `risk-modeller-ui/tests/features/data-import/**` — new Vitest/RTL tests (mirror source folders).
- Reference shape: [risk-modeller-ui/src/features/status/api/statusApi.ts](risk-modeller-ui/src/features/status/api/statusApi.ts)
  and siblings; UX reference only:
  [risk-modeller-ui/src/components/data_import_existing_databases (2).tsx](risk-modeller-ui/src/components/data_import_existing_databases%20(2).tsx).

## Risks & Open Questions

- **Filtering location (decided — client-side):** the full registered-database list is fetched once
  and filtered in memory. Wins because the requirement is "filtering live as we type" and an AND/OR
  toggle over a request-per-keystroke would be both slower and chattier. Rejected: server-side search
  with the terms and mode as query parameters — revisit if Q2 shows the list can grow large, in which
  case `filterDatabases` moves to the backend and the hook gains parameters.
- **Scan trigger (decided — manual refetch):** `useBrianProgramScan` is `enabled: false` and fired by
  `refetch()` on submit, not by a changing key. A drive scan is expensive and typing a 5-digit ID
  would otherwise fire several scans. Consequence: the submitted id is mirrored into the store so the
  page can tell `idle` from `empty result`.
- **Hiscox Name persistence (decided — keep on untick):** the typed name survives unticking. Cheap,
  and losing a typed name on a mis-click is worse than a slightly larger store. Names for unticked
  rows are simply ignored by any future submit.
- **Row identity (decided — server-supplied `id`):** selection and React keys use the server `id`,
  not the file path or array index, so re-scanning cannot silently re-map selections. Requires the
  backend to make `id` stable per file path — folded into Q6.
- **Q1 — Attach flow.** Confirm this ticket captures Hiscox Names only and the attach action ships
  separately. If attach is in scope, `apiClient` needs `post` and the store needs submit state.
  Blocks: nothing today; changes Scope if wrong.
- **Q2 — Expected list size.** How many registered databases realistically? Answer from the Data
  Bridge owner. If thousands, the client-side filter decision above flips.
- **Q3 — File size representation.** Can the backend return raw bytes rather than pre-formatted
  strings? Needed for correct formatting and future sorting. Backend to confirm; otherwise
  `formatFileSize` is dropped and sorting becomes unreliable.
- **Q4 — Hiscox Name rules.** Allowed characters, max length, and whether uniqueness must be checked
  against names already registered in Data Bridge (that would need a validation endpoint). Backend /
  BA to confirm; affects step 7's validation tests.
- **Q5 — Default Hiscox Name.** The prototype pre-fills e.g. `HX_61741_US_PROP_EDM`. Should the
  backend suggest a default, the UI derive one, or is the field blank? Assumed blank until answered.
- **Q6 — Endpoint paths and shapes.** Everything in Design §"API contracts" is a proposal and needs
  backend sign-off. This is the one thing that can force rework of steps 1–2.
- **Q7 — Program ID format.** Numeric only? Fixed length? Determines input validation in step 6.
- **Q8 — Prototype file.** Confirm `src/components/data_import_existing_databases (2).tsx` can be
  deleted once this ships. Not deleted by this work.
- **Q9 — Nice-to-haves.** "Last updated" caption from `retrievedUtc` and persisted collapse state are
  not in the stated requirements — confirm whether wanted before building them.

## Steps

Each step ends green on `npx tsc --noEmit`, `npm run lint` and `npm test`, run from
`risk-modeller-ui`.

| # | Step | Status | Evidence / notes |
|---|------|--------|------------------|
| 1 | Add contracts to `src/types/api.ts` and create `features/data-import/api/dataImportApi.ts` (both GETs, `signal` forwarded, `programId` encoded). | todo | |
| 2 | Add MSW fixtures `src/mocks/data/dataImport.ts` (registered list + program `61741`) and handlers for both endpoints incl. an unknown-id 404. | todo | |
| 3 | Write failing unit tests then implement `filterDatabases` and `formatFileSize`: AND/OR, multiple spaces, empty query, case-insensitivity, no match; byte boundaries. | todo | |
| 4 | Create `useDataImportStore` and `useRegisteredDatabases`; hook test with MSW asserting data / loading / error. | todo | |
| 5 | Build `ExistingDatabasesPanel` + `DatabaseSearchBar` + `ExistingDatabaseList`. RTL: typing filters live; switching to OR widens results; refresh refetches; collapse hides the list. | todo | |
| 6 | Build `useBrianProgramScan` + `BrianProgramSearch`. RTL: no request before submit; submit fires one request; 404 and empty-result messages render. | todo | |
| 7 | Build `BrianProgramResultsTable`. RTL: rows show name/size/path; select-all and indeterminate; ticking enables the Hiscox Name field; blank and duplicate names show validation. | todo | |
| 8 | Add `DataImportPage`, register the relative `data-import` route, `useDocumentTitle('Data Import')`, export the slice via `index.ts`; run the full suite against the requirements. | todo | |

## Execution Log

_No entries yet — work has not started._

## Deviations

_None yet._

## Resume Point

- **Next action:** get answers to Q1–Q9 (Q6 first — endpoint shapes), then start step 1.
- **Current state:** plan only; no branch, no code. `features/data-import` does not exist.
- **Uncommitted / WIP:** none.
- **Before continuing, re-check:** Q6 (contracts) and Q3 (bytes vs formatted size) — both change
  steps 1–2. Q2 can flip the client-side filtering decision.
- **Definition of done:** the Data Import route renders an expand/collapse Existing Databases panel
  with live AND/OR search and refresh, plus a Brian program-ID scan whose results table lists
  name/size/path with per-row and select-all checkboxes and a Hiscox Name field for ticked rows —
  all covered by tests, with `tsc`, lint and the test suite green.
