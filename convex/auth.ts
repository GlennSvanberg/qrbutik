import { createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import authConfig from "./auth.config";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import type { GenericCtx } from "@convex-dev/better-auth";

const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";
const convexSiteUrl =
  process.env.CONVEX_SITE_URL ?? process.env.CONVEX_HTTP_URL ?? siteUrl;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom =
    process.env.RESEND_FROM ?? "QRButik <no-reply@qrbutik.se>";
  return betterAuth({
    baseURL: convexSiteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    plugins: [
      crossDomain({ siteUrl }),
      convex({ authConfig }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
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
