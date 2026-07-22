import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  acceptInvitation,
  createCircle,
  getCircleErrorMessage,
  getCircles,
  getMyCircleInvitations,
  getMyCircleJoinRequests,
  getMyCircles,
  rejectInvitation,
  requestToJoinCircle,
} from '../api/circlesApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import SkillsInput from '../components/SkillsInput'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const emptyForm = {
  name: '',
  description: '',
  category: '',
  visibility: 'public',
}

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

async function fetchCircleData() {
  const [mineResponse, publicResponse, invitationResponse, joinRequestResponse] = await Promise.all([
    getMyCircles({ per_page: 100 }),
    getCircles({ per_page: 100 }),
    getMyCircleInvitations({ status: 'pending', per_page: 100 }),
    getMyCircleJoinRequests({ status: 'pending', per_page: 100 }),
  ])

  return {
    myCircles: mineResponse.data,
    publicCircles: publicResponse.data,
    invitations: invitationResponse.data,
    joinRequests: joinRequestResponse.data,
  }
}

function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-[#8892b0]">{description}</p>
    </div>
  )
}

function SkillBadges({ skills }) {
  if (skills.length === 0) {
    return <p className="text-xs text-[#64748b]">No skills listed.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span key={skill} className="rounded-full border border-[#64ffda]/20 bg-[#64ffda]/5 px-2.5 py-1 font-mono text-[10px] text-[#64ffda]">
          {skill}
        </span>
      ))}
    </div>
  )
}

function CircleCard({ circle, onView, action }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onView()
    }
  }

  return (
    <div
      className="h-full cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"
      onClick={onView}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex="0"
    >
      <Card hover className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64ffda]">
            {circle.category || 'Uncategorized'}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#e6f1ff]">{circle.name}</h3>
        </div>
        <span className="shrink-0 rounded-full border border-[#233554] px-2.5 py-1 text-[10px] capitalize text-[#8892b0]">
          {circle.visibility}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-[#8892b0]">
        {circle.description || 'No description provided.'}
      </p>
      <div className="mt-5"><SkillBadges skills={circle.skills} /></div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#233554] pt-4">
        <span className="text-xs text-[#8892b0]">{circle.memberCount} members</span>
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          {action}
          <Button size="sm" variant="outline" onClick={onView}>View Circle</Button>
        </div>
      </div>
      </Card>
    </div>
  )
}

