import api from './axios'

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
  const payload = response.data

  return {
    ...payload,
    data: Array.isArray(payload.data) ? payload.data.map(normalizeJob) : [],
  }
}

export async function getJobById(id) {
  const response = await api.get(`/jobs/${id}`)
  return { ...response.data, job: normalizeJob(response.data.job) }
}

export async function createJob(data) {
  const response = await api.post("/jobs", data);
  return response.data;
}

export async function updateJob(id, data) {
  const response = await api.put(`/jobs/${id}`, data);
  return response.data;
}

export async function deleteJob(id) {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
}

export async function applyToJob(jobId, data) {
  const response = await api.post(`/jobs/${jobId}/apply`, data);
  return response.data;
}
