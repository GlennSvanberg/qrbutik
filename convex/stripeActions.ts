"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireOrgMemberForAction } from "./lib/stripeAuth";

const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }
  return new Stripe(secretKey);
}

function getPriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error("Stripe price is not configured.");
  }
  return priceId;
}

export const processWebhook = internalAction({
  args: {
    rawBody: v.string(),
    signature: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Stripe webhook secret is not configured.");
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      args.rawBody,
      args.signature,
      webhookSecret,
    );

    const shouldProcess = await ctx.runMutation(
      internal.stripeMutations.recordStripeEvent,
      {
        eventId: event.id,
        processedAt: Date.now(),
      },
    );

    if (!shouldProcess) {
      return null;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const organizationId = session.metadata?.organizationId;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!organizationId || !customerId || !subscriptionId) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await ctx.runMutation(internal.stripeMutations.handleCheckoutCompleted, {
          organizationId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: subscription.status,
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        await ctx.runMutation(
          internal.stripeMutations.handleSubscriptionUpdated,
          {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
          },
        );
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          await ctx.runMutation(internal.stripeMutations.handlePaymentFailed, {
            stripeCustomerId: customerId,
          });
        }
        break;
      }
      default:
        break;
    }

    return null;
  },
});

export const createCheckoutSession = action({
  args: {
    organizationId: v.id("organizations"),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireOrgMemberForAction(ctx, args.organizationId, [
      "owner",
      "treasurer",
    ]);

    const organization = await ctx.runQuery(internal.stripeQueries.getOrganizationForStripe, {
      organizationId: args.organizationId,
    });

    if (!organization) {
      throw new Error("Föreningen hittades inte.");
    }

    const stripe = getStripe();
    const priceId = getPriceId();

    let customerId = organization.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: organization.billingEmail,
        name: organization.name,
        metadata: {
          organizationId: args.organizationId,
        },
      });
      customerId = customer.id;

      await ctx.runMutation(internal.organizations.setSubscriptionStatus, {
        organizationId: args.organizationId,
        subscriptionStatus: organization.subscriptionStatus,
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/admin/billing?organizationId=${args.organizationId}&success=1`,
      cancel_url: `${siteUrl}/admin/billing?organizationId=${args.organizationId}&canceled=1`,
      metadata: {
        organizationId: args.organizationId,
      },
      subscription_data: {
        metadata: {
          organizationId: args.organizationId,
        },
      },
    });

    if (!session.url) {
      throw new Error("Kunde inte skapa checkout-session.");
    }

    return { url: session.url };
  },
});

export const createCustomerPortalSession = action({
  args: {
    organizationId: v.id("organizations"),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireOrgMemberForAction(ctx, args.organizationId, [
      "owner",
      "treasurer",
    ]);

    const organization = await ctx.runQuery(internal.stripeQueries.getOrganizationForStripe, {
      organizationId: args.organizationId,
    });

    if (!organization?.stripeCustomerId) {
      throw new Error("Ingen Stripe-kund kopplad till föreningen.");
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${siteUrl}/admin/billing?organizationId=${args.organizationId}`,
    });

    return { url: session.url };
  },
});
