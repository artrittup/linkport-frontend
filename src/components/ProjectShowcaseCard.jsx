import { Link } from 'react-router'
import {
  COMMUNITY_PROJECT_STATUSES,
  getCommunityProjectStatusLabel,
  normalizeCommunityProjectStatus,
} from '../data/communityProjectMapper'

const statusClasses = {
  [COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM]: 'border-[#64ffda]/30 bg-[#64ffda]/10 text-[#64ffda]',
  [COMMUNITY_PROJECT_STATUSES.IN_PROGRESS]: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  [COMMUNITY_PROJECT_STATUSES.COMPLETED]: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
}

export default function ProjectShowcaseCard({ project, showLink = true }) {
  const normalizedStatus = normalizeCommunityProjectStatus(project.status)
  const creatorContext = [project.creatorHeadline, project.creatorLocation ?? project.university].filter(Boolean).join(' · ')
  const lookingForTeam = normalizedStatus === COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM

  return (
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 transition-colors hover:border-[#64ffda]/35 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 break-words text-xl font-semibold leading-snug text-[#e6f1ff]">
          {project.title}
        </h2>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide ${statusClasses[normalizedStatus] ?? statusClasses[COMMUNITY_PROJECT_STATUSES.IN_PROGRESS]}`}>
          {getCommunityProjectStatusLabel(normalizedStatus)}
        </span>
      </div>

      <p className="mt-3 break-words text-sm leading-6 text-[#8892b0]">{project.description}</p>

      <div className="mt-5 border-t border-[#233554] pt-4">
        <p className="break-words text-sm font-medium text-[#e6f1ff]">{project.creator}</p>
        {creatorContext && <p className="mt-1 break-words text-xs text-[#64748b]">{creatorContext}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="max-w-full break-words rounded-md border border-[#233554] bg-[#0a192f]/45 px-2.5 py-1 text-xs text-[#a8b2d1]">
            {skill}
          </span>
        ))}
      </div>

      {lookingForTeam && (
        <p className="mt-5 text-xs text-[#64ffda]">
          {project.lookingForRoles.length} open roles
        </p>
      )}

      {showLink && <div className="mt-auto pt-6">
        <Link
          to={`/member/projects/${project.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] transition-colors hover:bg-[#64ffda]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"
        >
          View project
        </Link>
      </div>}
    </article>
  )
}
