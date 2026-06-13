import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getPlatformAdminEmails,
  isDevPlatformAdminBypassEnabled,
  isPlatformAdminEmail,
} from './platformAdmin'

describe('platformAdmin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('parses comma-separated admin emails', () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', ' Admin@Example.com , other@test.se ')
    expect(getPlatformAdminEmails()).toEqual([
      'admin@example.com',
      'other@test.se',
    ])
  })

  it('returns empty list when env is unset', () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', '')
    expect(getPlatformAdminEmails()).toEqual([])
  })

  it('matches normalized email against allowlist', () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', 'glenn@inventing.se')
    expect(isPlatformAdminEmail('Glenn@Inventing.SE')).toBe(true)
    expect(isPlatformAdminEmail('other@example.com')).toBe(false)
  })

  it('enables platform admin bypass when dev magic link is on', () => {
    vi.stubEnv('DEV_MAGIC_LINK', 'true')
    expect(isDevPlatformAdminBypassEnabled()).toBe(true)
    vi.stubEnv('DEV_MAGIC_LINK', 'false')
    expect(isDevPlatformAdminBypassEnabled()).toBe(false)
  })
})
