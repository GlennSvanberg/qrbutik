import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'

export const Route = createFileRoute('/villkor')({
  head: () => ({
    meta: [{ title: 'Användarvillkor – QRButik' }],
  }),
  component: VillkorPage,
})

function VillkorPage() {
  return (
    <main className="relaxed-page-shell min-h-screen px-6 py-12">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-slate-500 underline-offset-4 hover:underline"
          >
            Tillbaka till startsidan
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900">
            Användarvillkor (B2B)
          </h1>
          <p className="text-sm text-slate-600">
            Senast uppdaterad: 13 juni 2025. Gäller idrottsföreningar och
            organisationer som tecknar klubblicens hos QRButik.se.
          </p>
        </header>

        <section className="relaxed-surface flex flex-col gap-4 p-8 text-sm leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">1. Tjänsten</h2>
          <p>
            QRButik tillhandahåller en digital kioskplattform för
            idrottsföreningar och cuparrangörer. Kundbetalningar sker via Swish
            direkt till föreningens eget nummer — inte till QRButik.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            2. Klubblicens och provperiod
          </h2>
          <p>
            Klubblicensen kostar 995 kr per månad och omfattar obegränsat antal
            kiosker under samma organisation. Nya föreningar erbjuds 14 dagars
            gratis provperiod utan betalkort. Efter provperiod krävs aktiv
            prenumeration för att kiosker ska acceptera köp.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            3. Betalning till QRButik
          </h2>
          <p>
            Fakturering sker via Stripe. Föreningen kan betala med betalkort
            (Checkout) eller välja faktura som skickas som PDF till angiven
            faktura-e-post. Föreningen ansvarar för att hålla betalningsuppgifter
            aktuella. Vid utebliven betalning kan tjänsten pausas tills
            betalning regleras.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            4. Användning och ansvar
          </h2>
          <p>
            Tjänsten riktar sig till föreningar — inte privatpersoner som säljer
            på loppis. Föreningen ansvarar för korrekt prissättning, bokföring
            och efterlevnad av gällande lagar vid försäljning i kiosken.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            5. Uppsägning
          </h2>
          <p>
            Prenumerationen kan sägas upp via kundportalen. Uppsägning stoppar
            framtida debitering; data kan raderas enligt separat
            integritetspolicy.
          </p>

          <p className="text-xs text-slate-500">
            Detta är ett utkast för beta/MVP. Fullständiga villkor kompletteras
            innan live-fakturering.
          </p>
        </section>

        <MarketingFooter />
      </article>
    </main>
  )
}
