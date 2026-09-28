import { useParams } from 'react-router'
import CandidateLayout from '../layouts/CandidateLayout'
import BackToFeedLink from '../components/BackToFeedLink'
import CommunityDiscussionsView from '../components/CommunityDiscussionsView'

export default function DiscussionDetails() {
  const { postId } = useParams()
  return (
    <CandidateLayout title="Discussion">
      <BackToFeedLink fallbackPath="/member/community?view=discussions" fallbackLabel="Back to discussions" />
      <div className="mt-6">
        <CommunityDiscussionsView key={postId} postId={postId} canPost={false} />
      </div>
    </CandidateLayout>
  )
}
