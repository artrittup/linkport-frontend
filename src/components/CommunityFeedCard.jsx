import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  createCommunityPostComment,
  deleteCommunityPostComment,
  getCommunityPostComments,
  getCommunityPostErrorMessage,
  setCommunityPostCommentLiked,
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

const commentDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatCommentDate(value) {
  if (!value) return 'Just now'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Just now' : commentDateFormatter.format(date)
}

function updateCommentTree(comments, commentId, update) {
  return comments.map((comment) => {
    if (comment.id === commentId) return update(comment)
    if (!comment.replies?.length) return comment
    return { ...comment, replies: updateCommentTree(comment.replies, commentId, update) }
  })
}

function appendCommentReply(comments, parentId, reply) {
  return updateCommentTree(comments, parentId, (comment) => ({
    ...comment,
    replies: [...(comment.replies ?? []), reply],
  }))
}

function removeCommentFromTree(comments, commentId) {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: removeCommentFromTree(comment.replies ?? [], commentId),
    }))
}

function CommentThreadItem({
  comment,
  depth = 0,
  replyingToId,
  replyText,
  onReplyTextChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onToggleLike,
  onDelete,
  isWorking,
}) {
  const isReplying = replyingToId === comment.id
  const isIndented = depth > 0 && depth < 3

  return (
    <div className={isIndented ? 'ml-4 border-l border-border/70 pl-3 sm:ml-6' : ''}>
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-bold text-primary">
          {getInitials(comment.authorName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="rounded-lg bg-surface px-3 py-2 ring-1 ring-border/70">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="truncate text-xs font-bold text-text-primary">{comment.authorName}</span>
              <time dateTime={comment.createdAt ?? undefined} className="text-[10px] text-text-subtle">
                {formatCommentDate(comment.createdAt)}
              </time>
            </div>
            <p className="mt-0.5 break-words text-sm leading-5 text-text-muted">{comment.content}</p>
          </div>

          <div className="mt-1 flex items-center gap-3 px-1 text-[11px] font-semibold">
            <button type="button" aria-pressed={comment.isLiked} disabled={isWorking} onClick={() => onToggleLike(comment)} className={comment.isLiked ? 'text-primary' : 'text-text-subtle hover:text-primary'}>
              Like{comment.likesCount > 0 ? ` · ${comment.likesCount}` : ''}
            </button>
            <button type="button" disabled={isWorking} onClick={() => onStartReply(comment)} className="text-text-subtle hover:text-primary">Reply</button>
            {comment.canDelete && <button type="button" disabled={isWorking} onClick={() => onDelete(comment.id)} className="text-text-subtle hover:text-danger-text">Delete</button>}
          </div>

          {isReplying && (
            <form onSubmit={(event) => onSubmitReply(event, comment)} className="mt-2 flex gap-2">
              <input autoFocus type="text" value={replyText} maxLength="1000" onChange={(event) => onReplyTextChange(event.target.value)} placeholder={`Reply to ${comment.authorName}...`} aria-label={`Reply to ${comment.authorName}`} className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
              <button type="submit" disabled={isWorking || !replyText.trim()} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-contrast hover:bg-primary-hover disabled:opacity-50">Reply</button>
              <button type="button" disabled={isWorking} onClick={onCancelReply} className="px-1 text-xs font-semibold text-text-subtle hover:text-text-primary">Cancel</button>
            </form>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentThreadItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingToId={replyingToId}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              onToggleLike={onToggleLike}
              onDelete={onDelete}
              isWorking={isWorking}
            />
          ))}
        </div>
      )}
    </div>
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
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
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

  const startReply = (comment) => {
    setReplyingTo(comment)
    setReplyText('')
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setReplyText('')
  }

  const submitReply = async (event, parentComment) => {
    event.preventDefault()
    if (!replyText.trim() || isWorking) return
    setIsWorking(true)
    setInteractionError('')
    try {
      const response = await createCommunityPostComment(item.postId, replyText.trim(), parentComment.id)
      setComments((current) => appendCommentReply(current, parentComment.id, response.data))
      setCommentsCount((current) => current + 1)
      cancelReply()
    } catch (error) {
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to publish your reply.'))
    } finally {
      setIsWorking(false)
    }
  }

  const toggleCommentLike = async (comment) => {
    if (isWorking) return
    const nextLiked = !comment.isLiked
    setComments((current) => updateCommentTree(current, comment.id, (item) => ({
      ...item,
      isLiked: nextLiked,
      likesCount: Math.max(0, item.likesCount + (nextLiked ? 1 : -1)),
    })))
    setIsWorking(true)
    setInteractionError('')
    try {
      const response = await setCommunityPostCommentLiked(item.postId, comment.id, nextLiked)
      setComments((current) => updateCommentTree(current, comment.id, (item) => ({
        ...item,
        isLiked: response.is_liked,
        likesCount: response.likes_count,
      })))
    } catch (error) {
      setComments((current) => updateCommentTree(current, comment.id, (item) => ({
        ...item,
        isLiked: !nextLiked,
        likesCount: Math.max(0, item.likesCount + (nextLiked ? -1 : 1)),
      })))
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to update this reply like.'))
    } finally {
      setIsWorking(false)
    }
  }

  const removeComment = async (commentId) => {
    if (isWorking) return
    setIsWorking(true)
    setInteractionError('')
    try {
      const response = await deleteCommunityPostComment(item.postId, commentId)
      setComments((current) => removeCommentFromTree(current, commentId))
      setCommentsCount(response.comments_count)
      if (replyingTo?.id === commentId) cancelReply()
    } catch (error) {
      setInteractionError(getCommunityPostErrorMessage(error, 'Unable to delete this comment.'))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <article className={feedCardClasses}>
      <CardLink path={detailPath} label={`Open ${item.title}`} preserveScrollPosition={preserveScrollPosition} />
      <div className={`pointer-events-none relative z-[1] border-b border-border/70 bg-surface-muted/65 ${compact ? 'px-4 py-2' : 'px-4 py-2.5'}`}>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono font-bold text-primary ${compact ? 'h-8 w-8 text-[11px]' : 'h-9 w-9 text-xs'}`}>{getInitials(item.author)}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text-primary">
                {item.authorId ? <Link to={`/member/community/members/${item.authorId}`} className="pointer-events-auto relative z-10 no-underline hover:text-primary hover:no-underline">{item.author}</Link> : item.author}
              </p>
              <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-text-subtle">
                <span className="truncate">{item.meta}</span><span aria-hidden="true">•</span><span>{item.type}</span>
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{item.categoryLabel || item.filter}</span>
        </div>
      </div>

      <div className={`pointer-events-none relative z-[1] flex flex-1 flex-col ${compact ? 'px-4 py-3' : 'px-4 py-3'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-1 text-sm font-bold text-text-primary">{item.title}</h3>
          {item.attending && <span className="rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success-text">Attending</span>}
        </div>

        <p className={`mt-1.5 break-words text-sm leading-6 text-text-muted ${isExpanded ? '' : 'line-clamp-2'}`}>{visibleDescription}</p>
        {item.deadline && <p className="mt-2 text-xs text-text-subtle">Deadline: {item.deadline}</p>}
        <PostMedia images={item.images} videoUrl={item.videoUrl} compact={compact} />
        {(item.tags ?? []).length > 0 && (
          <div className={`mt-2 flex flex-wrap gap-1.5`}>
            {(item.tags ?? []).slice(0, 4).map((tag) => <span key={tag} className="max-w-full break-words rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">{tag}</span>)}
          </div>
        )}

        <div className="pointer-events-auto relative z-10 mt-3 flex flex-wrap items-center gap-0.5 border-t border-border/70 pt-2">
          
          {isPost && (
            <>
              <button type="button" aria-pressed={isLiked} data-busy={isWorking || undefined} onClick={toggleLike} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-bold transition-colors hover:bg-primary/10 ${isLiked ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}><span className={isLiked ? 'lp-like-pop inline-flex' : 'inline-flex'} key={isLiked ? 'on' : 'off'}><ActionIcon type="like" filled={isLiked} /></span> Like{likesCount > 0 ? ` · ${likesCount}` : ''}</button>
              <button type="button" aria-expanded={isCommenting} onClick={toggleComments} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"><ActionIcon type="comment" /> Comment{commentsCount > 0 ? ` · ${commentsCount}` : ''}</button>
            </>
          )}
          {shouldCollapse && (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="ml-auto rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-primary transition-colors hover:bg-primary/10"
            >
              {isExpanded ? 'Show less' : 'View more'}
            </button>
          )}

          {item.saveType && item.saveId && (
            <SaveButton
              type={item.saveType}
              itemId={item.saveId}
              initialSaved={item.isSaved}
              className={shouldCollapse ? '' : 'ml-auto'}
              onChange={(nextSaved) => {
                onSavedChange?.(item, nextSaved)
                if (!nextSaved) onUnsaved?.(item)
              }}
            />
          )}
        </div>

        {interactionError && <p role="alert" className="pointer-events-auto relative z-10 mt-3 text-sm text-danger-text">{interactionError}</p>}
        {isCommenting && (
          <div className="pointer-events-auto relative z-10 mt-3 rounded-xl border border-border bg-background/55 p-3">
            <form onSubmit={submitComment} className="flex gap-2">
              <input type="text" value={commentText} maxLength="1000" onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." aria-label="Comment text" className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
              <button type="submit" disabled={isWorking || isCommentsLoading || !commentText.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-contrast hover:bg-primary-hover disabled:opacity-50">Post</button>
            </form>
            {isCommentsLoading && comments.length === 0 ? <p className="mt-3 text-sm text-text-muted">Loading comments...</p> : comments.length > 0 ? (
              <div className="mt-3 space-y-2.5">{comments.map((comment) => (
                <CommentThreadItem
                  key={comment.id}
                  comment={comment}
                  replyingToId={replyingTo?.id ?? null}
                  replyText={replyText}
                  onReplyTextChange={setReplyText}
                  onStartReply={startReply}
                  onCancelReply={cancelReply}
                  onSubmitReply={submitReply}
                  onToggleLike={toggleCommentLike}
                  onDelete={removeComment}
                  isWorking={isWorking}
                />
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
