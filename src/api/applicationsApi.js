import api from "./axios";

export async function getMyApplications() {
  const response = await api.get("/applications/my");
  return response.data;
}

export async function getCompanyApplications() {
  const response = await api.get("/applications/company");
  return response.data;
}

export async function acceptApplication(id) {
  const response = await api.patch(`/applications/${id}/accept`);
  return response.data;
}

export async function rejectApplication(id) {
  const response = await api.patch(`/applications/${id}/reject`);
  return response.data;
}
