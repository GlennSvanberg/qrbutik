import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { AdminBottomNav } from '../../../components/AdminBottomNav'
import { AdminHeader } from '../../../components/AdminHeader'
import { ProdukterForm } from '../../../components/ProdukterForm'
import { authClient } from '../../../lib/authClient'
import {
  isDevMagicLinkEnabled,
  maybeOpenDevMagicLink,
} from '../../../lib/devMagicLink'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/products')({
  component: ProductsPage,
})

type DraftProduct = {
  id: string
  name: string
  price: string
}

function ProductsPage() {
  const { data: session, isPending, error } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  if (isPending) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Laddar adminpanelen...
          </h1>
          <p className="text-sm text-slate-600">Kontrollerar din session.</p>
        </div>
      </main>
    )
  }

  if (!session?.user.email) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              QRButik.se
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Logga in till adminpanelen
            </h1>
            <p className="text-sm text-slate-600">
              Vi skickar en magic link till din e-postadress.
            </p>
          </header>

          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault()
              setStatusMessage(null)
              const trimmedEmail = email.trim()
              if (!trimmedEmail) {
                setStatusMessage('Fyll i en e-postadress.')
                return
              }
              setStatusMessage('Skickar inloggningslänk...')
              await authClient.signIn.magicLink(
                { email: trimmedEmail, callbackURL: '/admin' },
                {
                  onSuccess: async () => {
                    setStatusMessage(
                      isDevMagicLinkEnabled()
                        ? 'Devmode: öppnar magic link direkt.'
                        : 'Magic link skickad. Kolla inkorgen.',
                    )
                    await maybeOpenDevMagicLink(trimmedEmail)
                  },
                  onError: (ctx) =>
                    setStatusMessage(ctx.error.message || 'Något gick fel.'),
                },
              )
            }}
          >
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              E-post
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
            <button
              type="submit"
              className="h-12 cursor-pointer rounded-xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Skicka magic link
            </button>
          </form>

          {statusMessage ? (
            <p className="text-sm text-slate-600">{statusMessage}</p>
          ) : null}
          {error ? (
            <p className="text-sm text-rose-600">{error.message}</p>
          ) : null}
        </div>
      </main>
    )
  }

  return <ProductsContent email={session.user.email} />
}

function ProductsContent({ email }: { email: string }) {
  const { shopId } = Route.useParams()
  if (!shopId) {
    return null
  }
  const shopIdParam = shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.listByShop, { shopId: shopIdParam }),
  )
  const addProduct = useMutation(api.products.addProduct)
  const updateProduct = useMutation(api.products.updateProduct)
  const deleteProduct = useMutation(api.products.deleteProduct)

  const [productDrafts, setProductDrafts] = useState<Array<DraftProduct>>([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '' })
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  void statusMessage

  const updateProductDrafts = (next: Array<DraftProduct>) => {
    setProductDrafts(next)
  }

  useEffect(() => {
    setProductDrafts(
      products.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price.toString(),
      })),
    )
  }, [products])

  const parsedNewProduct = useMemo(() => {
    const normalizedPrice = newProduct.price.replace(',', '.')
    return {
      name: newProduct.name.trim(),
      price: Number.parseFloat(normalizedPrice),
    }
  }, [newProduct])

  if (!shop) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Butiken hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Kontrollera länken eller gå tillbaka till adminpanelen.
          </p>
          <Link
            to="/admin"
            className="mx-auto w-fit cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    )
  }

  if (shop.ownerEmail !== email) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Du har inte behörighet
          </h1>
          <p className="text-sm text-slate-600">
            Den här butiken är inte kopplad till din e-postadress.
          </p>
          <Link
            to="/admin"
            className="mx-auto w-fit cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-28 pt-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <AdminHeader
          ownerEmail={email}
          shopId={shop._id}
          section="products"
          shopName={shop.name}
        />
        <header className="flex flex-col gap-2 text-left">
          <p className="text-sm text-slate-600">
            {shop.name} · <span className="font-medium">/s/{shop.slug}</span>
          </p>
          <Link
            to="/s/$shopSlug"
            params={{ shopSlug: shop.slug }}
            className="w-fit cursor-pointer text-sm font-semibold text-indigo-700 hover:text-indigo-600"
          >
            Öppna butiken
          </Link>
        </header>

        <section className="flex flex-col gap-6 border-t border-slate-200 pt-6">
          <ProdukterForm
            products={productDrafts}
            onChange={updateProductDrafts}
            helperText="Snabbt och enkelt: namn + pris."
            onAddRow={() =>
              setProductDrafts((prev) => [
                ...prev,
                { id: crypto.randomUUID(), name: '', price: '' },
              ])
            }
          />

          <div className="divide-y divide-slate-200/70">
            {productDrafts.map((product) => (
              <div key={product.id} className="grid gap-3 py-4 sm:grid-cols-2">
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={async () => {
                      setError(null)
                      setStatusMessage(null)
                      const normalizedPrice = product.price.replace(',', '.')
                      const price = Number.parseFloat(normalizedPrice)
                      if (!product.name.trim() || !Number.isFinite(price)) {
                        setError('Ange ett namn och ett giltigt pris.')
                        return
                      }
                      try {
                        await updateProduct({
                          productId: product.id as Id<'products'>,
                          name: product.name.trim(),
                          price,
                        })
                        setStatusMessage('Produkt uppdaterad.')
                      } catch (updateError) {
                        if (updateError instanceof Error) {
                          setError(updateError.message)
                        } else {
                          setError('Något gick fel. Försök igen.')
                        }
                      }
                    }}
                    className="h-11 w-full cursor-pointer rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                  >
                    Spara
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={async () => {
                      setError(null)
                      setStatusMessage(null)
                      try {
                        await deleteProduct({
                          productId: product.id as Id<'products'>,
                        })
                        setProductDrafts((prev) =>
                          prev.filter((item) => item.id !== product.id),
                        )
                        setStatusMessage('Produkt borttagen.')
                      } catch (deleteError) {
                        if (deleteError instanceof Error) {
                          setError(deleteError.message)
                        } else {
                          setError('Något gick fel. Försök igen.')
                        }
                      }
                    }}
                    className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:border-slate-300"
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1.4fr_0.6fr_auto]">
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Ny produkt
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                value={newProduct.name}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Pris (SEK)
              <input
                inputMode="decimal"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
                value={newProduct.price}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    price: event.target.value,
                  }))
                }
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={async () => {
                  setError(null)
                  setStatusMessage(null)
                  if (
                    !parsedNewProduct.name ||
                    !Number.isFinite(parsedNewProduct.price) ||
                    parsedNewProduct.price <= 0
                  ) {
                    setError('Ange ett namn och ett giltigt pris.')
                    return
                  }
                  try {
                    const productId = await addProduct({
                      shopId: shop._id,
                      name: parsedNewProduct.name,
                      price: parsedNewProduct.price,
                    })
                    setProductDrafts((prev) => [
                      ...prev,
                      {
                        id: productId,
                        name: parsedNewProduct.name,
                        price: parsedNewProduct.price.toString(),
                      },
                    ])
                    setNewProduct({ name: '', price: '' })
                    setStatusMessage('Produkt tillagd.')
                  } catch (addError) {
                    if (addError instanceof Error) {
                      setError(addError.message)
                    } else {
                      setError('Något gick fel. Försök igen.')
                    }
                  }
                }}
                className="h-11 cursor-pointer rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Lägg till
              </button>
            </div>
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
