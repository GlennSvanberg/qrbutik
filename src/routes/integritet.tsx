import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'

export const Route = createFileRoute('/integritet')({
  head: () => ({
    meta: [{ title: 'Integritetspolicy – QRButik' }],
  }),
  component: IntegritetPage,
})

function IntegritetPage() {
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
            Integritetspolicy
          </h1>
          <p className="text-sm text-slate-600">
            Senast uppdaterad: 13 juni 2025.
          </p>
        </header>

        <section className="relaxed-surface flex flex-col gap-4 p-8 text-sm leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">
            Vilka uppgifter vi behandlar
          </h2>
          <p>
            För föreningens administratörer lagrar vi e-postadress (inloggning),
            föreningsnamn, valfritt organisationsnummer, faktura-e-post och
            data om kiosker och försäljning. Slutkunder som betalar via Swish
            behöver inget konto hos QRButik.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            Syfte och rättslig grund
          </h2>
          <p>
            Uppgifter behandlas för att tillhandahålla tjänsten, hantera
            prenumeration och ge support. Behandling sker med stöd av avtal och
            berättigat intresse.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            Delning med tredje part
          </h2>
          <p>
            Vi använder leverantörer för hosting (Convex), e-post (Resend) och
            betalning (Stripe). Dessa behandlar data enligt sina egna villkor
            och biträdesavtal där det krävs. Vi skickar e-post om provperiod,
            prenumeration och betalningspåminnelser till föreningens
            faktura-e-post.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            Lagring och radering
          </h2>
          <p>
            Data sparas så länge föreningen har aktivt konto. Vid uppsägning kan
            data raderas efter avtalad karensperiod. Kontakta oss för begäran om
            registerutdrag eller radering.
          </p>

          <h2 className="text-lg font-semibold text-slate-900">Kontakt</h2>
          <p>
            Frågor om integritet:{' '}
            <a
              href="/kontakt"
              className="font-medium text-slate-900 underline underline-offset-4"
            >
              kontakta oss
            </a>
            .
          </p>

          <p className="text-xs text-slate-500">
            Detta är ett utkast för beta/MVP. Policyn kompletteras innan
            live-fakturering.
          </p>
        </section>

        <MarketingFooter />
      </article>
    </main>
  )
}
