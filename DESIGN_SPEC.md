# Design Specification - QRButik

## Theme: Swedish Minimalist
The design should evoke **Trust & Clarity**. It should be clean, functional, and mobile-first.

## Theming & Colors
All theming should be maintained in `src/styles/app.css`.

- **Background:** `#F8FAFC` (Slate 50) - light, airy, and trustworthy.
- **Primary (Buttons):** Deep Indigo (`#4338CA`) - stable and professional.
- **Success:** Emerald Green (`#10B981`) - for verified payments and positive feedback.
- **Typography:** Inter or Geist (Sans-serif) - modern and readable.

## UX Principles
- **Touch Targets:** Minimum 48px for all interactive elements (Mobile First).
- **Interactivity:** Every button and interactive element **must** show a `pointer` cursor on hover.
- **Simplicity:** Minimize visual noise. Focus on the core action (Add to cart, Pay).

## CSS Standards
- Use Tailwind CSS utility classes.
- Custom base styles and global overrides belong in `src/styles/app.css`.
