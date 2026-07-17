import api from "./axios";

export async function getAdminUsers(params) {
  const response = await api.get("/admin/users", { params });
  return response.data;
}

export async function getAdminJobs(params) {
  const response = await api.get("/admin/jobs", { params });
  return response.data;
}

export async function getAdminProjects(params) {
  const response = await api.get("/admin/projects", { params });
  return response.data;
}

export async function deleteUser(id) {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
}

export async function deleteAdminJob(id) {
  const response = await api.delete(`/admin/jobs/${id}`);
  return response.data;
}

export async function deleteAdminProject(id) {
  const response = await api.delete(`/admin/projects/${id}`);
  return response.data;
}

export async function updateUserStatus(id, status) {
  const response = await api.patch(`/admin/users/${id}/status`, { status });
  return response.data;
}
