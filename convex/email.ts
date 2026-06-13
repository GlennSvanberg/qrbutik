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

export const sendTrialWelcomeEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    organizationId: v.id("organizations"),
    trialEndsAt: v.number(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const trialEnd = new Date(args.trialEndsAt).toLocaleDateString("sv-SE");
    await sendEmail({
      to: args.to,
      subject: `Välkommen till QRButik — ${args.organizationName}`,
      html: `<p>Hej!</p><p>Föreningen <strong>${args.organizationName}</strong> är skapad på QRButik.</p><p>Provperioden gäller till <strong>${trialEnd}</strong>. Under tiden kan ni skapa kiosker och testa försäljning.</p><p>När provperioden närmar sig slut kan ni aktivera klubblicensen (995 kr/mån) med betalkort eller faktura:</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
    });
    return null;
  },
});

export const sendTrialReminderEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    organizationId: v.id("organizations"),
    trialEndsAt: v.number(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const trialEnd = new Date(args.trialEndsAt).toLocaleDateString("sv-SE");
    await sendEmail({
      to: args.to,
      subject: `Provperioden för ${args.organizationName} slutar snart`,
      html: `<p>Hej!</p><p>Provperioden för <strong>${args.organizationName}</strong> gäller till <strong>${trialEnd}</strong>.</p><p>Aktivera klubblicensen innan dess så att kiosker fortsätter ta emot köp efter provperioden:</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p><p>995 kr/mån — betalkort eller faktura via Stripe.</p>`,
    });
    return null;
  },
});

export const sendTrialExpiredEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    organizationId: v.id("organizations"),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await sendEmail({
      to: args.to,
      subject: `Provperioden för ${args.organizationName} har löpt ut`,
      html: `<p>Hej!</p><p>Provperioden för <strong>${args.organizationName}</strong> är avslutad och kiosker tar inte längre emot nya köp.</p><p>Aktivera klubblicensen för att fortsätta:</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
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
      subject: `Klubblicens aktiverad — ${args.organizationName}`,
      html: `<p>Hej!</p><p>Betalningen för <strong>${args.organizationName}</strong> är registrerad. Klubblicensen är aktiv och kiosker kan ta emot köp.</p><p>Hantera prenumeration, fakturor och betalningsuppgifter här:</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
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
      html: `<p>Hej!</p><p>Vi kunde inte debitera klubblicensen för <strong>${args.organizationName}</strong>. Kiosker kan pausas tills betalningen är reglerad.</p><p>Uppdatera betalningsuppgifter eller betala faktura via kundportalen:</p><p><a href="${billingUrl(args.organizationId)}">${billingUrl(args.organizationId)}</a></p>`,
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
