export const CANDIDATE_ACTIVITY_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'applications', label: 'Applications' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'content', label: 'Content' },
  { id: 'events', label: 'Events' },
]

export const ACTIVITY_STATUSES = ['All statuses', 'Pending', 'Accepted', 'Rejected']

const validTabs = new Set(CANDIDATE_ACTIVITY_TABS.map((tab) => tab.id))

export function normalizeCandidateActivityTab(tab) {
  return validTabs.has(tab) ? tab : 'overview'
}

export function getCandidateActivityPath(tab = 'overview') {
  const normalizedTab = normalizeCandidateActivityTab(tab)
  return normalizedTab === 'overview'
    ? '/member/activity'
    : `/member/activity?tab=${normalizedTab}`
}
