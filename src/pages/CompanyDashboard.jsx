import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../api/dashboardApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import mockApplications from '../data/mockApplications'
import mockCandidates from '../data/mockCandidates'
import mockCompanyProjects from '../data/mockCompanyProjects'
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
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[status] ?? 'border-[#233554] text-[#8892b0]'}`}
    >
      {status}
    </span>
  )
}

function SkillBadges({ skills }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2.5 py-1 font-mono text-[10px] text-[#64ffda]"
        >
          {skill}
        </span>
      ))}
    </div>
  )
}

function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-[#8892b0]">{description}</p>
    </div>
  )
}

export default function CompanyDashboard() {
  const [summary, setSummary] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    getDashboardSummary()
      .then((response) => {
        if (isActive) setSummary(response ?? {})
      })
      .catch((requestError) => {
        if (isActive) {
          setError(
            requestError.response?.data?.message ||
              'Unable to load the company dashboard summary.',
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
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome, Company
          </h2>
          <p className="mt-3 max-w-2xl text-[#8892b0]">
            Manage your jobs, projects, applications, and candidate offers.
          </p>

          {isLoading ? (
            <LoadingSpinner label="Loading dashboard summary..." />
          ) : error ? (
            <div className="mt-8"><EmptyState title="Unable to load summary" description={error} /></div>
          ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={stat.label} hover>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#8892b0]">{stat.label}</p>
                    <p className="mt-3 text-3xl font-bold text-[#e6f1ff]">
                      {stat.value}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#64ffda]">
                    0{index + 1}
                  </span>
                </div>
              </Card>
            ))}
          </div>
          )}
        </section>

        <section>
          <SectionHeading
            title="Recent Applications"
            description="Review the latest candidates interested in your open roles."
          />
          <Card padding="sm" className="mt-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]">
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Skills</th>
                    <th className="px-4 py-3 font-medium">Applied</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-[#233554]/70 transition-colors last:border-0 hover:bg-[#172a45]/60"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-[#e6f1ff]">
                        {application.candidateName}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#8892b0]">
                        {application.jobTitle}
                      </td>
                      <td className="px-4 py-4">
                        <SkillBadges skills={application.skills} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-[#8892b0]">
                        {application.dateApplied}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeading
            title="Active Projects"
            description="Track active briefs and review the offers they receive."
          />
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {mockCompanyProjects.map((project) => (
              <Card key={project.id} hover className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold leading-snug text-[#e6f1ff]">
                    {project.title}
                  </h3>
                  <StatusBadge status={project.status} />
                </div>
                <div className="mt-5 space-y-3 border-y border-[#233554] py-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#64748b]">Budget</span>
                    <span className="text-right font-medium text-[#e6f1ff]">
                      {project.budget}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#64748b]">Deadline</span>
                    <span className="text-right text-[#facc15]">{project.deadline}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#64748b]">Bids</span>
                    <span className="text-[#8892b0]">{project.bids} offers</span>
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  <Button variant="outline" size="sm" className="w-full">
                    View Bids
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="Recommended Candidates"
            description="Profiles with skills that match your recent jobs and projects."
          />
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {mockCandidates.map((candidate) => (
              <Card key={candidate.id} hover className="flex h-full flex-col">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#64ffda]/30 bg-[#172a45] font-mono text-xs font-bold text-[#64ffda]">
                    {candidate.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-[#e6f1ff]">
                      {candidate.name}
                    </h3>
                    <p className="truncate text-xs text-[#8892b0]">{candidate.title}</p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-[#64748b]">{candidate.location}</p>
                <div className="mt-4">
                  <SkillBadges skills={candidate.skills} />
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8892b0]">Profile match</span>
                    <span className="font-mono text-[#22c55e]">
                      {candidate.matchPercentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0a192f]">
                    <div
                      className="h-full rounded-full bg-[#22c55e]"
                      style={{ width: `${candidate.matchPercentage}%` }}
                    />
                  </div>
                </div>

                <Button variant="outline" size="sm" className="mt-6 w-full">
                  View Profile
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
