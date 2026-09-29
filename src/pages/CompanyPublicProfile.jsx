import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getCompanyPublicProfile } from '../api/searchApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ThemeToggle from '../components/ThemeToggle'

export default function CompanyPublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getCompanyPublicProfile(id).then((data) => active && setCompany(data)).catch(() => active && setError('This company profile is unavailable.'))
    return () => { active = false }
  }, [id])

  if (!company && !error) return <div className="relative min-h-screen bg-background p-10"><ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" /><LoadingSpinner label="Loading company profile..." /></div>

  const profile = company?.profile ?? {}
  return (
    <main className="relative min-h-screen bg-background px-4 py-10 text-text-primary sm:px-6">
      <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" />
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate(-1)} className="text-sm text-primary hover:text-primary-hover">← Back</button>
        {error ? <p role="alert" className="mt-8 rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger-text">{error}</p> : (
          <div className="mt-6 space-y-5">
            <header className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
              {profile.logo_url && <img src={profile.logo_url} alt="" className="h-20 w-20 rounded-xl border border-border object-cover" />}
              <div><p className="font-mono text-xs uppercase tracking-wider text-primary">Company</p><h1 className="mt-2 text-3xl font-bold">{profile.company_name || company.name}</h1><p className="mt-2 text-text-muted">{[profile.industry, profile.location].filter(Boolean).join(' · ')}</p></div>
            </header>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem]">
              <section className="rounded-xl border border-border bg-surface p-6"><h2 className="text-lg font-semibold">About</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-muted">{profile.description || 'This company has not added a description yet.'}</p></section>
              <section className="rounded-xl border border-border bg-surface p-6 text-sm text-text-muted">
                <h2 className="text-lg font-semibold text-text-primary">Company details</h2>
                <dl className="mt-4 space-y-4">
                  {profile.industry && <div><dt className="text-xs uppercase tracking-wide text-text-subtle">Industry</dt><dd className="mt-1 text-text-secondary">{profile.industry}</dd></div>}
                  {profile.location && <div><dt className="text-xs uppercase tracking-wide text-text-subtle">Location</dt><dd className="mt-1 text-text-secondary">{profile.location}</dd></div>}
                  {profile.employee_count && <div><dt className="text-xs uppercase tracking-wide text-text-subtle">Team size</dt><dd className="mt-1 text-text-secondary">{profile.employee_count.toLocaleString()} employees</dd></div>}
                </dl>
                <div className="mt-5 flex flex-wrap gap-4">{profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:text-primary-hover">Website ↗</a>}{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:text-primary-hover">LinkedIn ↗</a>}</div>
              </section>
            </div>
            <section className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold">Opportunities from {profile.company_name || company.name}</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">Explore this company’s currently available jobs and project work.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={`/member/opportunities/jobs?company=${encodeURIComponent(profile.company_name || company.name)}`} className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">View jobs</Link>
                <Link to={`/member/opportunities/projects?company=${encodeURIComponent(profile.company_name || company.name)}`} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary/50 hover:text-primary">View projects</Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
