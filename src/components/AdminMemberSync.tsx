import { useMutation } from 'convex/react'
import { useEffect, useRef } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { authClient } from '../lib/authClient'

export function AdminMemberSync() {
  const navigate = useNavigate()
  const syncMemberIdentity = useMutation(api.members.syncMemberIdentity)
  const acceptInvitation = useMutation(api.members.acceptInvitation)
  const hasSynced = useRef(false)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
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
      const onMedlemmarInvitePage =
        pathname.includes('/admin/medlemmar') && Boolean(inviteToken)
      if (inviteToken && !onMedlemmarInvitePage) {
        try {
          await acceptInvitation({ token: inviteToken })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Kunde inte acceptera inbjudan.'
          await navigate({
            to: '/admin/medlemmar',
            search: {
              invite: inviteToken,
              inviteError: message,
            },
          })
        }
      }
    })()
  }, [
    acceptInvitation,
    navigate,
    pathname,
    search.invite,
    session?.user.email,
    syncMemberIdentity,
  ])

  return null
}
