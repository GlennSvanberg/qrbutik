import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery as useTanstackQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type MedlemmarSearch = {
  organizationId?: string
}

export const Route = createFileRoute('/admin/medlemmar')({
  validateSearch: (search: Record<string, unknown>): MedlemmarSearch => ({
    organizationId:
      typeof search.organizationId === 'string'
        ? search.organizationId
        : undefined,
  }),
  component: MedlemmarPage,
})

const roleLabel: Record<string, string> = {
  owner: 'Ägare',
  treasurer: 'Kassör',
  editor: 'Lagledare',
}

function MedlemmarPage() {
  const { organizationId: organizationIdFromSearch } = Route.useSearch()
  const { data: organizations } = useTanstackQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )
  const orgList = organizations ?? []

  if (orgList.length === 0) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-10">
        <div className="relaxed-surface mx-auto max-w-2xl p-8 text-center text-sm text-slate-600">
          Skapa en förening först.
        </div>
      </main>
    )
  }

  const initialOrgId =
    organizationIdFromSearch &&
    orgList.some((org) => org._id === organizationIdFromSearch)
      ? (organizationIdFromSearch as Id<'organizations'>)
      : orgList[0]._id

  return (
    <MedlemmarContent organizations={orgList} initialOrganizationId={initialOrgId} />
  )
}

