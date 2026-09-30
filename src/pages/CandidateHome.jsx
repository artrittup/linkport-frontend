import CommunityFeed from '../components/CommunityFeed'
import HomeSuggestions from '../components/HomeSuggestions'
import MemberHomeComposer from '../components/MemberHomeComposer'
import { useAuth } from '../context/AuthContext'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateHome() {
  const { user } = useAuth()

  return (
    <CandidateLayout title="Home" wide>
      <div className="min-w-0 max-w-full">
        <MemberHomeComposer memberName={user?.name} />

        <CommunityFeed fullPageLoading contextLabel="LinkPort" homeFeed aside={<HomeSuggestions />} />
      </div>
    </CandidateLayout>
  )
}
