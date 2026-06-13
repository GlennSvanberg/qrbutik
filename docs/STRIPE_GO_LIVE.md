# Stripe go-live checklist

Use this checklist before accepting real club payments in production.

## 1. Stripe account (ROADMAP 0.4)

- [ ] Create or verify Stripe account with Swedish business details
- [ ] Configure Swedish VAT (moms) in Stripe Dashboard → Settings → Tax
- [ ] Enable Customer Portal (Billing → Customer portal)
- [ ] Add production webhook endpoint: `{CONVEX_SITE_URL}/stripe/webhook`
- [ ] Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

## 2. Environment variables

### Convex (production deployment)

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | Live secret key (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Live webhook signing secret |
| `STRIPE_PRICE_ID` | Live price ID for 995 kr/mån |

### Vite (optional)

| Variable | Value |
|----------|-------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Live publishable key |

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
4. Confirm webhook updates org status to `active` in Convex dashboard
5. Test **Hantera prenumeration** (Customer Portal)
6. Optional: `STRIPE_E2E=true npm run test:e2e -- e2e/billing.spec.ts`

Invoice flow (Test Mode):

1. Click **Betala med faktura** on billing page
2. Confirm org receives invoice collection email in Stripe test dashboard

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
