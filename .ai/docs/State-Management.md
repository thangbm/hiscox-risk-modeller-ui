# State Management

## What is State Management in React

State management refers to how an application stores, reads, and updates data that must be shared across multiple components or persist across route transitions. Component-local state (`useState`) covers most UI concerns, but as soon as data needs to be available to components that are not in a direct parent-child relationship, (active selections, pagination state, cached API results) a coordination mechanism is needed.

The concept is comparable to dependency injection: the store is registered once and any component can consume it directly via a hook, without passing props down the tree. The main differences between libraries come down to how much structure they impose and how precisely they control which consumers re-render when state changes.

## Redux Toolkit - Current Workbench UI

The Workbench UI (rehub) uses Redux Toolkit (RTK 2.x) with react-redux 9.x. RTK wraps Redux with `createSlice` (action creators and reducers together), `createAsyncThunk` (async operations with automatic *pending/fulfilled/rejected lifecycle*), and Immer (mutation-style immutable updates). Typed `useAppSelector` and `useAppDispatch` hooks provide full TypeScript coverage.

The store is composed of five slices:

| Slice | Responsibility |
| --- | --- |
| taskSlice | Task list, pagination, filters, sort, incremental polling |
| taskDetailSlice | Full task detail and wizard state |
| programmeSlice | Programme list, pagination, filters, sort |
| programmeDetailSlice | Full programme detail |
| dashboardSlice | Dashboard aggregates |

```typescript
export const store = configureStore({
  reducer: {
	tasks: taskReducer,
	taskDetail: taskDetailReducer,
	programmes: programmeReducer,
	programmeDetail: programmeDetailReducer,
	dashboard: dashboardReducer,
  },

  devTools: import.meta.env.DEV,
});
```

**Pros:**

- Single inspectable state tree with Redux DevTools and time-travel debugging
- `createAsyncThunk` handles loading, error, and cancellation with no manual boilerplate
- `getState()` inside thunks enables state-dependent async logic (e.g. incremental polling)
- Strong ecosystem, mature documentation, well-understood patterns across large teams

**Cons:**

- More setup: store configuration, typed hooks, and a separate slice file per domain
- Verbose for simple state: a single boolean flag still requires a slice, action creator, and selector
- Server state (loading/error/data) managed in Redux duplicates what React Query handles natively
- No built-in caching: re-dispatching a thunk always hits the network
- Bundle size ~17 kB (RTK + react-redux)

## Zustand + React Query

Zustand + React Query separates two concerns that Redux handles together:

- **React Query** owns server state: fetching, caching, background refetch, deduplication, stale-while-revalidate, and error handling.
- **Zustand** owns client UI state: pagination parameters, active filters, sort config, navigation selection, anything that has no API backing.

This approach is already used in the Pricing new UI app, and was used in a Charlie UI POC.

### Zustand

A store is created with a single `create` call. No Provider is required; the store is a module-level singleton available by importing its hook anywhere in the application. Components subscribe to individual fields, so a component that reads `pageNumber` does not re-render when `filters` changes.

```typescript
import { create } from 'zustand';

interface ProgrammeFiltersStore {
  pageNumber: number;
  pageSize: number;
  filters: ProgrammeFilters;
  sort: ProgrammeSortConfig;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<ProgrammeFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: ProgrammeSortConfig) => void;
}

export const useProgrammeFiltersStore = create<ProgrammeFiltersStore>((set) => ({
  pageNumber: 1,
  pageSize: 20,
  filters: DEFAULT_FILTERS,
  sort: { field: 'id', direction: 'DESC' },
  setPage: (pageNumber) => set({ pageNumber }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters }, pageNumber: 1 })),
  clearFilters: () => set({ filters: DEFAULT_FILTERS, pageNumber: 1 }),
  setSort: (sort) => set({ sort, pageNumber: 1 }),
}));
```

**Pros**

- Near-zero boilerplate: one `create` call defines state, shape, and actions together
- Fine-grained subscriptions, components only re-render when fields they read change
- No Provider wrapping required
- Excellent TypeScript inference
- ~1 kB bundle

**Cons**

- No built-in async handling, async operations belong in React Query, not the store
- DevTools middleware shows current state but not a full action history
- It has no built-in rules on how or when to create stores, so teams need to define their own patterns to avoid unnecessary ones

### React Query

