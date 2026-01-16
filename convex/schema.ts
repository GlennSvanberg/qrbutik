import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  shops: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerEmail: v.string(),
    swishNumber: v.string(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),
  products: defineTable({
    shopId: v.id("shops"),
    name: v.string(),
    price: v.number(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_shopId", ["shopId"]),
  transactions: defineTable({
    shopId: v.id("shops"),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("verified")),
    customerPhoneLast4: v.string(),
    reference: v.string(),
    createdAt: v.number(),
  }).index("by_shopId", ["shopId"]),
});
