import { Link } from 'react-router'
import {
  COMMUNITY_PROJECT_STATUSES,
  getCommunityProjectStatusLabel,
  normalizeCommunityProjectStatus,
} from '../data/communityProjectMapper'

const statusClasses = {
  [COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM]: 'border-primary/30 bg-primary/10 text-primary',
  [COMMUNITY_PROJECT_STATUSES.IN_PROGRESS]: 'border-warning/30 bg-warning/10 text-warning',
  [COMMUNITY_PROJECT_STATUSES.COMPLETED]: 'border-success/30 bg-success/10 text-success',
}

export default function ProjectShowcaseCard({ project, showLink = true }) {
  const normalizedStatus = normalizeCommunityProjectStatus(project.status)
  const creatorContext = [project.creatorHeadline, project.creatorLocation ?? project.university].filter(Boolean).join(' · ')
  const lookingForTeam = normalizedStatus === COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM

  return (
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-border bg-surface/65 p-5 transition-colors hover:border-primary/35 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 break-words text-xl font-semibold leading-snug text-text-primary">
          {project.title}
        </h2>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide ${statusClasses[normalizedStatus] ?? statusClasses[COMMUNITY_PROJECT_STATUSES.IN_PROGRESS]}`}>
          {getCommunityProjectStatusLabel(normalizedStatus)}
        </span>
      </div>

      <p className="mt-3 break-words text-sm leading-6 text-text-muted">{project.description}</p>

      <div className="mt-5 border-t border-border pt-4">
        <p className="break-words text-sm font-medium text-text-primary">{project.creator}</p>
        {creatorContext && <p className="mt-1 break-words text-xs text-text-subtle">{creatorContext}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="max-w-full break-words rounded-md border border-border bg-background/45 px-2.5 py-1 text-xs text-text-secondary">
            {skill}
          </span>
        ))}
      </div>

      {lookingForTeam && (
        <p className="mt-5 text-xs text-primary">
          {project.lookingForRoles.length} open roles
        </p>
      )}

      {showLink && <div className="mt-auto pt-6">
        <Link
          to={`/member/projects/${project.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          View project
        </Link>
      </div>}
    </article>
  )
}
