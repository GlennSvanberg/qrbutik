import { pricingFaq } from '~/lib/pricingFaq'

export function PricingFaqList() {
  return (
    <dl className="flex flex-col gap-5">
      {pricingFaq.map((item) => (
        <div key={item.question}>
          <dt className="font-semibold text-brand-foreground">{item.question}</dt>
          <dd className="mt-1 text-sm text-brand-muted">{item.renderAnswer()}</dd>
        </div>
      ))}
    </dl>
  )
}
