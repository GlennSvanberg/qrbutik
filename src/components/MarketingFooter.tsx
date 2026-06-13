export function MarketingFooter() {
  return (
    <footer className="flex flex-col items-center gap-6 border-t pt-8 text-center text-sm text-brand-muted relaxed-divider">
      <p className="text-brand-muted">
        QRButik.se — Gjort för föreningslivet i Sverige.
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <a
          href="/kontakt"
          className="rounded-full px-3 py-1 transition hover:bg-brand-accent hover:text-brand-foreground"
          trackaton-on-click="footer-kontakt"
        >
          Kontakt
        </a>
        <a
          href="/support"
          className="rounded-full px-3 py-1 transition hover:bg-brand-accent hover:text-brand-foreground"
          trackaton-on-click="footer-support"
        >
          Support
        </a>
        <a
          href="/integritet"
          className="rounded-full px-3 py-1 transition hover:bg-brand-accent hover:text-brand-foreground"
          trackaton-on-click="footer-integritet"
        >
          Integritet
        </a>
        <a
          href="/villkor"
          className="rounded-full px-3 py-1 transition hover:bg-brand-accent hover:text-brand-foreground"
          trackaton-on-click="footer-villkor"
        >
          Villkor
        </a>
      </div>
    </footer>
  )
}
