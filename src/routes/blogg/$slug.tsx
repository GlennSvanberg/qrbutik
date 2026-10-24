import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'
import { getBlogPost } from '~/lib/blog'
import { DEMO_SHOP_SLUG } from '~/lib/demo'
import { START_LABEL } from '~/lib/marketing'
import { SKATTEVERKET_KASSAREGISTER_URL } from '~/lib/pricingFaq'
import { absoluteSiteUrl } from '~/lib/siteUrl'
import { ForeningsbutikArticle } from '~/components/blog/ForeningsbutikArticle'

const articleFaq = [
  {
    question: 'Vad är en föreningsbutik online?',
    answer:
      'En föreningsbutik online är föreningens egen försäljning på nätet eller i kiosken: fika, kioskvaror, profilkläder eller förbeställning inför cup. I QRButik beställer besökaren via QR och betalar med Swish till föreningens nummer.',
  },
  {
    question: 'Behöver föreningen ett certifierat kassaregister?',
    answer:
      'Många idrottsföreningar behöver inget certifierat kassaregister för enklare fika och kioskförsäljning när försäljningen är skattefri. Ett café året runt med anställd personal, eller försäljning över fyra prisbasbelopp (238 400 kr år 2027), kan behöva det. QRButik är inte ett certifierat kassaregister. Fråga revisor eller Skatteverket om ni är osäkra.',
  },
  {
    question: 'Kopplas QRButik direkt till Fortnox eller Visma?',
    answer:
      'Nej. Kassören exporterar CSV- och SIE-filer som kan läsas in i bokföringsprogram, till exempel Fortnox eller Visma. Det finns ingen direktkoppling.',
  },
]

export const Route = createFileRoute('/blogg/$slug')({
  beforeLoad: ({ params }) => {
    if (!getBlogPost(params.slug)) {
      throw notFound()
    }
  },
  head: ({ params }) => {
    const post = getBlogPost(params.slug)
    if (!post) {
      return { meta: [{ title: 'Sidan finns inte | QRButik' }] }
    }
    const url = absoluteSiteUrl(`/blogg/${post.slug}`)
    return {
      meta: [
        { title: `${post.title} | QRButik` },
        { name: 'description', content: post.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.description },
        { property: 'og:url', content: url },
        { name: 'robots', content: 'index, follow' },
        {
          'script:ld+json': {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Article',
                headline: post.title,
                description: post.description,
                datePublished: post.published,
                dateModified: post.published,
                inLanguage: 'sv',
                mainEntityOfPage: url,
                author: { '@type': 'Organization', name: 'QRButik', url: absoluteSiteUrl('/') },
                publisher: { '@type': 'Organization', name: 'QRButik', url: absoluteSiteUrl('/') },
              },
              {
                '@type': 'FAQPage',
                mainEntity: articleFaq.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: { '@type': 'Answer', text: item.answer },
                })),
              },
            ],
          },
        },
      ],
    }
  },
  notFoundComponent: () => (
    <main className="relaxed-page-shell min-h-screen px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-foreground">Artikeln finns inte</h1>
      <Link to="/blogg" className="mt-4 inline-block cursor-pointer font-semibold text-brand underline">
        Till bloggen
      </Link>
    </main>
  ),
  component: BlogArticlePage,
})

function BlogArticlePage() {
  const { slug } = Route.useParams()
  const post = getBlogPost(slug)
  if (!post || slug !== 'foreningsbutik-online') {
    return null
  }

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16 text-base text-brand-muted">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em]">
            <Link to="/blogg" className="cursor-pointer underline decoration-brand-border underline-offset-4">
              Blogg
            </Link>
            <span> · {post.published}</span>
          </p>
          <h1 className="text-pretty text-4xl font-bold text-brand-foreground">{post.title}</h1>
          <p>
            För kassörer och den som sköter kiosken i en idrottsförening. Texten beskriver
            hur en föreningsbutik kan fungera med QR och Swish. Den är inte juridisk rådgivning.
          </p>
        </header>

        <ForeningsbutikArticle />

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-brand-foreground">Vanliga frågor</h2>
          <dl className="flex flex-col gap-4">
            {articleFaq.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-brand-foreground">{item.question}</dt>
                <dd className="mt-1">{item.answer}</dd>
              </div>
            ))}
          </dl>
          <p>
            Läs mer hos{' '}
            <a
              href={SKATTEVERKET_KASSAREGISTER_URL}
              className="cursor-pointer font-semibold text-brand underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Skatteverket om bokföring och kassaregister för ideella föreningar
            </a>
            .
          </p>
        </section>

        <section className="rounded-lg border border-brand-border bg-surface p-6">
          <h2 className="text-2xl font-bold text-brand-foreground">Kom igång</h2>
          <p className="mt-3">
            Det finns ingen separat provperiod. Föreningen börjar på Gratis utan kort, med en
            kiosk. Event och Säsong köps när ni behöver fler kiosker eller export.
          </p>
          <Link
            to="/skapa"
            className="relaxed-primary-button mt-4 inline-flex h-12 cursor-pointer items-center justify-center px-6 font-semibold text-white"
            trackaton-on-click="signup_started"
          >
            {START_LABEL}
          </Link>
          <p className="mt-3 text-sm">
            Eller öppna{' '}
            <Link
              to="/s/$shopSlug"
              params={{ shopSlug: DEMO_SHOP_SLUG }}
              className="cursor-pointer font-semibold text-brand underline"
              trackaton-on-click="live_kiosk_click"
            >
              demokiosken
            </Link>
            .
          </p>
        </section>
        <MarketingFooter />
      </article>
    </main>
  )
}
