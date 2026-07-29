/**
 * Shared, app-wide TypeScript types that are not owned by a single feature.
 * Feature-specific types live under `features/<name>/types/`.
 */

/** Standard problem-details-ish error surfaced by the backend API. */
export interface ApiError {
  status: number;
  message: string;
}
