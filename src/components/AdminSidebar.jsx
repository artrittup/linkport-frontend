import { Link, useLocation, useNavigate } from 'react-router'
import LinkPortLogo from './LinkPortLogo'
import { getNavigationForRole } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

function AdminIcon({ name }) {
  const paths = {
    overview: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 4.5a4 4 0 0 1 0 7M18 14a6 6 0 0 1 4 5.5" /></>,
    opportunities: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
    community: <><circle cx="12" cy="12" r="3" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="m7 7.5 2.5 2.5m5 0L17 7.5m-7.5 6.5L7 16.5m7.5-2.5 2.5 2.5" /></>,
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
      {paths[name] ?? paths.overview}
    </svg>
  )
}

function isActive(item, pathname) {
  if (item.key === 'overview') {
    return pathname === '/admin/overview' || pathname === '/admin/dashboard'
  }
  if (item.key === 'opportunities') {
    return pathname === '/admin/opportunities'
      || pathname === '/admin/jobs'
      || pathname === '/admin/projects'
  }
  return pathname === item.path
}

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const items = getNavigationForRole('admin')
  const adminName = user?.name || 'Admin'
  const initial = adminName.trim().charAt(0).toUpperCase() || 'A'

  const handleLogout = async () => {
    await logout()
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {isOpen && (
        <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-overlay/60 backdrop-blur-sm lg:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-2rem)] flex-col border-r border-border/80 bg-background shadow-2xl shadow-black/30 transition-transform duration-200 lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-border/80 px-5">
          <Link to="/admin/overview" onClick={onClose} className="min-w-0" aria-label="LinkPort Admin Overview">
            <span className="flex items-center gap-2.5 font-bold text-text-primary">
              <LinkPortLogo className="h-8 w-auto" />
              <span className="text-xl">Link<span className="text-primary">Port</span></span>
            </span>
            <span className="mt-1 block pl-10 text-[10px] uppercase tracking-[0.16em] text-text-subtle">Admin Workspace</span>
          </Link>
          <div className="hidden lg:block">
            <ThemeToggle compact />
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-text-muted hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring lg:hidden" aria-label="Close menu">&times;</button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin Workspace navigation">
          {items.map((item) => {
            const active = isActive(item, location.pathname)
            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                  active
                    ? 'border border-primary-soft-border bg-primary-soft text-primary-soft-text'
                    : 'text-text-muted hover:bg-surface hover:text-text-primary'
                }`}
              >
                <AdminIcon name={item.key} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border/80 p-3">
          <div className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-surface font-mono text-sm font-semibold text-primary">{initial}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{adminName}</p>
              <p className="text-xs text-text-muted">Administrator</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-danger-soft hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger">
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
