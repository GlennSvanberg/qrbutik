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

  const addRow = () => {
    onChange([
      ...products,
      { id: crypto.randomUUID(), name: '', price: '' },
    ])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-brand-foreground">Produkter</h2>
        <p className="text-xs text-brand-muted">{helperText}</p>
      </div>

      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="relaxed-surface-soft grid gap-3 p-4 odd:rotate-[-0.15deg] even:rotate-[0.15deg] sm:grid-cols-[1.4fr_0.6fr_auto]"
          >
            <label className="flex flex-col gap-2 text-sm text-brand-muted">
              Produktnamn
              <input
                required
                className="relaxed-input h-12 px-4 text-sm text-brand-foreground outline-none"
                value={product.name}
                onChange={(event) =>
                  updateProduct(product.id, { name: event.target.value })
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-brand-muted">
              Pris (SEK)
              <input
                required
                inputMode="decimal"
                className="relaxed-input h-12 px-4 text-sm text-brand-foreground outline-none"
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
                className="relaxed-secondary-button h-12 cursor-pointer px-4 text-sm font-semibold text-brand-muted"
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
        onClick={onAddRow ?? addRow}
        className="relaxed-secondary-button h-12 cursor-pointer border-dashed px-6 text-sm font-semibold text-brand-muted"
        trackaton-on-click="product-add-row"
      >
        Lägg till en ny rad
      </button>
    </div>
  )
}
