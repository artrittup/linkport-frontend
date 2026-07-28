import { Link, useSearchParams } from 'react-router'
import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

const types = {
  jobs: {
    label: 'Jobs',
    title: 'Job management',
    description: 'Review Job details, search existing records, and remove unsupported or invalid posts through the existing Admin flow.',
    path: '/admin/jobs',
    action: 'Open Jobs',
  },
  projects: {
    label: 'Projects',
    title: 'Company Project management',
    description: 'Review Company bidding Projects without mixing them with Candidate Community Projects.',
    path: '/admin/projects',
    action: 'Open Projects',
  },
}

export default function AdminOpportunities() {
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('type')
  const selectedType = requestedType === 'projects' ? 'projects' : 'jobs'
  const selected = types[selectedType]

  return (
    <DashboardLayout title="Opportunities" userType="Admin">
      <div className="min-w-0 space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Content operations</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Opportunities</h2>
          <p className="mt-3 max-w-2xl text-[#8892b0]">Choose an opportunity type, then continue into its existing management workflow.</p>
        </section>

        <nav className="flex max-w-full gap-2 overflow-x-auto border-b border-[#233554] pb-2" aria-label="Opportunity type">
          {Object.entries(types).map(([key, item]) => (
            <Link
              key={key}
              to={`/admin/opportunities?type=${key}`}
              aria-current={selectedType === key ? 'page' : undefined}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] ${
                selectedType === key
                  ? 'bg-[#64ffda]/10 text-[#64ffda]'
                  : 'text-[#8892b0] hover:bg-[#112240] hover:text-[#e6f1ff]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Card className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#64748b]">{selected.label}</p>
          <h3 className="mt-3 text-xl font-semibold">{selected.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8892b0]">{selected.description}</p>
          <Link to={selected.path} className="mt-6 inline-flex rounded-lg border border-[#64ffda] bg-[#64ffda] px-5 py-2.5 text-sm font-semibold text-[#0a192f] hover:bg-[#7dffe1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a192f]">
            {selected.action}
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  )
}
