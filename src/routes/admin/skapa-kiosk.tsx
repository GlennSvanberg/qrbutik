import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { ButiksinfoForm } from '../../components/ButiksinfoForm'
import { ProdukterForm } from '../../components/ProdukterForm'
import type { ButiksinfoValues } from '../../components/ButiksinfoForm'
import type { ProdukterDraft } from '../../components/ProdukterForm'
import type { Id } from '../../../convex/_generated/dataModel'

type SkapaKioskSearch = {
  organizationId?: string
}

export const Route = createFileRoute('/admin/skapa-kiosk')({
  validateSearch: (search: Record<string, unknown>): SkapaKioskSearch => ({
    organizationId:
      typeof search.organizationId === 'string'
        ? search.organizationId
        : undefined,
  }),
  component: CreateKioskPage,
})

function CreateKioskPage() {
  const navigate = useNavigate()
  const { organizationId: organizationIdFromSearch } = Route.useSearch()
  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )

  if (organizations.length === 0) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-2xl flex-col gap-4 p-8 text-center">
          <p className="text-sm text-slate-600">
            Du behöver en förening innan du kan skapa en kiosk.
          </p>
          <Link
            to="/skapa"
            className="relaxed-primary-button mx-auto inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
          >
            Skapa förening
          </Link>
        </div>
      </main>
    )
  }

  const initialOrgId =
    organizationIdFromSearch &&
    organizations.some((org) => org._id === organizationIdFromSearch)
      ? (organizationIdFromSearch as Id<'organizations'>)
      : organizations[0]._id

  return (
    <CreateKioskForm
      organizations={organizations}
      initialOrganizationId={initialOrgId}
      navigate={navigate}
    />
  )
}

function CreateKioskForm({
  organizations,
  initialOrganizationId,
  navigate,
}: {
  organizations: Array<{ _id: Id<'organizations'>; name: string }>
  initialOrganizationId: Id<'organizations'>
  navigate: ReturnType<typeof useNavigate>
}) {
  const createShop = useMutation(api.shops.createShopInOrganization)
  const [organizationId, setOrganizationId] =
    useState<Id<'organizations'>>(initialOrganizationId)
  const [kioskForm, setKioskForm] = useState<ButiksinfoValues>({
    name: '',
    swishNumber: '',
    slug: '',
  })
  const slugCheck = useQuery(api.shops.checkSlug, {
    slug: kioskForm.slug || kioskForm.name,
  })
  const [products, setProducts] = useState<Array<ProdukterDraft>>([
    { id: crypto.randomUUID(), name: '', price: '' },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parsedProducts = useMemo(() => {
    return products
      .map((product) => {
        const normalizedPrice = product.price.replace(',', '.')
        return {
          name: product.name.trim(),
          price: Number.parseFloat(normalizedPrice),
        }
      })
      .filter(
        (product) =>
          product.name.length > 0 &&
          Number.isFinite(product.price) &&
          product.price > 0,
      )
  }, [products])

  const canSubmit =
    kioskForm.name.trim().length > 0 &&
    kioskForm.swishNumber.trim().length > 0 &&
    parsedProducts.length > 0 &&
    (slugCheck?.isAvailable ?? true)

  const slugStatus =
    kioskForm.slug || kioskForm.name
      ? slugCheck?.isAvailable
        ? { message: 'Adressen är ledig.', tone: 'success' as const }
        : { message: 'Adressen är upptagen.', tone: 'error' as const }
      : undefined

  return (
    <main className="relaxed-page-shell min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Skapa kiosk</h1>
          <p className="mt-2 text-sm text-slate-600">
            Lägg till en ny kiosk i föreningen. Varje lag eller cup kan ha sin
            egen.
          </p>
        </header>

        <section className="relaxed-surface flex flex-col gap-6 p-8">
          {organizations.length > 1 ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Förening
              <select
                value={organizationId}
                onChange={(event) =>
                  setOrganizationId(event.target.value as Id<'organizations'>)
                }
                className="relaxed-input h-12 cursor-pointer px-4 text-base text-slate-900 outline-none"
              >
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <ButiksinfoForm
            values={kioskForm}
            onChange={setKioskForm}
            showSlug
            slugStatus={slugStatus}
          />
          <ProdukterForm
            products={products}
            onChange={setProducts}
            helperText="Lägg till minst en produkt."
          />

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-sm font-semibold text-slate-700"
            >
              Avbryt
            </Link>
            <button
              type="button"
              disabled={!canSubmit || isSubmitting}
              onClick={async () => {
                setError(null)
                setIsSubmitting(true)
                try {
                  const result = await createShop({
                    organizationId,
                    name: kioskForm.name.trim(),
                    swishNumber: kioskForm.swishNumber.trim(),
                    slug: kioskForm.slug?.trim() || undefined,
                    products: parsedProducts,
                  })
                  await navigate({
                    to: '/admin/$shopId',
                    params: { shopId: result.shopId },
                  })
                } catch (submitError) {
                  setError(
                    submitError instanceof Error
                      ? submitError.message
                      : 'Något gick fel. Försök igen.',
                  )
                } finally {
                  setIsSubmitting(false)
                }
              }}
              className="relaxed-primary-button h-12 cursor-pointer px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Skapar...' : 'Skapa kiosk'}
            </button>
          </div>
        </section>

        {error ? <p className="text-center text-sm text-rose-600">{error}</p> : null}
      </div>
    </main>
  )
}
