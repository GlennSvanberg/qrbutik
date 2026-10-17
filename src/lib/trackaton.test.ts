import { afterEach, describe, expect, it } from 'vitest'
import {
  TRACKATON_ENDPOINT,
  TRACKATON_WEBSITE_ID,
  trackFunnelEvent,
  trackatonBootstrapSource,
} from './trackaton'

type PostedEvent = {
  type: string
  name: string
  metadata: Record<string, unknown>
}

type ClickNode = {
  tagName: string
  innerText: string
  getAttribute: (name: string) => string | null
}

function installSnippet(pathname: string) {
  const posts: Array<PostedEvent> = []
  const clickListeners: Array<(event: { target: unknown }) => void> = []
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    history: globalThis.history,
    fetch: globalThis.fetch,
  }
  const location = {
    href: `https://qrbutik.se${pathname}`,
    pathname,
  }
  const fakeWindow = {
    __qrbutikTrackaton: 0,
    qrbutikTrack: undefined as
      | ((name: string, extra?: { plan?: string; email?: string }) => void)
      | undefined,
    innerWidth: 1280,
    location,
    addEventListener: () => undefined,
  }
  const fakeDocument = {
    referrer: '',
    addEventListener: (
      _type: string,
      listener: (event: { target: unknown }) => void,
    ) => {
      clickListeners.push(listener)
    },
  }
  const fakeHistory = {
    pushState: () => undefined,
    replaceState: () => undefined,
  }

  Object.assign(globalThis, {
    window: fakeWindow,
    document: fakeDocument,
    history: fakeHistory,
    fetch: (_url: string, init: { body: string }) => {
      posts.push(JSON.parse(init.body) as PostedEvent)
      return Promise.resolve({ ok: true })
    },
  })

  // Classic inline scripts are sloppy and resolve `window` on the global object.
  const run = new Function(trackatonBootstrapSource())
  run()

  return {
    posts,
    fakeWindow,
    fakeHistory,
    click(node: ClickNode) {
      const event = {
        target: {
          closest: (selector: string) =>
            selector === '[trackaton-on-click]' ? node : null,
        },
      }
      for (const listener of clickListeners) listener(event)
    },
    restore() {
      Object.assign(globalThis, previous)
    },
  }
}

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

  it('names the funnel events and keeps plan metadata on an allowlist', () => {
    expect(source).toContain('demo_opened')
    expect(source).toContain('signup_started')
    expect(source).toContain('signup_completed')
    expect(source).toContain('live_kiosk_click')
    expect(source).toContain('checkout_started')
    expect(source).toContain('plan_selected')
    expect(source).toContain('data-trackaton-plan')
    expect(source).toContain('qrbutikTrack')
  })
})

