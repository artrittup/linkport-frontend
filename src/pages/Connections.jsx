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

const navItems = [
  { label: 'Dashboard', href: '/candidate/dashboard' },
  { label: 'Profile', href: '/candidate/profile' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Applications', href: '/candidate/applications' },
  { label: 'Projects', href: '/projects' },
  { label: 'Bids', href: '/candidate/bids' },
  { label: 'My Network', href: '/connections' },
  { label: 'Circles', href: '/circles' },
  { label: 'Logout', href: '/login' },
]

const tabs = [
  { id: 'network', label: 'My Network' },
  { id: 'requests', label: 'Requests' },
  { id: 'sent', label: 'Sent' },
]

function MemberRow({ member, children }) {
  const profile = member?.candidate_profile ?? {}
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-[#233554] bg-[#112240] p-4 sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#64ffda]/30 bg-[#071426] font-semibold text-[#64ffda]">{member?.name?.charAt(0)?.toUpperCase()}</div>
      <div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-[#e6f1ff]">{member?.name}</h3><p className="mt-0.5 truncate text-sm text-[#8892b0]">{[profile.headline, profile.location].filter(Boolean).join(' · ') || 'LinkPort member'}</p><div className="mt-2 flex flex-wrap gap-1">{profile.skills?.slice(0, 4).map((skill) => <span key={skill} className="rounded-full bg-[#64ffda]/10 px-2 py-0.5 text-[10px] text-[#64ffda]">{skill}</span>)}</div></div>
      <div className="flex shrink-0 flex-wrap items-center gap-2"><Link to={`/members/${member?.id}`} className="rounded-lg border border-[#233554] px-3 py-2 text-xs font-semibold text-[#e6f1ff] transition-colors hover:border-[#64ffda] hover:text-[#64ffda]">View Profile</Link>{children}</div>
    </article>
  )
}

export default function Connections() {
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
    <DashboardLayout title="My Network" navItems={navItems} userType="Member">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><p className="font-mono text-sm text-[#64ffda]">Connections</p><h2 className="mt-2 text-3xl font-bold text-[#e6f1ff]">My Network</h2><p className="mt-2 text-[#8892b0]">Manage the members you know and connection requests you receive.</p></div>
        <div className="flex gap-1 rounded-xl border border-[#233554] bg-[#071426] p-1" role="tablist">
          {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => changeTab(item.id)} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${tab === item.id ? 'bg-[#112240] text-[#64ffda]' : 'text-[#8892b0] hover:text-[#e6f1ff]'}`}>{item.label}</button>)}
        </div>
        {error && <p role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
        {isLoading ? <LoadingSpinner label="Loading your network..." /> : items.length === 0 ? <div className="rounded-xl border border-dashed border-[#233554] bg-[#112240]/50 px-5 py-12 text-center text-sm text-[#8892b0]">{emptyText}</div> : (
          <div className="space-y-3">{items.map((connection) => <MemberRow key={connection.id} member={memberFor(connection)}>{tab === 'network' && <Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, deleteConnection, 'Connection removed.')}>Remove</Button>}{tab === 'requests' && <><Button size="sm" disabled={workingId === connection.id} onClick={() => act(connection.id, acceptConnection, 'Connection accepted.')}>Accept</Button><Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, rejectConnection, 'Request rejected.')}>Reject</Button></>}{tab === 'sent' && <Button size="sm" variant="ghost" disabled={workingId === connection.id} onClick={() => act(connection.id, deleteConnection, 'Request cancelled.')}>Cancel</Button>}</MemberRow>)}</div>
        )}
      </div>
    </DashboardLayout>
  )
}
