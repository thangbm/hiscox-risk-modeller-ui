import { AppProvider } from '@/app/provider';
import RiskModellerApp from '@/app/RiskModellerApp';

/**
 * STANDALONE entry component. Wraps the federation-exposed `RiskModellerApp`
 * with the providers the host would otherwise supply, so the remote runs on its
 * own dev server for day-to-day feature work.
 */
export const App = () => (
  <AppProvider>
    <RiskModellerApp />
  </AppProvider>
);
