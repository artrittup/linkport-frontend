import { useState } from 'react'
import { Link } from 'react-router'
import CandidateLayout from '../layouts/CandidateLayout'

const filters = ['All', 'Projects', 'Opportunities', 'Events']

const feedItems = [
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
    title: 'Portfolio Review Evening',
    description: 'Bring one project and get practical feedback from designers, developers, and recent graduates.',
    author: 'LinkPort Community',
    tags: ['Portfolio', 'Networking'],
    meta: 'August 24 · 18:00 · Online',
    action: 'View event',
    path: '/candidate/community',
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#64ffda]/10 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-[#64ffda]">
          {item.type}
        </span>
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
        <Link
          to={item.path}
          className="inline-flex items-center justify-center rounded-lg border border-[#64ffda]/70 px-4 py-2 text-sm font-semibold text-[#64ffda] transition-colors hover:border-[#64ffda] hover:bg-[#64ffda]/10"
        >
          {item.action}
        </Link>
      </div>
    </article>
  )
}

export default function CandidateHome() {
  const [activeFilter, setActiveFilter] = useState('All')
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
