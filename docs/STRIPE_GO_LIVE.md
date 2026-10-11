# Stripe go-live checklist

Use this checklist before accepting real club payments in production.

## 1. Stripe account (ROADMAP 0.4)

- [ ] Create or verify Stripe account with Swedish business details
- [ ] Confirm the live Price is `tax_behavior=inclusive` (995 kr includes 25% moms)
- [ ] Create an inclusive 25% Tax Rate and set `STRIPE_TAX_RATE_ID` (see [Swedish VAT](#swedish-vat-25-inclusive))
- [ ] Enable Customer Portal (Billing → Customer portal)
- [ ] Add production webhook endpoint: `{CONVEX_SITE_URL}/stripe/webhook`
- [ ] Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

## 2. Environment variables

### Convex (production deployment)

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | Live secret key (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Live webhook signing secret |
| `STRIPE_PRICE_ID` | Live price ID for 995 kr/mån (`tax_behavior=inclusive`) |
| `STRIPE_TAX_RATE_ID` | Optional. Live Tax Rate ID (`txr_…`) for 25% inclusive moms. When set, applied to Checkout and invoice subscriptions. When unset, those calls omit tax rates. |

### Vite (optional)

| Variable | Value |
|----------|-------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Live publishable key |

### Swedish VAT (25% inclusive)

The club license is **995 kr/month including 25% moms**. The live Price uses `tax_behavior=inclusive`, so attaching an inclusive tax rate does not add 25% on top of 995 kr. Stripe breaks moms out on the invoice (796 kr exkl. moms + 199 kr moms).

Create the Tax Rate in the Stripe Dashboard (Product catalog → Tax rates), in the same mode as the secret key:

- Percentage: **25**
- Inclusive: **yes**
- Display name: e.g. `Moms`

Then set it on the Convex deployment (do not commit the ID):

```powershell
npx convex env set STRIPE_TAX_RATE_ID "txr_..."
```

When `STRIPE_TAX_RATE_ID` is set, QRButik passes that single ID as Stripe `default_tax_rates`:

- Subscription Checkout: `checkout.sessions.create` → `subscription_data.default_tax_rates`
- Invoice subscription: `subscriptions.create` with `collection_method=send_invoice` → `default_tax_rates`

Line items stay `{ price, quantity }` / `{ price }` with no per-item `tax_rates`. Stripe copies the subscription default onto invoices for items that do not set their own rates.

When the variable is unset or blank, both calls omit `default_tax_rates` (same request shape as before this setting existed). An exclusive tax rate would charge 995 kr plus 25% and must not be used with this price. This flow uses a manual Tax Rate, not Stripe Tax automatic tax.

## 3. Test Mode sign-off (ROADMAP 2.3.3)

Run in development before switching to Live keys:

```powershell
npm run stripe:setup
```

In a second terminal:

```powershell
npm run stripe:listen
```

Manual flow:

1. Create org at `/skapa` or use existing trial org
2. Open `/admin/org/{orgId}` → Fakturering (`/admin/billing?organizationId=…`)
3. Click **Betala med kort** and complete checkout with test card `4242 4242 4242 4242`
4. If `STRIPE_TAX_RATE_ID` is set, confirm Checkout still totals **995 kr** and the summary shows inclusive moms. If it is unset, Checkout has no tax line.
5. Confirm webhook updates org status to `active` in Convex dashboard
6. Test **Hantera prenumeration** (Customer Portal)
7. Optional: `STRIPE_E2E=true npm run test:e2e -- e2e/billing.spec.ts`

Invoice flow (Test Mode):

1. Click **Betala med faktura** on billing page
2. Confirm org receives invoice collection email in Stripe test dashboard
3. If `STRIPE_TAX_RATE_ID` is set, confirm the invoice total is still **995 kr** with inclusive 25% moms. If it is unset, the invoice has no tax rate.

## 4. Production promotion

- [ ] Deploy Convex + frontend with Live env vars
- [ ] Run one real 995 kr checkout with a test club (refund in Stripe if needed)
- [ ] Verify webhook idempotency (`stripeEvents` table)
- [ ] Confirm trial expiry cron still inactivates orgs without payment

## 5. Owner sign-off

| Item | Owner | Date |
|------|-------|------|
| Test Mode flow verified | | |
| Live keys configured | | |
| Production test payment | | |
