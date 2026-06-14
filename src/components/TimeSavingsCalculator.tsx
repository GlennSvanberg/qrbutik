import { useState } from 'react'

type Props = {
  title?: string
  subtitle?: string
}

export function TimeSavingsCalculator({
  title = 'Hur mycket tid kan ni spara?',
  subtitle = 'Dra i reglaget för att se hur mycket snabbare det går med QRButik.',
}: Props) {
  const [customers, setCustomers] = useState(100)
  const timeSavedPerCustomer = 45 // seconds
  const totalSavedMinutes = Math.round((customers * timeSavedPerCustomer) / 60)

  return (
    <div className="accent-panel p-8 sm:p-12">
      <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-64 w-64 rounded-full bg-brand/20 opacity-40 blur-3xl" />

      <div className="relative z-10">
        <h2 className="mb-2 text-2xl font-bold">{title}</h2>
        <p className="accent-panel-muted mb-8">{subtitle}</p>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-8">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="accent-panel-muted text-xs font-medium uppercase tracking-wider">
                  Antal kunder
                </label>
                <span className="text-2xl font-bold">{customers} st</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={customers}
                onChange={(e) => setCustomers(parseInt(e.target.value))}
                className="accent-panel-range"
                trackaton-on-click="adjust-customers"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="accent-panel-surface p-4">
                <div className="accent-panel-muted mb-1 text-xs uppercase tracking-wider">
                  Traditionellt
                </div>
                <div className="text-xl font-semibold opacity-70">
                  ~{Math.round((customers * 60) / 60)} min
                </div>
                <div className="accent-panel-muted text-xs">kötid</div>
              </div>
              <div className="rounded-lg border border-brand bg-brand/10 p-4">
                <div className="mb-1 text-xs uppercase tracking-wider text-brand">
                  Med QRButik
                </div>
                <div className="text-2xl font-bold">~{Math.round((customers * 15) / 60)} min</div>
                <div className="accent-panel-muted text-xs">kötid</div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center border-t border-[var(--color-accent-panel-border)] pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="text-center">
              <div className="mb-2 text-6xl font-bold text-success">
                {totalSavedMinutes} min
              </div>
              <div className="accent-panel-muted text-lg">sparad tid totalt</div>
              <p className="accent-panel-muted mx-auto mt-4 max-w-xs text-sm">
                Tid ni kan lägga på att se matchen eller prata med besökarna
                istället för att räkna växel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
