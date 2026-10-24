import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'
import { blogPosts } from '~/lib/blog'

export const Route = createFileRoute('/blogg/')({
  head: () => ({
    meta: [
      { title: 'Blogg | QRButik' },
      {
        name: 'description',
        content:
          'Texter för kassörer och kioskansvariga i idrottsföreningar: föreningsbutik online, QR, Swish och bokföring.',
      },
      { property: 'og:title', content: 'Blogg | QRButik' },
      {
        property: 'og:description',
        content:
          'Texter för kassörer och kioskansvariga i idrottsföreningar: föreningsbutik online, QR, Swish och bokföring.',
      },
      { name: 'robots', content: 'index, follow' },
    ],
  }),
  component: BlogIndexPage,
})

function BlogIndexPage() {
  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
            Blogg
          </p>
          <h1 className="text-pretty text-4xl font-bold text-brand-foreground">
            För kassör och kiosk
          </h1>
          <p className="text-base text-brand-muted">
            Praktiska texter om hur en idrottsförening kan ta betalt i kiosken,
            utan påhittade kundcase.
          </p>
        </header>
        <ul className="flex flex-col gap-4">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <article className="rounded-lg border border-brand-border bg-surface p-5">
                <p className="text-xs text-brand-muted">{post.published}</p>
                <h2 className="mt-2 text-xl font-semibold text-brand-foreground">
                  <Link
                    to="/blogg/$slug"
                    params={{ slug: post.slug }}
                    className="cursor-pointer underline decoration-brand-border underline-offset-4"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-brand-muted">{post.description}</p>
              </article>
            </li>
          ))}
        </ul>
        <MarketingFooter />
      </div>
    </main>
  )
}
