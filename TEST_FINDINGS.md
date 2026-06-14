# Test Findings ù QRButik

> Discovery-first test run. Failing tests are intentional signal ù do not delete without fixing the product bug or correcting the test spec.

**Last full run:** 2026-06-13 (Wave 6 + Stripe E2E enabled)

## Summary

| Layer | Passed | Failed | Flaky | Skipped | Notes |
|-------|--------|--------|-------|---------|-------|
| Unit (`npm run test:unit`) | 79 | 0 | ù | ù | Pure helpers + frontend RBAC/billing UI |
| Convex integration (`npm run test:convex`) | 52 | 0 | ù | ù | Auth, Stripe webhooks, gating, export, members, shops, dashboard |
| **Vitest total** | **131** | **0** | ù | ù | `npm run test` |
| E2E (`npm run test:e2e`) | **17** | **0** | **1** | **0** | Stripe Checkout enabled via `STRIPE_E2E=true`; occasional auth flake on first billing test |

---

## Resolved (2026-06-13 sprint)

All items from the original discovery run are fixed. Root causes and fixes:

| Area | Original symptom | Fix |
|------|------------------|-----|
| **E2E auth** | Magic-link race, `localhost` vs `127.0.0.1` mismatch, flaky `/skapa` login | `e2e/global-setup.ts`; unified base URL; `VITE_DEV_MAGIC_LINK=false` in Playwright webServer; `devMagicLink.ts` skips auto-open when `navigator.webdriver` or `__E2E_AUTH__`; hardened `e2e/helpers/auth.ts` |
| **Export download** | Playwright missed blob download | `downloadExportFile` appends anchor to `document.body` before click |
| **ROADMAP 5.4** | Timeout at CSV download | Same download fix + `test.setTimeout(180_000)` |
| **Member invites** | Editor saw "Skapa en fùrening fùrst" / no accept UI | `InviteAcceptPanel` in `medlemmar.tsx` before org/canManage gates; `AdminMemberSync` skips auto-accept on invite URL |
| **Member reassign E2E** | Clicked Redigera on pending invite; strict-mode locator collisions | Accept invite first; scope assertions to `Kiosker: ù` text |
| **Editor RBAC** | Editor could deep-link `/historik` | `transactions.ts` treasurer-only; UI guards on `historik.tsx` / `settings.tsx`; E2E deep-link test in `roles.spec.ts` |
| **Billing UI** | `billingUi.ts` not wired | `billing.tsx` imports shared helpers |
| **Stripe Checkout E2E** | Skipped unless env flag set | `STRIPE_E2E=true` in `.env.local`; `isStripeE2EEnabled()` reads env + `.env.local`; test opens `checkout.stripe.com` |

---

## Stripe E2E (enabled)

| Spec | Scenario | Result | Prerequisites |
|------|----------|--------|---------------|
| `e2e/billing.spec.ts` | `card checkout opens Stripe when configured` | **Pass** (~11s) | `STRIPE_E2E=true`; Convex env has `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` (`npm run stripe:setup`); local `VITE_STRIPE_PUBLISHABLE_KEY` |

**What it verifies:** New org on trial ? click **Betala med kort** ? browser navigates to Stripe Checkout hosted page.

**What it does not verify:** Completing payment, webhook delivery, or subscription status flip (use `npm run stripe:listen` + manual checkout for that).

**Disable locally:** Set `STRIPE_E2E=false` in `.env.local` or unset the variable.

---

## Product bugs

_No open product bugs from the discovery run._

---

## Test infra issues

| Test file | Issue | Notes |
|-----------|-------|-------|
| `e2e/billing.spec.ts` (trial UI test) | **Flaky** ó first run can timeout waiting for `Fˆreningsnamn` after magic link | Passes on retry; same auth cold-start pattern as pre-fix runs |

Other prerequisites in [`TESTING.md`](./TESTING.md):

- Convex dashboard: `DEV_MAGIC_LINK=true`
- Consistent origin: `SITE_URL` / `VITE_SITE_URL` / Playwright `baseURL` (use one host ù e.g. `http://localhost:3000` or `http://127.0.0.1:3000`, not both)
- Playwright sets `VITE_DEV_MAGIC_LINK=false` to avoid browser auto-open race
- `e2e/global-setup.ts` probes magic-link endpoint and runs `demo:seed`
- Stripe E2E: `STRIPE_E2E=true` + Stripe Test Mode keys in Convex

---

## Spec decisions (locked in)

