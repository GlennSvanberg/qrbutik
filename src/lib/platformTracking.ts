import { useMutation } from 'convex/react'
import { useEffect, useRef } from 'react'
import { api } from '../../convex/_generated/api'

const VISITOR_ID_KEY = 'qrbutik_visitor_id'

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const existing = window.localStorage.getItem(VISITOR_ID_KEY)
  if (existing) {
    return existing
  }

  const visitorId = crypto.randomUUID()
  window.localStorage.setItem(VISITOR_ID_KEY, visitorId)
  return visitorId
}

type RecordVisitArgs = {
  type: 'shop_view' | 'page_view'
  path?: string
  shopSlug?: string
}

export function useRecordPlatformVisit(args: RecordVisitArgs): void {
  const recordVisit = useMutation(api.platformEvents.recordVisit)
  const recordedRef = useRef(false)

  useEffect(() => {
    if (recordedRef.current) {
      return
    }

    const visitorId = getOrCreateVisitorId()
    if (!visitorId) {
      return
    }

    recordedRef.current = true
    void recordVisit({
      type: args.type,
      visitorId,
      path: args.path,
      shopSlug: args.shopSlug,
    })
  }, [args.path, args.shopSlug, args.type, recordVisit])
}
