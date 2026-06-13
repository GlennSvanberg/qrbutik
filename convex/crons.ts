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

crons.interval(
  'send platform activity report',
  { hours: 1 },
  internal.platformReports.sendHourlyReport,
)

export default crons
