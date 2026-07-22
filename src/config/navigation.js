export const ROLE_NAVIGATION = {
  candidate: [
    { key: 'dashboard', label: 'Dashboard', path: '/candidate/dashboard' },
    { key: 'profile', label: 'Profile', path: '/candidate/profile' },
    { key: 'jobs', label: 'Jobs', path: '/jobs' },
    { key: 'applications', label: 'My Applications', path: '/candidate/applications' },
    { key: 'projects', label: 'Projects', path: '/projects' },
    { key: 'bids', label: 'My Bids', path: '/candidate/bids' },
    { key: 'circles', label: 'Circles', path: '/circles' },
    { key: 'logout', label: 'Logout', path: '/login' },
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
