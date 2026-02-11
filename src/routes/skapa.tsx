import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { ButiksinfoForm } from '../components/ButiksinfoForm'
import { ProdukterForm } from '../components/ProdukterForm'
import { authClient } from '../lib/authClient'
import {
  isDevMagicLinkEnabled,
  maybeOpenDevMagicLink,
} from '../lib/devMagicLink'
import { generateSwishLink } from '../lib/swish'
import type { ButiksinfoValues } from '../components/ButiksinfoForm'
import type { ProdukterDraft } from '../components/ProdukterForm'
import type { Id } from '../../convex/_generated/dataModel'

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export const Route = createFileRoute('/skapa')({
  head: () => ({
    meta: [
      {
        title: 'Skapa din butik – QRbutik',
      },
      {
        name: 'description',
        content:
          'Starta en digital kiosk på några minuter. Lägg in varor, få en QR-skylt och ta betalt med Swish direkt.',
      },
      {
        property: 'og:title',
        content: 'Skapa din butik – QRbutik',
      },
      {
        property: 'og:description',
        content:
          'Starta en digital kiosk på några minuter. Lägg in varor, få en QR-skylt och ta betalt med Swish direkt.',
      },
      {
        name: 'twitter:title',
        content: 'Skapa din butik – QRbutik',
      },
      {
        name: 'twitter:description',
        content:
          'Starta en digital kiosk på några minuter. Lägg in varor, få en QR-skylt och ta betalt med Swish direkt.',
      },
    ],
  }),
  component: CreateShopWizard,
})

type DraftProduct = ProdukterDraft

