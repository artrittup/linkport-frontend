import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  getCommunityMember,
  isCommunityMemberNotFound,
} from '../api/communityMembersApi'
import CandidateProfileHeader from '../components/CandidateProfileHeader'
import ProjectShowcaseCard from '../components/ProjectShowcaseCard'
import {
  getCollaborationStatusLabel,
  getInterestLabel,
} from '../data/communityMemberMapper'
import CompanyLayout from '../layouts/CompanyLayout'

function Section({ title, children }) {
  return <section className="min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/55 p-5 sm:p-6"><h3 className="text-xl font-semibold">{title}</h3><div className="mt-5 min-w-0">{children}</div></section>
}

function ProfileUnavailable({ notFound, forbidden, onRetry }) {
  return (
    <CompanyLayout title="Talent profile">
      <section className="mx-auto max-w-2xl rounded-2xl border border-[#233554] bg-[#112240]/65 p-8 text-center">
        <h2 className="text-2xl font-bold">{notFound ? 'Member not found' : forbidden ? 'Member profiles are temporarily unavailable' : 'Member profile unavailable'}</h2>
        <p className="mt-3 text-sm leading-6 text-[#8892b0]">{notFound ? 'This active member is not available in Talent.' : forbidden ? 'Company access to the Talent directory is not currently permitted by the API.' : 'We could not load this public member profile.'}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">{!notFound && !forbidden && <button type="button" onClick={onRetry} className="rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda]">Try again</button>}<Link to="/company/talent" className="rounded-lg border border-[#233554] px-4 py-2.5 text-sm font-semibold text-[#a8b2d1]">Back to Talent</Link></div>
      </section>
    </CompanyLayout>
  )
}

export default function CompanyTalentProfile() {
  const { candidateId } = useParams()
  const [member, setMember] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorState, setErrorState] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    async function loadMember() {
      setIsLoading(true)
      setErrorState('')
      try {
        const response = await getCommunityMember(candidateId)
        if (active) setMember(response.data)
      } catch (error) {
        if (!active) return
        setMember(null)
        setErrorState(isCommunityMemberNotFound(error) ? 'not-found' : error.response?.status === 403 ? 'forbidden' : 'error')
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadMember()
    return () => { active = false }
  }, [candidateId, refreshKey])

  if (isLoading) return <CompanyLayout title="Talent profile"><div className="h-96 animate-pulse rounded-2xl border border-[#233554] bg-[#112240]/45" aria-label="Loading member profile" /></CompanyLayout>
  if (!member) return <ProfileUnavailable notFound={errorState === 'not-found'} forbidden={errorState === 'forbidden'} onRetry={() => setRefreshKey((current) => current + 1)} />

  const headerProfile = {
    fullName: member.name,
    professionalTitle: member.headline,
    university: member.university || member.fieldOfStudy,
    location: member.location,
    bio: member.biography,
    portfolioLink: member.portfolioUrl,
    githubUrl: member.githubUrl,
    linkedinUrl: member.linkedinUrl,
    collaborationStatus: member.collaborationStatus,
  }

  return (
    <CompanyLayout title={member.name}>
      <div className="min-w-0">
        <Link to="/company/talent" className="text-sm font-medium text-[#64ffda] hover:underline">← Back to Talent</Link>
        <div className="mt-6"><CandidateProfileHeader profile={headerProfile} showBio={false} /></div>

        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
          <Section title="About">
            {member.biography ? <p className="whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{member.biography}</p> : <p className="text-sm text-[#8892b0]">No biography has been shared.</p>}
            {(member.university || member.fieldOfStudy || member.graduationYear) && <dl className="mt-5 grid gap-4 border-t border-[#233554] pt-5 sm:grid-cols-2">
              {member.university && <div><dt className="text-xs uppercase text-[#64748b]">University</dt><dd className="mt-1 break-words text-sm">{member.university}</dd></div>}
              {member.fieldOfStudy && <div><dt className="text-xs uppercase text-[#64748b]">Field of study</dt><dd className="mt-1 break-words text-sm">{member.fieldOfStudy}</dd></div>}
              {member.graduationYear && <div><dt className="text-xs uppercase text-[#64748b]">Graduation year</dt><dd className="mt-1 text-sm">{member.graduationYear}</dd></div>}
            </dl>}
            {member.interests.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{member.interests.map((interest) => <span key={interest} className="rounded-full border border-[#233554] px-3 py-1 text-xs text-[#a8b2d1]">{getInterestLabel(interest)}</span>)}</div>}
          </Section>

          <Section title="Collaboration">
            {member.collaborationStatus ? <p className="rounded-xl border border-[#64ffda]/20 bg-[#64ffda]/5 px-3 py-2 text-sm text-[#64ffda]">Status: {getCollaborationStatusLabel(member.collaborationStatus)}</p> : <p className="text-sm text-[#8892b0]">No collaboration status has been shared.</p>}
            {member.lookingForRoles.length > 0 ? <div className="mt-5"><h4 className="text-xs uppercase text-[#64748b]">Looking for</h4><ul className="mt-2 space-y-2 text-sm text-[#a8b2d1]">{member.lookingForRoles.map((role) => <li key={role} className="break-words">• {role}</li>)}</ul></div> : <p className="mt-5 text-sm text-[#8892b0]">No collaboration roles listed.</p>}
            {member.interests.length > 0 && <div className="mt-5"><h4 className="text-xs uppercase text-[#64748b]">Interest areas</h4><p className="mt-2 break-words text-sm leading-6 text-[#a8b2d1]">{member.interests.map(getInterestLabel).join(', ')}</p></div>}
          </Section>
        </div>

        <div className="mt-6"><Section title="Skills">{member.skills.length > 0 ? <div className="flex flex-wrap gap-2">{member.skills.map((skill) => <span key={skill} className="max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-3 py-1.5 text-sm text-[#64ffda]">{skill}</span>)}</div> : <p className="text-sm text-[#8892b0]">No skills have been shared.</p>}</Section></div>

        <section className="mt-6 min-w-0">
          <h3 className="text-2xl font-semibold">Community Projects</h3>
          <p className="mt-2 text-sm text-[#8892b0]">{member.projectCount} public {member.projectCount === 1 ? 'project' : 'projects'} shared.</p>
          {member.projects.length > 0 ? <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{member.projects.slice(0, 3).map((project) => <ProjectShowcaseCard key={project.id} project={project} showLink={false} />)}</div> : <div className="mt-5 rounded-2xl border border-[#233554] bg-[#112240]/55 p-6 text-sm text-[#8892b0]">This member has not shared a Community Project yet.</div>}
        </section>
      </div>
    </CompanyLayout>
  )
}
