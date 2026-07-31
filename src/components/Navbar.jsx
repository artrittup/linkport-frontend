import { Link, useNavigate } from 'react-router'
import Button from './Button'
import LinkPortLogo from './LinkPortLogo'
import { useAuth } from '../context/AuthContext'
import GlobalSearch from './GlobalSearch'
import NotificationBell from './NotificationBell'
import CandidateNotificationBell from './CandidateNotificationBell'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const navigate = useNavigate()
  const {
    user,
    isLoading,
    isAuthenticated,
    logout,
    getDashboardPath,
  } = useAuth()
  const dashboardPath = getDashboardPath(user?.role)

  return (
    <header className="app-topbar fixed inset-x-0 top-0 z-50">
      <nav
        className="flex min-h-20 w-full flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-7"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-tight text-text-primary transition-opacity duration-200 hover:opacity-80 sm:text-xl"
          aria-label="LinkPort home"
        >
          <LinkPortLogo className="h-8 w-auto sm:h-9" />
          <span className="hidden sm:inline">
            Link<span className="text-primary">Port</span>
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-nowrap sm:gap-4">
          <GlobalSearch className="order-3 w-full min-w-0 sm:order-none sm:w-48 lg:w-56" />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {isLoading ? (
            <div className="hidden h-9 w-32 animate-pulse rounded-lg bg-surface sm:block" aria-label="Checking account" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {user?.role === 'candidate'
                ? <CandidateNotificationBell placement="mobile" />
                : <NotificationBell />}
              <span className="hidden max-w-40 truncate text-sm text-text-muted sm:block">
                {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate(dashboardPath)}>
                <span className="sm:hidden">Open</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-lg px-2 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/10 sm:block lg:hidden"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-4">
              <Link to="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-text-muted transition-colors duration-200 hover:text-text-primary sm:inline-flex">
                Login
              </Link>
              <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">Sign Up</span>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
