import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getMemberPublicProfile } from '../api/searchApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ConnectionButton from '../components/ConnectionButton'

function ExternalLink({ href, children }) {
  if (!href) return null
  return <a href={href} target="_blank" rel="noreferrer" className="text-sm text-[#64ffda] hover:underline">{children}</a>
}

export default function MemberPublicProfile() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getMemberPublicProfile(id)
      .then((data) => active && setMember(data))
      .catch(() => active && setError('This member profile is unavailable.'))
    return () => { active = false }
  }, [id])

  if (!member && !error) return <div className="min-h-screen bg-[#0a192f] p-10"><LoadingSpinner label="Loading member profile..." /></div>

  const profile = member?.profile ?? {}
  return (
    <main className="min-h-screen bg-[#0a192f] px-4 py-10 text-[#e6f1ff] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="text-sm text-[#64ffda] hover:underline">← Back to LinkPort</Link>
        {error ? <p role="alert" className="mt-8 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-red-200">{error}</p> : (
          <div className="mt-6 space-y-5">
            <header className="rounded-xl border border-[#233554] bg-[#112240] p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">Member</p><h1 className="mt-2 text-3xl font-bold">{member.name}</h1><p className="mt-2 text-lg text-[#8892b0]">{profile.headline || 'LinkPort member'}</p>{profile.location && <p className="mt-2 text-sm text-[#8892b0]">{profile.location}</p>}</div>
                <ConnectionButton userId={member.id} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{profile.skills?.map((skill) => <span key={skill} className="rounded-full bg-[#64ffda]/10 px-3 py-1 text-xs text-[#64ffda]">{skill}</span>)}</div>
            </header>
            {[['About', profile.bio], ['Education', profile.education], ['Experience', profile.experience]].filter(([, value]) => value).map(([title, value]) => (
              <section key={title} className="rounded-xl border border-[#233554] bg-[#112240] p-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#8892b0]">{value}</p></section>
            ))}
            <section className="flex flex-wrap gap-4 rounded-xl border border-[#233554] bg-[#112240] p-6">
              <ExternalLink href={profile.website}>Website</ExternalLink><ExternalLink href={profile.github_url}>GitHub</ExternalLink><ExternalLink href={profile.linkedin_url}>LinkedIn</ExternalLink><ExternalLink href={profile.cv_url}>View CV</ExternalLink>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
