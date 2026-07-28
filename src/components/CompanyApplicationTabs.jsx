import { Link, useLocation } from 'react-router'

const tabs = [
  { label: 'Applications', path: '/company/applications' },
  { label: 'Proposals', path: '/company/bids' },
]

export default function CompanyApplicationTabs() {
  const { pathname } = useLocation()

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-[#233554]" aria-label="Application pipeline">
      {tabs.map((tab) => {
        const active = pathname === tab.path
        return (
          <Link
            key={tab.path}
            to={tab.path}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              active
                ? 'border-[#64ffda] text-[#64ffda]'
                : 'border-transparent text-[#8892b0] hover:text-[#e6f1ff]'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
