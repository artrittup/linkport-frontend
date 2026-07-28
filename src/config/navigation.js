export const ROLE_NAVIGATION = {
  candidate: [
    { key: 'home', label: 'Home', path: '/candidate/home' },
    { key: 'projects', label: 'Projects', path: '/candidate/projects' },
    { key: 'opportunities', label: 'Opportunities', path: '/candidate/opportunities' },
    { key: 'community', label: 'Community', path: '/candidate/community' },
    { key: 'profile', label: 'Profile', path: '/candidate/profile' },
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
