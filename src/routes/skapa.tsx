import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { AuthGate } from '../components/auth/AuthGate'
import { authClient } from '../lib/authClient'

export const Route = createFileRoute('/skapa')({
  head: () => ({
    meta: [
      {
        title: 'Skapa förening – QRButik',
      },
      {
        name: 'description',
        content:
          'Skapa din idrottsförening. 14 dagars provperiod utan betalning — kiosker lägger du till i admin efteråt.',
      },
    ],
  }),
  component: CreateOrganizationPage,
})

type OrgFormState = {
  organizationName: string
  orgNumber: string
  billingEmail: string
}

function CreateOrganizationPage() {
  return (
    <AuthGate
      title="Logga in för att skapa förening"
      description="Skapa konto via e-post innan du registrerar föreningen."
    >
      <CreateOrganizationContent />
    </AuthGate>
  )
}

function CreateOrganizationContent() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const createOrganization = useMutation(api.organizations.createOrganization)
  const [orgForm, setOrgForm] = useState<OrgFormState>({
    organizationName: '',
    orgNumber: '',
    billingEmail: session?.user.email ?? '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    orgForm.organizationName.trim().length > 0 &&
    orgForm.billingEmail.trim().includes('@')

  return (
    <main className="relaxed-page-shell min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Skapa förening
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            För idrottsföreningar och cuper — inte privat loppis.
          </p>
        </header>

        <section className="relaxed-surface flex flex-col gap-4 p-8">
          <div className="rounded-xl border border-brand-border bg-brand-surface/50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Klubblicens — 995 kr/mån</p>
            <p className="mt-1 text-slate-600">
              14 dagars gratis provperiod. Ingen betalning nu — du lägger till
              kiosker i admin när föreningen är skapad.
            </p>
          </div>

          <h2 className="text-lg font-semibold text-slate-900">Föreningsuppgifter</h2>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Föreningsnamn
            <input
              required
              className="relaxed-input h-12 px-4 text-base text-slate-900 outline-none"
              value={orgForm.organizationName}
              onChange={(event) =>
                setOrgForm((prev) => ({
                  ...prev,
                  organizationName: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Organisationsnummer (valfritt)
            <input
              className="relaxed-input h-12 px-4 text-base text-slate-900 outline-none"
              value={orgForm.orgNumber}
              onChange={(event) =>
                setOrgForm((prev) => ({
                  ...prev,
                  orgNumber: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Faktura-e-post
            <input
              required
              type="email"
              className="relaxed-input h-12 px-4 text-base text-slate-900 outline-none"
              value={orgForm.billingEmail}
              onChange={(event) =>
                setOrgForm((prev) => ({
                  ...prev,
                  billingEmail: event.target.value,
                }))
              }
            />
          </label>
          <p className="text-xs text-slate-500">
            QRButik riktar sig till föreningar och cuparrangörer. Privatpersoner
            som säljer på loppis passar bättre med andra lösningar.
          </p>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={async () => {
              setError(null)
              setIsSubmitting(true)
              try {
                await createOrganization({
                  organizationName: orgForm.organizationName.trim(),
                  orgNumber: orgForm.orgNumber.trim() || undefined,
                  billingEmail: orgForm.billingEmail.trim(),
                })
                await navigate({ to: '/admin' })
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
            className="relaxed-primary-button mt-2 h-12 cursor-pointer px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Skapar...' : 'Skapa förening'}
          </button>
        </section>

        {error ? <p className="text-center text-sm text-rose-600">{error}</p> : null}
      </div>
    </main>
  )
}
