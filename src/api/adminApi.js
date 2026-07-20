import api from './axios'

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(value),
      )
    : 'Unknown date'

const normalizePagination = (payload, params, normalizeItem) => ({
  ...(payload ?? {}),
  data: Array.isArray(payload?.data) ? payload.data.map(normalizeItem) : [],
  current_page: Number(payload?.current_page ?? 1),
  total: Number(payload?.total ?? 0),
  per_page: Number(payload?.per_page ?? params?.per_page ?? 15),
})

const normalizeUser = (user) => ({
  ...user,
  name: user?.name ?? 'Unknown user',
  email: user?.email ?? 'Email unavailable',
  role: capitalize(user?.role),
  status: capitalize(user?.status),
  createdDate: formatDate(user?.created_at),
  candidateProfile: user?.candidate_profile ?? null,
  companyProfile: user?.company_profile ?? null,
})

const normalizeJob = (job) => ({
  ...job,
  title: job?.title ?? 'Untitled job',
  company:
    job?.company?.company_profile?.company_name ??
    job?.company?.name ??
    'Unknown company',
  location: job?.location ?? 'Location unavailable',
  status: capitalize(job?.status),
  createdDate: formatDate(job?.created_at),
})

const normalizeProject = (project) => ({
  ...project,
  title: project?.title ?? 'Untitled project',
  company:
    project?.company?.company_profile?.company_name ??
    project?.company?.name ??
    'Unknown company',
  status: capitalize(project?.status),
  createdDate: formatDate(project?.created_at),
})

export async function getAdminUsers(params) {
  const response = await api.get('/admin/users', { params })
  return normalizePagination(response.data, params, normalizeUser)
}

export async function getAdminJobs(params) {
  const response = await api.get('/admin/jobs', { params })
  return normalizePagination(response.data, params, normalizeJob)
}

export async function getAdminProjects(params) {
  const response = await api.get('/admin/projects', { params })
  return normalizePagination(response.data, params, normalizeProject)
}

export async function deleteUser(id) {
  const response = await api.delete(`/admin/users/${id}`)
  return response.data
}

export async function deleteAdminJob(id) {
  const response = await api.delete(`/admin/jobs/${id}`)
  return response.data
}

export async function deleteAdminProject(id) {
  const response = await api.delete(`/admin/projects/${id}`)
  return response.data
}

export async function updateUserStatus(id, status) {
  const response = await api.patch(`/admin/users/${id}/status`, {
    status: status.toLowerCase(),
  })
  return response.data
}
