import { Link } from 'react-router'
import { getCandidateActivityPath } from '../config/candidateActivity'

function SummaryValue({ summary }) {
  if (summary.isLoading) return <span className="text-sm font-medium text-text-muted">Loading...</span>
  if (summary.error) return <span className="text-sm font-medium text-danger-text">Unavailable</span>
  return summary.total
}

const descriptions = {
  applications: 'Jobs you have applied to',
  bids: 'Project bids you submitted',
  projects: 'Projects you have created',
  posts: 'Community posts you shared',
  saved: 'Items kept for later',
}

export default function CandidateActivityOverview({ summaries }) {
  return (
    <section aria-labelledby="activity-overview-heading">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Personal workspace</p>
        <h3 id="activity-overview-heading" className="mt-2 text-xl font-semibold text-text-primary">Your activity at a glance</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Open a section to review what you have applied to, submitted, created, or saved.
        </p>
      </div>

      <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Activity overview">
        {summaries.map((item) => (
          <Link
            key={item.id}
            to={getCandidateActivityPath(item.id)}
            className="group flex min-w-0 flex-col rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-primary/45 hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <span className="text-sm font-semibold text-text-primary group-hover:text-primary">{item.label}</span>
            <span className="mt-3 break-words text-3xl font-bold tracking-tight text-text-primary">
              <SummaryValue summary={item.summary} />
            </span>
            <span className="mt-2 text-xs leading-5 text-text-muted">{descriptions[item.id]}</span>
            <span className="mt-5 text-xs font-semibold text-primary">{item.id === 'saved' ? 'Open saved items' : `Open ${item.label.toLowerCase()}`} →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
