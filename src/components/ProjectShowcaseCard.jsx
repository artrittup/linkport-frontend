import { Link } from 'react-router'
import { PROJECT_STATUSES } from '../data/mockProjects'

const statusClasses = {
  [PROJECT_STATUSES.LOOKING_FOR_TEAM]: 'border-[#64ffda]/30 bg-[#64ffda]/10 text-[#64ffda]',
  [PROJECT_STATUSES.IN_PROGRESS]: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  [PROJECT_STATUSES.COMPLETED]: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
}

export default function ProjectShowcaseCard({ project }) {
  const creatorContext = [project.creatorHeadline, project.university].filter(Boolean).join(' · ')
  const lookingForTeam = project.status === PROJECT_STATUSES.LOOKING_FOR_TEAM

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 transition-colors hover:border-[#64ffda]/35 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-xl font-semibold leading-snug text-[#e6f1ff]">
          {project.title}
        </h2>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide ${statusClasses[project.status]}`}>
          {project.status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#8892b0]">{project.description}</p>

      <div className="mt-5 border-t border-[#233554] pt-4">
        <p className="text-sm font-medium text-[#e6f1ff]">{project.creator}</p>
        {creatorContext && <p className="mt-1 text-xs text-[#64748b]">{creatorContext}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-md border border-[#233554] bg-[#0a192f]/45 px-2.5 py-1 text-xs text-[#a8b2d1]">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#8892b0]">
        <span>{project.teamMembers.length} {project.teamMembers.length === 1 ? 'team member' : 'team members'}</span>
        <span className={lookingForTeam ? 'text-[#64ffda]' : ''}>
          {lookingForTeam ? `${project.lookingForRoles.length} open roles` : 'Team set'}
        </span>
      </div>

      <div className="mt-auto pt-6">
        <Link
          to={`/candidate/projects/${project.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] transition-colors hover:bg-[#64ffda]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"
        >
          View project
        </Link>
      </div>
    </article>
  )
}
