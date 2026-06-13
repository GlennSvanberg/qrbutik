import { Link } from '@tanstack/react-router'

type MarketingHeaderProps = {
  loginTracking?: string
}

export function MarketingHeader({
  loginTracking = 'header-login',
}: MarketingHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link to="/" className="flex cursor-pointer items-center gap-3">
        <img
          src="/qrbutik_logo.png"
          alt="QRButik logo"
          className="h-10 w-auto sm:h-11"
        />
        <span className="hidden text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted sm:inline">
          QRButik.se
        </span>
      </Link>
      <Link
        to="/logga-in"
        search={{ redirect: '/admin' }}
        className="relaxed-secondary-button inline-flex h-11 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-brand-foreground"
        trackaton-on-click={loginTracking}
      >
        Logga in
      </Link>
    </header>
  )
}
