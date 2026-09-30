import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import DefaultAvatar from './DefaultAvatar'
import VerifiedBadge from './VerifiedBadge'
import { useAuth } from '../context/AuthContext'

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-text-muted"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

const itemClass =
  'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text-secondary no-underline transition-colors hover:bg-surface-muted hover:text-text-primary'

/** Avatar button that opens the account menu, top right of the member area. */
export default function AccountMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  const isCompany = user?.role === 'company'
  const displayName = user?.name || 'Your account'

  useEffect(() => {
    if (!open) return undefined

    const close = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const signOut = async () => {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const profilePath = isCompany ? '/company/profile' : '/member/profile'
  const settingsPath = isCompany ? '/company/profile' : '/member/settings'

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
        className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <DefaultAvatar kind={isCompany ? 'company' : 'person'} className="h-9 w-9" />
        <Chevron />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <DefaultAvatar kind={isCompany ? 'company' : 'person'} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-sm font-bold text-text-primary">
                {displayName}
                {user?.is_verified && <VerifiedBadge className="h-4 w-4" />}
              </p>
              {user?.username && (
                <p className="truncate text-xs text-text-muted">#{user.username}</p>
              )}
            </div>
          </div>

          <Link to={profilePath} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            My Profile
          </Link>
          <Link to={settingsPath} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            Settings
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className={`${itemClass} border-t border-border text-danger hover:text-danger`}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
