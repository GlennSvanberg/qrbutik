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
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        Butiksnamn
        <input
          required
          className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
          value={values.name}
          onChange={(event) => update({ name: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        Swish-nummer
        <input
          required
          inputMode="numeric"
          className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
          value={values.swishNumber}
          onChange={(event) => update({ swishNumber: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        E-post för admin
        <input
          required
          type="email"
          className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
          value={values.ownerEmail}
          onChange={(event) => update({ ownerEmail: event.target.value })}
        />
      </label>
      {showSlug ? (
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Butikens webbadress (slug)
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 select-none">
              {slugPrefix}
            </span>
            <input
              required
              placeholder="t.ex. kiosken-ovanaker"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-[108px] pr-4 text-base text-slate-900 outline-none focus:border-indigo-500"
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
