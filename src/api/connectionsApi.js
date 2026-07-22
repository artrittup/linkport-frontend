import api from './axios'

export async function sendConnectionRequest(receiverId) {
  const response = await api.post('/connections', { receiver_id: receiverId })
  return response.data
}

export async function getConnections(params = {}) {
  const response = await api.get('/connections', { params })
  return response.data
}

export async function getIncomingConnectionRequests(params = {}) {
  const response = await api.get('/connections/requests', { params })
  return response.data
}

export async function getSentConnectionRequests(params = {}) {
  const response = await api.get('/connections/sent', { params })
  return response.data
}

export async function getConnectionStatus(userId) {
  const response = await api.get(`/connections/status/${userId}`)
  return response.data
}

export async function acceptConnection(id) {
  const response = await api.patch(`/connections/${id}/accept`)
  return response.data
}

export async function rejectConnection(id) {
  const response = await api.patch(`/connections/${id}/reject`)
  return response.data
}

export async function deleteConnection(id) {
  const response = await api.delete(`/connections/${id}`)
  return response.data
}

export function getConnectionErrorMessage(error, fallback = 'Unable to update this connection.') {
  const errors = error.response?.data?.errors
  const messages = errors ? Object.values(errors).flat().filter(Boolean) : []
  return messages.length ? messages.join(' ') : error.response?.data?.message || error.message || fallback
}