React Query manages the entire lifecycle of server data. Given a query key and a fetch function, it handles loading state, error state, caching, background refetch, and automatic deduplication of concurrent requests. The result is cached per query key, so navigating back to a previously visited page returns the cached result immediately with no network request.

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['programmes', { pageNumber, pageSize, filters, sort }],
  queryFn: ({ signal }) => programmeService.getProgrammes({ pageNumber, pageSize, filters, sort }, signal),
});
```

When any key parameter changes (page, filters, sort), React Query automatically fires a new request. The component has no awareness of fetching at all.

## Migration Example: Programme List (Workbench)

The *programmeSlice* is a clean illustration of the pattern because it is focused: one async operation, standard loading/error/data tracking, and a set of client-side filter/sort/pagination parameters.

### Current: Redux Toolkit

The slice manages eleven fields. Changing the page requires two dispatches in the right order, if the component forgets the second one, the UI is out of sync:

```typescript
// store/programmeSlice.ts — 125 lines
interface ProgrammeListState {
  items: ProgrammeListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: ProgrammeFilters;
  sort: ProgrammeSortConfig;
}

export const fetchProgrammes = createAsyncThunk(
  'programmes/fetchProgrammes',
  async (_, { getState, signal }) => {
	const state = (getState() as { programmes: ProgrammeListState }).programmes;

	return programmeService.getProgrammes(
	  { filters: state.filters, sort: state.sort, pageNumber: state.pageNumber, pageSize: state.pageSize },
	  signal,
	);
  },
);

const programmeSlice = createSlice({
  name: 'programmes',
  initialState,
  reducers: {
	setProgrammeFilters(state, action) { state.filters = { ...state.filters, ...action.payload }; },
	clearProgrammeFilters(state)       { state.filters = { ...DEFAULT_FILTERS }; },
	setProgrammeSort(state, action)    { state.sort = action.payload; state.pageNumber = 1; },
	setProgrammePage(state, action)    { state.pageNumber = action.payload; },
  },
  extraReducers: (builder) => {
	builder
	  .addCase(fetchProgrammes.pending,   (state) => { state.loading = true; state.error = null; })
	  .addCase(fetchProgrammes.fulfilled, (state, action) => {
		state.loading = false;
		state.items = action.payload.items;
		state.totalCount = action.payload.totalCount;
		state.pageNumber = action.payload.pageNumber;
		state.pageSize = action.payload.pageSize;
		state.totalPages = action.payload.totalPages;
	  })
	  .addCase(fetchProgrammes.rejected, (state, action) => {
		state.loading = false;
		state.error = action.error.message ?? 'Failed to load programmes';
	  });
  },
});
```

```typescript
// In the component — must dispatch two actions in the right order
const dispatch = useAppDispatch();
const { items, pageNumber, totalPages, loading, error } = useAppSelector((s) => s.programmes);

useEffect(() => { dispatch(fetchProgrammes()); }, [dispatch]);

<Pagination
  page={pageNumber}
  totalPages={totalPages}
  onChange={(page) => {
	dispatch(setProgrammePage(page));
	dispatch(fetchProgrammes()): // easy to forget
  }}
/>
```

### Zustand + React Query equivalent

The Zustand store holds only the four client-side parameters. React Query owns everything from the API, the slice is no longer needed.

```typescript
// store/useProgrammeFiltersStore.ts — 20 lines
export const useProgrammeFiltersStore = create<ProgrammeFiltersStore>((set) => ({
  pageNumber: 1,
  pageSize: 20,
  filters: DEFAULT_FILTERS,
  sort: { field: 'id', direction: 'DESC' },
  setPage:    (pageNumber) => set({ pageNumber }),
  setFilters: (filters)   => set((s) => ({ filters: { ...s.filters, ...filters }, pageNumber: 1 })),
  clearFilters: ()        => set({ filters: DEFAULT_FILTERS, pageNumber: 1 }),
  setSort:    (sort)      => set({ sort, pageNumber: 1 }),
}));
```

```typescript
// In the component
const { pageNumber, pageSize, filters, sort, setPage, setFilters, clearFilters, setSort } =
  useProgrammeFiltersStore();

// this piece of code can be abstracted in another hook to cleanup the component code
const { data, isLoading, error } = useQuery({
  queryKey: ['programmes', { pageNumber, pageSize, filters, sort }],
  queryFn: ({ signal }) =>
	programmeService.getProgrammes({ pageNumber, pageSize, filters, sort }, signal),
});

