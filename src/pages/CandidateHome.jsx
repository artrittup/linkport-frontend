import CommunityFeed from '../components/CommunityFeed'
import HomeSuggestions from '../components/HomeSuggestions'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateHome() {
  return (
    <CandidateLayout title="Home" wide>
      <div className="min-w-0 max-w-full">
        <div className="border-b border-border/70 pb-5">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">Latest</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">What’s happening on LinkPort</h3>
        </div>

        <CommunityFeed fullPageLoading contextLabel="LinkPort" homeFeed aside={<HomeSuggestions />} />
      </div>
    </CandidateLayout>
  )
}
