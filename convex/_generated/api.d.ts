/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as devMagicLink from "../devMagicLink.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_customFunctions from "../lib/customFunctions.js";
import type * as lib_stripeAuth from "../lib/stripeAuth.js";
import type * as lib_validators from "../lib/validators.js";
import type * as organizations from "../organizations.js";
import type * as products from "../products.js";
import type * as shops from "../shops.js";
import type * as stripeActions from "../stripeActions.js";
import type * as stripeMutations from "../stripeMutations.js";
import type * as stripeQueries from "../stripeQueries.js";
import type * as transactions from "../transactions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  devMagicLink: typeof devMagicLink;
  email: typeof email;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/customFunctions": typeof lib_customFunctions;
  "lib/stripeAuth": typeof lib_stripeAuth;
  "lib/validators": typeof lib_validators;
  organizations: typeof organizations;
  products: typeof products;
  shops: typeof shops;
  stripeActions: typeof stripeActions;
  stripeMutations: typeof stripeMutations;
  stripeQueries: typeof stripeQueries;
  transactions: typeof transactions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
