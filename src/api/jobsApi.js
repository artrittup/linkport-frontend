import api from "./axios";

export async function getJobs(params) {
  const response = await api.get("/jobs", { params });
  return response.data;
}

export async function getJobById(id) {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
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
