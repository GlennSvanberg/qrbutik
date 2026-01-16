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
