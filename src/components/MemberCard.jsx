import { Link } from 'react-router'
import { getCollaborationStatusLabel } from '../data/communityMemberMapper'

const statusClasses = {
  not_looking: 'border-border-strong/30 bg-text-subtle/10 text-text-secondary',
  looking_for_internship: 'border-violet/30 bg-violet/10 text-violet-text',
}

export default function MemberCard({ member }) {
  const visibleSkills = member.skills.slice(0, 3)
  const remainingSkills = Math.max(0, member.skills.length - visibleSkills.length)
  const statusClass = statusClasses[member.collaborationStatus]
    ?? 'border-primary/25 bg-primary/5 text-primary'

  return (
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-border bg-surface/65 p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background font-mono text-xs font-semibold text-primary">
          {member.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-semibold text-text-primary">{member.name}</h3>
            {member.isCurrentUser && <span className="rounded-full border border-primary/25 px-2 py-0.5 text-[10px] font-medium text-primary">You</span>}
          </div>
          {(member.headline || member.fieldOfStudy) && <p className="mt-1 break-words text-sm leading-5 text-text-secondary">{member.headline || member.fieldOfStudy}</p>}
          {member.university && <p className="mt-1 break-words text-xs text-text-subtle">{member.university}</p>}
        </div>
      </div>

      {member.collaborationStatus && (
        <span className={`mt-4 w-fit max-w-full break-words rounded-full border px-2.5 py-1 text-xs ${statusClass}`}>
          {getCollaborationStatusLabel(member.collaborationStatus)}
        </span>
      )}

      {visibleSkills.length > 0 && <div className="mt-4 flex min-w-0 flex-wrap gap-2">
        {visibleSkills.map((skill) => (
          <span key={skill} className="max-w-full break-words rounded-md border border-border px-2.5 py-1 text-xs text-text-muted">{skill}</span>
        ))}
        {remainingSkills > 0 && <span className="rounded-md border border-border px-2.5 py-1 text-xs text-text-subtle">+{remainingSkills}</span>}
      </div>}

      <div className="mt-auto pt-5">
        <Link
          to={`/member/community/members/${member.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          View profile
        </Link>
      </div>
    </article>
  )
}
