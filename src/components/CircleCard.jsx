import Button from './Button'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function CircleVisual({ circle, compact = false }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-mono font-bold text-primary ${compact ? 'h-10 w-10 text-xs' : 'h-12 w-12 text-sm'}`}
      aria-hidden="true"
    >
      {getInitials(circle.name)}
    </span>
  )
}

export default function CircleCard({
  circle,
  variant = 'standard',
  onOpen,
  onJoin,
  primaryActionLabel,
}) {
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => onOpen?.(circle)}
        className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-background/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        aria-label={`Preview ${circle.name}`}
      >
        <CircleVisual circle={circle} compact />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-text-primary">{circle.name}</span>
          <span className="mt-0.5 block truncate text-xs text-text-muted">
            {circle.category} · {circle.memberCount.toLocaleString()} members
          </span>
        </span>
      </button>
    )
  }

  const actionLabel = primaryActionLabel ?? (circle.isJoined ? 'Joined' : 'Join')

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface/65 p-5 transition-colors hover:border-primary/35 sm:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <CircleVisual circle={circle} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-primary">{circle.category}</p>
              <h3 className="mt-1 break-words text-lg font-semibold text-text-primary">{circle.name}</h3>
            </div>
            {circle.isJoined ? (
              <span className="shrink-0 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success-text">Joined</span>
            ) : circle.isRecommended ? (
              <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">Recommended</span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 break-words text-sm font-medium text-text-secondary">{circle.tagline}</p>
      <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-text-muted">{circle.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {circle.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full border border-border bg-background/45 px-2.5 py-1 text-xs text-text-secondary">{tag}</span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs text-text-muted">
        <span>{circle.memberCount.toLocaleString()} members</span>
        <span>{circle.discussionCount.toLocaleString()} discussions</span>
        {circle.location && <span className="col-span-2 truncate">{circle.location}</span>}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <span className="text-xs font-medium text-success-text">{circle.activityLevel}</span>
        {primaryActionLabel ? (
          <Button size="sm" variant="outline" onClick={() => onOpen?.(circle)}>{actionLabel}</Button>
        ) : circle.isJoined ? (
          <Button size="sm" variant="outline" disabled>Joined</Button>
        ) : (
          <Button size="sm" onClick={() => onJoin?.(circle)}>{actionLabel}</Button>
        )}
      </div>
    </article>
  )
}
