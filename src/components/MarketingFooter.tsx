export function MarketingFooter() {
  return (
    <footer className="flex flex-col items-center gap-6 border-t pt-8 text-center text-sm text-slate-500 relaxed-divider">
      <p className="text-slate-600">
        QRButik.se — Gjort för föreningslivet i Sverige.
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <a
          href="/kontakt"
          className="rounded-full px-3 py-1 transition hover:bg-stone-50/80 hover:text-slate-900"
          trackaton-on-click="footer-kontakt"
        >
          Kontakt
        </a>
        <a
          href="/support"
          className="rounded-full px-3 py-1 transition hover:bg-stone-50/80 hover:text-slate-900"
          trackaton-on-click="footer-support"
        >
          Support
        </a>
        <a
          href="/villkor"
          className="rounded-full px-3 py-1 transition hover:bg-stone-50/80 hover:text-slate-900"
          trackaton-on-click="footer-villkor"
        >
          Villkor
        </a>
      </div>
    </footer>
  )
}

