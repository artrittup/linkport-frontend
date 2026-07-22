import { Link, useLocation, useNavigate } from 'react-router'
import linkPortLogo from '../assets/linkport-logo.svg'
import { useAuth } from '../context/AuthContext'

function SidebarIcon({ label }) {
  const key = label.toLowerCase()
  let content

  if (key.includes('dashboard')) {
    content = <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5M9 21v-7h6v7" /></>
  } else if (key.includes('profile')) {
    content = <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>
  } else if (key.includes('application')) {
    content = <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>
  } else if (key.includes('job')) {
    content = <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>
  } else if (key.includes('project')) {
    content = <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>
  } else if (key.includes('circle')) {
    content = <><circle cx="12" cy="12" r="3" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="m7 7.5 2.5 2.5m5 0L17 7.5m-7.5 6.5L7 16.5m7.5-2.5 2.5 2.5" /></>
  } else if (key.includes('bid')) {
    content = <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>
  } else if (key.includes('compan')) {
    content = <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M9 21v-5h6v5" /></>
  } else if (key.includes('report')) {
    content = <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>
  } else if (key.includes('setting')) {
    content = <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3h4v.09A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.92 10H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>
  } else {
    content = <><circle cx="9" cy="7" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 4.5a4 4 0 0 1 0 5M18 14a6 6 0 0 1 4 5.65" /></>
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
      {content}
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </svg>
  )
}

export default function Sidebar({ navItems = [], isOpen = false, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const currentPath = location.pathname
  const hasCircles = navItems.some((item) => item.href === '/circles')
  const hasConnections = navItems.some((item) => item.href === '/connections')
  const visibleItems = navItems.filter((item) => !(
    ['candidate', 'company'].includes(user?.role)
    && item.label.toLowerCase() === 'settings'
  ))
  const firstUtilityIndex = visibleItems.findIndex((item) =>
    ['settings', 'logout'].includes(item.label.toLowerCase()),
  )
  const utilityIndex = firstUtilityIndex === -1 ? visibleItems.length : firstUtilityIndex
  const candidateItems = user?.role === 'candidate' && !hasConnections
    ? [...visibleItems.slice(0, utilityIndex), { label: 'My Network', href: '/connections' }, ...visibleItems.slice(utilityIndex)]
    : visibleItems
  const nextUtilityIndex = candidateItems.findIndex((item) => ['settings', 'logout'].includes(item.label.toLowerCase()))
  const circlesIndex = nextUtilityIndex === -1 ? candidateItems.length : nextUtilityIndex
  const navigationItems = user?.role === 'candidate' && !hasCircles
    ? [...candidateItems.slice(0, circlesIndex), { label: 'Circles', href: '/circles' }, ...candidateItems.slice(circlesIndex)]
    : candidateItems
  const mainItems = navigationItems.filter((item) => item.label.toLowerCase() !== 'logout')
  const logoutItem = navigationItems.find((item) => item.label.toLowerCase() === 'logout')

  const handleLogout = async () => {
    await logout()
    onClose?.()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {isOpen && (
        <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#233554]/80 bg-[#071426]/95 shadow-2xl shadow-black/20 backdrop-blur-lg transition-transform duration-300 lg:w-20 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[#233554]/80 px-5 lg:justify-center lg:px-2">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-[#e6f1ff]" aria-label="LinkPort home">
            <img src={linkPortLogo} alt="LinkPort logo" className="h-8 w-auto" />
            <span className="text-xl lg:hidden">Link<span className="text-[#64ffda]">Port</span></span>
          </Link>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#8892b0] hover:bg-[#112240] hover:text-[#64ffda] lg:hidden" aria-label="Close menu">
            &times;
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 lg:px-2" aria-label="Dashboard navigation">
          {mainItems.map((item) => {
            const isActive = currentPath === item.href
              || (item.href === '/circles' && currentPath.startsWith('/circles/'))

            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 lg:flex-col lg:gap-1.5 lg:px-1 lg:text-center lg:text-[10px] ${
                  isActive
                    ? 'bg-[#64ffda]/10 text-[#64ffda]'
                    : 'text-[#64748b] hover:bg-[#112240] hover:text-[#e6f1ff]'
                }`}
              >
                <SidebarIcon label={item.label} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {logoutItem && (
          <div className="border-t border-[#233554]/80 p-3 lg:p-2">
            <button type="button" onClick={handleLogout} title={logoutItem.label} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#ef4444] transition-colors hover:bg-[#ef4444]/10 lg:flex-col lg:gap-1.5 lg:px-1 lg:text-[10px]">
              <LogoutIcon />
              {logoutItem.label}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
