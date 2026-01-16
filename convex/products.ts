import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByShop = query({
  args: {
    shopId: v.id("shops"),
  },
  returns: v.array(
    v.object({
      _id: v.id("products"),
      _creationTime: v.number(),
      shopId: v.id("shops"),
      name: v.string(),
      price: v.number(),
      description: v.optional(v.string()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_shopId", (q) => q.eq("shopId", args.shopId))
      .order("asc")
      .collect();
  },
});

export const addProduct = mutation({
  args: {
    shopId: v.id("shops"),
    name: v.string(),
    price: v.number(),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      shopId: args.shopId,
      name: args.name,
      price: args.price,
      createdAt: Date.now(),
    });
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.string(),
    price: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("products", args.productId, {
      name: args.name,
      price: args.price,
    });
    return null;
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete("products", args.productId);
    return null;
  },
});
