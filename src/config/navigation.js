export const ROLE_NAVIGATION = {
  candidate: [
    { key: 'home', label: 'Home', path: '/member/home' },
    {
      key: 'community',
      label: 'Community',
      path: '/member/community',
      children: [
        { label: 'Discover', path: '/member/community/discover' },
        { label: 'Circles', path: '/member/community/circles' },
        { label: 'Members', path: '/member/community/members' },
      ],
    },
    {
      key: 'opportunities',
      label: 'Opportunities',
      path: '/member/opportunities',
      children: [
        { label: 'Jobs', path: '/member/opportunities/jobs' },
        { label: 'Projects', path: '/member/opportunities/projects' },
      ],
    },
    { key: 'messages', label: 'Messages', path: '/member/messages' },
    {
      key: 'activity',
      label: 'My Activity',
      path: '/member/activity',
      children: [
        { label: 'Applications', path: '/member/activity/applications' },
        { label: 'Bids', path: '/member/activity/bids' },
        { label: 'Projects', path: '/member/activity/projects' },
        { label: 'Posts', path: '/member/activity/posts' },
        { label: 'Saved', path: '/member/activity/saved' },
      ],
    },
    { key: 'profile', label: 'Profile', path: '/member/profile' },
  ],
  company: [
    { key: 'overview', label: 'Overview', path: '/company/overview' },
    { key: 'opportunities', label: 'Opportunities', path: '/company/opportunities' },
    { key: 'talent', label: 'Talent', path: '/company/talent' },
    { key: 'applications', label: 'Applications', path: '/company/applications' },
    { key: 'profile', label: 'Company Profile', path: '/company/profile' },
  ],
  admin: [
    { key: 'overview', label: 'Overview', path: '/admin/overview' },
    { key: 'users', label: 'Users', path: '/admin/users' },
    { key: 'opportunities', label: 'Opportunities', path: '/admin/opportunities' },
    { key: 'community', label: 'Community', path: '/admin/community' },
  ],
}

export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] ?? []
}