| Test file | Decision | Assertion |
|-----------|----------|-----------|
| `e2e/export.spec.ts` | Export includes **verified-only** rows | Matches backend `listTransactionsForShopsInRange` |
| `e2e/roles.spec.ts` | Editor **cannot** deep-link to `/historik` | Redirect or access message; no verify checkbox UI |
| `e2e/billing.spec.ts` | Stripe test only runs when explicitly enabled | `STRIPE_E2E=true`; asserts Checkout URL, not full payment |

---

## Subagent log

| When | Agent | File | Result | Notes |
|------|-------|------|--------|-------|
| 2026-06-13 | Wave 0 | `e2e/global-setup.ts`, `playwright.config.ts`, `devMagicLink.ts` | pass | env + seed |
| 2026-06-13 | Wave 1 | `e2e/helpers/auth.ts` | pass | session-aware waits |
| 2026-06-13 | Wave 2 | `adminDashboard.ts`, `roadmap-5-4.spec.ts` | pass | blob download |
| 2026-06-13 | Wave 3 | `medlemmar.tsx`, `members.spec.ts` | pass | invite accept + reassign |
| 2026-06-13 | Wave 4 | `transactions.ts`, `historik.tsx`, `roles.spec.ts` | pass | treasurer RBAC + deep-link E2E |
| 2026-06-13 | Wave 5 | `billing.tsx` | pass | billingUi wiring |
| 2026-06-13 | Wave 6 | full suite + docs | **16/16 E2E pass** | before Stripe enabled |
| 2026-06-13 | Stripe | `billing.spec.ts`, `env.ts`, `.env.local` | **17/17 E2E pass** | Checkout redirect verified |

---

## New test file inventory

### Vitest unit (`src/**`, `convex/lib/**`)

- `convex/lib/auth.test.ts`, `transactions.test.ts`, `exportFormat.test.ts` (extended)
- `src/lib/adminDashboard.test.ts`, `adminShopNav.test.ts`, `billingUi.test.ts`

### Vitest convex integration (`convex/**/*.integration.test.ts`)

- `stripeMutations`, `transactions.gating`, `exports`, `members`, `shops`, `orgDashboard`

### Playwright E2E

- `kiosk-closed`, `kiosk-checkout`, `kiosk-verify`, `roadmap-5-4`, `roles`, `members`, `products`
- Extended: `export.spec.ts`, `billing.spec.ts` (Stripe Checkout when enabled)

### Helpers

- `convex/test/fixtures.ts`, `matrices.ts`, `modules.ts`
- `e2e/global-setup.ts`
- `e2e/helpers/org.ts`, `invite.ts`, `convex.ts`, `kiosk.ts`, `export.ts`, `purchase.ts`, `members.ts`, `findings.ts`, `env.ts`

- **2026-06-14T09:32:11.493Z** ‚Äî `e2e/export.spec.ts` ‚Äî trial org can sell, verify, and export Excel/SIE
| e2e/export.spec.ts | trial org can sell, verify, and export Excel/SIE | Test passes | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Betalning verifierad.')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

C | medium | e2e |

- **2026-06-14T09:32:44.152Z** ‚Äî `e2e/export.spec.ts` ‚Äî trial org can sell, verify, and export Excel/SIE
| e2e/export.spec.ts | trial org can sell, verify, and export Excel/SIE | Test passes | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Betalning verifierad.')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

C | medium | e2e |

- **2026-06-14T09:37:17.767Z** ‚Äî `e2e/members.spec.ts` ‚Äî owner invites editor and editor accepts via dev invite token
| e2e/members.spec.ts | owner invites editor and editor accepts via dev invite token | Test passes | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('heading', { name: /Centralt dashboard\|Dina kiosker\|F√∂reningens kiosker/ })
Expected: visi | medium | e2e |

- **2026-06-14T09:39:07.262Z** ‚Äî `e2e/roadmap-5-4.spec.ts` ‚Äî trial org ‚Üí skapa-kiosk ‚Üí customer purchase ‚Üí verify ‚Üí export download
| e2e/roadmap-5-4.spec.ts | trial org ‚Üí skapa-kiosk ‚Üí customer purchase ‚Üí verify ‚Üí export download | Test passes | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Betalning verifierad.')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

C | medium | e2e |

- **2026-06-14T09:39:38.609Z** ‚Äî `e2e/roadmap-5-4.spec.ts` ‚Äî trial org ‚Üí skapa-kiosk ‚Üí customer purchase ‚Üí verify ‚Üí export download
| e2e/roadmap-5-4.spec.ts | trial org ‚Üí skapa-kiosk ‚Üí customer purchase ‚Üí verify ‚Üí export download | Test passes | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Betalning verifierad.')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

C | medium | e2e |
