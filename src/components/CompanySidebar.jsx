import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import LinkPortLogo from './LinkPortLogo'
import { getNavigationForRole } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import GlobalSearch from './GlobalSearch'
import NotificationBell from './NotificationBell'
import PostOpportunityMenu from './PostOpportunityMenu'
import CompanyBrandMark from './CompanyBrandMark'
import { COMPANY_PROFILE_UPDATED_EVENT } from '../utils/companyProfile'
import ThemeToggle from './ThemeToggle'

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
  const [brand, setBrand] = useState(() => ({
    companyName: user?.company_profile?.company_name || user?.name || 'Company',
    logoUrl: user?.company_profile?.logo_url || '',
  }))
  const companyName = brand.companyName

  useEffect(() => {
    const updateBrand = (event) => setBrand({
      companyName: event.detail?.companyName || user?.name || 'Company',
      logoUrl: event.detail?.logoUrl || '',
    })
    window.addEventListener(COMPANY_PROFILE_UPDATED_EVENT, updateBrand)
    return () => window.removeEventListener(COMPANY_PROFILE_UPDATED_EVENT, updateBrand)
  }, [user?.name])

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
          <Link to="/company/overview" onClick={onClose} className="min-w-0" aria-label="LinkPort Company Overview">
            <span className="flex items-center gap-2.5 font-bold text-text-primary">
              <LinkPortLogo className="h-8 w-auto" />
              <span className="text-xl">Link<span className="text-primary">Port</span></span>
            </span>
            <span className="mt-1 block pl-10 text-[10px] uppercase tracking-[0.16em] text-text-subtle">Company Workspace</span>
          </Link>
          <div className="flex items-center gap-1">
            <div className="hidden lg:block">
              <ThemeToggle compact />
            </div>
            <NotificationBell align="left" />
            <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-text-muted hover:bg-surface hover:text-primary lg:hidden" aria-label="Close menu">&times;</button>
          </div>
        </div>

        <div className="space-y-3 border-b border-border/80 px-4 py-4">
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
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                isActive(item, location.pathname)
                  ? 'border border-primary-soft-border bg-primary-soft text-primary-soft-text'
                  : 'text-text-muted hover:bg-surface hover:text-text-primary'
              }`}
            >
              <Icon name={item.key} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-border/80 p-3">
          <Link to="/" onClick={onClose} className="flex items-center justify-center rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-text-secondary hover:border-primary/45 hover:text-primary">
            Explore LinkPort
          </Link>
          <div className="mt-3 flex items-center gap-3 rounded-xl px-2 py-2">
            <CompanyBrandMark name={companyName} logoUrl={brand.logoUrl} size="sm" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{companyName}</p>
          </div>
          <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-danger-soft hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger">
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
