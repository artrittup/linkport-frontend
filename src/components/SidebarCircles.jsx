import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getMyCircles } from '../api/circlesApi'

function initialsOf(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

/** Second sidebar block: the communities this member belongs to. */
const VISIBLE = 4

export default function SidebarCircles({ onNavigate }) {
  const [circles, setCircles] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let active = true

    getMyCircles({ per_page: 30 })
      .then((response) => { if (active) setCircles(response.data ?? []) })
      .catch(() => { if (active) setCircles([]) })

    return () => { active = false }
  }, [])

  return (
    <div className="border-t border-border/80 px-3 py-3">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
        Your communities
      </p>

      {circles === null && (
        <p className="px-3 py-1.5 text-xs text-text-subtle">Loading...</p>
      )}

      {circles?.length === 0 && (
        <p className="px-3 py-1.5 text-xs leading-5 text-text-subtle">
          You have not joined a community yet.
        </p>
      )}

      <div
        className={`space-y-0.5 ${
          showAll ? 'max-h-64 overflow-y-auto pr-1' : ''
        }`}
      >
        {(showAll ? circles ?? [] : (circles ?? []).slice(0, VISIBLE)).map((circle) => (
          <Link
            key={circle.id}
            to={`/circles/${circle.id}`}
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-text-muted no-underline transition-colors hover:bg-surface hover:text-text-primary"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 font-mono text-[10px] font-bold text-primary">
              {initialsOf(circle.name)}
            </span>
            <span className="truncate">{circle.name}</span>
          </Link>
        ))}
      </div>

      {(circles?.length ?? 0) > VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="mt-1 block w-full px-3 py-1.5 text-left text-xs font-semibold text-primary hover:underline"
        >
          {showAll ? 'Show less' : `View more (${circles.length - VISIBLE})`}
        </button>
      )}

      {circles?.length === 0 && (
        <Link
          to="/member/community?view=discover"
          onClick={onNavigate}
          className="mt-1 block px-3 py-1.5 text-xs font-semibold text-primary no-underline hover:underline"
        >
          Find a community
        </Link>
      )}
    </div>
  )
}
