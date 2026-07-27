import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useLocalContent } from '../context/LocalContentContext'
import { formatEventDate, formatEventTime, mockEvents } from '../data/mockEvents'
import CandidateLayout from '../layouts/CandidateLayout'

const filters = ['All', 'Projects', 'Posts', 'Team', 'Opportunities', 'Events']
const featuredEvent = mockEvents[0]

const defaultFeedItems = [
  {
    id: 1,
    filter: 'Projects',
    type: 'PROJECT',
    title: 'Campus Sustainability Tracker',
    description: 'A student-led dashboard helping universities measure waste, energy use, and practical sustainability goals.',
    author: 'Arta K. and GreenLab',
    tags: ['React', 'Data', 'Sustainability'],
    meta: 'Remote collaboration',
    action: 'View project',
    path: '/candidate/projects',
  },
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
  {
    id: 4,
    filter: 'Team',
    type: 'LOOKING FOR TEAM',
    title: 'Looking for teammates for a study planner',
    description: 'A simple mobile-first planner for students. We are looking for one designer and one backend developer.',
    author: 'Leon M.',
    tags: ['Product Design', 'Laravel', 'Students'],
    meta: '2 open teammate roles',
    action: 'Join project',
    path: '/candidate/projects/focusmate-mobile',
  },
]

function FeedCard({ item }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 sm:p-6">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#64ffda]/10 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-[#64ffda]">
            {item.type}
          </span>
          {item.attending && <span className="rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-2.5 py-1 text-xs font-medium text-[#86efac]">Attending</span>}
        </div>
        <span className="text-xs text-[#64748b]">{item.meta}</span>
      </div>

      <h2 className="mt-5 text-xl font-semibold text-[#e6f1ff]">{item.title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#8892b0]">{item.description}</p>
      <p className="mt-4 text-xs font-medium text-[#a8b2d1]">{item.author}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#8892b0]">
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
  const { attendingEventIds, projects, posts, teamRequests, storageError } = useLocalContent()
  const [activeFilter, setActiveFilter] = useState('All')
  const localFeedItems = useMemo(() => [
    ...projects.map((project) => ({
      id: project.id,
      filter: 'Projects',
      type: 'PROJECT',
      title: project.title,
      description: project.description,
      author: project.creator,
      tags: project.skills,
      meta: project.status,
      action: 'View project',
      path: `/candidate/projects/${project.id}`,
      createdAt: project.createdAt,
    })),
    ...posts.map((post) => ({
      id: post.id,
      filter: 'Posts',
      type: 'POST',
      title: post.category,
      description: post.text,
      author: post.author,
      tags: post.tags,
      meta: new Date(post.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
      action: null,
      path: null,
      createdAt: post.createdAt,
    })),
    ...teamRequests.map((request) => ({
      id: request.id,
      filter: 'Team',
      type: 'LOOKING FOR TEAM',
      title: request.title,
      description: request.context,
      author: request.author,
      tags: request.skills,
      meta: `${request.roles.length} ${request.roles.length === 1 ? 'role' : 'roles'} · ${request.workStyle}`,
      action: 'View request',
      path: '/candidate/community#collaboration',
      createdAt: request.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [posts, projects, teamRequests])
  const feedItems = [
    ...localFeedItems,
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

      {visibleItems.length === 0 && (
        <p className="mt-8 rounded-xl border border-[#233554] bg-[#112240]/50 p-6 text-sm text-[#8892b0]">
          No items are available in this category yet.
        </p>
      )}
    </CandidateLayout>
  )
}
