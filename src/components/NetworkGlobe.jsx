const NODES = [
  { x: 30, y: 26 },
  { x: 118, y: 13 },
  { x: 206, y: 32 },
  { x: 296, y: 14 },
  { x: 400, y: 27 },
  { x: 504, y: 13 },
  { x: 594, y: 32 },
  { x: 682, y: 14 },
  { x: 770, y: 26 },
]

const LINKS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [0, 2], [1, 3], [3, 5], [5, 7], [2, 4], [4, 6],
]

/**
 * Wide banner motif: members linked right across the header.
 * viewBox is deliberately long and thin so `w-full` fills the bar.
 * Colours come from theme tokens so it reads in light and dark mode.
 */
export default function NetworkGlobe({ className = 'w-full' }) {
  return (
    <svg
      viewBox="0 0 800 46"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Members connected across the world"
    >
      {/* globe behind the centre of the chain */}
      <g className="text-border-strong" stroke="currentColor" strokeWidth="1" opacity="0.55">
        <circle cx="400" cy="23" r="17" />
        <ellipse cx="400" cy="23" rx="7" ry="17" />
        <path d="M383.5 17.5h33M383.5 28.5h33" />
      </g>

      {/* links */}
      <g className="text-primary" stroke="currentColor" strokeWidth="1" opacity="0.4">
        {LINKS.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} />
        ))}
      </g>

      {/* members */}
      {NODES.map((node) => (
        <g key={`${node.x}-${node.y}`}>
          <circle cx={node.x} cy={node.y} r="8.5" className="text-surface" fill="currentColor" stroke="none" />
          <g className="text-primary" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
            <circle cx={node.x} cy={node.y} r="8.5" />
            <circle cx={node.x} cy={node.y - 2.2} r="2.5" />
            <path d={`M${node.x - 4} ${node.y + 4.8}a4 4 0 0 1 8 0`} />
          </g>
        </g>
      ))}
    </svg>
  )
}
