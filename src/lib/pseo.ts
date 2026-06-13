import pseoData from './pseo-data.json'

export type PseoSport = {
  slug: string
  name: string
  environment: 'indoor' | 'outdoor'
  season: 'summer' | 'winter'
  matchContext: string
  crowdContext: string
  commonItems: Array<string>
  operationalNotesVariants: Array<Array<string>>
}

export type PseoCity = {
  slug: string
  name: string
  region: string
  heritageTextVariants: Array<string>
  localNotesVariants: Array<Array<string>>
  useCasesVariants: Array<Array<string>>
  officialLinks: Array<{ label: string; url: string }>
}

export type PseoPage = {
  sport: PseoSport
  city: PseoCity
  slug: string
}

type SportReplaceCtx = {
  sport: string
  sportLower: string
  matchContext: string
  crowdContext: string
  environmentTitle: string
  seasonTitle: string
}

const replaceSportTokens = (input: string, ctx: SportReplaceCtx) =>
  input
    .replaceAll('{sport}', ctx.sport)
    .replaceAll('{sportLower}', ctx.sportLower)
    .replaceAll('{matchContext}', ctx.matchContext)
    .replaceAll('{crowdContext}', ctx.crowdContext)
    .replaceAll('{environmentTitle}', ctx.environmentTitle)
    .replaceAll('{seasonTitle}', ctx.seasonTitle)

const sportIntroVariants: Array<string> = [
  'Styrelse och kassör i {sportLower}föreningen behöver kiosker som håller när det är {crowdContext}. QRButik ger hela klubben ett gemensamt system — flera kiosker, Swish och export.',
  'QRButik är byggt för {sportLower}föreningar som vill slippa manuell kassa och samla all försäljning på ett ställe. Perfekt vid {matchContext}.',
  'Med klubblicens får er {sportLower}förening obegränsat antal kiosker, central överblick och export — utan app eller dyra kassaintegrationer.',
]

const sportClosingVariants: Array<string> = [
  'Starta 14 dagars provperiod och sätt upp kiosker för lag och cuper under samma licens.',
  'Ge kassören kontroll över hela föreningens kioskförsäljning — från provperiod till export.',
  'Ett kiosksystem för hela {sportLower}föreningen, inte en kiosk i taget.',
]

const sportFaq: Array<{ question: string; answer: string }> = [
  {
    question: 'Vad kostar QRButik för vår förening?',
    answer:
      'Klubblicens från 995 kr per månad omfattar obegränsat antal kiosker under samma organisation. Ni får 14 dagars provperiod utan betalning vid registrering.',
  },
  {
    question: 'Passar QRButik för {sportLower}föreningar?',
    answer:
      'Ja. Systemet är anpassat för föreningskiosker vid {matchContext} och liknande arrangemang — med flera lag, kiosker och kassörer under samma tak.',
  },
  {
    question: 'Hur tar vi betalt i kiosken?',
    answer:
      'Besökarna skannar QR-koden, väljer varor och betalar med Swish direkt till föreningens eget nummer. Ingen Swish Business API krävs.',
  },
  {
    question: 'Kan flera lag ha egna kiosker?',
    answer:
      'Ja. Under samma klubblicens kan ni skapa kiosker per lag, plan eller cup — och kassören ser all försäljning centralt.',
  },
  {
    question: 'Hur fungerar bokföring och export?',
    answer:
      'Kassör och styrelse exporterar transaktioner till CSV eller SIE för Fortnox och Visma — per kiosk eller för hela föreningen.',
  },
  {
    question: 'Vem ska använda QRButik?',
    answer:
      'QRButik riktar sig till idrottsföreningar och cuparrangörer — styrelse, kassör och lagledare — inte privatpersoner på loppis.',
  },
]

const sportBenefitVariants: Array<string> = [
  'Central överblick för kassör och styrelse över alla kiosker.',
  'Swish-betalning till föreningens eget nummer — rätt belopp varje gång.',
  'Export till CSV och SIE för enkel bokföring efter cup och helg.',
  'Ingen app, ingen installation — QR och webbläsare räcker.',
  'Obegränsat antal kiosker under samma klubblicens.',
]

