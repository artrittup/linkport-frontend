import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getJobs } from '../api/jobsApi'
import { getProjects } from '../api/projectsApi'
import {
  formatCommunityEventDate,
  formatCommunityEventTime,
  getCommunityEventLocationLabel,
} from '../data/communityEventMapper'
import { getCommunityProjectStatusLabel } from '../data/communityProjectMapper'
import { getCommunityPostCategoryLabel } from '../data/communityPostMapper'
import {
  TEAMMATE_REQUEST_STATUSES,
  getTeammateRequestWorkStyleLabel,
} from '../data/teammateRequestMapper'
import { jobToOpportunity, projectToOpportunity } from '../data/opportunityAdapters'
import useCommunityProjects from '../hooks/useCommunityProjects'
import useCommunityPosts from '../hooks/useCommunityPosts'
import useCommunityEvents from '../hooks/useCommunityEvents'
import useTeammateRequests from '../hooks/useTeammateRequests'
import CandidateLayout from '../layouts/CandidateLayout'

const filters = ['All', 'Projects', 'Posts', 'Team', 'Opportunities', 'Events']

function formatFeedTimestamp(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Recently'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const defaultFeedItems = [
  {
    id: 2,
    filter: 'Opportunities',
    type: 'OPPORTUNITY',
    title: 'Frontend Developer Internship',
    description: 'Join a small product team and help build accessible tools for local businesses.',
    author: 'Northstar Studio',
    tags: ['JavaScript', 'UI', 'Internship'],
    meta: 'Prishtina · Apply by August 18',
    action: 'View opportunity',
    path: '/candidate/opportunities/internship-northstar-frontend',
    createdAt: null,
  },
]

function FeedCard({ item }) {
  return (
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 sm:p-6">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#64ffda]/10 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-[#64ffda]">
            {item.type}
          </span>
          {item.attending && <span className="rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-2.5 py-1 text-xs font-medium text-[#86efac]">Attending</span>}
        </div>
        <span className="text-xs text-[#64748b]">{item.meta}</span>
      </div>

      <h2 className="mt-5 break-words text-xl font-semibold text-[#e6f1ff]">{item.title}</h2>
      <p className="mt-3 break-words text-sm leading-6 text-[#8892b0]">{item.description}</p>
      <p className="mt-4 break-words text-xs font-medium text-[#a8b2d1]">{item.author}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span key={tag} className="max-w-full break-words rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#8892b0]">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-6">
        {item.action && item.path && (
          <Link
            to={item.path}
            className="inline-flex items-center justify-center rounded-lg border border-[#64ffda]/70 px-4 py-2 text-sm font-semibold text-[#64ffda] transition-colors hover:border-[#64ffda] hover:bg-[#64ffda]/10"
          >
            {item.action}
          </Link>
        )}
      </div>
    </article>
  )
}

