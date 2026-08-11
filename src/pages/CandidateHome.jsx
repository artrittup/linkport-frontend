import CommunityFeed from '../components/CommunityFeed'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateHome() {
  return (
    <CandidateLayout title="Explore LinkPort">
      <CommunityFeed showHeading fullPageLoading contextLabel="Home" />
    </CandidateLayout>
  )
}