const sportHowItWorksSteps: Array<{ title: string; description: string }> = [
  {
    title: 'Skapa förening',
    description:
      'Registrera klubben och starta 14 dagars provperiod — utan betalkort.',
  },
  {
    title: 'Lägg till kiosker',
    description:
      'Sätt upp kiosk per lag, cup eller plan. Ange Swish-nummer och varor.',
  },
  {
    title: 'Överblick och export',
    description:
      'Kassören följer försäljningen live och exporterar till bokföring.',
  },
]

const sportProblemsTitleVariants: Array<string> = [
  'Kiosken ska inte bli kassörens sämsta jobb.',
  'Manuell kassa fungerar inte när det är {crowdContext}.',
  '500 Swish till olika lagkassor skapar kaos i bokföringen.',
]

const sportProblemsBulletsVariants: Array<Array<string>> = [
  [
    'Räkna totalsumman i huvudet vid {matchContext}.',
    'Swish-betalningar spridda över flera lag och konton.',
    'Timmar med manuell avstämning efter cup och helg.',
    'Ingen samlad bild av vad varje kiosk sålt.',
  ],
  [
    'Köer växer när det är {crowdContext}.',
    'Handskrivna listor och felräkning under stress.',
    'Kassören jagar kvitton mellan olika Swish-nummer.',
    'Svårt att rapportera till styrelsen efteråt.',
  ],
  [
    'Varje lag kör egen kassa utan gemensam struktur.',
    'Export till bokföring blir manuellt pussel varje månad.',
    'Ingen rollstyrning — alla ser allt eller inget.',
    'Extra administration för ideella kassörer.',
  ],
]

const sportSolutionTitleVariants: Array<string> = [
  'Ett kiosksystem för hela {sportLower}föreningen.',
  'Styrelse och kassör i kontroll — lagledare kör kiosken.',
  'Från kö till export utan Excel.',
]

const sportSolutionBulletsVariants: Array<Array<string>> = [
  [
    'Flera kiosker under samma klubblicens och organisation.',
    'Swish deep links till föreningens nummer — utan Business API.',
    'Central dashboard och export till CSV/SIE.',
    'Roller: owner, kassör och lagledare med rätt åtkomst.',
  ],
  [
    'Digital meny som uppdateras direkt för alla kiosker.',
    'Kunderna beställer själva — kortare köer vid {matchContext}.',
    'Live-översikt över inkommande köp i admin.',
    'Samma flöde för cup, serie och träningsmatch.',
  ],
  [
    '14 dagars provperiod utan kort vid registrering.',
    'Klubblicens från 995 kr/mån — en faktura för hela klubben.',
    'QR-skylt för mobil, surfplatta eller utskrift.',
    'Byggt för svenska idrottsföreningar och ideellt arbete.',
  ],
]

const comparePoints: Array<{ title: string; points: Array<string> }> = [
  {
    title: 'Innan',
    points: [
      'Manuell kassa och spridda Swish-nummer.',
      'Kassören sammanställer i Excel efter varje event.',
      'Ingen gemensam överblick över lagens kiosker.',
    ],
  },
  {
    title: 'Med QRButik',
    points: [
      'Digital kiosk med Swish till föreningens nummer.',
      'Central export till bokföring — CSV och SIE.',
      'Alla kiosker under samma klubblicens.',
    ],
  },
]

const environmentCopy = {
  indoor: {
    title: 'Inomhusflöde',
    text: 'I hallmiljö är pauserna korta och köerna långa. QRButik håller flödet rörligt när publiken vill handla snabbt.',
  },
  outdoor: {
    title: 'Utomhusflöde',
    text: 'Utomhusmatcher och cuper betyder högt tempo och många spontana köp. QRButik ger tydlig kiosk även när trycket är som störst.',
  },
}

