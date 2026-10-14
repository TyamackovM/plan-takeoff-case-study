import type { Health, Library, LibrarySummary, Plan, PlanSummary } from "./types.ts";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = response.statusText || `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string" && body.detail.length > 0) {
        detail = body.detail;
      }
    } catch {
      // The error body was not JSON.
    }
    throw new Error(detail);
  }
  return (await response.json()) as T;
}

function get<T>(path: string, signal: AbortSignal): Promise<T> {
  return fetch(path, { signal, headers: { Accept: "application/json" } }).then((response) =>
    readJson<T>(response),
  );
}

export function getHealth(signal: AbortSignal): Promise<Health> {
  return get("/api/v1/health", signal);
}

export function getPlans(signal: AbortSignal): Promise<PlanSummary[]> {
  return get("/api/v1/plans", signal);
}

export function getPlan(id: string, signal: AbortSignal): Promise<Plan> {
  return get(`/api/v1/plans/${encodeURIComponent(id)}`, signal);
}

export function getLibraries(signal: AbortSignal): Promise<LibrarySummary[]> {
  return get("/api/v1/libraries", signal);
}

export function getLibrary(version: string, signal: AbortSignal): Promise<Library> {
  return get(`/api/v1/libraries/${encodeURIComponent(version)}`, signal);
}
