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
            className="text-sm font-medium text-brand-muted underline-offset-4 hover:underline"
          >
            Tillbaka till startsidan
          </Link>
          <h1 className="text-3xl font-semibold text-brand-foreground">
            Användarvillkor (B2B)
          </h1>
          <p className="text-sm text-brand-muted">
            Senast uppdaterad: 12 oktober 2026. Gäller idrottsföreningar och
            organisationer som använder QRButik.se.
          </p>
        </header>

        <section className="relaxed-surface flex flex-col gap-4 p-8 text-sm leading-relaxed text-brand-muted">
          <h2 className="text-lg font-semibold text-brand-foreground">1. Tjänsten</h2>
          <p>
            QRButik tillhandahåller en digital kioskplattform för
            idrottsföreningar och cuparrangörer. Kundbetalningar sker via Swish
            direkt till föreningens eget nummer — inte till QRButik.
          </p>

          <h2 className="text-lg font-semibold text-brand-foreground">
            2. Planer
          </h2>
          <p>
            Gratis är standard och inkluderar 1 kiosk, obegränsat antal produkter,
            Swish-QR och statistik för idag. En liten QRButik-märkning visas.
            Event kostar 295 kr inklusive moms och ger flera kiosker, ingen
            märkning samt försäljningsrapport och export i 7 dagar från köpet.
            Säsong kostar 1 495 kr per år inklusive moms (cirka 125 kr per månad)
            och ger obegränsat antal kiosker, flera administratörer och
            bokföringsexport så länge prenumerationen är aktiv. Det finns ingen
            separat provperiod.
          </p>

          <h2 className="text-lg font-semibold text-brand-foreground">
            3. Betalning till QRButik
          </h2>
          <p>
            Event betalas som engångsköp och Säsong som årsprenumeration via
            Stripe Checkout. Föreningen ansvarar för att hålla
            betalningsuppgifter aktuella. Om Säsong inte betalas gäller
            Gratis igen. Event återgår till Gratis när de 7 dagarna har gått.
          </p>

          <h2 className="text-lg font-semibold text-brand-foreground">
            4. Användning och ansvar
          </h2>
          <p>
            Tjänsten riktar sig till föreningar — inte privatpersoner som säljer
            på loppis. Föreningen ansvarar för korrekt prissättning, bokföring
            och efterlevnad av gällande lagar vid försäljning i kiosken.
          </p>

          <h2 className="text-lg font-semibold text-brand-foreground">
            5. Uppsägning
          </h2>
          <p>
            Säsong kan sägas upp via kundportalen. Uppsägning stoppar framtida
            debitering. Event är ett engångsköp och förnyas inte automatiskt.
            Data kan raderas enligt separat integritetspolicy.
          </p>

          <p className="text-xs text-brand-muted">
            Detta är ett utkast för beta/MVP. Fullständiga villkor kompletteras
            innan live-fakturering.
          </p>
        </section>

        <MarketingFooter />
      </article>
    </main>
  )
}
