# Agent Instructions

## Product direction (read first)

QRButik pivots from **pay-per-activation (10/99 kr Swish)** to **B2B club licenses (995 kr/month)** for Swedish sports clubs. Target buyer: association board/treasurer — not private flea-market users.

- **Roadmap (checkbox plan):** [`ROADMAP.md`](./ROADMAP.md)
- **Vision:** [`plan.md`](./plan.md)
- **SEO strategy:** [`SEO_INSTRUCTIONS.md`](./SEO_INSTRUCTIONS.md)
- **Design:** [`DESIGN_SPEC.md`](./DESIGN_SPEC.md)

**MRR goal:** 10 000 kr/month via 7–10 paying clubs. Platform billing: **Stripe** (trial, card, invoice) — not manual Swish to a private number. Customer kiosk payments stay **Swish deep links** to the club's own number.

When implementing features, prefer: organizations, roles, central treasurer dashboard, CSV/SIE export, server-side auth in Convex.

**Greenfield:** No active shops or paying users in production. **No backward compatibility** — delete old schema/UI (pass model, `shopActivations`, `ownerEmail`, platform Swish) instead of migrating. Wipe Convex dev data if needed.

## Terminal Usage
- **OS:** Windows (PowerShell)
- **Command Chaining:** Use `;;` instead of `&&` for sequential commands.
  - Example: `npm install ;; npm run dev`

## Tech Stack Basics
- **Framework:** TanStack Start (SSR, Typsäkerhet)
- **Database:** Convex (Real-time sync)
- **Auth:** Better Auth
- **Billing:** Stripe Billing — subscriptions, webhooks, Customer Portal (env-gated until keys are set)

## Stripe env (Convex dashboard + `.env.local`)

| Variable | Where | Purpose |
|----------|-------|---------|
| `STRIPE_SECRET_KEY` | Convex | API calls, webhook verification |
| `STRIPE_WEBHOOK_SECRET` | Convex | Webhook signature |
| `STRIPE_PRICE_ID` | Convex | 995 kr/mån subscription price |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Vite (optional) | Future client-side Stripe.js |
| `PLATFORM_ADMIN_EMAILS` | Convex | Comma-separated emails allowed on `/superadmin` (platform control tower) |
| `PLATFORM_REPORTS_ENABLED` | Convex **prod only** | Set `true` to send hourly activity digest emails to `PLATFORM_ADMIN_EMAILS` |

## Google OAuth (Convex dashboard)

| Variable | Where | Purpose |
|----------|-------|---------|
| `GOOGLE_CLIENT_ID` | Convex | OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Convex | OAuth client secret |

**Redirect URI** (Google Cloud Console → Authorized redirect URIs): `{CONVEX_SITE_URL}/api/auth/callback/google` — use your dev and prod `.convex.site` URLs (from `VITE_CONVEX_SITE_URL` or Convex dashboard). **Not** the Vite app URL.

Optional **Authorized JavaScript origins**: `http://localhost:3000`, `http://127.0.0.1:3000`, `https://qrbutik.se`, `https://www.qrbutik.se`.

Magic link works without Google keys; the Google button on `/logga-in` shows an error until credentials are set.

```powershell
npx convex env set GOOGLE_CLIENT_ID "your-client-id"
npx convex env set GOOGLE_CLIENT_SECRET "your-client-secret"
```

When `DEV_MAGIC_LINK=true`, any authenticated user can access `/superadmin` without being on the allowlist (local dev only). Hourly activity emails are **not** sent unless `PLATFORM_REPORTS_ENABLED=true` on the deployment (leave unset in dev).

Webhook URL: `{CONVEX_SITE_URL}/stripe/webhook`

Until keys exist, org onboarding uses **14-day trial without card**; billing UI at `/admin/billing` stays disabled.

**Stripe CLI bootstrap:** `npm run stripe:sandbox` → `npm run stripe:setup` → `npm run stripe:listen` (keep listen running during webhook tests). Claim sandbox for Customer Portal / dashboard webhooks: `npm run stripe:claim`.
- **Styling:** Tailwind CSS (v4)
- **Docs:** Use `context7` to fetch the latest documentation for any library.

## Dev Env
- `DEV_MAGIC_LINK=true` skips email and stores links for local dev.
- `VITE_DEV_MAGIC_LINK=true` auto-opens dev magic links in the browser.
- Stripe: use Test Mode keys until ROADMAP Fas 2 is complete.

## Workflow
- Keep `AGENTS.md` small and concise.
- All buttons must have a pointer cursor on hover.
- Follow the B2B Tech design spec in `DESIGN_SPEC.md`.
- Before finishing, run **`npm run test`**, **`npx tsc --noEmit`**, and **`npx eslint .`**. Add **`npm run test:e2e`** when changing auth, onboarding, or billing flows.
- Full testing guide: [`TESTING.md`](./TESTING.md)
- Check `ROADMAP.md` before large features — align with current phase.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
