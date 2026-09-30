import { Link } from 'react-router'
import LinkPortLogo from './LinkPortLogo'
import DefaultAvatar from './DefaultAvatar'
import VerifiedBadge from './VerifiedBadge'

const iconPaths = {
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  inbox: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
  spark: <><path d="m12 3-1.4 4.2a5 5 0 0 1-3.2 3.2L3 12l4.4 1.6a5 5 0 0 1 3.2 3.2L12 21l1.4-4.2a5 5 0 0 1 3.2-3.2L21 12l-4.4-1.6a5 5 0 0 1-3.2-3.2L12 3Z" /></>,
  building: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M9 21v-3h6v3" /></>,
  chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /></>,
}

function Ico({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

/** Globe standing in for Facebook's emoji accent. */
function ContextMark({ kind, className = 'h-14 w-14' }) {
  const marks = {
    person: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    company: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M9 21v-3h6v3" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.3a2.5 2.5 0 0 1 4.9.7c0 1.7-2.5 2-2.5 3.5" /><path d="M12 17.2h.01" /></>,
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full border border-primary/25 bg-surface text-primary shadow-sm ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3/5 w-3/5"
      >
        {marks[kind] ?? marks.person}
      </svg>
    </span>
  )
}

/** Floating icons scattered through the panel, like the collage on Facebook. */
function ScatteredIcons() {
  const marks = [
    { name: 'profile', style: 'left-[2%] top-[6%]', size: 'h-11 w-11' },
    { name: 'inbox', style: 'left-[46%] top-[0%]', size: 'h-10 w-10' },
    { name: 'spark', style: 'right-[4%] top-[12%]', size: 'h-12 w-12' },
    { name: 'briefcase', style: 'left-[22%] bottom-[10%]', size: 'h-10 w-10' },
    { name: 'layers', style: 'right-[16%] bottom-[4%]', size: 'h-11 w-11' },
    { name: 'chat', style: 'left-[6%] top-[52%]', size: 'h-10 w-10' },
    { name: 'building', style: 'right-[2%] top-[54%]', size: 'h-10 w-10' },
  ]

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {marks.map((mark) => (
        <span
          key={mark.name}
          className={`absolute flex items-center justify-center rounded-xl border border-border bg-surface text-primary/70 shadow-sm ${mark.style} ${mark.size}`}
        >
          <Ico name={mark.name} className="h-1/2 w-1/2" />
        </span>
      ))}
    </div>
  )
}

/**
 * Illustrative preview of a member profile. The values are placeholders that
 * name the fields; they are not a real account.
 */
function ProfilePreviewCard({ nickname, username, verified, kind = 'person' }) {
  const fallback = kind === 'company' ? 'Your company name' : 'Your nickname'
  const displayName = (nickname || '').trim() || fallback
  const handle = (username || '').trim()

  return (
    <div className="w-[21rem] rounded-2xl border border-border bg-surface p-6 shadow-lg">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
        Your profile
      </p>

      <div className="flex items-center gap-3.5">
        <DefaultAvatar kind={kind} className="h-16 w-16" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-lg font-bold text-text-primary">
            {displayName}
            {verified && <VerifiedBadge className="h-[18px] w-[18px]" />}
          </p>
          <p className="truncate text-sm text-text-muted">
            {handle ? `#${handle}` : '#yourusername'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {['Your field', 'Your skills', 'Your interests'].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
        {['Projects', 'Connections', 'Circles'].map((label) => (
          <div key={label}>
            <p className="text-base font-bold text-text-primary">&mdash;</p>
            <p className="text-[11px] text-text-subtle">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Illustrative preview of a community card. */
function CommunityPreviewCard() {
  return (
    <div className="w-60 rounded-2xl border border-border bg-surface p-5 shadow-lg">
      <div className="flex h-20 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
        <svg viewBox="0 0 120 48" fill="none" className="h-14 w-4/5" aria-hidden="true">
          <g className="text-border-strong" stroke="currentColor" strokeWidth="1.1" opacity="0.7">
            <circle cx="60" cy="24" r="15" />
            <ellipse cx="60" cy="24" rx="6" ry="15" />
            <path d="M45.5 19h29M45.5 29h29" />
          </g>
          <g className="text-primary" stroke="currentColor" strokeWidth="1.1" opacity="0.55">
            <path d="M18 14 60 24 102 14M18 34 60 24 102 34" />
          </g>
          {[[18, 14], [18, 34], [102, 14], [102, 34]].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="7" className="text-surface" fill="currentColor" stroke="none" />
              <g className="text-primary" stroke="currentColor" strokeWidth="1.2">
                <circle cx={cx} cy={cy} r="7" />
                <circle cx={cx} cy={cy - 2} r="2" />
                <path d={`M${cx - 3} ${cy + 3.6}a3 3 0 0 1 6 0`} />
              </g>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-3 text-sm font-bold text-text-primary">A community</p>
      <p className="mt-1 text-xs leading-snug text-text-muted">
        Every field gets its own space to talk, share and hire.
      </p>
    </div>
  )
}

/** Shown on sign-in screens, where a profile preview makes no sense yet. */
function WelcomeBackCard() {
  const rows = [
    { icon: 'chat', title: 'Your communities', body: 'Pick up the threads you follow.' },
    { icon: 'briefcase', title: 'Your applications', body: 'See where each one stands.' },
    { icon: 'inbox', title: 'Your messages', body: 'Replies and invitations waiting.' },
  ]

  return (
    <div className="w-[21rem] rounded-2xl border border-border bg-surface p-6 shadow-lg">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
        Waiting for you
      </p>
      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={row.icon} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <Ico name={row.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-text-primary">{row.title}</span>
              <span className="block text-xs leading-snug text-text-muted">{row.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AuthShowcase({ headline, nickname, username, sticky, variant, verified, mark }) {
  return (
    <section
      aria-hidden="true"
      className={`w-full lg:flex-1 ${sticky ? "lg:sticky lg:top-10 lg:self-start" : ""}`}
    >
      <Link to="/" className="inline-block no-underline" aria-label="LinkPort home">
        <LinkPortLogo className="h-14 w-auto sm:h-16" />
      </Link>

      <h2 className="mt-8 max-w-xl text-[2rem] font-bold leading-tight tracking-tight text-text-primary sm:text-[2.9rem]">
        {headline}
      </h2>

      <div className="relative mt-10 hidden min-h-[22rem] lg:block">
        <ScatteredIcons />

        <div className="relative flex items-center justify-center gap-5 pt-6">
          {variant === 'signin'
            ? <WelcomeBackCard />
            : <ProfilePreviewCard nickname={nickname} username={username} verified={verified} kind={mark === 'company' ? 'company' : 'person'} />}
          <div className="flex flex-col items-center gap-4">
            <ContextMark kind={mark} />
            <CommunityPreviewCard />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AuthLayout({
  children,
  headline = 'Explore your interests.',
  nickname = '',
  username = '',
  wide = false,
  variant = 'signup',
  verified = false,
  mark = 'person',
}) {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className={`mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:gap-0 ${wide ? "lg:items-start" : "lg:items-center"}`}>
        <AuthShowcase
          headline={headline}
          nickname={nickname}
          username={username}
          sticky={wide}
          variant={variant}
          verified={verified}
          mark={mark}
        />

        <div aria-hidden="true" className="hidden w-px self-stretch bg-border lg:block" />

        <div className={`w-full lg:shrink-0 lg:pl-14 ${wide ? 'lg:w-[36rem]' : 'lg:w-[28rem]'}`}>
          {children}
        </div>
      </div>
    </main>
  )
}
