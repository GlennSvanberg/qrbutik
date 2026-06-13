import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery as useTanstackQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type MedlemmarSearch = {
  organizationId?: string
  invite?: string
  inviteError?: string
}

export const Route = createFileRoute('/admin/medlemmar')({
  validateSearch: (search: Record<string, unknown>): MedlemmarSearch => ({
    organizationId:
      typeof search.organizationId === 'string'
        ? search.organizationId
        : undefined,
    invite: typeof search.invite === 'string' ? search.invite : undefined,
    inviteError:
      typeof search.inviteError === 'string' ? search.inviteError : undefined,
  }),
  component: MedlemmarPage,
})

const roleLabel: Record<string, string> = {
  owner: 'Ägare',
  treasurer: 'Kassör',
  editor: 'Lagledare',
}

function InviteAcceptPanel({
  token,
  inviteError,
}: {
  token: string
  inviteError?: string
}) {
  const navigate = useNavigate()
  const acceptInvitation = useMutation(api.members.acceptInvitation)
  const invitation = useQuery(api.members.getInvitationByToken, { token })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(inviteError ?? null)

  if (invitation === undefined) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-10">
        <div className="relaxed-surface mx-auto max-w-2xl p-8 text-center text-sm text-slate-600">
          Laddar inbjudan…
        </div>
      </main>
    )
  }

  if (invitation === null) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-10">
        <div className="relaxed-surface mx-auto max-w-2xl p-8 text-center text-sm text-slate-600">
          Inbjudan hittades inte eller har redan accepterats.
        </div>
      </main>
    )
  }

  if (invitation.expired) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-10">
        <div className="relaxed-surface mx-auto max-w-2xl p-8 text-center text-sm text-slate-600">
          Inbjudan har gått ut. Be föreningens administratör skicka en ny.
        </div>
      </main>
    )
  }

  return (
    <main className="relaxed-page-shell min-h-screen px-6 py-10">
      <div className="relaxed-surface mx-auto flex max-w-2xl flex-col gap-4 p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Medlemsinbjudan</h1>
        <p className="text-sm text-slate-600">
          Du är inbjuden till {invitation.organizationName} som{' '}
          {roleLabel[invitation.role]}.
        </p>
        <button
          type="button"
          onClick={async () => {
            setError(null)
            try {
              const result = await acceptInvitation({ token })
              setMessage(`Du gick med i ${result.organizationName}.`)
              await navigate({ to: '/admin' })
            } catch (acceptError) {
              setError(
                acceptError instanceof Error
                  ? acceptError.message
                  : 'Kunde inte acceptera inbjudan.',
              )
            }
          }}
          className="relaxed-primary-button h-11 w-fit cursor-pointer px-4 text-sm font-semibold text-white"
        >
          Acceptera inbjudan
        </button>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </main>
  )
}

function MedlemmarPage() {
  const {
    organizationId: organizationIdFromSearch,
    invite: inviteFromSearch,
    inviteError: inviteErrorFromSearch,
  } = Route.useSearch()
  const { data: organizations } = useTanstackQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )
  const orgList = organizations ?? []

  if (inviteFromSearch && orgList.length === 0) {
    return (
      <InviteAcceptPanel
        token={inviteFromSearch}
        inviteError={inviteErrorFromSearch}
      />
    )
  }

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
    <MedlemmarContent
      organizations={orgList}
      initialOrganizationId={initialOrgId}
      inviteFromSearch={inviteFromSearch}
      inviteErrorFromSearch={inviteErrorFromSearch}
    />
  )
}

function formatShopNames(
  shopIds: Array<Id<'shops'> | undefined> | undefined,
  shops: Array<{ _id: Id<'shops'>; name: string }> | undefined,
) {
  if (!shopIds || shopIds.length === 0 || !shops) {
    return null
  }
  const names = shopIds
    .map((id) => shops.find((shop) => shop._id === id)?.name)
    .filter((name): name is string => Boolean(name))
  return names.length > 0 ? names.join(', ') : null
}

