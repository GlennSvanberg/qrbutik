# Testing — QRButik

QRButik uses two layers of automated tests:

| Layer | Tool | What it covers |
|-------|------|----------------|
| **Unit / logic** | [Vitest](https://vitest.dev) | Pure functions: validators, Stripe helpers, Swish links, billing UI helpers, RBAC nav |
| **Convex integration** | Vitest + [convex-test](https://docs.convex.dev/testing/convex-test) | Mutations/queries: webhooks, gating, export auth, members, shops |
| **End-to-end** | [Playwright](https://playwright.dev) | Real browser flows: login, onboarding, kiosk checkout, export, roles |

**Discovery-first policy:** Tests assert correct product behavior. Failing tests that reveal bugs are a valid outcome — see [`TEST_FINDINGS.md`](./TEST_FINDINGS.md). Do not weaken assertions or patch production code just to get green during test authoring.

Manual Stripe webhook testing still uses `npm run stripe:listen` during development (see below).

---

## Quick start

```powershell
# Install dependencies (first time)
npm install

# All Vitest (unit + convex integration)
npm run test

# Unit only (fast)
npm run test:unit

# Convex integration only
npm run test:convex

# E2E (starts `npm run dev` automatically unless a server is already running)
npm run test:e2e

# Everything
npm run test:all
```

---

## Demo kiosk seed

The public demo shop at `/s/demo` is provisioned via Convex — not checked into the database.

```powershell
# After `npx convex dev` is running (or once against your deployment)
npm run demo:seed
```

This creates (or updates):

- Organization **QRButik Demo IF** with `subscriptionStatus: active`
- Shop slug **`demo`** (Demokiosk) with 8 typical kiosk products
- Demo Swish number `1234567890` (checkout deep link only; no real payment expected)

Verify in the browser: `http://127.0.0.1:3000/s/demo`

Playwright runs `demo:seed` in `e2e/global-setup.ts` before public tests. If seed fails, run it manually.

For **production**, run `npm run demo:seed` once after deploy.

---

## Prerequisites

### All tests

- Node.js 22+ (matches project)
- `.env.local` with Convex deployment configured (`npx convex dev` once)

### E2E (Playwright)

1. **Convex dev env** must have:
   - `DEV_MAGIC_LINK=true` — stores magic links instead of sending email
2. **`.env.local`** must include:
   - `VITE_CONVEX_SITE_URL` — used by auth helper to fetch dev magic links
   - `SITE_URL` and `VITE_SITE_URL` — **same origin everywhere** (recommend `http://127.0.0.1:3000`). Playwright `baseURL`, Vite, and magic-link redirects must match; mixing `localhost` and `127.0.0.1` breaks session cookies.

Install browser binaries once:

```powershell
npx playwright install chromium
```

### Stripe checkout E2E

One Playwright test opens real Stripe Checkout (redirect to `checkout.stripe.com`). Enabled when `STRIPE_E2E=true` in `.env.local` or the environment.

Prerequisites:

```powershell
npm run stripe:setup    # product/price + Convex env vars
# npm run stripe:listen   # only needed for webhook / subscription flip tests
```

Run billing specs only:

```powershell
npm run test:e2e -- e2e/billing.spec.ts
```

Disable without removing keys: `STRIPE_E2E=false` in `.env.local`.

---

## Vitest (unit + integration)

### Run commands

| Command | Purpose |
|---------|---------|
| `npm run test` | Run all Vitest projects (unit + convex) |
| `npm run test:unit` | Node env: `src/**/*.test.ts`, `convex/lib/**/*.test.ts` |
| `npm run test:convex` | Edge-runtime: `convex/**/*.integration.test.ts` |
| `npm run test:watch` | Watch mode while developing |
| `npm run test:coverage` | Coverage report (`coverage/` folder) |

### Layout

```
convex/test/fixtures.ts   # shared seeds for integration tests
convex/test/matrices.ts   # table-driven status/role inputs
convex/test/modules.ts    # import.meta.glob for convex-test
convex/lib/*.test.ts      # pure function unit tests
convex/*.integration.test.ts
src/lib/*.test.ts
TEST_FINDINGS.md          # failure report from discovery runs
```

### What we test

| File | Subject |
|------|---------|
| `convex/lib/validators.test.ts` | Email normalization, subscription gating |
| `convex/lib/stripeHelpers.test.ts` | Stripe status mapping, trial sync, duplicate subscription guard |
| `convex/lib/auth.test.ts` | Shop access matrix per role |
| `convex/lib/transactions.test.ts` | buildSummary, period ranges, pending filter |
| `convex/lib/exportFormat.test.ts` | CSV/SIE formatting, verified-only SIE lines |
| `convex/stripeMutations.integration.test.ts` | Webhook mutations, dedup |
| `convex/transactions.gating.integration.test.ts` | Purchase gating + trial expiry |
| `convex/exports.integration.test.ts` | Export authorization |
| `convex/members.integration.test.ts` | acceptInvitation |
| `convex/shops.integration.test.ts` | createShop, delete cascade |
| `convex/orgDashboard.integration.test.ts` | Dashboard vs export row parity |
| `src/lib/swish.test.ts` | Swish deep link generation |
| `src/lib/billing.test.ts` | Trial countdown helper |
| `src/lib/billingUi.test.ts` | canActivate, needsPaymentUrgently |
| `src/lib/adminDashboard.test.ts` | Date range filters |
| `src/lib/adminShopNav.test.ts` | Tab visibility per role |

### Conventions

- Test files live next to source: `foo.ts` → `foo.test.ts` or `foo.integration.test.ts`
- Pure logic is extracted to testable modules instead of testing Convex handlers directly when possible
- Integration tests import seeds from `convex/test/fixtures.ts` only — no duplicated inline seeds
- Vitest config: `vitest.config.ts` — two projects (`unit`, `convex`)
- Fixed timestamps in fixtures (`FIXTURE_NOW`) for deterministic assertions; use `Date.now()` only when testing time-relative behavior

---

## Playwright (E2E)

### Run commands

| Command | Purpose |
|---------|---------|
| `npm run test:e2e` | Headless Chromium, full suite |
| `npm run test:e2e:ui` | Interactive UI mode for debugging |
| `npm run test:e2e:report` | Open HTML report after a run |

Run a single file:

```powershell
npm run test:e2e -- e2e/onboarding.spec.ts
```

### Suite overview

| Spec | Flow |
|------|------|
| `e2e/public.spec.ts` | Landing page B2B copy, live demo kiosk `/s/demo`, `/villkor`, `/integritet` |
| `e2e/auth.spec.ts` | Dev magic link login → `/admin` (redirects to `/admin/org/{id}`) |
| `e2e/onboarding.spec.ts` | Create org at `/skapa` → redirect to `/admin/billing` |
| `e2e/billing.spec.ts` | Billing UI + Stripe Checkout redirect (`STRIPE_E2E=true` in `.env.local`) |
| `e2e/members.spec.ts` | Invite editor, accept via dev invite token |
| `e2e/roles.spec.ts` | Owner vs editor nav, export gating, editor historik deep-link blocked |
| `e2e/export.spec.ts` | Trial → kiosk → purchase → verify → CSV/SIE export |
| `e2e/kiosk-closed.spec.ts` | Inactive org → public kiosk “tillfälligt stängd” |
| `e2e/kiosk-checkout.spec.ts` | Demo kiosk checkout → thank-you page |
| `e2e/kiosk-verify.spec.ts` | Admin historik verify after checkout |
| `e2e/roadmap-5-4.spec.ts` | ROADMAP 5.4 full flow (trial → kiosk → purchase → verify → export) |
| `e2e/products.spec.ts` | Product admin |

### Global setup

Before the suite runs, `e2e/global-setup.ts` (wired in `playwright.config.ts`):

1. Probes `{VITE_CONVEX_SITE_URL}/dev/magic-link?email=healthcheck` — fails loudly if `DEV_MAGIC_LINK` is off or Convex is not deployed
2. Runs `npm run demo:seed` for the public demo kiosk

If global setup fails, fix Convex env and run `npx convex dev` before retrying E2E.

### E2E environment (Playwright webServer)

Playwright starts the dev server with:

- `VITE_DEV_MAGIC_LINK=false` — prevents in-browser auto-open of magic links (avoids race with Playwright navigation)
- `SITE_URL` / `VITE_SITE_URL` aligned with `baseURL`

The app also skips dev magic-link auto-open when `navigator.webdriver === true` or `window.__E2E_AUTH__` is set (`src/lib/devMagicLink.ts`).

### Stripe sign-off

See [`docs/STRIPE_GO_LIVE.md`](./docs/STRIPE_GO_LIVE.md) for Test Mode and Live promotion checklist (ROADMAP 0.4 + 2.3.3).

### Auth helper

E2E login uses the same dev flow as local development:

1. Submit email on `/logga-in`
2. Poll `{VITE_CONVEX_SITE_URL}/dev/magic-link?email=...`
3. Navigate to the returned URL (Better Auth cross-domain session)

See `e2e/helpers/auth.ts`.

- `loginWithDevMagicLink(page, email, redirectTo)` — log in and land on `redirectTo` (use `/admin` for reliability).
- `loginAndOpen(page, email, path)` — log in via `/admin`, then navigate to routes like `/skapa` (used by onboarding/billing specs).
- `createTestOrg`, `createTestKiosk`, `createTrialOrgWithKiosk` — see `e2e/helpers/org.ts`
- `waitForDevInviteToken` — poll `/dev/invite-token?email=` (requires `DEV_MAGIC_LINK=true` + deployed `devInviteToken.ts`)

### Google sign-in (manual)

E2E does **not** automate Google OAuth. Use magic link in Playwright (`e2e/auth.spec.ts`). To verify Google locally:

1. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on the Convex deployment (see [`AGENTS.md`](./AGENTS.md)).
2. Add redirect URI `{CONVEX_SITE_URL}/api/auth/callback/google` in Google Cloud Console.
3. Open `/logga-in` → **Fortsätt med Google** → consent → land on `/admin`.
4. For invites: sign in with the **same email** the invitation was sent to.

Dev without Google keys: magic link remains fully usable; the Google button surfaces a Better Auth error if clicked.

### Configuration

- `playwright.config.ts` — base URL, `globalSetup`, webServer env, Chromium project
- `PLAYWRIGHT_BASE_URL` — override app URL (default from `VITE_SITE_URL` / `SITE_URL` or `http://127.0.0.1:3000`)
- `PLAYWRIGHT_CONVEX_SITE_URL` — override Convex HTTP URL for magic links
- `reuseExistingServer: true` locally — start `npm run dev` yourself to iterate faster; ensure your running server uses the **same origin** as Playwright `baseURL`

Artifacts on failure: `test-results/`, `playwright-report/` (gitignored).

---

## CI checklist (future)

When adding GitHub Actions:

1. `npm ci`
2. `npm run test`
3. Configure Convex + `DEV_MAGIC_LINK` secrets for E2E
4. `npx playwright install --with-deps chromium`
5. `npm run test:e2e`

Stripe checkout E2E remains optional (`STRIPE_E2E=true` + secrets).

---

## Related docs

- [`AGENTS.md`](./AGENTS.md) — agent workflow including test commands
- [`ROADMAP.md`](./ROADMAP.md) — **5.4** E2E trial → kiosk → purchase → export (Phase 3+)
