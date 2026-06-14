import { createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import authConfig from "./auth.config";
import { components } from "./_generated/api";
import { isDevMagicLinkEnabled } from "./devMagicLink";
import type { DataModel } from "./_generated/dataModel";
import type { GenericCtx } from "@convex-dev/better-auth";

const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";
const trustedOrigins = [
  siteUrl,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://qrbutik.vercel.app",
  "https://qrbutik.se",
  "https://www.qrbutik.se",
];

const getConvexSiteUrl = (): string => {
  const url =
    process.env.CONVEX_SITE_URL ??
    process.env.CONVEX_HTTP_URL ??
    process.env.VITE_CONVEX_SITE_URL;
  if (url) {
    return url;
  }
  const convexUrl = process.env.CONVEX_URL;
  if (convexUrl) {
    if (convexUrl.includes(".convex.cloud")) {
      return convexUrl.replace(".convex.cloud", ".convex.site");
    }
    if (convexUrl.includes("localhost:3210")) {
      return convexUrl.replace("localhost:3210", "localhost:3211");
    }
    if (convexUrl.includes("127.0.0.1:3210")) {
      return convexUrl.replace("127.0.0.1:3210", "127.0.0.1:3211");
    }
  }
  return "http://localhost:3211";
};

const convexSiteUrl = getConvexSiteUrl();

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom =
    process.env.RESEND_FROM ?? "QRButik <no-reply@qrbutik.se>";
  return betterAuth({
    baseURL: convexSiteUrl,
    trustedOrigins,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    },
    database: authComponent.adapter(ctx),
    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex({ authConfig }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          if (isDevMagicLinkEnabled()) {
            const storeUrl = new URL(`${convexSiteUrl}/dev/magic-link`);
            storeUrl.searchParams.set("email", email);
            storeUrl.searchParams.set("url", url);
            const response = await fetch(storeUrl.toString(), {
              method: "POST",
            });

            if (!response.ok) {
              throw new Error("Failed to store dev magic link.");
            }
            return;
          }
          if (!resendApiKey) {
            throw new Error("RESEND_API_KEY is not set");
          }

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: resendFrom,
              to: email,
              subject: "Logga in till QRButik",
              html: `<p>Hej!</p><p>Klicka på länken för att logga in:</p><p><a href="${url}">${url}</a></p>`,
            }),
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
              `Failed to send magic link: ${response.status} ${errorBody}`,
            );
          }
        },
      }),
    ],
  });
};
