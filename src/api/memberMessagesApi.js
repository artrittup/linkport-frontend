import api from './axios'

function mapMessage(message) {
  if (!message) return null
  return {
    id: String(message.id),
    body: message.body ?? '',
    senderId: String(message.sender_id),
    senderName: message.sender_name ?? '',
    isMine: Boolean(message.is_mine),
    createdAt: message.created_at ?? null,
  }
}

export function mapConversation(conversation) {
  if (!conversation) return null
  return {
    id: String(conversation.id),
    status: conversation.status ?? 'pending',
    initiatedBy: String(conversation.initiated_by),
    isInitiator: Boolean(conversation.is_initiator),
    canSend: Boolean(conversation.can_send),
    canRespondToRequest: Boolean(conversation.can_respond_to_request),
    otherMember: {
      id: String(conversation.other_member?.id ?? ''),
      name: conversation.other_member?.name ?? 'LinkPort member',
      headline: conversation.other_member?.headline ?? '',
      location: conversation.other_member?.location ?? '',
    },
    lastMessage: mapMessage(conversation.last_message),
    messages: Array.isArray(conversation.messages)
      ? conversation.messages.map(mapMessage).filter(Boolean)
      : [],
    acceptedAt: conversation.accepted_at ?? null,
    createdAt: conversation.created_at ?? null,
    updatedAt: conversation.updated_at ?? null,
  }
}

export async function getMemberConversations(params = {}) {
  const response = await api.get('/conversations', { params })
  return {
    data: Array.isArray(response.data?.data)
      ? response.data.data.map(mapConversation).filter(Boolean)
      : [],
    meta: response.data?.meta ?? response.data ?? null,
  }
}

export async function getMemberConversation(id) {
  const response = await api.get(`/conversations/${id}`)
  return mapConversation(response.data?.conversation)
}

export async function startMemberConversation(recipientId, body) {
  const response = await api.post('/conversations', { recipient_id: recipientId, body })
  return { ...response.data, conversation: mapConversation(response.data?.conversation) }
}

export async function sendMemberMessage(conversationId, body) {
  const response = await api.post(`/conversations/${conversationId}/messages`, { body })
  return { ...response.data, data: mapMessage(response.data?.data) }
}

export async function acceptMessageRequest(conversationId) {
  const response = await api.patch(`/conversations/${conversationId}/accept`)
  return { ...response.data, conversation: mapConversation(response.data?.conversation) }
}

export async function declineMessageRequest(conversationId) {
  const response = await api.patch(`/conversations/${conversationId}/decline`)
  return { ...response.data, conversation: mapConversation(response.data?.conversation) }
}

export function getMemberMessageError(error, fallback = 'Unable to update this conversation.') {
  const validationErrors = error.response?.data?.errors
  const messages = validationErrors && typeof validationErrors === 'object'
    ? Object.values(validationErrors).flat().filter(Boolean)
    : []
  return messages.length > 0 ? messages.join(' ') : error.response?.data?.message || fallback
}
