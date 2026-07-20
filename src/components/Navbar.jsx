import Button from './Button'
import linkPortLogo from '../assets/linkport-logo.svg'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const {
    user,
    isLoading,
    isAuthenticated,
    logout,
    getDashboardPath,
  } = useAuth()
  const dashboardPath = getDashboardPath(user?.role)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#233554]/80 bg-[#0a192f]/95 backdrop-blur-lg">
      <nav
        className="flex h-22 w-full items-center justify-between px-4 sm:px-6 lg:px-7"
        aria-label="Main navigation"
      >
        <a
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#e6f1ff] transition-opacity duration-200 hover:opacity-80"
          aria-label="LinkPort home"
        >
          <img src={linkPortLogo} alt="LinkPort logo" className="h-9 w-auto" />
          <span>
            Link<span className="text-[#64ffda]">Port</span>
          </span>
        </a>

        {isLoading ? (
          <div className="h-9 w-32 animate-pulse rounded-lg bg-[#112240]" aria-label="Checking account" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden max-w-40 truncate text-sm text-[#8892b0] sm:block">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={() => window.location.assign(dashboardPath)}>
              Dashboard
            </Button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-2 py-2 text-xs font-semibold text-[#ef4444] transition-colors hover:bg-[#ef4444]/10 lg:hidden"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#8892b0] transition-colors duration-200 hover:text-[#e6f1ff]">
              Login
            </a>
            <Button variant="outline" size="sm" onClick={() => window.location.assign('/register')}>
              Sign Up
            </Button>
          </div>
        )}
      </nav>
    </header>
  )
}
