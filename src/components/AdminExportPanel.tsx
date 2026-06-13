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
  const exportExcel = useAction(api.exportExcelActions.exportTransactionsExcel)
  const exportSie = useAction(api.exportActions.exportTransactionsSie)
  const [isExporting, setIsExporting] = useState<'excel' | 'sie' | null>(null)
  const [includePending, setIncludePending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (format: 'excel' | 'sie') => {
    setError(null)
    setIsExporting(format)
    try {
      const action = format === 'excel' ? exportExcel : exportSie
      const result = await action({
        organizationId,
        shopId,
        start,
        end,
        includePending: format === 'excel' ? includePending : undefined,
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
          Excel för översikt och SIE4 för Fortnox/Visma. SIE inkluderar alltid
          endast verifierade köp.
        </p>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={includePending}
          onChange={(event) => setIncludePending(event.target.checked)}
          disabled={isExporting !== null}
          className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
        />
        Inkludera icke verifierade köp i Excel-filen
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleExport('excel')}
          disabled={isExporting !== null}
          className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting === 'excel' ? 'Exporterar…' : 'Exportera Excel'}
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
