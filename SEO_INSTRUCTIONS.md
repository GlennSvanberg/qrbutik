# SEO-instruktioner (QRButik)

> **Strategisk pivot (2025):** Intent-baserad B2B-SEO — inte mass-P-SEO på sport×stad.  
> Operativ plan: [`ROADMAP.md`](./ROADMAP.md) Fas 4.

---

## Princip

Ranka på sökord där **köparen är en förening som letar kiosksystem** — inte besökare som letar matchtider eller tabeller.

| Gör | Gör inte |
|-----|----------|
| "Digitalt kiosksystem idrottsförening" | "Fotboll i Kinna" |
| "Kassa till fotbollscup" | Sport×stad-matris i stor skala |
| "Swish kiosk förening" | Tunn lokalsida utan köpintention |
| Landningssidor med trial-CTA | Passiv trafik utan konvertering |

---

## Sidtyper (prioritet)

### 1. Intent-landningssidor (nytt, hög prioritet)

Placering: `/losningar/{slug}` eller liknande.

Varje sida ska innehålla:

- **Problem** — köer, fel växel, manuell bokföring, 500 Swish mot olika lagkassor
- **Lösning** — QRButik för hela föreningen, export, flera kiosker
- **Pris / trial** — "14 dagars gratis", klubblicens 995–1 495 kr/mån
- **Social proof** — pilotcitat, föreningslogotyper (när tillgängligt)
- **FAQ** — schema.org FAQPage
- **CTA** — "Boka demo" / "Starta trial"

Förslag på första sidor:

| Slug | Primärt sökord |
|------|----------------|
| `digitalt-kiosksystem-idrottsförening` | digitalt kiosksystem idrottsförening |
| `kassa-fotbollscup` | kassa fotbollscup / kiosksystem cup |
| `swish-kiosk-forening` | swish kiosk förening |
| `kiosksystem-sommar-cup` | kiosksystem sommarcup |

### 2. Startsida & prissida

- B2B-copy: styrelse, kassör, förening — inte "skapa butik på 2 min" för föräldrar
- Tydlig klubblicens-prissättning
- Trial-CTA above the fold

### 3. Gammal P-SEO (`/utforska/{sport}/{city}`)

**Status: ska bort — greenfield, ingen trafik att bevara.**

- Ta bort routes, `pseo-data.json`, sitemap-poster och build-script för P-SEO
- Alternativt `noindex` tillfälligt om borttagning sker i etapper
- Lägg **inte** tid på att underhålla sport×stad-sidor

Arkiv (endast referens vid städning): [`PSEO_INSTRUCTIONS.md`](./PSEO_INSTRUCTIONS.md).

---

## Tekniskt

1. Uppdatera `public/sitemap-static.xml` (eller build-script) med intent-sidor först
2. Meta title/description per sida — inkludera primärt keyword + "för idrottsföreningar"
3. Internlänkning: startsida → lösningssidor → `/skapa` eller trial-checkout
4. `public/llms.txt` — uppdaterad B2B-positionering

---

## Mätning

- Spåra `source` på organisation vid registrering (SEO-slug, cup-pilot, referral)
- Mål: konvertering intent-trafik → trial → betalande — inte rå sidvisningar

---

## Aktiv distribution (kompletterar SEO)

SEO räcker inte under cup-säsongen. Parallellt:

- Lista cuparrangörer → e-post/telefon → gratis pilot
- Case studies från piloter → in på intent-sidor

Se ROADMAP Fas 4.2.
