import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, useQuery as useTanstackQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { AdminExportPanel } from '../../../components/AdminExportPanel'
import { getDateRangeForPeriod, isTreasurerRole } from '../../../lib/adminDashboard'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/historik')({
  component: PurchaseHistoryPage,
})

function PurchaseHistoryPage() {
  const { shopId } = Route.useParams()
  const shopIdParam = shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )
  const { data: organizations } = useTanstackQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )
  const { data: transactions } = useSuspenseQuery(
    convexQuery(api.transactions.listByShop, { shopId: shopIdParam }),
  )
  const verifyTransaction = useMutation(api.transactions.verify)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null)

  const formattedTransactions = useMemo(
    () =>
      transactions.map((transaction) => ({
        ...transaction,
        formattedDate: new Date(transaction.createdAt).toLocaleDateString(
          'sv-SE',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          },
        ),
        formattedTime: new Date(transaction.createdAt).toLocaleTimeString(
          'sv-SE',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
      })),
    [transactions],
  )

  const pendingTransactions = useMemo(
    () =>
      transactions.filter((transaction) => transaction.status === 'pending'),
    [transactions],
  )

  const orgRole = organizations?.find(
    (org) => org._id === shop?.organizationId,
  )?.role
  const showExport = orgRole ? isTreasurerRole(orgRole) : false
  const exportRange = getDateRangeForPeriod('last30')

  return (
    <>
      {showExport && shop ? (
        <AdminExportPanel
          organizationId={shop.organizationId}
          shopId={shopIdParam}
          start={exportRange.start}
          end={exportRange.end}
          compact
        />
      ) : null}

      <section className="flex flex-col gap-4">
          <div className="relaxed-divider flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Alla köp
              </h2>
              <p className="text-xs text-slate-500">
                Full historik med möjlighet att verifiera betalningar.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {pendingTransactions.length} väntar på verifiering
            </span>
          </div>

          <div className="relaxed-surface divide-y divide-slate-200/70">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Verifiera</span>
              <span>Datum &amp; referens</span>
              <span className="text-right">Summa</span>
            </div>
            {formattedTransactions.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Inga köp registrerade ännu.
              </div>
            ) : (
              formattedTransactions.map((transaction) => {
                const isExpanded = expandedTransactionId === transaction._id
                return (
                  <div key={transaction._id} className="px-4 py-4 transition">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setExpandedTransactionId((prev) =>
                          prev === transaction._id ? null : transaction._id,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setExpandedTransactionId((prev) =>
                            prev === transaction._id ? null : transaction._id,
                          )
                        }
                      }}
                      className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 text-left"
                      trackaton-on-click="admin-toggle-transaction"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300">
                        <input
                          type="checkbox"
                          checked={transaction.status === 'verified'}
                          disabled={transaction.status === 'verified'}
                          onClick={(event) => event.stopPropagation()}
                          onChange={async () => {
                            setError(null)
                            setStatusMessage(null)
                            try {
                              await verifyTransaction({
                                transactionId: transaction._id,
                              })
                              setStatusMessage('Betalning verifierad.')
                            } catch (verifyError) {
                              if (verifyError instanceof Error) {
                                setError(verifyError.message)
                              } else {
                                setError('Något gick fel. Försök igen.')
                              }
                            }
                          }}
                          className="h-4 w-4 cursor-pointer accent-stone-700"
                          trackaton-on-click="admin-verify-transaction"
                        />
                      </span>
                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          {transaction.formattedDate} ·{' '}
                          {transaction.formattedTime}
                          {transaction.status === 'pending' ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              Väntar
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Verifierad
                            </span>
                          )}
                        </span>
                      </span>

                      <span className="text-right text-lg font-semibold text-slate-900">
                        {transaction.amount} kr
                      </span>
                    </div>
                    {isExpanded ? (
                      <div className="relaxed-surface-soft mt-3 bg-stone-50/70 px-4 py-3 text-xs text-slate-600">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Varor
                        </p>
                        <div className="mt-2 flex flex-col gap-1">
                          {transaction.items.map((item) => (
                            <div
                              key={`${transaction._id}-${item.name}`}
                              className="flex items-center justify-between"
                            >
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>
                                {Math.round(
                                  item.price * item.quantity,
                                ).toLocaleString('sv-SE')}{' '}
                                kr
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </section>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {statusMessage ? (
          <p className="text-sm text-slate-600">{statusMessage}</p>
        ) : null}
    </>
  )
}
