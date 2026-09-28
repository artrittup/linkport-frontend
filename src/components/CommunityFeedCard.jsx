import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  createCommunityPostComment,
  deleteCommunityPostComment,
  getCommunityPostComments,
  getCommunityPostErrorMessage,
  setCommunityPostLiked,
} from '../api/communityPostsApi'
import SaveButton from './SaveButton'

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
  }

  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      {paths[type]}
    </svg>
  )
}

function PostMedia({ images, videoUrl, compact }) {
  if (!images?.length && !videoUrl) return null
  const visibleImages = compact ? images?.slice(0, 1) : images

  return (
    <div className={`${compact ? 'mt-3' : 'mt-5'} space-y-3`}>
      {visibleImages?.length > 0 && (
        <div className={`grid overflow-hidden rounded-xl border border-border bg-background ${visibleImages.length > 1 ? 'grid-cols-2 gap-0.5' : ''}`}>
          {visibleImages.map((image, index) => (
            <a key={image} href={image} target="_blank" rel="noreferrer" className={`pointer-events-auto relative z-10 ${visibleImages.length === 3 && index === 0 ? 'col-span-2' : ''}`} aria-label={`Open post image ${index + 1}`}>
              <img src={image} alt={`Post attachment ${index + 1}`} loading="lazy" className={`w-full object-cover ${compact ? 'h-40' : visibleImages.length === 1 ? 'max-h-[34rem]' : index === 0 && visibleImages.length === 3 ? 'h-72' : 'h-52'}`} />
            </a>
          ))}
        </div>
      )}
      {videoUrl && (
        <video controls preload="metadata" className={`pointer-events-auto relative z-10 w-full rounded-xl border border-border bg-black ${compact ? 'max-h-44' : 'max-h-[34rem]'}`}>
          <source src={videoUrl} />
          Your browser does not support embedded video.
        </video>
      )}
    </div>
  )
}

const feedCardClasses = 'group relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm shadow-slate-200/50 transition-colors hover:border-primary/35 dark:shadow-black/10'

function CardLink({ path, label, preserveScrollPosition }) {
  const location = useLocation()
  if (!path) return null

  const returnTo = location.pathname + location.search + location.hash
  const rememberFeedPosition = () => {
    if (!preserveScrollPosition) return
    window.sessionStorage.setItem('linkport:feed-return', JSON.stringify({
      path: returnTo,
      scrollY: window.scrollY,
    }))
  }

  return (
    <Link
      to={path}
      state={{ feedReturnTo: returnTo }}
      onClick={rememberFeedPosition}
      aria-label={label}
      className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
    />
  )
}

