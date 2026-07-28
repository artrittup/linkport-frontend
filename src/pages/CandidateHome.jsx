import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useLocalContent } from '../context/LocalContentContext'
import { getCommunityProjectStatusLabel } from '../data/communityProjectMapper'
import { getCommunityPostCategoryLabel } from '../data/communityPostMapper'
import { formatEventDate, formatEventTime, mockEvents } from '../data/mockEvents'
import {
  TEAMMATE_REQUEST_STATUSES,
  getTeammateRequestWorkStyleLabel,
} from '../data/teammateRequestMapper'
import useCommunityProjects from '../hooks/useCommunityProjects'
import useCommunityPosts from '../hooks/useCommunityPosts'
import useTeammateRequests from '../hooks/useTeammateRequests'
import CandidateLayout from '../layouts/CandidateLayout'

const filters = ['All', 'Projects', 'Posts', 'Team', 'Opportunities', 'Events']
const featuredEvent = mockEvents[0]

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
  },
  {
    id: 3,
    filter: 'Events',
    type: 'EVENT',
    eventId: featuredEvent.id,
    title: featuredEvent.title,
    description: featuredEvent.shortDescription,
    author: featuredEvent.organizer,
    tags: featuredEvent.topics,
    meta: `${formatEventDate(featuredEvent.date)} · ${formatEventTime(featuredEvent)} · ${featuredEvent.location}`,
    action: 'View event',
    path: `/candidate/community/events/${featuredEvent.id}`,
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
  const { attendingEventIds, storageError } = useLocalContent()
  const {
    projects: communityProjects,
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
  const [activeFilter, setActiveFilter] = useState('All')
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
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [communityPosts, communityProjects, teammateRequests])
  const feedItems = [
    ...communityFeedItems,
    ...defaultFeedItems.map((item) => ({
      ...item,
      attending: Boolean(item.eventId && attendingEventIds.includes(item.eventId)),
    })),
  ]
  const visibleItems = activeFilter === 'All'
    ? feedItems
    : feedItems.filter((item) => item.filter === activeFilter)

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

      {storageError && (
        <p role="status" className="mt-6 rounded-lg border border-[#facc15]/25 bg-[#facc15]/5 px-4 py-3 text-sm text-[#fde68a]">{storageError}</p>
      )}
      {projectsError && (
        <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
          Community projects are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {postsLoading && (
        <p role="status" className="mt-4 text-sm text-[#8892b0]">Loading community posts...</p>
      )}
      {postsError && (
        <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
          Community posts are temporarily unavailable. Other Home updates are still available.
        </p>
      )}
      {teammateRequestsLoading && (
        <p role="status" className="mt-4 text-sm text-[#8892b0]">Loading teammate requests...</p>
      )}
      {teammateRequestsError && (
        <p role="status" className="mt-4 rounded-lg border border-[#233554] bg-[#112240]/45 px-4 py-3 text-sm text-[#8892b0]">
          Teammate requests are temporarily unavailable. Other Home updates are still available.
        </p>
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

      {visibleItems.length === 0
        && !(activeFilter === 'Team' && (teammateRequestsLoading || teammateRequestsError)) && (
        <p className="mt-8 rounded-xl border border-[#233554] bg-[#112240]/50 p-6 text-sm text-[#8892b0]">
          {activeFilter === 'Team'
            ? 'No open teammate requests are available yet.'
            : 'No items are available in this category yet.'}
        </p>
      )}
    </CandidateLayout>
  )
}
