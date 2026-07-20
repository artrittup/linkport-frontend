import { useEffect, useState } from 'react'
import { getCompanyApplications } from '../api/applicationsApi'
import { getCompanyBids } from '../api/bidsApi'
import { getDashboardSummary } from '../api/dashboardApi'
import { getCompanyProjects } from '../api/projectsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/company/dashboard' },
  { label: 'Company Profile', href: '/company/profile' },
  { label: 'Jobs', href: '/company/jobs' },
  { label: 'Applications', href: '/company/applications' },
  { label: 'Projects', href: '/company/projects' },
  { label: 'Bids', href: '/company/bids' },
  { label: 'Settings', href: '/settings' },
  { label: 'Logout', href: '/login' },
]

const statusClasses = {
  Pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  Accepted: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
  Rejected: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
  Open: 'border-[#64ffda]/30 bg-[#64ffda]/10 text-[#64ffda]',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[status] ?? 'border-[#233554] text-[#8892b0]'}`}>
      {status}
    </span>
  )
}

function SkillBadges({ skills = [] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.length > 0 ? skills.slice(0, 3).map((skill) => (
        <span key={skill} className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2.5 py-1 text-[10px] text-[#64ffda]">
          {skill}
        </span>
      )) : <span className="text-xs text-[#64748b]">No skills listed</span>}
    </div>
  )
}

function SectionHeading({ title, description, href, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-[#8892b0]">{description}</p>
      </div>
      {href && <a href={href} className="text-sm font-medium text-[#64ffda] hover:opacity-80">{action}</a>}
    </div>
  )
}

export default function CompanyDashboard() {
  const [summary, setSummary] = useState({})
  const [applications, setApplications] = useState([])
  const [projects, setProjects] = useState([])
  const [bids, setBids] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    Promise.all([
      getDashboardSummary(),
      getCompanyApplications({ per_page: 5 }),
      getCompanyProjects({ status: 'open', per_page: 4 }),
      getCompanyBids({ per_page: 4 }),
    ])
      .then(([summaryResponse, applicationResponse, projectResponse, bidResponse]) => {
        if (!isActive) return
        setSummary(summaryResponse ?? {})
        setApplications(applicationResponse.data)
        setProjects(projectResponse.data)
        setBids(bidResponse.data)
      })
      .catch((requestError) => {
        if (isActive) {
          setError(
            requestError.response?.data?.message ||
              'Unable to load the company dashboard.',
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const count = (key) => {
    const value = Number(summary[key])
    return Number.isFinite(value) ? value : 0
  }

  const stats = [
    { label: 'Jobs', value: count('jobs_count') },
    { label: 'Open Jobs', value: count('open_jobs_count') },
    { label: 'Applications', value: count('applications_count') },
    { label: 'Pending Applications', value: count('pending_applications_count') },
    { label: 'Projects', value: count('projects_count') },
    { label: 'Open Projects', value: count('open_projects_count') },
    { label: 'Project Bids', value: count('bids_count') },
    { label: 'Pending Bids', value: count('pending_bids_count') },
  ]

  return (
    <DashboardLayout title="Company Dashboard" navItems={navItems} userType="Company">
      <div className="space-y-10">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Company workspace</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Company Dashboard</h2>
          <p className="mt-3 max-w-2xl text-[#8892b0]">Manage your jobs, projects, applications, and candidate offers.</p>

          {isLoading ? (
            <LoadingSpinner label="Loading company dashboard..." />
          ) : error ? (
            <div className="mt-8"><EmptyState title="Unable to load dashboard" description={error} /></div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={stat.label} hover>
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-sm text-[#8892b0]">{stat.label}</p><p className="mt-3 text-3xl font-bold text-[#e6f1ff]">{stat.value}</p></div>
                    <span className="font-mono text-xs text-[#64ffda]">0{index + 1}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {!isLoading && !error && (
          <>
            <section>
              <SectionHeading title="Recent Applications" description="Latest candidates interested in your roles." href="/company/applications" action="View all applications" />
              {applications.length === 0 ? (
                <div className="mt-5"><EmptyState title="No applications yet" description="Applications to your jobs will appear here." /></div>
              ) : (
                <Card padding="sm" className="mt-5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead><tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]"><th className="p-4">Candidate</th><th className="p-4">Role</th><th className="p-4">Skills</th><th className="p-4">Applied</th><th className="p-4">Status</th></tr></thead>
                      <tbody>{applications.map((application) => (
                        <tr key={application.id} className="border-b border-[#233554]/70 last:border-0">
                          <td className="p-4 text-sm font-medium text-[#e6f1ff]">{application.candidateName}</td>
                          <td className="p-4 text-sm text-[#8892b0]">{application.jobTitle}</td>
                          <td className="p-4"><SkillBadges skills={application.skills} /></td>
                          <td className="p-4 text-xs text-[#8892b0]">{application.dateApplied}</td>
                          <td className="p-4"><StatusBadge status={application.status} /></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </Card>
              )}
            </section>

            <section>
              <SectionHeading title="Active Projects" description="Open briefs currently receiving candidate bids." href="/company/projects" action="Manage projects" />
              {projects.length === 0 ? (
                <div className="mt-5"><EmptyState title="No active projects" description="Publish a project to start receiving bids." /></div>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {projects.map((project) => (
                    <Card key={project.id} hover className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-[#e6f1ff]">{project.title}</h3><StatusBadge status={project.status} /></div>
                      <div className="mt-5 space-y-3 border-y border-[#233554] py-4 text-sm">
                        <p className="flex justify-between gap-3"><span className="text-[#64748b]">Budget</span><span>{project.budget}</span></p>
                        <p className="flex justify-between gap-3"><span className="text-[#64748b]">Deadline</span><span>{project.deadline || 'No deadline'}</span></p>
                        <p className="flex justify-between gap-3"><span className="text-[#64748b]">Bids</span><span>{project.bids}</span></p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-5 w-full" onClick={() => window.location.assign('/company/bids')}>View Bids</Button>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <SectionHeading title="Recent Project Bids" description="Latest proposals submitted to your projects." href="/company/bids" action="View all bids" />
              {bids.length === 0 ? (
                <div className="mt-5"><EmptyState title="No project bids yet" description="Candidate proposals will appear here." /></div>
              ) : (
                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {bids.map((bid) => (
                    <Card key={bid.id} hover>
                      <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-[#e6f1ff]">{bid.candidateName}</h3><StatusBadge status={bid.status} /></div>
                      <p className="mt-3 text-sm text-[#8892b0]">{bid.projectTitle}</p>
                      <div className="mt-4 border-t border-[#233554] pt-4 text-sm"><p className="text-[#64ffda]">{bid.offeredPrice}</p><p className="mt-2 text-xs text-[#8892b0]">{bid.deliveryDays ? `${bid.deliveryDays} days` : 'Delivery time not provided'}</p></div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
