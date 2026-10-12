import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval(
  'revert expired event plans to gratis',
  { minutes: 5 },
  internal.organizations.expireEventPlans,
)

crons.interval(
  'send platform activity report',
  { hours: 1 },
  internal.platformReports.sendHourlyReport,
)

export default crons
