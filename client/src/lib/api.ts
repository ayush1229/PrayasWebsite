export const API_BASE_URL = "http://localhost:5000/api";

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

// Normalise API responses that may be an array or { data: [...] }
export function normaliseList<T>(data: T[] | { data: T[] } | unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in (data as object)) {
    return (data as { data: T[] }).data;
  }
  return [];
}
