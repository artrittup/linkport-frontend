const jobStatusGroups = {
  open: 'active',
  published: 'active',
  draft: 'draft',
  closed: 'closed',
  expired: 'expired',
}

const projectStatusGroups = {
  open: 'active',
  active: 'active',
  draft: 'draft',
  closed: 'closed',
  expired: 'expired',
}

const statusLabels = {
  active: 'Active',
  draft: 'Draft',
  closed: 'Closed',
  expired: 'Expired',
}

function readableStatus(value) {
  if (!value) return 'Unknown'
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function hasExpired(deadline) {
  if (!deadline) return false
  const endOfDeadline = new Date(`${String(deadline).slice(0, 10)}T23:59:59`)
  return !Number.isNaN(endOfDeadline.getTime()) && endOfDeadline < new Date()
}

function mapStatus(rawStatus, mappings, deadline) {
  const backendStatus = String(rawStatus ?? '').trim().toLowerCase()
  let group = mappings[backendStatus] ?? 'unknown'

  if (group === 'active' && hasExpired(deadline)) group = 'expired'

  return {
    statusGroup: group,
    statusLabel: statusLabels[group] ?? readableStatus(rawStatus),
  }
}

function normalizeDate(value) {
  return value ? String(value).slice(0, 10) : ''
}

export function mapJobOpportunity(job) {
  const deadline = normalizeDate(job.deadline)
  return {
    id: job.id,
    key: `job-${job.id}`,
    type: 'job',
    typeLabel: 'Job',
    title: job.title ?? 'Untitled job',
    description: job.description ?? '',
    createdAt: normalizeDate(job.created_at),
    deadline,
    location: job.location ?? '',
    workStyle: job.type ?? '',
    searchableValues: [job.requirements, ...(job.skills ?? [])],
    responseCount: Number.isFinite(Number(job.applications))
      ? Number(job.applications)
      : null,
    responseLabel: 'applications',
    managementRoute: '/company/jobs',
    applicationsRoute: '/company/applications?type=applications',
    rawData: job,
    ...mapStatus(job.status, jobStatusGroups, deadline),
  }
}

export function mapProjectOpportunity(project) {
  const deadline = normalizeDate(project.deadline)
  return {
    id: project.id,
    key: `project-${project.id}`,
    type: 'project',
    typeLabel: 'Project',
    title: project.title ?? 'Untitled project',
    description: project.description ?? '',
    createdAt: normalizeDate(project.created_at),
    deadline,
    location: '',
    workStyle: project.category ?? '',
    searchableValues: [project.category, ...(project.skills ?? [])],
    responseCount: Number.isFinite(Number(project.bids))
      ? Number(project.bids)
      : null,
    responseLabel: 'proposals',
    managementRoute: '/company/projects',
    applicationsRoute: '/company/bids?type=proposals',
    rawData: project,
    ...mapStatus(project.status, projectStatusGroups, deadline),
  }
}

export function opportunityMatchesSearch(opportunity, query) {
  if (!query) return true
  return [
    opportunity.title,
    opportunity.description,
    opportunity.location,
    opportunity.workStyle,
    ...opportunity.searchableValues,
  ].some((value) => String(value ?? '').toLowerCase().includes(query))
}
