import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import CommunityFeedCard from '../components/CommunityFeedCard'
import { getCommunityPostCategoryLabel } from '../data/communityPostMapper'
import useCommunityPosts from '../hooks/useCommunityPosts'
import CandidateLayout from '../layouts/CandidateLayout'

function communityPostToFeedItem(post) {
  return {
    id: `post-${post.id}`,
    postId: post.id,
    filter: 'Posts',
    type: 'POST',
    title: getCommunityPostCategoryLabel(post.category),
    categoryLabel: getCommunityPostCategoryLabel(post.category),
    description: post.text,
    author: post.authorName,
    tags: post.tags,
    images: post.images,
    videoUrl: post.videoUrl,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    isLiked: post.isLiked,
    isSaved: post.isSaved,
    meta: post.createdAt
      ? new Date(post.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : 'Recently',
    createdAt: post.createdAt,
  }
}

export default function CandidateSavedPosts() {
  const { posts, isLoading, error, retry } = useCommunityPosts({ saved: true, perPage: 50 })
  const [removedPostIds, setRemovedPostIds] = useState([])
  const visiblePosts = useMemo(
    () => posts.filter((post) => !removedPostIds.includes(post.id)),
    [posts, removedPostIds],
  )

  return (
    <CandidateLayout title="Saved posts">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-primary">Your reading list</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Saved posts</h2>
          <p className="mt-4 max-w-2xl leading-7 text-text-muted">Posts you save from Community Home stay here until you remove them.</p>
        </div>
        <Link to="/member/home" className="rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10">Browse posts</Link>
      </section>

      {isLoading ? (
        <p role="status" className="mt-8 rounded-xl border border-border bg-surface/50 p-6 text-sm text-text-muted">Loading your saved posts...</p>
      ) : error ? (
        <div className="mt-8 rounded-xl border border-border bg-surface/50 p-6">
          <p className="text-sm text-text-muted">{error}</p>
          <button type="button" onClick={retry} className="mt-3 text-sm font-bold text-primary hover:underline">Try again</button>
        </div>
      ) : visiblePosts.length > 0 ? (
        <section className="mt-8 flex w-full flex-col gap-5">
          {visiblePosts.map((post) => (
            <CommunityFeedCard
              key={post.id}
              item={communityPostToFeedItem(post)}
              onUnsaved={(postId) => setRemovedPostIds((current) => [...current, postId])}
            />
          ))}
        </section>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-surface/50 p-8 text-center">
          <h3 className="text-lg font-bold text-text-primary">No saved posts yet</h3>
          <p className="mt-2 text-sm text-text-muted">Use the Save button on a community post to keep it here.</p>
        </div>
      )}
    </CandidateLayout>
  )
}
