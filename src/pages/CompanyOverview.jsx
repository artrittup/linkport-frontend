import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getDashboardSummary } from '../api/dashboardApi'
import { getCompanyJobs } from '../api/jobsApi'
import { getCompanyProfile } from '../api/profileApi'
import { getCompanyProjects } from '../api/projectsApi'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import PostOpportunityMenu from '../components/PostOpportunityMenu'
import CompanyLayout from '../layouts/CompanyLayout'

const initialSource = { data: null, loading: true, error: false }

function SectionError({ children }) {
  return <p role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">{children}</p>
}

function StatCard({ label, value, href, loading, unavailable }) {
  return (
    <Link to={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]">
      <Card hover className="h-full">
        <p className="text-sm text-[#8892b0]">{label}</p>
        {loading ? <div className="mt-4 h-9 w-16 animate-pulse rounded bg-[#233554]" /> : (
          <p className="mt-3 text-3xl font-bold">{unavailable ? '—' : value}</p>
        )}
        <p className="mt-3 text-xs font-medium text-[#64ffda]">View details →</p>
      </Card>
    </Link>
  )
}

function formatDeadline(value) {
  if (!value) return 'No deadline'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default function CompanyOverview() {
  const [summary, setSummary] = useState(initialSource)
  const [jobs, setJobs] = useState(initialSource)
  const [projects, setProjects] = useState(initialSource)
  const [profile, setProfile] = useState(initialSource)

  useEffect(() => {
    let active = true
    const load = (request, setter, select = (value) => value) => {
      request().then((response) => {
        if (active) setter({ data: select(response), loading: false, error: false })
      }).catch(() => {
        if (active) setter({ data: null, loading: false, error: true })
      })
    }

    load(getDashboardSummary, setSummary)
    load(() => getCompanyJobs({ status: 'open', per_page: 5 }), setJobs, (response) => response.data ?? [])
    load(() => getCompanyProjects({ status: 'open', per_page: 5 }), setProjects, (response) => response.data ?? [])
    load(getCompanyProfile, setProfile, (response) => response.profile ?? {})
    return () => { active = false }
  }, [])

  const count = (key) => {
    const value = Number(summary.data?.[key])
    return Number.isFinite(value) ? value : 0
  }
  const opportunities = useMemo(() => [
    ...(jobs.data ?? []).map((item) => ({ ...item, kind: 'Job', responses: item.applications, managePath: '/company/jobs', listPath: '/company/opportunities?type=jobs' })),
    ...(projects.data ?? []).map((item) => ({ ...item, kind: 'Project', responses: item.bids, managePath: '/company/projects', listPath: '/company/opportunities?type=projects' })),
  ].slice(0, 5), [jobs.data, projects.data])
  const upcoming = opportunities.filter((item) => {
    if (!item.deadline) return false
    const days = (new Date(`${item.deadline}T00:00:00`) - new Date()) / 86400000
    return days >= 0 && days <= 30
  })
  const attention = []
  if (!summary.loading && !summary.error && count('pending_applications_count') > 0) {
    attention.push({ text: `${count('pending_applications_count')} application${count('pending_applications_count') === 1 ? '' : 's'} awaiting review`, path: '/company/applications?type=applications&status=pending' })
  }
  if (!summary.loading && !summary.error && count('pending_bids_count') > 0) {
    attention.push({ text: `${count('pending_bids_count')} proposal${count('pending_bids_count') === 1 ? '' : 's'} awaiting review`, path: '/company/applications?type=proposals&status=pending' })
  }
  if (!profile.loading && !profile.error && (!profile.data?.company_name || !profile.data?.industry || !profile.data?.description)) {
    attention.push({ text: 'Complete your company profile', path: '/company/profile' })
  }
  if (!jobs.loading && !projects.loading && !jobs.error && !projects.error && opportunities.length === 0) {
    attention.push({ text: 'Publish your first active opportunity', path: '/company/opportunities' })
  }
  upcoming.slice(0, 2).forEach((item) => attention.push({ text: `${item.title} deadline is approaching`, path: item.managePath }))

  return (
    <CompanyLayout title="Overview">
      <div className="space-y-8">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-sm text-[#64ffda]">Company workspace</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Company Overview</h2>
            <p className="mt-2 max-w-2xl text-[#8892b0]">A clear view of your opportunities and candidate activity.</p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-48"><PostOpportunityMenu /></div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active opportunities" value={count('open_jobs_count') + count('open_projects_count')} href="/company/opportunities" loading={summary.loading} unavailable={summary.error} />
          <StatCard label="New applications" value={count('pending_applications_count')} href="/company/applications?type=applications&status=pending" loading={summary.loading} unavailable={summary.error} />
          <StatCard label="New proposals" value={count('pending_bids_count')} href="/company/applications?type=proposals&status=pending" loading={summary.loading} unavailable={summary.error} />
          <StatCard label="Upcoming deadlines" value={upcoming.length} href="/company/opportunities" loading={jobs.loading || projects.loading} unavailable={jobs.error && projects.error} />
        </section>

        {summary.error && <SectionError>Some workspace totals are temporarily unavailable.</SectionError>}

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <section className="min-w-0">
            <div className="flex items-end justify-between gap-4">
              <div><h3 className="text-xl font-semibold">Active opportunities</h3><p className="mt-1 text-sm text-[#8892b0]">Your open jobs and company projects.</p></div>
              <Link to="/company/opportunities" className="shrink-0 text-sm font-medium text-[#64ffda]">View all</Link>
            </div>
            {jobs.loading || projects.loading ? <LoadingSpinner label="Loading opportunities..." /> : opportunities.length === 0 ? (
              <Card className="mt-4 text-center"><p className="font-semibold">No active opportunities</p><p className="mt-2 text-sm text-[#8892b0]">Post a job or company project to get started.</p></Card>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {opportunities.map((item) => (
                  <Card key={`${item.kind}-${item.id}`} hover className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-[#64ffda]">{item.kind}</p><h4 className="mt-1 truncate font-semibold">{item.title}</h4></div>
                      <span className="rounded-full border border-[#64ffda]/30 bg-[#64ffda]/10 px-2 py-1 text-[10px] text-[#64ffda]">{item.status}</span>
                    </div>
                    <div className="mt-5 space-y-2 border-t border-[#233554] pt-4 text-sm text-[#8892b0]">
                      <p>Deadline: <span className="text-[#e6f1ff]">{formatDeadline(item.deadline)}</span></p>
                      <p>{item.kind === 'Job' ? 'Applications' : 'Proposals'}: <span className="text-[#e6f1ff]">{item.responses ?? 0}</span></p>
                    </div>
                    <Link to={item.managePath} className="mt-4 inline-block text-sm font-medium text-[#64ffda]">Manage {item.kind.toLowerCase()} →</Link>
                  </Card>
                ))}
              </div>
            )}
            {(jobs.error || projects.error) && <div className="mt-4"><SectionError>Some active opportunities could not be loaded.</SectionError></div>}
          </section>

          <aside className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold">Needs attention</h3>
              {summary.loading || profile.loading ? <LoadingSpinner label="Checking activity..." size="sm" /> : attention.length === 0 ? (
                <p className="mt-4 text-sm text-[#8892b0]">Nothing urgent right now.</p>
              ) : (
                <ul className="mt-4 space-y-2">{attention.slice(0, 5).map((item) => (
                  <li key={`${item.path}-${item.text}`}><Link to={item.path} className="block rounded-lg border border-[#233554] px-3 py-3 text-sm hover:border-[#64ffda]/40 hover:text-[#64ffda]">{item.text} →</Link></li>
                ))}</ul>
              )}
            </Card>
            <Card>
              <h3 className="text-lg font-semibold">Quick actions</h3>
              <div className="mt-4 grid gap-2">
                {[
                  ['Post a job', '/company/jobs/create'],
                  ['Post a project', '/company/projects/create'],
                  ['Review applications', '/company/applications?type=applications'],
                  ['Review proposals', '/company/applications?type=proposals'],
                  ['Explore talent', '/company/talent'],
                  ['Update company profile', '/company/profile'],
                ].map(([label, path]) => <Link key={path} to={path} className="rounded-lg bg-[#0a192f]/70 px-3 py-2.5 text-sm text-[#a8b2d1] hover:text-[#64ffda]">{label}</Link>)}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </CompanyLayout>
  )
}
