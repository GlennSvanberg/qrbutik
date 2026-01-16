# QRButik.se – "Kiosken på burk" 🇸🇪

QRButik är en micro-SaaS optimerad för den svenska föreningsmarknaden. Den eliminerar huvudvärk vid försäljning i kiosker, loppisar och idrottsevenemang genom att erbjuda en dynamisk digital varukorg kopplad till Swish-betalningar, utan behov av dyra företagskonton eller komplexa integrationer.

---

## 🚀 Vision & Kärnfunktionalitet

### För Skaparen (Lagledaren/Föräldern)
- **Snabbstart:** Skapa en butik på under 2 minuter genom att ange butiksnamn, Swish-nummer och lägga till produkter.
- **Lösenordslös Admin:** Ingen kontoskapande krävs initialt. En "Magic Link" skickas till e-posten för att hantera butiken.
- **Dashboard:** Se inkommande transaktioner i realtid. Verifiera betalningar mot kundens skärm med hjälp av de sista 4 siffrorna i deras telefonnummer.
- **PDF-skylt:** Generera en snygg A4-skylt (PDF) direkt i webbläsaren med butikens unika QR-kod.

### För Kunden (Köparen)
- **Smidig Varukorg:** Scanna QR-koden, välj varor i ett mobiloptimerat gränssnitt.
- **Direktbetalning:** Tryck på "Betala med Swish" → Swish-appen öppnas automatiskt med rätt belopp, mottagare och ett unikt referensnummer ifyllt.
- **Digitalt Kvitto:** Efter att ha klickat på betala visas en kvittovy som kunden visar upp för personalen för att hämta sina varor.

---

## 🛠 Teknisk Stack

- **Framework:** [TanStack Start](https://tanstack.com/router/latest/docs/framework/react/start/overview) (SSR, Typsäkerhet, SEO).
- **Databas & Realtid:** [Convex](https://convex.dev/) (Realtidssynk för admin-vyn, edge functions).
- **Auth:** [Better Auth](https://www.better-auth.com/) (Hanterar Magic Links och sessioner).
- **E-post:** [Resend](https://resend.com/) (Leverans av Magic Links och säljrapporter).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Ren "Swedish Minimalist"-design).
- **PDF:** `react-pdf` eller liknande bibliotek för generering på klientsidan.

---

## 🔐 Auth & Access-modell

1. **Butiksaccess:** Varje butik har en unik administrativ URL (Magic Link).
2. **Global Dashboard:** Genom att logga in med sin e-post kan en användare få en länk som listar *alla* butiker de har skapat.
3. **Säkerhet:** Better Auth hanterar sessionshantering. Ingen lagring av lösenord.

---

## 💸 Betalningsflöde (Deep Linking)

Vi använder **inte** Swish Business API (för att hålla tröskeln låg).
1. Kunden klickar "Betala".
2. Systemet skapar en transaktionspost i Convex med status `pending`.
3. Systemet genererar en `swish://`-länk:
   - `amount`: Totalsumma
   - `payee`: Säljarens Swish-nummer
   - `message`: "QRB-[Butiksnamn]-[4 sista siffror i kundens tel]"
4. Kunden slutför betalningen i Swish-appen.
5. Säljaren ser transaktionen dyka upp i sin realtids-vy och markerar den som `verified` när de sett pengarna på sitt eget konto.

---

## 🎨 Designspråk: "Trust & Clarity"

- **Färger:** Trygg blågrå (`#F8FAFC`), djup indigo för knappar, och en tydlig "Success Green" för verifierade betalningar.
- **UX:** Stora touch-ytor (min 48px), tydlig typografi (Inter/Geist), minimalt med brus.
- **Mobile First:** 95% av användningen sker i mobilen.

---

## 🗺 Roadmap

### Fas 1: Fundament (MVP)
- [ ] Setup TanStack Start + Convex + Better Auth.
- [ ] Schema för `shops`, `products`, och `transactions`.
- [ ] Grundläggande "Skapa butik"-flöde.

### Fas 2: Köpupplevelse
- [ ] Buyer view med varukorg.
- [ ] Swish deep-link generator.
- [ ] "Tack för ditt köp"-sida med instruktioner till personalen.

### Fas 3: Admin & PDF
- [ ] Realtids-dashboard för transaktioner.
- [ ] PDF-generator för A4-skylt med QR-kod.
- [ ] Magic Link e-postutskick via Resend.

### Fas 4: Polering & Growth
- [ ] Programmatisk SEO (Landningssidor för städer/nicher).
- [ ] Säljrapporter (Export till CSV/PDF).
- [ ] "Powered by QRButik.se" branding.
