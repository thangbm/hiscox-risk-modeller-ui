import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components';
import { DashboardPage } from '@/app/routes/DashboardPage';
import { DataImportPage } from '@/app/routes/DataImportPage';

/**
 * Nested routes for this remote. The HOST owns the top-level Router and mounts
 * this module under a path prefix (e.g. /risk-modeller/*), so routes here are
 * relative. Standalone dev wraps this in a BrowserRouter (see main.tsx).
 */
export const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<DashboardPage />} />
      <Route path="data-import" element={<DataImportPage />} />
    </Route>
  </Routes>
);
