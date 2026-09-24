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
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-surface-deep font-semibold text-primary">{member?.name?.charAt(0)?.toUpperCase()}</div>
      <div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-text-primary">{member?.name}</h3><p className="mt-0.5 truncate text-sm text-text-muted">{[profile.headline, profile.location].filter(Boolean).join(' · ') || 'LinkPort member'}</p><div className="mt-2 flex flex-wrap gap-1">{profile.skills?.slice(0, 4).map((skill) => <span key={skill} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{skill}</span>)}</div></div>
      <div className="flex shrink-0 flex-wrap items-center gap-2"><Link to={`/members/${member?.id}`} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary">View Profile</Link>{children}</div>
    </article>
  )
}

export default function Connections({ messagesMode = false }) {
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
    const fetcher = tab === 'network' ? getConnections : tab === 'requests' ? getIncomingConnectionRequests : getSentConnectionRequests

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

    return () => { active = false }
  }, [tab])

  const changeTab = (nextTab) => {
    const nextParams = new URLSearchParams(searchParams)
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

  const memberFor = (connection) => connection.requester_id === user?.id ? connection.receiver : connection.requester
  const emptyText = tab === 'network' ? 'You have no connections yet.' : tab === 'requests' ? 'No incoming requests.' : 'No pending sent requests.'

  return (
    <DashboardLayout title={messagesMode ? 'Messages' : 'My Network'} userType="Member">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">{messagesMode ? 'Messages' : 'My Network'}</h2>
          <p className="mt-2 text-text-muted">{messagesMode ? 'Your conversations and member connections live together here.' : 'Manage the members you know and connection requests you receive.'}</p>
        </div>
        {messagesMode && (
          <section className="rounded-2xl border border-border bg-surface/60 p-6" aria-labelledby="inbox-heading">
            <h3 id="inbox-heading" className="text-xl font-semibold text-text-primary">Inbox</h3>
            <div className="mt-4 rounded-xl border border-dashed border-border bg-background/45 px-5 py-10 text-center">
              <p className="font-medium text-text-primary">No conversations yet</p>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-muted">Direct conversations will appear here when messaging is available. You can manage your network and connection requests below.</p>
            </div>
          </section>
        )}
        {messagesMode && <div><h3 className="text-xl font-semibold text-text-primary">Your network</h3><p className="mt-1 text-sm text-text-muted">Connections are the people you will be able to message.</p></div>}
        <div className="flex gap-1 rounded-xl border border-border bg-surface-deep p-1" role="tablist">
          {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => changeTab(item.id)} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${tab === item.id ? 'bg-surface text-primary' : 'text-text-muted hover:text-text-primary'}`}>{item.label}</button>)}
        </div>
        {error && <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text">{error}</p>}
        {isLoading ? <LoadingSpinner label="Loading your network..." /> : items.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-surface/50 px-5 py-12 text-center text-sm text-text-muted">{emptyText}</div> : (
          <div className="space-y-3">{items.map((connection) => <MemberRow key={connection.id} member={memberFor(connection)}>{tab === 'network' && <Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, deleteConnection, 'Connection removed.')}>Remove</Button>}{tab === 'requests' && <><Button size="sm" disabled={workingId === connection.id} onClick={() => act(connection.id, acceptConnection, 'Connection accepted.')}>Accept</Button><Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, rejectConnection, 'Request rejected.')}>Reject</Button></>}{tab === 'sent' && <Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, deleteConnection, 'Request cancelled.')}>Cancel</Button>}</MemberRow>)}</div>
        )}
      </div>
    </DashboardLayout>
  )
}
