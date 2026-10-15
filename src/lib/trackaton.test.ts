import { describe, expect, it } from 'vitest'
import {
  TRACKATON_ENDPOINT,
  TRACKATON_WEBSITE_ID,
  trackatonBootstrapSource,
} from './trackaton'

describe('trackaton bootstrap', () => {
  const source = trackatonBootstrapSource()

  it('sends a pageview on load and on history changes', () => {
    expect(source).toContain('send("pageview", path)')
    expect(source).toContain('history.pushState')
    expect(source).toContain('history.replaceState')
    expect(source).toContain('popstate')
    expect(source).toContain(TRACKATON_ENDPOINT)
    expect(source).toContain(TRACKATON_WEBSITE_ID)
  })

  it('does not depend on the app bundle or the vendor script', () => {
    expect(source).not.toContain('track.js')
    expect(source).not.toContain('convex/react')
    expect(source).not.toContain('useRouter')
  })
})
