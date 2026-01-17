import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
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
            <p className="text-pretty text-base text-slate-600 sm:text-lg">
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
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.25em] text-slate-500">
              <span>2 minuter</span>
              <span>Ingen app</span>
              <span>Swish direkt</span>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[0.48fr_0.52fr]">
            <div className="flex flex-col justify-center gap-3 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Före och efter
              </p>
              <h2 className="text-pretty text-3xl font-semibold text-slate-900">
                Byt handskrivet mot en kiosk som säljer sig själv.
              </h2>
              <p className="text-sm text-slate-600">
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
        <section className="grid gap-12 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Vanliga problem
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Låt kön rulla, inte huvudräkningen.
            </h2>
            <ul className="space-y-3 text-base text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg font-semibold text-slate-400">
                  ✗
                </span>
                <span>Räkna ihop totalsumman i huvudet mitt i kön</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg font-semibold text-slate-400">
                  ✗
                </span>
                <span>Stava Swish-numret högt om och om igen</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg font-semibold text-slate-400">
                  ✗
                </span>
                <span>Svårt att veta vad som faktiskt sålts efteråt</span>
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
            <ul className="space-y-3 text-base text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg font-semibold text-indigo-600">
                  ✓
                </span>
                <span>Inbyggd varukorg räknar automatiskt ut summan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg font-semibold text-indigo-600">
                  ✓
                </span>
                <span>Swish öppnas med rätt belopp och nummer direkt</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg font-semibold text-indigo-600">
                  ✓
                </span>
                <span>Färdig säljrapport till kassören med ett klick</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Nyckelfunktioner
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Allt som behövs för en modern kioskkväll.
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
                  <path d="M5 6h14M5 12h14M5 18h9" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Smart Meny
              </h3>
              <p className="text-sm text-slate-600">
                Lägg in varor och priser på mobilen. Kunderna ser menyn direkt i
                sin webbläsare.
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
                Automatisk PDF-skylt
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
                  <path d="M4 18h16" strokeLinecap="round" />
                  <path d="M6 16V8m6 8V6m6 10v-5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Säljrapport
              </h3>
              <p className="text-sm text-slate-600">
                Efter matchen får du en sammanställning på mejlen. Redovisningen
                till lagkassan är klar på 5 sekunder.
              </p>
            </div>
          </div>
        </section>

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
