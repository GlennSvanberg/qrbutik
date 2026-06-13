# QRButik — Roadmap till 10 000 kr MRR

> **Referensdokument.** Checka av `[ ]` → `[x]` när varje punkt är klar.  
> **Senast uppdaterad:** 2025-06-13

---

## Greenfield — ingen bakåtkompatibilitet

**Det finns inga aktiva butiker och inga betalande användare i produktion.**

Det innebär:

- **Inga migreringsscript** — byt schema och kod direkt; töm dev-deployment vid behov
- **Inga övergångsperioder** — ta bort 10/99 kr-modellen helt, inte parallellt
- **Ingen dual write** — `shopActivations`, pass-fält på `shops`, manuell Swish-aktivering: **radera**, inte mappa om
- **Schema från scratch** — `shops` skapas med obligatorisk `organizationId`; prenumeration styrs av `organizations`, inte per-butik-pass
- **P-SEO** (`/utforska/*`) kan tas bort eller skrivas om fritt — inget att bevara för trafik

**Implikation för agenter:** Förenkla alltid. Välj ren ersättning framför kompatibilitetslager.

---

## Norra stjärnan

| Mål | Värde |
|-----|-------|
| **MRR-mål** | 10 000 kr/månad |
| **Kundtyp** | Idrottsföreningar & sommarcuper (B2B) — **inte** privatpersoner/loppis |
| **Prismodell** | Klubblicens: **995 kr/månad** (en plan) |
| **Antal kunder** | 7–10 betalande föreninger |
| **Plattformsintäkter** | Stripe Billing (kort) — **inte** manuell Swish till privatnummer |
| **Kundbetalningar (kiosk)** | Fortfarande Swish deep links till föreningens/lagets eget nummer |

**Varför pivot?** 10 kr × 1 000 aktiveringar/månad = omöjligt säljarbete. En förening med budget och återkommande behov är rätt köpare.

---

## Fas 0 — Beslut & förberedelse

Riktning och scope innan kod.

- [x] **0.1** En plan: **995 kr/mån** (inga prisnivåer i MVP)
- [x] **0.2** Klubblicens = obegränsat antal kiosker under samma org
- [x] **0.3** 14 dagars trial **utan kort** tills Stripe är aktivt; kort via Checkout senare
- [ ] **0.4** Skapa Stripe-konto (Test + Live), svensk moms, företagsuppgifter — *manuellt av ägare; Test Mode via `npm run stripe:sandbox`*
- [x] **0.5** Juridiska sidor: MVP-utkast på `/villkor` och `/integritet` (kompletteras före live-fakturering)

---

## Fas 1 — Affärsmodell (största intäktsstoppet)

Ersätt engångspass-modellen med föreningslicens — **ren rewrite, ingen migrering**.

### 1.0 Inloggning & åtkomst

- [x] **1.0.1** Dedikerad `/logga-in` med magic link och redirect-parameter
- [x] **1.0.2** `AuthGate` på `/admin` och `/skapa` — borttagen duplicerad login-UI
- [x] **1.0.3** `convex/lib/auth.ts` + custom functions (`authedQuery`, `orgMutation`)
- [x] **1.0.4** Login-first `/skapa` — skapa förening (trialing utan Stripe); kiosk separat i admin
- [x] **1.0.5** Sign out i admin
- [x] **1.0.6** Server-side org-medlemskap ersätter `ownerEmail`

### 1.1 Radera gammal modell (kod + schema)

- [x] **1.1.1** Ta bort all UI för Event-pass (10 kr) och Säsongs-pass (99 kr): `/skapa`, `/admin/.../settings`, startsida
- [x] **1.1.2** Ta bort manuell Swish-aktivering till `0735029113` och all plattforms-Swish-logik
- [x] **1.1.3** **Radera** tabellen `shopActivations` ur `schema.ts` och alla Convex-funktioner som refererar den
- [x] **1.1.4** **Radera** pass-fält ur `shops`: `activationStatus`, `activationPlan`, `activeFrom`, `activeUntil`, `lastActivatedAt`, `verificationStatus` (plattform)
- [x] **1.1.5** Ta bort `deactivateShopIfExpired`, `activateShop`, `verifyShopActivation` och liknande pass-cron
- [x] **1.1.6** Töm Convex dev-data efter schema-byte om deployment klagar (inga prod-kunder att bevara)

### 1.2 Ny datamodell: organisation & klubblicens

- [x] **1.2.1** Tabell `organizations`: namn, org-nummer (valfritt), faktura-e-post, `stripeCustomerId`, `subscriptionStatus`, `trialEndsAt`
- [x] **1.2.2** Tabell `organizationMembers`: `organizationId`, e-post, roll (`owner` | `treasurer` | `editor`)
- [x] **1.2.3** `shops`: obligatorisk `organizationId`; ta bort `ownerEmail` — åtkomst enbart via `organizationMembers`
- [x] **1.2.4** Regel: `organizations.subscriptionStatus` styr om kiosker får ta emot köp (inte per-shop-pass)

### 1.3 Ny köpupplevelse för föreningen

