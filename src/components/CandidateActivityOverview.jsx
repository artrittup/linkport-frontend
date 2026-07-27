import { Link } from 'react-router'
import { getCandidateActivityPath } from '../config/candidateActivity'
import { formatActivityDate } from '../data/candidateActivityAdapters'
import { formatEventDate, formatEventTime } from '../data/mockEvents'
import ActivityStatusBadge from './ActivityStatusBadge'

function SummaryValue({ summary }) {
  if (summary.isLoading) return <span className="text-base text-[#8892b0]">Loading...</span>
  if (summary.error) return <span className="text-base text-[#fca5a5]">Unavailable</span>
  return summary.total
}

function RecentCard({ title, emptyText, children, path, action }) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-[#233554] bg-[#112240]/55 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#64748b]">{title}</h3>
      <div className="mt-4 min-w-0 flex-1">
        {children || <p className="text-sm leading-6 text-[#8892b0]">{emptyText}</p>}
      </div>
      <Link to={path} className="mt-5 text-sm font-medium text-[#64ffda] hover:underline">{action}</Link>
    </article>
  )
}

export default function CandidateActivityOverview({
  applications,
  proposals,
  contentItems,
  savedEvents,
}) {
  const sharedProjectCount = contentItems.filter((item) => item.type === 'Projects').length
  const latestContent = contentItems.find((item) => ['Projects', 'Posts'].includes(item.type))
  const nextEvent = savedEvents[0]
  const summaryCards = [
    { label: 'Applications', summary: applications.summary },
    { label: 'Submitted proposals', summary: proposals.summary },
    { label: 'Shared projects', value: sharedProjectCount },
    { label: 'Saved events', value: savedEvents.length },
  ]

  return (
    <div className="min-w-0">
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Activity overview">
        {summaryCards.map((item) => (
          <article key={item.label} className="min-w-0 rounded-xl border border-[#233554] bg-[#112240]/55 p-4">
            <p className="text-sm text-[#8892b0]">{item.label}</p>
            <p className="mt-3 break-words text-2xl font-bold text-[#e6f1ff]">
              {item.summary ? <SummaryValue summary={item.summary} /> : item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-[#e6f1ff]">Recent activity</h2>
        <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RecentCard
            title="Latest application"
            emptyText={applications.summary.isLoading
              ? 'Loading latest application...'
              : applications.summary.error
                ? 'Applications are currently unavailable.'
                : 'No applications submitted yet.'}
            path={getCandidateActivityPath('applications')}
            action="Open applications"
          >
            {applications.summary.latest && (
              <div>
                <p className="break-words font-semibold text-[#e6f1ff]">{applications.summary.latest.jobTitle}</p>
                <p className="mt-1 break-words text-sm text-[#64ffda]">{applications.summary.latest.company}</p>
                <div className="mt-3"><ActivityStatusBadge status={applications.summary.latest.status} /></div>
              </div>
            )}
          </RecentCard>

          <RecentCard
            title="Latest proposal"
            emptyText={proposals.summary.isLoading
              ? 'Loading latest proposal...'
              : proposals.summary.error
                ? 'Proposals are currently unavailable.'
                : 'No proposals submitted yet.'}
            path={getCandidateActivityPath('proposals')}
            action="Open proposals"
          >
            {proposals.summary.latest && (
              <div>
                <p className="break-words font-semibold text-[#e6f1ff]">{proposals.summary.latest.projectTitle}</p>
                <p className="mt-1 break-words text-sm text-[#64ffda]">{proposals.summary.latest.company}</p>
                <p className="mt-3 break-words text-sm text-[#a8b2d1]">{proposals.summary.latest.offeredPrice}</p>
              </div>
            )}
          </RecentCard>

          <RecentCard
            title="Latest shared content"
            emptyText="No projects or posts shared yet."
            path={getCandidateActivityPath('content')}
            action="Open content"
          >
            {latestContent && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#64ffda]">{latestContent.label}</p>
                <p className="mt-2 break-words font-semibold text-[#e6f1ff]">{latestContent.title}</p>
                <p className="mt-2 text-sm text-[#8892b0]">{formatActivityDate(latestContent.createdAt)}</p>
              </div>
            )}
          </RecentCard>

          <RecentCard
            title="Next saved event"
            emptyText="No events saved yet."
            path={getCandidateActivityPath('events')}
            action="Open saved events"
          >
            {nextEvent && (
              <div>
                <p className="break-words font-semibold text-[#e6f1ff]">{nextEvent.title}</p>
                <p className="mt-2 break-words text-sm text-[#a8b2d1]">{formatEventDate(nextEvent.date)}</p>
                <p className="mt-1 text-sm text-[#8892b0]">{formatEventTime(nextEvent)}</p>
              </div>
            )}
          </RecentCard>
        </div>
      </section>
    </div>
  )
}
