import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval(
  'expire organization trials',
  { hours: 1 },
  internal.organizations.expireTrials,
)

crons.interval(
  'send trial ending reminders',
  { hours: 12 },
  internal.organizations.sendTrialReminders,
)

export default crons
