import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useMemo, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { generateSwishLink } from '../../../lib/swish'

export const Route = createFileRoute('/s/$shopSlug/')({
  component: ShopView,
})

type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

function ShopView() {
  const { shopSlug } = Route.useParams()
  const navigate = useNavigate()
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopBySlug, { slug: shopSlug }),
  )

  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.listByShop, {
      shopId: (shop?._id ?? '') as any,
    }),
  )

  const createTransaction = useMutation(api.transactions.create)

  const [cart, setCart] = useState<Record<string, CartItem | undefined>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cartItems = useMemo(
    () => Object.values(cart).filter((item): item is CartItem => !!item),
    [cart],
  )
  const totalPrice = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems],
  )

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev[product._id]
      if (existing) {
        return {
          ...prev,
          [product._id]: { ...existing, quantity: existing.quantity + 1 },
        }
      }
      return {
        ...prev,
        [product._id]: {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev[productId]
      if (!existing) return prev
      if (existing.quantity === 1) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: existing.quantity - 1 },
      }
    })
  }

  const handlePay = async () => {
    if (totalPrice === 0 || !shop) return

    setIsSubmitting(true)
    try {
      const timestamp = Date.now().toString(36).toUpperCase().slice(-6)
      const reference = `QRB-${shop.name.substring(0, 10).toUpperCase()}-${timestamp}`

      const swishMessage = [
        shop.name,
        ...cartItems.map((item) => `${item.name} x${item.quantity}`),
      ].join('\n')

      const transactionId = await createTransaction({
        shopId: shop._id,
        amount: totalPrice,
        reference,
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      })
      const origin = window.location.origin
      const callbackUrl = `${origin}/tack/${transactionId}`

      const swishLink = generateSwishLink(
        shop.swishNumber,
        totalPrice,
        swishMessage,
        callbackUrl,
      )

      window.location.href = swishLink

      setTimeout(() => {
        navigate({
          to: '/tack/$transactionId',
          params: { transactionId },
        })
      }, 3000)
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Något gick fel vid skapandet av betalningen. Försök igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shop) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Butiken hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Kontrollera länken eller skapa en ny butik.
          </p>
          <Link
            to="/"
            className="mx-auto w-fit rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
            trackaton-on-click="shop-back-home"
          >
            Till startsidan
          </Link>
        </div>
      </main>
    )
  }

  if (shop.activationStatus !== 'active' || shop.activeUntil <= Date.now()) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Butiken ar inaktiv
          </h1>
          <p className="text-sm text-slate-600">
            Butiken behover aktiveras igen for att kunna ta emot kop.
          </p>
          <p className="text-sm text-slate-500">
            Oppna adminpanelen och valj en ny aktivering.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{shop.name}</h1>
          <p className="text-sm text-slate-500">
            Valj varor nedan och betala smidigt med Swish.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-slate-800 px-2">
            Produkter
          </h2>
          <div className="flex flex-col gap-3">
            {products.map((product) => {
              const quantity = cart[product._id]?.quantity || 0
              return (
                <div
                  key={product._id}
                  className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-slate-900">
                      {product.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500">
                      {product.price} kr
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {quantity > 0 && (
                      <>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
                          trackaton-on-click="shop-remove-from-cart"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        <span className="w-4 text-center font-bold text-slate-900">
                          {quantity}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => addToCart(product)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 transition-colors hover:bg-indigo-100 active:scale-95"
                      trackaton-on-click="shop-add-to-cart"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}

            {products.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
                Inga produkter tillgangliga just nu.
              </div>
            )}
          </div>
        </section>
      </div>

      {totalPrice > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 p-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-slate-500 font-medium">
                Totalt att betala:
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {totalPrice} kr
              </span>
            </div>
            <button
              onClick={handlePay}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-700 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              trackaton-on-click="shop-pay-swish"
            >
              {isSubmitting ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                    <path
                      d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
                      fill="white"
                      fillOpacity="0.2"
                    />
                    <path
                      d="M24 33C28.9706 33 33 28.9706 33 24C33 19.0294 28.9706 15 24 15C19.0294 15 15 19.0294 15 24C15 28.9706 19.0294 33 24 33Z"
                      fill="white"
                    />
                  </svg>
                  Betala med Swish
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
