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

type ReplaceCtx = {
  sport: string
  sportLower: string
  city: string
  region: string
  matchContext: string
  crowdContext: string
  environmentTitle: string
  seasonTitle: string
}

const replaceTokens = (input: string, ctx: ReplaceCtx) =>
  input
    .replaceAll('{sport}', ctx.sport)
    .replaceAll('{sportLower}', ctx.sportLower)
    .replaceAll('{city}', ctx.city)
    .replaceAll('{region}', ctx.region)
    .replaceAll('{matchContext}', ctx.matchContext)
    .replaceAll('{crowdContext}', ctx.crowdContext)
    .replaceAll('{environmentTitle}', ctx.environmentTitle)
    .replaceAll('{seasonTitle}', ctx.seasonTitle)

const introVariants: Array<string> = [
  '{sport} i {city} kräver ett snabbt kioskflöde, tydliga priser och korta köer. QRButik gör det enkelt att sälja mer utan extra jobb.',
  'Föreningar som driver {sport} i {city} behöver en kiosk som rullar på även när trycket är högt. Med QRButik blir flödet smidigt.',
  'När {sport} spelas i {city} vill ingen stå och räkna i huvudet. QRButik ger er en digital kiosk som sparar tid.'
]

const closingVariants: Array<string> = [
  'Redo att göra kiosken lika snabb som laget? Starta er digitala kiosk på några minuter.',
  'Sätt upp kiosken innan nästa match och låt publiken betala direkt med Swish.',
  'Gör som fler föreningar i {city} och uppgradera kioskflödet redan idag.'
]

const faqVariants: Array<{ question: string; answer: string }> = [
  {
    question: 'Behöver vi teknikkunskap för att komma igång?',
    answer:
      'Nej. Ni skapar kiosken på några minuter och får en QR-kod att visa upp. Allt fungerar direkt i mobilen.'
  },
  {
    question: 'Hur tar {sportLower}-klubben i {city} betalt i kiosken?',
    answer:
      'Besökarna skannar QR-koden, väljer varor och betalar med Swish. Ni ser betalningen i realtid.'
  },
  {
    question: 'Passar QRButik för små föreningar?',
    answer:
      'Ja. QRButik är byggt för föreningslivet och fungerar lika bra för små som stora kiosker.'
  },
  {
    question: 'Vad händer om vi vill ändra varor eller priser?',
    answer:
      'Ni kan uppdatera kiosken när som helst. Ändringar syns direkt för kunderna.'
  }
]

const benefitVariants: Array<string> = [
  'Kortare köer när publiken på {sportLower} vill handla snabbt.',
  'Swish-betalning med rätt belopp och referens automatiskt.',
  'Tydlig försäljningsöversikt efter varje match.',
  'Ingen app, ingen installation – allt fungerar i webbläsaren.',
  'Samma kiosk kan användas för alla lag och arrangemang.'
]

const howItWorksSteps: Array<{ title: string; description: string }> = [
  {
    title: 'Skapa kiosken',
    description: 'Ange namn och Swish-nummer. Lägg in varor på 2 minuter.'
  },
  {
    title: 'Visa QR-koden',
    description: 'Sätt upp koden vid kiosken, på en skylt eller i hallen.'
  },
  {
    title: 'Ta betalt',
    description: 'Kunderna väljer varor och betalar med Swish direkt.'
  }
]

const problemsTitleVariants: Array<string> = [
  'När tempot ökar ska kiosken inte bromsa.',
  'Köer och huvudräkning hör inte hemma vid {matchContext}.',
  'Kiosken ska vara snabb — även när det är {crowdContext}.',
]

const problemsBulletsVariants: Array<Array<string>> = [
  [
    'Räkna totalsumman i huvudet när det är {matchContext}.',
    'Stava Swish-numret gång på gång till nya besökare.',
    'Tappa överblicken när flera beställer samtidigt.',
    'Svårt att sammanställa vad som såldes efteråt.',
  ],
  [
    'Handskrivna listor som blir otydliga i stressen.',
    'Långa köer när det är {crowdContext}.',
    'Priser och varor ändras men listan hänger inte med.',
    'Extra administration för kassören efter matchen.',
  ],
  [
    'Manuell hantering tar tid precis när ni behöver tempo.',
    'Fler fel när betalningar och beställningar blandas ihop.',
    'Svårt att hålla samma flöde för alla lag och arrangemang.',
    'Kön växer när alla vill handla snabbt.',
  ],
]

const solutionTitleVariants: Array<string> = [
  'Ett flöde som publiken klarar själv.',
  'Tydligt, snabbt och redo för {sportLower}.',
  'Mer ordning — mindre stress i {city}.',
]

const solutionBulletsVariants: Array<Array<string>> = [
  [
    'Inbyggd varukorg räknar automatiskt ut summan.',
    'Swish öppnas med rätt belopp och referens direkt.',
    'Säljrapport redo direkt efteråt — även när det är {matchContext}.',
    'Samma kiosk återanvänds för fler arrangemang.',
  ],
  [
    'Digital meny som är lätt att uppdatera när som helst.',
    'Kunderna beställer själva – kön rör sig snabbare.',
    'Ni ser betalningar i realtid i admin-vyn.',
    'Färre missförstånd när det är mycket folk.',
  ],
  [
    'Allt i webbläsaren – ingen app eller installation.',
    'Funkar lika bra i {city} som på bortamatcher.',
    'Tydliga varor och priser för alla besökare.',
    'Smidigare avstämning för kassören efteråt.',
  ],
]

