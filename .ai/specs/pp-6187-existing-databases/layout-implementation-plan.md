# AI Implementation Specification

## Feature: Existing Databases Drawer (Data Import Screen)

**Version:** 1.0\
**Framework:** Material UI (preferred)
### Goal

Implement the **Existing Databases** slide-out drawer used during the
**New Data Import** workflow.

## Overall Layout

-   Left slide-out drawer overlays the main page.
-   Desktop width: 520--560px
-   Tablet: 420px
-   Mobile: Full width
-   Drawer background: `#18222F`
-   Main page remains visible with a dimmed overlay.

## Component Hierarchy

``` text
<DataImportPage>
 └── <ExistingDatabasesDrawer>
      ├── DrawerHeader
      ├── SearchToolbar
      ├── DatabaseList
      └── DatabaseCard
```

## Drawer Header

-   Title: **Existing Databases**
-   Subtitle:
    -   "All databases attached to Data Bridge and registered for Risk
        Modeller."
-   Collapse button in top-right.

## Search Toolbar

-   Search field
    -   Rounded, 48px height
    -   Search icon
    -   Placeholder: `search databases...`
    -   Clear (X) button
    -   Border: `#2D8CFF`
    -   Background: `#24303E`
    -   300ms debounce
-   Refresh button
    -   48x48
    -   Rotating icon while loading
    -   Tooltip: "Refreshing..."
    -   Calls `refreshDatabases()`

## Filter Mode

-   CLEAR button
-   AND / OR segmented toggle
-   Default: AND
-   AND = all keywords match
-   OR = any keyword matches

## Database List

-   Scrollable
-   Virtualize after 200 items

## Database Card

Displays: - Database icon - Name - Last synced timestamp

Hover: - `rgba(255,255,255,.05)`

Selected: - 4px blue left border - Background `rgba(0,120,255,.15)`

## Data Model

``` ts
export interface DatabaseItem {
  id: string;
  name: string;
  description?: string;
  lastSynced: string;
  status: "online" | "offline" | "syncing";
  tags: string[];
}
```

## Mock Data

Generate approximately 30 realistic database names including: -
Finance - HR - Sales - Market - Compliance - Claims - Risk - Customer -
Underwriting - CatModel

## Search Behavior

-   Case insensitive
-   Multiple keyword support
-   AND/OR logic

## Loading State

-   Show 8 skeleton rows while refreshing.

## Empty State

Title: \> No databases found

Subtitle: \> Try another search.

Button: \> Clear Search

## Animations

-   Drawer slide: 250ms ease-out
-   Hover: 150ms
-   Refresh icon spins while loading

## Accessibility

-   Ctrl+F focuses search
-   ESC closes drawer
-   Proper tab order
-   `role="listbox"` and `role="option"`

## React State

``` ts
const [drawerOpen, setDrawerOpen] = useState(true);
const [loading, setLoading] = useState(false);
const [search, setSearch] = useState("");
const [filterMode, setFilterMode] = useState<"AND"|"OR">("AND");
const [selectedDatabase, setSelectedDatabase] = useState<string|null>(null);
const [databases, setDatabases] = useState<DatabaseItem[]>([]);
```

## API

GET `/api/databases`

POST `/api/databases/refresh`

## Folder Structure

``` text
src/
 components/
   ExistingDatabases/
     ExistingDatabasesDrawer.tsx
     DrawerHeader.tsx
     SearchToolbar.tsx
     DatabaseList.tsx
     DatabaseCard.tsx
     EmptyState.tsx
     LoadingSkeleton.tsx
 hooks/
   useDatabaseSearch.ts
 services/
   database.service.ts
 models/
   DatabaseItem.ts
 pages/
   DataImportPage.tsx
```

## Styling

Colors: - Drawer: `#18222F` - Panel: `#24303E` - Border: `#31465B` -
Primary: `#2D8CFF` - White text - Secondary: `rgba(255,255,255,.75)`

Border radius: - Drawer: 18px - Search: 12px - Buttons: 10px - Cards:
8px

8px spacing grid.

## Acceptance Criteria

-   Pixel-close implementation of mockup
-   Smooth drawer animation
-   Debounced search
-   AND/OR filtering
-   Refresh loading state
-   Scrollable + virtualized list
-   Keyboard accessible
-   Fully typed TypeScript
-   Modular React components
