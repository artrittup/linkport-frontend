import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  getCommunityPostErrorMessage,
} from '../api/communityPostsApi'
import { COMMUNITY_POST_CATEGORY_OPTIONS, getCommunityPostCategoryLabel } from '../data/communityPostMapper'
import { useAuth } from '../context/AuthContext'
import useCommunityPosts from '../hooks/useCommunityPosts'
import CommunityFeedCard from './CommunityFeedCard'
import EmptyState from './EmptyState'
import Modal from './Modal'
import Button from './Button'
import SkillsInput from './SkillsInput'

const input =
  'w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm text-text-primary focus:border-primary'
function DiscussionForm({ post, circles, circleId, onClose, onSaved }) {
  const [content, setContent] = useState(post?.content ?? '')
  const [category, setCategory] = useState(post?.category ?? 'general')
  const [selectedCircle, setSelectedCircle] = useState(circleId ?? '')
  const [tags, setTags] = useState(post?.tags ?? [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    if (busy || !content.trim()) return
    setBusy(true)
    setError('')
    try {
      const payload = { content: content.trim(), category, tags }
      if (post) await updateCommunityPost(post.id, payload)
      else
        await createCommunityPost({ ...payload, circle_id: selectedCircle ? Number(selectedCircle) : null })
      onSaved()
    } catch (error) {
      setError(getCommunityPostErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      isOpen
      title={post ? 'Edit discussion' : 'Start a discussion'}
      onClose={() => {
        if (!busy) onClose()
      }}
      showCloseButton={false}
    >
      <form onSubmit={submit} className="space-y-4">
        {!post && !circleId && (
          <div>
            <label htmlFor="discussion-destination" className="mb-2 block">
              Share with
            </label>
            <select
              id="discussion-destination"
              value={selectedCircle}
              onChange={(event) => setSelectedCircle(event.target.value)}
              className={input}
            >
              <option value="">Everyone in the community</option>
              {circles
                .filter((circle) => circle.isJoined)
                .map((circle) => (
                  <option key={circle.id} value={circle.id}>
                    {circle.name} ({circle.visibility})
                  </option>
                ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="discussion-content" className="mb-2 block">
            Your discussion
          </label>
          <textarea
            id="discussion-content"
            required
            maxLength={2000}
            rows={6}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className={input}
          />
          <p className="mt-1 text-right text-xs text-text-muted">{content.length}/2000</p>
        </div>
        <div>
          <label htmlFor="discussion-category" className="mb-2 block">
            Type
          </label>
          <select
            id="discussion-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={input}
          >
            {COMMUNITY_POST_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-2">Tags (up to 10)</p>
          <SkillsInput skills={tags} setSkills={setTags} placeholder="Add a topic" />
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger-text">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !content.trim()}>
            {busy ? 'Saving...' : post ? 'Save changes' : 'Publish discussion'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function CommunityDiscussionsView({ circles = [], circleId, postId, canPost = true }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [circle, setCircle] = useState('')
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const [saved, setSaved] = useState(false)
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const { posts, meta, isLoading, error, retry } = useCommunityPosts({
    postId,
    search: query,
    category,
    circleId: circleId || circle,
    sort,
    saved,
    page,
  })
  const changeFilter = (setter, value) => {
    setter(value)
    setPage(1)
  }
  const remove = async () => {
    if (busy) return
    setBusy(true)
    setActionError('')
    try {
      await deleteCommunityPost(deleting.id)
      setDeleting(null)
      if (postId) {
        navigate('/member/community?view=discussions')
        return
      }
      if (posts.length === 1 && page > 1) setPage(page - 1)
      else retry()
    } catch (error) {
      setActionError(getCommunityPostErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }
  return (
    <section aria-labelledby="community-discussions-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="community-discussions-heading" className="text-2xl font-semibold">
            Discussions
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Ask questions, share knowledge, and keep conversations going.
          </p>
        </div>
        {canPost && <Button onClick={() => setEditor({})}>Start a discussion</Button>}
      </div>
      {!postId && (
        <>
          <form
            className="mt-6 flex gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              changeFilter(setQuery, search.trim())
            }}
          >
            <label htmlFor="discussion-search" className="sr-only">
              Search discussions
            </label>
            <input
              id="discussion-search"
              type="search"
              maxLength={100}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search discussions or tags..."
              className={`${input} min-w-0 flex-1`}
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-3">
            {!circleId && (
              <select
                aria-label="Filter by Circle"
                value={circle}
                onChange={(event) => changeFilter(setCircle, event.target.value)}
                className={`${input} sm:w-auto`}
              >
                <option value="">All Circles and community</option>
                {circles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
            <select
              aria-label="Filter by discussion type"
              value={category}
              onChange={(event) => changeFilter(setCategory, event.target.value)}
              className={`${input} sm:w-auto`}
            >
              <option value="">All types</option>
              {COMMUNITY_POST_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort discussions"
              value={sort}
              onChange={(event) => changeFilter(setSort, event.target.value)}
              className={`${input} sm:w-auto`}
            >
              <option value="recent">Most recent</option>
              <option value="active">Most replies</option>
            </select>
            <button
              type="button"
              aria-pressed={saved}
              onClick={() => changeFilter(setSaved, !saved)}
              className={`rounded-lg border px-4 py-2 text-sm ${saved ? 'border-primary text-primary' : 'border-border text-text-muted'}`}
            >
              Saved discussions
            </button>
            {(query || category || circle || saved || sort !== 'recent') && (
              <button
                className="text-sm text-primary"
                onClick={() => {
                  setSearch('')
                  setQuery('')
                  setCategory('')
                  setCircle('')
                  setSaved(false)
                  setSort('recent')
                  setPage(1)
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </>
      )}
      <div className="mt-6" aria-live="polite">
        {isLoading ? (
          <p role="status" className="py-8 text-text-muted">
            Loading discussions...
          </p>
        ) : error ? (
          <EmptyState
            title="Unable to load discussions"
            description={error}
            actionLabel="Try again"
            onAction={retry}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            title="No discussions found"
            description="Try another filter or start a conversation."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-text-muted">
              {meta.total} {meta.total === 1 ? 'discussion' : 'discussions'}
            </p>
            <div className="space-y-5">
              {posts.map((post) => (
                <div key={`${post.id}-${post.updatedAt}`} className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>
                      {!postId && (
                        <Link
                          className="mr-3 text-primary hover:underline"
                          to={`/member/community/discussions/${post.id}`}
                        >
                          View discussion
                        </Link>
                      )}
                      {post.circleId ? (
                        <Link
                          className="text-primary hover:underline"
                          to={`/member/community/circles/${post.circleId}`}
                        >
                          {post.circleName}
                        </Link>
                      ) : (
                        'Community'
                      )}
                    </span>
                    {post.authorId === user?.id && (
                      <div className="flex gap-4">
                        <button className="text-primary" onClick={() => setEditor(post)}>
                          Edit discussion
                        </button>
                        <button
                          className="text-danger-text"
                          onClick={() => {
                            setDeleting(post)
                            setActionError('')
                          }}
                        >
                          Delete discussion
                        </button>
                      </div>
                    )}
                  </div>
                  <CommunityFeedCard
                    item={{
                      id: post.id,
                      postId: post.id,
                      type: 'DISCUSSION',
                      filter: 'Discussions',
                      title: getCommunityPostCategoryLabel(post.category),
                      description: post.content,
                      author: post.authorName,
                      authorId: post.authorId,
                      tags: post.tags,
                      images: post.images,
                      videoUrl: post.videoUrl,
                      likesCount: post.likesCount,
                      commentsCount: post.commentsCount,
                      isLiked: post.isLiked,
                      isSaved: post.isSaved,
                      saveType: 'community_post',
                      saveId: post.id,
                      meta: new Date(post.createdAt).toLocaleString(),
                    }}
                    onSavedChange={() => {
                      if (saved) retry()
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {!isLoading && !error && meta.last_page > 1 && (
        <nav aria-label="Discussion pages" className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>
            Page {meta.current_page} of {meta.last_page}
          </span>
          <Button variant="outline" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </nav>
      )}
      {editor && (
        <DiscussionForm
          post={editor.id ? editor : null}
          circles={circles}
          circleId={circleId}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null)
            setPage(1)
            retry()
          }}
        />
      )}
      {deleting && (
        <Modal
          isOpen
          title="Delete discussion?"
          onClose={() => {
            if (!busy) setDeleting(null)
          }}
          showCloseButton={false}
        >
          <p>This also removes the discussion’s replies and likes.</p>
          {actionError && (
            <p role="alert" className="mt-3 text-danger-text">
              {actionError}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={busy} onClick={remove}>
              {busy ? 'Deleting...' : 'Delete discussion'}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  )
}
