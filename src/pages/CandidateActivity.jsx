import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { getCommunityEventErrorMessage, removeCommunityEventAttendance } from '../api/communityEventsApi'
import CandidateActivityOverview from '../components/CandidateActivityOverview'
import CandidateApplicationsActivity from '../components/CandidateApplicationsActivity'
import CandidateContentActivity from '../components/CandidateContentActivity'
import CandidateEventsActivity from '../components/CandidateEventsActivity'
import CandidateProposalsActivity from '../components/CandidateProposalsActivity'
import CandidateSavedActivity from '../components/CandidateSavedActivity'
import SectionTabs from '../components/SectionTabs'
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
import useSavedItems from '../hooks/useSavedItems'
import CandidateLayout from '../layouts/CandidateLayout'

const sectionCopy = {
  applications: {
    title: 'Applications',
    description: 'Review the jobs you applied to and track each application status.',
  },
  bids: {
    title: 'Bids',
    description: 'Keep track of your project offers, delivery estimates, and bid status.',
  },
  projects: {
    title: 'Projects',
    description: 'Manage the community projects you have created.',
  },
  posts: {
    title: 'Posts',
    description: 'Review the posts you have shared with the LinkPort community.',
  },
  saved: {
    title: 'Saved',
    description: 'Return to jobs, projects, posts, and other community items you kept for later.',
  },
}

function requestSummary(total, isLoading, error) {
  return { total, isLoading, error: Boolean(error) }
}

export default function CandidateActivity({ section }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const requestedTab = searchParams.get('tab')
  const activeTab = section ?? normalizeCandidateActivityTab(requestedTab)
  const isOverview = activeTab === 'overview'
  const { user } = useAuth()
  const applications = useCandidateApplications({ enabled: isOverview || activeTab === 'applications' })
  const bids = useCandidateProposals({ enabled: isOverview || activeTab === 'bids' })
  const projectsActivity = useCommunityProjects({
    userId: user?.id,
    perPage: 50,
    enabled: Boolean(user?.id) && (isOverview || activeTab === 'projects'),
  })
  const postsActivity = useCommunityPosts({
    userId: user?.id,
    perPage: 50,
    enabled: Boolean(user?.id) && (isOverview || activeTab === 'posts'),
  })
  const savedItems = useSavedItems({ enabled: isOverview || activeTab === 'saved' })
  const {
    events: attendingEvents,
    isLoading: eventsLoading,
    error: eventsError,
    retry: retryEvents,
  } = useMyCommunityEvents({ perPage: 50, enabled: activeTab === 'saved' })
  const [removingEventId, setRemovingEventId] = useState('')
  const [eventActionError, setEventActionError] = useState('')

  const projectItems = useMemo(
    () => getCandidateContentItems({ projects: projectsActivity.projects, posts: [], teamRequests: [] }),
    [projectsActivity.projects],
  )
  const postItems = useMemo(
    () => getCandidateContentItems({ projects: [], posts: postsActivity.posts, teamRequests: [] }),
    [postsActivity.posts],
  )
  const summaries = [
    { id: 'applications', label: 'Applications', summary: applications.summary },
    { id: 'bids', label: 'Bids', summary: bids.summary },
    { id: 'projects', label: 'Projects', summary: requestSummary(projectsActivity.meta.total, projectsActivity.isLoading, projectsActivity.error) },
    { id: 'posts', label: 'Posts', summary: requestSummary(postsActivity.meta.total, postsActivity.isLoading, postsActivity.error) },
    { id: 'saved', label: 'Saved', summary: requestSummary(savedItems.items.length, savedItems.isLoading, savedItems.error) },
  ]

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

  const activeCopy = sectionCopy[activeTab]

  return (
    <CandidateLayout title="My Activity">
      <div className="min-w-0 max-w-full">
        <SectionTabs
          items={CANDIDATE_ACTIVITY_TABS.map((tab) => ({ ...tab, path: getCandidateActivityPath(tab.id) }))}
          activeId={activeTab}
          label="Activity sections"
        />

        <div className="mt-8 min-w-0 max-w-full">
          {isOverview ? (
            <CandidateActivityOverview summaries={summaries} />
          ) : (
            <section className="mb-6">
              <h3 className="text-xl font-semibold text-text-primary">{activeCopy.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">{activeCopy.description}</p>
            </section>
          )}

          {activeTab === 'applications' && <CandidateApplicationsActivity activity={applications} />}
          {activeTab === 'bids' && <CandidateProposalsActivity activity={bids} />}
          {activeTab === 'projects' && (
            <CandidateContentActivity
              items={projectItems}
              type="projects"
              isLoading={projectsActivity.isLoading}
              error={projectsActivity.error}
              retry={projectsActivity.retry}
            />
          )}
          {activeTab === 'posts' && (
            <CandidateContentActivity
              items={postItems}
              type="posts"
              isLoading={postsActivity.isLoading}
              error={postsActivity.error}
              retry={postsActivity.retry}
            />
          )}
          {activeTab === 'saved' && (
            <div className="space-y-10">
              <CandidateSavedActivity savedItems={savedItems} />
              <section>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Events you are attending</h3>
                  <p className="mt-1 text-sm text-text-muted">Community events you joined remain available here alongside your saved items.</p>
                </div>
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
                      <CandidateEventsActivity events={attendingEvents} onRemove={removeEvent} removingEventId={removingEventId} />
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