const seasonCopy = {
  summer: {
    title: 'Sommarsäsong',
    text: 'Cuper och sommarseriespel kräver kiosker som klarar hög belastning. QRButik skalar med antal kiosker under samma licens.',
  },
  winter: {
    title: 'Vintersäsong',
    text: 'Inomhussäsong med täta matcher — kiosken ska vara snabb och enkel för ideella kassörer.',
  },
}

const buildSlug = (sportSlug: string, citySlug: string) =>
  `/utforska/${sportSlug}/${citySlug}`

const buildSportHubSlug = (sportSlug: string) => `/utforska/${sportSlug}`

const pickVariant = <T,>(variants: Array<T>, seed: string): T => {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % variants.length
  }
  return variants[hash]
}

export const getAllSports = (): Array<PseoSport> =>
  pseoData.sports as Array<PseoSport>

export const getAllCities = (): Array<PseoCity> =>
  pseoData.cities as Array<PseoCity>

export const getSportBySlug = (slug: string) =>
  getAllSports().find((sport) => sport.slug === slug)

export const getCityBySlug = (slug: string) =>
  getAllCities().find((city) => city.slug === slug)

export const getAllPseoPages = (): Array<PseoPage> => {
  const sports = getAllSports()
  const cities = getAllCities()

  return sports.flatMap((sport) =>
    cities.map((city) => ({
      sport,
      city,
      slug: buildSlug(sport.slug, city.slug),
    })),
  )
}

export const getPseoPagesForSport = (sportSlug: string): Array<PseoPage> => {
  const sport = getSportBySlug(sportSlug)
  if (!sport) {
    return []
  }

  return getAllCities().map((city) => ({
    sport,
    city,
    slug: buildSlug(sport.slug, city.slug),
  }))
}

export const getPseoSportCopy = (sportSlug: string) => {
  const sport = getSportBySlug(sportSlug)
  if (!sport) {
    return null
  }

  const seed = sport.slug
  const environment = environmentCopy[sport.environment]
  const season = seasonCopy[sport.season]
  const operationalNotes = pickVariant(sport.operationalNotesVariants, seed)

  const replaceCtx: SportReplaceCtx = {
    sport: sport.name,
    sportLower: sport.name.toLowerCase(),
    matchContext: sport.matchContext,
    crowdContext: sport.crowdContext,
    environmentTitle: environment.title,
    seasonTitle: season.title,
  }

  return {
    sport,
    intro: replaceSportTokens(pickVariant(sportIntroVariants, seed), replaceCtx),
    closing: replaceSportTokens(
      pickVariant(sportClosingVariants, seed),
      replaceCtx,
    ),
    benefits: sportBenefitVariants.map((benefit) =>
      replaceSportTokens(benefit, replaceCtx),
    ),
    problems: {
      title: replaceSportTokens(
        pickVariant(sportProblemsTitleVariants, seed),
        replaceCtx,
      ),
      bullets: pickVariant(sportProblemsBulletsVariants, seed).map((item) =>
        replaceSportTokens(item, replaceCtx),
      ),
    },
    solution: {
      title: replaceSportTokens(
        pickVariant(sportSolutionTitleVariants, seed),
        replaceCtx,
      ),
      bullets: pickVariant(sportSolutionBulletsVariants, seed).map((item) =>
        replaceSportTokens(item, replaceCtx),
      ),
    },
    compare: comparePoints,
    steps: sportHowItWorksSteps,
    faq: sportFaq.map((item) => ({
      question: replaceSportTokens(item.question, replaceCtx),
      answer: replaceSportTokens(item.answer, replaceCtx),
    })),
    matchContext: sport.matchContext,
    crowdContext: sport.crowdContext,
    commonItems: sport.commonItems,
    environment,
    season,
    operationalNotes,
  }
}

/** @deprecated City pages redirect to sport hub — kept for legacy route redirects. */
export const getPseoCopy = (sportSlug: string, _citySlug: string) =>
  getPseoSportCopy(sportSlug)

export const getPseoSlug = buildSlug
export const getPseoSportHubSlug = buildSportHubSlug
