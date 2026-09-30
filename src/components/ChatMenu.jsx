import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { getMemberConversations } from '../api/memberMessagesApi'

/** Chat bubble drawn exactly like the bell beside it. */
function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.2 9.6 9.6 0 0 1-2.6-.4L4 21l1.4-4.1A8 8 0 0 1 3 11.5C3 7 7 3.3 12 3.3s9 3.7 9 8.2Z" />
    </svg>
  )
}

export default function ChatMenu() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState({ loading: true, conversations: [], available: true })
  const [unread, setUnread] = useState(0)
  const boxRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const close = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Load once on mount so the unread badge shows without opening the panel.
  useEffect(() => {
    let active = true

    getMemberConversations()
      .then((response) => {
        if (!active) return
        const conversations = response.data ?? []
        setState({
          loading: false,
          conversations,
          available: response.backendAvailable !== false,
        })
        setUnread(conversations.filter((item) => item.unread).length)
      })
      .catch(() => {
        if (active) setState({ loading: false, conversations: [], available: false })
      })

    return () => { active = false }
  }, [])

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Messages"
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
          open
            ? 'bg-surface text-primary'
            : 'text-text-muted hover:bg-surface hover:text-primary'
        }`}
      >
        <ChatIcon />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surface bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Messages"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-base font-bold text-text-primary">Messages</p>
            <Link
              to="/member/messages"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary no-underline hover:underline"
            >
              See all
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {state.loading && (
              <p className="px-4 py-6 text-sm text-text-muted">Loading...</p>
            )}

            {!state.loading && state.conversations.length === 0 && (
              <div className="px-4 py-6">
                <p className="text-sm text-text-secondary">No conversations yet.</p>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {state.available
                    ? 'Messages you send and receive will show up here.'
                    : 'Messaging is not switched on yet. It will appear here once the API is live.'}
                </p>
              </div>
            )}

            {!state.loading && state.conversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/member/messages/${conversation.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors hover:bg-surface-muted"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-text-primary">
                    {conversation.title}
                  </span>
                  <span className="block truncate text-xs text-text-muted">
                    {conversation.preview}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
