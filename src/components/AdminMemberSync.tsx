import { useMutation } from 'convex/react'
import { useEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { authClient } from '../lib/authClient'

export function AdminMemberSync() {
  const syncMemberIdentity = useMutation(api.members.syncMemberIdentity)
  const acceptInvitation = useMutation(api.members.acceptInvitation)
  const hasSynced = useRef(false)
  const search = useRouterState({
    select: (state) => state.location.search as Record<string, unknown>,
  })
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (!session?.user.email || hasSynced.current) {
      return
    }

    hasSynced.current = true

    void (async () => {
      await syncMemberIdentity({})
      const inviteToken =
        typeof search.invite === 'string' ? search.invite : undefined
      if (inviteToken) {
        try {
          await acceptInvitation({ token: inviteToken })
        } catch {
          // Invitation errors surface on medlemmar page if needed
        }
      }
    })()
  }, [acceptInvitation, search.invite, session?.user.email, syncMemberIdentity])

  return null
}
