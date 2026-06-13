# QRButik.se — Produktvision

> **Strategisk riktning (2025):** B2B SaaS för idrottsföreningar. Mål: 10 000 kr MRR via klubblicenser.  
> **Operativ plan:** Se [`ROADMAP.md`](./ROADMAP.md) för steg-för-steg med checkboxar.  
> **Greenfield:** Inga aktiva butiker eller betalande användare — byt schema och kod direkt utan migrering.

---

## Vad är QRButik?

QRButik (*"Kiosken på burk"*) är en svensk B2B-tjänst för **idrottsföreningar och sommarcuper** som vill digitalisera kioskförsäljning med Swish — utan app, utan Swish Business API och utan dyra kassaintegrationer.

**Primär köpare:** Föreningens styrelse / kassör (inte enskild förälder eller privatperson på loppis).

**Primär användare:** Lagledare som kör kiosk vid match eller cup; föreningens kassör som behöver överblick och bokföring.

---

## Affärsmodell

| | Gammalt (raderas ur kodbasen) | Nytt |
|--|-------------------------------|------|
| Pris | 10 kr (48 h) / 99 kr (säsong) | **995 kr/månad** (klubblicens) |
| Köpare | Enskild förälder/lagledare | **Föreningen** (kansli/styrelse) |
| Betalning plattform | Manuell Swish till privatnummer | **Stripe Billing** (kort, faktura, 14 dagars trial) |
| Kundbetalning (kiosk) | Swish deep link → lagets nummer | Oförändrat |
| Dataägande | `ownerEmail` per butik | `organizations` + `organizationMembers` |
| MRR-mål | — | 7–10 föreningar ≈ 10 000 kr/månad |

---

## Kärnfunktionalitet

### För föreningen (B2B)

- **Klubblicens** — alla lag och kiosker under en organisation
- **Centralt dashboard** — kassör ser alla aktiva kiosker och aggregerad försäljning
- **Bokförings-export** — CSV/SIE för Fortnox/Visma (helgens cup på en knapp)
- **Roller** — owner/treasurer (ekonomi) vs editor/lagledare (egen kiosk, ingen helhets ekonomi)
- **Flera kiosker** — P08 plan A, F09 plan B, cupkiosk, etc.

### För lagledaren (editor)

- Skapa och hantera produkter för sin kiosk
- QR-skylt (skärm + A4-utskrift)
- Verifiera inkommande Swish-betalningar mot kvitto
- Realtidsförsäljning för sin kiosk

### För köparen (publik, ingen inloggning)

- Scanna QR → mobil meny → varukorg
- Betala med Swish (deep link till kioskens Swish-nummer)
- Digitalt kvitto att visa kassören

---

## Teknisk stack

| Lager | Teknik |
|-------|--------|
| Frontend | TanStack Start (SSR), Tailwind v4 |
| Backend / DB | Convex (realtid) |
| Auth | Better Auth (magic link) |
| **Plattformsbetalning** | **Stripe Billing** (prenumeration, trial, webhooks) |
| Kundbetalning (kiosk) | Swish `swish://` deep links (inget Business API) |
| E-post | Resend (magic links, onboarding, billing) |

---

## Auth & åtkomst (implementerat i Fas 1)

1. **Organisation** äger prenumeration och alla kiosker.
2. **Roller:** `owner`, `treasurer`, `editor` — enforced **server-side** i Convex via `organizationMembers`.
3. **Magic link** via `/logga-in` — lösenordslöst; `/skapa` och `/admin` kräver session.
4. **Köpare** behöver aldrig konto.

```
/logga-in → magic link → session
/skapa (inloggad) → createOrganization → org (trialing) + owner
/admin → skapa kiosk via /admin/skapa-kiosk; ShopAccessGate per kiosk
/admin/billing → Stripe Checkout / Portal (when env configured)
/s/{slug} → publikt; gated på org.subscriptionStatus
```

---

## Betalningsflöden

### A) Förening → QRButik (licens)

```
Styrelse → skapa förening (14 dagars trial utan kort) → lägg till kiosker i admin
  → vid behov: /admin/billing → Stripe Checkout (kort)
  → Webhook aktiverar organization → alla kiosker tillåtna
```

### B) Kund → förening (kiosk, oförändrat)

```
QR → varukorg → Swish deep link → pending transaction → kvitto
  → lagledare verifierar manuellt i admin
```

---

## Design

Se [`DESIGN_SPEC.md`](./DESIGN_SPEC.md) — B2B Tech: trust, tydlighet, 48px touch targets, Inter, electric blue.

Dashboard och export-ytor ska kännas **professionella för kassörer**, inte bara mobil-kiosk.

---

## Marknadsföring

- **Intent-SEO:** "digitalt kiosksystem idrottsförening", "kassa fotbollscup", etc.
- **Inte:** mass-P-SEO på sport×stad (låg köpintention).
- **Aktiv försäljning:** cuparrangörer, piloter, styrelsepitch.

Se [`SEO_INSTRUCTIONS.md`](./SEO_INSTRUCTIONS.md).

---

## Status

### Klart (MVP — enskild kiosk)

- [x] TanStack Start + Convex + Better Auth
- [x] Skapa butik, produkter, Swish-köp, kvitto
- [x] Admin per kiosk: försäljning, historik, produkter, skylt, inställningar
- [x] Magic link, flera butiker per e-post
- [x] Swish deep links för kundbetalning

### Pågående / planerat (B2B-pivot)

Se full lista i [`ROADMAP.md`](./ROADMAP.md):

- [ ] Klubblicens + organisation i schema
- [ ] Stripe Billing + trial
- [ ] Centralt föreningsdashboard
- [ ] CSV/SIE-export
- [ ] Roller & inbjudningar
- [ ] Intent-SEO + cup-piloter

### Raderas (greenfield — ingen migrering)

- [ ] Event/Säsongs-pass (10/99 kr) + tabell `shopActivations`
- [ ] Pass-fält på `shops`, `ownerEmail`, manuell Swish till plattformsnummer
- [ ] `/utforska/*` P-SEO (valfritt — kan tas bort helt)
