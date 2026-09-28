import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getJobs } from '../api/jobsApi'
import { getProjects } from '../api/projectsApi'
import {
  formatCommunityEventDate,
  formatCommunityEventTime,
  getCommunityEventLocationLabel,
} from '../data/communityEventMapper'
import { getCommunityProjectStatusLabel } from '../data/communityProjectMapper'
import { getCommunityPostCategoryLabel } from '../data/communityPostMapper'
import { jobToOpportunity, projectToOpportunity } from '../data/opportunityAdapters'
import { getSavedItemKey, SAVED_ITEM_TYPES, savedItemRecordToFeedItem } from '../data/savedItemMapper'
import {
  TEAMMATE_REQUEST_STATUSES,
  getTeammateRequestWorkStyleLabel,
} from '../data/teammateRequestMapper'
import useCommunityEvents from '../hooks/useCommunityEvents'
import useCommunityPosts from '../hooks/useCommunityPosts'
import useCommunityProjects from '../hooks/useCommunityProjects'
import useSavedItems from '../hooks/useSavedItems'
import useTeammateRequests from '../hooks/useTeammateRequests'
import CommunityFeedCard from './CommunityFeedCard'
import { FullPageLoadingScreen } from './PageLoadingScreen'

const filters = ['All', 'Posts', 'Projects', 'Team', 'Opportunities', 'Events', 'Saved']

const filterLabels = {
  Team: 'Collaboration',
}

const postTypeLabels = {
  question: 'DISCUSSION',
  showcase: 'SHOWCASE',
  collaboration: 'COLLABORATION',
  project_update: 'PROJECT UPDATE',
}

function getInitialFilter(value) {
  return filters.find((filter) => filter.toLowerCase() === value?.toLowerCase()) ?? 'All'
}

function formatFeedTimestamp(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Recently'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatOpportunityDeadline(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function communityPostToFeedItem(post, isSaved) {
  const categoryLabel = getCommunityPostCategoryLabel(post.category)
  return {
    id: `post-${post.id}`,
    postId: post.id,
    filter: 'Posts',
    type: postTypeLabels[post.category] ?? 'POST',
    title: categoryLabel,
    categoryLabel,
    description: post.text,
    author: post.authorName,
    authorId: post.authorId,
    authorHeadline: post.authorHeadline,
    tags: post.tags,
    images: post.images,
    videoUrl: post.videoUrl,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    isLiked: post.isLiked,
    isSaved,
    saveType: SAVED_ITEM_TYPES.COMMUNITY_POST,
    saveId: post.id,
    meta: formatFeedTimestamp(post.createdAt),
    action: null,
    path: `/member/community/discussions/${post.id}`,
    createdAt: post.createdAt,
  }
}

