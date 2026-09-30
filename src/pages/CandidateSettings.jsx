import { Link } from 'react-router'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CandidateLayout from '../layouts/CandidateLayout'

function SettingsCard({ title, description, children, labelledBy }) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-surface/60 p-5 sm:p-6" aria-labelledby={labelledBy}>
      <div className="min-w-0">
        <h3 id={labelledBy} className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-1 text-sm leading-6 text-text-muted">{description}</p>}
      </div>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  )
}

function PreferenceRow({ title, description, status }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        <p className="mt-1 text-sm leading-6 text-text-muted">{description}</p>
      </div>
      <span className="w-fit shrink-0 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-text-secondary">{status}</span>
    </div>
  )
}

export default function CandidateSettings() {
  const { user } = useAuth()
  const { isDark } = useTheme()

  return (
    <CandidateLayout title="Settings">
      <div className="mx-auto min-w-0 max-w-4xl">
        <div className="grid min-w-0 gap-5">
          <SettingsCard title="Account" description="Your sign-in identity is separate from the information shown on your public profile." labelledBy="account-settings-heading">
            <dl className="grid min-w-0 gap-4 border-y border-border py-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Name</dt>
                <dd className="mt-1 break-words text-sm text-text-primary">{user?.name || 'LinkPort member'}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Email</dt>
                <dd className="mt-1 break-all text-sm text-text-primary">{user?.email || 'Unavailable'}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/member/profile/edit" className="rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">Edit public profile</Link>
              <Link to="/member/profile" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary/50 hover:text-primary">View profile</Link>
            </div>
          </SettingsCard>

          <SettingsCard title="Appearance" description={`LinkPort is currently using ${isDark ? 'dark' : 'light'} mode.`} labelledBy="appearance-settings-heading">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-6 text-text-muted">Switch the interface theme. Your choice is stored in this browser.</p>
              <ThemeToggle showLabel className="w-fit shrink-0 border border-border bg-background px-4" />
            </div>
          </SettingsCard>

          <SettingsCard title="Notifications and privacy" description="Review the controls currently available and where future preferences will live." labelledBy="preference-settings-heading">
            <div className="divide-y divide-border">
              <PreferenceRow title="In-app notifications" description="Application, proposal, project, and community updates appear in your notification center." status="Active" />
              <PreferenceRow title="Profile visibility" description="Your community profile is available to signed-in LinkPort members." status="Members" />
              <PreferenceRow title="Email and privacy controls" description="Additional delivery and privacy choices will be added when backend support is available." status="Coming later" />
            </div>
            <Link to="/member/notifications" className="mt-5 inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary/50 hover:text-primary">Open notification center</Link>
          </SettingsCard>
        </div>
      </div>
    </CandidateLayout>
  )
}
