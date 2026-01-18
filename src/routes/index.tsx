import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.12),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-50" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-14 sm:pt-20">
          <div className="flex flex-col gap-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              QRButik.se
            </p>
            <h1 className="text-pretty text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Sälj med Swish — utan krångel
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
              Skapa en digital kiosk på 2 minuter. Kunderna scannar, väljer
              varor och betalar direkt. Perfekt för matchen, loppisen och
              föreningskiosken.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                to="/skapa"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Skapa din Swish-kiosk — 10 kr
              </Link>
              <Link
                to="/admin"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
              >
                Logga in till admin
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.25em] text-slate-500">
              <span>2 minuter</span>
              <span>Ingen app</span>
              <span>Swish direkt</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.48fr_0.52fr]">
            <div className="flex flex-col justify-center gap-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Före och efter
                </p>
                <h2 className="text-pretty text-3xl font-semibold text-slate-900">
                  Byt handskrivet mot en kiosk som säljer sig själv.
                </h2>
              </div>
              <p className="text-base text-slate-600">
                Visa en snygg digital meny på mobilen och låt kunderna betala
                direkt med Swish. Inget kluddande, inga fel i kassan.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                  <span>Före</span>
                  <span>Handskrivet</span>
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/before.jpg"
                    alt="Handskriven prislista"
                    className="h-56 w-full object-cover sm:h-64"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                  <span>Efter</span>
                  <span>Digital meny</span>
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/after.jpg"
                    alt="Digital kiosk med meny"
                    className="h-56 w-full object-cover sm:h-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-16">
        {/* Problem vs Solution */}
        <section className="grid gap-12 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Vanliga problem
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Låt kön rulla, inte huvudräkningen.
            </h2>
            <ul className="space-y-4 text-base text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                  ✗
                </span>
                <span>Räkna ihop totalsumman i huvudet mitt i kön</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                  ✗
                </span>
                <span>Stava Swish-numret högt om och om igen</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                  ✗
                </span>
                <span>Svårt att veta vad som faktiskt sålts efteråt</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                  ✗
                </span>
                <span>Långa köer pga långsam hantering</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Med QRButik
            </p>
            <h3 className="text-pretty text-2xl font-semibold text-slate-900">
              Klar struktur, trygg försäljning.
            </h3>
            <ul className="space-y-4 text-base text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                  ✓
                </span>
                <span>Inbyggd varukorg räknar automatiskt ut summan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                  ✓
                </span>
                <span>Swish öppnas med rätt belopp och nummer direkt</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                  ✓
                </span>
                <span>Färdig säljrapport till kassören med ett klick</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                  ✓
                </span>
                <span>Halvera kötiden med snabbare betalflöde</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="flex flex-col gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Fördelar
            </p>
            <h2 className="mt-4 text-pretty text-3xl font-semibold text-slate-900">
              Allt som behövs för en modern kiosk.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Snabbare kö
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Ingen mer huvudräkning. Kunden gör jobbet medan de köar.
                </p>
              </div>
            </div>

            <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Ingen huvudräkning
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Systemet räknar ut summan automatiskt. Inga felräkningar.
                </p>
              </div>
            </div>

            <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Enkel avstämning
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Färdig rapport direkt i mobilen när dagen är slut.
                </p>
              </div>
            </div>

            <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Tydlig överblick
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Se exakt vad som säljs i realtid. Full koll på lagret.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Time Savings Calculator */}
        <TimeSavingsCalculator />

        {/* Features - Keeping some from before but simplified */}
        <section className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Funktioner
            </p>
            <h2 className="mt-4 text-pretty text-3xl font-semibold text-slate-900">
              Verktygen som gör det enkelt.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M14 4v4h4" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Automatisk QR-skylt
              </h3>
              <p className="text-sm text-slate-600">
                Vi genererar en proffsig QR-skylt som du kan skriva ut eller
                visa på en iPad.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M6 12l4 4 8-8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Admin-vy i realtid
              </h3>
              <p className="text-sm text-slate-600">
                Se inkommande köp direkt. Verifiera mot kundens skärm för extra
                trygghet.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Priser
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Inga abonnemang. Betala bara när ni säljer.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Event-pass
                </p>
                <p className="text-4xl font-semibold text-slate-900">10 kr</p>
              </div>
              <p className="text-sm text-slate-600">
                Gäller i 48 timmar. Perfekt för helgens matcher eller loppis.
              </p>
              <Link
                to="/skapa"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Starta event-pass
              </Link>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Säsongs-pass
                </p>
                <p className="text-4xl font-semibold text-slate-900">99 kr</p>
              </div>
              <p className="text-sm text-slate-600">
                Gäller hela terminen (6 månader). Obegränsade ändringar.
              </p>
              <Link
                to="/skapa"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Starta säsong
              </Link>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Ingen inloggning krävs för att börja. Ingen app att ladda ner.
          </p>
        </section>

        {/* Testimonial */}
        <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <blockquote className="flex flex-col gap-4">
            <p className="text-pretty text-xl font-semibold text-slate-900">
              “Vår kassör älskar säljrapporten! Sparar oss timmar av pusslande
              på söndagskvällen.”
            </p>
            <footer className="text-sm text-slate-500">
              — Lagledare, P12 Fotboll
            </footer>
          </blockquote>
        </section>

        <footer className="flex flex-col items-center gap-6 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p className="text-slate-600">
            QRButik.se — Gjort för föreningslivet i Sverige.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/kontakt" className="cursor-pointer hover:text-slate-900">
              Kontakt
            </a>
            <a href="/support" className="cursor-pointer hover:text-slate-900">
              Support
            </a>
            <a href="/villkor" className="cursor-pointer hover:text-slate-900">
              Villkor
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}

