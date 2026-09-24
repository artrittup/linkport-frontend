import { Link, useNavigate } from 'react-router'
import LinkPortLogo from './LinkPortLogo'
import { useAuth } from '../context/AuthContext'
import NetworkGlobe from './NetworkGlobe'
import NotificationBell from './NotificationBell'
import CandidateNotificationBell from './CandidateNotificationBell'

const barLink =
  'px-2 py-1 text-sm text-text-secondary underline-offset-2 transition-colors hover:text-primary hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring'

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
    <header className="lp-titlebar">
      <div className="mx-auto flex w-full max-w-[100rem] items-center gap-5 px-4 py-2 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-text-primary hover:text-primary sm:text-xl"
          aria-label="LinkPort home"
        >
          <LinkPortLogo className="h-8 w-auto" />
          <span>
            Link<span className="text-primary">Port</span>
          </span>
        </Link>

        <NetworkGlobe className="hidden min-w-0 flex-1 lg:block" />

        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
          {isLoading ? (
            <span className="px-2 text-xs text-text-subtle">...</span>
          ) : isAuthenticated ? (
            <>
              {user?.role === 'candidate'
                ? <CandidateNotificationBell placement="mobile" />
                : <NotificationBell />}
              <span className="hidden max-w-40 truncate px-2 text-sm text-text-muted sm:inline">
                {user?.name}
              </span>
              <button type="button" onClick={() => navigate(dashboardPath)} className={barLink}>
                Dashboard
              </button>
              <span aria-hidden="true" className="text-border-strong">|</span>
              <button type="button" onClick={logout} className={`${barLink} hover:text-danger`}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={barLink}>Log in</Link>
              <span aria-hidden="true" className="text-border-strong">|</span>
              <Link to="/register" className={barLink}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
