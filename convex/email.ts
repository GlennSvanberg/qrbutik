"use node";

import { Resend } from "resend";
import { v } from "convex/values";
import { action } from "./_generated/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const defaultFrom = process.env.RESEND_FROM ?? "QRButik <no-reply@qrbutik.se>";
const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";

export const sendStoreCreatedEmail = action({
  args: {
    to: v.string(),
    shopName: v.string(),
    shopSlug: v.string(),
    shopId: v.id("shops"),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const shopUrl = `${siteUrl}/s/${args.shopSlug}`;
    const adminUrl = `${siteUrl}/admin`;
    const shopAdminUrl = `${adminUrl}/${args.shopId}`;
    await resend.emails.send({
      from: defaultFrom,
      to: args.to,
      subject: `Din butik ${args.shopName} är skapad`,
      html: `<p>Hej!</p><p>Din butik <strong>${args.shopName}</strong> är nu redo.</p><p>Öppna butiken här:</p><p><a href="${shopUrl}">${shopUrl}</a></p><p>Adminpanelen hittar du här:</p><p><a href="${adminUrl}">${adminUrl}</a></p><p>Direktlänk till butikens admin:</p><p><a href="${shopAdminUrl}">${shopAdminUrl}</a></p>`,
    });
    return null;
  },
});
