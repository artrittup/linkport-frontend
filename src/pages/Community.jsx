import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import CirclePreviewModal from '../components/CirclePreviewModal'
import { circles as initialCircles } from '../data/circles'
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
      {[1, 2, 3, 4].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl border border-border bg-surface/45" />)}
    </div>
  )
}

export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const requestedView = searchParams.get('view')
  const activeView = validViews.has(requestedView) ? requestedView : 'overview'
  const [joinedCircleIds, setJoinedCircleIds] = useState(
    () => new Set(initialCircles.filter((circle) => circle.isJoined).map((circle) => circle.id)),
  )
  const [previewCircle, setPreviewCircle] = useState(null)
  const circles = useMemo(
    () => initialCircles.map((circle) => ({ ...circle, isJoined: joinedCircleIds.has(circle.id) })),
    [joinedCircleIds],
  )

  useEffect(() => {
    if (!requestedView || validViews.has(requestedView)) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('view')
    setSearchParams(nextParams, { replace: true })
  }, [requestedView, searchParams, setSearchParams])

  const selectView = (view) => {
    const nextParams = new URLSearchParams(searchParams)
    if (view === 'overview') nextParams.delete('view')
    else nextParams.set('view', view)
    nextParams.delete('filter')
    setSearchParams(nextParams)
  }

  const joinCircle = (circle) => {
    setJoinedCircleIds((current) => new Set(current).add(circle.id))
    showToast(`You joined ${circle.name}.`, 'success')
  }

  const showCreateMessage = () => showToast('Circle creation is coming soon.', 'info')

  return (
    <CandidateLayout title="Community">
      <div className="min-w-0 max-w-full">
        <header>
          <p className="font-mono text-sm text-primary">Meet and build together</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Community</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted sm:text-base">
            Find people, Circles, discussions, and ideas that match what you care about.
          </p>
          <p className="mt-2 text-sm font-medium text-text-secondary">Find your people. Share ideas. Build something together.</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link to="/member/community/members" className="font-medium text-primary hover:underline">Browse members</Link>
            <Link to="/member/community/events" className="font-medium text-primary hover:underline">Upcoming events</Link>
            <a href="https://discord.gg/8NemkkpJj" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">Join Discord</a>
          </div>
        </header>

        <nav className="mt-7 flex min-w-0 gap-2 overflow-x-auto border-b border-border pb-3" role="tablist" aria-label="Community views">
          {COMMUNITY_VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={activeView === view.id}
              onClick={() => selectView(view.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${activeView === view.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:border-primary/50 hover:text-text-primary'}`}
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 min-w-0">
          <Suspense fallback={<ViewLoadingFallback />}>
            {activeView === 'overview' && (
              <CommunityOverview
                circles={circles}
                onViewChange={selectView}
                onPreview={setPreviewCircle}
              />
            )}
            {activeView === 'my-circles' && (
              <MyCirclesView
                circles={circles}
                onDiscover={() => selectView('discover')}
                onCreate={showCreateMessage}
                onPreview={setPreviewCircle}
              />
            )}
            {activeView === 'discover' && (
              <DiscoverCirclesView
                circles={circles}
                onJoin={joinCircle}
                onCreate={showCreateMessage}
                onPreview={setPreviewCircle}
              />
            )}
            {activeView === 'discussions' && <CommunityDiscussionsView />}
            {activeView === 'ideas' && <CommunityIdeasView />}
          </Suspense>
        </div>
      </div>

      <CirclePreviewModal circle={previewCircle} onClose={() => setPreviewCircle(null)} />
    </CandidateLayout>
  )
}
