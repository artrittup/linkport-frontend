const applicationStatusLabels = {
  pending: 'Pending',
  under_review: 'Under review',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const proposalStatusLabels = {
  pending: 'Pending',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const APPLICATION_FILTER_STATUSES = ['pending', 'accepted', 'rejected']
export const PROPOSAL_FILTER_STATUSES = ['pending', 'accepted', 'rejected']

function readableStatus(value) {
  if (!value) return 'Unknown'
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function mapStatus(value, mappings) {
  const statusValue = String(value ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  return {
    statusValue,
    statusLabel: mappings[statusValue] ?? readableStatus(value),
  }
}

export function mapCompanyApplication(application) {
  const candidateId = application.candidate?.id ?? null
  const opportunityId = application.job?.id ?? null

  return {
    id: application.id,
    key: `application-${application.id}`,
    type: 'application',
    typeLabel: 'Application',
    candidateId,
    candidateName: application.candidateName,
    candidateHeadline: application.headline,
    candidateLocation: application.location,
    opportunityId,
    opportunityTitle: application.jobTitle,
    submittedAt: application.dateApplied,
    summary: application.coverLetter || 'No cover letter provided.',
    skills: application.skills ?? [],
    budget: null,
    duration: null,
    candidateRoute: candidateId ? `/company/talent/${candidateId}` : null,
    opportunityRoute: '/company/jobs',
    rawData: application,
    ...mapStatus(application.status, applicationStatusLabels),
  }
}

export function mapCompanyProposal(proposal) {
  const candidateId = proposal.candidate?.id ?? null
  const opportunityId = proposal.project?.id ?? null

  return {
    id: proposal.id,
    key: `proposal-${proposal.id}`,
    type: 'proposal',
    typeLabel: 'Proposal',
    candidateId,
    candidateName: proposal.candidateName,
    candidateHeadline: proposal.headline,
    candidateLocation: proposal.location,
    opportunityId,
    opportunityTitle: proposal.projectTitle,
    submittedAt: proposal.dateSubmitted,
    summary: proposal.proposalMessage || 'No proposal provided.',
    skills: proposal.skills ?? [],
    budget: proposal.offeredPrice,
    duration: proposal.deliveryDays
      ? `${proposal.deliveryDays} days`
      : 'Not specified',
    candidateRoute: candidateId ? `/company/talent/${candidateId}` : null,
    opportunityRoute: '/company/projects',
    rawData: proposal,
    ...mapStatus(proposal.status, proposalStatusLabels),
  }
}

export function responseMatchesSearch(response, query) {
  if (!query) return true
  return [
    response.candidateName,
    response.candidateHeadline,
    response.opportunityTitle,
    response.summary,
    ...response.skills,
  ].some((value) => String(value ?? '').toLowerCase().includes(query))
}
