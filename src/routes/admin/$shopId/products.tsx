import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { AdminBottomNav } from '../../../components/AdminBottomNav'
import { AdminHeader } from '../../../components/AdminHeader'
import { ProdukterForm } from '../../../components/ProdukterForm'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/products')({
  component: ProductsPage,
})

type DraftProduct = {
  id: string
  name: string
  price: string
  isNew?: boolean
}

function ProductsPage() {
  const { shopId } = Route.useParams()
  const shopIdParam = shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.listByShop, { shopId: shopIdParam }),
  )
  const addProduct = useMutation(api.products.addProduct)
  const updateProduct = useMutation(api.products.updateProduct)

  const [productDrafts, setProductDrafts] = useState<Array<DraftProduct>>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setProductDrafts(
      products.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price.toString(),
        isNew: false,
      })),
    )
  }, [products])

  const parsedProducts = useMemo(
    () =>
      productDrafts.map((product) => {
        const normalizedPrice = product.price.replace(',', '.')
        return {
          id: product.id,
          name: product.name.trim(),
          price: Number.parseFloat(normalizedPrice),
        }
      }),
    [productDrafts],
  )

  const canSubmit = useMemo(
    () =>
      parsedProducts.length > 0 &&
      parsedProducts.every(
        (product) =>
          product.name.length > 0 &&
          Number.isFinite(product.price) &&
          product.price > 0,
      ),
    [parsedProducts],
  )

  const addRow = () => {
    setProductDrafts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', price: '', isNew: true },
    ])
  }

  if (!shop) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-2xl flex-col gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Kiosken hittades inte
          </h1>
          <Link
            to="/admin"
            className="relaxed-primary-button mx-auto w-fit cursor-pointer px-5 py-3 text-sm font-semibold text-white"
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent px-6 pb-28 pt-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <AdminHeader
          organizationId={shop.organizationId}
          shopId={shop._id}
          section="products"
          shopName={shop.name}
        />
        <section className="relaxed-divider flex flex-col gap-6 border-t pt-6">
          <ProdukterForm
            products={productDrafts}
            onChange={setProductDrafts}
            helperText="Snabbt och enkelt: namn + pris."
            onAddRow={addRow}
          />

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={async () => {
                setError(null)
                setStatusMessage(null)
                if (!canSubmit) {
                  setError('Lägg till minst en produkt med giltigt pris.')
                  return
                }
                try {
                  const pendingProducts = parsedProducts.filter(
                    (product) => product.name.length > 0,
                  )
                  const createdProducts = await Promise.all(
                    pendingProducts.map(async (product) => {
                      if (products.some((item) => item._id === product.id)) {
                        await updateProduct({
                          productId: product.id as Id<'products'>,
                          name: product.name,
                          price: product.price,
                        })
                        return { ...product, isNew: false }
                      }
                      const productId = await addProduct({
                        shopId: shop._id,
                        name: product.name,
                        price: product.price,
                      })
                      return { ...product, id: productId, isNew: false }
                    }),
                  )
                  setProductDrafts(
                    createdProducts.map((product) => ({
                      id: product.id,
                      name: product.name,
                      price: product.price.toString(),
                      isNew: false,
                    })),
                  )
                  setStatusMessage('Produkter sparade.')
                } catch (saveError) {
                  setError(
                    saveError instanceof Error
                      ? saveError.message
                      : 'Något gick fel. Försök igen.',
                  )
                }
              }}
              className="relaxed-primary-button h-12 cursor-pointer px-7 text-sm font-semibold text-white"
            >
              Spara ändringar
            </button>
          </div>
        </section>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {statusMessage ? (
          <p className="text-sm text-slate-600">{statusMessage}</p>
        ) : null}
      </div>
      <AdminBottomNav shopId={shop._id} active="products" />
    </main>
  )
}
