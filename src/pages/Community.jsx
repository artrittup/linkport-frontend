import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import {
  acceptInvitation,
  getCircleErrorMessage,
  rejectInvitation,
  requestToJoinCircle,
} from '../api/circlesApi'
import CircleFormModal from '../components/CircleFormModal'
import CommunityDiscover from '../components/CommunityDiscover'
import EmptyState from '../components/EmptyState'
import SectionTabs from '../components/SectionTabs'
import useCommunityCircles from '../hooks/useCommunityCircles'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const COMMUNITY_TABS = [
  { id: 'discover', label: 'Discover', path: '/member/community' },
  { id: 'circles', label: 'Circles', path: '/member/community/circles' },
  { id: 'members', label: 'Members', path: '/member/community/members' },
  { id: 'events', label: 'Events', path: '/member/community/events' },
]
const legacyViews = new Set(['discussions', 'ideas'])
const CandidateMembers = lazy(() => import('./CandidateMembers'))
const CandidateEvents = lazy(() => import('./CandidateEvents'))
const DiscoverCirclesView = lazy(() => import('../components/DiscoverCirclesView'))
const CommunityDiscussionsView = lazy(() => import('../components/CommunityDiscussionsView'))
const CommunityIdeasView = lazy(() => import('../components/CommunityIdeasView'))

function ViewLoadingFallback({ compact = false }) {
  return (
    <div className={`grid gap-4 ${compact ? 'md:grid-cols-3' : 'md:grid-cols-2'}`} role="status" aria-label="Loading Community view">
      {[1, 2, 3].map((item) => (
        <div key={item} className={`${compact ? 'h-44' : 'h-56'} animate-pulse rounded-2xl border border-border bg-surface/45`} />
      ))}
    </div>
  )
}

