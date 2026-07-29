import type { Configuration, RedirectRequest } from '@azure/msal-browser';

/**
 * MSAL configuration for the shell's single Entra ID App Registration.
 *
 * PLACEHOLDERS: `VITE_AZURE_AD_CLIENT_ID` / `VITE_AZURE_AD_TENANT_ID` must be
 * set to real Entra ID App Registration values (see `.env.development`).
 * See: ../../.ai/docs/Authentication pattern.md
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID ?? '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_AD_TENANT_ID ?? ''}`,
    redirectUri: import.meta.env.VITE_AZURE_AD_REDIRECT_URI ?? window.location.origin,
    postLogoutRedirectUri:
      import.meta.env.VITE_AZURE_AD_POST_LOGOUT_REDIRECT_URI ?? window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile'],
};

export const requiredRiskModellerRole =
  import.meta.env.VITE_AZURE_AD_REQUIRED_ROLE ?? 'RiskModeller.Read';
