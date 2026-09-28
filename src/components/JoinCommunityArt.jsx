/**
 * Small sidebar motif: a member stepping into a community globe.
 * Same visual language as the header banner, scaled down.
 */
export default function JoinCommunityArt({ className = 'w-full' }) {
  return (
    <svg
      viewBox="0 0 120 56"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="A member joining a community"
    >
      {/* globe */}
      <g className="text-border-strong" stroke="currentColor" strokeWidth="1.1" opacity="0.75">
        <circle cx="88" cy="28" r="17" />
        <ellipse cx="88" cy="28" rx="7" ry="17" />
        <path d="M71.5 22.5h33M71.5 33.5h33" />
      </g>

      {/* path into the globe */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M34 28h26" strokeDasharray="3 3" opacity="0.7" />
        <path d="m56 24 4.5 4-4.5 4" />
      </g>

      {/* member */}
      <g>
        <circle cx="19" cy="28" r="11" className="text-surface" fill="currentColor" stroke="none" />
        <g className="text-primary" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <circle cx="19" cy="28" r="11" />
          <circle cx="19" cy="24.5" r="3.2" />
          <path d="M13.5 34.5a5.5 5.5 0 0 1 11 0" />
        </g>
      </g>
    </svg>
  )
}
