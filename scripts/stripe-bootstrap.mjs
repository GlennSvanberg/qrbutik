/**
 * Idempotent Stripe Test Mode bootstrap for QRButik.
 * Uses the Stripe CLI profile (run `npm run stripe:sandbox` first if not logged in).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stripeShim = path.join(root, "node_modules/@stripe/cli/bin/shim.js");

const PRODUCT_NAME = "QRButik";
const EVENT_AMOUNT = 29500;
const SEASON_AMOUNT = 149500;
const PRICE_CURRENCY = "sek";

function stripe(args, { json = true } = {}) {
  const result = spawnSync(process.execPath, [stripeShim, ...args], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Stripe CLI failed");
  }
  const out = result.stdout.trim();
  if (!json) return out;
  const start = out.indexOf("{");
  const end = out.lastIndexOf("}");
  if (start === -1 || end === -1) return out;
  return JSON.parse(out.slice(start, end + 1));
}

function convexEnvSet(name, value) {
  execFileSync("npx", ["convex", "env", "set", name, value], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

function convexEnvGet(name) {
  return execFileSync("npx", ["convex", "env", "get", name], {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
  }).trim();
}

function ensurePrice(productId, prices, { amount, interval, label }) {
  const existing = prices.data?.find(
    (price) =>
      price.currency === PRICE_CURRENCY &&
      price.unit_amount === amount &&
      price.tax_behavior === "inclusive" &&
      (interval
        ? price.recurring?.interval === interval
        : !price.recurring),
  );
  if (existing) {
    console.log(`Using existing price ${existing.id} (${label})`);
    return existing.id;
  }

  const args = [
    "prices",
    "create",
    "--product",
    productId,
    "--currency",
    PRICE_CURRENCY,
    "--unit-amount",
    String(amount),
    "-d",
    "tax_behavior=inclusive",
  ];
  if (interval) {
    args.push("-d", `recurring[interval]=${interval}`);
  }
  const created = stripe(args);
  console.log(`Created price ${created.id} (${label})`);
  return created.id;
}

function ensureProductAndPrices() {
  const products = stripe(["products", "list", "--limit", "100"]);
  let product = products.data?.find((item) => item.name === PRODUCT_NAME);

  if (!product) {
    product = stripe([
      "products",
      "create",
      "--name",
      PRODUCT_NAME,
      "--description",
      "Event 295 kr och Säsong 1 495 kr/år för idrottsföreningar. Priser inklusive moms.",
    ]);
    console.log(`Created product ${product.id}`);
  } else {
    console.log(`Using existing product ${product.id}`);
  }

  const prices = stripe(["prices", "list", "--product", product.id, "--limit", "100"]);
  const eventPriceId = ensurePrice(product.id, prices, {
    amount: EVENT_AMOUNT,
    label: "Event 295 kr",
  });
  const seasonPriceId = ensurePrice(product.id, prices, {
    amount: SEASON_AMOUNT,
    interval: "year",
    label: "Säsong 1 495 kr/år",
  });

  return { eventPriceId, seasonPriceId };
}

function readCliKeys() {
  const config = stripe(["config", "--list"], { json: false });
  const secretMatch = config.match(/test_mode_api_key = '([^']+)'/);
  const publishableMatch = config.match(/test_mode_pub_key = '([^']+)'/);
  const claimMatch = config.match(/sandbox_claim_url = '([^']+)'/);
  const expiresMatch = config.match(/sandbox_expires_at = '([^']+)'/);

  if (!secretMatch || !publishableMatch) {
    throw new Error(
      "No Stripe test keys in CLI profile. Run: npm run stripe:sandbox",
    );
  }

  return {
    secretKey: secretMatch[1],
    publishableKey: publishableMatch[1],
    claimUrl: claimMatch?.[1],
    sandboxExpiresAt: expiresMatch?.[1],
  };
}

function readListenSecret(convexSiteUrl) {
  const out = stripe(
    [
      "listen",
      "--forward-to",
      `${convexSiteUrl}/stripe/webhook`,
      "--print-secret",
    ],
    { json: false },
  );
  const secret = out.trim().split("\n").pop()?.trim();
  if (!secret?.startsWith("whsec_")) {
    throw new Error("Could not read webhook signing secret from stripe listen");
  }
  return secret;
}

async function main() {
  console.log("QRButik Stripe bootstrap (Test Mode)\n");

  const keys = readCliKeys();
  const { eventPriceId, seasonPriceId } = ensureProductAndPrices();
  const convexSiteUrl = convexEnvGet("CONVEX_SITE_URL");

  console.log("\nSetting Convex dev environment variables...");
  convexEnvSet("STRIPE_SECRET_KEY", keys.secretKey);
  convexEnvSet("STRIPE_EVENT_PRICE_ID", eventPriceId);
  convexEnvSet("STRIPE_SEASON_PRICE_ID", seasonPriceId);
  convexEnvSet("VITE_STRIPE_PUBLISHABLE_KEY", keys.publishableKey);

  const webhookSecret = readListenSecret(convexSiteUrl);
  convexEnvSet("STRIPE_WEBHOOK_SECRET", webhookSecret);

  console.log("\nDone. Stripe is configured on Convex dev.");
  console.log(`  Event price:  ${eventPriceId}`);
  console.log(`  Season price: ${seasonPriceId}`);
  console.log(`  Webhook URL:  ${convexSiteUrl}/stripe/webhook`);
  console.log("\nNext steps:");
  console.log("  1. Keep webhooks flowing: npm run stripe:listen");
  console.log("  2. Start app: npm run dev");
  console.log("  3. Test checkout at /admin/billing (card: 4242 4242 4242 4242)");

  if (keys.claimUrl) {
    console.log(
      `\nNote: This is a claimable sandbox (expires ${keys.sandboxExpiresAt ?? "soon"}).`,
    );
    console.log("Claim for full API access (webhooks, Customer Portal):");
    console.log(`  ${keys.claimUrl}`);
    console.log("  Or: npm run stripe:claim");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
