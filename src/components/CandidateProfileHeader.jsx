import Button from './Button'

function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center rounded-lg border border-[#233554] px-3 py-2 text-sm font-medium text-[#a8b2d1] transition-colors hover:border-[#64ffda]/50 hover:text-[#64ffda]"
    >
      {children}
    </a>
  )
}

export default function CandidateProfileHeader({ profile, isOwner = false, onEdit }) {
  const displayName = profile.fullName || 'LinkPort member'
  const organization = profile.education?.split(/\r?\n/).find(Boolean)
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const externalLinks = [
    { label: 'Portfolio', href: profile.portfolioLink },
    { label: 'GitHub', href: profile.githubUrl },
    { label: 'LinkedIn', href: profile.linkedinUrl },
  ].filter((link) => link.href)

  return (
    <header className="min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 sm:p-7">
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-[#64ffda]/35 bg-[#0a192f] font-mono text-xl font-bold text-[#64ffda]">
          {initials || 'LP'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-bold text-[#e6f1ff] sm:text-3xl">{displayName}</h2>
              {profile.professionalTitle && <p className="mt-1 break-words text-[#64ffda]">{profile.professionalTitle}</p>}
              {(organization || profile.location) && (
                <p className="mt-2 break-words text-sm text-[#8892b0]">
                  {[organization, profile.location].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            {isOwner && <Button variant="outline" onClick={onEdit}>Edit profile</Button>}
          </div>

          <p className="mt-5 max-w-3xl whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">
            {profile.bio || 'Add a short biography to introduce your work and interests.'}
          </p>

          {externalLinks.length > 0 && (
            <div className="mt-5 flex min-w-0 flex-wrap gap-2">
              {externalLinks.map((link) => <ExternalLink key={link.label} href={link.href}>{link.label}</ExternalLink>)}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
