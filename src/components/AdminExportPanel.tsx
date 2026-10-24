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
  salesExport?: boolean
  accountingExport?: boolean
}

export function AdminExportPanel({
  organizationId,
  shopId,
  start,
  end,
  compact = false,
  salesExport = false,
  accountingExport = false,
}: AdminExportPanelProps) {
  const exportExcel = useAction(api.exportExcelActions.exportTransactionsExcel)
  const exportCsv = useAction(api.exportExcelActions.exportTransactionsCsv)
  const exportSie = useAction(api.exportActions.exportTransactionsSie)
  const [isExporting, setIsExporting] = useState<'excel' | 'csv' | 'sie' | null>(null)
  const [includePending, setIncludePending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (format: 'excel' | 'csv' | 'sie') => {
    setError(null)
    setIsExporting(format)
    try {
      const action =
        format === 'excel' ? exportExcel : format === 'csv' ? exportCsv : exportSie
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
        <h2 className="text-base font-semibold text-brand-foreground">
          Exportera till bokföring
        </h2>
        <p className="text-sm text-brand-muted">
          Excel och CSV för översikt. SIE4-filen kan läsas in i bokföringsprogram,
          till exempel Fortnox eller Visma. SIE tar bara med verifierade köp och
          bokför beloppet mot 1930 och intäktskontot. Artiklar har ingen momssats,
          så utgående moms delas inte upp.
        </p>
      </div>
      {!salesExport ? (
        <p className="text-sm text-brand-muted">
          Försäljningsrapport och export ingår i Event och Säsong.
        </p>
      ) : null}
      {salesExport ? (
      <>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-muted">
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
          onClick={() => void handleExport('csv')}
          disabled={isExporting !== null}
          className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-brand-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting === 'csv' ? 'Exporterar…' : 'Exportera CSV'}
        </button>
        {accountingExport ? (
          <button
            type="button"
            onClick={() => void handleExport('sie')}
            disabled={isExporting !== null}
            className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-brand-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting === 'sie' ? 'Exporterar…' : 'Exportera SIE'}
          </button>
        ) : (
          <p className="self-center text-sm text-brand-muted">
            Bokföringsexport ingår i Säsong.
          </p>
        )}
      </div>
      </>
      ) : null}
      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