function Invitations({ invitations, busyId, onRespond, onOpen }) {
  if (invitations.length === 0) return null

  return (
    <section className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5" aria-label="Circle invitations">
      <h3 className="text-lg font-semibold text-text-primary">Circle invitations</h3>
      <p className="mt-1 text-sm text-text-muted">People have invited you to join these communities.</p>
      <div className="mt-4 space-y-3">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface/75 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button type="button" className="font-semibold text-text-primary hover:text-primary" onClick={() => onOpen(invitation.circle)}>
                {invitation.circle?.name}
              </button>
              <p className="mt-1 text-xs text-text-muted">Invited by {invitation.invitedBy}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={Boolean(busyId)} onClick={() => onRespond(invitation, false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-elevated disabled:opacity-50">Decline</button>
              <button type="button" disabled={Boolean(busyId)} onClick={() => onRespond(invitation, true)} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-contrast hover:bg-primary-hover disabled:opacity-50">Accept</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Community({ initialView = 'discover' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const requestedLegacyView = searchParams.get('view')
  const requestedCircleCategory = searchParams.get('category') ?? 'All'
  const legacyView = legacyViews.has(requestedLegacyView) ? requestedLegacyView : null
  const normalizedInitialView = initialView === 'overview'
    ? 'discover'
    : initialView === 'my-circles'
      ? 'circles'
      : initialView
  const activeView = legacyView ?? normalizedInitialView
  const needsCircles = ['discover', 'circles', 'discussions'].includes(activeView)
  const { circles, invitations, isLoading, error, retry } = useCommunityCircles({ enabled: needsCircles })
  const [isCreating, setIsCreating] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [communitySearch, setCommunitySearch] = useState(() => searchParams.get('search') ?? '')
  const [debouncedCommunitySearch, setDebouncedCommunitySearch] = useState(() => searchParams.get('search') ?? '')

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedCommunitySearch(communitySearch.trim()), 250)
    return () => window.clearTimeout(timeout)
  }, [communitySearch])

  const clearCommunityFilters = () => {
    setCommunitySearch('')
    setDebouncedCommunitySearch('')
    navigate(location.pathname, { replace: true })
  }

  const openCircle = (circle) => navigate(`/member/community/circles/${circle.id}`)

  const joinCircle = async (circle) => {
    if (busyId) return
    setBusyId(`circle-${circle.id}`)
    try {
      await requestToJoinCircle(circle.id)
      showToast('Membership request sent to the Circle owner.', 'success')
      retry()
    } catch (requestError) {
      showToast(getCircleErrorMessage(requestError, 'Unable to request membership.'), 'error')
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
    } catch (requestError) {
      showToast(getCircleErrorMessage(requestError, 'Unable to respond to invitation.'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  const circlesWithState = circles.map((circle) => ({
    ...circle,
    isBusy: busyId === `circle-${circle.id}`,
  }))

  return (
    <CandidateLayout title="Community">
      <div className="min-w-0 max-w-full">
        {activeView === 'discover' && (
          <header>
            <p className="font-mono text-sm text-primary">Find your people</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Community</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted sm:text-base">
              Discover people, interests, Circles, and events for hobbies, culture, sports, learning, careers, local life, and more.
            </p>
          </header>
        )}

        {activeView === 'circles' && (
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.13em] text-primary">Groups</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Circles</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Join small communities organized around interests, fields, project ideas, and collaboration.</p>
            </div>
            <button type="button" onClick={() => setIsCreating(true)} className="inline-flex w-fit rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">Create Circle</button>
          </header>
        )}

        {activeView === 'members' && (
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.13em] text-primary">People</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Find members</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Search by interests, skills, education, or location and meet people you have something in common with.</p>
            </div>
            <Link to="/member/profile" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">View my profile</Link>
          </header>
        )}

        {activeView === 'events' && (
          <header>
            <p className="font-mono text-xs uppercase tracking-[0.13em] text-primary">Events</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Things happening in the community</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Find meetups, workshops, matches, screenings, book clubs, local activities, and conversations around your interests.</p>
          </header>
        )}

        <SectionTabs
          items={COMMUNITY_TABS.map((tab) => ({
            ...tab,
            path: communitySearch.trim() ? `${tab.path}?search=${encodeURIComponent(communitySearch.trim())}` : tab.path,
          }))}
          activeId={activeView}
          label="Community sections"
          className={legacyView ? '' : 'mt-7'}
        />

        <section className="mt-6" aria-label="Search Community">
          <label htmlFor="community-search" className="sr-only">Search Community</label>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input
              id="community-search"
              type="search"
              value={communitySearch}
              onChange={(event) => setCommunitySearch(event.target.value)}
              placeholder={activeView === 'members'
                ? 'Search members, skills, interests, or locations...'
                : activeView === 'circles'
                  ? 'Search Circles by name, topic, tag, or location...'
                  : activeView === 'events'
                    ? 'Search events by title, topic, organizer, or location...'
                    : 'Search topics, interests, members, and Circles...'}
              className="w-full rounded-xl border border-border bg-surface/70 py-3 pl-11 pr-4 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
            />
          </div>
        </section>

        <div className="mt-8 min-w-0">
          {activeView === 'discover' && (
            <CommunityDiscover
              circles={circlesWithState}
              circlesLoading={isLoading}
              circlesError={error}
              onJoinCircle={joinCircle}
              onOpenCircle={openCircle}
              onRetryCircles={retry}
              search={debouncedCommunitySearch}
            />
          )}

          {activeView === 'circles' && (
            <>
              <Invitations invitations={invitations} busyId={busyId} onRespond={respondToInvitation} onOpen={openCircle} />
              {error ? (
                <EmptyState title="Unable to load Circles" description={error} actionLabel="Try again" onAction={retry} />
              ) : isLoading ? (
                <ViewLoadingFallback />
              ) : (
                <Suspense fallback={<ViewLoadingFallback />}>
                  <DiscoverCirclesView
                    key={requestedCircleCategory}
                    circles={circlesWithState}
                    onJoin={joinCircle}
                    onCreate={() => setIsCreating(true)}
                    onPreview={openCircle}
                    search={debouncedCommunitySearch}
                    initialCategory={requestedCircleCategory}
                    showHeader={false}
                    onClearFilters={clearCommunityFilters}
                  />
                </Suspense>
              )}
            </>
          )}

          {activeView === 'members' && (
            <Suspense fallback={<ViewLoadingFallback compact />}>
              <CandidateMembers embedded showHeader={false} externalSearch={debouncedCommunitySearch} onClearSearch={clearCommunityFilters} />
            </Suspense>
          )}

          {activeView === 'events' && (
            <Suspense fallback={<ViewLoadingFallback compact />}>
              <CandidateEvents embedded showHeader={false} externalSearch={debouncedCommunitySearch} onClearSearch={clearCommunityFilters} />
            </Suspense>
          )}

          {activeView === 'discussions' && (
            <Suspense fallback={<ViewLoadingFallback />}>
              <CommunityDiscussionsView circles={circles} />
            </Suspense>
          )}

          {activeView === 'ideas' && (
            <Suspense fallback={<ViewLoadingFallback />}>
              <CommunityIdeasView />
            </Suspense>
          )}
        </div>
      </div>

      {isCreating && (
        <CircleFormModal
          onClose={() => setIsCreating(false)}
          onSaved={(circle) => {
            setIsCreating(false)
            openCircle(circle)
          }}
        />
      )}

      {legacyView && (
        <Link
          to={location.pathname}
          className="fixed bottom-5 right-5 z-20 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-lg"
        >
          Back to Discover
        </Link>
      )}
    </CandidateLayout>
  )
}
