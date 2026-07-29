import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { msalInstance } from './auth/msalInstance';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

// MSAL v3+ requires explicit initialisation, and `handleRedirectPromise` must
// resolve before rendering so the app can process the return trip from Entra
// ID's login page (see RequireAuth / loginRedirect).
async function bootstrap(container: HTMLElement) {
  await msalInstance.initialize();
  await msalInstance.handleRedirectPromise();

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap(rootElement);

