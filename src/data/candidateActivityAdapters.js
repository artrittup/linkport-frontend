import { getCommunityProjectStatusLabel } from './communityProjectMapper'

export function formatActivityDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

export function getCandidateContentItems({ projects, posts, teamRequests }) {
  return [
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      sourceId: project.id,
      type: 'Projects',
      label: 'Project',
      title: project.title,
      description: project.description,
      status: getCommunityProjectStatusLabel(project.status),
      createdAt: project.createdAt,
      path: `/candidate/projects/${project.id}`,
      action: 'View project',
    })),
    ...posts.map((post) => ({
      id: `post-${post.id}`,
      sourceId: post.id,
      type: 'Posts',
      label: 'Post',
      title: post.category || 'Community post',
      description: post.text,
      status: 'Published',
      createdAt: post.createdAt,
      path: '/candidate/home',
      action: 'View on Home',
    })),
    ...teamRequests.map((request) => ({
      id: `team-${request.id}`,
      sourceId: request.id,
      type: 'Team requests',
      label: 'Team request',
      title: request.title,
      description: request.context,
      status: 'Looking for team',
      createdAt: request.createdAt,
      path: '/candidate/community#collaboration',
      action: 'View request',
    })),
  ].sort((first, second) => {
    const firstDate = Date.parse(first.createdAt)
    const secondDate = Date.parse(second.createdAt)
    return (Number.isFinite(secondDate) ? secondDate : 0) - (Number.isFinite(firstDate) ? firstDate : 0)
  })
}
