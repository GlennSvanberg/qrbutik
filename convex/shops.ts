import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const createShop = mutation({
  args: {
    name: v.string(),
    ownerEmail: v.string(),
    swishNumber: v.string(),
    slug: v.optional(v.string()),
  },
  returns: v.object({
    shopId: v.id("shops"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const baseSlug = slugify(args.slug ?? args.name);
    if (!baseSlug) {
      throw new Error("Ogiltigt butiksnamn eller slug.");
    }

    const existing = await ctx.db
      .query("shops")
      .withIndex("by_slug", (q) => q.eq("slug", baseSlug))
      .unique();
    if (existing) {
      if (args.slug) {
        throw new Error("Slug är redan upptagen.");
      }
    }

    let finalSlug = baseSlug;
    if (existing) {
      let suffix = 2;
      while (true) {
        const candidate = `${baseSlug}-${suffix}`;
        const taken = await ctx.db
          .query("shops")
          .withIndex("by_slug", (q) => q.eq("slug", candidate))
          .unique();
        if (!taken) {
          finalSlug = candidate;
          break;
        }
        suffix += 1;
      }
    }

    const shopId = await ctx.db.insert("shops", {
      name: args.name,
      slug: finalSlug,
      ownerEmail: args.ownerEmail,
      swishNumber: args.swishNumber,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, api.email.sendStoreCreatedEmail, {
      to: args.ownerEmail,
      shopName: args.name,
      shopSlug: finalSlug,
    });

    return { shopId, slug: finalSlug };
  },
});

export const getShopBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("shops"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      ownerEmail: v.string(),
      swishNumber: v.string(),
      createdAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const shop = await ctx.db
      .query("shops")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!shop) {
      return null;
    }
    return shop;
  },
});
