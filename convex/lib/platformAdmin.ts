import { isDevMagicLinkEnabled } from '../devMagicLink'
import { getCurrentUser } from './auth'
import { normalizeEmail } from './validators'
import type { AuthCtx, AuthUser } from './auth'

export function getPlatformAdminEmails(): Array<string> {
  const raw = process.env.PLATFORM_ADMIN_EMAILS ?? ''
  return raw
    .split(',')
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean)
}

export function isPlatformAdminEmail(email: string): boolean {
  return getPlatformAdminEmails().includes(normalizeEmail(email))
}

export function isDevPlatformAdminBypassEnabled(): boolean {
  return isDevMagicLinkEnabled()
}

export async function requirePlatformAdmin(ctx: AuthCtx): Promise<AuthUser> {
  const user = await getCurrentUser(ctx)
  if (isDevPlatformAdminBypassEnabled()) {
    return user
  }
  if (!isPlatformAdminEmail(user.email)) {
    throw new Error('Unauthorized: platform admin access required')
  }
  return user
}