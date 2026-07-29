import {
  Logger,
  stubbedPublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
  type IPublicClientApplication,
} from '@azure/msal-browser';
import { requiredRiskModellerRole } from './msalConfig';

/**
 * Fake signed-in account used while the real Entra ID App Registration is
 * being provisioned. Carries the App Role `RequireRole` checks for, so the
 * whole shell — including the Risk Modeller route — works end-to-end without
 * real AAD infrastructure.
 */
const FAKE_ACCOUNT: AccountInfo = {
  homeAccountId: 'mock-home-account-id',
  environment: 'login.microsoftonline.com',
  tenantId: 'mock-tenant-id',
  username: 'dev.user@hiscox.com',
  localAccountId: 'mock-local-account-id',
  name: 'Local Dev User (mock auth)',
  idTokenClaims: { roles: [requiredRiskModellerRole] },
};

function createFakeAuthenticationResult(): AuthenticationResult {
  return {
    authority: 'https://mock.local/',
    uniqueId: FAKE_ACCOUNT.localAccountId,
    tenantId: FAKE_ACCOUNT.tenantId,
    scopes: ['openid', 'profile'],
    account: FAKE_ACCOUNT,
    idToken: '',
    idTokenClaims: FAKE_ACCOUNT.idTokenClaims ?? {},
    accessToken: 'mock-access-token',
    fromCache: false,
    expiresOn: new Date(Date.now() + 60 * 60 * 1000),
    tokenType: 'Bearer',
    correlationId: 'mock-correlation-id',
  };
}

const logger = new Logger({});

/**
 * Drop-in `IPublicClientApplication` used in place of the real MSAL instance
 * while Azure AD infrastructure (App Registration, redirect URI, App Role
 * assignment) is being set up. Always reports one signed-in account, so
 * `RequireAuth`/`RequireRole`/`useAuth` behave exactly as they would against
 * a real, already-authenticated session — no other file needs to know this
 * is a mock. Selected automatically by `msalInstance.ts`; remove that branch
 * (and this file) once real `VITE_AZURE_AD_CLIENT_ID`/`VITE_AZURE_AD_TENANT_ID`
 * values are available.
 */
export const fakeMsalInstance: IPublicClientApplication = {
  ...stubbedPublicClientApplication,
  initialize: () => Promise.resolve(),
  handleRedirectPromise: () => Promise.resolve(null),
  initializeWrapperLibrary: () => undefined,
  getAllAccounts: () => [FAKE_ACCOUNT],
  getAccount: () => FAKE_ACCOUNT,
  getActiveAccount: () => FAKE_ACCOUNT,
  setActiveAccount: () => undefined,
  getLogger: () => logger,
  setLogger: () => undefined,
  loginRedirect: () => {
    console.info('[MockAuth] loginRedirect called — already signed in as the fake dev user.');
    return Promise.resolve();
  },
    loginPopup: () => Promise.resolve(createFakeAuthenticationResult()),
  logoutRedirect: (request) => {
    console.info('[MockAuth] logoutRedirect called — fake auth has no real session to end.');
    if (request?.postLogoutRedirectUri) {
      window.location.assign(request.postLogoutRedirectUri);
    }
    return Promise.resolve();
  },
  acquireTokenSilent: () => Promise.resolve(createFakeAuthenticationResult()),
  acquireTokenRedirect: () => Promise.resolve(),
  ssoSilent: () => Promise.resolve(createFakeAuthenticationResult()),
};