const testimonialQuoteVariants: Array<string> = [
  '“Vi gick från stress och lappar till ett flöde som publiken fattar direkt. Efter {matchContext} i {city} är rapporten klar.”',
  '“Kön rör sig mycket snabbare nu. Folk beställer själva och Swish blir rätt direkt — perfekt för {sportLower}.”',
  '“Det bästa är avstämningen. Efter varje arrangemang i {city} har vi koll utan extra jobb.”',
]

const testimonialBylineVariants: Array<string> = [
  '— Kassör, {sportLower} i {city}',
  '— Lagledare, {sport} i {city}',
  '— Styrelsemedlem, förening i {city}',
]

const comparePoints: Array<{ title: string; points: Array<string> }> = [
  {
    title: 'Innan',
    points: [
      'Handskrivna listor och stressade kassörer.',
      'Felräkning när kön växer.',
      'Svårt att sammanställa dagens försäljning.'
    ]
  },
  {
    title: 'Med QRButik',
    points: [
      'Digital meny som alltid är uppdaterad.',
      'Automatisk totalsumma och Swish-länk.',
      'Rapport redo för kassören direkt.'
    ]
  }
]

const environmentCopy = {
  indoor: {
    title: 'Inomhusflöde',
    text: 'I hallmiljö är tempot högt och pauserna korta. QRButik håller kön rörlig även när många vill handla samtidigt.'
  },
  outdoor: {
    title: 'Utomhusflöde',
    text: 'Utomhusmatcher betyder fler spontana köp och snabba beslut. QRButik gör kiosken tydlig även när matchpulsen är hög.'
  }
}

const seasonCopy = {
  summer: {
    title: 'Sommarsäsong',
    text: 'Sommarmatcher lockar många besökare. Med QRButik blir kiosken lika snabb som publiken förväntar sig.'
  },
  winter: {
    title: 'Vintersäsong',
    text: 'När det är kallt vill publiken bli serverad snabbt. QRButik ger ett smidigt flöde utan extra personal.'
  }
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
      slug: buildSlug(sport.slug, city.slug)
    }))
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

export const getPseoCopy = (sportSlug: string, citySlug: string) => {
  const sport = getSportBySlug(sportSlug)
  const city = getCityBySlug(citySlug)

  if (!sport || !city) {
    return null
  }

  const seed = `${sport.slug}-${city.slug}`

  const heritageText = pickVariant(city.heritageTextVariants, seed)
  const localNotes = pickVariant(city.localNotesVariants, seed)
  const useCases = pickVariant(city.useCasesVariants, seed)
  const operationalNotes = pickVariant(sport.operationalNotesVariants, seed)
  const environment = environmentCopy[sport.environment]
  const season = seasonCopy[sport.season]

  const replaceCtx: ReplaceCtx = {
    sport: sport.name,
    sportLower: sport.name.toLowerCase(),
    city: city.name,
    region: city.region,
    matchContext: sport.matchContext,
    crowdContext: sport.crowdContext,
    environmentTitle: environment.title,
    seasonTitle: season.title,
  }

  return {
    sport,
    city,
    intro: pickVariant(introVariants, seed)
      .replaceAll('{sport}', sport.name)
      .replaceAll('{city}', city.name),
    closing: pickVariant(closingVariants, seed)
      .replaceAll('{sport}', sport.name)
      .replaceAll('{city}', city.name),
    benefits: benefitVariants.map((benefit) => replaceTokens(benefit, replaceCtx)),
    problems: {
      title: replaceTokens(pickVariant(problemsTitleVariants, seed), replaceCtx),
      bullets: pickVariant(problemsBulletsVariants, seed).map((item) =>
        replaceTokens(item, replaceCtx)
      ),
    },
    solution: {
      title: replaceTokens(pickVariant(solutionTitleVariants, seed), replaceCtx),
      bullets: pickVariant(solutionBulletsVariants, seed).map((item) =>
        replaceTokens(item, replaceCtx)
      ),
    },
    compare: comparePoints,
    steps: howItWorksSteps,
    faq: faqVariants.map((item) => ({
      question: replaceTokens(item.question, replaceCtx),
      answer: item.answer,
    })),
    matchContext: sport.matchContext,
    crowdContext: sport.crowdContext,
    commonItems: sport.commonItems,
    environment,
    season,
    heritageText,
    localNotes,
    useCases,
    operationalNotes,
    officialLinks: city.officialLinks,
    testimonial: {
      quote: replaceTokens(pickVariant(testimonialQuoteVariants, seed), replaceCtx),
      byline: replaceTokens(pickVariant(testimonialBylineVariants, seed), replaceCtx),
    },
  }
}

export const getPseoSlug = buildSlug
export const getPseoSportHubSlug = buildSportHubSlug
