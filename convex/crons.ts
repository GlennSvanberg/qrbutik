import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval(
  'expire organization trials',
  { hours: 1 },
  internal.organizations.expireTrials,
)

export default crons
