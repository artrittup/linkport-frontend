import CommunityFeed from '../components/CommunityFeed'
import HomeSuggestions from '../components/HomeSuggestions'
import { useAuth } from '../context/AuthContext'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateHome() {
  const { user } = useAuth()
  const firstName = user?.name?.trim().split(/\s+/)[0]

  return (
    <CandidateLayout title="Home" wide>
      <div className="min-w-0 max-w-full">
        <header className="flex min-w-0 flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm text-primary">Across LinkPort</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
              Browse recent work, conversations, events, collaborations, and opportunities from across the platform.
            </p>
          </div>
        </header>

        <div className="mt-7">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">Latest</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">What’s happening on LinkPort</h3>
        </div>

        <CommunityFeed fullPageLoading contextLabel="LinkPort" homeFeed aside={<HomeSuggestions />} />
      </div>
    </CandidateLayout>
  )
}
