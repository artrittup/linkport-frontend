import { useMemo, useState } from 'react'
import { communityIdeas } from '../data/communityContent'

export default function CommunityIdeasView() {
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('All')
  const stages = useMemo(() => ['All', ...new Set(communityIdeas.map((idea) => idea.stage))], [])
  const visibleIdeas = useMemo(() => {
    const query = search.trim().toLowerCase()
    return communityIdeas
      .filter((idea) => stage === 'All' || idea.stage === stage)
      .filter((idea) => !query || [idea.title, idea.description, idea.circleName, idea.kind, ...idea.helpNeeded]
        .some((value) => value.toLowerCase().includes(query)))
  }, [search, stage])

  return (
    <section aria-labelledby="community-ideas-heading">
      <h2 id="community-ideas-heading" className="text-2xl font-semibold text-text-primary">Ideas</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Explore community initiatives, creative collaborations, learning groups, and early concepts looking for people.</p>

      <div className="mt-6 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div>
          <label htmlFor="idea-search" className="sr-only">Search community ideas</label>
          <input id="idea-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ideas, skills, or Circles..." className="w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
        </div>
        <div>
          <label htmlFor="idea-stage" className="sr-only">Filter ideas by readiness</label>
          <select id="idea-stage" value={stage} onChange={(event) => setStage(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-3 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
            {stages.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleIdeas.map((idea) => (
          <article key={idea.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{idea.kind}</span>
              <span className="rounded-full border border-border bg-background/50 px-2.5 py-1 text-[10px] font-semibold text-text-secondary">{idea.stage}</span>
            </div>
            <h3 className="mt-4 break-words text-lg font-semibold text-text-primary">{idea.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">{idea.description}</p>
            <p className="mt-4 text-xs font-medium text-text-secondary">{idea.circleName}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {idea.helpNeeded.map((need) => <span key={need} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary">{need}</span>)}
            </div>
            <p className="mt-auto border-t border-border pt-4 text-xs font-medium text-primary">{idea.interestCount} members interested</p>
          </article>
        ))}
      </div>

      {visibleIdeas.length === 0 && <p className="mt-6 rounded-xl border border-border bg-surface/50 p-6 text-sm text-text-muted">No community ideas match your search.</p>}
    </section>
  )
}
