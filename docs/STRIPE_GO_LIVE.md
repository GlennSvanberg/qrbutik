# Stripe go-live checklist

Use this checklist before accepting real club payments in production.

## 1. Stripe account (ROADMAP 0.4)

- [ ] Create or verify Stripe account with Swedish business details
- [ ] Confirm both live Prices are `tax_behavior=inclusive` (295 kr and 1 495 kr include 25% moms)
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
| `STRIPE_EVENT_PRICE_ID` | Live price ID for Event 295 kr one-time (`tax_behavior=inclusive`) |
| `STRIPE_SEASON_PRICE_ID` | Live price ID for Säsong 1 495 kr/year (`tax_behavior=inclusive`) |
| `STRIPE_TAX_RATE_ID` | Optional. Live Tax Rate ID (`txr_…`) for 25% inclusive moms. When set, Event Checkout sends `tax_rates` on the line item and Säsong Checkout sends `subscription_data.default_tax_rates`. When unset, those fields are omitted. |

### Vite (optional)

| Variable | Value |
|----------|-------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Live publishable key |

### Swedish VAT (25% inclusive)

Event is **295 kr** once and Säsong is **1 495 kr/year** (about 125 kr/month). Both include 25% moms. Prices use `tax_behavior=inclusive`, so attaching an inclusive tax rate does not add 25% on top.

Create the Tax Rate in the Stripe Dashboard (Product catalog → Tax rates), in the same mode as the secret key:

- Percentage: **25**
- Inclusive: **yes**
- Display name: e.g. `Moms`

Then set it on the Convex deployment (do not commit the ID):

```powershell
npx convex env set STRIPE_TAX_RATE_ID "txr_..."
```

When `STRIPE_TAX_RATE_ID` is set:

- Event Checkout (`mode=payment`): `line_items[].tax_rates`
- Säsong Checkout (`mode=subscription`): `subscription_data.default_tax_rates`

Both sessions set `allow_promotion_codes: true`. When the variable is unset or blank, tax rate fields are omitted. An exclusive tax rate would add 25% on top of the price and must not be used. This flow uses a manual Tax Rate, not Stripe Tax automatic tax.

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

1. Create an org at `/skapa` (it starts on Gratis)
2. Open `/admin/billing?organizationId=…`
3. Click **Köp Event — 295 kr** or **Starta Säsong — 1 495 kr/år** and pay with test card `4242 4242 4242 4242`
4. If `STRIPE_TAX_RATE_ID` is set, confirm the total stays **295 kr** or **1 495 kr** with inclusive moms
5. Confirm the webhook sets `plan` to `event` (with `eventExpiresAt`) or `season` with status `active`
6. For Säsong, open **Hantera prenumeration** (Customer Portal)
7. Optional: `STRIPE_E2E=true npm run test:e2e -- e2e/billing.spec.ts`

## 4. Production promotion

- [ ] Deploy Convex + frontend with Live env vars
- [ ] Run one real Event or Säsong checkout with a test club (refund in Stripe if needed)
- [ ] Verify webhook idempotency (`stripeEvents` table)
- [ ] Confirm `expireEventPlans` returns an expired Event to Gratis

## 5. Owner sign-off

| Item | Owner | Date |
|------|-------|------|
| Test Mode flow verified | | |
| Live keys configured | | |
| Production test payment | | |
