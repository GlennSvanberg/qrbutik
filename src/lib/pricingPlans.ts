import { START_LABEL } from '~/lib/marketing'

export const pricingPlans: Array<{
  id: 'gratis' | 'event' | 'season'
  name: string
  price: string
  description: string
  cta: string
  variant: 'primary' | 'secondary'
}> = [
  {
    id: 'gratis',
    name: 'Gratis',
    price: '0 kr',
    description:
      '1 kiosk, obegränsat antal produkter, Swish-QR och statistik för idag. En liten QRButik-märkning visas. Inget kort.',
    cta: START_LABEL,
    variant: 'secondary',
  },
  {
    id: 'event',
    name: 'Event',
    price: '295 kr',
    description:
      'Engångsköp för cuphelgen. Flera kiosker, ingen märkning, försäljningsrapport och export i 7 dagar.',
    cta: 'Köp Event',
    variant: 'secondary',
  },
  {
    id: 'season',
    name: 'Säsong',
    price: '1 495 kr/år',
    description:
      'Cirka 125 kr/mån. Obegränsat antal kiosker och event, flera administratörer och bokföringsexport så länge prenumerationen är aktiv.',
    cta: 'Starta Säsong',
    variant: 'primary',
  },
]

export const pricingFaq: Array<{ question: string; answer: string }> = [
  {
    question: 'Vad kostar QRButik?',
    answer:
      'Gratis är standard. Event kostar 295 kr och Säsong 1 495 kr per år (cirka 125 kr/mån). Alla priser är inklusive 25 % moms.',
  },
  {
    question: 'Finns det en provperiod?',
    answer:
      'Nej. Varje förening börjar på Gratis utan kort. Event och Säsong köps när ni behöver fler kiosker, rapport eller export.',
  },
  {
    question: 'Vad händer när Event tar slut?',
    answer:
      'Efter 7 dagar går föreningen tillbaka till Gratis. Den äldsta kiosken fortsätter att ta emot Swish-köp.',
  },
  {
    question: 'Kan vi säga upp Säsong?',
    answer:
      'Ja, i kundportalen. Tillgången till obegränsade kiosker, flera administratörer och bokföringsexport gäller så länge prenumerationen är aktiv.',
  },
]
