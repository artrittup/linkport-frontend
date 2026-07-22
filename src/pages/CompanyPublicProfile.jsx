import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getCompanyPublicProfile } from '../api/searchApi'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CompanyPublicProfile() {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getCompanyPublicProfile(id).then((data) => active && setCompany(data)).catch(() => active && setError('This company profile is unavailable.'))
    return () => { active = false }
  }, [id])

  if (!company && !error) return <div className="min-h-screen bg-[#0a192f] p-10"><LoadingSpinner label="Loading company profile..." /></div>

  const profile = company?.profile ?? {}
  return (
    <main className="min-h-screen bg-[#0a192f] px-4 py-10 text-[#e6f1ff] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="text-sm text-[#64ffda] hover:underline">← Back to LinkPort</Link>
        {error ? <p role="alert" className="mt-8 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-red-200">{error}</p> : (
          <div className="mt-6 space-y-5">
            <header className="flex flex-col gap-5 rounded-xl border border-[#233554] bg-[#112240] p-6 sm:flex-row sm:items-center">
              {profile.logo_url && <img src={profile.logo_url} alt="" className="h-20 w-20 rounded-xl border border-[#233554] object-cover" />}
              <div><p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">Company</p><h1 className="mt-2 text-3xl font-bold">{profile.company_name || company.name}</h1><p className="mt-2 text-[#8892b0]">{[profile.industry, profile.location].filter(Boolean).join(' · ')}</p></div>
            </header>
            {profile.description && <section className="rounded-xl border border-[#233554] bg-[#112240] p-6"><h2 className="text-lg font-semibold">About</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#8892b0]">{profile.description}</p></section>}
            <section className="rounded-xl border border-[#233554] bg-[#112240] p-6 text-sm text-[#8892b0]">
              {profile.employee_count && <p>{profile.employee_count.toLocaleString()} employees</p>}
              <div className="mt-3 flex gap-4">{profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-[#64ffda] hover:underline">Website</a>}{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-[#64ffda] hover:underline">LinkedIn</a>}</div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
