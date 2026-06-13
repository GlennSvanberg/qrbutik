export const subscriptionLabel: Record<string, string> = {
  trialing: 'Provperiod',
  active: 'Aktiv licens',
  past_due: 'Förfallen',
  canceled: 'Avslutad',
  inactive: 'Inaktiv',
}

export const subscriptionBadgeClass: Record<string, string> = {
  trialing: 'bg-blue-50 text-blue-700 ring-blue-200',
  active: 'bg-green-50 text-green-700 ring-green-200',
  past_due: 'bg-amber-50 text-amber-800 ring-amber-200',
  canceled: 'bg-slate-100 text-slate-600 ring-slate-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatMrr(value: number): string {
  return `${formatCurrency(value)}/mån`
}

export function formatDateTime(value: number): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatDate(value: number): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function isStripeLiveMode(): boolean {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined
  return key?.startsWith('pk_live_') ?? false
}

export function stripeCustomerDashboardUrl(customerId: string): string {
  const mode = isStripeLiveMode() ? '' : '/test'
  return `https://dashboard.stripe.com${mode}/customers/${customerId}`
}

export function stripeDashboardHomeUrl(): string {
  const mode = isStripeLiveMode() ? '' : '/test'
  return `https://dashboard.stripe.com${mode}/dashboard`
}

export const SUBSCRIPTION_STATUS_OPTIONS = [
  'trialing',
  'active',
  'past_due',
  'canceled',
  'inactive',
] as const

export type SubscriptionStatusOption =
  (typeof SUBSCRIPTION_STATUS_OPTIONS)[number]
