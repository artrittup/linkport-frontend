import { Link } from 'react-router'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateSettings() {
  const { user } = useAuth()
  const { isDark } = useTheme()

  return (
    <CandidateLayout title="Settings">
      <div className="mx-auto max-w-3xl space-y-8">
        <section>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Settings</h2>
          <p className="mt-3 leading-7 text-text-muted">Manage your member experience and account shortcuts.</p>
        </section>

        <section className="rounded-2xl border border-border bg-surface/60 p-5 sm:p-6" aria-labelledby="appearance-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 id="appearance-heading" className="text-lg font-semibold text-text-primary">Appearance</h3>
              <p className="mt-1 text-sm text-text-muted">LinkPort is currently using {isDark ? 'dark' : 'light'} mode.</p>
            </div>
            <ThemeToggle showLabel className="border border-border bg-background px-4" />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface/60 p-5 sm:p-6" aria-labelledby="account-heading">
          <h3 id="account-heading" className="text-lg font-semibold text-text-primary">Account</h3>
          <dl className="mt-4 grid gap-4 border-y border-border py-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Name</dt>
              <dd className="mt-1 break-words text-sm text-text-primary">{user?.name || 'LinkPort member'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Email</dt>
              <dd className="mt-1 break-words text-sm text-text-primary">{user?.email || 'Unavailable'}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/member/profile" className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">Edit profile</Link>
            <Link to="/member/notifications" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary">Notification center</Link>
          </div>
        </section>
      </div>
    </CandidateLayout>
  )
}
