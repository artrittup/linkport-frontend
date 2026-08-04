import { useState } from 'react'
import { Link } from 'react-router'
import {
  createCommunityPostComment,
  deleteCommunityPostComment,
  getCommunityPostComments,
  getCommunityPostErrorMessage,
  setCommunityPostLiked,
  setCommunityPostSaved,
} from '../api/communityPostsApi'

function getInitials(name) {
  return (name || 'LP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function ActionIcon({ type, filled = false }) {
  const paths = {
    like: <path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Zm0 0 4-7a2 2 0 0 1 3 2v3h4.3a2 2 0 0 1 2 2.4l-1.4 8A3 3 0 0 1 16 21H7" />,
    comment: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />,
    save: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />,
  }

  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      {paths[type]}
    </svg>
  )
}

function PostMedia({ images, videoUrl }) {
  if (!images?.length && !videoUrl) return null

  return (
    <div className="mt-5 space-y-3">
      {images?.length > 0 && (
        <div className={`grid overflow-hidden rounded-xl border border-border bg-background ${images.length > 1 ? 'grid-cols-2 gap-0.5' : ''}`}>
          {images.map((image, index) => (
            <a key={image} href={image} target="_blank" rel="noreferrer" className={images.length === 3 && index === 0 ? 'col-span-2' : ''} aria-label={`Open post image ${index + 1}`}>
              <img src={image} alt={`Post attachment ${index + 1}`} loading="lazy" className={`w-full object-cover ${images.length === 1 ? 'max-h-[34rem]' : index === 0 && images.length === 3 ? 'h-72' : 'h-52'}`} />
            </a>
          ))}
        </div>
      )}
      {videoUrl && (
        <video controls preload="metadata" className="max-h-[34rem] w-full rounded-xl border border-border bg-black">
          <source src={videoUrl} />
          Your browser does not support embedded video.
        </video>
      )}
    </div>
  )
}

