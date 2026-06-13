import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { getSportBySlug } from '~/lib/pseo'

export const Route = createFileRoute('/utforska/$sport/$city/')({
  beforeLoad: ({ params }) => {
    const sport = getSportBySlug(params.sport)
    if (!sport) {
      throw notFound()
    }

    throw redirect({
      to: '/utforska/$sport',
      params: { sport: params.sport },
      statusCode: 301,
    })
  },
})
