import api from './axios'

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
  const payload = response.data

  return {
    ...payload,
    data: Array.isArray(payload.data)
      ? payload.data.map(normalizeProject)
      : [],
  }
}

export async function getProjectById(id) {
  const response = await api.get(`/projects/${id}`)
  return {
    ...response.data,
    project: normalizeProject(response.data.project),
  }
}

export async function createProject(data) {
  const response = await api.post("/projects", data);
  return response.data;
}

export async function updateProject(id, data) {
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
}

export async function deleteProject(id) {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
}

export async function sendProjectBid(projectId, data) {
  const response = await api.post(`/projects/${projectId}/bids`, data);
  return response.data;
}
