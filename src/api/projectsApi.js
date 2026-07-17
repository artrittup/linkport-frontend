import api from "./axios";

export async function getProjects(params) {
  const response = await api.get("/projects", { params });
  return response.data;
}

export async function getProjectById(id) {
  const response = await api.get(`/projects/${id}`);
  return response.data;
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
