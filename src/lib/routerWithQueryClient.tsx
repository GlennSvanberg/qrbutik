import { Fragment } from 'react'
import { QueryClientProvider, dehydrate } from '@tanstack/react-query'
import { isRedirect } from '@tanstack/router-core'
import { hydrateQueryState } from './hydrateQueryState'
import type { DehydratedState, QueryClient } from '@tanstack/react-query'
import type { AnyRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type DehydratedRouter = {
  dehydratedQueryClient?: DehydratedState
  queryStream?: ReadableStream<DehydratedState>
}

/**
 * Same wiring as `@tanstack/react-router-with-query`, except streamed query
 * chunks are ignored when they are missing. The upstream helper hydrates the
 * stream's terminal `undefined` value and crashes the client.
 */
export function routerWithQueryClient(
  router: AnyRouter,
  queryClient: QueryClient,
) {
  const ogOptions = router.options
  router.options = {
    ...router.options,
    context: {
      ...ogOptions.context,
      queryClient,
    },
    Wrap: ({ children }: { children: ReactNode }) => {
      const OGWrap = ogOptions.Wrap ?? Fragment
      return (
        <QueryClientProvider client={queryClient}>
          <OGWrap>{children}</OGWrap>
        </QueryClientProvider>
      )
    },
  }

  if (router.isServer) {
    const queryStream = createPushableStream()
    router.options.dehydrate = async () => {
      const ogDehydrated = await ogOptions.dehydrate?.()
      const dehydratedQueryClient = dehydrate(queryClient)
      router.serverSsr?.onRenderFinished(() => queryStream.close())
      return {
        ...ogDehydrated,
        dehydratedQueryClient,
        queryStream: queryStream.stream,
      }
    }
    const ogClientOptions = queryClient.getDefaultOptions()
    queryClient.setDefaultOptions({
      ...ogClientOptions,
      dehydrate: {
        shouldDehydrateQuery: () => true,
        ...ogClientOptions.dehydrate,
      },
    })
    queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'added') {
        return
      }
      if (queryStream.isClosed()) {
        console.warn(
          `tried to stream query ${event.query.queryHash} after stream was already closed`,
        )
        return
      }
      queryStream.enqueue(
        dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => {
            if (query.queryHash === event.query.queryHash) {
              return (
                ogClientOptions.dehydrate?.shouldDehydrateQuery?.(query) ?? true
              )
            }
            return false
          },
        }),
      )
    })
  } else {
    router.options.hydrate = async (dehydrated: DehydratedRouter) => {
      await ogOptions.hydrate?.(dehydrated)
      hydrateQueryState(queryClient, dehydrated.dehydratedQueryClient)
      if (!dehydrated.queryStream) {
        return
      }
      const reader = dehydrated.queryStream.getReader()
      const read = async (): Promise<void> => {
        const { done, value } = await reader.read()
        hydrateQueryState(queryClient, value)
        if (done) {
          return
        }
        await read()
      }
      void read().catch((error: unknown) => {
        console.error('Error reading query stream:', error)
      })
    }

    const ogMutationCacheConfig = queryClient.getMutationCache().config
    queryClient.getMutationCache().config = {
      ...ogMutationCacheConfig,
      onError: (error, variables, onMutateResult, mutation, context) => {
        if (isRedirect(error)) {
          error.options._fromLocation = router.state.location
          return router.navigate(router.resolveRedirect(error).options)
        }
        return ogMutationCacheConfig.onError?.(
          error,
          variables,
          onMutateResult,
          mutation,
          context,
        )
      },
    }
    const ogQueryCacheConfig = queryClient.getQueryCache().config
    queryClient.getQueryCache().config = {
      ...ogQueryCacheConfig,
      onError: (error, query) => {
        if (isRedirect(error)) {
          error.options._fromLocation = router.state.location
          return router.navigate(router.resolveRedirect(error).options)
        }
        return ogQueryCacheConfig.onError?.(error, query)
      },
    }
  }

  return router
}

function createPushableStream() {
  let controllerRef: ReadableStreamDefaultController<DehydratedState> | undefined
  const stream = new ReadableStream<DehydratedState>({
    start(controller) {
      controllerRef = controller
    },
  })
  let closed = false
  return {
    stream,
    enqueue: (chunk: DehydratedState) => {
      controllerRef?.enqueue(chunk)
    },
    close: () => {
      controllerRef?.close()
      closed = true
    },
    isClosed: () => closed,
  }
}
