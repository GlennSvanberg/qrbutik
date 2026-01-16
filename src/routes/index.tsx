import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { authClient } from '../lib/authClient'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const createShop = useMutation(api.shops.createShop)
  const [formState, setFormState] = useState({
    name: '',
    ownerEmail: '',
    swishNumber: '',
    slug: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdSlug, setCreatedSlug] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<string | null>(null)

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <header className="flex flex-col gap-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            QRButik.se
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Kiosken på burk för svenska föreningar.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            Skapa en mobil butik på två minuter. Dela en QR-kod, ta betalt med
            Swish och följ försäljningen i realtid.
          </p>
        </header>

        <section className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Skapa din butik
            </h2>
            <p className="text-sm text-slate-600">
              Välj ett namn, ett Swish-nummer och en unik slug för din butik.
              Butiken hamnar under <span className="font-medium">/s/</span> för
              att hålla övriga sidor rena.
            </p>
            <form
              className="flex flex-col gap-4"
              onSubmit={async (event) => {
                event.preventDefault()
                setError(null)
                setCreatedSlug(null)
                setIsSubmitting(true)
                try {
                  const result = await createShop({
                    name: formState.name.trim(),
                    ownerEmail: formState.ownerEmail.trim(),
                    swishNumber: formState.swishNumber.trim(),
                    slug: formState.slug.trim() || undefined,
                  })
                  setCreatedSlug(result.slug)
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
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Butiksnamn
                <input
                  required
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Swish-nummer
                <input
                  required
                  inputMode="numeric"
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                  value={formState.swishNumber}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      swishNumber: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                E-post för admin
                <input
                  required
                  type="email"
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                  value={formState.ownerEmail}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      ownerEmail: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Önskad slug (valfritt)
                <input
                  placeholder="t.ex. kiosken-ovanaker"
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
                  value={formState.slug}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      slug: event.target.value,
                    }))
                  }
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-12 rounded-xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {isSubmitting ? 'Skapar butik...' : 'Skapa butik'}
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
                  setAuthStatus('Skickar magic link...')
                  await authClient.signIn.magicLink(
                    { email },
                    {
                      onSuccess: () =>
                        setAuthStatus('Magic link skickad. Kolla inkorgen.'),
                      onError: (ctx) =>
                        setAuthStatus(ctx.error.message ?? 'Något gick fel.'),
                    },
                  )
                }}
                className="h-12 rounded-xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Skicka testlänk
              </button>
              {error ? (
                <p className="text-sm text-rose-600">{error}</p>
              ) : null}
              {authStatus ? (
                <p className="text-sm text-slate-600">{authStatus}</p>
              ) : null}
              {createdSlug ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <p>Butiken är skapad!</p>
                  <Link
                    to="/s/$shopSlug"
                    params={{ shopSlug: createdSlug }}
                    className="font-semibold underline underline-offset-4"
                  >
                    Öppna butiken
                  </Link>
                </div>
              ) : null}
            </form>
          </div>
          <div className="flex flex-col gap-6 rounded-2xl bg-slate-50 p-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Vad händer nu?
              </p>
              <p className="text-base text-slate-700">
                När butiken är skapad kan du lägga till produkter, skapa en
                QR-skylt och dela länken med besökare.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">1.</span> Dela
                länken eller QR-koden.
              </p>
              <p>
                <span className="font-semibold text-slate-800">2.</span> Kunden
                väljer varor på mobilen.
              </p>
              <p>
                <span className="font-semibold text-slate-800">3.</span> Swish
                öppnas med rätt belopp.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
