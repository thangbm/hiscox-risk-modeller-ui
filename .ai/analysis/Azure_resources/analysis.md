# Azure Resources Analysis — Hiscox Risk Modeller

## Purpose & Scope

This document derives the **Azure resources required** to run and support the
Hiscox Risk Modeller platform, based solely on an analysis of **this repository**
(`Hiscox-Risk-Modeller-UI`). It is intended as an input to the wider project that
will build the **backend** (`Hiscox.RiskModeller.Api`), which is handled
separately.

The frontend itself is a client-side **Module Federation remote** (static
assets) and needs very little Azure infrastructure directly. However, the code,
configuration and architecture docs in this repo describe a clear integration
contract with a set of backend and platform Azure services. Those are captured
here so the resource list for the backend can be generated completely.

> Note: This is an inferred/derived list based on the UI repo. Final resource
> decisions belong to the backend project. Nothing here provisions anything.

## Evidence Base (what this repo tells us)

| Source | What it reveals |
| --- | --- |
| `README.md`, `.github/copilot-instructions.md` | App is a React+Vite **MF remote** loaded by the **Rehub** host; backend is a **C# / Azure Functions (isolated worker)** project acting as the integration layer to **Moody's Cloud RMS (Intelligent Risk Platform)**. |
| `.ai/docs/Authentication pattern.md` | Auth topology: **Entra ID App Registration** (single, with App Roles + groups) → **Azure Front Door** (TLS/WAF) → **Azure API Management** (`validate-jwt`) → **Azure Functions**. Certificate credentials in **Key Vault**; Entra ID **sign-in logs** for audit. |
| `.ai/docs/Micro-Frontend-Architecture.md` | Remotes publish `remoteEntry.js` static assets served over HTTPS from a URL the host references; first-load fetched by browser (implies static hosting + CDN). |
| `risk-modeller-ui/vite.config.ts`, `.env.*` | Client calls same-origin `/api`; `VITE_API_BASE_URL=/api`; dev proxies `/api` → `API_PROXY_TARGET` (Functions backend). Implies `/api` ingress routing to backend in every hosted environment. |
| `src/utils/apiClient.ts` | Bearer token (MSAL) sent as `Authorization` header to the backend — confirms token-based auth flow at the gateway. |
| `src/types/api.ts`, `features/status` | Backend exposes `GET /api/status` reporting **Moody's Cloud RMS connectivity** — confirms outbound integration to Moody's IRP. |
| `.env.staging`, `.env.system`, `.env.production`, `.env.development` | Multiple deployment environments exist (dev / system / staging / production). |

## Azure Resources — Frontend (this repo)

The remote ships as static, pre-built assets (`remoteEntry.js` + hashed chunks).

| Resource | Why it's needed | Notes |
| --- | --- | --- |
| **Azure Static Web Apps** | Host the built remote (`remoteEntry.js` + JS/CSS chunks) served over HTTPS at the URL referenced by `VITE_RISK_MODELLER_REMOTE_URL`. | Confirmed hosting target for this app. MF remote is just static files; no server runtime needed. Provides built-in global CDN + managed TLS. |
| **CORS / same-origin routing for `/api`** | Client uses same-origin `/api`; each hosted environment must route `/api` to the backend to avoid CORS. | Configured via `staticwebapp.config.json` API/route rules (or Front Door/APIM route) forwarding `/api` to the backend. |

Per-environment (dev, system, staging, production) instances of the hosting +
delivery resources are implied by the four `.env.*` files.

## Azure Resources — Platform / Shared (from architecture docs)

These are shared across the workbench (Rehub host + all remotes) but are
prerequisites for this app to function end-to-end.

