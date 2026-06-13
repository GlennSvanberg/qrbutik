import { getConvexSiteUrl } from './env'

export type DevInviteToken = {
  token: string
  organizationId: string
}

export async function waitForDevInviteToken(
  email: string,
  convexSiteUrl = getConvexSiteUrl(),
): Promise<DevInviteToken> {
  const maxAttempts = 30
  const delayMs = 500

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(
      `${convexSiteUrl}/dev/invite-token?email=${encodeURIComponent(email)}`,
    )

    if (response.status === 204) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      continue
    }

    if (response.ok) {
      const payload = (await response.json()) as DevInviteToken
      if (payload.token) {
        return payload
      }
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  throw new Error(
    `Dev invite token not found for ${email}. Ensure DEV_MAGIC_LINK=true in Convex env.`,
  )
}
