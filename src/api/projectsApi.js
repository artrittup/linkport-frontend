import api from './axios'
import { normalizeFlatPaginatedResponse } from '../utils/apiResponse'

export function normalizeProject(project) {
  if (!project) return null

  return {
    ...project,
    company:
      project.company?.company_profile?.company_name ??
      project.company?.name ??
      'Unknown company',
    companyData: project.company ?? null,
    skills: Array.isArray(project.required_skills)
      ? project.required_skills
      : [],
    category: project.category ?? null,
  }
}

export async function getProjects(params) {
  const response = await api.get('/projects', { params })
  return normalizeFlatPaginatedResponse(response.data, {
    mapItem: normalizeProject,
    perPage: params?.per_page ?? 15,
  })
}

export async function getProjectById(id) {
  const response = await api.get(`/projects/${id}`)
  return {
    ...response.data,
    project: normalizeProject(response.data.project),
  }
}

export async function getCompanyProjects(params) {
  const response = await api.get('/company/projects', { params })
  return normalizeFlatPaginatedResponse(response.data, {
    mapItem: (project) => ({
      ...normalizeProject(project),
      bids: Number(project.bids_count ?? 0),
      status: project.status
        ? project.status.charAt(0).toUpperCase() + project.status.slice(1)
        : 'Unknown',
      deadline: project.deadline?.slice(0, 10) ?? '',
    }),
    perPage: params?.per_page ?? 15,
  })
}

export async function createProject(data) {
  const response = await api.post('/projects', data)
  return response.data
}

export async function updateProject(id, data) {
  const response = await api.put(`/projects/${id}`, data)
  return response.data
}

export async function deleteProject(id) {
  const response = await api.delete(`/projects/${id}`)
  return response.data
}

export async function sendProjectBid(projectId, data) {
  const response = await api.post(`/projects/${projectId}/bids`, {
    amount: Number(data.amount),
    proposal: data.proposal ?? data.message,
    estimated_days: Number(data.estimated_days ?? data.estimatedDays),
  })
  return response.data
}
