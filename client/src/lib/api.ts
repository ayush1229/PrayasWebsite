export const API_BASE_URL = "http://localhost:5000/api";

// The origin of the backend server — derived from API_BASE_URL.
// Used to resolve relative paths (e.g. /files/financials/...) into full URLs.
// On deployment, just update API_BASE_URL and this automatically follows.
export const BACKEND_ORIGIN = new URL(API_BASE_URL).origin; // "http://localhost:5000"

/**
 * Resolves a pdfUrl that may be an absolute URL or a relative path like
 * /files/financials/expenditure/foo.pdf → full URL using BACKEND_ORIGIN.
 */
export function resolveUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND_ORIGIN}${url}`;
}


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

/**
 * Rewrites a Cloudinary image URL to include automatic format (WebP/AVIF),
 * quality compression, and a max-width resize.
 *
 * w presets:
 *   "thumb"  → w_200  (profile photos, avatars)
 *   "card"   → w_600  (activity cards, gallery thumbnails)
 *   "hero"   → w_1200 (hero / full-width banner images)
 *
 * Non-Cloudinary URLs are returned unchanged.
 * PDF / raw URLs are returned unchanged.
 */
const W_PRESETS = { thumb: 200, card: 600, hero: 1200 } as const;
type ImgSize = keyof typeof W_PRESETS | number;

export function cloudinaryUrl(url: string | undefined | null, size: ImgSize = "card"): string {
  if (!url) return "";
  // Pass through non-Cloudinary and PDF/raw URLs unchanged
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/raw/upload/") || url.endsWith(".pdf")) return url;
  // Already transformed — don't double-apply
  if (url.includes("/upload/f_auto")) return url;

  const w = typeof size === "number" ? size : W_PRESETS[size];
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`);
}
