import { Link } from 'react-router'

export default function SectionTabs({ items, activeId, label, onSelect, className = '' }) {
  return (
    <nav className={`flex min-w-0 max-w-full gap-1 overflow-x-auto border-b border-border ${className}`} aria-label={label}>
      {items.map((item) => {
        const isActive = activeId === item.id
        const classes = `relative flex shrink-0 items-center justify-center gap-2 rounded-t-lg px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`
        const inner = (
          <>
            {item.label}
            {item.count !== undefined && <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] text-text-subtle">{item.count}</span>}
            {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
          </>
        )

        // Without a path the tabs switch local state rather than navigate.
        if (onSelect) {
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(item.id)}
              className={classes}
            >
              {inner}
            </button>
          )
        }

        return (
          <Link key={item.id} to={item.path} aria-current={isActive ? 'page' : undefined} className={classes}>
            {inner}
          </Link>
        )
      })}
    </nav>
  )
}
