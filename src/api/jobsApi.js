import api from './axios'
import { normalizeFlatPaginatedResponse } from '../utils/apiResponse'

export function normalizeJob(job) {
  if (!job) return null

  return {
    ...job,
    company:
      job.company?.company_profile?.company_name ??
      job.company?.name ??
      'Unknown company',
    companyData: job.company ?? null,
    skills: Array.isArray(job.skills) ? job.skills : [],
    type: job.type ?? null,
  }
}

export async function getJobs(params) {
  const response = await api.get('/jobs', { params })
  return normalizeFlatPaginatedResponse(response.data, {
    mapItem: normalizeJob,
    perPage: params?.per_page ?? 15,
  })
}

export async function getJobById(id) {
  const response = await api.get(`/jobs/${id}`)
  return { ...response.data, job: normalizeJob(response.data.job) }
}

export async function getCompanyJobs(params) {
  const response = await api.get('/company/jobs', { params })
  return normalizeFlatPaginatedResponse(response.data, {
    mapItem: (job) => ({
      ...normalizeJob(job),
      applications: Number(job.applications_count ?? 0),
      status: job.status
        ? job.status.charAt(0).toUpperCase() + job.status.slice(1)
        : 'Unknown',
      deadline: job.deadline?.slice(0, 10) ?? '',
    }),
    perPage: params?.per_page ?? 15,
  })
}

export async function createJob(data) {
  const response = await api.post('/jobs', data)
  return response.data
}

export async function updateJob(id, data) {
  const response = await api.put(`/jobs/${id}`, data)
  return response.data
}

export async function deleteJob(id) {
  const response = await api.delete(`/jobs/${id}`)
  return response.data
}

export async function applyToJob(jobId, data) {
  const response = await api.post(`/jobs/${jobId}/applications`, {
    cover_letter: data.cover_letter ?? data.coverLetter ?? null,
  })
  return response.data
}