export default function CommunityFeedCard({ item, onUnsaved }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isLiked, setIsLiked] = useState(item.isLiked ?? false)
  const [isSaved, setIsSaved] = useState(item.isSaved ?? false)
  const [likesCount, setLikesCount] = useState(item.likesCount ?? 0)
  const [commentsCount, setCommentsCount] = useState(item.commentsCount ?? 0)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [interactionError, setInteractionError] = useState('')
  const shouldCollapse = item.description.length > 180
  const visibleDescription = shouldCollapse && !isExpanded
    ? `${item.description.slice(0, 180).trim()}...`
    : item.description
  const isPost = Boolean(item.postId)

  const toggleLike = async () => {
    if (isWorking) return
    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikesCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)))
    setIsWorking(true)
    setInteractionError('')
    try {
      const response = await setCommunityPostLiked(item.postId, nextLiked)
      setLikesCount(response.likes_count)
    } catch (error) {
      setIsLiked(!nextLiked)
      setLikesCount((current) => Math.max(0, current + (nextLiked ? -1 : 1)))
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to update this like.'))
    } finally {
      setIsWorking(false)
    }
  }

  const toggleSave = async () => {
    if (isWorking) return
    const nextSaved = !isSaved
    setIsSaved(nextSaved)
    setIsWorking(true)
    setInteractionError('')
    try {
      await setCommunityPostSaved(item.postId, nextSaved)
      if (!nextSaved) onUnsaved?.(item.postId)
    } catch (error) {
      setIsSaved(!nextSaved)
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to update your saved posts.'))
    } finally {
      setIsWorking(false)
    }
  }

  const toggleComments = async () => {
    const nextOpen = !isCommenting
    setIsCommenting(nextOpen)
    if (!nextOpen || commentsLoaded || isCommentsLoading) return

    setIsCommentsLoading(true)
    setInteractionError('')
    try {
      const response = await getCommunityPostComments(item.postId)
      setComments(response.data)
      setCommentsLoaded(true)
    } catch (error) {
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to load comments.'))
    } finally {
      setIsCommentsLoading(false)
    }
  }

  const submitComment = async (event) => {
    event.preventDefault()
    if (!commentText.trim() || isWorking) return
    setIsWorking(true)
    setInteractionError('')
    try {
      const response = await createCommunityPostComment(item.postId, commentText.trim())
      setComments((current) => [...current, response.data])
      setCommentsCount((current) => current + 1)
      setCommentsLoaded(true)
      setCommentText('')
    } catch (error) {
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to publish your comment.'))
    } finally {
      setIsWorking(false)
    }
  }

  const removeComment = async (commentId) => {
    if (isWorking) return
    setIsWorking(true)
    setInteractionError('')
    try {
      await deleteCommunityPostComment(item.postId, commentId)
      setComments((current) => current.filter((comment) => comment.id !== commentId))
      setCommentsCount((current) => Math.max(0, current - 1))
    } catch (error) {
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to delete this comment.'))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <article className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-300/80 bg-slate-50 shadow-sm shadow-slate-200/50 dark:border-border dark:bg-surface dark:shadow-black/10">
      <div className="border-b border-slate-200 bg-slate-100/80 px-5 py-4 dark:border-border/70 dark:bg-surface/80 sm:px-6">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono text-sm font-bold text-primary">{getInitials(item.author)}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text-primary">{item.author}</p>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-text-subtle">
                <span>{item.meta}</span><span aria-hidden="true">•</span><span>{item.type}</span>
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{item.categoryLabel || item.filter}</span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-border bg-background/55 px-2.5 py-1 text-xs font-semibold text-text-secondary">{item.title}</span>
          {item.attending && <span className="rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success-text">Attending</span>}
        </div>
        <p className="mt-4 break-words text-sm leading-7 text-text-muted">{visibleDescription}</p>
        <PostMedia images={item.images} videoUrl={item.videoUrl} />
        {item.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{item.tags.slice(0, 8).map((tag) => <span key={tag} className="max-w-full break-words rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">{tag}</span>)}</div>}

        <div className="mt-6 flex flex-wrap items-center gap-1 border-t border-border/70 pt-3">
          {shouldCollapse && <button type="button" onClick={() => setIsExpanded((current) => !current)} className="rounded-lg px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10">{isExpanded ? 'Show less' : 'View more'}</button>}
          {isPost && (
            <>
              <button type="button" aria-pressed={isLiked} disabled={isWorking} onClick={toggleLike} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors hover:bg-primary/10 ${isLiked ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}><ActionIcon type="like" filled={isLiked} /> Like{likesCount > 0 ? ` · ${likesCount}` : ''}</button>
              <button type="button" aria-expanded={isCommenting} onClick={toggleComments} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"><ActionIcon type="comment" /> Comment{commentsCount > 0 ? ` · ${commentsCount}` : ''}</button>
              <button type="button" aria-pressed={isSaved} disabled={isWorking} onClick={toggleSave} className={`ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors hover:bg-primary/10 ${isSaved ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}><ActionIcon type="save" filled={isSaved} /> {isSaved ? 'Saved' : 'Save'}</button>
            </>
          )}
          {item.action && item.path && <Link to={item.path} className="rounded-lg px-3 py-2 text-sm font-bold text-text-secondary transition-colors hover:bg-surface-elevated hover:text-primary">{item.action}</Link>}
        </div>

        {interactionError && <p role="alert" className="mt-3 text-sm text-danger-text">{interactionError}</p>}
        {isCommenting && (
          <div className="mt-4 rounded-xl border border-border bg-background/55 p-4">
            <form onSubmit={submitComment} className="flex gap-2">
              <input type="text" value={commentText} maxLength="1000" onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." aria-label="Comment text" className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
              <button type="submit" disabled={isWorking || !commentText.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-contrast hover:bg-primary-hover disabled:opacity-50">Post</button>
            </form>
            {isCommentsLoading ? <p className="mt-4 text-sm text-text-muted">Loading comments...</p> : comments.length > 0 ? (
              <div className="mt-4 space-y-3">{comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-border bg-surface px-3 py-3">
                  <div className="flex items-start justify-between gap-3"><p className="text-xs font-bold text-text-primary">{comment.authorName}</p>{comment.canDelete && <button type="button" disabled={isWorking} onClick={() => removeComment(comment.id)} className="text-xs text-text-subtle hover:text-danger-text">Delete</button>}</div>
                  <p className="mt-1 break-words text-sm leading-6 text-text-muted">{comment.content}</p>
                </div>
              ))}</div>
            ) : commentsLoaded ? <p className="mt-4 text-sm text-text-muted">No comments yet. Start the conversation.</p> : null}
          </div>
        )}
      </div>
    </article>
  )
}
