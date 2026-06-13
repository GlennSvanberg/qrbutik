# Testing — QRButik

QRButik uses two layers of automated tests:

| Layer | Tool | What it covers |
|-------|------|----------------|
| **Unit / logic** | [Vitest](https://vitest.dev) | Pure functions: validators, Stripe helpers, Swish links, billing UI helpers |
| **End-to-end** | [Playwright](https://playwright.dev) | Real browser flows: login, org onboarding, billing UI, optional Stripe checkout |

Manual Stripe webhook testing still uses `npm run stripe:listen` during development (see below).

---

## Quick start

```powershell
# Install dependencies (first time)
npm install

# Unit tests (fast, no servers)
npm run test

# E2E (starts `npm run dev` automatically unless a server is already running)
npm run test:e2e

# Everything
npm run test:all
```

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
   - `VITE_SITE_URL` or default `http://127.0.0.1:3000` — Playwright base URL (matches Vite dev port)

Install browser binaries once:

```powershell
npx playwright install chromium
```

### Optional: Stripe checkout E2E

One Playwright test opens real Stripe Checkout. Run only when Stripe Test Mode is configured:

```powershell
npm run stripe:setup
npm run stripe:listen   # separate terminal
$env:STRIPE_E2E = "true"
npm run test:e2e -- e2e/billing.spec.ts
```

---

## Vitest (unit tests)

### Run commands

| Command | Purpose |
|---------|---------|
| `npm run test` | Run all unit tests once |
| `npm run test:watch` | Watch mode while developing |
| `npm run test:coverage` | Coverage report (`coverage/` folder) |

### What we test

| File | Subject |
|------|---------|
| `convex/lib/validators.test.ts` | Email normalization, subscription gating |
| `convex/lib/stripeHelpers.test.ts` | Stripe status mapping, trial sync, duplicate subscription guard |
| `src/lib/swish.test.ts` | Swish deep link generation |
| `src/lib/billing.test.ts` | Trial countdown helper |

### Conventions

- Test files live next to source: `foo.ts` → `foo.test.ts`
- Pure logic is extracted to testable modules (`convex/lib/stripeHelpers.ts`, `src/lib/billing.ts`) instead of testing Convex handlers directly
- Vitest config: `vitest.config.ts` (excludes `e2e/`)

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
| `e2e/public.spec.ts` | Landing page B2B copy, `/villkor`, `/integritet` |
| `e2e/auth.spec.ts` | Dev magic link login → `/admin` |
| `e2e/onboarding.spec.ts` | Create org at `/skapa` → redirect to `/admin/billing` |
| `e2e/billing.spec.ts` | Billing UI; optional Stripe Checkout (`STRIPE_E2E=true`) |

### Auth helper

E2E login uses the same dev flow as local development:

1. Submit email on `/logga-in`
2. Poll `{VITE_CONVEX_SITE_URL}/dev/magic-link?email=...`
3. Navigate to the returned URL (Better Auth cross-domain session)

See `e2e/helpers/auth.ts`.

- `loginWithDevMagicLink(page, email, redirectTo)` — log in and land on `redirectTo` (use `/admin` for reliability).
- `loginAndOpen(page, email, path)` — log in via `/admin`, then navigate to routes like `/skapa` (used by onboarding/billing specs).

### Configuration

- `playwright.config.ts` — base URL, webServer, Chromium project
- `PLAYWRIGHT_BASE_URL` — override app URL (default from `.env.local` or `http://127.0.0.1:3000`)
- `PLAYWRIGHT_CONVEX_SITE_URL` — override Convex HTTP URL for magic links
- `reuseExistingServer: true` locally — start `npm run dev` yourself to iterate faster

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
