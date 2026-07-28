import { Link, useLocation, useNavigate } from 'react-router'
import linkPortLogo from '../assets/linkport-logo.svg'
import { getNavigationForRole } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import GlobalSearch from './GlobalSearch'
import NotificationBell from './NotificationBell'
import PostOpportunityMenu from './PostOpportunityMenu'

function Icon({ name }) {
  const paths = {
    overview: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></>,
    opportunities: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
    talent: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M17 11h5M19.5 8.5v5" /></>,
    applications: <><path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4" /></>,
    profile: <><path d="M4 21V3h16v18M8 7h2M14 7h2M8 11h2M14 11h2M9 21v-5h6v5" /></>,
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
      {paths[name] ?? paths.overview}
    </svg>
  )
}

function isActive(item, pathname) {
  if (item.key === 'overview') {
    return pathname === '/company/overview' || pathname === '/company/dashboard'
  }
  if (item.key === 'opportunities') {
    return pathname === '/company/opportunities'
      || pathname.startsWith('/company/jobs')
      || pathname.startsWith('/company/projects')
  }
  if (item.key === 'applications') {
    return pathname === '/company/applications' || pathname === '/company/bids'
  }
  if (item.key === 'talent') {
    return pathname.startsWith('/company/talent')
  }
  return pathname === item.path
}

export default function CompanySidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const items = getNavigationForRole('company')
  const companyName = user?.name || 'Company'
  const initials = companyName
    .split(/\s+/)
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
        <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-2rem)] flex-col border-r border-[#233554]/80 bg-[#071426] shadow-2xl shadow-black/30 transition-transform duration-200 lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[#233554]/80 px-5">
          <Link to="/company/overview" onClick={onClose} className="min-w-0" aria-label="LinkPort Company Overview">
            <span className="flex items-center gap-2.5 font-bold text-[#e6f1ff]">
              <img src={linkPortLogo} alt="" className="h-8 w-auto" />
              <span className="text-xl">Link<span className="text-[#64ffda]">Port</span></span>
            </span>
            <span className="mt-1 block pl-10 text-[10px] uppercase tracking-[0.16em] text-[#64748b]">Company Workspace</span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell align="left" />
            <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#8892b0] hover:bg-[#112240] hover:text-[#64ffda] lg:hidden" aria-label="Close menu">&times;</button>
          </div>
        </div>

        <div className="space-y-3 border-b border-[#233554]/80 px-4 py-4">
          <PostOpportunityMenu onNavigate={onClose} />
          <GlobalSearch className="w-full min-w-0 max-w-full" dropdownAlign="left" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Company Workspace navigation">
          {items.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              onClick={onClose}
              aria-current={isActive(item, location.pathname) ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] ${
                isActive(item, location.pathname)
                  ? 'bg-[#64ffda]/10 text-[#64ffda]'
                  : 'text-[#8892b0] hover:bg-[#112240] hover:text-[#e6f1ff]'
              }`}
            >
              <Icon name={item.key} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#233554]/80 p-3">
          <Link to="/" onClick={onClose} className="flex items-center justify-center rounded-lg border border-[#233554] px-3 py-2.5 text-sm font-medium text-[#a8b2d1] hover:border-[#64ffda]/45 hover:text-[#64ffda]">
            Explore LinkPort
          </Link>
          <div className="mt-3 flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#64ffda]/35 bg-[#112240] font-mono text-xs font-semibold text-[#64ffda]">{initials || 'CO'}</div>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#e6f1ff]">{companyName}</p>
          </div>
          <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-[#f87171] hover:bg-[#ef4444]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]">
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
