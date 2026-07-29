import { PublicClientApplication, type IPublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './msalConfig';
import { fakeMsalInstance } from './fakeMsalInstance';

/**
 * Whether the real Entra ID App Registration values have been provisioned.
 * Falls back to `fakeMsalInstance` until they are — see `fakeMsalInstance.ts`.
 */
const isAadConfigured = Boolean(
  import.meta.env.VITE_AZURE_AD_CLIENT_ID && import.meta.env.VITE_AZURE_AD_TENANT_ID,
);

if (!isAadConfigured) {
  console.warn(
    '[MockAuth] VITE_AZURE_AD_CLIENT_ID/VITE_AZURE_AD_TENANT_ID are not set — using fakeMsalInstance. ' +
      'Set both env vars once the Entra ID App Registration is available to switch to real MSAL.',
  );
}

/**
 * Singleton MSAL instance. Initialised once here, in the host shell, per the
 * micro-frontend architecture: remotes never create their own MSAL instance.
 */
export const msalInstance: IPublicClientApplication = isAadConfigured
  ? new PublicClientApplication(msalConfig)
  : fakeMsalInstance;
