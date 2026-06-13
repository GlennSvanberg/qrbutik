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
import type * as demoSeed from "../demoSeed.js";
import type * as devInviteToken from "../devInviteToken.js";
import type * as devMagicLink from "../devMagicLink.js";
import type * as email from "../email.js";
import type * as exportActions from "../exportActions.js";
import type * as exportExcelActions from "../exportExcelActions.js";
import type * as exports from "../exports.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_billing from "../lib/billing.js";
import type * as lib_buildExcelExport from "../lib/buildExcelExport.js";
import type * as lib_customFunctions from "../lib/customFunctions.js";
import type * as lib_exportFormat from "../lib/exportFormat.js";
import type * as lib_platformAdmin from "../lib/platformAdmin.js";
import type * as lib_platformEvents from "../lib/platformEvents.js";
import type * as lib_platformReports from "../lib/platformReports.js";
import type * as lib_stripeAuth from "../lib/stripeAuth.js";
import type * as lib_stripeHelpers from "../lib/stripeHelpers.js";
import type * as lib_testData from "../lib/testData.js";
import type * as lib_transactions from "../lib/transactions.js";
import type * as lib_validators from "../lib/validators.js";
import type * as members from "../members.js";
import type * as orgDashboard from "../orgDashboard.js";
import type * as organizations from "../organizations.js";
import type * as platformEvents from "../platformEvents.js";
import type * as platformReports from "../platformReports.js";
import type * as products from "../products.js";
import type * as shops from "../shops.js";
import type * as stripeActions from "../stripeActions.js";
import type * as stripeMutations from "../stripeMutations.js";
import type * as stripeQueries from "../stripeQueries.js";
import type * as superadmin from "../superadmin.js";
import type * as testCleanup from "../testCleanup.js";
import type * as test_fixtures from "../test/fixtures.js";
import type * as test_matrices from "../test/matrices.js";
import type * as transactions from "../transactions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  demoSeed: typeof demoSeed;
  devInviteToken: typeof devInviteToken;
  devMagicLink: typeof devMagicLink;
  email: typeof email;
  exportActions: typeof exportActions;
  exportExcelActions: typeof exportExcelActions;
  exports: typeof exports;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/billing": typeof lib_billing;
  "lib/buildExcelExport": typeof lib_buildExcelExport;
  "lib/customFunctions": typeof lib_customFunctions;
  "lib/exportFormat": typeof lib_exportFormat;
  "lib/platformAdmin": typeof lib_platformAdmin;
  "lib/platformEvents": typeof lib_platformEvents;
  "lib/platformReports": typeof lib_platformReports;
  "lib/stripeAuth": typeof lib_stripeAuth;
  "lib/stripeHelpers": typeof lib_stripeHelpers;
  "lib/testData": typeof lib_testData;
  "lib/transactions": typeof lib_transactions;
  "lib/validators": typeof lib_validators;
  members: typeof members;
  orgDashboard: typeof orgDashboard;
  organizations: typeof organizations;
  platformEvents: typeof platformEvents;
  platformReports: typeof platformReports;
  products: typeof products;
  shops: typeof shops;
  stripeActions: typeof stripeActions;
  stripeMutations: typeof stripeMutations;
  stripeQueries: typeof stripeQueries;
  superadmin: typeof superadmin;
  testCleanup: typeof testCleanup;
  "test/fixtures": typeof test_fixtures;
  "test/matrices": typeof test_matrices;
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
