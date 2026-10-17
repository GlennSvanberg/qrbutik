export type SportPage = {
  slug: string
  name: string
  h1: string
  title: string
  description: string
  paragraphs: Array<string>
}

export const sportPages: Array<SportPage> = [
  {
    slug: 'fotboll',
    name: 'Fotboll',
    h1: 'Digital kiosk för fotbollsföreningar',
    title: 'Kiosk med QR och Swish för fotbollsföreningar | QRButik',
    description:
      'Så kan en fotbollsförening ta betalt i kiosken vid hemmamatcher och cuper. Besökaren beställer via QR och betalar med Swish. Export som CSV och SIE.',
    paragraphs: [
      'Vid hemmamatch samlas kön vid kiosken i pausen, och vid en egen cup blir det fler planer och längre dagar. En fotbollsförening kan lägga korv, kaffe och dryck i en digital kiosk i stället för att räkna totalsummor för hand.',
      'Besökaren skannar QR-koden på skylten, väljer varor och betalar med Swish till föreningens eget nummer. Kunden behöver varken app eller konto.',
      'Under en cuphelg kan föreningen öppna fler kiosker, till exempel vid olika planer. Kassören ser försäljningen samlat och kan exportera CSV- och SIE-filer till bokföringen. Event är engångsköpet för helgen. Säsong passar föreningen som kör kiosk hela säsongen. Gratis inkluderar en kiosk.',
    ],
  },
  {
    slug: 'ishockey',
    name: 'Ishockey',
    h1: 'Digital kiosk för ishockeyföreningar',
    title: 'Kiosk med QR och Swish för ishockeyföreningar | QRButik',
    description:
      'Ishockeyföreningar kan sälja i kiosken mellan perioderna. QR-beställning och Swish till föreningens nummer, med export som CSV och SIE.',
    paragraphs: [
      'I ishallen är pausen mellan perioderna kort, och publiken vill inte lämna läktaren länge. En ishockeyförening kan ställa en QR-skylt vid kiosken så att beställningen är klar innan nästa nedsläpp.',
      'Besökaren skannar koden, väljer varor och betalar med Swish direkt till föreningens nummer. Samma kiosk kan användas vid träningsturneringar och vid egna cuper i hallen.',
      'Kassör och styrelse ser försäljningen i samma vy. Underlaget exporteras som CSV- och SIE-filer, inte som en direktkoppling till ett bokföringsprogram. Event täcker en cuphelg. Säsong täcker säsongen i hallen. Gratis räcker för en kiosk.',
    ],
  },
  {
    slug: 'handboll',
    name: 'Handboll',
    h1: 'Digital kiosk för handbollsföreningar',
    title: 'Kiosk med QR och Swish för handbollsföreningar | QRButik',
    description:
      'Handbollsföreningar kan ta betalt i kiosken i halvleken och under hallcuper. QR-beställning, Swish och export som CSV och SIE.',
    paragraphs: [
      'En handbollsmatch har en tydlig halvlek, och en hallcup kan ha flera banor igång samtidigt. Kön vid kiosken blir tät just när matchklockan står stilla.',
      'Föreningen publicerar menyn i QRButik. Besökaren skannar QR-koden, lägger varor i korgen och betalar med Swish till föreningens eget nummer.',
      'Varje bana kan ha en egen kiosk under samma förening när planen tillåter fler än en. Kassören exporterar CSV- och SIE-filer efter helgen. Event är till för cupen. Säsong är till för seriespel hela året. Gratis inkluderar en kiosk.',
    ],
  },
  {
    slug: 'innebandy',
    name: 'Innebandy',
    h1: 'Digital kiosk för innebandyföreningar',
    title: 'Kiosk med QR och Swish för innebandyföreningar | QRButik',
    description:
      'Innebandyföreningar kan köra kiosk när många matcher spelas samma dag. Beställning via QR, betalning med Swish och export som CSV och SIE.',
    paragraphs: [
      'Innebandyhelger har ofta täta matcher och korta byten mellan lag. Kiosken behöver ta betalt utan att personalen skriver om varje summa.',
      'Besökaren skannar QR-koden, beställer och betalar med Swish till föreningens nummer. Flödet är detsamma vid en seriematch och vid en egen cup i hallen.',
      'Flera kiosker kan ligga under samma förening, till exempel vid olika hallar. Försäljningen samlas för kassören, som exporterar CSV- och SIE-filer. Event köps för en helg. Säsong gäller så länge prenumerationen är aktiv. Gratis inkluderar en kiosk.',
    ],
  },
  {
    slug: 'basket',
    name: 'Basket',
    h1: 'Digital kiosk för basketföreningar',
    title: 'Kiosk med QR och Swish för basketföreningar | QRButik',
    description:
      'Basketföreningar kan sälja i kiosken under kvartspauser och hallcuper. QR-beställning och Swish, med export som CSV och SIE.',
    paragraphs: [
      'I basket är pauserna korta och spridda över kvartarna. Publiken hinner sällan stå i en lång kassa mitt i matchen.',
      'En basketförening kan sätta upp en digital kiosk med QR-kod. Besökaren väljer varor på mobilen och betalar med Swish till föreningens eget nummer.',
      'Vid en hallcup kan föreningen öppna kiosker vid fler än en plan. Kassören får en samlad bild och kan ta ut CSV- och SIE-filer. Event är engångsköpet för cuphelgen. Säsong passar föreningen som har kiosk i seriespelet. Gratis inkluderar en kiosk.',
    ],
  },
  {
    slug: 'bandy',
    name: 'Bandy',
    h1: 'Digital kiosk för bandyföreningar',
    title: 'Kiosk med QR och Swish för bandyföreningar | QRButik',
    description:
      'Bandyföreningar kan ta betalt i kiosken vid plan eller klubbstuga. QR-beställning, Swish till föreningens nummer och export som CSV och SIE.',
    paragraphs: [
      'Bandy spelas utomhus på vintern. Kiosken står ofta i en klubbstuga eller ett varmt tält, medan publiken rör sig mellan läktare och plan.',
      'Föreningen visar menyn via en QR-kod. Besökaren beställer på mobilen och betalar med Swish till föreningens nummer, utan att kassan räknar ihop beloppet för hand.',
      'En matchdag kan ha en kiosk, och en cup kan behöva fler. Kassören exporterar CSV- och SIE-filer efteråt. Event täcker cuphelgen. Säsong täcker vintersäsongen. Gratis inkluderar en kiosk.',
    ],
  },
  {
    slug: 'friidrott',
    name: 'Friidrott',
    h1: 'Digital kiosk för friidrottsföreningar',
    title: 'Kiosk med QR och Swish för friidrottsföreningar | QRButik',
    description:
      'Friidrottsföreningar kan sälja när publiken rör sig mellan grenar. QR-beställning och Swish, med export som CSV och SIE.',
    paragraphs: [
      'En friidrottstävling pågår på flera platser samtidigt. Publiken går mellan banor, hopp och kast, och kiosken får rusning när en gren är färdig.',
      'Föreningen kan ställa en QR-skylt vid kiosken. Besökaren beställer och betalar med Swish till föreningens eget nummer, även om personalen är få.',
      'Vid en större tävlingsdag kan flera kiosker ligga under samma förening. Försäljningen samlas hos kassören och exporteras som CSV- och SIE-filer. Event är engångsköpet för tävlingen. Säsong passar föreningen som arrangerar flera gånger per år. Gratis inkluderar en kiosk.',
    ],
  },
  {
    slug: 'simning',
    name: 'Simning',
    h1: 'Digital kiosk för simföreningar',
    title: 'Kiosk med QR och Swish för simföreningar | QRButik',
    description:
      'Simföreningar kan ta betalt i kiosken utanför bassängen vid tävling. QR-beställning, Swish och export som CSV och SIE.',
    paragraphs: [
      'I simhallen står kiosken där det är torrt, ofta vid entrén eller läktaren, medan heat pågår i bassängen. Föräldrar och publik handlar mellan starter.',
      'En simförening lägger menyn i QRButik. Besökaren skannar QR-koden, väljer varor och betalar med Swish till föreningens nummer.',
      'En tävlingshelg kan ha en kiosk, eller flera om hallen är stor. Kassören exporterar CSV- och SIE-filer när dagen är slut. Event köps för tävlingshelgen. Säsong passar föreningen som har kiosk vid återkommande tävlingar. Gratis inkluderar en kiosk.',
    ],
  },
  {
    slug: 'ridning',
    name: 'Ridning',
    h1: 'Digital kiosk för ridklubbar',
    title: 'Kiosk med QR och Swish för ridklubbar | QRButik',
    description:
      'Ridklubbar kan sälja i kiosken på tävlingsdagen. Besökaren beställer via QR och betalar med Swish. Export som CSV och SIE.',
    paragraphs: [
      'På en ridtävling rör sig ryttare, medhjälpare och publik mellan ridhus, bana och parkering. Kiosken behöver fungera utan att någon står och räknar varje köp.',
      'Klubben sätter upp en QR-kod vid kiosken. Besökaren beställer på mobilen och betalar med Swish till klubbens eget nummer.',
      'En tävlingsdag kan köras som Event. En klubb som har kiosk vid flera arrangemang under året kan välja Säsong. Gratis inkluderar en kiosk. Kassören exporterar CSV- och SIE-filer till bokföringen.',
    ],
  },
  {
    slug: 'gymnastik',
    name: 'Gymnastik',
    h1: 'Digital kiosk för gymnastikföreningar',
    title: 'Kiosk med QR och Swish för gymnastikföreningar | QRButik',
    description:
      'Gymnastikföreningar kan ta betalt i kiosken vid uppvisning och tävling. QR-beställning, Swish och export som CSV och SIE.',
    paragraphs: [
      'Vid uppvisning och tävling sitter föräldrar på läktaren och handlar i pausen mellan program. Kön blir kort men tät.',
      'Föreningen visar menyn med en QR-kod. Besökaren väljer varor och betalar med Swish till föreningens nummer, utan app.',
      'En uppvisningshelg kan ha en kiosk. En större tävling kan ha fler, under samma förening. Kassören samlar försäljningen och exporterar CSV- och SIE-filer. Event är engångsköpet för helgen. Säsong passar föreningen som kör kiosk över hela säsongen. Gratis inkluderar en kiosk.',
    ],
  },
]

const sportBySlug = new Map(sportPages.map((sport) => [sport.slug, sport]))

export function getSport(slug: string): SportPage | undefined {
  return sportBySlug.get(slug)
}
