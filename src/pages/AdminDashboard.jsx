import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getAdminJobs, getAdminProjects, getAdminUsers } from '../api/adminApi'
import { getDashboardSummary } from '../api/dashboardApi'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardLayout from '../layouts/DashboardLayout'

const displayRole = (role) => role === 'Candidate' ? 'Member' : role

function RecentList({ items, getTitle, getMeta, href, isLoading, error }) {
  return (
    <Card className="h-full">
      {isLoading ? (
        <p className="text-sm text-[#8892b0]">Loading records...</p>
      ) : error ? (
        <p role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-sm text-[#fca5a5]">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[#8892b0]">No records available.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 border-b border-[#233554]/70 py-3 first:pt-0 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#e6f1ff]">{getTitle(item)}</p>
                <p className="mt-1 truncate text-xs text-[#8892b0]">{getMeta(item)}</p>
              </div>
              <span className="shrink-0 text-[10px] text-[#64ffda]">{item.status}</span>
            </div>
          ))}
        </div>
      )}
      <Link to={href} className="mt-5 inline-block text-xs text-[#64ffda] hover:opacity-80">View all</Link>
    </Card>
  )
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState({})
  const [recentUsers, setRecentUsers] = useState([])
  const [recentJobs, setRecentJobs] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [summaryError, setSummaryError] = useState('')
  const [usersError, setUsersError] = useState('')
  const [jobsError, setJobsError] = useState('')
  const [projectsError, setProjectsError] = useState('')

  useEffect(() => {
    let isActive = true

    const messageFor = (error, fallback) => error?.response?.data?.message || fallback

    getDashboardSummary().then((response) => {
      if (isActive) setSummary(response ?? {})
    }).catch((error) => {
      if (isActive) setSummaryError(messageFor(error, 'Unable to load platform totals.'))
    }).finally(() => {
      if (isActive) setIsLoadingSummary(false)
    })

    getAdminUsers({ per_page: 4 }).then((response) => {
      if (isActive) setRecentUsers(response.data)
    }).catch((error) => {
      if (isActive) setUsersError(messageFor(error, 'Unable to load recent users.'))
    }).finally(() => {
      if (isActive) setIsLoadingUsers(false)
    })

    getAdminJobs({ per_page: 4 }).then((response) => {
      if (isActive) setRecentJobs(response.data)
    }).catch((error) => {
      if (isActive) setJobsError(messageFor(error, 'Unable to load recent jobs.'))
    }).finally(() => {
      if (isActive) setIsLoadingJobs(false)
    })

    getAdminProjects({ per_page: 4 }).then((response) => {
      if (isActive) setRecentProjects(response.data)
    }).catch((error) => {
      if (isActive) setProjectsError(messageFor(error, 'Unable to load recent projects.'))
    }).finally(() => {
      if (isActive) setIsLoadingProjects(false)
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
    ['Total Users', count('users_count')],
    ['Members', count('candidates_count')],
    ['Companies', count('companies_count')],
    ['Jobs', count('jobs_count')],
    ['Projects', count('projects_count')],
  ]

  return (
    <DashboardLayout title="Admin Dashboard" userType="Admin">
      <div className="space-y-10">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Platform overview</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Admin Dashboard</h2>
          <p className="mt-3 text-[#8892b0]">Monitor users, companies, jobs, projects, applications, and bids.</p>

          {isLoadingSummary ? (
            <LoadingSpinner label="Loading platform totals..." />
          ) : summaryError ? (
            <div className="mt-8"><EmptyState title="Unable to load totals" description={summaryError} /></div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {stats.map(([label, value], index) => (
                <Card key={label} hover>
                  <p className="text-sm text-[#8892b0]">{label}</p>
                  <div className="mt-3 flex items-end justify-between"><p className="text-3xl font-bold">{value}</p><span className="font-mono text-xs text-[#64ffda]">0{index + 1}</span></div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
            <h2 className="mb-5 text-xl font-semibold sm:text-2xl">Recent Activity</h2>
            <div className="grid gap-5 lg:grid-cols-3">
              <div><h3 className="mb-3 text-sm text-[#8892b0]">Recent Users</h3><RecentList items={recentUsers} getTitle={(item) => item.name} getMeta={(item) => `${displayRole(item.role)} - ${item.createdDate}`} href="/admin/users" isLoading={isLoadingUsers} error={usersError} /></div>
              <div><h3 className="mb-3 text-sm text-[#8892b0]">Recent Jobs</h3><RecentList items={recentJobs} getTitle={(item) => item.title} getMeta={(item) => `${item.company} - ${item.createdDate}`} href="/admin/jobs" isLoading={isLoadingJobs} error={jobsError} /></div>
              <div><h3 className="mb-3 text-sm text-[#8892b0]">Recent Projects</h3><RecentList items={recentProjects} getTitle={(item) => item.title} getMeta={(item) => `${item.company} - ${item.createdDate}`} href="/admin/projects" isLoading={isLoadingProjects} error={projectsError} /></div>
            </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
