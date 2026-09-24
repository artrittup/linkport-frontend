export const COMMUNITY_POST_CATEGORIES = {
  GENERAL: 'general',
  PROJECT_UPDATE: 'project_update',
  QUESTION: 'question',
  ACHIEVEMENT: 'achievement',
  OPPORTUNITY_TIP: 'opportunity_tip',
  TECH_DISCUSSION: 'tech_discussion',
  CAREER_ADVICE: 'career_advice',
  SHOWCASE: 'showcase',
  RESOURCE: 'resource',
  COLLABORATION: 'collaboration',
  FEEDBACK: 'feedback',
}

const categoryLabels = {
  [COMMUNITY_POST_CATEGORIES.GENERAL]: 'General',
  [COMMUNITY_POST_CATEGORIES.PROJECT_UPDATE]: 'Project update',
  [COMMUNITY_POST_CATEGORIES.QUESTION]: 'Question',
  [COMMUNITY_POST_CATEGORIES.ACHIEVEMENT]: 'Achievement',
  [COMMUNITY_POST_CATEGORIES.OPPORTUNITY_TIP]: 'Opportunity tip',
  [COMMUNITY_POST_CATEGORIES.TECH_DISCUSSION]: 'Tech discussion',
  [COMMUNITY_POST_CATEGORIES.CAREER_ADVICE]: 'Career advice',
  [COMMUNITY_POST_CATEGORIES.SHOWCASE]: 'Showcase',
  [COMMUNITY_POST_CATEGORIES.RESOURCE]: 'Resource',
  [COMMUNITY_POST_CATEGORIES.COLLABORATION]: 'Collaboration',
  [COMMUNITY_POST_CATEGORIES.FEEDBACK]: 'Feedback wanted',
}

export const COMMUNITY_POST_CATEGORY_OPTIONS = Object.entries(categoryLabels).map(([value, label]) => ({
  value,
  label,
}))

export function getCommunityPostCategoryLabel(category) {
  return categoryLabels[category] ?? 'General'
}

export function mapCommunityPost(post) {
  if (!post || typeof post !== 'object') return null

  const author = post.author && typeof post.author === 'object' ? post.author : null

  return {
    id: post.id,
    authorId: post.user_id ?? author?.id ?? null,
    text: post.content ?? '',
    content: post.content ?? '',
    category: post.category ?? COMMUNITY_POST_CATEGORIES.GENERAL,
    tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
    images: Array.isArray(post.images) ? post.images.filter(Boolean) : [],
    videoUrl: post.video_url ?? null,
    videoDuration: post.video_duration_seconds ?? null,
    likesCount: Number(post.likes_count ?? 0),
    commentsCount: Number(post.comments_count ?? 0),
    isLiked: Boolean(post.is_liked),
    isSaved: Boolean(post.is_saved),
    authorName: author?.name ?? 'LinkPort member',
    authorHeadline: author?.headline ?? '',
    authorLocation: author?.location ?? '',
    createdAt: post.created_at ?? null,
    updatedAt: post.updated_at ?? null,
  }
}

export function toCommunityPostPayload(form) {
  const payload = new FormData()
  payload.append('content', form.text.trim())
  payload.append('category', form.category)
  form.tags.forEach((tag, index) => payload.append(`tags[${index}]`, tag))
  ;(form.images ?? []).forEach((image, index) => payload.append(`images[${index}]`, image))
  if (form.video) {
    payload.append('video', form.video)
    payload.append('video_duration_seconds', String(form.videoDuration))
  }

  return payload
}
