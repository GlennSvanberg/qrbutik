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
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-subtle">
            Hjälp
          </p>
          <h1 className="text-3xl font-semibold text-brand-foreground">
            Export till bokföring
          </h1>
        </header>

        <section className="relaxed-surface p-6 text-sm text-brand-muted">
          <h2 className="text-base font-semibold text-brand-foreground">Excel</h2>
          <p className="mt-2">
            Excel öppnas med formaterad tabell, filter och en summarad. CSV är
            semikolonseparerad, UTF-8 med BOM, decimaltecken komma och datum
            ÅÅÅÅ-MM-DD tt:mm. Kolumner: datum, kiosk, belopp, referens, status,
            artiklar och antal rader. Kryssa i &quot;Inkludera icke verifierade
            köp&quot; om du vill ta med väntande betalningar i Excel och CSV.
          </p>
        </section>

        <section className="relaxed-surface p-6 text-sm text-brand-muted">
          <h2 className="text-base font-semibold text-brand-foreground">SIE4</h2>
          <p className="mt-2">
            SIE-filen är typ 4, PC8/CP437, och kan läsas in i bokföringsprogram,
            till exempel Fortnox eller Visma. Varje verifierat köp blir ett
            balanserat verifikat: debet 1930 (Swish) och kredit på intäktskontot
            (standard 3010). Artiklar har ingen momssats, så filen bokför hela
            beloppet som försäljning och använder inte konton för utgående moms.
          </p>
          <p className="mt-2">
            Ange organisationsnummer och intäktskonto under Fakturering i
            adminpanelen innan du exporterar SIE.
          </p>
        </section>

        <section className="relaxed-surface p-6 text-sm text-brand-muted">
          <h2 className="text-base font-semibold text-brand-foreground">
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
