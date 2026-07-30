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
import CandidateLayout from '../layouts/CandidateLayout'

function ProfileSection({ title, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/55 p-5 sm:p-6">
      <h3 className="text-xl font-semibold text-[#e6f1ff]">{title}</h3>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  )
}

function UnavailableMember({ notFound, onRetry }) {
  return (
    <CandidateLayout title={notFound ? 'Member not found' : 'Member unavailable'}>
      <section className="mx-auto max-w-2xl rounded-2xl border border-[#233554] bg-[#112240]/65 p-8 text-center sm:p-10">
        <p className="font-mono text-sm text-[#64ffda]">Member discovery</p>
        <h2 className="mt-3 text-2xl font-bold text-[#e6f1ff]">{notFound ? 'Member not found' : 'Member profile unavailable'}</h2>
        <p className="mt-3 text-sm leading-6 text-[#8892b0]">{notFound ? 'This member is not available in the Community directory.' : 'We could not load this member profile. Please try again.'}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!notFound && <button type="button" onClick={onRetry} className="inline-flex rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">Try again</button>}
          <Link to="/member/community/members" className="inline-flex rounded-lg border border-[#233554] px-4 py-2.5 text-sm font-semibold text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda]">Return to members</Link>
        </div>
      </section>
    </CandidateLayout>
  )
}

export default function CandidateMemberProfile() {
  const { memberId } = useParams()
  const [member, setMember] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isActive = true
    async function loadMember() {
      setIsLoading(true)
      setNotFound(false)
      try {
        const response = await getCommunityMember(memberId)
        if (isActive) setMember(response.data)
      } catch (error) {
        if (!isActive) return
        setMember(null)
        setNotFound(isCommunityMemberNotFound(error))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }
    loadMember()
    return () => {
      isActive = false
    }
  }, [memberId, refreshKey])

  if (isLoading) {
    return (
      <CandidateLayout title="Community Member">
        <div className="h-96 animate-pulse rounded-2xl border border-[#233554] bg-[#112240]/45" aria-label="Loading member profile" />
      </CandidateLayout>
    )
  }

  if (!member) return <UnavailableMember notFound={notFound} onRetry={() => setRefreshKey((current) => current + 1)} />

  const headerProfile = {
    fullName: member.name,
    professionalTitle: member.headline,
    university: member.university,
    location: member.location,
    bio: member.biography,
    portfolioLink: member.portfolioUrl,
    githubUrl: member.githubUrl,
    linkedinUrl: member.linkedinUrl,
    collaborationStatus: member.collaborationStatus,
  }
  const hasExternalLinks = Boolean(member.portfolioUrl || member.githubUrl || member.linkedinUrl)

  return (
    <CandidateLayout title={member.name}>
      <div className="min-w-0 max-w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/member/community/members" className="text-sm font-medium text-[#64ffda] hover:underline">&larr; Back to members</Link>
          {member.isCurrentUser && <Link to="/member/profile" className="text-sm font-medium text-[#64ffda] hover:underline">View my editable profile</Link>}
        </div>

        <div className="mt-6"><CandidateProfileHeader profile={headerProfile} /></div>

        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
          <ProfileSection title="About">
            {member.biography ? <p className="whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{member.biography}</p> : <p className="text-sm text-[#8892b0]">No biography has been shared.</p>}
            {(member.fieldOfStudy || member.graduationYear) && (
              <dl className="mt-5 grid gap-4 border-t border-[#233554] pt-5 sm:grid-cols-2">
                {member.fieldOfStudy && <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">Field of study</dt><dd className="mt-1 break-words text-sm text-[#e6f1ff]">{member.fieldOfStudy}</dd></div>}
                {member.graduationYear && <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">Graduation year</dt><dd className="mt-1 text-sm text-[#e6f1ff]">{member.graduationYear}</dd></div>}
              </dl>
            )}
            {member.interests.length > 0 && <div className="mt-5"><h4 className="text-xs uppercase tracking-wide text-[#64748b]">Current interests</h4><div className="mt-2 flex min-w-0 flex-wrap gap-2">{member.interests.map((interest) => <span key={interest} className="max-w-full break-words rounded-full border border-[#233554] px-3 py-1 text-xs text-[#a8b2d1]">{getInterestLabel(interest)}</span>)}</div></div>}
          </ProfileSection>

          <ProfileSection title="Collaboration">
            {member.collaborationStatus ? <p className="rounded-xl border border-[#64ffda]/20 bg-[#64ffda]/5 px-3 py-2 text-sm text-[#64ffda]">{getCollaborationStatusLabel(member.collaborationStatus)}</p> : <p className="text-sm text-[#8892b0]">No collaboration status has been shared.</p>}
            {member.lookingForRoles.length > 0 ? (
              <div className="mt-5"><h4 className="text-xs uppercase tracking-wide text-[#64748b]">Looking for</h4><ul className="mt-2 space-y-2 text-sm text-[#a8b2d1]">{member.lookingForRoles.map((role) => <li key={role} className="break-words">&bull; {role}</li>)}</ul></div>
            ) : <p className="mt-5 text-sm leading-6 text-[#8892b0]">No specific collaboration roles listed.</p>}
            {member.interests.length > 0 && <div className="mt-5"><h4 className="text-xs uppercase tracking-wide text-[#64748b]">Interest areas</h4><p className="mt-2 break-words text-sm leading-6 text-[#a8b2d1]">{member.interests.map(getInterestLabel).join(', ')}</p></div>}
            {!hasExternalLinks && <p className="mt-5 text-sm leading-6 text-[#8892b0]">No external professional links have been shared.</p>}
          </ProfileSection>
        </div>

        <div className="mt-6">
          <ProfileSection title="Skills">
            {member.skills.length > 0 ? <div className="flex min-w-0 flex-wrap gap-2">{member.skills.map((skill) => <span key={skill} className="max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-3 py-1.5 text-sm text-[#64ffda]">{skill}</span>)}</div> : <p className="text-sm text-[#8892b0]">No skills have been shared.</p>}
          </ProfileSection>
        </div>

        <section className="mt-6 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h3 className="text-2xl font-semibold text-[#e6f1ff]">Projects</h3><p className="mt-2 text-sm text-[#8892b0]">{member.projectCount} community {member.projectCount === 1 ? 'project' : 'projects'} shared.</p></div>
            <Link to="/member/projects" className="text-sm font-medium text-[#64ffda] hover:underline">Explore projects</Link>
          </div>
          {member.projects.length > 0 ? (
            <div className="mt-5 grid min-w-0 max-w-full gap-5 md:grid-cols-2 xl:grid-cols-3">{member.projects.map((project) => <ProjectShowcaseCard key={project.id} project={project} />)}</div>
          ) : (
            <div className="mt-5 rounded-2xl border border-[#233554] bg-[#112240]/55 p-6"><p className="text-sm text-[#8892b0]">This member has not shared a Community Project yet.</p></div>
          )}
        </section>
      </div>
    </CandidateLayout>
  )
}
