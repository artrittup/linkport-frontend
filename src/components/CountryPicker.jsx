import { useId, useMemo, useState } from 'react'
import { searchCountries } from '../data/countries'

function PinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/**
 * Country typeahead. Nothing is listed until the person types, then the list
 * narrows as they keep going. Floating label, matching the account fields.
 */
export default function CountryPicker({ value, onChange, invalid = false }) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const matches = useMemo(() => searchCountries(value ?? ''), [value])
  const exact = matches.length === 1 && matches[0].name === value
  const listOpen = open && matches.length > 0 && !exact

  const pick = (country) => {
    onChange({ target: { name: 'location', value: country.name } })
    setOpen(false)
    setActive(0)
  }

  const onKeyDown = (event) => {
    if (!listOpen) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (index + 1) % matches.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (index - 1 + matches.length) % matches.length)
    } else if (event.key === 'Enter') {
      // Choose the highlighted country instead of submitting the form.
      event.preventDefault()
      pick(matches[Math.min(active, matches.length - 1)])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <input
        id="register-location"
        name="location"
        role="combobox"
        aria-expanded={listOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder=" "
        value={value}
        onChange={(event) => { onChange(event); setOpen(true); setActive(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        aria-invalid={invalid || undefined}
        className={`peer h-[3.75rem] w-full rounded-lg border bg-surface pb-2 pl-9 pr-3 pt-7 text-[15px] leading-tight text-text-primary outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring ${
          invalid ? 'border-danger' : 'border-border'
        }`}
      />

      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle">
        <PinIcon />
      </span>

      <label
        htmlFor="register-location"
        className="pointer-events-none absolute left-9 top-[0.85rem] text-[11px] leading-none text-text-muted transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-focus:top-[0.85rem] peer-focus:translate-y-0 peer-focus:text-[11px]"
      >
        Country
      </label>

      {listOpen && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border-strong bg-surface shadow-lg"
        >
          {matches.map((country, index) => (
            <li key={country.iso}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(country)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm ${
                  index === active
                    ? 'bg-surface-muted text-text-primary'
                    : 'text-text-secondary'
                }`}
              >
                <img
                  src={`https://flagcdn.com/24x18/${country.iso}.png`}
                  alt=""
                  width="20"
                  height="15"
                  loading="lazy"
                  className="shrink-0 rounded-[2px]"
                />
                <span className="truncate">{country.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
