export const COMMUNITY_PROJECT_STATUSES = {
  LOOKING_FOR_TEAM: 'looking_for_team',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
}

const legacyStatuses = {
  'LOOKING FOR TEAM': COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM,
  'IN PROGRESS': COMMUNITY_PROJECT_STATUSES.IN_PROGRESS,
  COMPLETED: COMMUNITY_PROJECT_STATUSES.COMPLETED,
}

const statusLabels = {
  [COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM]: 'LOOKING FOR TEAM',
  [COMMUNITY_PROJECT_STATUSES.IN_PROGRESS]: 'IN PROGRESS',
  [COMMUNITY_PROJECT_STATUSES.COMPLETED]: 'COMPLETED',
}

export function normalizeCommunityProjectStatus(status) {
  return legacyStatuses[status] ?? status ?? COMMUNITY_PROJECT_STATUSES.IN_PROGRESS
}

export function getCommunityProjectStatusLabel(status) {
  return statusLabels[normalizeCommunityProjectStatus(status)] ?? 'UNKNOWN'
}

export function mapCommunityProject(project) {
  if (!project || typeof project !== 'object') return null

  const owner = project.owner && typeof project.owner === 'object' ? project.owner : null

  return {
    id: project.id,
    ownerId: project.user_id ?? owner?.id ?? null,
    title: project.title ?? 'Untitled project',
    description: project.short_description ?? '',
    shortDescription: project.short_description ?? '',
    fullDescription: project.full_description ?? project.short_description ?? '',
    status: normalizeCommunityProjectStatus(project.status),
    skills: Array.isArray(project.skills) ? project.skills.filter(Boolean) : [],
    lookingForTeammates: Boolean(project.looking_for_teammates),
    lookingForRoles: Array.isArray(project.roles_needed) ? project.roles_needed.filter(Boolean) : [],
    repositoryUrl: project.repository_url ?? '',
    liveUrl: project.live_url ?? '',
    createdAt: project.created_at ?? null,
    updatedAt: project.updated_at ?? null,
    creator: owner?.name ?? 'LinkPort member',
    creatorHeadline: owner?.headline ?? '',
    creatorLocation: owner?.location ?? '',
  }
}

export function toCommunityProjectPayload(form) {
  const lookingForTeammates = form.status === COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM
    || Boolean(form.lookingForTeam)

  return {
    title: form.title.trim(),
    short_description: form.description.trim(),
    full_description: form.fullDescription.trim() || null,
    status: lookingForTeammates
      ? COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM
      : form.status,
    skills: form.skills,
    looking_for_teammates: lookingForTeammates,
    roles_needed: lookingForTeammates ? form.roles : null,
    repository_url: form.repositoryUrl.trim() || null,
    live_url: form.liveUrl.trim() || null,
  }
}
