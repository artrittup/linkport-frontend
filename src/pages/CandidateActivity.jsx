import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getCommunityEventErrorMessage, removeCommunityEventAttendance } from '../api/communityEventsApi'
import CandidateActivityOverview from '../components/CandidateActivityOverview'
import CandidateApplicationsActivity from '../components/CandidateApplicationsActivity'
import CandidateContentActivity from '../components/CandidateContentActivity'
import CandidateEventsActivity from '../components/CandidateEventsActivity'
import CandidateProposalsActivity from '../components/CandidateProposalsActivity'
import {
  CANDIDATE_ACTIVITY_TABS,
  normalizeCandidateActivityTab,
} from '../config/candidateActivity'
import { useAuth } from '../context/AuthContext'
import { getCandidateContentItems } from '../data/candidateActivityAdapters'
import {
  useCandidateApplications,
  useCandidateProposals,
} from '../hooks/useCandidateActivityData'
import useCommunityProjects from '../hooks/useCommunityProjects'
import useCommunityPosts from '../hooks/useCommunityPosts'
import { useMyCommunityEvents } from '../hooks/useCommunityEvents'
import useTeammateRequests from '../hooks/useTeammateRequests'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateActivity() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab = normalizeCandidateActivityTab(requestedTab)
  const applications = useCandidateApplications()
  const proposals = useCandidateProposals()
  const { user } = useAuth()
  const [removingEventId, setRemovingEventId] = useState('')
  const [eventActionError, setEventActionError] = useState('')
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useCommunityProjects({
    userId: user?.id,
    perPage: 50,
    enabled: Boolean(user?.id),
  })
  const {
    posts,
    isLoading: postsLoading,
    error: postsError,
  } = useCommunityPosts({
    userId: user?.id,
    perPage: 50,
    enabled: Boolean(user?.id),
  })
  const {
    requests: teamRequests,
    isLoading: teammateRequestsLoading,
    error: teammateRequestsError,
  } = useTeammateRequests({
    userId: user?.id,
    perPage: 50,
    enabled: Boolean(user?.id),
  })
  const {
    events: savedEvents,
    isLoading: eventsLoading,
    error: eventsError,
    retry: retryEvents,
  } = useMyCommunityEvents({ perPage: 50 })

  const contentItems = useMemo(
    () => getCandidateContentItems({ projects, posts, teamRequests }),
    [posts, projects, teamRequests],
  )
  async function removeEvent(eventId) {
    if (removingEventId) return
    setRemovingEventId(eventId)
    setEventActionError('')
    try {
      await removeCommunityEventAttendance(eventId)
      retryEvents()
    } catch (error) {
      setEventActionError(getCommunityEventErrorMessage(error, 'We could not remove this event. Please try again.'))
    } finally {
      setRemovingEventId('')
    }
  }

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

        {projectsError && (
          <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
            Shared projects are temporarily unavailable. Other shared content remains available.
          </p>
        )}
        {projectsLoading && (
          <p role="status" className="mt-4 text-sm text-[#64748b]">Loading shared projects...</p>
        )}
        {postsError && (
          <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
            Your posts are temporarily unavailable. Other shared content remains available.
          </p>
        )}
        {postsLoading && (
          <p role="status" className="mt-4 text-sm text-[#64748b]">Loading your posts...</p>
        )}
        {teammateRequestsError && (
          <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
            Your teammate requests are temporarily unavailable. Shared projects and posts remain available.
          </p>
        )}
        {teammateRequestsLoading && (
          <p role="status" className="mt-4 text-sm text-[#64748b]">Loading your teammate requests...</p>
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
              savedEventsState={{
                total: savedEvents.length,
                isLoading: eventsLoading,
                error: eventsError,
              }}
            />
          )}
          {activeTab === 'applications' && <CandidateApplicationsActivity activity={applications} />}
          {activeTab === 'proposals' && <CandidateProposalsActivity activity={proposals} />}
          {activeTab === 'content' && <CandidateContentActivity items={contentItems} />}
          {activeTab === 'events' && (
            eventsLoading ? (
              <p role="status" className="rounded-xl border border-[#233554] bg-[#112240]/45 p-5 text-sm text-[#8892b0]">Loading My Events...</p>
            ) : eventsError ? (
              <div className="rounded-xl border border-[#233554] bg-[#112240]/45 p-5">
                <p className="text-sm text-[#8892b0]">My Events are temporarily unavailable. Other Activity sections remain available.</p>
                <button type="button" onClick={retryEvents} className="mt-3 text-sm font-medium text-[#64ffda] hover:underline">Try again</button>
              </div>
            ) : (
              <>
                {eventActionError && <p role="alert" className="mb-4 rounded-lg border border-[#f87171]/25 bg-[#f87171]/5 px-4 py-3 text-sm text-[#fca5a5]">{eventActionError}</p>}
                <CandidateEventsActivity events={savedEvents} onRemove={removeEvent} removingEventId={removingEventId} />
              </>
            )
          )}
        </div>
      </div>
    </CandidateLayout>
  )
}
