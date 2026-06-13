import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/hjalp/export')({
  head: () => ({
    meta: [
      { title: 'Export till bokföring – QRButik' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ExportHelpPage,
})

function ExportHelpPage() {
  return (
    <main className="relaxed-page-shell min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Hjälp
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Export till bokföring
          </h1>
        </header>

        <section className="relaxed-surface p-6 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Excel</h2>
          <p className="mt-2">
            Filen öppnas direkt i Excel med formaterad tabell, anpassade
            kolumnbredder och filter. Kolumner: datum, kiosk, belopp, referens,
            status, artiklar och antal rader. En summa-rad visar total
            försäljning. Kryssa i &quot;Inkludera icke verifierade köp&quot;
            om du vill se väntande betalningar också.
          </p>
        </section>

        <section className="relaxed-surface p-6 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">SIE4</h2>
          <p className="mt-2">
            SIE-filen följer version 4 och kan importeras i Fortnox, Visma och
            liknande program. Varje verifierat köp blir en #TRANS-rad på
            intäktskontot (standard 3010 om inget annat anges).
          </p>
          <p className="mt-2">
            Ange organisationsnummer och intäktskonto under Fakturering i
            adminpanelen innan du exporterar SIE.
          </p>
        </section>

        <section className="relaxed-surface p-6 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">
            Exempel: helgens cup
          </h2>
          <p className="mt-2">
            Välj filtret &quot;Helgen&quot; på dashboarden, kontrollera att rätt
            kiosker ingår, och klicka Exportera Excel eller Exportera SIE.
          </p>
        </section>

        <Link
          to="/admin"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Tillbaka till admin
        </Link>
      </div>
    </main>
  )
}
