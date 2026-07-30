export const ROLE_NAVIGATION = {
  candidate: [
    { key: 'home', label: 'Home', path: '/member/home' },
    { key: 'projects', label: 'Projects', path: '/member/projects' },
    { key: 'opportunities', label: 'Opportunities', path: '/member/opportunities' },
    { key: 'community', label: 'Community', path: '/member/community' },
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
