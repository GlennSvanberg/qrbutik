export type BlogPostMeta = {
  slug: string
  title: string
  description: string
  published: string
}

export const blogPosts: Array<BlogPostMeta> = [
  {
    slug: 'foreningsbutik-online',
    title: 'Föreningsbutik online: QR-kiosk och Swish för idrottsföreningar',
    description:
      'Så kan en idrottsförening ta betalt i kiosken med QR och Swish, vad det kostar, hur CSV- och SIE-filer används i bokföringen och vad kassaregisterkravet betyder.',
    published: '2026-10-24',
  },
]

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return blogPosts.find((post) => post.slug === slug)
}