export default function CommunityFeed({
  aside = null,
  showHeading = false,
  fullPageLoading = false,
  contextLabel = 'Community',
  homeFeed = false,
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { projects: communityProjects, isLoading: projectsLoading, error: projectsError } = useCommunityProjects({ perPage: 3 })
  const { posts: communityPosts, isLoading: postsLoading, error: postsError } = useCommunityPosts({ perPage: 3 })
  const {
    requests: teammateRequests,
    isLoading: teammateRequestsLoading,
    error: teammateRequestsError,
  } = useTeammateRequests({ status: TEAMMATE_REQUEST_STATUSES.OPEN, perPage: 3 })
  const { events: communityEvents, isLoading: eventsLoading, error: eventsError } = useCommunityEvents({ perPage: 3 })
  const savedItems = useSavedItems()
  const [liveOpportunities, setLiveOpportunities] = useState([])
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true)
  const [opportunitiesError, setOpportunitiesError] = useState(false)
  const [activeFilter, setActiveFilter] = useState(() => getInitialFilter(searchParams.get('filter')))
  const [feedSearch, setFeedSearch] = useState(() => searchParams.get('search') ?? '')

  const selectFilter = (filter) => {
    setActiveFilter(filter)
    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current)
      if (filter === 'All') nextParams.delete('filter')
      else nextParams.set('filter', filter.toLowerCase())
      return nextParams
    }, { replace: true })
  }

  const updateFeedSearch = (event) => {
    const value = event.target.value
    setFeedSearch(value)
    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current)
      if (value.trim()) nextParams.set('search', value)
      else nextParams.delete('search')
      return nextParams
    }, { replace: true })
  }

  useEffect(() => {
    let isActive = true
    Promise.allSettled([
      getJobs({ per_page: 2, page: 1 }),
      getProjects({ per_page: 2, page: 1 }),
    ]).then(([jobsResult, projectsResult]) => {
      if (!isActive) return
      const nextOpportunities = []
      if (jobsResult.status === 'fulfilled') nextOpportunities.push(...jobsResult.value.data.map(jobToOpportunity))
      if (projectsResult.status === 'fulfilled') nextOpportunities.push(...projectsResult.value.data.map(projectToOpportunity))
      setLiveOpportunities(nextOpportunities)
      setOpportunitiesError(jobsResult.status === 'rejected' || projectsResult.status === 'rejected')
      setOpportunitiesLoading(false)
    })
    return () => { isActive = false }
  }, [])

  const communityFeedItems = useMemo(() => [
    ...communityProjects.map((project) => ({
      id: `project-${project.id}`,
      filter: 'Projects',
      type: 'PROJECT',
      title: project.title,
      description: project.description,
      author: project.creator,
      authorId: project.ownerId,
      authorHeadline: project.creatorHeadline,
      tags: project.skills,
      meta: `${formatFeedTimestamp(project.createdAt)} · ${getCommunityProjectStatusLabel(project.status)}`,
      action: 'View project',
      path: `/member/projects/${project.id}`,
      createdAt: project.createdAt,
      saveType: SAVED_ITEM_TYPES.COMMUNITY_PROJECT,
      saveId: project.id,
      isSaved: savedItems.savedKeys.has(getSavedItemKey(SAVED_ITEM_TYPES.COMMUNITY_PROJECT, project.id)),
    })),
    ...communityPosts.map((post) => communityPostToFeedItem(
      post,
      savedItems.savedKeys.has(getSavedItemKey(SAVED_ITEM_TYPES.COMMUNITY_POST, post.id)),
    )),
    ...teammateRequests.map((request) => ({
      id: `team-${request.id}`,
      filter: 'Team',
      type: 'LOOKING FOR TEAM',
      title: request.title,
      description: request.description,
      author: request.ownerName || 'Owner information unavailable',
      authorId: request.ownerId,
      authorHeadline: request.ownerHeadline,
      tags: request.skills,
      meta: `${formatFeedTimestamp(request.createdAt)} · ${request.rolesNeeded.length} ${request.rolesNeeded.length === 1 ? 'role' : 'roles'} · ${getTeammateRequestWorkStyleLabel(request.workStyle)}`,
      action: 'View request',
      path: `/member/community/team-requests/${request.id}`,
      createdAt: request.createdAt,
      saveType: SAVED_ITEM_TYPES.TEAMMATE_REQUEST,
      saveId: request.id,
      isSaved: savedItems.savedKeys.has(getSavedItemKey(SAVED_ITEM_TYPES.TEAMMATE_REQUEST, request.id)),
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
      eventDate: formatCommunityEventDate(event.startsAt),
      eventTime: formatCommunityEventTime(event.startsAt, event.endsAt),
      eventLocation: getCommunityEventLocationLabel(event),
      createdAt: event.createdAt,
      saveType: SAVED_ITEM_TYPES.COMMUNITY_EVENT,
      saveId: event.id,
      isSaved: savedItems.savedKeys.has(getSavedItemKey(SAVED_ITEM_TYPES.COMMUNITY_EVENT, event.id)),
    })),
    ...liveOpportunities.map((opportunity) => {
      const saveType = opportunity.source === 'job' ? SAVED_ITEM_TYPES.JOB : SAVED_ITEM_TYPES.PROJECT
      return {
        id: `opportunity-${opportunity.id}`,
        filter: 'Opportunities',
        type: opportunity.type,
        title: opportunity.title,
        description: opportunity.description,
        author: opportunity.company,
        tags: opportunity.skills,
        meta: opportunity.location,
        isOpportunity: true,
        workStyle: opportunity.workStyle,
        deadline: formatOpportunityDeadline(opportunity.deadline),
        action: 'View opportunity',
        path: `/member/opportunities/${opportunity.id}`,
        createdAt: opportunity.sourceData?.created_at ?? null,
        saveType,
        saveId: opportunity.sourceId,
        isSaved: savedItems.savedKeys.has(getSavedItemKey(saveType, opportunity.sourceId)),
      }
    }),
  ].sort((first, second) => {
    const firstTimestamp = Date.parse(first.createdAt)
    const secondTimestamp = Date.parse(second.createdAt)
    return (Number.isFinite(secondTimestamp) ? secondTimestamp : 0)
      - (Number.isFinite(firstTimestamp) ? firstTimestamp : 0)
  }), [communityEvents, communityPosts, communityProjects, liveOpportunities, savedItems.savedKeys, teammateRequests])

  const itemsForCategory = activeFilter === 'All'
    ? communityFeedItems
    : activeFilter === 'Saved'
      ? savedItems.items.map(savedItemRecordToFeedItem)
      : communityFeedItems.filter((item) => item.filter === activeFilter)
  const normalizedSearch = feedSearch.trim().toLowerCase()
  const visibleItems = normalizedSearch
    ? itemsForCategory.filter((item) => [
      item.title,
      item.description,
      item.author,
      item.type,
      item.meta,
      ...(item.tags ?? []),
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedSearch)))
    : itemsForCategory
  const isFeedLoading = projectsLoading || postsLoading || teammateRequestsLoading || eventsLoading || opportunitiesLoading || savedItems.isLoading
  const activeFilterPending = {
    Projects: projectsLoading || projectsError,
    Posts: postsLoading || postsError,
    Team: teammateRequestsLoading || teammateRequestsError,
    Opportunities: opportunitiesLoading || opportunitiesError,
    Events: eventsLoading || eventsError,
    Saved: savedItems.isLoading || savedItems.error,
  }[activeFilter]
  const feedWarnings = [
    projectsError && 'Community projects',
    postsError && 'Community posts',
    teammateRequestsError && 'Teammate requests',
    eventsError && 'Upcoming events',
    opportunitiesError && 'Some live opportunities',
    savedItems.error && 'Saved items',
  ].filter(Boolean)

  useEffect(() => {
    if (isFeedLoading) return undefined

    const savedPosition = window.sessionStorage.getItem('linkport:feed-return')
    if (!savedPosition) return undefined

    try {
      const { path, scrollY } = JSON.parse(savedPosition)
      const currentPath = window.location.pathname + window.location.search + window.location.hash
      if (path !== currentPath || !Number.isFinite(scrollY)) return undefined
      window.sessionStorage.removeItem('linkport:feed-return')
      const frame = window.requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'auto' }))
      return () => window.cancelAnimationFrame(frame)
    } catch {
      window.sessionStorage.removeItem('linkport:feed-return')
      return undefined
    }
  }, [isFeedLoading])

  if (isFeedLoading) {
    return fullPageLoading
      ? <FullPageLoadingScreen />
      : <p role="status" className="rounded-xl border border-border bg-surface/50 p-8 text-center text-sm text-text-muted">Loading the Community feed...</p>
  }

  return (
    <div className="min-w-0">
      {showHeading && (
        <section>
          <p className="font-mono text-sm text-primary">Community home</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Explore LinkPort</h2>
          <p className="mt-4 max-w-2xl leading-7 text-text-muted">Discover projects, opportunities, events, and people building their next step.</p>
        </section>
      )}

      {feedWarnings.length > 0 && <p role="status" className={`${showHeading ? 'mt-4' : 'mb-5'} rounded-lg border border-border bg-surface/45 px-4 py-3 text-sm text-text-muted`}>{feedWarnings.join(', ')} {feedWarnings.length === 1 ? 'is' : 'are'} temporarily unavailable. Other {contextLabel} updates are still available.</p>}

      <div className={`${showHeading ? 'mt-8' : homeFeed ? 'mt-5' : ''} grid min-w-0 gap-6 ${aside ? 'xl:grid-cols-[minmax(0,1fr)_17rem]' : ''}`}>
        <div className="min-w-0">
          <section aria-label="Search feed">
            <label htmlFor="home-feed-search" className="sr-only">Search the Home feed</label>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input
                id="home-feed-search"
                type="search"
                value={feedSearch}
                onChange={updateFeedSearch}
                placeholder="Search posts, projects, events, and opportunities..."
                className="w-full rounded-xl border border-border bg-surface/70 py-3 pl-11 pr-4 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
              />
            </div>
          </section>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter community feed">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter}
                onClick={() => selectFilter(filter)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                  filter === 'Saved'
                    ? activeFilter === filter
                      ? 'border-warning bg-warning text-background shadow-sm shadow-warning/20'
                      : 'border-warning/50 bg-warning/10 text-warning-text hover:bg-warning/20'
                    : activeFilter === filter
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-muted hover:border-primary/50 hover:text-text-primary'
                }`}
              >
                {filter === 'Saved' && <span aria-hidden="true" className="mr-1.5">★</span>}
                {filterLabels[filter] ?? filter}
              </button>
            ))}
          </div>

          <section className="mt-5 grid w-full min-w-0 grid-cols-1 gap-4" aria-live="polite">
            {visibleItems.map((item) => (
              <CommunityFeedCard
                key={item.id}
                item={item}
                preserveScrollPosition={homeFeed}
                onSavedChange={(changedItem, nextSaved) => savedItems.updateSavedState(changedItem.saveType, changedItem.saveId, nextSaved)}
              />
            ))}
          </section>

          {visibleItems.length === 0 && !activeFilterPending && <p className="mt-6 rounded-xl border border-border bg-surface/50 p-6 text-sm text-text-muted">{normalizedSearch ? 'No feed items match your search.' : activeFilter === 'Team' ? 'No open teammate requests are available yet.' : activeFilter === 'Saved' ? 'Save an item to keep it here.' : 'No items are available in this category yet.'}</p>}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </div>
  )
}