export default function Circles() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const circleTab = searchParams.get('tab') === 'invitations' ? 'invitations' : 'overview'
  const [myCircles, setMyCircles] = useState([])
  const [publicCircles, setPublicCircles] = useState([])
  const [invitations, setInvitations] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [processingInvitationId, setProcessingInvitationId] = useState(null)
  const [requestingCircleId, setRequestingCircleId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [skills, setSkills] = useState([])

  const loadData = useCallback(async () => {
    try {
      const data = await fetchCircleData()

      setMyCircles(data.myCircles)
      setPublicCircles(data.publicCircles)
      setInvitations(data.invitations)
      setJoinRequests(data.joinRequests)
      setLoadError('')
    } catch (requestError) {
      setLoadError(
        getCircleErrorMessage(
          requestError,
          'Unable to load circles. Please try again.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    fetchCircleData()
      .then((data) => {
        if (!isActive) return
        setMyCircles(data.myCircles)
        setPublicCircles(data.publicCircles)
        setInvitations(data.invitations)
        setJoinRequests(data.joinRequests)
      })
      .catch((requestError) => {
        if (!isActive) return
        setLoadError(
          getCircleErrorMessage(
            requestError,
            'Unable to load circles. Please try again.',
          ),
        )
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const exploreCircles = useMemo(() => {
    const memberCircleIds = new Set(myCircles.map((circle) => circle.id))
    return publicCircles.filter((circle) => !memberCircleIds.has(circle.id))
  }, [myCircles, publicCircles])

  const pendingJoinCircleIds = useMemo(
    () => new Set(joinRequests.map((request) => request.circle_id)),
    [joinRequests],
  )

  const changeCircleTab = (nextTab) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextTab === 'overview') nextParams.delete('tab')
    else nextParams.set('tab', nextTab)
    setSearchParams(nextParams)
  }

  const closeCreate = () => {
    setIsCreateOpen(false)
    setCreateError('')
    setForm(emptyForm)
    setSkills([])
  }

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleCreateCircle = async (event) => {
    event.preventDefault()
    setIsCreating(true)
    setCreateError('')

    try {
      const response = await createCircle({
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category || null,
        skills: skills.length > 0 ? skills : null,
        visibility: form.visibility,
      })

      setMyCircles((current) => [response.circle, ...current])
      if (response.circle.visibility === 'public') {
        setPublicCircles((current) => [response.circle, ...current])
      }
      showToast(response.message ?? 'Circle created successfully.', 'success')
      closeCreate()
    } catch (requestError) {
      setCreateError(
        getCircleErrorMessage(requestError, 'Unable to create this circle.'),
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleInvitation = async (invitation, decision) => {
    setProcessingInvitationId(invitation.id)

    try {
      const response = decision === 'accept'
        ? await acceptInvitation(invitation.id)
        : await rejectInvitation(invitation.id)

      setInvitations((current) => current.filter((item) => item.id !== invitation.id))

      if (decision === 'accept') {
        await loadData()
      }

      showToast(response.message, 'success')
    } catch (requestError) {
      showToast(
        getCircleErrorMessage(requestError, `Unable to ${decision} this invitation.`),
        'error',
      )
    } finally {
      setProcessingInvitationId(null)
    }
  }

  const handleJoinRequest = async (circle) => {
    setRequestingCircleId(circle.id)

    try {
      const response = await requestToJoinCircle(circle.id)
      setJoinRequests((current) => [response.join_request, ...current])
      showToast(response.message ?? 'Join request sent.', 'success')
    } catch (requestError) {
      showToast(
        getCircleErrorMessage(requestError, 'Unable to request membership.'),
        'error',
      )
    } finally {
      setRequestingCircleId(null)
    }
  }

  return (
    <DashboardLayout title="Circles" userType="Member">
      <div className="space-y-12">
        <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-[#64ffda]">Member collaboration</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff]">Circles</h2>
            <p className="mt-3 max-w-2xl text-[#8892b0]">
              Create or join member circles to collaborate on projects.
            </p>
          </div>
          <Button size="lg" onClick={() => setIsCreateOpen(true)}>Create Circle</Button>
        </section>

        <div className="flex max-w-md gap-1 rounded-xl border border-[#233554] bg-[#071426] p-1" role="tablist" aria-label="Circle views">
          <button type="button" role="tab" aria-selected={circleTab === 'overview'} onClick={() => changeCircleTab('overview')} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${circleTab === 'overview' ? 'bg-[#112240] text-[#64ffda]' : 'text-[#8892b0] hover:text-[#e6f1ff]'}`}>Circles</button>
          <button type="button" role="tab" aria-selected={circleTab === 'invitations'} onClick={() => changeCircleTab('invitations')} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${circleTab === 'invitations' ? 'bg-[#112240] text-[#64ffda]' : 'text-[#8892b0] hover:text-[#e6f1ff]'}`}>Invitations{invitations.length > 0 ? ` (${invitations.length})` : ''}</button>
        </div>

        {loadError && (
          <div role="alert" className="flex flex-col gap-4 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#fca5a5]">{loadError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLoading(true)
                setLoadError('')
                loadData()
              }}
            >
              Try Again
            </Button>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner label="Loading circles from LinkPort..." size="lg" />
        ) : (
          <>
            {circleTab === 'overview' && <section>
              <SectionHeading title="My Circles" description="Small teams you already collaborate with." />
              {myCircles.length === 0 ? (
                <div className="mt-6">
                  <EmptyState title="No circles yet" description="Create a circle or accept an invitation to start collaborating." actionLabel="Create Circle" onAction={() => setIsCreateOpen(true)} />
                </div>
              ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {myCircles.map((circle) => (
                    <CircleCard
                      key={circle.id}
                      circle={circle}
                      onView={() => navigate(`/circles/${circle.id}`)}
                      action={<span className="text-xs capitalize text-[#64ffda]">{circle.membershipRole || 'member'}</span>}
                    />
                  ))}
                </div>
              )}
            </section>}

            {circleTab === 'overview' && <section>
              <SectionHeading title="Explore Circles" description="Discover public circles that match your interests and skills." />
              {exploreCircles.length === 0 ? (
                <div className="mt-6">
                  <EmptyState title="No public circles found" description="New public circles will appear here when members create them." />
                </div>
              ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {exploreCircles.map((circle) => (
                    <CircleCard
                      key={circle.id}
                      circle={circle}
                      onView={() => navigate(`/circles/${circle.id}`)}
                      action={pendingJoinCircleIds.has(circle.id) ? (
                        <Button size="sm" variant="ghost" disabled>Request Pending</Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={requestingCircleId === circle.id}
                          onClick={() => handleJoinRequest(circle)}
                        >
                          {requestingCircleId === circle.id ? 'Sending...' : 'Request to Join'}
                        </Button>
                      )}
                    />
                  ))}
                </div>
              )}
            </section>}

            <section>
              <SectionHeading title="Invitations" description="Pending invitations from members who want to collaborate with you." />
              {invitations.length === 0 ? (
                <div className="mt-6">
                  <EmptyState title="No pending invitations" description="Circle invitations sent to you will appear here." />
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id}>
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64ffda]">Invited by {invitation.invitedBy}</p>
                          <h3 className="mt-2 text-lg font-semibold">{invitation.circle?.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-[#8892b0]">
                            {invitation.circle?.description || 'No description provided.'}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={processingInvitationId === invitation.id}
                            onClick={() => handleInvitation(invitation, 'reject')}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            disabled={processingInvitationId === invitation.id}
                            onClick={() => handleInvitation(invitation, 'accept')}
                          >
                            {processingInvitationId === invitation.id ? 'Saving...' : 'Accept'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isCreating) closeCreate()
          }}
        >
          <Card padding="lg" className="w-full max-w-2xl shadow-2xl shadow-black/40">
            <div role="dialog" aria-modal="true" aria-labelledby="create-circle-title">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#64ffda]">New collaboration group</p>
                  <h2 id="create-circle-title" className="mt-2 text-2xl font-bold">Create Circle</h2>
                  <p className="mt-2 text-sm text-[#8892b0]">Your circle will be saved to LinkPort.</p>
                </div>
                <button type="button" disabled={isCreating} onClick={closeCreate} className="text-2xl text-[#8892b0] transition-colors hover:text-[#e6f1ff] disabled:opacity-50" aria-label="Close create circle form">&times;</button>
              </div>

              <form onSubmit={handleCreateCircle} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="circle-name" className="text-sm font-medium">Circle name</label>
                  <input id="circle-name" name="name" required maxLength="255" value={form.name} onChange={updateField} placeholder="e.g. Web Product Crew" className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="circle-description" className="text-sm font-medium">Description</label>
                  <textarea id="circle-description" name="description" maxLength="5000" rows="4" value={form.description} onChange={updateField} placeholder="What will members build or learn together?" className={`${inputClasses} resize-y`} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="circle-category" className="text-sm font-medium">Category</label>
                    <input id="circle-category" name="category" maxLength="120" value={form.category} onChange={updateField} placeholder="e.g. Development" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="circle-visibility" className="text-sm font-medium">Visibility</label>
                    <select id="circle-visibility" name="visibility" value={form.visibility} onChange={updateField} className={inputClasses}>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Skills</label>
                  <div className="mt-2">
                    <SkillsInput skills={skills} setSkills={setSkills} placeholder="Add a skill" />
                  </div>
                </div>

                {createError && (
                  <p role="alert" className="rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">{createError}</p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-5 sm:flex-row sm:justify-end">
                  <Button variant="ghost" disabled={isCreating} onClick={closeCreate}>Cancel</Button>
                  <Button type="submit" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create Circle'}</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
