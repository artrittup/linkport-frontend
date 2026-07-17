import api from "./axios";

export async function getMyBids() {
  const response = await api.get("/bids/my");
  return response.data;
}

export async function getCompanyBids() {
  const response = await api.get("/bids/company");
  return response.data;
}

export async function acceptBid(id) {
  const response = await api.patch(`/bids/${id}/accept`);
  return response.data;
}

export async function rejectBid(id) {
  const response = await api.patch(`/bids/${id}/reject`);
  return response.data;
}
