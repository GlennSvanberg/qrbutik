import { QueryClient, hydrate } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { hydrateQueryState } from './hydrateQueryState'

describe('hydrateQueryState', () => {
  it('skips the undefined chunk that ends a query stream', () => {
    const queryClient = new QueryClient()
    expect(() => hydrateQueryState(queryClient, undefined)).not.toThrow()
    expect(() =>
      hydrate(queryClient, undefined as unknown as { mutations: [] }),
    ).toThrow(/mutations/)
  })

  it('hydrates a real dehydrated state', () => {
    const queryClient = new QueryClient()
    hydrateQueryState(queryClient, { mutations: [], queries: [] })
    expect(queryClient.getQueryCache().getAll()).toEqual([])
  })
})