function MedlemmarContent({
  organizations,
  initialOrganizationId,
  inviteFromSearch,
  inviteErrorFromSearch,
}: {
  organizations: Array<{
    _id: Id<'organizations'>
    name: string
    role: 'owner' | 'treasurer' | 'editor'
  }>
  initialOrganizationId: Id<'organizations'>
  inviteFromSearch?: string
  inviteErrorFromSearch?: string
}) {
  const [organizationId, setOrganizationId] =
    useState<Id<'organizations'>>(initialOrganizationId)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'treasurer'>('editor')
  const [assignedShopIds, setAssignedShopIds] = useState<Array<Id<'shops'>>>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(inviteErrorFromSearch ?? null)
  const [editingMemberId, setEditingMemberId] =
    useState<Id<'organizationMembers'> | null>(null)
  const [editRole, setEditRole] = useState<'editor' | 'treasurer'>('editor')
  const [editAssignedShopIds, setEditAssignedShopIds] = useState<
    Array<Id<'shops'>>
  >([])

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
  const updateMemberRole = useMutation(api.members.updateMemberRole)
  const setMemberShopAssignments = useMutation(
    api.members.setMemberShopAssignments,
  )

  const inviteFromUrl = inviteFromSearch ?? null

  if (inviteFromUrl && !canManage) {
    return (
      <InviteAcceptPanel
        token={inviteFromUrl}
        inviteError={inviteErrorFromSearch}
      />
    )
  }

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
                id="invite-email"
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
                id="invite-role"
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
            {(members ?? []).map((member) => {
              const assignedLabel = formatShopNames(
                member.assignedShopIds,
                shops ?? undefined,
              )
              const isEditing = editingMemberId === member._id

              return (
                <li key={member._id} className="flex flex-col gap-3 py-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{member.email}</p>
                      <p className="text-slate-500">{roleLabel[member.role]}</p>
                      {member.role === 'editor' && assignedLabel ? (
                        <p className="mt-1 text-slate-500">
                          Kiosker: {assignedLabel}
                        </p>
                      ) : null}
                    </div>
                    {member.role !== 'owner' ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMemberId(isEditing ? null : member._id)
                            setEditRole(
                              member.role === 'treasurer' ? 'treasurer' : 'editor',
                            )
                            setEditAssignedShopIds(member.assignedShopIds ?? [])
                          }}
                          className="relaxed-secondary-button h-10 cursor-pointer px-4 text-sm font-semibold text-slate-700"
                        >
                          {isEditing ? 'Avbryt' : 'Redigera'}
                        </button>
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
                              if (editingMemberId === member._id) {
                                setEditingMemberId(null)
                              }
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
                      </div>
                    ) : null}
                  </div>

                  {isEditing && member.role !== 'owner' ? (
                    <form
                      className="relaxed-surface-soft flex flex-col gap-3 rounded-2xl bg-stone-50/70 p-4"
                      onSubmit={async (event) => {
                        event.preventDefault()
                        setError(null)
                        try {
                          if (editRole !== member.role) {
                            await updateMemberRole({
                              organizationId,
                              memberId: member._id,
                              role: editRole,
                            })
                          }
                          if (editRole === 'editor') {
                            await setMemberShopAssignments({
                              organizationId,
                              memberId: member._id,
                              assignedShopIds: editAssignedShopIds,
                            })
                          }
                          setMessage('Medlemmen uppdaterades.')
                          setEditingMemberId(null)
                        } catch (editError) {
                          setError(
                            editError instanceof Error
                              ? editError.message
                              : 'Kunde inte uppdatera medlemmen.',
                          )
                        }
                      }}
                    >
                      <label className="flex flex-col gap-2 text-sm text-slate-700">
                        Roll
                        <select
                          value={editRole}
                          onChange={(event) =>
                            setEditRole(
                              event.target.value as 'editor' | 'treasurer',
                            )
                          }
                          className="relaxed-input h-11 cursor-pointer px-3"
                        >
                          <option value="editor">Lagledare (editor)</option>
                          <option value="treasurer">Kassör</option>
                        </select>
                      </label>
                      {editRole === 'editor' && shops ? (
                        <fieldset className="flex flex-col gap-2 text-sm text-slate-700">
                          <legend>Tilldelade kiosker</legend>
                          {shops.map((shop) => (
                            <label
                              key={shop._id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={editAssignedShopIds.includes(shop._id)}
                                onChange={(event) => {
                                  setEditAssignedShopIds((prev) =>
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
                        className="relaxed-primary-button h-10 w-fit cursor-pointer px-4 text-sm font-semibold text-white"
                      >
                        Spara ändringar
                      </button>
                    </form>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>

        {(invitations ?? []).length > 0 ? (
          <section className="relaxed-surface p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Väntande inbjudningar
            </h2>
            <ul className="mt-4 divide-y divide-slate-200/70">
              {invitations?.map((invitation) => {
                const assignedLabel = formatShopNames(
                  invitation.assignedShopIds,
                  shops ?? undefined,
                )
                return (
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
                    {invitation.role === 'editor' && assignedLabel ? (
                      <p className="mt-1 text-slate-500">
                        Kiosker: {assignedLabel}
                      </p>
                    ) : null}
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
                )
              })}
            </ul>
          </section>
        ) : null}

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Link
          to="/admin/org/$orgId"
          params={{ orgId: organizationId }}
          className="text-sm font-semibold text-brand hover:underline"
        >
          Tillbaka till dashboard
        </Link>
      </div>
    </main>
  )
}
