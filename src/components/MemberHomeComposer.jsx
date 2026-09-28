import { Link } from 'react-router'

const actions = [
  {
    label: 'Post',
    description: 'Share an update',
    path: '/member/create/post',
    icon: <path d="M5 19h14M7 16 17.5 5.5a2.1 2.1 0 0 1 3 3L10 19H7v-3Z" />,
  },
  {
    label: 'Project',
    description: 'Show what you’re building',
    path: '/member/create/project',
    icon: <path d="M4 7h6l2 2h8v10H4V7Zm0 4h16" />,
  },
  {
    label: 'Question',
    description: 'Start a discussion',
    path: '/member/create/post?category=question',
    icon: <path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1 .7-1.7 1.2-1.7 2.3M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  },
  {
    label: 'Showcase',
    description: 'Share finished work',
    path: '/member/create/post?category=showcase',
    icon: <path d="m12 3 2.2 4.5L19 8.2l-3.5 3.4.8 4.8L12 14.1l-4.3 2.3.8-4.8L5 8.2l4.8-.7L12 3Z" />,
  },
]

function getInitials(name) {
  return (name || 'LP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function MemberHomeComposer({ memberName }) {
  return (
    <section aria-label="Create a community update" className="mt-7 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm shadow-slate-200/50 dark:shadow-black/10">
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono text-sm font-bold text-primary">
          {getInitials(memberName)}
        </div>
        <Link
          to="/member/create/post"
          className="min-w-0 flex-1 rounded-full border border-border bg-background/70 px-5 py-3 text-left text-sm text-text-muted transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          Share something with the community...
        </Link>
      </div>

      <div className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
        {actions.map((action, index) => (
          <Link
            key={action.label}
            to={action.path}
            className={`group flex min-w-0 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-primary/5 focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring ${index % 2 ? 'border-l border-border' : ''} ${index > 1 ? 'border-t border-border sm:border-t-0' : ''} ${index > 0 ? 'sm:border-l sm:border-border' : ''}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-contrast">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                {action.icon}
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-text-primary">{action.label}</span>
              <span className="hidden truncate text-xs text-text-subtle lg:block">{action.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
