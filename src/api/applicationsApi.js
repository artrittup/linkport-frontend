import api from './axios'
import { normalizeFlatPaginatedResponse } from '../utils/apiResponse'

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(value),
      )
    : 'Unknown date'

function normalizeApplication(application) {
  const job = application?.job ?? {}
  const company = job.company ?? {}

  return {
    ...application,
    status: capitalize(application?.status),
    coverLetter: application?.cover_letter ?? '',
    messagePreview: application?.cover_letter || 'No cover letter provided.',
    dateApplied: formatDate(application?.created_at),
    jobTitle: job.title ?? 'Unavailable job',
    company:
      company.company_profile?.company_name ??
      company.name ??
      'Unknown company',
    location: job.location ?? 'Location unavailable',
    deadline: job.deadline ?? null,
    job,
  }
}

export async function getMyApplications(params) {
  const response = await api.get('/applications/my', { params })
  return normalizeFlatPaginatedResponse(response.data, {
    mapItem: normalizeApplication,
    perPage: params?.per_page ?? 15,
  })
}

const normalizeCompanyApplication = (application) => {
  const candidate = application?.candidate ?? {}
  const profile = candidate.candidate_profile ?? {}
  const job = application?.job ?? {}

  return {
    ...application,
    status: capitalize(application?.status),
    coverLetter: application?.cover_letter ?? '',
    dateApplied: formatDate(application?.created_at),
    candidateName: candidate.name ?? 'Unknown candidate',
    candidateEmail: candidate.email ?? '',
    headline: profile.headline ?? 'Headline not provided',
    location: profile.location ?? 'Location not provided',
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    jobTitle: job.title ?? 'Unavailable job',
    candidate,
    job,
  }
}

export async function getCompanyApplications(params) {
  const response = await api.get('/company/applications', { params })
  return normalizeFlatPaginatedResponse(response.data, {
    mapItem: normalizeCompanyApplication,
    perPage: params?.per_page ?? 15,
  })
}

export async function acceptApplication(id) {
  const response = await api.patch(`/job-applications/${id}/accept`)
  return response.data
}

export async function rejectApplication(id) {
  const response = await api.patch(`/job-applications/${id}/reject`)
  return response.data
}
