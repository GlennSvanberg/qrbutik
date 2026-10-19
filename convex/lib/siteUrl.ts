/** Primary public origin (www). Set SITE_URL in Convex for overrides. */
export const DEFAULT_SITE_URL = "https://www.qrbutik.se";

export function normalizePublicOrigin(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "qrbutik.se") {
      parsed.hostname = "www.qrbutik.se";
    }
    return parsed.origin;
  } catch {
    return url.replace(/\/$/, "");
  }
}

export function getSiteUrl(): string {
  const fromEnv = process.env.SITE_URL?.trim();
  if (fromEnv) {
    return normalizePublicOrigin(fromEnv.replace(/\/$/, ""));
  }
  if (process.env.DEV_MAGIC_LINK === "true") {
    return "http://localhost:5173";
  }
  return DEFAULT_SITE_URL;
}
