import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { getCommunityEventErrorMessage, removeCommunityEventAttendance } from '../api/communityEventsApi'
import CandidateActivityOverview from '../components/CandidateActivityOverview'
import CandidateApplicationsActivity from '../components/CandidateApplicationsActivity'
import CandidateContentActivity from '../components/CandidateContentActivity'
import CandidateEventsActivity from '../components/CandidateEventsActivity'
import CandidateProposalsActivity from '../components/CandidateProposalsActivity'
import CandidateSavedActivity from '../components/CandidateSavedActivity'
import {
  CANDIDATE_ACTIVITY_TABS,
  getCandidateActivityPath,
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

export default function CandidateActivity({ section }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const requestedTab = searchParams.get('tab')
  const activeTab = section ?? normalizeCandidateActivityTab(requestedTab)
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
    if (requestedTab && !section) {
      navigate(getCandidateActivityPath(activeTab), { replace: true })
    }
  }, [activeTab, navigate, requestedTab, section])

  return (
    <CandidateLayout title="My Activity">
      <div className="min-w-0 max-w-full">
        <section>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">My Activity</h2>
          <p className="mt-4 max-w-3xl leading-7 text-text-muted">
            Track your applications, proposals, shared content, teammate requests, and community events.
          </p>
        </section>

        {projectsError && (
          <p role="status" className="mt-4 rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted">
            Shared projects are temporarily unavailable. Other shared content remains available.
          </p>
        )}
        {projectsLoading && (
          <p role="status" className="mt-4 text-sm text-text-subtle">Loading shared projects...</p>
        )}
        {postsError && (
          <p role="status" className="mt-4 rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted">
            Your posts are temporarily unavailable. Other shared content remains available.
          </p>
        )}
        {postsLoading && (
          <p role="status" className="mt-4 text-sm text-text-subtle">Loading your posts...</p>
        )}
        {teammateRequestsError && (
          <p role="status" className="mt-4 rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted">
            Your teammate requests are temporarily unavailable. Shared projects and posts remain available.
          </p>
        )}
        {teammateRequestsLoading && (
          <p role="status" className="mt-4 text-sm text-text-subtle">Loading your teammate requests...</p>
        )}

        <nav className="mt-8 flex min-w-0 max-w-full gap-2 overflow-x-auto border-b border-border pb-3" aria-label="Activity sections">
          {CANDIDATE_ACTIVITY_TABS.map((tab) => (
            <Link
              key={tab.id}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              to={getCandidateActivityPath(tab.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-muted hover:border-primary/50 hover:text-text-primary'
              }`}
            >
              {tab.label}
            </Link>
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
          {activeTab === 'bids' && <CandidateProposalsActivity activity={proposals} />}
          {activeTab === 'projects' && <CandidateContentActivity items={contentItems} filters={['Projects', 'Team requests']} initialFilter="Projects" />}
          {activeTab === 'posts' && <CandidateContentActivity items={contentItems} filters={['Posts']} initialFilter="Posts" />}
          {activeTab === 'saved' && (
            <div className="space-y-8">
              <CandidateSavedActivity />
              <section>
                <h3 className="text-xl font-semibold text-text-primary">Events you are attending</h3>
                <div className="mt-4">
                  {eventsLoading ? (
                    <p role="status" className="rounded-xl border border-border bg-surface/45 p-5 text-sm text-text-muted">Loading your events...</p>
                  ) : eventsError ? (
                    <div className="rounded-xl border border-border bg-surface/45 p-5">
                      <p className="text-sm text-text-muted">Your events are temporarily unavailable.</p>
                      <button type="button" onClick={retryEvents} className="mt-3 text-sm font-medium text-primary hover:underline">Try again</button>
                    </div>
                  ) : (
                    <>
                      {eventActionError && <p role="alert" className="mb-4 rounded-lg border border-danger-soft/25 bg-danger-soft/5 px-4 py-3 text-sm text-danger-text">{eventActionError}</p>}
                      <CandidateEventsActivity events={savedEvents} onRemove={removeEvent} removingEventId={removingEventId} />
                    </>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </CandidateLayout>
  )
}
