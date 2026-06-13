import { Link } from '@tanstack/react-router'
import { DEMO_LABEL, LIVE_KIOSK_LABEL, LIVE_KIOSK_PATH, TRIAL_LABEL } from '~/lib/marketing'

type MarketingCtasProps = {
  primaryTracking?: string
  secondaryTracking?: string
  liveKioskTracking?: string
  layout?: 'row' | 'stack'
  showLiveKiosk?: boolean
}

export function MarketingCtas({
  primaryTracking = 'trial-cta',
  secondaryTracking = 'demo-cta',
  liveKioskTracking = 'live-kiosk-cta',
  layout = 'row',
  showLiveKiosk = true,
}: MarketingCtasProps) {
  const layoutClass =
    layout === 'row'
      ? 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'
      : 'flex flex-col gap-3'

  return (
    <div className={layoutClass}>
      <Link
        to="/logga-in"
        search={{ redirect: '/skapa' }}
        className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-white"
        trackaton-on-click={primaryTracking}
      >
        {TRIAL_LABEL}
      </Link>
      <Link
        to="/kontakt"
        className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-brand-foreground"
        trackaton-on-click={secondaryTracking}
      >
        {DEMO_LABEL}
      </Link>
      {showLiveKiosk ? (
        <Link
          to={LIVE_KIOSK_PATH}
          className="inline-flex h-12 cursor-pointer items-center justify-center px-2 text-base font-semibold text-brand underline decoration-brand-border underline-offset-4 sm:px-4"
          trackaton-on-click={liveKioskTracking}
        >
          {LIVE_KIOSK_LABEL}
        </Link>
      ) : null}
    </div>
  )
}
