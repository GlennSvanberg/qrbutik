import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
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
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-semibold text-slate-900">
              Skapa din butik
            </h2>
            <p className="text-sm text-slate-600">
              Bygg din butik på två steg: fyll i butiksinfo och lägg till
              produkter. Du får direkt en länk att dela.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/skapa"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Skapa din butik
              </Link>
              <p className="text-xs text-slate-500">
                Tar ca 2 minuter.
              </p>
            </div>
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