function MedlemmarContent({
  organizations,
  initialOrganizationId,
}: {
  organizations: Array<{
    _id: Id<'organizations'>
    name: string
    role: 'owner' | 'treasurer' | 'editor'
  }>
  initialOrganizationId: Id<'organizations'>
}) {
  const [organizationId, setOrganizationId] =
    useState<Id<'organizations'>>(initialOrganizationId)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'treasurer'>('editor')
  const [assignedShopIds, setAssignedShopIds] = useState<Array<Id<'shops'>>>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activeOrg =
    organizations.find((org) => org._id === organizationId) ?? organizations[0]
  const canManage =
    activeOrg.role === 'owner' || activeOrg.role === 'treasurer'

  const members = useQuery(api.members.listOrganizationMembers, {
    organizationId,
  })
  const invitations = useQuery(api.members.listPendingInvitations, {
    organizationId,
  })
  const shops = useQuery(api.organizations.listOrganizationShops, {
    organizationId,
  })

  const inviteMember = useMutation(api.members.inviteMember)
  const revokeInvitation = useMutation(api.members.revokeInvitation)
  const removeMember = useMutation(api.members.removeMember)
  const acceptInvitation = useMutation(api.members.acceptInvitation)

  const inviteFromUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    const params = new URLSearchParams(window.location.search)
    return params.get('invite')
  }, [])

  if (!canManage) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-10">
        <div className="relaxed-surface mx-auto max-w-2xl p-8 text-sm text-slate-600">
          Endast kassör eller ägare kan hantera medlemmar.
        </div>
      </main>
    )
  }

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <header>
          <h1 className="text-3xl font-semibold text-slate-900">Medlemmar</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bjud in lagledare och kassörer till {activeOrg.name}.
          </p>
        </header>

        {organizations.length > 1 ? (
          <label className="flex max-w-md flex-col gap-2 text-sm text-slate-700">
            Förening
            <select
              value={organizationId}
              onChange={(event) =>
                setOrganizationId(event.target.value as Id<'organizations'>)
              }
              className="relaxed-input h-12 cursor-pointer px-4"
            >
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {inviteFromUrl ? (
          <div className="relaxed-surface p-4">
            <p className="text-sm text-slate-700">
              Du har en väntande inbjudan. Acceptera den för att gå med i
              föreningen.
            </p>
            <button
              type="button"
              onClick={async () => {
                setError(null)
                try {
                  const result = await acceptInvitation({ token: inviteFromUrl })
                  setMessage(`Du gick med i ${result.organizationName}.`)
                } catch (acceptError) {
                  setError(
                    acceptError instanceof Error
                      ? acceptError.message
                      : 'Kunde inte acceptera inbjudan.',
                  )
                }
              }}
              className="relaxed-primary-button mt-3 h-11 cursor-pointer px-4 text-sm font-semibold text-white"
            >
              Acceptera inbjudan
            </button>
          </div>
        ) : null}

        <section className="relaxed-surface flex flex-col gap-4 p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Bjud in medlem
          </h2>
          <form
            className="flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setError(null)
              setMessage(null)
              try {
                await inviteMember({
                  organizationId,
                  email: inviteEmail,
                  role: inviteRole,
                  assignedShopIds:
                    inviteRole === 'editor' ? assignedShopIds : undefined,
                })
                setInviteEmail('')
                setAssignedShopIds([])
                setMessage('Inbjudan skickad.')
              } catch (inviteError) {
                setError(
                  inviteError instanceof Error
                    ? inviteError.message
                    : 'Kunde inte skicka inbjudan.',
                )
              }
            }}
          >
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              E-post
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="relaxed-input h-11 px-3"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Roll
              <select
                value={inviteRole}
                onChange={(event) =>
                  setInviteRole(event.target.value as 'editor' | 'treasurer')
                }
                className="relaxed-input h-11 cursor-pointer px-3"
              >
                <option value="editor">Lagledare (editor)</option>
                <option value="treasurer">Kassör</option>
              </select>
            </label>
            {inviteRole === 'editor' && shops ? (
              <fieldset className="flex flex-col gap-2 text-sm text-slate-700">
                <legend>Tilldelade kiosker</legend>
                {shops.map((shop) => (
                  <label key={shop._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={assignedShopIds.includes(shop._id)}
                      onChange={(event) => {
                        setAssignedShopIds((prev) =>
                          event.target.checked
                            ? [...prev, shop._id]
                            : prev.filter((id) => id !== shop._id),
                        )
                      }}
                      className="h-4 w-4 cursor-pointer"
                    />
                    {shop.name}
                  </label>
                ))}
              </fieldset>
            ) : null}
            <button
              type="submit"
              className="relaxed-primary-button h-12 w-fit cursor-pointer px-5 text-sm font-semibold text-white"
            >
              Skicka inbjudan
            </button>
          </form>
        </section>

        <section className="relaxed-surface p-6">
          <h2 className="text-base font-semibold text-slate-900">Medlemmar</h2>
          <ul className="mt-4 divide-y divide-slate-200/70">
            {(members ?? []).map((member) => (
              <li
                key={member._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{member.email}</p>
                  <p className="text-slate-500">{roleLabel[member.role]}</p>
                </div>
                {member.role !== 'owner' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setError(null)
                      try {
                        await removeMember({
                          organizationId,
                          memberId: member._id,
                        })
                        setMessage('Medlemmen togs bort.')
                      } catch (removeError) {
                        setError(
                          removeError instanceof Error
                            ? removeError.message
                            : 'Kunde inte ta bort medlemmen.',
                        )
                      }
                    }}
                    className="relaxed-secondary-button h-10 cursor-pointer px-4 text-sm font-semibold text-slate-700"
                  >
                    Ta bort
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {(invitations ?? []).length > 0 ? (
          <section className="relaxed-surface p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Väntande inbjudningar
            </h2>
            <ul className="mt-4 divide-y divide-slate-200/70">
              {invitations?.map((invitation: {
                _id: Id<'organizationInvitations'>
                email: string
                role: 'treasurer' | 'editor'
                expiresAt: number
              }) => (
                <li
                  key={invitation._id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {invitation.email}
                    </p>
                    <p className="text-slate-500">
                      {roleLabel[invitation.role]} · gäller till{' '}
                      {new Date(invitation.expiresAt).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await revokeInvitation({
                        organizationId,
                        invitationId: invitation._id,
                      })
                    }}
                    className="relaxed-secondary-button h-10 cursor-pointer px-4 text-sm font-semibold text-slate-700"
                  >
                    Återkalla
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Link
          to="/admin"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Tillbaka till dashboard
        </Link>
      </div>
    </main>
  )
}
