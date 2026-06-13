import { describe, expect, it } from 'vitest'
import { ROLE_SHOP_ACCESS, TREASURER_ROLES } from '../test/matrices'
import {
  canAccessShopForMember,
  isTreasurerRole,
} from './auth'
import type { Doc, Id } from '../_generated/dataModel'

function memberFixture(
  role: Doc<'organizationMembers'>['role'],
  assignedShopIds?: Array<Id<'shops'>>,
): Doc<'organizationMembers'> {
  return {
    _id: 'member_test' as Id<'organizationMembers'>,
    _creationTime: 0,
    organizationId: 'org_test' as Id<'organizations'>,
    email: 'test@qrbutik.test',
    role,
    assignedShopIds,
    createdAt: 0,
  }
}

const shopA = 'shop_a' as Id<'shops'>
const shopB = 'shop_b' as Id<'shops'>

describe('canAccessShopForMember', () => {
  it.each(ROLE_SHOP_ACCESS)(
    'role=$role assigned=$assigned → canAccess=$canAccess',
    ({ role, assigned, canAccess }) => {
      const membership = memberFixture(
        role,
        assigned ? [shopA] : [],
      )
      expect(canAccessShopForMember(membership, shopA)).toBe(canAccess)
    },
  )

  it('editor with assignment cannot access unassigned shop', () => {
    const membership = memberFixture('editor', [shopA])
    expect(canAccessShopForMember(membership, shopB)).toBe(false)
  })
})

describe('isTreasurerRole', () => {
  it.each(TREASURER_ROLES)(
    'role=$role → isTreasurer=$isTreasurer',
    ({ role, isTreasurer }) => {
      expect(isTreasurerRole(role)).toBe(isTreasurer)
    },
  )
})
