import { useEffect, useMemo, useRef, useState } from 'react'
import { DIAL_CODES } from '../data/countries'

function Flag({ iso }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${iso}.png`}
      alt=""
      width="20"
      height="15"
      loading="lazy"
      className="shrink-0 rounded-[2px]"
    />
  )
}

/**
 * Dial-code picker with a search box. Windows does not render regional
 * indicator flag emoji, so flags come in as images — which a <select> cannot
 * hold, hence the custom dropdown.
 */
export default function DialCodeSelect({ iso, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const boxRef = useRef(null)
  const current = DIAL_CODES.find((item) => item.iso === iso) ?? DIAL_CODES[0]

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^\+/, '')
    if (!needle) return DIAL_CODES

    return DIAL_CODES.filter((item) =>
      item.dial.replace('+', '').startsWith(needle)
      || item.name.toLowerCase().startsWith(needle)
      || item.iso === needle,
    )
  }, [query])

  useEffect(() => {
    if (!open) return undefined

    const close = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (index + 1) % Math.max(matches.length, 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (index - 1 + matches.length) % Math.max(matches.length, 1))
    } else if (event.key === 'Enter') {
      // Pick the highlighted code rather than submitting the sign-up form.
      event.preventDefault()
      if (matches.length > 0) choose(matches[Math.min(active, matches.length - 1)])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const choose = (item) => {
    onChange(item)
    setQuery('')
    setActive(0)
    setOpen(false)
  }

  return (
    <div ref={boxRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Dialling code ${current.dial}`}
        className="flex h-[3.75rem] w-[5.75rem] items-center gap-1 overflow-hidden rounded-lg border border-border bg-surface px-2 text-sm text-text-primary outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring"
      >
        <Flag iso={current.iso} />
        <span className="whitespace-nowrap">{current.dial}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-auto h-3 w-3 shrink-0 text-text-subtle"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-60 rounded-lg border border-border-strong bg-surface shadow-lg">
          <input
            type="text"
            value={query}
            autoFocus
            onChange={(event) => { setQuery(event.target.value); setActive(0) }}
            onKeyDown={onKeyDown}
            placeholder="Search"
            aria-label="Search dialling codes"
            className="w-full rounded-t-lg border-b border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-subtle"
          />

          <ul role="listbox" className="max-h-56 overflow-auto">
            {matches.map((item, index) => (
              <li key={item.iso}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(item)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm ${
                    index === active
                      ? 'bg-surface-muted text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  <Flag iso={item.iso} />
                  <span className="font-medium">{item.dial}</span>
                  <span className="truncate text-text-muted">{item.name}</span>
                </button>
              </li>
            ))}

            {matches.length === 0 && (
              <li className="px-3 py-3 text-sm text-text-subtle">No match</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
