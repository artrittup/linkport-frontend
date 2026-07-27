import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import linkPortLogo from '../assets/linkport-logo.svg'
import GlobalSearch from '../components/GlobalSearch'
import NotificationBell from '../components/NotificationBell'
import { getNavigationForRole } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </svg>
  )
}

export default function CandidateLayout({ children, title }) {
  const location = useLocation()
  const navigate = useNavigate()
  const createMenuRef = useRef(null)
  const { logout } = useAuth()
  const { showToast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const navItems = getNavigationForRole('candidate')

  useEffect(() => {
    const closeMenu = (event) => {
      if (!createMenuRef.current?.contains(event.target)) setIsCreateOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsCreateOpen(false)
    }

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const isActive = (path) => (
    location.pathname === path
    || (path === '/candidate/projects' && location.pathname.startsWith('/candidate/projects/'))
    || (path === '/candidate/community' && location.pathname.startsWith('/circles'))
  )

  const handleCreateAction = (label) => {
    setIsCreateOpen(false)
    if (label === 'Share a project') {
      navigate('/candidate/projects?share=true')
      return
    }
    showToast(`${label} will be available in the next community update.`, 'info')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0a192f] text-[#e6f1ff]">
      <header className="sticky top-0 z-40 border-b border-[#233554]/80 bg-[#0a192f]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/candidate/home" className="flex shrink-0 items-center gap-2.5 font-bold text-[#e6f1ff]" aria-label="LinkPort home">
            <img src={linkPortLogo} alt="LinkPort logo" className="h-8 w-auto" />
            <span className="hidden text-xl sm:inline">Link<span className="text-[#64ffda]">Port</span></span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Candidate navigation">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#64ffda]/10 text-[#64ffda]'
                    : 'text-[#8892b0] hover:bg-[#112240] hover:text-[#e6f1ff]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <GlobalSearch className="hidden w-40 transition-[width] duration-200 focus-within:w-56 md:block xl:w-48 xl:focus-within:w-64" />

            <div ref={createMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsCreateOpen((open) => !open)}
                aria-expanded={isCreateOpen}
                aria-haspopup="menu"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-3 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1] sm:px-4"
              >
                + Create
              </button>

              {isCreateOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#233554] bg-[#112240] p-1.5 shadow-2xl shadow-black/40">
                  {['Share a project', 'Create a post', 'Find teammates'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      role="menuitem"
                      onClick={() => handleCreateAction(label)}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#e6f1ff] transition-colors hover:bg-[#172a45] hover:text-[#64ffda]"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <NotificationBell />
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#8892b0] transition-colors hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 lg:hidden" aria-label="Candidate navigation">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive(item.path) ? 'page' : undefined}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-[#64ffda]/10 text-[#64ffda]'
                  : 'text-[#8892b0] hover:bg-[#112240] hover:text-[#e6f1ff]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>
    </div>
  )
}
