import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  getCommunityMember,
  isCommunityMemberNotFound,
} from '../api/communityMembersApi'
import CandidateProfileHeader from '../components/CandidateProfileHeader'
import ConnectionButton from '../components/ConnectionButton'
import ProjectShowcaseCard from '../components/ProjectShowcaseCard'
import {
  getCollaborationStatusLabel,
  getInterestLabel,
} from '../data/communityMemberMapper'
import { getCommunityPostCategoryLabel } from '../data/communityPostMapper'
import useCommunityPosts from '../hooks/useCommunityPosts'
import CandidateLayout from '../layouts/CandidateLayout'

function ProfileSection({ title, description, children, className = '' }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-border bg-surface/55 p-5 sm:p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 text-sm leading-6 text-text-muted">{description}</p>}
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  )
}

function EmptyText({ children }) {
  return <p className="text-sm leading-6 text-text-muted">{children}</p>
}

function UnavailableMember({ notFound, onRetry }) {
  return (
    <CandidateLayout title={notFound ? 'Member not found' : 'Member unavailable'}>
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface/65 p-8 text-center sm:p-10">
        <p className="font-mono text-sm text-primary">Member discovery</p>
        <h2 className="mt-3 text-2xl font-bold text-text-primary">{notFound ? 'Member not found' : 'Member profile unavailable'}</h2>
        <p className="mt-3 text-sm leading-6 text-text-muted">{notFound ? 'This member is not available in the Community directory.' : 'We could not load this member profile. Please try again.'}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!notFound && <button type="button" onClick={onRetry} className="inline-flex rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">Try again</button>}
          <Link to="/member/community/members" className="inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-primary/50 hover:text-primary">Return to members</Link>
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
  const postsActivity = useCommunityPosts({ userId: memberId, perPage: 3, enabled: Boolean(memberId) })

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
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface/45" aria-label="Loading member profile" />
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
  const publicActivityCount = member.projectCount + postsActivity.meta.total

  const profileActions = member.isCurrentUser ? null : (
    <>
      <ConnectionButton userId={member.id} />
      <Link to="/member/messages" className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary/50 hover:text-primary">
        Message
      </Link>
    </>
  )

  return (
    <CandidateLayout title={member.name}>
      <div className="min-w-0 max-w-full space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/member/community/members" className="text-sm font-medium text-primary hover:underline">&larr; Back to members</Link>
          {member.isCurrentUser && <Link to="/member/profile" className="text-sm font-medium text-primary hover:underline">View my profile</Link>}
        </div>

        <CandidateProfileHeader profile={headerProfile} isOwner={member.isCurrentUser} actions={profileActions} showBio={false} />

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.6fr)]">
          <ProfileSection title="About">
            {member.biography ? <p className="whitespace-pre-line break-words text-sm leading-7 text-text-secondary">{member.biography}</p> : <EmptyText>No biography has been shared.</EmptyText>}
            {(member.university || member.fieldOfStudy || member.graduationYear) && (
              <dl className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                {member.university && <div><dt className="text-xs uppercase tracking-wide text-text-subtle">University</dt><dd className="mt-1 break-words text-sm text-text-primary">{member.university}</dd></div>}
                {member.fieldOfStudy && <div><dt className="text-xs uppercase tracking-wide text-text-subtle">Field of study</dt><dd className="mt-1 break-words text-sm text-text-primary">{member.fieldOfStudy}</dd></div>}
                {member.graduationYear && <div><dt className="text-xs uppercase tracking-wide text-text-subtle">Graduation year</dt><dd className="mt-1 text-sm text-text-primary">{member.graduationYear}</dd></div>}
              </dl>
            )}
          </ProfileSection>

          <ProfileSection title="Collaboration">
            {member.collaborationStatus ? <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">{getCollaborationStatusLabel(member.collaborationStatus)}</p> : <EmptyText>No collaboration status has been shared.</EmptyText>}
            {member.lookingForRoles.length > 0 ? (
              <div className="mt-5"><h4 className="text-xs uppercase tracking-wide text-text-subtle">Looking for</h4><ul className="mt-2 space-y-2 text-sm text-text-secondary">{member.lookingForRoles.map((role) => <li key={role} className="break-words">&bull; {role}</li>)}</ul></div>
            ) : <p className="mt-5 text-sm leading-6 text-text-muted">No specific collaboration roles listed.</p>}
            {member.interests.length > 0 && <div className="mt-5"><h4 className="text-xs uppercase tracking-wide text-text-subtle">Interests</h4><div className="mt-2 flex flex-wrap gap-2">{member.interests.map((interest) => <span key={interest} className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary">{getInterestLabel(interest)}</span>)}</div></div>}
          </ProfileSection>
        </div>

        <ProfileSection title="Skills" description="Tools, technologies, and areas of practice.">
          {member.skills.length > 0 ? <div className="flex min-w-0 flex-wrap gap-2">{member.skills.map((skill) => <span key={skill} className="max-w-full break-words rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-sm text-primary">{skill}</span>)}</div> : <EmptyText>No skills have been shared.</EmptyText>}
        </ProfileSection>

        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          <ProfileSection title="Experience">
            {member.experience ? <p className="whitespace-pre-line break-words text-sm leading-7 text-text-secondary">{member.experience}</p> : <EmptyText>No experience has been shared.</EmptyText>}
          </ProfileSection>
          <ProfileSection title="Education">
            {member.education ? <p className="whitespace-pre-line break-words text-sm leading-7 text-text-secondary">{member.education}</p> : <EmptyText>No education details have been shared.</EmptyText>}
          </ProfileSection>
        </div>

        <section className="min-w-0" aria-labelledby="portfolio-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h3 id="portfolio-heading" className="text-2xl font-semibold text-text-primary">Projects / Portfolio</h3><p className="mt-2 text-sm text-text-muted">{member.projectCount} community {member.projectCount === 1 ? 'project' : 'projects'} shared.</p></div>
            <Link to="/member/community" className="text-sm font-medium text-primary hover:underline">Explore community projects</Link>
          </div>
          {member.projects.length > 0 ? (
            <div className="mt-5 grid min-w-0 max-w-full gap-5 md:grid-cols-2 xl:grid-cols-3">{member.projects.map((project) => <ProjectShowcaseCard key={project.id} project={project} />)}</div>
          ) : (
            <div className="mt-5 rounded-2xl border border-border bg-surface/55 p-6"><EmptyText>This member has not shared a community project yet.</EmptyText></div>
          )}
        </section>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.6fr)]">
          <ProfileSection title="Activity" description={`${publicActivityCount} public ${publicActivityCount === 1 ? 'item' : 'items'} across projects and posts.`}>
            {postsActivity.isLoading ? (
              <p role="status" className="text-sm text-text-muted">Loading recent posts...</p>
            ) : postsActivity.error ? (
              <div><p className="text-sm text-text-muted">Recent posts are temporarily unavailable.</p><button type="button" onClick={postsActivity.retry} className="mt-3 text-sm font-medium text-primary hover:underline">Try again</button></div>
            ) : postsActivity.posts.length > 0 ? (
              <div className="space-y-3">
                {postsActivity.posts.map((post) => (
                  <article key={post.id} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">{getCommunityPostCategoryLabel(post.category)}</span><span className="text-xs text-text-subtle">Community post</span></div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{post.text}</p>
                  </article>
                ))}
              </div>
            ) : <EmptyText>No public posts have been shared yet.</EmptyText>}
          </ProfileSection>

          <ProfileSection title="Connections">
            {member.isCurrentUser ? (
              <><p className="text-sm leading-6 text-text-muted">Manage your network and connection requests from Messages.</p><Link to="/member/messages" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Open my network →</Link></>
            ) : (
              <><p className="text-sm leading-6 text-text-muted">Use the profile actions above to connect with {member.name}. Your accepted connections are managed from Messages.</p><Link to="/member/messages" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Open Messages →</Link></>
            )}
          </ProfileSection>
        </div>
      </div>
    </CandidateLayout>
  )
}