function TimeSavingsCalculator() {
  const [customers, setCustomers] = useState(100)
  const timeSavedPerCustomer = 45 // seconds
  const totalSavedMinutes = Math.round((customers * timeSavedPerCustomer) / 60)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-indigo-900 p-8 text-white shadow-xl sm:p-12">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-800 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>

      <div className="relative z-10">
        <h2 className="mb-2 text-2xl font-semibold">
          Hur mycket tid kan ni spara?
        </h2>
        <p className="mb-8 text-indigo-200">
          Dra i reglaget för att se hur mycket snabbare det går med QRButik.
        </p>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-8">
            {/* Slider and Text */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-indigo-300">
                  Antal kunder
                </label>
                <span className="text-2xl font-bold">{customers} st</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={customers}
                onChange={(e) => setCustomers(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-indigo-700 accent-white outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-indigo-800/50 p-4 backdrop-blur-sm">
                <div className="mb-1 text-xs uppercase tracking-wider text-indigo-300">
                  Traditionellt
                </div>
                <div className="text-xl font-semibold opacity-70">
                  ~{Math.round((customers * 60) / 60)} min
                </div>
                <div className="text-xs text-indigo-400">kötid</div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <div className="mb-1 text-xs uppercase tracking-wider text-indigo-100">
                  Med QRButik
                </div>
                <div className="text-2xl font-bold text-white">
                  ~{Math.round((customers * 15) / 60)} min
                </div>
                <div className="text-xs text-indigo-200">kötid</div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center border-t border-indigo-800 pt-8 lg:border-t-0 lg:border-l lg:pt-0">
            <div className="text-center">
              <div className="mb-2 text-6xl font-bold text-emerald-400">
                {totalSavedMinutes} min
              </div>
              <div className="text-lg text-indigo-100">sparad tid totalt</div>
              <p className="mx-auto mt-4 max-w-xs text-sm text-indigo-300">
                Tid ni kan lägga på att se matchen eller prata med besökarna
                istället för att räkna växel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
