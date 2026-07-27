import { Link, useParams } from 'react-router'
import CandidateProfileHeader from '../components/CandidateProfileHeader'
import ProjectShowcaseCard from '../components/ProjectShowcaseCard'
import { getMockMember } from '../data/mockMembers'
import { getMockProject } from '../data/mockProjects'
import CandidateLayout from '../layouts/CandidateLayout'

function ProfileSection({ title, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/55 p-5 sm:p-6">
      <h3 className="text-xl font-semibold text-[#e6f1ff]">{title}</h3>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  )
}

export default function CandidateMemberProfile() {
  const { memberId } = useParams()
  const member = getMockMember(memberId)

  if (!member) {
    return (
      <CandidateLayout title="Member not found">
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#233554] bg-[#112240]/65 p-8 text-center sm:p-10">
          <p className="font-mono text-sm text-[#64ffda]">Member discovery</p>
          <h2 className="mt-3 text-2xl font-bold text-[#e6f1ff]">Member not found</h2>
          <p className="mt-3 text-sm leading-6 text-[#8892b0]">This member profile does not exist in the Community directory.</p>
          <Link to="/candidate/community/members" className="mt-6 inline-flex rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
            Return to members
          </Link>
        </section>
      </CandidateLayout>
    )
  }

  const projects = member.projectIds.map(getMockProject).filter(Boolean).slice(0, 3)
  const hasExternalLinks = Boolean(member.githubUrl || member.linkedinUrl || member.portfolioUrl)
  const headerProfile = {
    fullName: member.name,
    professionalTitle: member.headline,
    education: member.university,
    location: member.location,
    bio: member.biography,
    portfolioLink: member.portfolioUrl,
    githubUrl: member.githubUrl,
    linkedinUrl: member.linkedinUrl,
    collaborationStatus: member.collaborationStatus,
  }

  return (
    <CandidateLayout title={member.name}>
      <div className="min-w-0 max-w-full">
        <Link to="/candidate/community/members" className="text-sm font-medium text-[#64ffda] hover:underline">← Back to members</Link>

        <div className="mt-6">
          <CandidateProfileHeader profile={headerProfile} />
        </div>

        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
          <ProfileSection title="About">
            <p className="whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{member.biography}</p>
            <dl className="mt-5 grid gap-4 border-t border-[#233554] pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Field of study</dt>
                <dd className="mt-1 break-words text-sm text-[#e6f1ff]">{member.fieldOfStudy}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Graduation year</dt>
                <dd className="mt-1 text-sm text-[#e6f1ff]">{member.graduationYear}</dd>
              </div>
            </dl>
            <div className="mt-5">
              <h4 className="text-xs uppercase tracking-wide text-[#64748b]">Current interests</h4>
              <div className="mt-2 flex min-w-0 flex-wrap gap-2">
                {member.interests.map((interest) => <span key={interest} className="max-w-full break-words rounded-full border border-[#233554] px-3 py-1 text-xs text-[#a8b2d1]">{interest}</span>)}
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Collaboration">
            <p className="rounded-xl border border-[#64ffda]/20 bg-[#64ffda]/5 px-3 py-2 text-sm text-[#64ffda]">{member.collaborationStatus}</p>
            {member.lookingForRoles.length > 0 ? (
              <div className="mt-5">
                <h4 className="text-xs uppercase tracking-wide text-[#64748b]">Looking for</h4>
                <ul className="mt-2 space-y-2 text-sm text-[#a8b2d1]">
                  {member.lookingForRoles.map((role) => <li key={role} className="break-words">• {role}</li>)}
                </ul>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-[#8892b0]">No specific collaboration roles listed.</p>
            )}
            {!hasExternalLinks && <p className="mt-5 text-sm leading-6 text-[#8892b0]">No external professional links shared.</p>}
          </ProfileSection>
        </div>

        <div className="mt-6">
          <ProfileSection title="Skills">
            <div className="flex min-w-0 flex-wrap gap-2">
              {member.skills.map((skill) => (
                <span key={skill} className="max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-3 py-1.5 text-sm text-[#64ffda]">{skill}</span>
              ))}
            </div>
          </ProfileSection>
        </div>

        <section className="mt-6 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-[#e6f1ff]">Projects</h3>
              <p className="mt-2 text-sm text-[#8892b0]">Project Showcase work associated with this member.</p>
            </div>
            <Link to="/candidate/projects" className="text-sm font-medium text-[#64ffda] hover:underline">View projects</Link>
          </div>
          {projects.length > 0 ? (
            <div className="mt-5 grid min-w-0 max-w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => <ProjectShowcaseCard key={project.id} project={project} />)}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-[#233554] bg-[#112240]/55 p-6">
              <p className="text-sm text-[#8892b0]">No projects are associated with this member yet.</p>
            </div>
          )}
        </section>
      </div>
    </CandidateLayout>
  )
}
