import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { searchProfiles } from '../api/searchApi'
import { useAuth } from '../context/AuthContext'
import skillGroups from './skillOptions'

const emptyResults = {
  members: { data: [], total: 0 },
  companies: { data: [], total: 0 },
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
    </svg>
  )
}

function TuneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" />
    </svg>
  )
}

function ResultSection({ label, items, kind, onSelect }) {
  if (!items.length) return null

  return (
    <section>
      <p className="px-3 pb-1.5 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{label}</p>
      {items.slice(0, 3).map((item) => {
        const isMember = kind === 'member'
        const profile = item.profile ?? {}
        const name = isMember ? item.name : (profile.company_name || item.name)
        const detail = isMember ? profile.headline : profile.industry

        return (
          <Link
            key={item.id}
            to={isMember ? `/members/${item.id}` : `/companies/${item.id}`}
            onClick={onSelect}
            className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-deep text-xs font-semibold text-primary">
              {name?.charAt(0)?.toUpperCase() || '?'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-text-primary">{name}</span>
              {(detail || profile.location) && <span className="mt-0.5 block truncate text-xs text-text-muted">{[detail, profile.location].filter(Boolean).join(' · ')}</span>}
              {isMember && profile.skills?.length > 0 && (
                <span className="mt-1 flex gap-1 overflow-hidden">
                  {profile.skills.slice(0, 2).map((skill) => <span key={skill} className="truncate rounded-full bg-primary/8 px-1.5 py-0.5 text-[10px] text-primary">{skill}</span>)}
                </span>
              )}
            </span>
            <span className="pt-1 text-text-subtle transition-colors group-hover:text-primary">→</span>
          </Link>
        )
      })}
    </section>
  )
}

export default function GlobalSearch({
  className = '',
  placeholder = 'Search',
  dropdownAlign = 'right',
}) {
  const inputId = useId()
  const containerRef = useRef(null)
  const requestId = useRef(0)
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [skill, setSkill] = useState('')
  const [location, setLocation] = useState('')
  const [industry, setIndustry] = useState('')
  const [results, setResults] = useState(emptyResults)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtersApplied = Boolean(skill.trim() || location.trim() || industry.trim() || type !== 'all')
  const canSearch = query.trim().length >= 2 || filtersApplied

  useEffect(() => {
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  useEffect(() => {
    if (!canSearch || !isAuthenticated) {
      requestId.current += 1
      return undefined
    }

    const currentRequest = ++requestId.current
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await searchProfiles({
          q: query.trim() || undefined,
          type,
          skill: skill.trim() || undefined,
          location: location.trim() || undefined,
          industry: industry.trim() || undefined,
          per_page: 3,
        })
        if (currentRequest === requestId.current) setResults(data)
      } catch {
        if (currentRequest === requestId.current) {
          setResults(emptyResults)
          setError('Search is unavailable right now. Please try again.')
        }
      } finally {
        if (currentRequest === requestId.current) setIsLoading(false)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query, type, skill, location, industry, canSearch, isAuthenticated])

  const noResults = !results.members.data.length && !results.companies.data.length
  const filterInput = 'h-9 min-w-0 rounded-md border border-border bg-surface-deep px-2.5 text-xs text-text-primary outline-none placeholder:text-text-subtle focus:border-primary'

  return (
    <div ref={containerRef} className={`relative min-w-0 max-w-full ${className}`}>
      <label htmlFor={inputId} className="sr-only">Search LinkPort</label>
      <div className="group flex h-10 items-center rounded-lg border border-border bg-surface transition-colors focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-focus-ring/30">
        <span className="pointer-events-none pl-3 text-text-muted group-focus-within:text-primary"><SearchIcon /></span>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-text-primary outline-none placeholder:text-text-subtle"
          autoComplete="off"
          aria-expanded={isOpen}
          aria-controls={`${inputId}-results`}
        />
      </div>

      {isOpen && (
        <>
        <button
          type="button"
          aria-label="Close search"
          onClick={() => setIsOpen(false)}
          className="fixed inset-x-0 bottom-0 top-[88px] z-40 cursor-default bg-overlay/35 backdrop-blur-[1px]"
        />
        <div id={`${inputId}-results`} className={`absolute top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/50 ${dropdownAlign === 'left' ? 'left-0' : 'right-0'}`}>
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs text-text-muted">Search people and companies</span>
            <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${filtersOpen || filtersApplied ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'}`}>
              <TuneIcon /> Filters{filtersApplied ? ' •' : ''}
            </button>
          </div>

          {filtersOpen && (
            <div className="grid grid-cols-2 gap-2 border-b border-border bg-surface-deep/55 p-3">
              <select aria-label="Result type" value={type} onChange={(event) => setType(event.target.value)} className={filterInput}><option value="all">All</option><option value="members">Members</option><option value="companies">Companies</option></select>
              <select aria-label="Skill filter" value={skill} onChange={(event) => setSkill(event.target.value)} className={filterInput}>
                <option value="">Any skill</option>
                {skillGroups.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.skills.map((option) => <option key={option} value={option}>{option}</option>)}
                  </optgroup>
                ))}
              </select>
              <input aria-label="Location filter" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" className={filterInput} />
              <input aria-label="Industry filter" value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="Industry" className={filterInput} />
            </div>
          )}

          <div className="max-h-[25rem] overflow-y-auto p-1.5" aria-live="polite">
            {!isAuthLoading && !isAuthenticated && (
              <div className="px-4 py-5 text-center"><p className="text-sm text-text-primary">Sign in to search LinkPort</p><p className="mt-1 text-xs text-text-muted">Member and company profiles are available to active users.</p><Link to="/login" className="mt-3 inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-contrast">Log in</Link></div>
            )}
            {isAuthenticated && !canSearch && <p className="px-3 py-5 text-center text-xs text-text-muted">Type at least 2 characters or apply a filter.</p>}
            {isAuthenticated && canSearch && isLoading && <p className="px-3 py-5 text-center text-xs text-text-muted">Searching...</p>}
            {isAuthenticated && canSearch && !isLoading && error && <p role="alert" className="px-3 py-5 text-center text-xs text-danger-text">{error}</p>}
            {isAuthenticated && canSearch && !isLoading && !error && noResults && <p className="px-3 py-5 text-center text-xs text-text-muted">No matching members or companies.</p>}
            {isAuthenticated && canSearch && !isLoading && !error && !noResults && (
              <div className="space-y-1"><ResultSection label="Members" items={results.members.data} kind="member" onSelect={() => setIsOpen(false)} /><ResultSection label="Companies" items={results.companies.data} kind="company" onSelect={() => setIsOpen(false)} /></div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  )
}
