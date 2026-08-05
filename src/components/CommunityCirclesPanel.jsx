import CircleCard from './CircleCard'

function PanelSection({ title, actionLabel, onAction, children }) {
  return (
    <section className="rounded-2xl border border-border bg-surface/55 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <button type="button" onClick={onAction} className="shrink-0 text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
          {actionLabel}
        </button>
      </div>
      <div className="mt-3 space-y-1">{children}</div>
    </section>
  )
}

export default function CommunityCirclesPanel({ circles, onViewChange, onPreview }) {
  const joined = circles.filter((circle) => circle.isJoined).slice(0, 3)
  const suggested = circles.filter((circle) => circle.isRecommended && !circle.isJoined).slice(0, 3)

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start" aria-label="Circle shortcuts">
      <PanelSection title="My Circles" actionLabel="View all" onAction={() => onViewChange('my-circles')}>
        {joined.length > 0
          ? joined.map((circle) => <CircleCard key={circle.id} circle={circle} variant="compact" onOpen={onPreview} />)
          : <p className="px-2 py-3 text-xs leading-5 text-text-muted">Join a Circle to keep it close at hand.</p>}
      </PanelSection>
      <PanelSection title="Suggested Circles" actionLabel="Discover more" onAction={() => onViewChange('discover')}>
        {suggested.map((circle) => <CircleCard key={circle.id} circle={circle} variant="compact" onOpen={onPreview} />)}
      </PanelSection>
    </aside>
  )
}
