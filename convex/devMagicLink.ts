import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const isDevMagicLinkEnabled = (): boolean =>
  process.env.DEV_MAGIC_LINK === "true";

export const storeDevMagicLink = internalMutation({
  args: { email: v.string(), url: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("devMagicLinks")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      await ctx.db.patch("devMagicLinks", existing._id, {
        url: args.url,
        updatedAt: Date.now(),
      });
      return null;
    }

    await ctx.db.insert("devMagicLinks", {
      email: args.email,
      url: args.url,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getDevMagicLink = query({
  args: { email: v.string() },
  returns: v.union(v.null(), v.object({ url: v.string() })),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("devMagicLinks")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!existing) {
      return null;
    }

    return { url: existing.url };
  },
});