export default function CandidateHome() {
  const {
    projects: communityProjects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useCommunityProjects({ perPage: 3 })
  const {
    posts: communityPosts,
    isLoading: postsLoading,
    error: postsError,
  } = useCommunityPosts({ perPage: 3 })
  const {
    requests: teammateRequests,
    isLoading: teammateRequestsLoading,
    error: teammateRequestsError,
  } = useTeammateRequests({
    status: TEAMMATE_REQUEST_STATUSES.OPEN,
    perPage: 3,
  })
  const {
    events: communityEvents,
    isLoading: eventsLoading,
    error: eventsError,
  } = useCommunityEvents({ perPage: 3 })
  const [liveOpportunities, setLiveOpportunities] = useState([])
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true)
  const [opportunitiesError, setOpportunitiesError] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    let isActive = true

    Promise.allSettled([
      getJobs({ per_page: 2, page: 1 }),
      getProjects({ per_page: 2, page: 1 }),
    ]).then(([jobsResult, projectsResult]) => {
      if (!isActive) return

      const nextOpportunities = []
      if (jobsResult.status === 'fulfilled') {
        nextOpportunities.push(...jobsResult.value.data.map(jobToOpportunity))
      }
      if (projectsResult.status === 'fulfilled') {
        nextOpportunities.push(...projectsResult.value.data.map(projectToOpportunity))
      }

      setLiveOpportunities(nextOpportunities)
      setOpportunitiesError(
        jobsResult.status === 'rejected' || projectsResult.status === 'rejected',
      )
      setOpportunitiesLoading(false)
    })

    return () => {
      isActive = false
    }
  }, [])

  const communityFeedItems = useMemo(() => [
    ...communityProjects.map((project) => ({
      id: `project-${project.id}`,
      filter: 'Projects',
      type: 'PROJECT',
      title: project.title,
      description: project.description,
      author: project.creator,
      tags: project.skills,
      meta: getCommunityProjectStatusLabel(project.status),
      action: 'View project',
      path: `/candidate/projects/${project.id}`,
      createdAt: project.createdAt,
    })),
    ...communityPosts.map((post) => ({
      id: `post-${post.id}`,
      filter: 'Posts',
      type: 'POST',
      title: getCommunityPostCategoryLabel(post.category),
      description: post.text,
      author: post.authorName,
      tags: post.tags,
      meta: formatFeedTimestamp(post.createdAt),
      action: null,
      path: null,
      createdAt: post.createdAt,
    })),
    ...teammateRequests.map((request) => ({
      id: `team-${request.id}`,
      filter: 'Team',
      type: 'LOOKING FOR TEAM',
      title: request.title,
      description: request.description,
      author: request.ownerName || 'Owner information unavailable',
      tags: request.skills,
      meta: `${request.rolesNeeded.length} ${request.rolesNeeded.length === 1 ? 'role' : 'roles'} · ${getTeammateRequestWorkStyleLabel(request.workStyle)}`,
      action: 'View request',
      path: `/candidate/community/team-requests/${request.id}`,
      createdAt: request.createdAt,
    })),
    ...communityEvents.map((event) => ({
      id: `event-${event.id}`,
      filter: 'Events',
      type: event.status === 'cancelled' ? 'EVENT · CANCELLED' : 'EVENT',
      title: event.title,
      description: event.shortDescription,
      author: event.organizer,
      tags: event.topics,
      meta: `${formatCommunityEventDate(event.startsAt)} · ${formatCommunityEventTime(event.startsAt, event.endsAt)} · ${getCommunityEventLocationLabel(event)}`,
      action: 'View event',
      path: `/candidate/community/events/${event.id}`,
      attending: event.isAttending,
      createdAt: event.createdAt,
    })),
    ...liveOpportunities.map((opportunity) => ({
      id: `opportunity-${opportunity.id}`,
      filter: 'Opportunities',
      type: opportunity.type,
      title: opportunity.title,
      description: opportunity.description,
      author: opportunity.company,
      tags: opportunity.skills,
      meta: opportunity.location,
      action: 'View opportunity',
      path: `/candidate/opportunities/${opportunity.id}`,
      createdAt: opportunity.sourceData?.created_at ?? null,
    })),
    ...defaultFeedItems,
  ].sort((first, second) => {
    const firstTimestamp = Date.parse(first.createdAt)
    const secondTimestamp = Date.parse(second.createdAt)
    return (Number.isFinite(secondTimestamp) ? secondTimestamp : 0)
      - (Number.isFinite(firstTimestamp) ? firstTimestamp : 0)
  }), [communityEvents, communityPosts, communityProjects, liveOpportunities, teammateRequests])
  const feedItems = communityFeedItems
  const visibleItems = activeFilter === 'All'
    ? feedItems
    : feedItems.filter((item) => item.filter === activeFilter)
  const isFeedLoading = projectsLoading
    || postsLoading
    || teammateRequestsLoading
    || eventsLoading
    || opportunitiesLoading
  const activeFilterPending = {
    Projects: projectsLoading || projectsError,
    Posts: postsLoading || postsError,
    Team: teammateRequestsLoading || teammateRequestsError,
    Opportunities: opportunitiesLoading || opportunitiesError,
    Events: eventsLoading || eventsError,
  }[activeFilter]

  return (
    <CandidateLayout title="Explore LinkPort">
      <section>
        <p className="font-mono text-sm text-[#64ffda]">Community home</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">
          Explore LinkPort
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
          Discover projects, opportunities, events, and people building their next step.
        </p>
      </section>

      {projectsError && (
        <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
          Community projects are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {postsError && (
        <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
          Community posts are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {teammateRequestsError && (
        <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
          Teammate requests are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {eventsError && (
        <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
          Upcoming events are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {opportunitiesError && (
        <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
          Some live opportunities are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {isFeedLoading && (
        <p role="status" className="mt-4 text-sm text-[#8892b0]">Loading the latest Home updates...</p>
      )}

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter community feed">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2" aria-live="polite">
        {visibleItems.map((item) => <FeedCard key={item.id} item={item} />)}
      </section>

      {visibleItems.length === 0 && !activeFilterPending && (
        <p className="mt-8 rounded-xl border border-[#233554] bg-[#112240]/50 p-6 text-sm text-[#8892b0]">
          {activeFilter === 'Team'
            ? 'No open teammate requests are available yet.'
            : 'No items are available in this category yet.'}
        </p>
      )}
    </CandidateLayout>
  )
}
