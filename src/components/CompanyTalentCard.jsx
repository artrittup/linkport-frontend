import { Link } from 'react-router'
import {
  getCollaborationStatusLabel,
  getInterestLabel,
} from '../data/communityMemberMapper'

export default function CompanyTalentCard({ member }) {
  const visibleSkills = member.skills.slice(0, 3)
  const remainingSkills = Math.max(0, member.skills.length - visibleSkills.length)

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface/65 p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background font-mono text-xs font-semibold text-primary">
          {member.initials}
        </div>
        <div className="min-w-0">
          <h3 className="break-words font-semibold text-text-primary">{member.name}</h3>
          {(member.headline || member.fieldOfStudy) && <p className="mt-1 break-words text-sm leading-5 text-text-secondary">{member.headline || member.fieldOfStudy}</p>}
          {(member.university || member.location) && <p className="mt-1 break-words text-xs text-text-subtle">{[member.university, member.location].filter(Boolean).join(' · ')}</p>}
        </div>
      </div>

      {member.collaborationStatus && (
        <span className="mt-4 w-fit max-w-full break-words rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs text-primary">
          Status: {getCollaborationStatusLabel(member.collaborationStatus)}
        </span>
      )}

      {visibleSkills.length > 0 && <div className="mt-4 flex flex-wrap gap-2">
        {visibleSkills.map((skill) => <span key={skill} className="max-w-full break-words rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary">{skill}</span>)}
        {remainingSkills > 0 && <span className="rounded-md border border-border px-2.5 py-1 text-xs text-text-subtle">+{remainingSkills}</span>}
      </div>}

      {member.interests.length > 0 && <div className="mt-4 flex flex-wrap gap-2">
        {member.interests.slice(0, 2).map((interest) => <span key={interest} className="max-w-full break-words text-xs text-text-muted">{getInterestLabel(interest)}</span>)}
      </div>}

      <div className="mt-auto pt-5">
        <Link to={`/company/talent/${member.id}`} className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
          View profile
        </Link>
      </div>
    </article>
  )
}
