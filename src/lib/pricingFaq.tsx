import type { ReactNode } from 'react'

export const SKATTEVERKET_KASSAREGISTER_URL =
  'https://www.skatteverket.se/foreningar/driva/ideellforening/bokforingochkassaregisterforideellaforeningar.4.70ac421612e2a997f85800033022.html'

export type PricingFaqItem = {
  question: string
  schemaAnswer: string
  renderAnswer: () => ReactNode
}

function plainFaq(question: string, answer: string): PricingFaqItem {
  return {
    question,
    schemaAnswer: answer,
    renderAnswer: () => answer,
  }
}

const kassaregisterSchemaAnswer =
  'De flesta idrottsföreningar behöver inget certifierat kassaregister för kiosken. Allmännyttiga ideella föreningar är undantagna från kassaregisterkravet när försäljningen är skattefri, till exempel enklare fika och kioskförsäljning vid matcher och evenemang. Ett café som drivs året runt med anställd personal, eller en verksamhet som säljer för mer än fyra prisbasbelopp per år (238 400 kr år 2027), kan däremot behöva ett certifierat kassaregister. QRButik är inte ett certifierat kassaregister. Är ni osäkra, fråga er revisor eller Skatteverket. Mer information: ' +
  SKATTEVERKET_KASSAREGISTER_URL

export const pricingFaq: Array<PricingFaqItem> = [
  plainFaq(
    'Vad kostar QRButik?',
    'Gratis är standard. Event kostar 295 kr och Säsong 1 495 kr per år (cirka 125 kr/mån). Alla priser är inklusive 25 % moms.',
  ),
  plainFaq(
    'Finns det en provperiod?',
    'Nej. Varje förening börjar på Gratis utan kort. Event och Säsong köps när ni behöver fler kiosker, rapport eller export.',
  ),
  plainFaq(
    'Vad händer när Event tar slut?',
    'Efter 7 dagar går föreningen tillbaka till Gratis. Den äldsta kiosken fortsätter att ta emot Swish-köp.',
  ),
  plainFaq(
    'Kan vi säga upp Säsong?',
    'Ja, i kundportalen. Tillgången till obegränsade kiosker, flera administratörer och bokföringsexport gäller så länge prenumerationen är aktiv.',
  ),
  {
    question: 'Behöver vi kassaregister?',
    schemaAnswer: kassaregisterSchemaAnswer,
    renderAnswer: () => (
      <>
        De flesta idrottsföreningar behöver inget certifierat kassaregister för
        kiosken. Allmännyttiga ideella föreningar är undantagna från
        kassaregisterkravet när försäljningen är skattefri, till exempel enklare
        fika och kioskförsäljning vid matcher och evenemang. Ett café som drivs
        året runt med anställd personal, eller en verksamhet som säljer för mer
        än fyra prisbasbelopp per år (238&nbsp;400&nbsp;kr år 2027), kan däremot
        behöva ett certifierat kassaregister. QRButik är inte ett certifierat
        kassaregister. Är ni osäkra, fråga er revisor eller{' '}
        <a
          href={SKATTEVERKET_KASSAREGISTER_URL}
          className="cursor-pointer font-semibold text-brand underline decoration-brand-border underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          Skatteverket
        </a>
        .
      </>
    ),
  },
]

export function faqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingFaq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.schemaAnswer,
      },
    })),
  }
}
