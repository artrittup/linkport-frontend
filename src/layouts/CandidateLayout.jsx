import { useEffect, useState } from 'react'
import LinkPortLogo from '../components/LinkPortLogo'
import CandidateNotificationBell from '../components/CandidateNotificationBell'
import CandidateSidebar from '../components/CandidateSidebar'
import ThemeToggle from '../components/ThemeToggle'

export default function CandidateLayout({ children, title }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isSidebarOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isSidebarOpen])

  return (
    <div className="min-h-screen min-w-0 bg-background text-text-primary">
      <CandidateSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="min-h-screen min-w-0 max-w-full lg:pl-64">
        <header className="app-topbar sticky top-0 z-30 flex h-16 items-center gap-3 px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isSidebarOpen}
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg text-primary transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <LinkPortLogo className="h-7 w-auto" />
            <span className="truncate text-sm font-semibold text-text-primary">{title}</span>
          </div>
          <div className="-mr-1 flex items-center gap-1">
            <ThemeToggle />
            <CandidateNotificationBell placement="mobile" />
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <h1 className="sr-only">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  )
}
