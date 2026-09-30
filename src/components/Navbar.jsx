import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import api from '../api/axios'
import LinkPortLogo from './LinkPortLogo'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import CandidateNotificationBell from './CandidateNotificationBell'

const barLink =
  'px-2 py-1 text-sm font-medium text-text-secondary no-underline transition-colors hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring'

const BUILD_LABEL = 'Build #1'

function StripIcon({ name }) {
  const paths = {
    release: <><path d="M12 16V4M8 8l4-4 4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 5.6a3.2 3.2 0 0 1 0 6.3M17.5 19a5.4 5.4 0 0 0-2-4.2" /></>,
    communities: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3.4 9h17.2M3.4 15h17.2" /></>,
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function StatsStrip() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let active = true

    api.get('/stats')
      .then((response) => { if (active) setStats(response.data) })
      .catch(() => { if (active) setStats(null) })

    return () => { active = false }
  }, [])

  const value = (key) => (stats?.[key] ?? '—')

  return (
    <div className="lp-statstrip">
      <div className="mx-auto flex w-full max-w-[100rem] items-center justify-between gap-3 px-4 py-0.5 text-xs sm:gap-4 sm:px-6 sm:text-sm">
        <span className="flex items-center gap-1.5">
          <StripIcon name="release" />
          Release: <span className="font-bold">{BUILD_LABEL}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <StripIcon name="users" />
          Members Online: <span className="font-bold">{value('members_online')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <StripIcon name="communities" />
          Communities: <span className="font-bold">{value('communities')}</span>
        </span>
      </div>
    </div>
  )
}

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
    <header>
      <div className="lp-titlebar mx-auto flex w-full max-w-[100rem] items-center gap-5 px-4 py-2 sm:px-6">
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

        <div className="ml-auto flex shrink-0 items-center gap-1">
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
              <Link
                to="/register"
                className="ml-2 rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <StatsStrip />
    </header>
  )
}
