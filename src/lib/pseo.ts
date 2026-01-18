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

const introVariants: Array<string> = [
  '{sport} i {city} kräver snabb kiosköppning, tydliga priser och korta köer. QRButik gör det enkelt att sälja mer utan extra jobb.',
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
    question: 'Hur tar vi betalt under {sport}-matcher i {city}?',
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
  'Kortare köer när {sport}-publiken vill handla snabbt.',
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
    text: 'Utomhusmatcher betyder fler spontana köp och snabba beslut. QRButik gör kiosken tydlig även i matchstress.'
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

  return {
    sport,
    city,
    intro: pickVariant(introVariants, seed)
      .replaceAll('{sport}', sport.name)
      .replaceAll('{city}', city.name),
    closing: pickVariant(closingVariants, seed)
      .replaceAll('{sport}', sport.name)
      .replaceAll('{city}', city.name),
    benefits: benefitVariants.map((benefit) =>
      benefit.replaceAll('{sport}', sport.name)
    ),
    compare: comparePoints,
    steps: howItWorksSteps,
    faq: faqVariants.map((item) => ({
      question: item.question
        .replaceAll('{sport}', sport.name.toLowerCase())
        .replaceAll('{city}', city.name),
      answer: item.answer,
    })),
    matchContext: sport.matchContext,
    crowdContext: sport.crowdContext,
    commonItems: sport.commonItems,
    environment: environmentCopy[sport.environment],
    season: seasonCopy[sport.season],
    heritageText,
    localNotes,
    useCases,
    operationalNotes,
    officialLinks: city.officialLinks
  }
}

export const getPseoSlug = buildSlug
