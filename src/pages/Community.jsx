import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import CircleFormModal from '../components/CircleFormModal'
import EmptyState from '../components/EmptyState'
import useCommunityCircles from '../hooks/useCommunityCircles'
import {
  requestToJoinCircle,
  acceptInvitation,
  rejectInvitation,
  getCircleErrorMessage,
} from '../api/circlesApi'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const COMMUNITY_VIEWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'my-circles', label: 'My Circles' },
  { id: 'discover', label: 'Discover' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'ideas', label: 'Ideas' },
]
const validViews = new Set(COMMUNITY_VIEWS.map((view) => view.id))
const CommunityOverview = lazy(() => import('../components/CommunityOverview'))
const MyCirclesView = lazy(() => import('../components/MyCirclesView'))
const DiscoverCirclesView = lazy(() => import('../components/DiscoverCirclesView'))
const CommunityDiscussionsView = lazy(() => import('../components/CommunityDiscussionsView'))
const CommunityIdeasView = lazy(() => import('../components/CommunityIdeasView'))

function ViewLoadingFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Loading Community view">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-xl border border-border bg-surface/45" />
      ))}
    </div>
  )
}

export default function Community({ initialView = 'overview' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const requestedView = searchParams.get('view')
  const activeView = validViews.has(requestedView) ? requestedView : initialView
  const navigate = useNavigate()
  const { circles, invitations, isLoading, error, retry } = useCommunityCircles()
  const [isCreating, setIsCreating] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const openCircle = (circle) => navigate(`/member/community/circles/${circle.id}`)

  useEffect(() => {
    if (!requestedView || validViews.has(requestedView)) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('view')
    setSearchParams(nextParams, { replace: true })
  }, [requestedView, searchParams, setSearchParams])

  const selectView = (view) => {
    if (view === 'overview') {
      navigate('/member/community/discover')
      return
    }
    if (view === 'my-circles') {
      navigate('/member/community/circles')
      return
    }
    navigate(`/member/community/discover?view=${view}`)
  }

  const joinCircle = async (circle) => {
    if (busyId) return
    setBusyId(`circle-${circle.id}`)
    try {
      await requestToJoinCircle(circle.id)
      showToast('Membership request sent to the Circle owner.', 'success')
      retry()
    } catch (error) {
      showToast(getCircleErrorMessage(error, 'Unable to request membership.'), 'error')
    } finally {
      setBusyId(null)
    }
  }
  const respondToInvitation = async (invitation, accept) => {
    if (busyId) return
    setBusyId(`invitation-${invitation.id}`)
    try {
      await (accept ? acceptInvitation(invitation.id) : rejectInvitation(invitation.id))
      retry()
      showToast(accept ? 'You joined the Circle.' : 'Invitation declined.', 'success')
    } catch (error) {
      showToast(getCircleErrorMessage(error, 'Unable to respond to invitation.'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <CandidateLayout title="Community">
      <div className="min-w-0 max-w-full">
        <header>
          <p className="font-mono text-sm text-primary">Meet and build together</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Community</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted sm:text-base">
            Find people, Circles, discussions, and ideas that match what you care about.
          </p>
          <p className="mt-2 text-sm font-medium text-text-secondary">
            Find your people. Share ideas. Build something together.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link to="/member/community/members" className="font-medium text-primary hover:underline">
              Browse members
            </Link>
            <Link to="/member/community/events" className="font-medium text-primary hover:underline">
              Upcoming events
            </Link>
            <a
              href="https://discord.gg/8NemkkpJj"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Join Discord
            </a>
          </div>
        </header>

        <nav
          className="mt-7 flex min-w-0 gap-2 overflow-x-auto border-b border-border pb-3"
          role="tablist"
          aria-label="Community views"
        >
          {COMMUNITY_VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={activeView === view.id}
              id={`community-tab-${view.id}`}
              aria-controls="community-panel"
              tabIndex={activeView === view.id ? 0 : -1}
              onKeyDown={(event) => {
                const index = COMMUNITY_VIEWS.findIndex((item) => item.id === activeView)
                const next =
                  event.key === 'ArrowRight'
                    ? (index + 1) % COMMUNITY_VIEWS.length
                    : event.key === 'ArrowLeft'
                      ? (index + COMMUNITY_VIEWS.length - 1) % COMMUNITY_VIEWS.length
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? COMMUNITY_VIEWS.length - 1
                          : null
                if (next === null) return
                event.preventDefault()
                selectView(COMMUNITY_VIEWS[next].id)
                document.getElementById(`community-tab-${COMMUNITY_VIEWS[next].id}`)?.focus()
              }}
              onClick={() => selectView(view.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${activeView === view.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:border-primary/50 hover:text-text-primary'}`}
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div
          id="community-panel"
          role="tabpanel"
          aria-labelledby={`community-tab-${activeView}`}
          className="mt-8 min-w-0"
        >
          {error && (
            <EmptyState
              title="Unable to load Circles"
              description={error}
              actionLabel="Try again"
              onAction={retry}
            />
          )}
          {isLoading && ['overview', 'my-circles', 'discover'].includes(activeView) ? (
            <ViewLoadingFallback />
          ) : (
            <Suspense fallback={<ViewLoadingFallback />}>
              {activeView === 'my-circles' && invitations.length > 0 && (
                <section className="mb-8 rounded-xl border border-border p-5" aria-label="Circle invitations">
                  <h2 className="text-xl font-semibold">Invitations</h2>
                  <div className="mt-4 space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <button
                            className="font-semibold text-primary hover:underline"
                            onClick={() => openCircle(invitation.circle)}
                          >
                            {invitation.circle?.name}
                          </button>
                          <p className="text-sm text-text-muted">Invited by {invitation.invitedBy}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            disabled={Boolean(busyId)}
                            onClick={() => respondToInvitation(invitation, false)}
                          >
                            Decline
                          </button>
                          <button
                            className="rounded-lg bg-primary px-4 py-2 text-primary-contrast disabled:opacity-50"
                            disabled={Boolean(busyId)}
                            onClick={() => respondToInvitation(invitation, true)}
                          >
                            Accept invitation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {activeView === 'overview' && (
                <CommunityOverview
                  circles={circles.map((circle) => ({ ...circle, isBusy: busyId === `circle-${circle.id}` }))}
                  onViewChange={selectView}
                  onPreview={openCircle}
                />
              )}
              {activeView === 'my-circles' && (
                <MyCirclesView
                  circles={circles.map((circle) => ({ ...circle, isBusy: busyId === `circle-${circle.id}` }))}
                  onDiscover={() => selectView('discover')}
                  onCreate={() => setIsCreating(true)}
                  onPreview={openCircle}
                />
              )}
              {activeView === 'discover' && (
                <DiscoverCirclesView
                  circles={circles.map((circle) => ({ ...circle, isBusy: busyId === `circle-${circle.id}` }))}
                  onJoin={joinCircle}
                  onCreate={() => setIsCreating(true)}
                  onPreview={openCircle}
                />
              )}
              {activeView === 'discussions' && <CommunityDiscussionsView circles={circles} />}
              {activeView === 'ideas' && <CommunityIdeasView />}
            </Suspense>
          )}
        </div>
      </div>

      <>
        {isCreating && (
          <CircleFormModal
            onClose={() => setIsCreating(false)}
            onSaved={(circle) => {
              setIsCreating(false)
              openCircle(circle)
            }}
          />
        )}
      </>
    </CandidateLayout>
  )
}
