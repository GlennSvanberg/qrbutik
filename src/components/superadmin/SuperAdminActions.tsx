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
  const updateSubscriptionStatus = useMutation(
    api.superadmin.updateSubscriptionStatus,
  )

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [nextStatus, setNextStatus] =
    useState<SubscriptionStatusOption>('trialing')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleUpdateStatus = async () => {
    const confirmed = window.confirm(
      `Ändra status för ${organizationName} från "${subscriptionLabel[subscriptionStatus] ?? subscriptionStatus}" till "${subscriptionLabel[nextStatus] ?? nextStatus}"? Manuell override synkas inte till Stripe.`,
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
