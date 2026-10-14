import { hydrate } from '@tanstack/react-query'
import type { DehydratedState, QueryClient } from '@tanstack/react-query'

/**
 * `@tanstack/react-query` `hydrate()` reads `state.mutations` before optional
 * chaining `.forEach`. A finished TanStack Start query stream yields
 * `undefined`, which throws
 * `TypeError: Cannot read properties of undefined (reading 'mutations')`
 * and aborts the Suspense boundary (React error #419).
 */
export function hydrateQueryState(
  queryClient: QueryClient,
  state: DehydratedState | null | undefined,
): void {
  if (state == null) {
    return
  }
  hydrate(queryClient, state)
}
