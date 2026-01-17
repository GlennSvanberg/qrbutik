import { createAuthClient } from "better-auth/react";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import { magicLinkClient } from "better-auth/client/plugins";

const convexSiteUrl =
  (import.meta as any).env.VITE_CONVEX_SITE_URL ??
  (import.meta as any).env.VITE_CONVEX_URL;

if (!convexSiteUrl) {
  throw new Error("VITE_CONVEX_SITE_URL or VITE_CONVEX_URL must be set.");
}

export const authClient = createAuthClient({
  baseURL: convexSiteUrl,
  plugins: [convexClient(), crossDomainClient(), magicLinkClient()],
});
