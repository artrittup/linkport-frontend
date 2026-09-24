import { Link, useParams } from 'react-router'
import CandidateLayout from '../layouts/CandidateLayout'
import CommunityDiscussionsView from '../components/CommunityDiscussionsView'

export default function DiscussionDetails() {
  const { postId } = useParams()
  return (
    <CandidateLayout title="Discussion">
      <Link to="/member/community?view=discussions" className="text-sm text-primary hover:underline">
        ← Back to discussions
      </Link>
      <div className="mt-6">
        <CommunityDiscussionsView key={postId} postId={postId} canPost={false} />
      </div>
    </CandidateLayout>
  )
}
