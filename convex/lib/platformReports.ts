import { getPlatformAdminEmails } from './platformAdmin'

export function isPlatformReportsEnabled(): boolean {
  return process.env.PLATFORM_REPORTS_ENABLED === 'true'
}

export function canSendPlatformReportEmail(): boolean {
  if (!isPlatformReportsEnabled()) {
    return false
  }
  if (!process.env.RESEND_API_KEY) {
    return false
  }
  return getPlatformAdminEmails().length > 0
}
