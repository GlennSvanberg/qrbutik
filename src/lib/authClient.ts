import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { magicLinkClient } from "better-auth/client/plugins";

const convexSiteUrl =
  (import.meta as any).env.VITE_CONVEX_SITE_URL ??
  (import.meta as any).env.VITE_CONVEX_URL ??
  "http://localhost:5173/.convex";

export const authClient = createAuthClient({
  baseURL: convexSiteUrl,
  plugins: [convexClient(), magicLinkClient()],
});