// Pagination just calls setPage — no dispatch, no manual fetch trigger
<Pagination
  page={pageNumber}
  totalPages={data?.totalPages ?? 0}
  onChange={setPage}
/>
```

programmeService.ts is unchanged, React Query calls the same service methods.

### What changes

| | Redux Toolkit | Zustand + React Query |
| --- | --- | --- |
| State fields in store | 9 (items, totalCount, pageNumber, pageSize, totalPages, loading, error, filters, sort) | 4 (pageNumber, pageSize, filters, sort) |
| Server data ownership | Redux slice | React Query |
| Page change | 2 dispatches | 1 `setPage` call |
| Caching | None, re-fetches on every dispatch | Per query key, instant on back-navigation |
| Bundle delta | 17kb | 5kb |
| Lines of store code | ~125 | ~20 |

React Query is more efficient at runtime: it caches per query key (navigating back to a previous page is instant), deduplicates concurrent requests to the same key automatically, and only refetches when data is stale.

**Why not use Redux and React Query together?** We should avoid using React Query and Redux together because when both are present, server data ends up stored in two places. Redux holds its own copy and React Query holds another, and they will go out of sync the moment one updates without the other knowing. There is no built-in bridge between them, so keeping both aligned requires manual coordination that defeats the purpose of having React Query at all.

### Community Alternatives

These are not currently used in Workbench or the POC applications but are referenced here for context on the broader React ecosystem.

#### MobX

MobX uses a reactive model: state is declared as *observable*, derived values as `computed`, and mutations as `action`. Components wrapped in *observer* automatically re-render when observables they read change — no selectors or subscriptions needed. It is well-suited to applications built around class-based domain models with complex, interconnected entity graphs and many derived values. Its reactive model is a poor fit for flat list-of-records data driven by a standard REST API, and the class-based style sits awkwardly alongside React's functional component model. Bundle is comparable to RTK.

#### Context API

`React.createContext` combined with `useReducer` can approximate a Redux store using only built-in React primitives. React's own documentation recommends Context for values that change infrequently: authenticated user, active theme, feature flags, locale preference. Its main limitation is that all consumers of a context re-render when any part of the value changes, so managing performance at scale requires splitting into many narrow contexts. No DevTools support, and async handling must be built from scratch.

## Key Considerations

- **Server state vs UI state:** State that has an API source of truth (list items, totals, detail records) belongs in React Query. State that exists only in the client (active filters, selected rows, modal visibility) belongs in Zustand or local component state.
- **Complexity alignment**: RTK's structure pays off when state logic is genuinely complex: Cross-slice reads, state-dependent async logic, or incremental polling. For the majority of Workbench slices that follow a simple `loading / error / data` pattern around a single API call, that structure is overhead with no corresponding benefit.
- **Caching**: Redux with `createAsyncThunk` has no built-in caching and fetches on every dispatch. React Query caches per query key by default. This is a meaningful runtime performance difference for list views with pagination.
- **Cross-app isolation:** No state management library provides cross-application state sharing in a micro-frontend architecture. Cross-app communication must go through a shared event bus or URL state, library stores are isolated per application bundle.
- **Incremental polling (task slice):** The task slice polls for new items using `lastPollTimestamp` read from Redux state mid-thunk, a pattern that React Query's `refetchInterval` does not replicate directly. Migrating this requires extracting the polling logic into a custom hook that manages the timestamp and calls the service directly. This hook is a good candidate for `RE-Frontend-Shared` so other applications can reuse it.

**Migration Approach for Workbench (if we decide to change it in the future):**

A full migration from Redux to Zustand + React Query goes slice by slice:

1. Replace each async thunk and its `pending`/`fulfilled`/`rejected` cases with a `useQuery` or `useMutation` call.
2. Move client-only state (filters, pagination, sort) to a Zustand store.
3. Delete the slice and its registration from `configureStore`.
4. Understand cross-slice dependencies before removing any slice, some thunks read from other slices via `getState()`.

The `programmeSlice` (shown above) is the lowest-risk starting point. The `taskDetailSlice` (~900 lines, 15+ thunks, wizard state, file handling) is the highest-risk and should be last. The incremental polling in `taskSlice` needs dedicated design before migration.
