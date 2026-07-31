import { getCommunityProjectStatusLabel } from './communityProjectMapper'
import { getCommunityPostCategoryLabel } from './communityPostMapper'
import { getTeammateRequestStatusLabel } from './teammateRequestMapper'

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
      path: `/member/projects/${project.id}`,
      action: 'View project',
    })),
    ...posts.map((post) => ({
      id: `post-${post.id}`,
      sourceId: post.id,
      type: 'Posts',
      label: 'Post',
      title: getCommunityPostCategoryLabel(post.category),
      description: post.text,
      status: 'Published',
      createdAt: post.createdAt,
      path: '/member/home',
      action: 'View on Home',
    })),
    ...teamRequests.map((request) => ({
      id: `team-${request.id}`,
      sourceId: request.id,
      type: 'Team requests',
      label: 'Team request',
      title: request.title,
      description: request.description,
      status: getTeammateRequestStatusLabel(request.status),
      createdAt: request.createdAt,
      path: `/member/community/team-requests/${request.id}`,
      action: 'View request',
    })),
  ].sort((first, second) => {
    const firstDate = Date.parse(first.createdAt)
    const secondDate = Date.parse(second.createdAt)
    return (Number.isFinite(secondDate) ? secondDate : 0) - (Number.isFinite(firstDate) ? firstDate : 0)
  })
}
