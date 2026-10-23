import { describe, expect, it } from 'vitest'
import { faqPageJsonLd, pricingFaq } from './pricingFaq'

describe('pricingFaq', () => {
  it('includes kassaregister guidance and FAQPage schema', () => {
    const item = pricingFaq.find((faq) => faq.question === 'Behöver vi kassaregister?')
    expect(item?.schemaAnswer).toContain('QRButik är inte ett certifierat kassaregister')
    expect(item?.schemaAnswer).toContain('skatteverket.se')

    const schema = faqPageJsonLd()
    expect(schema).toMatchObject({ '@type': 'FAQPage' })
    expect(schema.mainEntity.map((q: { name: string }) => q.name)).toContain(
      'Behöver vi kassaregister?',
    )
  })
})
