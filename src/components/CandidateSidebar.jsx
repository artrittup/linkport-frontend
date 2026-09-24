import { Link, useLocation, useNavigate } from 'react-router'
import LinkPortLogo from './LinkPortLogo'
import { getNavigationForRole } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import CandidateCreateMenu from './CandidateCreateMenu'
import CandidateNotificationBell from './CandidateNotificationBell'
import GlobalSearch from './GlobalSearch'
import ThemeToggle from './ThemeToggle'

function NavigationIcon({ iconKey }) {
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5M9 21v-7h6v7" /></>,
    projects: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
    opportunities: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
    community: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13 15.5a5 5 0 0 1 8.5 3.5" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
      {paths[iconKey] ?? paths.profile}
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </svg>
  )
}

function isNavigationItemActive(item, pathname) {
  if (pathname === item.path) return true
  if (item.key === 'home') {
    return pathname === '/member/create/post'
  }
  if (item.key === 'projects') {
    return pathname.startsWith('/member/projects/')
      || pathname === '/member/create/project'
  }
  if (item.key === 'opportunities') {
    return pathname.startsWith('/member/opportunities/')
      || pathname === '/member/applications'
      || pathname === '/member/bids'
      || pathname === '/jobs'
      || pathname === '/projects'
  }
  if (item.key === 'community') {
    return pathname.startsWith('/member/community/')
      || pathname.startsWith('/circles')
      || pathname === '/member/create/team'
  }
  if (item.key === 'profile') return pathname === '/member/activity'
  return false
}

export default function CandidateSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const navItems = getNavigationForRole('candidate')
  const displayName = user?.name || 'LinkPort Member'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    await logout()
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-overlay/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Member sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/80 bg-background shadow-2xl shadow-black/20 transition-transform duration-200 lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-border/80 px-5">
          <Link to="/member/home" onClick={onClose} className="flex items-center gap-2.5 font-bold text-text-primary" aria-label="LinkPort Member Home">
            <LinkPortLogo className="h-8 w-auto" />
            <span className="text-xl">Link<span className="text-primary">Port</span></span>
          </Link>
          <div className="-mr-2 flex items-center gap-1">
            <div className="hidden lg:block">
              <ThemeToggle compact />
            </div>
            <CandidateNotificationBell placement="sidebar" className="hidden lg:block" />
            <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-text-muted hover:bg-surface hover:text-primary lg:hidden" aria-label="Close menu">
              &times;
            </button>
          </div>
        </div>

        <div className="border-b border-border/80 px-4 py-4">
          <GlobalSearch className="w-full min-w-0 max-w-full" dropdownAlign="left" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Member navigation">
          {navItems.map((item) => {
            const isActive = isNavigationItemActive(item, location.pathname)

            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                  isActive
                    ? 'border border-primary-soft-border bg-primary-soft text-primary-soft-text'
                    : 'text-text-muted hover:bg-surface hover:text-text-primary'
                }`}
              >
                <NavigationIcon iconKey={item.key} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border/80 px-4 py-4">
          <CandidateCreateMenu onActionComplete={onClose} />
        </div>

        <div className="border-t border-border/80 p-3">
          <Link
            to="/member/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label={`Open ${displayName}'s profile`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-surface font-mono text-xs font-semibold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-text-primary">{displayName}</p>
              <p className="text-xs text-text-muted">Member profile</p>
            </div>
          </Link>
          <div className="mt-2 px-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-danger/60 px-3 py-2 text-sm font-bold text-danger-text transition-colors hover:border-danger hover:bg-danger/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
