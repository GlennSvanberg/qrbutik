import { convexSiteUrl } from "./authClient";

const devMagicLinkEnabled =
  (import.meta as any).env.VITE_DEV_MAGIC_LINK === "true";

export const isDevMagicLinkEnabled = (): boolean => devMagicLinkEnabled;

export const maybeOpenDevMagicLink = async (
  email: string,
): Promise<boolean> => {
  if (!devMagicLinkEnabled) {
    return false;
  }

  const maxAttempts = 6;
  const delayMs = 500;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(
        `${convexSiteUrl}/dev/magic-link?email=${encodeURIComponent(email)}`,
      );
    } catch {
      return false;
    }

    if (response.status === 204) {
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      return false;
    }

    if (response.ok) {
      const payload = (await response.json()) as { url?: string };
      if (payload.url) {
        window.location.assign(payload.url);
        return true;
      }
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return false;
};
