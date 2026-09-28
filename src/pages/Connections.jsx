import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  acceptConnection,
  deleteConnection,
  getConnectionErrorMessage,
  getConnections,
  getIncomingConnectionRequests,
  getSentConnectionRequests,
  rejectConnection,
} from '../api/connectionsApi'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const tabs = [
  { id: 'network', label: 'My Network' },
  { id: 'requests', label: 'Requests' },
  { id: 'sent', label: 'Sent' },
]

function MemberRow({ member, children }) {
  const profile = member?.candidate_profile ?? {}

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-surface-deep font-semibold text-primary">
        {member?.name?.charAt(0)?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-text-primary">{member?.name}</h3>
        <p className="mt-0.5 truncate text-sm text-text-muted">
          {[profile.headline, profile.location].filter(Boolean).join(' · ') || 'LinkPort member'}
        </p>
        <div className="mt-2 flex min-w-0 flex-wrap gap-1">
          {profile.skills?.slice(0, 4).map((skill) => (
            <span key={skill} className="max-w-full break-words rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{skill}</span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Link to={`/member/community/members/${member?.id}`} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary">
          View profile
        </Link>
        {children}
      </div>
    </article>
  )
}

export default function Connections({ embedded = false }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const tab = tabs.some((item) => item.id === requestedTab) ? requestedTab : 'network'
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)

  useEffect(() => {
    let active = true
    const fetcher = tab === 'network'
      ? getConnections
      : tab === 'requests'
        ? getIncomingConnectionRequests
        : getSentConnectionRequests

    fetcher({ per_page: 50 })
      .then((response) => {
        if (active) setItems(response.data ?? [])
      })
      .catch((requestError) => {
        if (active) setError(getConnectionErrorMessage(requestError, 'Unable to load your network.'))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [tab])

  const changeTab = (nextTab) => {
    const nextParams = new URLSearchParams(searchParams)
    if (embedded) nextParams.set('view', 'connections')
    nextParams.set('tab', nextTab)
    setSearchParams(nextParams)
    setItems([])
    setError('')
    setIsLoading(true)
  }

  const act = async (id, action, message) => {
    setWorkingId(id)
    try {
      const response = await action(id)
      showToast(response.message ?? message, 'success')
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (requestError) {
      setError(getConnectionErrorMessage(requestError))
    } finally {
      setWorkingId(null)
    }
  }

  const memberFor = (connection) => (
    connection.requester_id === user?.id ? connection.receiver : connection.requester
  )
  const emptyText = tab === 'network'
    ? 'You have no connections yet.'
    : tab === 'requests'
      ? 'No incoming requests.'
      : 'No pending sent requests.'

  const content = (
    <div className={`min-w-0 ${embedded ? 'space-y-5' : 'mx-auto max-w-5xl space-y-6'}`}>
      {!embedded && (
        <header>
          <p className="font-mono text-sm text-primary">Your people</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">My Network</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">Manage the members you know and connection requests you receive.</p>
        </header>
      )}

      <section aria-labelledby="network-heading">
        <div>
          <h3 id="network-heading" className="text-xl font-semibold text-text-primary">Connections</h3>
          <p className="mt-1 text-sm leading-6 text-text-muted">Manage your network and pending requests.</p>
        </div>

        <div className="mt-5 flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-border bg-surface-deep p-1" role="tablist" aria-label="Connection sections">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => changeTab(item.id)}
              className={`min-w-max flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${tab === item.id ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {error && <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text">{error}</p>}

      {isLoading ? (
        <LoadingSpinner label="Loading your network..." />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-5 py-12 text-center text-sm text-text-muted">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {items.map((connection) => (
            <MemberRow key={connection.id} member={memberFor(connection)}>
              {tab === 'network' && (
                <Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, deleteConnection, 'Connection removed.')}>Remove</Button>
              )}
              {tab === 'requests' && (
                <>
                  <Button size="sm" disabled={workingId === connection.id} onClick={() => act(connection.id, acceptConnection, 'Connection accepted.')}>Accept</Button>
                  <Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, rejectConnection, 'Request rejected.')}>Reject</Button>
                </>
              )}
              {tab === 'sent' && (
                <Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, deleteConnection, 'Request cancelled.')}>Cancel</Button>
              )}
            </MemberRow>
          ))}
        </div>
      )}
    </div>
  )

  if (embedded) return content

  return (
    <DashboardLayout title="My Network" userType="Member">
      {content}
    </DashboardLayout>
  )
}
