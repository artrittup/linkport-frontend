import { Link, useSearchParams } from 'react-router'
import AdminOpportunityList from '../components/AdminOpportunityList'
import DashboardLayout from '../layouts/DashboardLayout'

const types = {
  jobs: {
    label: 'Jobs',
  },
  projects: {
    label: 'Projects',
  },
}

export default function AdminOpportunities() {
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('type')
  const selectedType = requestedType === 'projects' ? 'projects' : 'jobs'

  return (
    <DashboardLayout title="Opportunities" userType="Admin">
      <div className="min-w-0 space-y-8">
        <section>
          <p className="font-mono text-sm text-primary">Content operations</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Opportunities</h2>
          <p className="mt-3 max-w-2xl text-text-muted">Choose an opportunity type, then continue into its existing management workflow.</p>
        </section>

        <nav className="flex max-w-full gap-2 overflow-x-auto border-b border-border pb-2" aria-label="Opportunity type">
          {Object.entries(types).map(([key, item]) => (
            <Link
              key={key}
              to={`/admin/opportunities?type=${key}`}
              aria-current={selectedType === key ? 'page' : undefined}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                selectedType === key
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-surface hover:text-text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <AdminOpportunityList key={selectedType} type={selectedType} />
      </div>
    </DashboardLayout>
  )
}
