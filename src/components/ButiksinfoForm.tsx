export type ButiksinfoValues = {
  name: string
  ownerEmail: string
  swishNumber: string
  slug?: string
}

type SlugStatus = {
  message: string
  tone: 'success' | 'error'
}

type ButiksinfoFormProps = {
  values: ButiksinfoValues
  onChange: (values: ButiksinfoValues) => void
  showSlug?: boolean
  slugPrefix?: string
  slugStatus?: SlugStatus
  onSlugBlur?: () => void
}

export function ButiksinfoForm({
  values,
  onChange,
  showSlug = false,
  slugPrefix = 'qrbutik.se/s/',
  slugStatus,
  onSlugBlur,
}: ButiksinfoFormProps) {
  const update = (patch: Partial<ButiksinfoValues>) => {
    onChange({ ...values, ...patch })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Butiksnamn
        <input
          required
          className="relaxed-input h-12 px-4 text-base text-slate-900 outline-none"
          value={values.name}
          onChange={(event) => update({ name: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Swish-nummer
        <input
          required
          inputMode="numeric"
          className="relaxed-input h-12 px-4 text-base text-slate-900 outline-none"
          value={values.swishNumber}
          onChange={(event) => update({ swishNumber: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        E-post för admin
        <input
          required
          type="email"
          className="relaxed-input h-12 px-4 text-base text-slate-900 outline-none"
          value={values.ownerEmail}
          onChange={(event) => update({ ownerEmail: event.target.value })}
        />
      </label>
      {showSlug ? (
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Butikens webbadress (slug)
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-slate-400">
              {slugPrefix}
            </span>
            <input
              required
              placeholder="t.ex. kiosken-ovanaker"
              className="relaxed-input h-12 w-full pl-[108px] pr-4 text-base text-slate-900 outline-none"
              value={values.slug ?? ''}
              onChange={(event) => update({ slug: event.target.value })}
              onBlur={onSlugBlur}
            />
          </div>
          {slugStatus ? (
            <p
              className={`text-xs ${
                slugStatus.tone === 'success'
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {slugStatus.message}
            </p>
          ) : null}
        </label>
      ) : null}
    </div>
  )
}
