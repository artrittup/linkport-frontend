import { mapCommunityPost } from '../data/communityPostMapper'
import { normalizePaginatedResponse } from '../utils/apiResponse'
import api from './axios'

function mapPostPayload(payload) {
  return {
    ...payload,
    data: mapCommunityPost(payload?.data),
  }
}

export async function getCommunityPosts(params = {}) {
  const response = await api.get('/community-posts', { params })
  return normalizePaginatedResponse(response.data, {
    mapItem: mapCommunityPost,
    perPage: params.per_page ?? 15,
  })
}

export async function getCommunityPost(id) {
  const response = await api.get(`/community-posts/${id}`)
  return mapPostPayload(response.data)
}

export async function createCommunityPost(payload) {
  const response = await api.post('/community-posts', payload, payload instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined)
  return mapPostPayload(response.data)
}

export async function updateCommunityPost(id, payload) {
  const response = await api.patch(`/community-posts/${id}`, payload)
  return mapPostPayload(response.data)
}

export async function deleteCommunityPost(id) {
  const response = await api.delete(`/community-posts/${id}`)
  return response.data
}

export async function setCommunityPostLiked(id, isLiked) {
  const response = isLiked
    ? await api.post(`/community-posts/${id}/like`)
    : await api.delete(`/community-posts/${id}/like`)
  return response.data
}

export async function getCommunityPostComments(id) {
  const response = await api.get(`/community-posts/${id}/comments`)
  return normalizePaginatedResponse(response.data, {
    mapItem: mapCommunityPostComment,
    perPage: 20,
  })
}

export async function createCommunityPostComment(id, content) {
  const response = await api.post(`/community-posts/${id}/comments`, { content })
  return {
    ...response.data,
    data: mapCommunityPostComment(response.data?.data),
  }
}

export async function deleteCommunityPostComment(postId, commentId) {
  const response = await api.delete(`/community-posts/${postId}/comments/${commentId}`)
  return response.data
}

function mapCommunityPostComment(comment) {
  if (!comment || typeof comment !== 'object') return null
  return {
    id: comment.id,
    content: comment.content ?? '',
    authorName: comment.author?.name ?? 'LinkPort member',
    canDelete: Boolean(comment.can_delete),
    createdAt: comment.created_at ?? null,
  }
}

export function getCommunityPostErrorMessage(error, fallback = 'Community posts are temporarily unavailable. Please try again.') {
  const validationErrors = error.response?.data?.errors
  const validationMessages = validationErrors && typeof validationErrors === 'object'
    ? Object.values(validationErrors).flat().filter(Boolean)
    : []

  if (validationMessages.length > 0) return validationMessages.join(' ')

  const status = error.response?.status
  return status && status < 500
    ? error.response?.data?.message || fallback
    : fallback
}

export function getCommunityPostValidationErrors(error) {
  const validationErrors = error.response?.data?.errors
  if (!validationErrors || typeof validationErrors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(validationErrors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.filter(Boolean).join(' ') : String(messages),
    ]),
  )
}

export function isCommunityPostNotFound(error) {
  return error.response?.status === 404
}
