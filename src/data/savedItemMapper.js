import { normalizeJob } from '../api/jobsApi'
import { normalizeProject } from '../api/projectsApi'
import {
  formatCommunityEventDate,
  formatCommunityEventTime,
  getCommunityEventLocationLabel,
  mapCommunityEvent,
} from './communityEventMapper'
import { getCommunityPostCategoryLabel, mapCommunityPost } from './communityPostMapper'
import { getCommunityProjectStatusLabel, mapCommunityProject } from './communityProjectMapper'
import { jobToOpportunity, projectToOpportunity } from './opportunityAdapters'
import { getTeammateRequestWorkStyleLabel, mapTeammateRequest } from './teammateRequestMapper'

export const SAVED_ITEM_TYPES = {
  COMMUNITY_PROJECT: 'community_project',
  COMMUNITY_POST: 'community_post',
  TEAMMATE_REQUEST: 'teammate_request',
  COMMUNITY_EVENT: 'community_event',
  JOB: 'job',
  PROJECT: 'project',
}

export function getSavedItemKey(type, itemId) {
  return `${type}:${itemId}`
}

function formatTimestamp(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Recently'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function mapSavedItemRecord(record) {
  if (!record?.type || !record?.item) return null

  const item = {
    [SAVED_ITEM_TYPES.COMMUNITY_PROJECT]: mapCommunityProject,
    [SAVED_ITEM_TYPES.COMMUNITY_POST]: mapCommunityPost,
    [SAVED_ITEM_TYPES.TEAMMATE_REQUEST]: mapTeammateRequest,
    [SAVED_ITEM_TYPES.COMMUNITY_EVENT]: mapCommunityEvent,
    [SAVED_ITEM_TYPES.JOB]: normalizeJob,
    [SAVED_ITEM_TYPES.PROJECT]: normalizeProject,
  }[record.type]?.(record.item)

  return item ? {
    type: record.type,
    itemId: record.item_id,
    savedAt: record.saved_at ?? null,
    item,
  } : null
}

export function savedItemRecordToFeedItem(record) {
  const { type, itemId, item } = record
  const common = {
    id: `saved-${type}-${itemId}`,
    saveType: type,
    saveId: itemId,
    isSaved: true,
    savedAt: record.savedAt,
  }

  if (type === SAVED_ITEM_TYPES.COMMUNITY_POST) {
    const categoryLabel = getCommunityPostCategoryLabel(item.category)
    return {
      ...common,
      postId: item.id,
      filter: 'Posts',
      type: 'POST',
      title: categoryLabel,
      categoryLabel,
      description: item.text,
      author: item.authorName,
      tags: item.tags,
      images: item.images,
      videoUrl: item.videoUrl,
      likesCount: item.likesCount,
      commentsCount: item.commentsCount,
      isLiked: item.isLiked,
      meta: formatTimestamp(item.createdAt),
      createdAt: item.createdAt,
    }
  }

  if (type === SAVED_ITEM_TYPES.COMMUNITY_PROJECT) return {
    ...common,
    filter: 'Projects',
    type: 'PROJECT',
    title: item.title,
    description: item.description,
    author: item.creator,
    tags: item.skills,
    meta: getCommunityProjectStatusLabel(item.status),
    action: 'View project',
    path: `/member/projects/${item.id}`,
    createdAt: item.createdAt,
  }

  if (type === SAVED_ITEM_TYPES.TEAMMATE_REQUEST) return {
    ...common,
    filter: 'Team',
    type: 'LOOKING FOR TEAM',
    title: item.title,
    description: item.description,
    author: item.ownerName || 'Owner information unavailable',
    tags: item.skills,
    meta: `${item.rolesNeeded.length} ${item.rolesNeeded.length === 1 ? 'role' : 'roles'} · ${getTeammateRequestWorkStyleLabel(item.workStyle)}`,
    action: 'View request',
    path: `/member/community/team-requests/${item.id}`,
    createdAt: item.createdAt,
  }

  if (type === SAVED_ITEM_TYPES.COMMUNITY_EVENT) return {
    ...common,
    filter: 'Events',
    type: item.status === 'cancelled' ? 'EVENT · CANCELLED' : 'EVENT',
    title: item.title,
    description: item.shortDescription,
    author: item.organizer,
    tags: item.topics,
    meta: `${formatCommunityEventDate(item.startsAt)} · ${formatCommunityEventTime(item.startsAt, item.endsAt)} · ${getCommunityEventLocationLabel(item)}`,
    action: 'View event',
    path: `/member/community/events/${item.id}`,
    attending: item.isAttending,
    createdAt: item.createdAt,
  }

  const opportunity = type === SAVED_ITEM_TYPES.JOB
    ? jobToOpportunity(item)
    : projectToOpportunity(item)

  return {
    ...common,
    filter: 'Opportunities',
    type: opportunity.type,
    title: opportunity.title,
    description: opportunity.description,
    author: opportunity.company,
    tags: opportunity.skills,
    meta: opportunity.location,
    action: 'View opportunity',
    path: `/member/opportunities/${opportunity.id}`,
    createdAt: opportunity.sourceData?.created_at ?? null,
  }
}
