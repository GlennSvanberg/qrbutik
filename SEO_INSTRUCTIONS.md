# SEO-instruktioner (QRButik)

> **Strategi (2025):** Intent-baserad B2B-SEO — inte sport×stad-matris.  
> Operativ plan: [`ROADMAP.md`](./ROADMAP.md) Fas 4.

---

## Princip

Ranka på sökord där **köparen är en förening som letar kiosksystem** — inte besökare som letar matchtider eller tabeller.

| Gör | Gör inte |
|-----|----------|
| "Digitalt kiosksystem idrottsförening" | "Fotboll i Kinna" |
| "Kiosksystem för fotbollsföreningar" | Sport×stad-matris i stor skala |
| "Swish kiosk förening" | Tunn lokalsida utan köpintention |
| Landningssidor med trial/demo-CTA | Passiv trafik utan konvertering |

---

## Sidtyper (prioritet)

### 1. Startsida & onboarding

- B2B-copy: styrelse, kassör, förening
- Tagline: **Digital kiosk för hela föreningen**
- Pris: **från 995 kr/mån**, 14 dagars provperiod
- CTAs: **Starta 14 dagars provperiod** + **Boka demo** (`/kontakt`)

### 2. Intent-sidor (`/losningar/...`, planerade)

Småskaliga landningssidor med köpintention, t.ex. `/losningar/digitalt-kiosksystem-idrottsförening`, `/losningar/kassa-fotbollscup`. Se ROADMAP 4.1.2.

Varje sida ska innehålla:

- **Problem** — köer, manuell bokföring, spridda Swish-nummer
- **Lösning** — klubblicens, flera kiosker, central överblick, export
- **Pris / trial** — från 995 kr/mån, 14 dagars provperiod
- **FAQ** — schema.org FAQPage
- **CTA** — provperiod + boka demo

De gamla programmatiska sport/stad-sidorna (`/utforska/*`, `pseo-data.json`) togs bort 2026-09-27 — ingen trafik att bevara.

### 3. Kontakt / demo

`/kontakt` — mejl till `kontakt@qrbutik.se` + länk till provperiod.

---

## Tekniskt

1. `public/sitemap*.xml` + `public/robots.txt` — statiska filer (ingen generator): `/`, `/skapa`, `/kontakt`
2. Meta title/description per sida — primärt keyword + "för idrottsföreningar"
3. Internlänkning: startsida → intent-sidor → provperiod
4. `public/llms.txt` — B2B-positionering
5. Varumärke: **QRButik** (konsekvent casing)

---

## Mätning

- Mål: konvertering intent-trafik → trial → betalande — inte rå sidvisningar
- `source`-spårning kan läggas till senare vid registrering

---

## Aktiv distribution (kompletterar SEO)

SEO räcker inte under cup-säsongen. Parallellt:

- Lista cuparrangörer → e-post/telefon → gratis pilot
- Case studies från piloter → in på sport-sidor (när tillgängligt)

Se ROADMAP Fas 4.2.
