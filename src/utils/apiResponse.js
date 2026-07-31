function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function normalizePaginatedResponse(payload, {
  mapItem = (item) => item,
  perPage = 15,
} = {}) {
  const outer = asObject(payload)
  const nested = asObject(outer.data)
  const source = Array.isArray(payload)
    ? { data: payload }
    : Array.isArray(outer.data)
      ? outer
      : Array.isArray(nested.data)
        ? nested
        : outer
  const rawItems = Array.isArray(source.data) ? source.data : []
  const rawMeta = asObject(source.meta)
  const hasPagination = [
    'current_page',
    'last_page',
    'per_page',
    'total',
  ].some((key) => key in rawMeta || key in source)
  const currentPage = Number(rawMeta.current_page ?? source.current_page ?? 1)
  const resolvedPerPage = Number(
    rawMeta.per_page
      ?? source.per_page
      ?? (hasPagination ? perPage : rawItems.length || perPage),
  )
  const total = Number(rawMeta.total ?? source.total ?? rawItems.length)
  const lastPage = Number(
    rawMeta.last_page
      ?? source.last_page
      ?? (hasPagination
        ? Math.max(1, Math.ceil(total / Math.max(1, resolvedPerPage)))
        : 1),
  )

  return {
    data: rawItems.map(mapItem).filter((item) => item !== null && item !== undefined),
    links: source.links ?? {},
    meta: {
      current_page: Number.isFinite(currentPage) ? currentPage : 1,
      last_page: Number.isFinite(lastPage) ? Math.max(1, lastPage) : 1,
      per_page: Number.isFinite(resolvedPerPage) ? resolvedPerPage : perPage,
      total: Number.isFinite(total) ? total : rawItems.length,
    },
  }
}

export function normalizeFlatPaginatedResponse(payload, options) {
  const normalized = normalizePaginatedResponse(payload, options)

  return {
    data: normalized.data,
    links: normalized.links,
    ...normalized.meta,
  }
}