| Resource | Role | Source |
| --- | --- | --- |
| **Microsoft Entra ID — App Registration** (single, workbench-wide) | Identity for auth; defines **App Roles** (e.g. `Operations.Read`, `Pricing.Write`) and the API scope `api://{client-id}`. | Authentication pattern doc |
| **Microsoft Entra ID — Security Groups** | Map users → App Roles via group claims. | Authentication pattern doc |
| **Azure Front Door** | Global entry point; TLS termination, **WAF**, geo-redundant routing to APIM. | Authentication pattern doc |
| **Azure API Management** | Gateway; `validate-jwt` policy validates token signature/audience/issuer once; forwards user claims (`X-User-Id`, `X-User-Roles`) to Functions. | Authentication pattern doc |
| **Azure Key Vault** | Store App Registration **certificate credentials** and secrets; short-lived tokens. | Authentication pattern doc (security considerations) |
| **Entra ID Sign-in Logs / Azure Monitor** | Auditability of authentication events. | Authentication pattern doc |

## Azure Resources — Backend (delegated, inferred)

Owned by `Hiscox.RiskModeller.Api` (separate project). Listed so the generated
resource list is complete; **not implemented here**.

| Resource | Why (inferred from UI repo) |
| --- | --- |
| **Azure Functions (isolated worker, .NET/C#)** | The backend integration layer the UI calls at `/api/*` (e.g. `GET /api/status`). Explicitly described in README and copilot instructions. |
| **App Service Plan / Functions hosting plan** | Compute host for the Functions app (Consumption / Premium / Dedicated — backend's choice). |
| **Storage Account** (Functions runtime) | Required by Azure Functions for its runtime (triggers, state, deployment). |
| **Application Insights + Log Analytics workspace** | Observability/telemetry for the Functions backend and gateway; supports auditability requirement. |
| **Managed Identity** (for the Functions app) | Pull certs/secrets from Key Vault and authenticate to downstream services without stored credentials. |
| **Outbound connectivity to Moody's Cloud RMS (Intelligent Risk Platform)** | Backend integrates with Moody's IRP; `GET /api/status` reports Moody's connectivity. May require secrets/credentials in Key Vault and possibly VNet/egress controls. |
| **(Optional) Azure Key Vault references / secrets** | Moody's IRP API credentials and any backend secrets. |

## Consolidated Resource List (for generation)

Frontend-owned (this repo):
- **Azure Static Web Apps** (built-in CDN + managed TLS)
- `/api` routing rule (via `staticwebapp.config.json`, or Front Door / APIM)
- Per-environment instances: dev, system, staging, production

Platform / shared (prerequisite):
- Entra ID App Registration (single, App Roles + API scope)
- Entra ID security groups
- Azure Front Door (TLS + WAF)
- Azure API Management (`validate-jwt`)
- Azure Key Vault (certs/secrets)
- Entra ID sign-in logs / Azure Monitor (audit)

Backend (delegated to `Hiscox.RiskModeller.Api`):
- Azure Functions (isolated worker, C#)
- Functions hosting plan (App Service / Premium / Consumption)
- Storage Account (Functions runtime)
- Application Insights + Log Analytics
- Managed Identity
- Moody's Cloud RMS (IRP) outbound integration + credentials

## Open Questions / Assumptions

- **Static host**: confirmed as **Azure Static Web Apps** — the app is deployed
  there. Its built-in CDN + managed TLS cover asset delivery.
- **Environments**: confirmed **four** environments — **dev / system / staging /
  production** (matching the four `.env.*` files). Each needs its own Static Web
  Apps hosting instance; whether each also gets isolated Front Door/APIM is a
  platform/backend decision.
- **Front Door + APIM** are described as **shared workbench** infrastructure
  (Rehub-owned), not provisioned per-remote — confirm ownership boundary.
- **Moody's IRP connectivity**: owned and handled entirely by the **backend
  project** (`Hiscox.RiskModeller.Api`). The connectivity model (private
  endpoint / VNet vs public egress) and any credentials are out of scope for
  this UI repo.
- The frontend requires **no compute runtime** of its own — it is static assets
  only; all dynamic behaviour is delegated to the backend.
