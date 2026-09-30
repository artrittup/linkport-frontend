/**
 * Blue LinkPort tick, shown on profiles that have completed their details.
 * Hovering (or focusing) reveals the "LinkPort Verified" label.
 */
export default function VerifiedBadge({ className = 'h-5 w-5' }) {
  return (
    <span className="group relative inline-flex align-middle">
      <svg
        viewBox="0 0 24 24"
        className={className}
        role="img"
        aria-label="LinkPort Verified"
      >
        <circle cx="12" cy="12" r="11" className="fill-primary" />
        <path
          d="m7.5 12.4 3 3 6-6.4"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-[11px] font-semibold text-background group-hover:block group-focus-within:block"
      >
        LinkPort Verified
      </span>
    </span>
  )
}
