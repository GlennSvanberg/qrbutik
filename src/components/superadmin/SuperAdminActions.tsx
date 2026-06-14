import { useMutation } from 'convex/react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import {
  SUBSCRIPTION_STATUS_OPTIONS,
  subscriptionLabel,
} from '../../lib/superadminUi'
import type { Id } from '../../../convex/_generated/dataModel'
import type { SubscriptionStatusOption } from '../../lib/superadminUi'

type SuperAdminActionsProps = {
  organizationId: Id<'organizations'>
  organizationName: string
  subscriptionStatus: string
}

export function SuperAdminActions({
  organizationId,
  organizationName,
  subscriptionStatus,
}: SuperAdminActionsProps) {
  const extendTrial = useMutation(api.superadmin.extendTrial)
  const updateSubscriptionStatus = useMutation(
    api.superadmin.updateSubscriptionStatus,
  )

  const [isExtending, setIsExtending] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [nextStatus, setNextStatus] =
    useState<SubscriptionStatusOption>('trialing')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const canExtendTrial =
    subscriptionStatus === 'trialing' || subscriptionStatus === 'inactive'

  const handleExtendTrial = async (additionalDays: number) => {
    const confirmed = window.confirm(
      `Förläng provperiod med ${additionalDays} dagar för ${organizationName}? Detta uppdaterar bara Convex — inte Stripe.`,
    )
    if (!confirmed) {
      return
    }

    setIsExtending(true)
    setError(null)
    setMessage(null)
    try {
      const result = await extendTrial({ organizationId, additionalDays })
      setMessage(
        `Provperiod förlängd till ${new Date(result.trialEndsAt).toLocaleString('sv-SE')}.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte förlänga provperiod.')
    } finally {
      setIsExtending(false)
    }
  }

  const handleUpdateStatus = async () => {
    const confirmed = window.confirm(
      `Ändra status för ${organizationName} till "${subscriptionLabel[nextStatus] ?? nextStatus}"? Manuell override synkas inte till Stripe.`,
    )
    if (!confirmed) {
      return
    }

    setIsUpdatingStatus(true)
    setError(null)
    setMessage(null)
    try {
      await updateSubscriptionStatus({
        organizationId,
        subscriptionStatus: nextStatus,
      })
      setMessage(`Status uppdaterad till ${subscriptionLabel[nextStatus] ?? nextStatus}.`)
      setShowStatusDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte uppdatera status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {canExtendTrial ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isExtending}
            onClick={() => void handleExtendTrial(7)}
            className="cursor-pointer rounded-lg border border-brand-border bg-surface px-3 py-1.5 text-xs font-semibold text-brand-muted hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            +7d trial
          </button>
          <button
            type="button"
            disabled={isExtending}
            onClick={() => void handleExtendTrial(14)}
            className="cursor-pointer rounded-lg border border-brand-border bg-surface px-3 py-1.5 text-xs font-semibold text-brand-muted hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            +14d trial
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setShowStatusDialog((open) => !open)}
        className="cursor-pointer rounded-lg border border-brand-border bg-surface px-3 py-1.5 text-xs font-semibold text-brand-muted hover:bg-surface-muted"
      >
        Ändra status
      </button>

      {showStatusDialog ? (
        <div className="mt-1 flex flex-col gap-2 rounded-xl border border-brand-border bg-surface-muted p-3">
          <label className="text-xs font-semibold text-brand-muted" htmlFor={`status-${organizationId}`}>
            Ny status
          </label>
          <select
            id={`status-${organizationId}`}
            value={nextStatus}
            onChange={(event) =>
              setNextStatus(event.target.value as SubscriptionStatusOption)
            }
            className="cursor-pointer rounded-lg border border-brand-border bg-surface px-3 py-2 text-sm text-brand-foreground"
          >
            {SUBSCRIPTION_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {subscriptionLabel[status] ?? status}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => void handleUpdateStatus()}
            className="relaxed-primary-button cursor-pointer px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdatingStatus ? 'Sparar...' : 'Spara status'}
          </button>
        </div>
      ) : null}

      {message ? <p className="text-xs text-green-700">{message}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
