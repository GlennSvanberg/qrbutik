export type ProdukterDraft = {
  id: string
  name: string
  price: string
}

type ProdukterFormProps = {
  products: Array<ProdukterDraft>
  onChange: (products: Array<ProdukterDraft>) => void
  onAddRow?: () => void
  helperText?: string
}

export function ProdukterForm({
  products,
  onChange,
  onAddRow,
  helperText = 'Namn + pris, en rad per produkt.',
}: ProdukterFormProps) {
  const updateProduct = (id: string, patch: Partial<ProdukterDraft>) => {
    onChange(
      products.map((product) =>
        product.id === id ? { ...product, ...patch } : product,
      ),
    )
  }

  const removeProduct = (id: string) => {
    onChange(products.filter((product) => product.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Produkter</h2>
        <p className="text-xs text-slate-500">{helperText}</p>
      </div>

      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1.4fr_0.6fr_auto]"
          >
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Produktnamn
              <input
                required
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                value={product.name}
                onChange={(event) =>
                  updateProduct(product.id, { name: event.target.value })
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Pris (SEK)
              <input
                required
                inputMode="decimal"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                value={product.price}
                onChange={(event) =>
                  updateProduct(product.id, { price: event.target.value })
                }
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700"
                trackaton-on-click="product-remove-row"
              >
                Ta bort
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddRow}
        className="h-12 cursor-pointer rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-6 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100"
        trackaton-on-click="product-add-row"
      >
        Lägg till en ny rad
      </button>
    </div>
  )
}
