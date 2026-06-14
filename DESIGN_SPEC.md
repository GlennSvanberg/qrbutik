# Design Specification - QRButik

## Theme: B2B Tech
The design should evoke **Trust, Speed, and Professionalism**. It should be clean, high-contrast, and mobile-first — suitable for **sports club treasurers and boards** (primary) and kiosk volunteers (secondary).

**Product direction:** Club license SaaS — see [`ROADMAP.md`](./ROADMAP.md). Dashboard and export surfaces should feel credible for finance roles (tables, clear totals, export actions), not only mobile kiosk UI.

## Theming & Colors
All theming should be maintained in `src/styles/app.css`. The app follows **browser system preference** (`prefers-color-scheme`) — no manual theme toggle.

### Light mode (default)
- **Background:** `#FFFFFF` — crisp white, no warm gradients.
- **Primary (Buttons):** Electric Blue (`#1A73E8`, hover `#1656CB`) — primary CTAs, active states, key icons.
- **Text:** Charcoal (`#1C2B39`) for headings and body; muted (`#5F6B7A`) for secondary copy.
- **Success:** Green (`#34A853`) — checkmarks, verified payments, positive feedback.
- **Borders:** Light gray (`#E2E8F0`); accent borders (`#BFDBFE`) for highlighted cards.

### Dark mode (system preference)
- **Background:** `#0F1419` page, `#1C2B39` elevated surfaces.
- **Primary:** `#4A9EFF` (hover `#6BB0FF`) — brighter blue for dark backgrounds.
- **Text:** `#F1F5F9` headings/body; muted `#94A3B8`.
- **Borders:** `#2D3E50`; accent `#1E40AF`.

### Print
QR skylt A4 output always uses light tokens (`@media print`).

- **Typography:** Inter (Sans-serif) — modern geometric sans with strong heading weights (700+).
- Use semantic tokens (`brand-foreground`, `surface`, `surface-muted`, `subtle`) — never raw `slate-*` / `stone-*` in TSX.

## UX Principles
- **Touch Targets:** Minimum 48px for all interactive elements (Mobile First).
- **Interactivity:** Every button and interactive element **must** show a `pointer` cursor on hover.
- **Simplicity:** Minimize visual noise. Focus on the core action (Add to cart, Pay).

## CSS Standards
- Use Tailwind CSS utility classes with `@theme` tokens (`brand`, `brand-foreground`, `success`, etc.).
- Custom base styles and global overrides belong in `src/styles/app.css`.
- Primary buttons: 8px border-radius, subtle blue shadow on hover.
- Cards/panels: 12px border-radius, thin light borders, minimal gray shadows.

## Treasurer dashboard (`/admin/org/{orgId}`)

Surfaces for **owner** and **treasurer** roles only (editors see assigned kiosk cards without org KPIs).

- **Canonical route:** `/admin/org/{orgId}` — `/admin` redirects to first org
- **Layout:** White page background; KPI row in four equal cards; filter pills use brand blue active state.
- **Filters:** Period pills (Idag, Igår, Helgen, 7/30 dagar, Anpassat) + optional kiosk dropdown.
- **Kiosk cards:** Period + Idag + Helgen revenue snapshots; senaste köp per kiosk.
- **Lists:** Senaste köp (org-wide), toppartiklar.
- **Export panel:** Primary CSV button, secondary SIE button; same filter context as KPIs.
- **Role gating:** Export, billing, and member management hidden from editors in nav and UI.

## Billing (`/admin/billing`)

- Trial status chips; checkout buttons (kort / faktura) when Stripe configured.
- Customer Portal link for active subscriptions.
- Org settings: organisationsnummer, SIE-konto, **föreningslogotyp** (PNG/JPG upload).

## Members (`/admin/medlemmar`)

- Invite form: email, role (lagledare/kassör), kiosk checkboxes for editors.
- Member list: assigned kiosker, inline edit (roll + kiosk-tilldelning), remove.
- Pending invitations with kiosk assignments.

## QR skylt (`/admin/{shopId}/skylt`)

- Screen preview + A4 print layout.
- Optional org logo above kiosk name (uploaded under Fakturering).
- Print header retains `qrbutik.se` branding.