describe('trackaton runtime', () => {
  let restore: (() => void) | undefined

  afterEach(() => {
    restore?.()
    restore = undefined
  })

  it('sends demo_opened when /s/demo is opened, including after a client navigation', () => {
    const harness = installSnippet('/')
    restore = harness.restore

    expect(harness.posts.map((post) => `${post.type}:${post.name}`)).toEqual([
      'pageview:/',
    ])

    harness.fakeWindow.location.pathname = '/s/demo'
    harness.fakeWindow.location.href = 'https://qrbutik.se/s/demo'
    harness.fakeHistory.pushState()

    expect(harness.posts.map((post) => `${post.type}:${post.name}`)).toEqual([
      'pageview:/',
      'pageview:/s/demo',
      'custom:demo_opened',
    ])
    expect(harness.posts[2]?.metadata.plan).toBeUndefined()
  })

  it('sends live_kiosk_click from the existing click attribute', () => {
    const harness = installSnippet('/')
    restore = harness.restore

    harness.click({
      tagName: 'A',
      innerText: 'Prova live kiosk',
      getAttribute: (name) =>
        name === 'trackaton-on-click' ? 'live_kiosk_click' : null,
    })

    const custom = harness.posts.find((post) => post.type === 'custom')
    expect(custom?.name).toBe('live_kiosk_click')
    expect(custom?.metadata.tagName).toBe('A')
  })

  it('sends plan_selected with the plan name and ignores other attributes', () => {
    const harness = installSnippet('/')
    restore = harness.restore

    harness.click({
      tagName: 'A',
      innerText: 'Köp Event',
      getAttribute: (name) => {
        if (name === 'trackaton-on-click') return 'plan_selected'
        if (name === 'data-trackaton-plan') return 'event'
        if (name === 'data-trackaton-also') return 'not-an-event'
        if (name === 'data-email') return 'person@example.com'
        return null
      },
    })

    const customs = harness.posts.filter((post) => post.type === 'custom')
    expect(customs).toHaveLength(1)
    expect(customs[0]?.name).toBe('plan_selected')
    expect(customs[0]?.metadata.plan).toBe('event')
    expect(JSON.stringify(customs[0])).not.toContain('person@example.com')
  })

  it('adds signup_started when a gratis plan click asks for it', () => {
    const harness = installSnippet('/')
    restore = harness.restore

    harness.click({
      tagName: 'A',
      innerText: 'Kom igång',
      getAttribute: (name) => {
        if (name === 'trackaton-on-click') return 'plan_selected'
        if (name === 'data-trackaton-plan') return 'gratis'
        if (name === 'data-trackaton-also') return 'signup_started'
        return null
      },
    })

    expect(
      harness.posts
        .filter((post) => post.type === 'custom')
        .map((post) => post.name),
    ).toEqual(['plan_selected', 'signup_started'])
    expect(harness.posts.at(-1)?.metadata.plan).toBe('gratis')
  })

  it('drops personal fields from the programmatic tracker', () => {
    const harness = installSnippet('/')
    restore = harness.restore

    harness.fakeWindow.qrbutikTrack?.('checkout_started', {
      plan: 'season',
      email: 'person@example.com',
    })
    harness.fakeWindow.qrbutikTrack?.('checkout_started', {
      plan: 'secret-plan',
    })

    const customs = harness.posts.filter((post) => post.type === 'custom')
    expect(customs.map((post) => post.metadata.plan)).toEqual(['season', undefined])
    expect(JSON.stringify(customs)).not.toContain('person@example.com')
    expect(JSON.stringify(customs)).not.toContain('secret-plan')
  })

  it('keeps going when fetch throws', () => {
    const harness = installSnippet('/')
    restore = harness.restore
    globalThis.fetch = () => {
      throw new Error('offline')
    }

    expect(() =>
      harness.click({
        tagName: 'BUTTON',
        innerText: 'Köp Event',
        getAttribute: (name) =>
          name === 'trackaton-on-click' ? 'checkout_started' : null,
      }),
    ).not.toThrow()
  })
})

describe('trackFunnelEvent', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window
  })

  it('forwards an allowlisted plan and swallows tracker failures', () => {
    const calls: Array<{ name: string; extra?: { plan?: string } }> = []
    Object.assign(globalThis, {
      window: {
        qrbutikTrack: (name: string, extra?: { plan?: string }) => {
          calls.push({ name, extra })
          if (name === 'signup_completed') throw new Error('tracker down')
        },
      },
    })

    trackFunnelEvent('checkout_started', { plan: 'event' })
    trackFunnelEvent('plan_selected', { plan: 'not-a-plan' })
    expect(() => trackFunnelEvent('signup_completed')).not.toThrow()

    expect(calls).toEqual([
      { name: 'checkout_started', extra: { plan: 'event' } },
      { name: 'plan_selected', extra: {} },
      { name: 'signup_completed', extra: {} },
    ])
  })

  it('does nothing when the snippet is missing', () => {
    Object.assign(globalThis, { window: {} })
    expect(() => trackFunnelEvent('signup_started')).not.toThrow()
  })
})
