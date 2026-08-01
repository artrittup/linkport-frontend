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

function getInitials(name) {
  return (name || 'LP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function FeedCard({ item }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const shouldCollapse = item.description.length > 180
  const visibleDescription = shouldCollapse && !isExpanded
    ? `${item.description.slice(0, 180).trim()}...`
    : item.description

  return (
    <article className="flex min-w-0 max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-300/80 bg-surface shadow-sm shadow-slate-200/50 dark:border-border dark:shadow-black/10">
      <div className="border-b border-border/70 bg-surface/80 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono text-sm font-bold text-primary">
              {getInitials(item.author)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text-primary">{item.author}</p>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-text-subtle">
                <span>{item.meta}</span>
                <span aria-hidden="true">•</span>
                <span>{item.type}</span>
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
            {item.categoryLabel || item.filter}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-border bg-background/55 px-2.5 py-1 text-xs font-semibold text-text-secondary">
            {item.title}
          </span>
          {item.attending && <span className="rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success-text">Attending</span>}
        </div>

        <p className="mt-4 break-words text-sm leading-7 text-text-muted">{visibleDescription}</p>

        {item.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.slice(0, 8).map((tag) => (
              <span key={tag} className="max-w-full break-words rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
          {shouldCollapse && (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
            >
              {isExpanded ? 'Show less' : 'View more'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCommenting((current) => !current)}
            className="rounded-lg px-3 py-2 text-sm font-bold text-text-secondary transition-colors hover:bg-surface-elevated hover:text-primary"
          >
            Comment
          </button>
          {item.action && item.path && (
            <Link
              to={item.path}
              className="rounded-lg px-3 py-2 text-sm font-bold text-text-secondary transition-colors hover:bg-surface-elevated hover:text-primary"
            >
              {item.action}
            </Link>
          )}
        </div>

        {isCommenting && (
          <div className="mt-4 rounded-xl border border-border bg-background/55 p-3">
            <input
              type="text"
              placeholder="Write a comment..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
            />
            <p className="mt-2 text-xs text-text-subtle">Comments UI ready — backend comments API can be connected next.</p>
          </div>
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
      path: `/member/projects/${project.id}`,
      createdAt: project.createdAt,
    })),
    ...communityPosts.map((post) => ({
      id: `post-${post.id}`,
      filter: 'Posts',
      type: 'POST',
      title: getCommunityPostCategoryLabel(post.category),
      categoryLabel: getCommunityPostCategoryLabel(post.category),
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
      path: `/member/community/team-requests/${request.id}`,
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
      path: `/member/community/events/${event.id}`,
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
      path: `/member/opportunities/${opportunity.id}`,
      createdAt: opportunity.sourceData?.created_at ?? null,
    })),
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
        <p className="font-mono text-sm text-primary">Community home</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Explore LinkPort
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-text-muted">
          Discover projects, opportunities, events, and people building their next step.
        </p>
      </section>

      {projectsError && (
        <p role="status" className="mt-4 rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted">
          Community projects are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {postsError && (
        <p role="status" className="mt-4 rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted">
          Community posts are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {teammateRequestsError && (
        <p role="status" className="mt-4 rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted">
          Teammate requests are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {eventsError && (
        <p role="status" className="mt-4 rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted">
          Upcoming events are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {opportunitiesError && (
        <p role="status" className="mt-4 rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted">
          Some live opportunities are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {isFeedLoading && (
        <p role="status" className="mt-4 text-sm text-text-muted">Loading the latest Home updates...</p>
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
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-text-muted hover:border-primary/50 hover:text-text-primary'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <section className="mt-8 flex flex-col gap-5" aria-live="polite">
        {visibleItems.map((item) => <FeedCard key={item.id} item={item} />)}
      </section>

      {visibleItems.length === 0 && !activeFilterPending && (
        <p className="mt-8 rounded-xl border border-border bg-surface/50 p-6 text-sm text-text-muted">
          {activeFilter === 'Team'
            ? 'No open teammate requests are available yet.'
            : 'No items are available in this category yet.'}
        </p>
      )}
    </CandidateLayout>
  )
}
