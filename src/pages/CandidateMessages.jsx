import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Connections from './Connections'
import LoadingSpinner from '../components/LoadingSpinner'
import SectionTabs from '../components/SectionTabs'
import useMemberConversations from '../hooks/useMemberConversations'
import CandidateLayout from '../layouts/CandidateLayout'

const MESSAGE_VIEWS = [
  { id: 'inbox', label: 'Inbox', path: '/member/messages' },
  { id: 'connections', label: 'Connections', path: '/member/messages?view=connections' },
]

function MessageIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  )
}

function ConversationList({ conversations, query, onQueryChange, selectedId, onSelect }) {
  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return conversations
    return conversations.filter((conversation) => [
      conversation.title,
      conversation.preview,
      conversation.type,
    ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery)))
  }, [conversations, query])

  return (
    <aside className="min-w-0 border-b border-border bg-surface/45 md:border-b-0 md:border-r" aria-label="Conversation list">
      <div className="border-b border-border p-4">
        <label htmlFor="message-search" className="sr-only">Search conversations</label>
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input
            id="message-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search conversations..."
            className="w-full min-w-0 rounded-xl border border-border bg-background/70 py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
          />
        </div>
      </div>

      <div className="min-h-48 p-3 md:min-h-[27rem]" aria-live="polite">
        {visibleConversations.length > 0 ? (
          <div className="space-y-1">
            {visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`w-full min-w-0 rounded-xl px-3 py-3 text-left transition-colors ${selectedId === conversation.id ? 'bg-primary/10 text-primary' : 'hover:bg-surface-elevated'}`}
              >
                <p className="truncate text-sm font-semibold">{conversation.title}</p>
                <p className="mt-1 truncate text-xs text-text-muted">{conversation.preview}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-40 flex-col items-center justify-center px-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><MessageIcon className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-semibold text-text-primary">{query ? 'No conversations found' : 'No conversations yet'}</p>
            <p className="mt-1 max-w-56 text-xs leading-5 text-text-muted">{query ? 'Try a different name or topic.' : 'New conversations will appear here when messaging becomes available.'}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

function ConversationPane({ conversation }) {
  if (conversation) {
    return (
      <section className="min-w-0 bg-background/25 p-5 sm:p-7" aria-label={conversation.title}>
        <h3 className="font-semibold text-text-primary">{conversation.title}</h3>
        <p className="mt-2 text-sm text-text-muted">Conversation history will appear here.</p>
      </section>
    )
  }

  return (
    <section className="flex min-h-72 min-w-0 flex-col items-center justify-center bg-background/25 px-6 py-12 text-center md:min-h-[32rem]" aria-label="No active conversation">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary"><MessageIcon /></span>
      <h3 className="mt-5 text-xl font-semibold text-text-primary">Your messages will live here</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
        LinkPort messaging is being prepared for direct member conversations, project discussions, and Circle conversations.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Planned conversation types">
        {['Direct messages', 'Project conversations', 'Circle conversations'].map((label) => (
          <span key={label} className="rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs font-medium text-text-secondary">{label}</span>
        ))}
      </div>
      <Link to="/member/community/members" className="mt-6 inline-flex rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
        Discover members
      </Link>
    </section>
  )
}

export default function CandidateMessages() {
  const [searchParams] = useSearchParams()
  const activeView = searchParams.get('view') === 'connections' ? 'connections' : 'inbox'
  const { conversations, isLoading, error } = useMemberConversations()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId)

  return (
    <CandidateLayout title="Messages">
      <div className="min-w-0 max-w-full">
        <header>
          <p className="font-mono text-sm text-primary">Stay connected</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Messages</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted sm:text-base">
            Keep member, project, and Circle conversations organized in one place.
          </p>
        </header>

        <SectionTabs items={MESSAGE_VIEWS} activeId={activeView} label="Message sections" className="mt-7" />

        {activeView === 'connections' ? (
          <div className="mt-8 min-w-0"><Connections embedded /></div>
        ) : (
          <div className="mt-8 min-w-0">
            {error && <p role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text">{error}</p>}
            {isLoading ? (
              <LoadingSpinner label="Loading conversations..." />
            ) : (
              <div className="grid min-w-0 overflow-hidden rounded-2xl border border-border bg-surface/60 md:grid-cols-[minmax(16rem,0.38fr)_minmax(0,1fr)]">
                <ConversationList
                  conversations={conversations}
                  query={query}
                  onQueryChange={setQuery}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
                <ConversationPane conversation={selectedConversation} />
              </div>
            )}
          </div>
        )}
      </div>
    </CandidateLayout>
  )
}
