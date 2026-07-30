import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getAdminJobs, getAdminProjects, getAdminUsers } from '../api/adminApi'
import { getDashboardSummary } from '../api/dashboardApi'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardLayout from '../layouts/DashboardLayout'

const initialSource = {
  data: [],
  total: 0,
  loading: true,
  error: '',
}

const sourceError = (fallback) => ({
  data: [],
  total: 0,
  loading: false,
  error: fallback,
})

function SummaryCard({ label, value, path }) {
  return (
    <Link to={path} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
      <Card hover className="h-full">
        <p className="text-sm text-text-muted">{label}</p>
        <p className="mt-3 text-3xl font-bold text-text-primary">{value}</p>
      </Card>
    </Link>
  )
}

function ActionLink({ to, title, description }) {
  return (
    <Link to={to} className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
      <p className="font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </Link>
  )
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    data: null,
    loading: true,
    error: '',
  })
  const [users, setUsers] = useState(initialSource)
  const [jobs, setJobs] = useState(initialSource)
  const [projects, setProjects] = useState(initialSource)
  const [disabledUsers, setDisabledUsers] = useState(initialSource)

  useEffect(() => {
    let active = true

    getDashboardSummary()
      .then((data) => {
        if (active) setSummary({ data, loading: false, error: '' })
      })
      .catch(() => {
        if (active) setSummary({ data: null, loading: false, error: 'Platform totals could not be loaded.' })
      })

    getAdminUsers({ per_page: 4 })
      .then((response) => {
        if (active) setUsers({ data: response.data, total: response.total, loading: false, error: '' })
      })
      .catch(() => {
        if (active) setUsers(sourceError('Recent users could not be loaded.'))
      })

    getAdminJobs({ per_page: 4 })
      .then((response) => {
        if (active) setJobs({ data: response.data, total: response.total, loading: false, error: '' })
      })
      .catch(() => {
        if (active) setJobs(sourceError('Recent jobs could not be loaded.'))
      })

    getAdminProjects({ per_page: 4 })
      .then((response) => {
        if (active) setProjects({ data: response.data, total: response.total, loading: false, error: '' })
      })
      .catch(() => {
        if (active) setProjects(sourceError('Recent projects could not be loaded.'))
      })

    getAdminUsers({ status: 'disabled', per_page: 1 })
      .then((response) => {
        if (active) setDisabledUsers({ data: response.data, total: response.total, loading: false, error: '' })
      })
      .catch(() => {
        if (active) setDisabledUsers(sourceError('Disabled-account status could not be checked.'))
      })

    return () => {
      active = false
    }
  }, [])

  const stats = summary.data ? [
    { label: 'Total users', value: summary.data.users_count, path: '/admin/users' },
    { label: 'Member accounts', value: summary.data.candidates_count, path: '/admin/users?role=member' },
    { label: 'Company accounts', value: summary.data.companies_count, path: '/admin/users?role=company' },
    { label: 'Jobs', value: summary.data.jobs_count, path: '/admin/opportunities?type=jobs' },
    { label: 'Company projects', value: summary.data.projects_count, path: '/admin/opportunities?type=projects' },
  ].filter((item) => Number.isFinite(Number(item.value))) : []

  const attention = []
  if (!disabledUsers.loading && !disabledUsers.error && disabledUsers.total > 0) {
    attention.push({
      key: 'disabled-users',
      message: `${disabledUsers.total} disabled ${disabledUsers.total === 1 ? 'account requires' : 'accounts require'} visibility.`,
      path: '/admin/users?status=disabled',
      action: 'Manage users',
    })
  }
  if (summary.data && Number(summary.data.jobs_count) === 0) {
    attention.push({ key: 'no-jobs', message: 'No Jobs are currently available on the platform.', path: '/admin/opportunities?type=jobs', action: 'Review Jobs' })
  }
  if (summary.data && Number(summary.data.projects_count) === 0) {
    attention.push({ key: 'no-projects', message: 'No Company Projects are currently available.', path: '/admin/opportunities?type=projects', action: 'Review Projects' })
  }
  ;[
    summary.error,
    disabledUsers.error,
    users.error,
    jobs.error,
    projects.error,
  ].filter(Boolean).forEach((message, index) => {
    attention.push({ key: `load-error-${index}`, message, path: '/admin/overview', action: 'Try again later' })
  })

  const activity = useMemo(() => [
    ...users.data.map((item) => ({
      key: `user-${item.id}`,
      title: item.name,
      meta: `${item.role === 'Candidate' ? 'Member' : item.role} account`,
      date: item.createdDate,
      timestamp: item.created_at,
      path: '/admin/users',
    })),
    ...jobs.data.map((item) => ({
      key: `job-${item.id}`,
      title: item.title,
      meta: `Job · ${item.company}`,
      date: item.createdDate,
      timestamp: item.created_at,
      path: '/admin/opportunities?type=jobs',
    })),
    ...projects.data.map((item) => ({
      key: `project-${item.id}`,
      title: item.title,
      meta: `Company Project · ${item.company}`,
      date: item.createdDate,
      timestamp: item.created_at,
      path: '/admin/opportunities?type=projects',
    })),
  ].sort((a, b) => {
    const first = new Date(a.timestamp ?? 0).getTime()
    const second = new Date(b.timestamp ?? 0).getTime()
    return second - first
  }).slice(0, 6), [jobs.data, projects.data, users.data])

  const activityLoading = users.loading || jobs.loading || projects.loading

  return (
    <DashboardLayout title="Admin Overview" userType="Admin">
      <div className="min-w-0 space-y-10">
        <section>
          <p className="font-mono text-sm text-primary">Platform operations</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Admin Overview</h2>
          <p className="mt-3 max-w-2xl text-text-muted">Monitor platform participation and open the management area that needs attention next.</p>

          {summary.loading ? (
            <div className="mt-8"><LoadingSpinner label="Loading platform totals..." /></div>
          ) : summary.error ? (
            <p role="alert" className="mt-8 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text">{summary.error}</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {stats.map((item) => <SummaryCard key={item.label} {...item} />)}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold sm:text-2xl">Needs your attention</h2>
          <div className="mt-5">
            {disabledUsers.loading && summary.loading ? (
              <LoadingSpinner label="Checking platform status..." />
            ) : attention.length === 0 ? (
              <Card><p className="text-sm text-text-muted">No urgent Admin actions were found.</p></Card>
            ) : (
              <Card padding="sm">
                <div className="divide-y divide-border">
                  {attention.slice(0, 5).map((item) => (
                    <div key={item.key} className="flex flex-col gap-3 px-2 py-4 first:pt-2 last:pb-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-text-secondary">{item.message}</p>
                      <Link to={item.path} className="shrink-0 text-sm font-semibold text-primary hover:opacity-80">{item.action}</Link>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </section>

        <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold sm:text-2xl">Recent platform activity</h2>
            <div className="mt-5">
              <Card>
                {activityLoading && activity.length === 0 ? (
                  <LoadingSpinner label="Loading recent activity..." />
                ) : activity.length === 0 ? (
                  <p className="text-sm text-text-muted">No recent records are available.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {activity.map((item) => (
                      <Link key={item.key} to={item.path} className="flex min-w-0 items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:text-primary">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium">{item.title}</p>
                          <p className="mt-1 break-words text-xs text-text-muted">{item.meta}</p>
                        </div>
                        <span className="shrink-0 text-xs text-text-subtle">{item.date}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold sm:text-2xl">Quick Actions</h2>
            <div className="mt-5 grid gap-3">
              <ActionLink to="/admin/users" title="Manage users" description="Search accounts and review access status." />
              <ActionLink to="/admin/opportunities?type=jobs" title="Review Jobs" description="Open Job management." />
              <ActionLink to="/admin/opportunities?type=projects" title="Review Projects" description="Open Company Project management." />
              <ActionLink to="/admin/community" title="Community moderation" description="Review the currently connected moderation scope." />
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
