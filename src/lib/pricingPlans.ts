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
