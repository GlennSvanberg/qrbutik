import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";

const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return slug.length > 0 ? slug : null;
};

const ensureUniqueSlug = async (ctx: MutationCtx, baseSlug: string) => {
  const existing = await ctx.db
    .query("shops")
    .withIndex("by_slug", (q) => q.eq("slug", baseSlug))
    .unique();
  if (!existing) {
    return baseSlug;
  }

  for (let suffix = 2; suffix < Number.MAX_SAFE_INTEGER; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`;
    const taken = await ctx.db
      .query("shops")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique();
    if (!taken) {
      return candidate;
    }
  }
  return baseSlug;
};

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
    if (existing && args.slug) {
      throw new Error("Slug är redan upptagen.");
    }

    const finalSlug = existing ? await ensureUniqueSlug(ctx, baseSlug) : baseSlug;

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
      shopId,
    });

    return { shopId, slug: finalSlug };
  },
});

export const createShopWithProducts = mutation({
  args: {
    name: v.string(),
    ownerEmail: v.string(),
    swishNumber: v.string(),
    slug: v.optional(v.string()),
    products: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
      }),
    ),
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
    if (existing && args.slug) {
      throw new Error("Slug är redan upptagen.");
    }

    const finalSlug = existing ? await ensureUniqueSlug(ctx, baseSlug) : baseSlug;

    const shopId = await ctx.db.insert("shops", {
      name: args.name,
      slug: finalSlug,
      ownerEmail: args.ownerEmail,
      swishNumber: args.swishNumber,
      createdAt: Date.now(),
    });

    for (const product of args.products) {
      await ctx.db.insert("products", {
        shopId,
        name: product.name,
        price: product.price,
        createdAt: Date.now(),
      });
    }

    await ctx.scheduler.runAfter(0, api.email.sendStoreCreatedEmail, {
      to: args.ownerEmail,
      shopName: args.name,
      shopSlug: finalSlug,
      shopId,
    });

    return { shopId, slug: finalSlug };
  },
});

export const getShopById = query({
  args: {
    shopId: v.id("shops"),
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
    return await ctx.db.get("shops", args.shopId);
  },
});

export const updateShop = mutation({
  args: {
    shopId: v.id("shops"),
    name: v.string(),
    swishNumber: v.string(),
    ownerEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("shops", args.shopId, {
      name: args.name,
      swishNumber: args.swishNumber,
      ownerEmail: args.ownerEmail,
    });
    return null;
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

export const checkSlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.object({
    isAvailable: v.boolean(),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const slug = slugify(args.slug);
    if (!slug) {
      return { isAvailable: false, slug: "" };
    }

    const existing = await ctx.db
      .query("shops")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    return {
      isAvailable: !existing,
      slug,
    };
  },
});

export const listByOwnerEmail = query({
  args: {
    ownerEmail: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("shops"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      ownerEmail: v.string(),
      swishNumber: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shops")
      .withIndex("by_ownerEmail", (q) => q.eq("ownerEmail", args.ownerEmail))
      .order("desc")
      .collect();
  },
});
