"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireOrgMemberForAction } from "./lib/stripeAuth";
import { assertCanBuyEvent, assertCanStartSeason } from "./lib/plans";
import {
  buildEventCheckoutParams,
  buildSeasonCheckoutParams,
  normalizeStripeWebhookSubscriptionStatus,
  optionalStripeTaxRateId,
} from "./lib/stripeHelpers";
import { getSiteUrl } from "./lib/siteUrl";
import type { SubscriptionStatus } from "./lib/validators";
import type { CommercialPlan } from "./lib/plans";

import type { Id } from "./_generated/dataModel";

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }
  return new Stripe(secretKey);
}

function getEventPriceId(): string {
  const priceId = process.env.STRIPE_EVENT_PRICE_ID;
  if (!priceId) {
    throw new Error("Stripe event price is not configured.");
  }
  return priceId;
}

function getSeasonPriceId(): string {
  const priceId = process.env.STRIPE_SEASON_PRICE_ID;
  if (!priceId) {
    throw new Error("Stripe season price is not configured.");
  }
  return priceId;
}

function getTaxRateId(): string | undefined {
  return optionalStripeTaxRateId(process.env.STRIPE_TAX_RATE_ID);
}

type StripeOrganization = {
  _id: Id<"organizations">;
  name: string;
  billingEmail: string;
  orgNumber?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: SubscriptionStatus;
  plan?: CommercialPlan;
  eventExpiresAt?: number;
};

async function ensureStripeCustomer(
  stripe: Stripe,
  organization: StripeOrganization,
  organizationId: Id<"organizations">,
  onCreateCustomer: (customerId: string) => Promise<void>,
): Promise<string> {
  if (organization.stripeCustomerId) {
    const updateParams: Stripe.CustomerUpdateParams = {
      email: organization.billingEmail,
      name: organization.name,
      metadata: {
        organizationId,
        ...(organization.orgNumber
          ? { orgNumber: organization.orgNumber }
          : {}),
      },
    };

    await stripe.customers.update(
      organization.stripeCustomerId,
      updateParams,
    );

    return organization.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: organization.billingEmail,
    name: organization.name,
    metadata: {
      organizationId,
      ...(organization.orgNumber ? { orgNumber: organization.orgNumber } : {}),
    },
  });

  await onCreateCustomer(customer.id);

  return customer.id;
}

function customerIdFrom(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | undefined {
  if (!customer) {
    return undefined;
  }
  return typeof customer === "string" ? customer : customer.id;
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
        const customerId = customerIdFrom(session.customer);
        if (!organizationId || !customerId) {
          break;
        }

        if (session.mode === "payment") {
          if (
            session.payment_status !== "paid" &&
            session.payment_status !== "no_payment_required"
          ) {
            break;
          }
          if (session.metadata?.plan !== "event") {
            break;
          }

          await ctx.runMutation(
            internal.stripeMutations.handleEventCheckoutCompleted,
            {
              organizationId,
              stripeCustomerId: customerId,
              checkoutSessionId: session.id,
              purchasedAt: session.created * 1000,
            },
          );
          break;
        }

        if (session.mode !== "subscription") {
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!subscriptionId) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await ctx.runMutation(internal.stripeMutations.handleCheckoutCompleted, {
          organizationId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: normalizeStripeWebhookSubscriptionStatus(
            subscription.status,
          ),
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = customerIdFrom(subscription.customer);
        if (!customerId) {
          break;
        }

        await ctx.runMutation(
          internal.stripeMutations.handleSubscriptionUpdated,
          {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: normalizeStripeWebhookSubscriptionStatus(
              subscription.status,
            ),
            ...(subscription.metadata.plan === "season"
              ? { plan: "season" as const }
              : {}),
          },
        );
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = customerIdFrom(invoice.customer);
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

const checkoutPlanValidator = v.union(v.literal("event"), v.literal("season"));

export const createCheckoutSession = action({
  args: {
    organizationId: v.id("organizations"),
    plan: checkoutPlanValidator,
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireOrgMemberForAction(ctx, args.organizationId, [
      "owner",
      "treasurer",
    ]);

    const organization = await ctx.runQuery(
      internal.stripeQueries.getOrganizationForStripe,
      {
        organizationId: args.organizationId,
      },
    );

    if (!organization) {
      throw new Error("Föreningen hittades inte.");
    }

    if (args.plan === "event") {
      assertCanBuyEvent(organization, Date.now());
    } else {
      assertCanStartSeason(organization);
    }

    const stripe = getStripe();
    const taxRateId = getTaxRateId();
    const customerId = await ensureStripeCustomer(
      stripe,
      organization,
      args.organizationId,
      async (newCustomerId) => {
        await ctx.runMutation(internal.organizations.setSubscriptionStatus, {
          organizationId: args.organizationId,
          subscriptionStatus: organization.subscriptionStatus,
          stripeCustomerId: newCustomerId,
        });
      },
    );

    const checkoutParams =
      args.plan === "event"
        ? buildEventCheckoutParams({
            organizationId: args.organizationId,
            priceId: getEventPriceId(),
            taxRateId,
          })
        : buildSeasonCheckoutParams({
          organizationId: args.organizationId,
          priceId: getSeasonPriceId(),
          taxRateId,
        });

    const session = await stripe.checkout.sessions.create({
      ...checkoutParams,
      customer: customerId,
      success_url: `${getSiteUrl()}/admin/billing?organizationId=${args.organizationId}&success=1&plan=${args.plan}`,
      cancel_url: `${getSiteUrl()}/admin/billing?organizationId=${args.organizationId}&canceled=1`,
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

    const organization = await ctx.runQuery(
      internal.stripeQueries.getOrganizationForStripe,
      {
        organizationId: args.organizationId,
      },
    );

    if (!organization?.stripeCustomerId) {
      throw new Error("Ingen Stripe-kund kopplad till föreningen.");
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${getSiteUrl()}/admin/billing?organizationId=${args.organizationId}`,
    });

    return { url: session.url };
  },
});
