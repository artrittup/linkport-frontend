import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import api from '../api/axios'
import AccountMenu from './AccountMenu'
import CandidateNotificationBell from './CandidateNotificationBell'
import ChatMenu from './ChatMenu'
import NotificationBell from './NotificationBell'
import LinkPortLogo from './LinkPortLogo'
import NetworkGlobe from './NetworkGlobe'
import { useAuth } from '../context/AuthContext'

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
      className="h-[22px] w-[22px] shrink-0"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const BUILD_LABEL = 'Build #1'

/**
 * The public header, reused inside the signed-in area so the platform looks
 * the same before and after logging in. The account menu sits top right.
 */
export default function AppHeader({ homePath = '/' }) {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const headerRef = useRef(null)

  // Publish the real height so fixed sidebars can start right below it.
  useEffect(() => {
    const node = headerRef.current
    if (!node) return undefined

    const publish = () => {
      document.documentElement.style.setProperty(
        '--lp-header-h',
        `${Math.round(node.getBoundingClientRect().height)}px`,
      )
    }

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let active = true

    api.get('/stats')
      .then((response) => { if (active) setStats(response.data) })
      .catch(() => { if (active) setStats(null) })

    return () => { active = false }
  }, [])

  const value = (key) => (stats?.[key] ?? '—')

  return (
    <header ref={headerRef} className="sticky top-0 z-40">
      <div className="lp-titlebar mx-auto flex w-full max-w-[100rem] items-center gap-5 px-4 py-2 sm:px-6">
        <Link
          to={homePath}
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-text-primary no-underline hover:text-primary sm:text-xl"
          aria-label="LinkPort home"
        >
          <LinkPortLogo className="h-8 w-auto" />
          <span>
            Link<span className="text-primary">Port</span>
          </span>
        </Link>

        <NetworkGlobe className="hidden min-w-0 flex-1 lg:block" />

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          {user?.role === 'candidate' && <ChatMenu />}
          {user?.role === 'candidate' ? <CandidateNotificationBell /> : <NotificationBell />}
          <AccountMenu />
        </div>
      </div>

      <div className="lp-statstrip">
        <div className="mx-auto flex w-full max-w-[100rem] items-center justify-between gap-4 px-4 py-0.5 text-[15px] sm:px-6">
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
    </header>
  )
}
