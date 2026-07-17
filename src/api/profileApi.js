import api from "./axios";

export async function getCandidateProfile() {
  const response = await api.get("/profile/candidate");
  return response.data;
}

export async function updateCandidateProfile(data) {
  const response = await api.put("/profile/candidate", data);
  return response.data;
}

export async function getCompanyProfile() {
  const response = await api.get("/profile/company");
  return response.data;
}

export async function updateCompanyProfile(data) {
  const response = await api.put("/profile/company", data);
  return response.data;
}
