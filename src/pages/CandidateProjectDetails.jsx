import { Link, useParams } from 'react-router'
import Button from '../components/Button'
import { useLocalContent } from '../context/LocalContentContext'
import { getMockProject, PROJECT_STATUSES } from '../data/mockProjects'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const statusClasses = {
  [PROJECT_STATUSES.LOOKING_FOR_TEAM]: 'border-[#64ffda]/30 bg-[#64ffda]/10 text-[#64ffda]',
  [PROJECT_STATUSES.IN_PROGRESS]: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  [PROJECT_STATUSES.COMPLETED]: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
}

export default function CandidateProjectDetails() {
  const { projectId } = useParams()
  const { showToast } = useToast()
  const { getProject } = useLocalContent()
  const project = getProject(projectId) ?? getMockProject(projectId)

  if (!project) {
    return (
      <CandidateLayout title="Project not found">
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#233554] bg-[#112240]/65 p-8 text-center sm:p-10">
          <p className="font-mono text-sm text-[#64ffda]">Project showcase</p>
          <h2 className="mt-3 text-2xl font-bold text-[#e6f1ff]">Project not found</h2>
          <p className="mt-3 text-sm leading-6 text-[#8892b0]">
            This project does not exist or is no longer available in the showcase.
          </p>
          <Link to="/candidate/projects" className="mt-6 inline-flex rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
            Back to projects
          </Link>
        </section>
      </CandidateLayout>
    )
  }

  const lookingForTeam = project.status === PROJECT_STATUSES.LOOKING_FOR_TEAM
  const externalUrl = project.repositoryUrl || project.liveUrl
  const externalLabel = project.repositoryUrl ? 'View repository' : 'View demo'

  const handleJoinRequest = () => {
    showToast('Join requests are not available yet. Your interest was not sent.', 'info')
  }

  return (
    <CandidateLayout title={project.title}>
      <Link to="/candidate/projects" className="text-sm font-medium text-[#64ffda] hover:underline">
        ← Back to projects
      </Link>

      <article className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/65 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#64ffda]">Member project</p>
              <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#e6f1ff]">{project.title}</h2>
            </div>
            <span className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide ${statusClasses[project.status]}`}>
              {project.status}
            </span>
          </div>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">About the project</h3>
            <p className="mt-3 whitespace-pre-line break-words leading-7 text-[#8892b0]">{project.fullDescription}</p>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">Skills and technologies</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span key={skill} className="max-w-full break-words rounded-md border border-[#233554] bg-[#0a192f]/45 px-3 py-1.5 text-sm text-[#a8b2d1]">{skill}</span>
              ))}
            </div>
          </section>

          {lookingForTeam && (
            <section className="mt-8 rounded-xl border border-[#64ffda]/20 bg-[#64ffda]/5 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#64ffda]">Looking for</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#a8b2d1]">
                {project.lookingForRoles.map((role) => <li key={role} className="break-words">• {role}</li>)}
              </ul>
            </section>
          )}
        </div>

        <aside className="h-fit min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/65 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">Created by</h3>
          <p className="mt-3 font-semibold text-[#e6f1ff]">{project.creator}</p>
          <p className="mt-1 text-sm text-[#8892b0]">{project.creatorHeadline}</p>
          <p className="mt-1 text-xs text-[#64748b]">{project.university}</p>

          <div className="mt-6 border-t border-[#233554] pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">Current team</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#8892b0]">
              {project.teamMembers.map((member) => <li key={member}>{member}</li>)}
            </ul>
          </div>

          <div className="mt-6">
            {lookingForTeam ? (
              <Button className="w-full" onClick={handleJoinRequest}>Request to join</Button>
            ) : externalUrl ? (
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-5 py-2.5 text-sm font-semibold text-[#0a192f] transition-colors hover:bg-[#7dffe1]"
              >
                {externalLabel}
              </a>
            ) : (
              <Button className="w-full" onClick={() => showToast('A project link will be added later.', 'info')}>View project link</Button>
            )}
            <p className="mt-3 text-center text-xs text-[#64748b]">
              {lookingForTeam ? 'This is a preview; no request will be sent.' : 'External project link placeholder.'}
            </p>
          </div>
        </aside>
      </article>
    </CandidateLayout>
  )
}
