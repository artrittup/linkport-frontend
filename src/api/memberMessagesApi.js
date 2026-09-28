/**
 * Frontend boundary for member messaging.
 *
 * The Laravel API does not expose conversations or messages yet. Keeping the
 * empty response here lets the UI adopt the real API later without coupling
 * page components to a temporary endpoint or mock records.
 */
export async function getMemberConversations() {
  return {
    data: [],
    backendAvailable: false,
  }
}
