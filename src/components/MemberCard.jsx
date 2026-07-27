import { Link } from 'react-router'

const statusClasses = {
  'Not actively looking': 'border-[#64748b]/30 bg-[#64748b]/10 text-[#a8b2d1]',
  'Looking for internship': 'border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#c4b5fd]',
}

export default function MemberCard({ member }) {
  const visibleSkills = member.skills.slice(0, 3)
  const remainingSkills = Math.max(0, member.skills.length - visibleSkills.length)
  const statusClass = statusClasses[member.collaborationStatus]
    ?? 'border-[#64ffda]/25 bg-[#64ffda]/5 text-[#64ffda]'

  return (
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#64ffda]/30 bg-[#0a192f] font-mono text-xs font-semibold text-[#64ffda]">
          {member.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-semibold text-[#e6f1ff]">{member.name}</h3>
          <p className="mt-1 break-words text-sm leading-5 text-[#a8b2d1]">{member.headline}</p>
          {member.university && <p className="mt-1 break-words text-xs text-[#64748b]">{member.university}</p>}
        </div>
      </div>

      <span className={`mt-4 w-fit max-w-full break-words rounded-full border px-2.5 py-1 text-xs ${statusClass}`}>
        {member.collaborationStatus}
      </span>

      <div className="mt-4 flex min-w-0 flex-wrap gap-2">
        {visibleSkills.map((skill) => (
          <span key={skill} className="max-w-full break-words rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#8892b0]">{skill}</span>
        ))}
        {remainingSkills > 0 && <span className="rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#64748b]">+{remainingSkills}</span>}
      </div>

      <div className="mt-auto pt-5">
        <Link
          to={`/candidate/community/members/${member.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] transition-colors hover:bg-[#64ffda]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"
        >
          View profile
        </Link>
      </div>
    </article>
  )
}
