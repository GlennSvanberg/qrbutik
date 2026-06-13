import { useAction } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { downloadExportFile } from '../lib/adminDashboard'
import type { Id } from '../../convex/_generated/dataModel'

type AdminExportPanelProps = {
  organizationId: Id<'organizations'>
  shopId?: Id<'shops'>
  start: number
  end: number
  compact?: boolean
}

export function AdminExportPanel({
  organizationId,
  shopId,
  start,
  end,
  compact = false,
}: AdminExportPanelProps) {
  const exportCsv = useAction(api.exportActions.exportTransactionsCsv)
  const exportSie = useAction(api.exportActions.exportTransactionsSie)
  const [isExporting, setIsExporting] = useState<'csv' | 'sie' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (format: 'csv' | 'sie') => {
    setError(null)
    setIsExporting(format)
    try {
      const action = format === 'csv' ? exportCsv : exportSie
      const result = await action({
        organizationId,
        shopId,
        start,
        end,
      })
      downloadExportFile(result)
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : 'Exporten misslyckades.',
      )
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div
      className={`relaxed-surface flex flex-col gap-3 ${compact ? 'p-4' : 'p-5'}`}
    >
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Exportera till bokföring
        </h2>
        <p className="text-sm text-slate-600">
          CSV för Excel och SIE4 för Fortnox/Visma. Endast verifierade köp
          ingår i SIE-exporten.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleExport('csv')}
          disabled={isExporting !== null}
          className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting === 'csv' ? 'Exporterar…' : 'Exportera CSV'}
        </button>
        <button
          type="button"
          onClick={() => void handleExport('sie')}
          disabled={isExporting !== null}
          className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting === 'sie' ? 'Exporterar…' : 'Exportera SIE'}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