- [x] **1.3.1** Ny landningssida/sektion: "Klubblicens för idrottsföreningar" med B2B-priser
- [x] **1.3.2** Onboarding: `/skapa` = förening + planinfo (995 kr/mån); Stripe Checkout i `/admin/billing`
- [x] **1.3.3** Tydlig copy: fokus på styrelse/kansli — inte enskild förälder
- [x] **1.3.4** Avråd explicit från privatpersoner/loppis i copy

### 1.4 Mått för fas 1

- [x] Ingen ny kund kan betala 10/99 kr via Swish till plattformen
- [x] Minst en testorganisation kan skapas med aktiv licens (även manuellt i dev)

---

## Fas 2 — Stripe Billing (automatisera plattformsintäkter)

Sluta manuellt verifiera Swish på privatkonto.

### 2.1 Stripe-integration

- [x] **2.1.1** Installera Stripe SDK; env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `VITE_STRIPE_PUBLISHABLE_KEY`
- [x] **2.1.2** Skapa Stripe Products & Prices: månadslicens 995 kr/mån — `npm run stripe:setup`
- [x] **2.1.3** Convex HTTP webhook: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [x] **2.1.4** Synka prenumerationsstatus till `organizations.subscriptionStatus` i Convex
- [x] **2.1.5** Stripe Customer Portal: hantera kort, avsluta, ladda ner fakturor

### 2.2 Trial & checkout-flöde

- [x] **2.2.1** Trial utan kort vid org-skapande; Checkout aktiverar betalning efter trial
- [x] **2.2.2** Kortbetalning i checkout
- [x] **2.2.3** Alternativ: faktura via Stripe (PDF-faktura / invoice collection) för föreningar utan kort
- [x] **2.2.4** Efter lyckad checkout: org-status uppdateras via webhook
- [x] **2.2.5** E-postbekräftelse vid start, trial-slut, betalningsfel (Resend)

### 2.3 Säkerhet & drift

- [x] **2.3.1** Server-side auth på mutations som ändrar org/shop/billing
- [x] **2.3.2** Webhook-idempotens (spara `stripeEventId` för att undvika dubbelhantering)
- [ ] **2.3.3** Testa hela flödet i Stripe Test Mode innan live — *se `docs/STRIPE_GO_LIVE.md`; Live-konto (0.4) kvarstår hos ägare*

### 2.4 Mått för fas 2

- [x] Ny förening kan registrera sig, få trial, och aktiveras **utan manuell åtgärd** *(Stripe Test Mode + webhooks)*
- [x] Uppsägning/betalningsfel inaktiverar kiosker automatiskt (webhook + trial-expiry cron)

---

## Fas 3 — B2B-funktioner (motivera tusenlappen)

Värde för föreningens kassör och styrelse.

### 3.1 Centralt dashboard (kassör)

- [x] **3.1.1** Ny route `/org` eller `/admin/org/{orgId}` — översikt alla kiosker
- [x] **3.1.2** Visa: kiosknamn, lag/plan, status, dagens/helgens omsättning, senaste försäljning
- [x] **3.1.3** Aggregerad KPI: total omsättning per period, antal transaktioner, toppartiklar över alla kiosker
- [x] **3.1.4** Filter: datumintervall, enskild kiosk, "helgen"
- [x] **3.1.5** Roll `treasurer` / `owner` ser ekonomi; `editor` ser bara sin kiosk

### 3.2 Bokförings-export (säljarargument #1)

- [x] **3.2.1** Knapp: "Exportera till CSV" — transaktioner med datum, kiosk, belopp, referens, artiklar, status
- [x] **3.2.2** Knapp: "Exportera SIE" — format kompatibelt med Fortnox/Visma (version 4 typisk för SE)
- [x] **3.2.3** Export per kiosk eller hela föreningen
- [x] **3.2.4** Export per datumintervall (t.ex. "helgens cup")
- [x] **3.2.5** Dokumentera exportformat i hjälp/FAQ för kassörer

### 3.3 Multi-kassa / inbjudningar

- [x] **3.3.1** Org-owner kan bjuda in e-post som `editor` (lagledare)
- [x] **3.3.2** Editor: skapa/redigera produkter och se försäljning **för tilldelad kiosk** — inte hela föreningens ekonomi
- [x] **3.3.3** Owner/treasurer: bjuda in, ta bort medlemmar, tilldela kiosker
- [x] **3.3.4** Magic link eller inbjudningslänk med roll vid första inloggning
- [x] **3.3.5** Org-medlemmar kan skapa flera kiosker (P08 plan A, F09 plan B, …)

### 3.4 Övrigt B2B-värde (prioritera efter 3.1–3.3)

- [x] **3.4.1** Prenumerationshantering i admin (länk till Stripe Portal via `/admin/billing`)
- [x] **3.4.2** Föreningslogotyp på QR-skylt (valfritt, differentiering)
- [ ] **3.4.3** "Powered by QRButik" kan diskuteras — B2B kan vilja vit etikett senare

### 3.5 Mått för fas 3

- [x] Kassör kan på <5 min exportera helgens försäljning för bokföring
- [x] Minst två roller fungerar med korrekt åtkomstseparation

---

## Fas 4 — Marknadsföring & försäljning