function CreateShopWizard() {
  const createShopWithProducts = useMutation(api.shops.createShopWithProducts)
  const createShopActivation = useMutation(api.shops.activateShop)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formState, setFormState] = useState<ButiksinfoValues>({
    name: '',
    ownerEmail: '',
    swishNumber: '',
    slug: '',
  })
  const [products, setProducts] = useState<Array<DraftProduct>>([
    { id: crypto.randomUUID(), name: '', price: '' },
  ])

  const updateProducts = (next: Array<DraftProduct>) => {
    setProducts(next)
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<string | null>(null)
  const [adminAuthStatus, setAdminAuthStatus] = useState<string | null>(null)
  const [createdShop, setCreatedShop] = useState<{
    shopId: string
    slug: string
  } | null>(null)
  const { data: session } = authClient.useSession()

  const slugCheck = useQuery(api.shops.checkSlug, {
    slug: formState.slug || formState.name,
  })

  const parsedProducts = useMemo(() => {
    return products.map((product) => {
      const normalizedPrice = product.price.replace(',', '.')
      return {
        name: product.name.trim(),
        price: Number.parseFloat(normalizedPrice),
      }
    })
  }, [products])

  const slugValue = formState.slug ?? ''
  const canContinueStep1 =
    formState.name.trim() !== '' &&
    formState.swishNumber.trim() !== '' &&
    formState.ownerEmail.trim() !== '' &&
    slugValue.trim() !== '' &&
    slugCheck?.isAvailable === true

  const canSubmitStep2 =
    parsedProducts.length > 0 &&
    parsedProducts.every(
      (product) =>
        product.name && Number.isFinite(product.price) && product.price > 0,
    )

  return (
    <main className="relaxed-page-shell min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Skapa din butik
          </h1>
          <p className="text-sm text-slate-600">
            Två enkla steg: butiksinfo och produkter.
          </p>
        </header>

        <section className="relaxed-surface p-8">
          <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
            <span>Steg {step} av 3</span>
            {step !== 3 ? (
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/'
                }}
                className="cursor-pointer text-slate-500 hover:text-slate-700"
                trackaton-on-click="create-back-home"
              >
                Till startsidan
              </button>
            ) : null}
          </div>

          {step === 1 ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                setError(null)
                if (!canContinueStep1) {
                  setError('Fyll i alla obligatoriska fält.')
                  return
                }
                setStep(2)
              }}
            >
              <ButiksinfoForm
                values={formState}
                onChange={setFormState}
                showSlug
                slugPrefix="qrbutik.se/s/"
                slugStatus={
                  (formState.slug || formState.name) && slugCheck
                    ? {
                        message: slugCheck.isAvailable
                          ? 'Adressen är tillgänglig!'
                          : `${slugCheck.slug} är redan upptagen, välj något annat.`,
                        tone: slugCheck.isAvailable ? 'success' : 'error',
                      }
                    : undefined
                }
                onSlugBlur={() => {
                  if (!formState.slug && formState.name) {
                    setFormState((prev) => ({
                      ...prev,
                      slug: slugify(formState.name),
                    }))
                  }
                }}
              />
              <button
                type="submit"
                className="relaxed-primary-button mt-2 h-12 cursor-pointer px-6 text-base font-semibold text-white"
                trackaton-on-click="create-step1-continue"
              >
                Fortsätt till produkter
              </button>

              <button
                type="button"
                disabled={!formState.ownerEmail.trim()}
                onClick={async () => {
                  const email = formState.ownerEmail.trim()
                  if (!email) {
                    setAuthStatus('Fyll i en e-postadress först.')
                    return
                  }
                  setAuthStatus('Skickar inloggningsmejl...')
                  await authClient.signIn.magicLink(
                    { email },
                    {
                      onSuccess: async () => {
                        setAuthStatus(
                          isDevMagicLinkEnabled()
                            ? 'Devmode: öppnar inloggningen direkt.'
                            : 'Inloggningsmejl skickat. Kolla inkorgen.',
                        )
                        await maybeOpenDevMagicLink(email)
                      },
                      onError: (ctx) =>
                        setAuthStatus(ctx.error.message || 'Något gick fel.'),
                    },
                  )
                }}
                className="relaxed-secondary-button h-12 cursor-pointer px-6 text-base font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                trackaton-on-click="create-send-magic-link"
              >
                Skicka inloggningsmejl
              </button>
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              {authStatus ? (
                <p className="text-sm text-slate-600">{authStatus}</p>
              ) : null}
            </form>
          ) : null}

          {step === 2 ? (
            <form
              className="flex flex-col gap-6"
              onSubmit={async (event) => {
                event.preventDefault()
                setError(null)
                if (!canSubmitStep2) {
                  setError(
                    'Lägg till minst en produkt med namn och pris större än 0.',
                  )
                  return
                }
                setIsSubmitting(true)
                try {
                  const result = await createShopWithProducts({
                    name: formState.name.trim(),
                    ownerEmail: formState.ownerEmail.trim(),
                    swishNumber: formState.swishNumber.trim(),
                    slug: slugValue.trim() || undefined,
                    products: parsedProducts,
                  })
                  setCreatedShop(result)
                  setStep(3)
                } catch (submitError) {
                  if (submitError instanceof Error) {
                    setError(submitError.message)
                  } else {
                    setError('Något gick fel. Försök igen.')
                  }
                } finally {
                  setIsSubmitting(false)
                }
              }}
            >
              <ProdukterForm
                products={products}
                onChange={updateProducts}
                helperText="Namn + pris, en rad per produkt."
                onAddRow={() =>
                  setProducts((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), name: '', price: '' },
                  ])
                }
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="relaxed-secondary-button h-12 cursor-pointer px-6 text-sm font-semibold text-slate-600"
                  trackaton-on-click="create-step2-back"
                >
                  Tillbaka
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relaxed-primary-button h-12 cursor-pointer px-7 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  trackaton-on-click="create-submit-shop"
                >
                  {isSubmitting ? 'Skapar butik...' : 'Skapa butik'}
                </button>
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </form>
          ) : null}

          {step === 3 && createdShop ? (
            <div className="flex flex-col gap-5 text-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                Din butik är redo
              </h2>
              <p className="text-sm text-slate-600">
                Välj en aktivering för att öppna butiken direkt.
              </p>
              <p className="text-xs text-slate-500">
                Betalningen markerar butiken som aktiv direkt, och vi bekräftar
                den manuellt.
              </p>

              <div className="relaxed-surface-soft bg-slate-50/70 px-5 py-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Butik</span>
                  <span className="font-semibold text-slate-900">
                    {formState.name}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Swish-mottagare</span>
                  <span className="font-semibold text-slate-900">
                    0735029113
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={async () => {
                    const result = await createShopActivation({
                      shopId: createdShop.shopId as Id<'shops'>,
                      plan: 'event',
                    })
                    const origin = window.location.origin
                    const callbackUrl = `${origin}/s/${createdShop.slug}/klart`

                    const link = generateSwishLink(
                      '0735029113',
                      result.amount,
                      result.message,
                      callbackUrl,
                    )
                    window.location.href = link
                    setTimeout(() => {
                      window.location.href = `/s/${createdShop.slug}/klart`
                    }, 2000)
                  }}
                  className="relaxed-primary-button h-12 cursor-pointer px-6 text-sm font-semibold text-white"
                  trackaton-on-click="create-activate-event"
                >
                  Aktivera event 10 kr
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await createShopActivation({
                      shopId: createdShop.shopId as Id<'shops'>,
                      plan: 'season',
                    })
                    const origin = window.location.origin
                    const callbackUrl = `${origin}/s/${createdShop.slug}/klart`

                    const link = generateSwishLink(
                      '0735029113',
                      result.amount,
                      result.message,
                      callbackUrl,
                    )
                    window.location.href = link
                    setTimeout(() => {
                      window.location.href = `/s/${createdShop.slug}/klart`
                    }, 2000)
                  }}
                  className="relaxed-secondary-button h-12 cursor-pointer px-6 text-sm font-semibold text-slate-700"
                  trackaton-on-click="create-activate-season"
                >
                  Aktivera säsong 99 kr
                </button>
              </div>

              {!session?.user.email ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const email = formState.ownerEmail.trim()
                      if (!email) {
                        setAdminAuthStatus('Fyll i en e-postadress först.')
                        return
                      }
                      setAdminAuthStatus('Skickar inloggningsmejl...')
                      await authClient.signIn.magicLink(
                        { email, callbackURL: '/admin' },
                        {
                          onSuccess: async () => {
                            setAdminAuthStatus(
                              isDevMagicLinkEnabled()
                                ? 'Devmode: öppnar inloggningen direkt.'
                                : 'Inloggningsmejl skickat. Kolla inkorgen.',
                            )
                            await maybeOpenDevMagicLink(email)
                          },
                          onError: (ctx) =>
                            setAdminAuthStatus(
                              ctx.error.message || 'Något gick fel.',
                            ),
                        },
                      )
                    }}
                    className="relaxed-secondary-button mx-auto h-12 cursor-pointer px-6 text-sm font-semibold text-slate-700"
                    trackaton-on-click="create-send-admin-link"
                  >
                    Skicka admininloggning via mejl
                  </button>
                  {adminAuthStatus ? (
                    <p className="text-sm text-slate-600">{adminAuthStatus}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
