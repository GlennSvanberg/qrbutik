# Design Specification - QRButik

## Theme: B2B Tech
The design should evoke **Trust, Speed, and Professionalism**. It should be clean, high-contrast, and mobile-first — suitable for sports clubs and event organizers.

## Theming & Colors
All theming should be maintained in `src/styles/app.css`.

- **Background:** `#FFFFFF` — crisp white, no warm gradients.
- **Primary (Buttons):** Electric Blue (`#1A73E8`, hover `#1656CB`) — primary CTAs, active states, key icons.
- **Text:** Charcoal (`#1C2B39`) for headings and body; muted (`#5F6B7A`) for secondary copy.
- **Success:** Green (`#34A853`) — checkmarks, verified payments, positive feedback.
- **Borders:** Light gray (`#E2E8F0`); accent borders (`#BFDBFE`) for highlighted cards.
- **Typography:** Inter (Sans-serif) — modern geometric sans with strong heading weights (700+).

## UX Principles
- **Touch Targets:** Minimum 48px for all interactive elements (Mobile First).
- **Interactivity:** Every button and interactive element **must** show a `pointer` cursor on hover.
- **Simplicity:** Minimize visual noise. Focus on the core action (Add to cart, Pay).

## CSS Standards
- Use Tailwind CSS utility classes with `@theme` tokens (`brand`, `brand-foreground`, `success`, etc.).
- Custom base styles and global overrides belong in `src/styles/app.css`.
- Primary buttons: 8px border-radius, subtle blue shadow on hover.
- Cards/panels: 12px border-radius, thin light borders, minimal gray shadows.
