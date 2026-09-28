export const CANDIDATE_ACTIVITY_TABS = [
  { id: 'applications', label: 'Applications' },
  { id: 'bids', label: 'Bids' },
  { id: 'projects', label: 'Projects' },
  { id: 'posts', label: 'Posts' },
  { id: 'saved', label: 'Saved' },
]

export const ACTIVITY_STATUSES = ['All statuses', 'Pending', 'Accepted', 'Rejected']

const validTabs = new Set(CANDIDATE_ACTIVITY_TABS.map((tab) => tab.id))

export function normalizeCandidateActivityTab(tab) {
  const aliases = {
    proposals: 'bids',
    content: 'projects',
    events: 'saved',
  }
  const normalized = aliases[tab] ?? tab
  return validTabs.has(normalized) ? normalized : 'overview'
}

export function getCandidateActivityPath(tab = 'overview') {
  const normalizedTab = normalizeCandidateActivityTab(tab)
  return normalizedTab === 'overview'
    ? '/member/activity'
    : `/member/activity/${normalizedTab}`
}
