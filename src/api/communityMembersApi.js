import { mapCommunityMember } from '../data/communityMemberMapper'
import { normalizePaginatedResponse } from '../utils/apiResponse'
import api from './axios'

export async function getCommunityMembers(params = {}) {
  const response = await api.get('/community-members', { params })
  return normalizePaginatedResponse(response.data, {
    mapItem: mapCommunityMember,
    perPage: params.per_page ?? 12,
  })
}

export async function getCommunityMember(userId) {
  const response = await api.get(`/community-members/${userId}`)
  return {
    ...response.data,
    data: mapCommunityMember(response.data?.data),
  }
}

export function getCommunityMemberErrorMessage(error, fallback = 'Community members are temporarily unavailable. Please try again.') {
  const status = error.response?.status
  return status && status < 500
    ? error.response?.data?.message || fallback
    : fallback
}

export function isCommunityMemberNotFound(error) {
  return error.response?.status === 404
}
