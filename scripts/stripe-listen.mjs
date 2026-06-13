import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stripeShim = path.join(root, "node_modules/@stripe/cli/bin/shim.js");

const convexSiteUrl = execFileSync("npx", ["convex", "env", "get", "CONVEX_SITE_URL"], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
}).trim();

const webhookUrl = `${convexSiteUrl}/stripe/webhook`;
console.log(`Forwarding Stripe webhooks → ${webhookUrl}`);
console.log("Leave this running while testing checkout.\n");

const result = spawnSync(
  process.execPath,
  [stripeShim, "listen", "--forward-to", webhookUrl],
  { cwd: root, stdio: "inherit" },
);

process.exit(result.status ?? 1);