function CommunityPostCard({ item, onUnsaved, onSavedChange, compact = false, preserveScrollPosition = false }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isLiked, setIsLiked] = useState(item.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(item.likesCount ?? 0)
  const [commentsCount, setCommentsCount] = useState(item.commentsCount ?? 0)
  const [comments, setComments] = useState([])
  const [commentPage, setCommentPage] = useState(1)
  const [lastCommentPage, setLastCommentPage] = useState(1)
  const [commentText, setCommentText] = useState('')
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [interactionError, setInteractionError] = useState('')
  const description = item.description ?? ''
  const shouldCollapse = !compact && description.length > 180
  const visibleDescription = shouldCollapse && !isExpanded
    ? `${description.slice(0, 180).trim()}...`
    : description
  const isPost = Boolean(item.postId)
  const detailPath = item.path ?? (item.postId ? `/member/community/discussions/${item.postId}` : null)

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

  const toggleComments = async () => {
    const nextOpen = !isCommenting
    setIsCommenting(nextOpen)
    if (!nextOpen || commentsLoaded || isCommentsLoading) return

    setIsCommentsLoading(true)
    setInteractionError('')
    try {
      const response = await getCommunityPostComments(item.postId)
      setComments(response.data)
      setCommentPage(1)
      setLastCommentPage(response.meta.last_page)
      setCommentsLoaded(true)
    } catch (error) {
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to load comments.'))
    } finally {
      setIsCommentsLoading(false)
    }
  }

  const loadMoreComments = async () => {
    if (isCommentsLoading) return
    setIsCommentsLoading(true)
    setInteractionError('')
    try {
      const response = await getCommunityPostComments(item.postId, commentPage + 1)
      setComments((current) => [...new Map([...current, ...response.data].map((comment) => [comment.id, comment])).values()])
      setCommentPage(response.meta.current_page)
      setLastCommentPage(response.meta.last_page)
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
    <article className={feedCardClasses}>
      <CardLink path={detailPath} label={`Open ${item.title}`} preserveScrollPosition={preserveScrollPosition} />
      <div className={`pointer-events-none relative z-[1] border-b border-border/70 bg-surface-muted/65 ${compact ? 'px-4 py-3.5' : 'px-5 py-4 sm:px-6'}`}>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono font-bold text-primary ${compact ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm'}`}>{getInitials(item.author)}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text-primary">
                {item.authorId ? <Link to={`/member/community/members/${item.authorId}`} className="pointer-events-auto relative z-10 no-underline hover:text-primary hover:no-underline">{item.author}</Link> : item.author}
              </p>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-text-subtle">
                <span className="truncate">{item.meta}</span><span aria-hidden="true">•</span><span>{item.type}</span>
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{item.categoryLabel || item.filter}</span>
        </div>
      </div>

      <div className={`pointer-events-none relative z-[1] flex flex-1 flex-col ${compact ? 'px-4 py-4' : 'px-5 py-5 sm:px-6'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-1 text-base font-bold text-text-primary">{item.title}</h3>
          {item.attending && <span className="rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success-text">Attending</span>}
        </div>

        <p className={`mt-2 break-words text-sm text-text-muted ${compact ? 'line-clamp-2 leading-6' : 'leading-7'}`}>{visibleDescription}</p>
        {item.deadline && <p className="mt-3 text-xs text-text-subtle">Deadline: {item.deadline}</p>}
        <PostMedia images={item.images} videoUrl={item.videoUrl} compact={compact} />
        {(item.tags ?? []).length > 0 && (
          <div className={`${compact ? 'mt-3' : 'mt-5'} flex flex-wrap gap-1.5`}>
            {(item.tags ?? []).slice(0, compact ? 4 : 8).map((tag) => <span key={tag} className="max-w-full break-words rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">{tag}</span>)}
          </div>
        )}

        <div className={`pointer-events-auto relative z-10 mt-6 flex flex-wrap items-center gap-1 border-t border-border/70 ${compact ? 'pt-3' : 'pt-4'}`}>
          {shouldCollapse && <button type="button" onClick={() => setIsExpanded((current) => !current)} className="rounded-lg px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10">{isExpanded ? 'Show less' : 'View more'}</button>}
          {isPost && (
            <>
              <button type="button" aria-pressed={isLiked} disabled={isWorking} onClick={toggleLike} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors hover:bg-primary/10 ${isLiked ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}><ActionIcon type="like" filled={isLiked} /> Like{likesCount > 0 ? ` · ${likesCount}` : ''}</button>
              <button type="button" aria-expanded={isCommenting} onClick={toggleComments} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"><ActionIcon type="comment" /> Comment{commentsCount > 0 ? ` · ${commentsCount}` : ''}</button>
            </>
          )}
          {item.saveType && item.saveId && (
            <SaveButton
              type={item.saveType}
              itemId={item.saveId}
              initialSaved={item.isSaved}
              className="ml-auto"
              onChange={(nextSaved) => {
                onSavedChange?.(item, nextSaved)
                if (!nextSaved) onUnsaved?.(item)
              }}
            />
          )}
        </div>

        {interactionError && <p role="alert" className="pointer-events-auto relative z-10 mt-3 text-sm text-danger-text">{interactionError}</p>}
        {isCommenting && (
          <div className="pointer-events-auto relative z-10 mt-4 rounded-xl border border-border bg-background/55 p-4">
            <form onSubmit={submitComment} className="flex gap-2">
              <input type="text" value={commentText} maxLength="1000" onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." aria-label="Comment text" className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
              <button type="submit" disabled={isWorking || isCommentsLoading || !commentText.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-contrast hover:bg-primary-hover disabled:opacity-50">Post</button>
            </form>
            {isCommentsLoading && comments.length === 0 ? <p className="mt-4 text-sm text-text-muted">Loading comments...</p> : comments.length > 0 ? (
              <div className="mt-4 space-y-3">{comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-border bg-surface px-3 py-3">
                  <div className="flex items-start justify-between gap-3"><p className="text-xs font-bold text-text-primary">{comment.authorName}</p>{comment.canDelete && <button type="button" disabled={isWorking} onClick={() => removeComment(comment.id)} className="text-xs text-text-subtle hover:text-danger-text">Delete</button>}</div>
                  <p className="mt-1 break-words text-sm leading-6 text-text-muted">{comment.content}</p>
                </div>
              ))}</div>
            ) : commentsLoaded ? <p className="mt-4 text-sm text-text-muted">No comments yet. Start the conversation.</p> : null}
            {commentsLoaded && commentPage < lastCommentPage && <button type="button" disabled={isCommentsLoading} onClick={loadMoreComments} className="mt-4 text-sm font-semibold text-primary">{isCommentsLoading ? 'Loading...' : 'Load more replies'}</button>}
          </div>
        )}
      </div>
    </article>
  )
}

export default function CommunityFeedCard(props) {
  return <CommunityPostCard {...props} />
}
