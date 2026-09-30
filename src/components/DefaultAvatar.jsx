/**
 * Placeholder avatar in the old forum style: a shaded silhouette on a soft
 * backdrop, used before someone uploads a picture. Companies get a building.
 */
export default function DefaultAvatar({ kind = 'person', className = 'h-14 w-14' }) {
  const label = kind === 'company' ? 'Company logo placeholder' : 'No profile picture yet'

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-muted ${className}`}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`lp-av-bg-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--theme-surface-elevated)" />
            <stop offset="100%" stopColor="var(--theme-surface-muted)" />
          </linearGradient>
          <linearGradient id={`lp-av-fg-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--theme-text-disabled)" />
            <stop offset="100%" stopColor="var(--theme-text-muted)" />
          </linearGradient>
        </defs>

        <rect width="64" height="64" fill={`url(#lp-av-bg-${kind})`} />

        {kind === 'company' ? (
          <g fill={`url(#lp-av-fg-${kind})`}>
            <rect x="16" y="18" width="32" height="34" rx="2" />
            <rect x="21" y="24" width="6" height="6" rx="1" fill="var(--theme-surface)" />
            <rect x="31" y="24" width="6" height="6" rx="1" fill="var(--theme-surface)" />
            <rect x="41" y="24" width="2.5" height="6" rx="1" fill="var(--theme-surface)" />
            <rect x="21" y="34" width="6" height="6" rx="1" fill="var(--theme-surface)" />
            <rect x="31" y="34" width="6" height="6" rx="1" fill="var(--theme-surface)" />
            <rect x="41" y="34" width="2.5" height="6" rx="1" fill="var(--theme-surface)" />
            <rect x="28" y="44" width="8" height="8" rx="1" fill="var(--theme-surface)" />
          </g>
        ) : (
          <g fill={`url(#lp-av-fg-${kind})`}>
            <circle cx="32" cy="24" r="11" />
            <path d="M32 38c-11 0-19.5 6.6-21.5 16.4A32 32 0 0 0 32 64a32 32 0 0 0 21.5-9.6C51.5 44.6 43 38 32 38Z" />
          </g>
        )}
      </svg>
    </span>
  )
}