Från passiv SEO till aktiv B2B-försäljning.

### 4.1 SEO — rikta om till köpintention

- [ ] **4.1.1** Ta bort eller noindex hela `/utforska/*` P-SEO (ingen trafik att bevara — greenfield)
- [ ] **4.1.2** Skapa 3–5 intent-landningssidor, t.ex.:
  - `/losningar/digitalt-kiosksystem-idrottsförening`
  - `/losningar/kassa-fotbollscup`
  - `/losningar/swish-kiosk-förening`
  - `/losningar/kiosksystem-sommar-cup`
- [ ] **4.1.3** Varje sida: problem → lösning → pris/trial-CTA → social proof → FAQ
- [ ] **4.1.4** Uppdatera startsida: B2B-fokus, klubblicens, inte 10/99 kr
- [ ] **4.1.5** Uppdatera `sitemap` — endast intent-sidor + kärn-sidor (ta bort P-SEO-URL:er)
- [ ] **4.1.6** Radera `PSEO_INSTRUCTIONS.md` och ev. `pseo-data.json` när intent-sidor finns (valfritt steg)

### 4.2 Aktiv distribution (sommaren)

- [ ] **4.2.1** Lista 30–50 sommarcuper / cuparrangörer (datum, kontakt, sport)
- [ ] **4.2.2** E-postmall + kort pitch: erbjud **gratis pilot** under cupen mot feedback + case study
- [ ] **4.2.3** Ringa/uppfölja 5–10 arrangörer per vecka
- [ ] **4.2.4** Mål: 3 piloter live → 2 konverterar till betalande inom 30 dagar efter cup
- [ ] **4.2.5** Samla citat/logotyper från pilotföreningar till landningssida

### 4.3 Säljmaterial

- [ ] **4.3.1** En-sida PDF för styrelse: ROI, bokföring, trial, pris
- [ ] **4.3.2** Demo-video: skapa kiosk → QR → Swish → export (2–3 min)
- [ ] **4.3.3** Prissida med tydlig jämförelse mot manuell kassa / Excel
- [x] **4.3.4** Persistent demokiosk (`/s/demo`) + landningslänk + seed-script

### 4.4 Mått för fas 4

- [ ] 10 betalande föreningar **eller** 10 000 kr MRR
- [ ] Spårning: varje kund har `source` (pilot, cup, SEO-sida, referral)

---

## Fas 5 — Teknisk skuld & kvalitet (parallellt)

Gör under fas 1–3 där det blockerar.

- [x] **5.1** Server-side auth på alla Convex-funktioner (`getUserIdentity` + org/roll-check)
- [x] **5.2** Ta bort hårdkodat plattforms-Swish-nummer från kodbasen
- [x] **5.3** Uppdatera `DESIGN_SPEC.md` om B2B-dashboard kräver ny layout (tabeller, export-knappar)
- [x] **5.4** E2E-test: trial → skapa kiosk → kundköp → export

---

## Vad vi **inte** ska göra (medvetet nej)

| Gammalt fokus | Nytt beslut |
|---------------|-------------|
| Sälja till privatpersoner på loppis | Nej — ingen produkt/marknadsföring dit |
| 10 kr / 99 kr Swish-pass | Nej — avvecklas |
| Manuell Swish-verifiering till 073-nummer | Nej — Stripe webhooks |
| Ranka på "Fotboll i Kinna" (informativ trafik) | Ta bort P-SEO — lågintent |
| Swish Business API för kundbetalningar | Nej (oförändrat) — deep links räcker för kiosken |
| Migrering / bakåtkompatibilitet | Nej — inga aktiva butiker eller betalande kunder |

---

## Tidslinje (förslag)

| Vecka | Fokus |
|-------|-------|
| 1 | Fas 0 + Fas 1.1–1.2 (schema, ta bort gamla pass i UI) |
| 2 | Fas 2 (Stripe checkout + webhooks) |
| 3–4 | Fas 3.1–3.2 (dashboard + export) |
| 4–5 | Fas 3.3 (roller/inbjudningar) + Fas 4.2 (cup-piloter parallellt) |
| Löpande | Fas 4.1 (intent-SEO), Fas 5 (auth-skuld) |

*Justera efter tillgänglig tid — cup-säsongen är tidskritisk för Fas 4.2.*

---

## Relaterade dokument

| Fil | Syfte |
|-----|-------|
| `plan.md` | Produktvision & teknisk översikt |
| `AGENTS.md` | Instruktioner för AI-agenter |
| `SEO_INSTRUCTIONS.md` | SEO-strategi (intent, inte stad×sport) |
| `DESIGN_SPEC.md` | Visuell design |

---

## Changelog

| Datum | Ändring |
|-------|---------|
| 2025-06-13 | Initial roadmap baserad på konsultrekommendation (B2B, Stripe, 10k MRR) |
| 2025-06-13 | Greenfield: ingen bakåtkompatibilitet (inga aktiva butiker/betalande) |
| 2025-06-13 | Fas 3: `/admin/org/{orgId}`, dashboard-polish, medlemshantering UI, org-logotyp, STRIPE_GO_LIVE.md |
