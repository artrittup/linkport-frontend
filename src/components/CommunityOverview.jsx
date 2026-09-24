import CircleCard from './CircleCard'
import { communityDiscussions, communityIdeas } from '../data/communityContent'

function SectionHeader({ id, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-xl font-semibold text-text-primary sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-text-muted">{description}</p>}
      </div>
      {actionLabel && <button type="button" onClick={onAction} className="text-sm font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">{actionLabel}</button>}
    </div>
  )
}

function JoinedCircleItem({ circle, onOpen }) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface/55 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary" aria-hidden="true">
        {circle.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-text-primary">{circle.name}</h3>
        <p className="mt-1 truncate text-xs text-text-muted">{circle.category} · {circle.memberCount.toLocaleString()} members</p>
        <p className="mt-1 text-xs font-medium text-success-text">{circle.activityLevel}</p>
      </div>
      <button type="button" onClick={() => onOpen(circle)} className="shrink-0 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">Open</button>
    </article>
  )
}

export default function CommunityOverview({ circles, onViewChange, onPreview }) {
  const joined = circles.filter((circle) => circle.isJoined).slice(0, 4)
  const recommended = circles.filter((circle) => circle.isRecommended && !circle.isJoined).slice(0, 4)

  return (
    <div className="grid min-w-0 gap-8 xl:grid-cols-2">
      <section className="min-w-0" aria-labelledby="overview-circles-heading">
        <SectionHeader id="overview-circles-heading" title="Your Circles" description="The communities you return to most." actionLabel="View all" onAction={() => onViewChange('my-circles')} />
        {joined.length > 0 ? (
          <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {joined.map((circle) => <JoinedCircleItem key={circle.id} circle={circle} onOpen={onPreview} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border bg-surface/55 p-6">
            <h3 className="font-semibold text-text-primary">Find a Circle that feels like yours</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">Join a community around an interest, goal, or idea you care about.</p>
            <button type="button" onClick={() => onViewChange('discover')} className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">Discover Circles</button>
          </div>
        )}
      </section>

      <section className="min-w-0" aria-labelledby="overview-discover-heading">
        <SectionHeader id="overview-discover-heading" title="Discover something new" description="Recommended communities with room for your perspective." actionLabel="Discover Circles" onAction={() => onViewChange('discover')} />
        <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2">
          {recommended.map((circle) => <CircleCard key={circle.id} circle={circle} variant="compact" onOpen={onPreview} />)}
        </div>
      </section>

      <section className="min-w-0 xl:col-span-2" aria-labelledby="overview-discussions-heading">
        <SectionHeader id="overview-discussions-heading" title="Active discussions" description="Focused conversations where your experience can help." actionLabel="Browse discussions" onAction={() => onViewChange('discussions')} />
        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
          {communityDiscussions.slice(0, 4).map((discussion) => (
            <button key={discussion.id} type="button" onClick={() => onViewChange('discussions')} className="min-w-0 rounded-xl border border-border bg-surface/55 p-4 text-left transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{discussion.type}</span>
              <h3 className="mt-2 break-words text-sm font-semibold leading-6 text-text-primary">{discussion.title}</h3>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                <span>{discussion.circleName}</span>
                <span>{discussion.replyCount} replies</span>
                <span>{discussion.activityLabel}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="min-w-0 xl:col-span-2" aria-labelledby="overview-ideas-heading">
        <SectionHeader id="overview-ideas-heading" title="Ideas looking for people" description="Early community ideas seeking collaborators, feedback, and contributors." actionLabel="Explore ideas" onAction={() => onViewChange('ideas')} />
        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-3">
          {communityIdeas.slice(0, 3).map((idea) => (
            <article key={idea.id} className="flex min-w-0 flex-col rounded-xl border border-border bg-surface/55 p-4">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{idea.stage}</span>
              <h3 className="mt-2 break-words text-base font-semibold text-text-primary">{idea.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{idea.description}</p>
              <p className="mt-3 text-xs text-text-secondary">{idea.circleName}</p>
              <p className="mt-2 text-xs text-text-muted">Needs: {idea.helpNeeded.slice(0, 2).join(', ')}</p>
              <p className="mt-auto pt-4 text-xs font-medium text-primary">{idea.interestCount} members interested</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
