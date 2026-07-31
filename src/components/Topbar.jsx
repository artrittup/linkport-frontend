import { useAuth } from '../context/AuthContext'
import GlobalSearch from './GlobalSearch'
import NotificationBell from './NotificationBell'

export default function Topbar({ title, userType, onMenuClick }) {
  const { user } = useAuth()
  const displayName = user?.name || userType || 'LinkPort User'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <header className="app-topbar sticky top-0 z-30">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md text-primary transition-colors hover:bg-surface-elevated lg:hidden"
          aria-label="Open navigation"
        >
          <span className="h-0.5 w-5 bg-current" />
          <span className="h-0.5 w-5 bg-current" />
          <span className="h-0.5 w-5 bg-current" />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-text-primary sm:text-xl">
          {title}
        </h1>

        <GlobalSearch className="w-10 transition-[width] duration-200 focus-within:w-52 sm:w-40 sm:focus-within:w-64" />
        <NotificationBell />

        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-surface-elevated font-mono text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{displayName}</p>
            <p className="text-xs text-text-muted">{userType}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
