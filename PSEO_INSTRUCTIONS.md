# P-SEO Instructions (QRButik) — DEPRECATED / TA BORT

> **⚠️ Ska raderas:** Mass-P-SEO på sport×stad ger låg köpintention. Inga aktiva butiker eller SEO-trafik att bevara (greenfield).  
> **Aktiv SEO-strategi:** [`SEO_INSTRUCTIONS.md`](./SEO_INSTRUCTIONS.md).  
> **Roadmap:** [`ROADMAP.md`](./ROADMAP.md) Fas 4.1 — ta bort `/utforska/*`, `pseo-data.json`, relaterade routes och sitemap.

**Lägg inte till nytt innehåll här.** Använd filen bara som checklista vid borttagning av P-SEO-kod.

---

## Arkiv: hur P-SEO fungerade

This guide explains how to add P-SEO content (cities + sports) for existing pages.

## Where to edit
- `src/lib/pseo-data.json` is the only source of truth.
- Every sport × city in this file becomes a live page at `/utforska/{sportSlug}/{citySlug}`.
- The sitemap and robots are generated from this same data.

## Add a new sport
In `src/lib/pseo-data.json`, add a new entry under `sports` with:
- `slug` (lowercase, a-z, no spaces, no diacritics)
- `name` (display name)
- `environment` (`indoor` or `outdoor`)
- `season` (`summer` or `winter`)
- `matchContext`, `crowdContext` (short, truthful descriptions)
- `commonItems` (4–6 realistic kiosk items)
- `operationalNotesVariants` (3 variant arrays, 2–3 bullets each)

Guidelines:
- Keep claims true and generic enough to apply widely.
- Make the operational notes specific to the sport’s flow (pause length, venue, crowd behavior).
- Avoid marketing fluff; focus on practical kiosk needs.

## Add a new city
In `src/lib/pseo-data.json`, add a new entry under `cities` with:
- `slug` (lowercase, a-z, no spaces, no diacritics)
- `name`, `region`
- `heritageTextVariants` (3 short variants about the city + why QRButik helps)
- `localNotesVariants` (3 variant arrays, 2 bullets each)
- `useCasesVariants` (3 variant arrays, 2 bullets each)
- `officialLinks` (2–3 trusted official links, with label + url)

Guidelines:
- Keep city text accurate and modest (no fake claims).
- Make local notes about realistic event flow and audience behavior.
- Official links should be stable (municipality + official visitor/tourism site).

## Requested expansion: Gothenburg–Strömstad corridor
Add these 10 cities between Göteborg and Strömstad:
- Tjörn
- Orust
- Uddevalla
- Ljungskile
- Lilla Edet
- Munkedal
- Tanumshede
- Grebbestad
- Fjällbacka
- Lysekil

## Requested expansion: Gothenburg–Varberg/Borås area
Add these 10 cities between Göteborg and Varberg/Borås:
- Borås
- Varberg
- Bollebygd
- Kinna
- Svenljunga
- Tranemo
- Ulricehamn
- Falkenberg
- Gislaved
- Hylte


## When you add new entries
1. Update `src/lib/pseo-data.json`.
2. Run `npm run build` to regenerate `public/sitemap.xml` and `public/robots.txt`.
3. Verify the new URLs:
   - `http://localhost:5173/utforska/{sportSlug}/{citySlug}`
4. Check that the discover page shows the new combinations:
   - `http://localhost:5173/utforska`

## What makes a good P-SEO page (avoid thin content)
- Real, useful context (sport flow + city context).
- Clear internal links (`/skapa`, `/utforska`, related pages).
- No exaggerated claims; keep copy grounded.

## URL pattern summary
- Discover hub: `/utforska`
- Sport hub: `/utforska/{sportSlug}`
- P-SEO page: `/utforska/{sportSlug}/{citySlug}`
