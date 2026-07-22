import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  acceptJoinRequest,
  getCircle,
  getCircleErrorMessage,
  getCircleJoinRequests,
  inviteMember,
  rejectJoinRequest,
  removeCircleMember,
  requestToJoinCircle,
} from '../api/circlesApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/candidate/dashboard' },
  { label: 'Member Profile', href: '/candidate/profile' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'My Applications', href: '/candidate/applications' },
  { label: 'Projects', href: '/projects' },
  { label: 'My Bids', href: '/candidate/bids' },
  { label: 'Circles', href: '/circles' },
  { label: 'Logout', href: '/login' },
]

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

function Skills({ skills = [] }) {
  if (skills.length === 0) return <span className="text-sm text-[#64748b]">No skills listed.</span>

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span key={skill} className="rounded-full border border-[#64ffda]/20 bg-[#64ffda]/5 px-3 py-1 font-mono text-xs text-[#64ffda]">
          {skill}
        </span>
      ))}
    </div>
  )
}

function MemberName({ member }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-[#e6f1ff]">{member.name}</p>
      <p className="mt-0.5 truncate text-xs text-[#8892b0]">
        {member.candidate_profile?.headline || member.email}
      </p>
    </div>
  )
}

export default function CircleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [circle, setCircle] = useState(null)
  const [relationship, setRelationship] = useState(null)
  const [joinRequests, setJoinRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  const [inviteeId, setInviteeId] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [processingRequestId, setProcessingRequestId] = useState(null)
  const [removingUserId, setRemovingUserId] = useState(null)

  const loadCircle = useCallback(async () => {
    try {
      const response = await getCircle(id)
      setCircle(response.circle)
      setRelationship(response.relationship)
      setLoadError('')

      if (response.relationship?.can_manage) {
        const requestsResponse = await getCircleJoinRequests(id, {
          status: 'pending',
          per_page: 100,
        })
        setJoinRequests(requestsResponse.data ?? [])
      } else {
        setJoinRequests([])
      }
    } catch (requestError) {
      setLoadError(
        getCircleErrorMessage(requestError, 'Unable to load this circle.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    let isActive = true

    getCircle(id)
      .then(async (response) => {
        if (!isActive) return
        setCircle(response.circle)
        setRelationship(response.relationship)
        setLoadError('')

        if (response.relationship?.can_manage) {
          const requestsResponse = await getCircleJoinRequests(id, {
            status: 'pending',
            per_page: 100,
          })
          if (isActive) setJoinRequests(requestsResponse.data ?? [])
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setLoadError(
            getCircleErrorMessage(requestError, 'Unable to load this circle.'),
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [id])

  const handleJoinRequest = async () => {
    setIsRequesting(true)
    try {
      const response = await requestToJoinCircle(id)
      setRelationship((current) => ({
        ...current,
        has_pending_join_request: true,
        can_request_join: false,
      }))
      showToast(response.message ?? 'Join request sent.', 'success')
    } catch (requestError) {
      showToast(getCircleErrorMessage(requestError, 'Unable to request membership.'), 'error')
    } finally {
      setIsRequesting(false)
    }
  }

  const handleInvite = async (event) => {
    event.preventDefault()
    setIsInviting(true)

    try {
      const response = await inviteMember(id, { invitee_id: Number(inviteeId) })
      setInviteeId('')
      showToast(response.message ?? 'Invitation sent.', 'success')
    } catch (requestError) {
      showToast(getCircleErrorMessage(requestError, 'Unable to invite this member.'), 'error')
    } finally {
      setIsInviting(false)
    }
  }

  const handleJoinDecision = async (joinRequest, decision) => {
    setProcessingRequestId(joinRequest.id)
    try {
      const response = decision === 'accept'
        ? await acceptJoinRequest(joinRequest.id)
        : await rejectJoinRequest(joinRequest.id)

      setJoinRequests((current) => current.filter((item) => item.id !== joinRequest.id))
      if (decision === 'accept') await loadCircle()
      showToast(response.message, 'success')
    } catch (requestError) {
      showToast(
        getCircleErrorMessage(requestError, `Unable to ${decision} this request.`),
        'error',
      )
    } finally {
      setProcessingRequestId(null)
    }
  }

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this circle?`)) return

    setRemovingUserId(member.id)
    try {
      const response = await removeCircleMember(id, member.id)
      setCircle((current) => ({
        ...current,
        members: current.members.filter((item) => item.id !== member.id),
        memberCount: Math.max(0, current.memberCount - 1),
      }))
      showToast(response.message, 'success')
    } catch (requestError) {
      showToast(getCircleErrorMessage(requestError, 'Unable to remove this member.'), 'error')
    } finally {
      setRemovingUserId(null)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Circle Details" navItems={navItems} userType="Member">
        <LoadingSpinner label="Loading circle details..." size="lg" />
      </DashboardLayout>
    )
  }

  if (loadError || !circle) {
    return (
      <DashboardLayout title="Circle Details" navItems={navItems} userType="Member">
        <Card padding="lg" className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-semibold">Circle unavailable</h2>
          <p role="alert" className="mt-3 text-sm text-[#fca5a5]">{loadError}</p>
          <Button className="mt-6" variant="outline" onClick={() => navigate('/circles')}>Back to Circles</Button>
        </Card>
      </DashboardLayout>
    )
  }

  const membershipLabel = relationship?.is_owner
    ? 'Owner'
    : relationship?.is_member
      ? relationship.membership_role === 'admin' ? 'Circle Admin' : 'Member'
      : null

  return (
    <DashboardLayout title="Circle Details" navItems={navItems} userType="Member">
      <div className="space-y-8">
        <button type="button" onClick={() => navigate('/circles')} className="text-sm text-[#8892b0] transition-colors hover:text-[#64ffda]">
          &larr; Back to Circles
        </button>

        <Card padding="lg" className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#64ffda]/5 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#64ffda]">{circle.category || 'Uncategorized'}</span>
                <span className="rounded-full border border-[#233554] px-2.5 py-1 text-[10px] capitalize text-[#8892b0]">{circle.visibility}</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{circle.name}</h1>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#8892b0]">{circle.description || 'No description provided.'}</p>
              <div className="mt-6"><Skills skills={circle.skills} /></div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#8892b0]">
                <span>Owner: <strong className="font-medium text-[#e6f1ff]">{circle.owner?.name}</strong></span>
                <span>{circle.memberCount} {circle.memberCount === 1 ? 'member' : 'members'}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              {membershipLabel && <span className="rounded-lg border border-[#64ffda]/30 bg-[#64ffda]/10 px-4 py-2.5 text-sm font-semibold text-[#64ffda]">{membershipLabel}</span>}
              {!relationship?.is_member && relationship?.has_pending_invitation && (
                <span className="rounded-lg border border-[#233554] px-4 py-2.5 text-sm text-[#8892b0]">Invitation Pending</span>
              )}
              {!relationship?.is_member && relationship?.has_pending_join_request && (
                <Button disabled variant="outline">Request Pending</Button>
              )}
              {relationship?.can_request_join && (
                <Button disabled={isRequesting} onClick={handleJoinRequest}>
                  {isRequesting ? 'Sending...' : 'Request to Join'}
                </Button>
              )}
              {relationship?.can_manage && (
                <>
                  <Button variant="outline" onClick={() => document.getElementById('invite-circle-member')?.scrollIntoView({ behavior: 'smooth' })}>Invite Member</Button>
                  <Button variant="outline" onClick={() => document.getElementById('circle-join-requests')?.scrollIntoView({ behavior: 'smooth' })}>View Join Requests</Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {relationship?.can_manage && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div id="invite-circle-member" className="scroll-mt-24">
              <Card className="h-full">
                <h2 className="text-lg font-semibold">Invite Member</h2>
                <p className="mt-2 text-sm leading-6 text-[#8892b0]">Enter the LinkPort user ID of an active member.</p>
                <form className="mt-5" onSubmit={handleInvite}>
                  <label htmlFor="invitee-id" className="text-sm font-medium">Member user ID</label>
                  <input id="invitee-id" type="number" min="1" required value={inviteeId} onChange={(event) => setInviteeId(event.target.value)} className={inputClasses} />
                  <Button type="submit" className="mt-4 w-full" disabled={isInviting}>
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </form>
              </Card>
            </div>

            <div id="circle-join-requests" className="scroll-mt-24">
              <Card className="h-full">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Join Requests</h2>
                    <p className="mt-1 text-sm text-[#8892b0]">Review pending requests for this circle.</p>
                  </div>
                  <span className="rounded-full bg-[#64ffda]/10 px-3 py-1 text-xs text-[#64ffda]">{joinRequests.length} pending</span>
                </div>
                {joinRequests.length === 0 ? (
                  <div className="mt-5"><EmptyState title="No pending requests" description="New membership requests will appear here." /></div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {joinRequests.map((joinRequest) => (
                      <div key={joinRequest.id} className="flex flex-col gap-4 rounded-lg border border-[#233554] bg-[#0a192f]/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <MemberName member={joinRequest.requester} />
                        <div className="flex shrink-0 gap-2">
                          <Button size="sm" variant="ghost" disabled={processingRequestId === joinRequest.id} onClick={() => handleJoinDecision(joinRequest, 'reject')}>Reject</Button>
                          <Button size="sm" disabled={processingRequestId === joinRequest.id} onClick={() => handleJoinDecision(joinRequest, 'accept')}>
                            {processingRequestId === joinRequest.id ? 'Saving...' : 'Accept'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </section>
        )}

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">Members</h2>
            <p className="mt-1 text-sm text-[#8892b0]">People currently collaborating in this circle.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {circle.members.map((member) => (
              <Card key={member.id} className="flex items-center justify-between gap-4">
                <MemberName member={member} />
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-[#233554] px-2.5 py-1 text-[10px] capitalize text-[#8892b0]">{member.pivot?.role || 'member'}</span>
                  {relationship?.can_manage && member.id !== circle.owner_id && member.id !== user?.id && (
                    <Button size="sm" variant="danger" disabled={removingUserId === member.id} onClick={() => handleRemoveMember(member)}>
                      {removingUserId === member.id ? 'Removing...' : 'Remove'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
