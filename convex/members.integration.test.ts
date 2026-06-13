/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { api } from './_generated/api'
import schema from './schema'
import {
  FIXTURE_NOW,
  asUser,
  seedInvitation,
  seedMember,
  seedOrganization,
  seedShop,
} from './test/fixtures'

describe('acceptInvitation', () => {
  it('accepts valid invitation and assigns role', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)
    const { shopId } = await seedShop(t, organizationId)
    const { token } = await seedInvitation(t, organizationId, {
      email: 'editor@qrbutik.test',
      role: 'editor',
      assignedShopIds: [shopId],
    })

    const result = await asUser(t, 'editor@qrbutik.test').mutation(
      api.members.acceptInvitation,
      { token },
    )

    expect(result.organizationId).toBe(organizationId)

    const member = await t.run(async (ctx) => {
      return await ctx.db
        .query('organizationMembers')
        .withIndex('by_organizationId_and_email', (q) =>
          q.eq('organizationId', organizationId).eq('email', 'editor@qrbutik.test'),
        )
        .unique()
    })

    expect(member?.role).toBe('editor')
    expect(member?.assignedShopIds).toEqual([shopId])
  })

  it('rejects expired invitation', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)
    const { token } = await seedInvitation(t, organizationId, {
      email: 'late@qrbutik.test',
      role: 'treasurer',
      expiresAt: FIXTURE_NOW - 1000,
    })

    await expect(
      asUser(t, 'late@qrbutik.test').mutation(api.members.acceptInvitation, {
        token,
      }),
    ).rejects.toThrow('Inbjudan har gått ut.')
  })

  it('rejects email mismatch', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)
    const { token } = await seedInvitation(t, organizationId, {
      email: 'invited@qrbutik.test',
      role: 'treasurer',
    })

    await expect(
      asUser(t, 'wrong@qrbutik.test').mutation(api.members.acceptInvitation, {
        token,
      }),
    ).rejects.toThrow('Inbjudan gäller en annan e-postadress.')
  })

  it('rejects duplicate member', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)
    await seedMember(t, organizationId, {
      role: 'editor',
      email: 'existing@qrbutik.test',
    })
    const { token } = await seedInvitation(t, organizationId, {
      email: 'existing@qrbutik.test',
      role: 'editor',
    })

    await expect(
      asUser(t, 'existing@qrbutik.test').mutation(
        api.members.acceptInvitation,
        { token },
      ),
    ).rejects.toThrow('Du är redan medlem i den här föreningen.')
  })
})
