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
    <div className="relative overflow-hidden rounded-xl border border-[#2D3E50] bg-[#1C2B39] p-8 text-white shadow-lg sm:p-12">
      <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-64 w-64 rounded-full bg-brand/20 opacity-40 blur-3xl" />

      <div className="relative z-10">
        <h2 className="mb-2 text-2xl font-bold">{title}</h2>
        <p className="mb-8 text-[#94A3B8]">{subtitle}</p>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-8">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
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
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#2D3E50] accent-brand outline-none ring-offset-2 focus:ring-2 focus:ring-brand"
                trackaton-on-click="adjust-customers"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#2D3E50]/60 p-4">
                <div className="mb-1 text-xs uppercase tracking-wider text-[#94A3B8]">
                  Traditionellt
                </div>
                <div className="text-xl font-semibold opacity-70">
                  ~{Math.round((customers * 60) / 60)} min
                </div>
                <div className="text-xs text-[#94A3B8]">kötid</div>
              </div>
              <div className="rounded-lg border border-brand bg-brand/10 p-4">
                <div className="mb-1 text-xs uppercase tracking-wider text-brand">
                  Med QRButik
                </div>
                <div className="text-2xl font-bold text-white">
                  ~{Math.round((customers * 15) / 60)} min
                </div>
                <div className="text-xs text-[#94A3B8]">kötid</div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center border-t border-[#2D3E50] pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="text-center">
              <div className="mb-2 text-6xl font-bold text-success">
                {totalSavedMinutes} min
              </div>
              <div className="text-lg text-[#94A3B8]">sparad tid totalt</div>
              <p className="mx-auto mt-4 max-w-xs text-sm text-[#94A3B8]">
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
