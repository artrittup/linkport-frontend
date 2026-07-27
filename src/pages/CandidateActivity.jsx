import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import CandidateActivityOverview from '../components/CandidateActivityOverview'
import CandidateApplicationsActivity from '../components/CandidateApplicationsActivity'
import CandidateContentActivity from '../components/CandidateContentActivity'
import CandidateEventsActivity from '../components/CandidateEventsActivity'
import CandidateProposalsActivity from '../components/CandidateProposalsActivity'
import {
  CANDIDATE_ACTIVITY_TABS,
  normalizeCandidateActivityTab,
} from '../config/candidateActivity'
import { useLocalContent } from '../context/LocalContentContext'
import { getCandidateContentItems } from '../data/candidateActivityAdapters'
import { mockEvents } from '../data/mockEvents'
import {
  useCandidateApplications,
  useCandidateProposals,
} from '../hooks/useCandidateActivityData'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateActivity() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab = normalizeCandidateActivityTab(requestedTab)
  const applications = useCandidateApplications()
  const proposals = useCandidateProposals()
  const {
    projects,
    posts,
    teamRequests,
    attendingEventIds,
    setEventAttendance,
    storageError,
  } = useLocalContent()

  const contentItems = useMemo(
    () => getCandidateContentItems({ projects, posts, teamRequests }),
    [posts, projects, teamRequests],
  )
  const attendingEventIdSet = useMemo(() => new Set(attendingEventIds), [attendingEventIds])
  const savedEvents = useMemo(
    () => mockEvents.filter((event) => attendingEventIdSet.has(event.id)),
    [attendingEventIdSet],
  )

  useEffect(() => {
    if (requestedTab && requestedTab !== activeTab) {
      setSearchParams({}, { replace: true })
    }
  }, [activeTab, requestedTab, setSearchParams])

  const selectTab = (tab) => {
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  return (
    <CandidateLayout title="My Activity">
      <div className="min-w-0 max-w-full">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Candidate activity</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">My Activity</h2>
          <p className="mt-4 max-w-3xl leading-7 text-[#8892b0]">
            Track your applications, proposals, shared content, teammate requests, and saved community events.
          </p>
        </section>

        {storageError && (
          <p role="status" className="mt-6 rounded-lg border border-[#facc15]/25 bg-[#facc15]/5 px-4 py-3 text-sm text-[#fde68a]">{storageError}</p>
        )}

        <nav className="mt-8 flex min-w-0 max-w-full gap-2 overflow-x-auto border-b border-[#233554] pb-3" aria-label="Activity sections">
          {CANDIDATE_ACTIVITY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => selectTab(tab.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                  : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 min-w-0 max-w-full">
          {activeTab === 'overview' && (
            <CandidateActivityOverview
              applications={applications}
              proposals={proposals}
              contentItems={contentItems}
              savedEvents={savedEvents}
            />
          )}
          {activeTab === 'applications' && <CandidateApplicationsActivity activity={applications} />}
          {activeTab === 'proposals' && <CandidateProposalsActivity activity={proposals} />}
          {activeTab === 'content' && <CandidateContentActivity items={contentItems} />}
          {activeTab === 'events' && (
            <CandidateEventsActivity
              events={savedEvents}
              onRemove={(eventId) => setEventAttendance(eventId, false)}
            />
          )}
        </div>
      </div>
    </CandidateLayout>
  )
}
