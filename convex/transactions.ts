import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    shopId: v.id("shops"),
    amount: v.number(),
    reference: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const transactionId = await ctx.db.insert("transactions", {
      shopId: args.shopId,
      amount: args.amount,
      reference: args.reference,
      items: args.items,
      status: "pending",
      createdAt: Date.now(),
    });
    return transactionId;
  },
});

export const get = query({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get("transactions", args.transactionId);
    if (!transaction) return null;

    const shop = await ctx.db.get("shops", transaction.shopId);
    return {
      ...transaction,
      shopName: shop?.name ?? "Okänd butik",
    };
  },
});

export const listByShop = query({
  args: { shopId: v.id("shops") },
  returns: v.array(
    v.object({
      _id: v.id("transactions"),
      _creationTime: v.number(),
      shopId: v.id("shops"),
      amount: v.number(),
      status: v.union(v.literal("pending"), v.literal("verified")),
      reference: v.string(),
      items: v.array(
        v.object({
          name: v.string(),
          price: v.number(),
          quantity: v.number(),
        }),
      ),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_shopId", (q) => q.eq("shopId", args.shopId))
      .order("desc")
      .collect();
  },
});

export const verify = mutation({
  args: { transactionId: v.id("transactions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get("transactions", args.transactionId);
    if (!transaction) {
      throw new Error("Transaktionen hittades inte.");
    }
    if (transaction.status !== "verified") {
      await ctx.db.patch("transactions", args.transactionId, {
        status: "verified",
      });
    }
    return null;
  },
});
