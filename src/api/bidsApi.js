import api from './axios'

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(value),
      )
    : 'Unknown date'

const formatAmount = (value) => {
  const amount = Number(value)

  return Number.isFinite(amount)
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'EUR',
      }).format(amount)
    : 'Amount unavailable'
}

function normalizeBid(bid) {
  const project = bid?.project ?? {}
  const company = project.company ?? {}

  return {
    ...bid,
    status: capitalize(bid?.status),
    projectTitle: project.title ?? 'Unavailable project',
    category: project.category ?? null,
    company:
      company.company_profile?.company_name ??
      company.name ??
      'Unknown company',
    offeredPrice: formatAmount(bid?.amount),
    proposalPreview: bid?.proposal || 'No proposal provided.',
    deliveryDays: bid?.estimated_days ?? null,
    dateSubmitted: formatDate(bid?.created_at),
    projectBudget: project.budget ?? null,
    projectDeadline: project.deadline ?? null,
    project,
  }
}

export async function getMyBids(params) {
  const response = await api.get('/bids/my', { params })
  const payload = response.data

  return {
    ...payload,
    data: Array.isArray(payload.data) ? payload.data.map(normalizeBid) : [],
    current_page: Number(payload.current_page ?? 1),
    total: Number(payload.total ?? 0),
    per_page: Number(payload.per_page ?? params?.per_page ?? 15),
  }
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
