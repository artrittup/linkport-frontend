export const COMMUNITY_POST_CATEGORIES = {
  GENERAL: 'general',
  PROJECT_UPDATE: 'project_update',
  QUESTION: 'question',
  ACHIEVEMENT: 'achievement',
  OPPORTUNITY_TIP: 'opportunity_tip',
}

const categoryLabels = {
  [COMMUNITY_POST_CATEGORIES.GENERAL]: 'General',
  [COMMUNITY_POST_CATEGORIES.PROJECT_UPDATE]: 'Project update',
  [COMMUNITY_POST_CATEGORIES.QUESTION]: 'Question',
  [COMMUNITY_POST_CATEGORIES.ACHIEVEMENT]: 'Achievement',
  [COMMUNITY_POST_CATEGORIES.OPPORTUNITY_TIP]: 'Opportunity tip',
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
    authorName: author?.name ?? 'LinkPort member',
    authorHeadline: author?.headline ?? '',
    authorLocation: author?.location ?? '',
    createdAt: post.created_at ?? null,
    updatedAt: post.updated_at ?? null,
  }
}

export function toCommunityPostPayload(form) {
  return {
    content: form.text.trim(),
    category: form.category,
    tags: form.tags,
  }
}
