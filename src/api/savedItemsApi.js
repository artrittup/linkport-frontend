import { mapSavedItemRecord } from '../data/savedItemMapper'
import api from './axios'

export async function getSavedItems(params = {}) {
  const response = await api.get('/saved-items', { params })
  return {
    data: Array.isArray(response.data?.data)
      ? response.data.data.map(mapSavedItemRecord).filter(Boolean)
      : [],
    meta: response.data?.meta ?? null,
  }
}

export async function setSavedItem(type, itemId, isSaved) {
  const response = isSaved
    ? await api.post('/saved-items', { type, item_id: itemId })
    : await api.delete(`/saved-items/${type}/${itemId}`)
  return response.data
}

export function getSavedItemErrorMessage(error, fallback = 'Unable to update your saved items.') {
  const validationErrors = error.response?.data?.errors
  if (validationErrors && typeof validationErrors === 'object') {
    const messages = Object.values(validationErrors).flat().filter(Boolean)
    if (messages.length > 0) return messages.join(' ')
  }

  return error.response?.data?.message || fallback
}
