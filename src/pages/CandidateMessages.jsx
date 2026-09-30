import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  acceptMessageRequest,
  declineMessageRequest,
  getMemberConversation,
  getMemberMessageError,
  sendMemberMessage,
  startMemberConversation,
} from '../api/memberMessagesApi'
import { getCommunityMember } from '../api/communityMembersApi'
import Connections from './Connections'
import LoadingSpinner from '../components/LoadingSpinner'
import useMemberConversations from '../hooks/useMemberConversations'
import CandidateLayout from '../layouts/CandidateLayout'

function MessageIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  )
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function requestLabel(conversation) {
  if (conversation.status === 'declined') return 'Closed'
  if (conversation.status !== 'pending') return ''
  return conversation.isInitiator ? 'Waiting' : 'Request'
}

function ConversationList({ conversations, query, onQueryChange, selectedId, onSelect }) {
  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return conversations
    return conversations.filter((conversation) => [
      conversation.otherMember.name,
      conversation.otherMember.headline,
      conversation.lastMessage?.body,
    ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery)))
  }, [conversations, query])

  return (
    <aside className="min-w-0 border-b border-border bg-surface/45 md:border-b-0 md:border-r" aria-label="Conversation list">
      <div className="border-b border-border p-4">
        <label htmlFor="message-search" className="sr-only">Search conversations</label>
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input id="message-search" type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search conversations..." className="w-full min-w-0 rounded-xl border border-border bg-background/70 py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
        </div>
      </div>

      <div className="min-h-48 p-3 md:min-h-[32rem]" aria-live="polite">
        {visibleConversations.length > 0 ? (
          <div className="space-y-1">
            {visibleConversations.map((conversation) => {
              const label = requestLabel(conversation)
              return (
                <button key={conversation.id} type="button" onClick={() => onSelect(conversation.id)} className={`w-full min-w-0 rounded-xl px-3 py-3 text-left transition-colors ${selectedId === conversation.id ? 'bg-primary/10 text-primary' : 'hover:bg-surface-elevated'}`}>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{conversation.otherMember.name}</p>
                    {label && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">{label}</span>}
                  </div>
                  <p className="mt-1 truncate text-xs text-text-muted">{conversation.lastMessage?.body || 'No messages yet'}</p>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-44 flex-col items-center justify-center px-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><MessageIcon className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-semibold text-text-primary">{query ? 'No conversations found' : 'No conversations yet'}</p>
            <p className="mt-1 max-w-56 text-xs leading-5 text-text-muted">{query ? 'Try a different member name.' : 'Message a connection or send one respectful request to another member.'}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

function MessageComposer({ value, onChange, onSubmit, isWorking, label = 'Send message', hint }) {
  return (
    <form onSubmit={onSubmit} className="border-t border-border bg-surface/60 p-4">
      <label htmlFor="message-body" className="sr-only">Message</label>
      <textarea id="message-body" value={value} onChange={(event) => onChange(event.target.value)} rows={3} maxLength={2000} required placeholder="Write a message..." className="w-full resize-none rounded-xl border border-border bg-background/70 px-4 py-3 text-sm leading-6 text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-subtle">{hint || `${value.length}/2000 characters`}</p>
        <button type="submit" disabled={isWorking || !value.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">{isWorking ? 'Sending...' : label}</button>
      </div>
    </form>
  )
}

function NewConversationPane({ member, body, onBodyChange, onSubmit, isWorking, error }) {
  if (!member) {
    return error ? (
      <section className="flex min-h-[32rem] items-center justify-center bg-background/25 p-6 text-center">
        <div><p role="alert" className="text-sm text-danger-text">{error}</p><Link to="/member/community/members" className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-hover">Return to members</Link></div>
      </section>
    ) : <LoadingSpinner label="Loading member..." />
  }
  return (
    <section className="flex min-h-[32rem] min-w-0 flex-col bg-background/25" aria-label={`New message to ${member.name}`}>
      <header className="border-b border-border bg-surface/45 px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">New message</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="min-w-0"><h3 className="truncate font-semibold text-text-primary">{member.name}</h3><p className="truncate text-sm text-text-muted">{member.headline || 'LinkPort member'}</p></div>
          <Link to={`/member/community/members/${member.id}`} className="shrink-0 text-sm font-semibold text-primary hover:text-primary-hover">View profile</Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
        <div className="max-w-md">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MessageIcon /></span>
          <h4 className="mt-4 text-lg font-semibold text-text-primary">Start a respectful conversation</h4>
          <p className="mt-2 text-sm leading-6 text-text-muted">Connections can message normally. If you are not connected, this sends one message request. You cannot send another message unless {member.name} accepts it.</p>
          {error && <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text">{error}</p>}
        </div>
      </div>
      <MessageComposer value={body} onChange={onBodyChange} onSubmit={onSubmit} isWorking={isWorking} label="Send first message" />
    </section>
  )
}

function ConversationPane({ conversation, isLoading, error, body, onBodyChange, onSend, isWorking, onAccept, onDecline }) {
  if (isLoading) return <LoadingSpinner label="Loading conversation..." />
  if (!conversation) {
    return (
      <section className="flex min-h-72 min-w-0 flex-col items-center justify-center bg-background/25 px-6 py-12 text-center md:min-h-[32rem]" aria-label="No active conversation">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary"><MessageIcon /></span>
        <h3 className="mt-5 text-xl font-semibold text-text-primary">Choose someone to message</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">Open an existing conversation, message someone from your Connections tab, or find a member in Community.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/member/messages?view=connections" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover">Message a connection</Link><Link to="/member/community/members" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-primary/50 hover:text-primary">Discover members</Link></div>
      </section>
    )
  }

  return (
    <section className="flex min-h-[32rem] min-w-0 flex-col bg-background/25" aria-label={`Conversation with ${conversation.otherMember.name}`}>
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/45 px-5 py-4 sm:px-6">
        <div className="min-w-0"><h3 className="truncate font-semibold text-text-primary">{conversation.otherMember.name}</h3><p className="truncate text-sm text-text-muted">{conversation.otherMember.headline || conversation.otherMember.location || 'LinkPort member'}</p></div>
        <Link to={`/member/community/members/${conversation.otherMember.id}`} className="shrink-0 text-sm font-semibold text-primary hover:text-primary-hover">View profile</Link>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
        {conversation.messages.map((message) => (
          <article key={message.id} className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.isMine ? 'rounded-br-md bg-primary text-primary-contrast' : 'rounded-bl-md border border-border bg-surface text-text-primary'}`}>
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
              <time className={`mt-1 block text-[10px] ${message.isMine ? 'text-primary-contrast/70' : 'text-text-subtle'}`}>{formatTime(message.createdAt)}</time>
            </div>
          </article>
        ))}
      </div>

      {error && <p role="alert" className="mx-4 mb-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text sm:mx-6">{error}</p>}

      {conversation.canRespondToRequest ? (
        <div className="border-t border-border bg-primary/5 p-5 sm:p-6">
          <h4 className="font-semibold text-text-primary">Message request</h4>
          <p className="mt-1 text-sm leading-6 text-text-muted">Accept to reply and continue this conversation, or decline to close it.</p>
          <div className="mt-4 flex gap-3"><button type="button" onClick={onAccept} disabled={isWorking} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast hover:bg-primary-hover disabled:opacity-50">Accept and reply</button><button type="button" onClick={onDecline} disabled={isWorking} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-danger/50 hover:text-danger-text disabled:opacity-50">Decline</button></div>
        </div>
      ) : conversation.status === 'pending' ? (
        <div className="border-t border-border bg-warning/5 px-5 py-4 text-sm text-warning-text">Your one-message request is waiting for {conversation.otherMember.name} to respond.</div>
      ) : conversation.status === 'declined' ? (
        <div className="border-t border-border bg-surface/60 px-5 py-4 text-sm text-text-muted">This message request was declined, so the conversation is closed.</div>
      ) : (
        <MessageComposer value={body} onChange={onBodyChange} onSubmit={onSend} isWorking={isWorking} />
      )}
    </section>
  )
}

export default function CandidateMessages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeView = searchParams.get('view') === 'connections' ? 'connections' : 'inbox'
  const requestedMemberId = searchParams.get('member')
  const { conversations, isLoading, error, retry, upsertConversation } = useMemberConversations()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [targetMember, setTargetMember] = useState(null)
  const [body, setBody] = useState('')
  const [paneError, setPaneError] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  const requestedConversation = useMemo(
    () => requestedMemberId
      ? conversations.find((item) => item.otherMember.id === String(requestedMemberId)) ?? null
      : null,
    [conversations, requestedMemberId],
  )
  const activeConversationId = requestedMemberId
    ? requestedConversation?.id ?? null
    : selectedId ?? conversations[0]?.id ?? null
  const activeConversation = conversation?.id === activeConversationId ? conversation : null
  const validTargetMember = targetMember?.id === String(requestedMemberId) ? targetMember : null

  useEffect(() => {
    if (isLoading || activeView !== 'inbox' || !requestedMemberId || requestedConversation) return undefined
    let active = true
    getCommunityMember(requestedMemberId)
      .then((response) => {
        if (!active) return
        setTargetMember(response.data)
        setPaneError('')
      })
      .catch((requestError) => {
        if (active) setPaneError(getMemberMessageError(requestError, 'This member is unavailable.'))
      })
    return () => { active = false }
  }, [activeView, isLoading, requestedConversation, requestedMemberId])

  useEffect(() => {
    if (!activeConversationId) return undefined
    let active = true
    getMemberConversation(activeConversationId)
      .then((data) => {
        if (!active) return
        setConversation(data)
        setPaneError('')
      })
      .catch((requestError) => {
        if (active) setPaneError(getMemberMessageError(requestError, 'Unable to load this conversation.'))
      })
    return () => { active = false }
  }, [activeConversationId])

  const clearMemberParam = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('member')
    next.delete('view')
    setSearchParams(next, { replace: true })
  }

  const selectConversation = (id) => {
    clearMemberParam()
    setTargetMember(null)
    setBody('')
    setSelectedId(id)
  }

  const run = async (action) => {
    setIsWorking(true)
    setPaneError('')
    try { return await action() }
    catch (requestError) {
      setPaneError(getMemberMessageError(requestError))
      return null
    } finally { setIsWorking(false) }
  }

  const startConversation = async (event) => {
    event.preventDefault()
    const result = await run(() => startMemberConversation(targetMember.id, body.trim()))
    if (!result?.conversation) return
    upsertConversation(result.conversation)
    setConversation(result.conversation)
    setSelectedId(result.conversation.id)
    setTargetMember(null)
    setBody('')
    clearMemberParam()
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    const result = await run(() => sendMemberMessage(conversation.id, body.trim()))
    if (!result) return
    setBody('')
    const refreshed = await getMemberConversation(conversation.id)
    setConversation(refreshed)
    upsertConversation(refreshed)
  }

  const decideRequest = async (accept) => {
    const result = await run(() => accept ? acceptMessageRequest(conversation.id) : declineMessageRequest(conversation.id))
    if (!result?.conversation) return
    setConversation(result.conversation)
    upsertConversation(result.conversation)
  }

  return (
    <CandidateLayout title="Messages">
      <div className="min-w-0 max-w-full">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-primary">Stay connected</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {activeView === 'connections' ? 'Friends' : 'Messages'}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted sm:text-base">
              {activeView === 'connections'
                ? 'People you are connected with, and the requests waiting on you.'
                : 'Chat with your connections or send one message request to someone new.'}
            </p>
          </div>
          <Link to="/member/community/members" className="inline-flex w-fit rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">Find someone to message</Link>
        </header>

        {activeView === 'connections' ? (
          <div className="mt-8 min-w-0"><Connections embedded /></div>
        ) : (
          <div className="mt-8 min-w-0">
            {error && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text"><span>{error}</span><button type="button" onClick={retry} className="font-semibold">Try again</button></div>}
            {isLoading ? <LoadingSpinner label="Loading conversations..." /> : (
              <div className="grid min-w-0 overflow-hidden rounded-2xl border border-border bg-surface/60 md:grid-cols-[minmax(16rem,0.38fr)_minmax(0,1fr)]">
                <ConversationList conversations={conversations} query={query} onQueryChange={setQuery} selectedId={activeConversationId} onSelect={selectConversation} />
                {requestedMemberId && !requestedConversation ? (
                  <NewConversationPane member={validTargetMember} body={body} onBodyChange={setBody} onSubmit={startConversation} isWorking={isWorking} error={paneError} />
                ) : (
                  <ConversationPane conversation={activeConversation} isLoading={Boolean(activeConversationId) && !activeConversation && !paneError} error={paneError} body={body} onBodyChange={setBody} onSend={sendMessage} isWorking={isWorking} onAccept={() => decideRequest(true)} onDecline={() => decideRequest(false)} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </CandidateLayout>
  )
}
