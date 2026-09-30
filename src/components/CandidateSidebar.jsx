import { Link, useLocation } from 'react-router'
import SidebarCircles from './SidebarCircles'
import { getNavigationForRole } from '../config/navigation'

/**
 * Solid glyphs filled with the brand gradient. Filled shapes plus a soft
 * shadow read as dimensional, where outlines stay flat.
 */
function NavigationIcon({ iconKey }) {
  const paths = {
    home: <path d="M11.3 2.6a1 1 0 0 1 1.4 0l8 7.2a1 1 0 0 1 .3.8V20a1.5 1.5 0 0 1-1.5 1.5H15V15H9v6.5H4.5A1.5 1.5 0 0 1 3 20v-9.4a1 1 0 0 1 .3-.8Z" />,
    community: <><circle cx="8.5" cy="8" r="3.4" /><circle cx="17" cy="9.2" r="2.7" /><path d="M2.4 20.2a6.1 6.1 0 0 1 12.2 0 .8.8 0 0 1-.8.8H3.2a.8.8 0 0 1-.8-.8ZM15.8 14.4a5.6 5.6 0 0 1 5.8 5 .8.8 0 0 1-.8.9h-3.6a7.7 7.7 0 0 0-1.4-5.9Z" /></>,
    opportunities: <><path d="M9 4.6A2.6 2.6 0 0 1 11.6 2h.8A2.6 2.6 0 0 1 15 4.6V6h-2V4.6a.6.6 0 0 0-.6-.6h-.8a.6.6 0 0 0-.6.6V6H9Z" /><path d="M2.6 8.6A2 2 0 0 1 4.6 7h14.8a2 2 0 0 1 2 1.6l.3 2.3-9.7 2.7a2 2 0 0 1-1 0L1.3 10.9Z" /><path d="m1.6 12.9 8.9 2.5a4 4 0 0 0 3 0l8.9-2.5V19a2 2 0 0 1-2 2H3.6a2 2 0 0 1-2-2Z" /></>,
    messages: <path d="M12 3c5 0 9 3.4 9 7.8s-4 7.8-9 7.8a11 11 0 0 1-2.6-.3L5 21l1-3.6A7.7 7.7 0 0 1 3 10.8C3 6.4 7 3 12 3Z" />,
    friends: <><circle cx="9" cy="7.8" r="3.5" /><circle cx="17.2" cy="9" r="2.6" /><path d="M2.6 20.3a6.4 6.4 0 0 1 12.8 0 .7.7 0 0 1-.7.7H3.3a.7.7 0 0 1-.7-.7ZM16.2 14.2a5.4 5.4 0 0 1 5.4 4.9.7.7 0 0 1-.7.8h-3.3a8 8 0 0 0-1.4-5.7Z" /></>,
    activity: <path d="M3 11h3.2l2.1-5.9a1 1 0 0 1 1.9.05l4 11.3 2-5.1a1 1 0 0 1 .93-.63H21v2h-3.2l-2.6 6.6a1 1 0 0 1-1.87-.03L9.3 8.1l-1.4 4a1 1 0 0 1-.94.67H3Z" />,
    profile: <><circle cx="12" cy="7.6" r="4.2" /><path d="M3.6 20.6a8.4 8.4 0 0 1 16.8 0 .9.9 0 0 1-.9.9H4.5a.9.9 0 0 1-.9-.9Z" /></>,
    notifications: <><path d="M12 2.2a6.6 6.6 0 0 1 6.6 6.6c0 4.4 1 5.4 2 6.6a1 1 0 0 1-.8 1.6H4.2a1 1 0 0 1-.8-1.6c1-1.2 2-2.2 2-6.6A6.6 6.6 0 0 1 12 2.2Z" /><path d="M9.4 18.6h5.2a2.6 2.6 0 0 1-5.2 0Z" /></>,
    settings: <path d="M13.9 2.4a1 1 0 0 1 .9.7l.5 1.7 1.7-.6a1 1 0 0 1 1.1.3l1.4 1.7a1 1 0 0 1 .1 1.1l-.9 1.6 1.4 1.1a1 1 0 0 1 .4 1l-.4 2.1a1 1 0 0 1-.8.8l-1.8.3.1 1.8a1 1 0 0 1-.6 1l-2 .8a1 1 0 0 1-1.1-.3l-1.2-1.4-1.5 1a1 1 0 0 1-1.1 0l-1.8-1.1a1 1 0 0 1-.5-1l.2-1.8-1.8-.4a1 1 0 0 1-.7-.8l-.3-2.1a1 1 0 0 1 .5-1l1.5-1-.8-1.6a1 1 0 0 1 .2-1.1l1.5-1.6a1 1 0 0 1 1.1-.2l1.6.7.6-1.7a1 1 0 0 1 .9-.7ZM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" />,
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 drop-shadow-sm"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lp-nav-grad" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#8b93ff" />
          <stop offset="55%" stopColor="#5b5bf0" />
          <stop offset="100%" stopColor="#3b31c9" />
        </linearGradient>
      </defs>
      <g fill="url(#lp-nav-grad)">
        {paths[iconKey] ?? paths.profile}
      </g>
    </svg>
  )
}

function isNavigationItemActive(item, pathname, search = '') {
  // Messages and Friends share a path and differ only by ?view=connections.
  if (item.key === 'friends' || item.key === 'messages') {
    if (pathname !== '/member/messages') return false
    const onConnections = new URLSearchParams(search).get('view') === 'connections'
    return item.key === 'friends' ? onConnections : !onConnections
  }

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
  if (item.key === 'profile') return pathname.startsWith('/member/profile/')
  return false
}

export default function CandidateSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navItems = getNavigationForRole('candidate')

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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/80 bg-background shadow-2xl shadow-black/20 transition-transform duration-200 lg:top-[calc(var(--lp-header-h,5rem)+1.75rem)] lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex shrink-0 justify-end px-3 pt-3 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-text-muted hover:bg-surface hover:text-primary"
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 px-3 pb-3" aria-label="Primary member navigation">
          {navItems.map((item) => {
            const isActive = isNavigationItemActive(item, location.pathname, location.search)

            return (
              <div key={item.key}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isActive
                      ? 'border border-primary-soft-border bg-primary-soft text-primary-soft-text'
                      : 'text-text-muted hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  <NavigationIcon iconKey={item.key} />
                  <span>{item.label}</span>
                </Link>
              </div>
            )
          })}
        </nav>

        <SidebarCircles onNavigate={onClose} />
        </div>

      </aside>
    </>
  )
}
