"use node";

import { Resend } from "resend";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import {
  aggregatedPlatformReportValidator,
  formatPlatformReportHtml,
} from "./lib/platformEvents";
import { getPlatformAdminEmails } from "./lib/platformAdmin";
import { canSendPlatformReportEmail } from "./lib/platformReports";

const resend = new Resend(process.env.RESEND_API_KEY);
const defaultFrom = process.env.RESEND_FROM ?? "QRButik <no-reply@qrbutik.se>";
const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";

function billingUrl(organizationId: string): string {
  return `${siteUrl}/admin/billing?organizationId=${organizationId}`;
}

async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email to", args.to);
    return;
  }

  await resend.emails.send({
    from: defaultFrom,
    to: args.to,
    subject: args.subject,
    html: args.html,
  });
}

export const sendOrganizationWelcomeEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    organizationId: v.id("organizations"),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await sendEmail({
      to: args.to,
      subject: `Välkommen till QRButik — ${args.organizationName}`,
      html: `<p>Hej!</p><p>Föreningen <strong>${args.organizationName}</strong> är skapad på QRButik med <strong>Gratis</strong>.</p><p>Gratis inkluderar 1 kiosk, obegränsat antal produkter, Swish-QR och enkel statistik. En liten QRButik-märkning visas i kiosken. Inget kort behövs.</p><p><strong>Event/cup</strong> kostar 295 kr och låser upp flera kiosker, tar bort märkningen och ger försäljningsrapport och export i 7 dagar.</p><p><strong>Säsong</strong> kostar 1 495 kr per år (cirka 125 kr/mån) och ger obegränsat antal kiosker, flera administratörer och bokföringsexport så länge prenumerationen är aktiv.</p><p>Alla priser är inklusive 25 % moms.</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
    });
    return null;
  },
});

export const sendEventActivatedEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    organizationId: v.id("organizations"),
    eventExpiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const eventEnd = new Date(args.eventExpiresAt).toLocaleDateString("sv-SE");
    await sendEmail({
      to: args.to,
      subject: `Event/cup aktiverat — ${args.organizationName}`,
      html: `<p>Hej!</p><p>Event/cup för <strong>${args.organizationName}</strong> är betald (295 kr inklusive moms).</p><p>Flera kiosker, försäljningsrapport och export gäller till <strong>${eventEnd}</strong>. Därefter går föreningen tillbaka till Gratis.</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
    });
    return null;
  },
});

export const sendEventExpiredEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    organizationId: v.id("organizations"),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await sendEmail({
      to: args.to,
      subject: `Event/cup har löpt ut — ${args.organizationName}`,
      html: `<p>Hej!</p><p>Event/cup för <strong>${args.organizationName}</strong> har löpt ut. Föreningen är tillbaka på Gratis: 1 kiosk, enkel statistik och QRButik-märkning i kiosken.</p><p>Ni kan köpa Event igen (295 kr) eller starta Säsong (1 495 kr/år):</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
    });
    return null;
  },
});

export const sendSubscriptionActivatedEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    organizationId: v.id("organizations"),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await sendEmail({
      to: args.to,
      subject: `Säsong aktiverad — ${args.organizationName}`,
      html: `<p>Hej!</p><p>Säsong för <strong>${args.organizationName}</strong> är aktiv (1 495 kr per år, cirka 125 kr/mån, inklusive moms).</p><p>Obegränsat antal kiosker, flera administratörer och bokföringsexport gäller så länge prenumerationen är aktiv.</p><p>Hantera kort, fakturor och uppsägning i kundportalen:</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
    });
    return null;
  },
});

export const sendPaymentFailedEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    organizationId: v.id("organizations"),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await sendEmail({
      to: args.to,
      subject: `Betalning misslyckades — ${args.organizationName}`,
      html: `<p>Hej!</p><p>Vi kunde inte debitera Säsong för <strong>${args.organizationName}</strong>. Föreningen faller tillbaka till Gratis (1 kiosk) tills betalningen är reglerad.</p><p>Uppdatera betalningsuppgifter i kundportalen:</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
    });
    return null;
  },
});

export const sendMemberInvitationEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    invitedByEmail: v.string(),
    role: v.union(v.literal("treasurer"), v.literal("editor")),
    token: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const roleLabel = args.role === "treasurer" ? "kassör" : "lagledare";
    const loginUrl = `${siteUrl}/logga-in?invite=${encodeURIComponent(args.token)}&redirect=${encodeURIComponent("/admin/medlemmar")}`;
    await sendEmail({
      to: args.to,
      subject: `Inbjudan till ${args.organizationName} på QRButik`,
      html: `<p>Hej!</p><p>${args.invitedByEmail} har bjudit in dig som <strong>${roleLabel}</strong> i föreningen <strong>${args.organizationName}</strong> på QRButik.</p><p>Logga in med den här e-postadressen för att acceptera inbjudan:</p><p><a href="${loginUrl}">${loginUrl}</a></p><p>Länken gäller i 7 dagar.</p>`,
    });
    return null;
  },
});

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
    await sendEmail({
      to: args.to,
      subject: `Din butik ${args.shopName} är skapad`,
      html: `<p>Hej!</p><p>Din butik <strong>${args.shopName}</strong> är nu redo.</p><p>Öppna butiken här:</p><p><a href="${shopUrl}">${shopUrl}</a></p><p>Adminpanelen hittar du här:</p><p><a href="${adminUrl}">${adminUrl}</a></p><p>Direktlänk till butikens admin:</p><p><a href="${shopAdminUrl}">${shopAdminUrl}</a></p>`,
    });
    return null;
  },
});

export const sendPlatformActivityReport = internalAction({
  args: {
    report: aggregatedPlatformReportValidator,
    windowStart: v.number(),
    windowEnd: v.number(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    if (!canSendPlatformReportEmail()) {
      return null;
    }

    const recipients = getPlatformAdminEmails();
    const html = formatPlatformReportHtml(
      args.report,
      args.windowStart,
      args.windowEnd,
    );
    const subject = `QRButik aktivitet — ${args.report.totalEvents} händelse${args.report.totalEvents === 1 ? "" : "r"} senaste timmen`;

    for (const to of recipients) {
      await sendEmail({ to, subject, html });
    }

    return null;
  },
});
