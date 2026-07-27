export const ROLE_NAVIGATION = {
  candidate: [
    { key: 'home', label: 'Home', path: '/candidate/home' },
    { key: 'projects', label: 'Projects', path: '/candidate/projects' },
    { key: 'opportunities', label: 'Opportunities', path: '/candidate/opportunities' },
    { key: 'community', label: 'Community', path: '/candidate/community' },
    { key: 'profile', label: 'Profile', path: '/candidate/profile' },
  ],
  company: [
    { key: 'dashboard', label: 'Dashboard', path: '/company/dashboard' },
    { key: 'profile', label: 'Company Profile', path: '/company/profile' },
    { key: 'jobs', label: 'Jobs', path: '/company/jobs' },
    { key: 'applications', label: 'Applications', path: '/company/applications' },
    { key: 'projects', label: 'Projects', path: '/company/projects' },
    { key: 'bids', label: 'Bids', path: '/company/bids' },
    { key: 'logout', label: 'Logout', path: '/login' },
  ],
  admin: [
    { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { key: 'users', label: 'Users', path: '/admin/users' },
    { key: 'jobs', label: 'Jobs', path: '/admin/jobs' },
    { key: 'projects', label: 'Projects', path: '/admin/projects' },
    { key: 'logout', label: 'Logout', path: '/login' },
  ],
}

export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] ?? []
}
