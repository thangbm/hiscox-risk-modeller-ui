# Feature Specification: Data Bridge Import & Database Drawer View

## Overview
Implement a dual-panel interface featuring a ** "Existing Databases" drawer/side-panel** and a ** "New Data Import" ** inside a React application.

---

## 1. Tech Stack & Dependencies
* **Framework:** React (TypeScript)
* **Library:** @mui/material
* **Icons:** @mui/icons-material
---

## 2. Layout Structure
```
+-----------------------------------------------------------------------------------+
| Mini Sidebar | Existing Databases Panel     | Main Form Area (main area) |
|  (Nav icons) |  - Header & Subtitle                   |           |
|              |  - Refresh + Search + AND/OR Filter   |  - Form Fields               |
|              |  - Database List                      |  - File Upload Area          |
|              |                                       |  - list (table) shows all the files  load from directory loaded from input box|
+-----------------------------------------------------------------------------------+
```

---

## 3. Component Breakdown & Specifications

### A. Primary Mini Sidebar (Leftmost)
* **Width:** Fixed `w-16` (64px).
* **Theme:** Very dark slate/navy (`#121620`).
* **Icons:**
  * Top: Home, Database (Active), Layers, BarChart / Trend.
  * Bottom: LogOut / Exit icon.
* **Behavior:** Clicking Database toggles/opens the Database side drawer.

---

### B. Existing Databases Panel (Dark Drawer)
* **Width:** Responsive drawer (~380px–420px).
* **Theme:** Dark Slate (`#1A1F2C` / `#222834`), Text Color: Light Gray/White.
* **Header Section:**
  * Title: `Existing Databases` (Font size: 20px, Bold).
  * Subtitle: `All databases attached to Data Bridge and registered for Risk Modeller.` (Muted text, size: 12px).
  * Top-Right Collapse Control: `<<` icon button to collapse panel.
* **Section Header:**
  * Label: `Registered Databases (Data Bridge Source)`
  * Refresh Action: Blue circular icon button (`#1D4ED8` or similar). On hover/click, displays a tooltip badge `Refreshing...`.
* **Search & Filter Bar Container:**
  * Border-highlighted container (Blue/Red focus ring state or subtle border).
  * **Search Input:**
    * Magnifying glass icon on left.
    * Placeholder: `Search databases...`
    * Clear button (`X`) inside input field.
  * **Filter Controls:**
    * Text button: `CLEAR`
    * Boolean Toggle Switch: Switches between `AND` / `OR` labels with an active pill background.
* **Database List (Scrollable):**
  * Max height scroll container (`overflow-y-auto`).
  * Item Layout:
    * Left: Database Stack Icon (`lucide-react: Database`).
    * Right / Content:
      * Database Name: Bold text (e.g., `DB_FINANCE_H1_2024`, `DB_OPERATIONS_Q3_2023`).
      * Sub-label: `Last-synced: HH:MM:SS AM` (Muted gray text).
  * Hover/Active state on list items.

---

## 4. Main Content Area: "New Data Import"
* **Theme:** Light Gray / Neutral (`#F8FAFC`).
* **Header Title:** `NEW DATA IMPORT` (Uppercase, 22px, Semi-bold).

### 1. Wizard Stepper Header
* Horizontal progress indicator with numbered step badges:
  * **Step 1:** `Data Source Selection` (Active - Solid Blue Circle `#2563EB`).
  * **Step 2:** `Data Modification` (Inactive/Pending - Outline Circle `#94A3B8`).
  * **Step 3:** `Wizard` (Inactive/Pending).

### 2. Form Fields (Grid Layout)
* **Row 1 (Two Columns):**
  * **Data Source Name:** Dropdown Select (Default: `Data Bridge`).
  * **Data Type *:** Dropdown Select (Default: `MPP exportation`).
* **Row 2 (Full Width):**
  * **Data Type * / Schema Select:** Dropdown Select with required asterisk indicator (Default: `Default internal`).

### 3. File Upload Dropzone
* Dashed border container (`border-dashed border-2 border-gray-300 rounded-lg`).
* Centered layout with Upload Cloud Icon.
* Text label: `Drop upload or text file here`.
* Accept drag-and-drop file drag events or click-to-browse file input.

### 4. Interactive Results Table
* Select All Checkbox: header checkbox for easy bulk toggling
* Detailed Metadata Columns: Displays File name, type (edm/rdm badge), file size, and full file path
* Hiscos Name Input: Editable input for each selected database to set its registry identifier for Data Bridge


### 5. Data Bridge attach action:
Ticking items and clicking "Attach to Data Bridge" registers them directly into the Existing Databases left sidebar (via Backend API call)

---

## 5. Mock Data Structure (TypeScript)

```typescript
export interface DatabaseItem {
  id: string;
  name: string;
  lastSynced: string;
}

export const MOCK_DATABASES: DatabaseItem[] = [
  { id: '1', name: 'DB_FINANCE_H1_2024', lastSynced: '13:33:27 AM' },
  { id: '2', name: 'DB_OPERATIONS_Q3_2023', lastSynced: '13:33:27 AM' },
  { id: '3', name: 'DB_GLOBAL_MARKET_DATA', lastSynced: '13:33:27 AM' },
  { id: '4', name: 'DB_HR_COMPLIANCE_A', lastSynced: '13:33:37 AM' },
  { id: '5', name: 'DB_SALES_PERFORMANCE_NA', lastSynced: '13:33:37 AM' },
  { id: '6', name: 'DB_FINANCE_H1_2024', lastSynced: '12:33:37 AM' },
  { id: '7', name: 'DB_OPERATIONS_2022', lastSynced: '11:20:10 AM' },
];
```

---

## 6. State Management & Interactive Requirements
1. **Search Filtering:** Filtering the database list based on the search input string.
2. **Clear Search:** Clicking `CLEAR` or `X` resets search input and restores full mock list.
3. **AND/OR Toggle:** Local state to switch active search mode boolean.
4. **Refresh Tooltip:** Clicking the refresh button sets a temporary `isRefreshing = true` state and shows a `Refreshing...` badge.
5. **Drawer Collapse:** Clicking the top `<<` button collapses the drawer panel width.

---

## 7. Acceptance Criteria
* [ ] UI accurately matches the visual hierarchy, color scheme (Dark drawer + Light content area), and typography of the target mockup.
* [ ] Navigation icons, search inputs, radio buttons, and dropdowns are fully functional React components.
* [ ] Responsive behavior ensures full functionality across standard desktop screen resolutions.
