import { useEffect, useState } from 'react'
import linkPortLogo from '../assets/linkport-logo.svg'
import CompanySidebar from '../components/CompanySidebar'
import NotificationBell from '../components/NotificationBell'
import PostOpportunityMenu from '../components/PostOpportunityMenu'

export default function CompanyLayout({ children, title }) {
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
    <div className="min-h-screen min-w-0 bg-[#0a192f] text-[#e6f1ff]">
      <CompanySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="min-h-screen min-w-0 max-w-full lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#233554]/80 bg-[#0a192f]/95 px-4 backdrop-blur-lg lg:hidden">
          <button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" aria-expanded={isSidebarOpen} className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg text-[#64ffda] hover:bg-[#112240] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]">
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img src={linkPortLogo} alt="" className="h-7 w-auto" />
            <span className="truncate text-sm font-semibold text-[#e6f1ff]">{title}</span>
          </div>
          <NotificationBell />
          <PostOpportunityMenu compact />
        </header>

        <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <h1 className="sr-only">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  )
}
