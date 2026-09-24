import { Link, useLocation, useNavigate } from 'react-router'
import LinkPortLogo from './LinkPortLogo'
import { getNavigationForRole } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import CandidateCreateMenu from './CandidateCreateMenu'
import GlobalSearch from './GlobalSearch'
import ThemeToggle from './ThemeToggle'

function NavigationIcon({ iconKey }) {
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5M9 21v-7h6v7" /></>,
    opportunities: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
    community: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13 15.5a5 5 0 0 1 8.5 3.5" /></>,
    messages: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /><path d="M8 9h8M8 13h5" /></>,
    activity: <><path d="M3 12h4l2.5-7 5 14 2.5-7h4" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    notifications: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.3.3.5.7.6 1.1h1v4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
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
  if (item.key === 'activity') {
    return pathname.startsWith('/member/activity')
      || pathname.startsWith('/member/projects')
      || pathname === '/member/create/project'
      || pathname === '/member/create/post'
  }
  return false
}

function isChildActive(item, pathname) {
  if (pathname === item.path) return true
  if (item.path === '/member/community/discover') {
    return pathname === '/member/community'
      || pathname.startsWith('/member/community/discussions')
      || pathname.startsWith('/member/community/events')
      || pathname.startsWith('/member/community/team-requests')
  }
  if (item.path === '/member/community/circles') {
    return pathname.startsWith('/member/community/circles/') || pathname.startsWith('/circles')
  }
  if (item.path === '/member/community/members') return pathname.startsWith(`${item.path}/`)
  if (item.path === '/member/opportunities/jobs') return pathname.startsWith('/member/opportunities/job-')
  if (item.path === '/member/opportunities/projects') return pathname.startsWith('/member/opportunities/project-')
  return pathname.startsWith(`${item.path}/`)
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
            <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-text-muted hover:bg-surface hover:text-primary lg:hidden" aria-label="Close menu">
              &times;
            </button>
          </div>
        </div>

        <div className="border-b border-border/80 px-4 py-4">
          <GlobalSearch className="w-full min-w-0 max-w-full" dropdownAlign="left" />
        </div>

        <div className="border-b border-border/80 px-4 py-4">
          <CandidateCreateMenu onActionComplete={onClose} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary member navigation">
          {navItems.map((item) => {
            const isActive = isNavigationItemActive(item, location.pathname)

            return (
              <div key={item.key}>
                <Link
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
                  {item.children && (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={`ml-auto h-4 w-4 transition-transform ${isActive ? 'rotate-180' : ''}`} aria-hidden="true">
                      <path d="m6 8 4 4 4-4" />
                    </svg>
                  )}
                </Link>
                {item.children && isActive && (
                  <div className="ml-6 border-l border-border py-1 pl-3" aria-label={`${item.label} sections`}>
                    {item.children.map((child) => {
                      const childActive = isChildActive(child, location.pathname)
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          aria-current={childActive ? 'page' : undefined}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${childActive ? 'bg-primary-soft text-primary-soft-text' : 'text-text-muted hover:bg-surface hover:text-text-primary'}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${childActive ? 'bg-primary' : 'bg-border-strong'}`} />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="border-t border-border/80 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-surface font-mono text-xs font-semibold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-text-primary">{displayName}</p>
              <p className="text-xs text-text-muted">Member account</p>
            </div>
          </div>
          <nav className="mt-2 space-y-1" aria-label="Member account navigation">
            {[
              { key: 'notifications', label: 'Notifications', path: '/member/notifications' },
              { key: 'settings', label: 'Settings', path: '/member/settings' },
            ].map((item) => (
              <Link key={item.key} to={item.path} onClick={onClose} aria-current={location.pathname === item.path ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${location.pathname === item.path ? 'bg-primary-soft text-primary-soft-text' : 'text-text-muted hover:bg-surface hover:text-text-primary'}`}>
                <NavigationIcon iconKey={item.key} />
                {item.label}
              </Link>
            ))}
            <ThemeToggle showLabel className="w-full justify-start px-3 text-sm" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-danger-text transition-colors hover:bg-danger/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              <LogoutIcon />
              Logout
            </button>
          </nav>
        </div>
      </aside>
    </>
  )
}
