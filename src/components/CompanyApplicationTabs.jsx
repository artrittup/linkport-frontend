import { Link, useSearchParams } from 'react-router'

const tabs = [
  { label: 'Applications', path: '/company/applications?type=applications', value: 'applications' },
  { label: 'Proposals', path: '/company/applications?type=proposals', value: 'proposals' },
]

export default function CompanyApplicationTabs() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') === 'proposals' ? 'proposals' : 'applications'

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border" aria-label="Application pipeline">
      {tabs.map((tab) => {
        const active = type === tab.value
        return (
          <Link
            key={tab.path}
            to={tab.path}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
