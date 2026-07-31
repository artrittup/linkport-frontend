export const TEAMMATE_REQUEST_COMMITMENTS = {
  FEW_HOURS_WEEKLY: 'few_hours_weekly',
  PART_TIME: 'part_time',
  WEEKEND_PROJECT: 'weekend_project',
  SHORT_TERM_CHALLENGE: 'short_term_challenge',
  FLEXIBLE: 'flexible',
}

export const TEAMMATE_REQUEST_WORK_STYLES = {
  REMOTE: 'remote',
  IN_PERSON: 'in_person',
  FLEXIBLE: 'flexible',
}

export const TEAMMATE_REQUEST_STATUSES = {
  OPEN: 'open',
  CLOSED: 'closed',
}

const commitmentLabels = {
  [TEAMMATE_REQUEST_COMMITMENTS.FEW_HOURS_WEEKLY]: 'A few hours per week',
  [TEAMMATE_REQUEST_COMMITMENTS.PART_TIME]: 'Part-time collaboration',
  [TEAMMATE_REQUEST_COMMITMENTS.WEEKEND_PROJECT]: 'Weekend project',
  [TEAMMATE_REQUEST_COMMITMENTS.SHORT_TERM_CHALLENGE]: 'Short-term challenge',
  [TEAMMATE_REQUEST_COMMITMENTS.FLEXIBLE]: 'Flexible',
}

const workStyleLabels = {
  [TEAMMATE_REQUEST_WORK_STYLES.REMOTE]: 'Remote',
  [TEAMMATE_REQUEST_WORK_STYLES.IN_PERSON]: 'In person',
  [TEAMMATE_REQUEST_WORK_STYLES.FLEXIBLE]: 'Flexible',
}

const statusLabels = {
  [TEAMMATE_REQUEST_STATUSES.OPEN]: 'Open',
  [TEAMMATE_REQUEST_STATUSES.CLOSED]: 'Closed',
}

function toOptions(labels) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }))
}

export const TEAMMATE_REQUEST_COMMITMENT_OPTIONS = toOptions(commitmentLabels)
export const TEAMMATE_REQUEST_WORK_STYLE_OPTIONS = toOptions(workStyleLabels)

export function getTeammateRequestCommitmentLabel(value) {
  return commitmentLabels[value] ?? 'Commitment unavailable'
}

export function getTeammateRequestWorkStyleLabel(value) {
  return workStyleLabels[value] ?? 'Work style unavailable'
}

export function getTeammateRequestStatusLabel(value) {
  return statusLabels[value] ?? 'Status unavailable'
}

export function mapTeammateRequest(request) {
  if (!request || typeof request !== 'object') return null

  const owner = request.owner && typeof request.owner === 'object' ? request.owner : null

  return {
    id: request.id,
    ownerId: request.user_id ?? owner?.id ?? null,
    title: request.title ?? '',
    description: request.description ?? '',
    rolesNeeded: Array.isArray(request.roles_needed) ? request.roles_needed.filter(Boolean) : [],
    skills: Array.isArray(request.skills) ? request.skills.filter(Boolean) : [],
    commitment: request.commitment ?? '',
    workStyle: request.work_style ?? '',
    preferredUniversity: request.preferred_university ?? '',
    preferredLocation: request.preferred_location ?? '',
    status: request.status ?? TEAMMATE_REQUEST_STATUSES.OPEN,
    ownerName: owner?.name ?? '',
    ownerHeadline: owner?.headline ?? '',
    ownerEducation: owner?.education ?? '',
    ownerLocation: owner?.location ?? '',
    ownerSkills: Array.isArray(owner?.skills) ? owner.skills.filter(Boolean) : [],
    createdAt: request.created_at ?? null,
    updatedAt: request.updated_at ?? null,
  }
}

export function toTeammateRequestPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    roles_needed: form.rolesNeeded,
    skills: form.skills,
    commitment: form.commitment,
    work_style: form.workStyle,
    preferred_university: form.preferredUniversity.trim() || null,
    preferred_location: form.preferredLocation.trim() || null,
  }
}
