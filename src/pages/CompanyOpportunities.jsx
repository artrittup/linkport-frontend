import { Link } from 'react-router'
import Card from '../components/Card'
import PostOpportunityMenu from '../components/PostOpportunityMenu'
import CompanyLayout from '../layouts/CompanyLayout'

const groups = [
  { title: 'Jobs', description: 'Publish roles and manage your hiring opportunities.', path: '/company/jobs', action: 'Manage jobs' },
  { title: 'Company projects', description: 'Publish scoped briefs and receive member proposals.', path: '/company/projects', action: 'Manage projects' },
  { title: 'Internships', description: 'Dedicated internship publishing is coming later.' },
  { title: 'Challenges', description: 'Company challenge creation is coming later.' },
]

export default function CompanyOpportunities() {
  return (
    <CompanyLayout title="Opportunities">
      <div className="space-y-8">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="font-mono text-sm text-[#64ffda]">Publishing</p><h2 className="mt-2 text-3xl font-bold">Opportunities</h2><p className="mt-2 text-[#8892b0]">Create and manage the ways members can work with your company.</p></div>
          <div className="w-full sm:w-auto sm:min-w-48"><PostOpportunityMenu /></div>
        </section>
        <section className="grid gap-5 sm:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.title} hover={Boolean(group.path)} className="flex min-h-44 flex-col">
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#8892b0]">{group.description}</p>
              {group.path ? <Link to={group.path} className="mt-5 text-sm font-semibold text-[#64ffda]">{group.action} →</Link> : <span className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#64748b]">Coming later</span>}
            </Card>
          ))}
        </section>
      </div>
    </CompanyLayout>
  )
}
