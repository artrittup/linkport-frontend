const SETTLE_DELAY_MS = 180

let loadId = 0
let isLoading = true
let pendingRequests = 0
let settleTimer = null
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener(isLoading))
}

function clearSettleTimer() {
  if (settleTimer !== null) {
    window.clearTimeout(settleTimer)
    settleTimer = null
  }
}

function waitForDocument() {
  if (document.readyState === 'complete') return Promise.resolve()

  return new Promise((resolve) => {
    window.addEventListener('load', resolve, { once: true })
  })
}

function waitForImages() {
  const pendingImages = [...document.images].filter((image) => !image.complete)

  return Promise.all(
    pendingImages.map(
      (image) =>
        new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true })
          image.addEventListener('error', resolve, { once: true })
        }),
    ),
  )
}

async function finishIfReady(expectedLoadId) {
  if (
    expectedLoadId !== loadId ||
    !isLoading ||
    pendingRequests > 0
  ) {
    return
  }

  await Promise.all([
    waitForDocument(),
    waitForImages(),
    document.fonts?.ready ?? Promise.resolve(),
  ])

  // API responses can add images on the following React render. Check once more
  // after the browser has painted that update.
  await new Promise((resolve) => window.requestAnimationFrame(resolve))
  await waitForImages()

  if (
    expectedLoadId !== loadId ||
    !isLoading ||
    pendingRequests > 0
  ) {
    scheduleFinish(expectedLoadId)
    return
  }

  isLoading = false
  document.body.removeAttribute('aria-busy')
  emit()
}

function scheduleFinish(expectedLoadId = loadId) {
  clearSettleTimer()
  if (!isLoading || pendingRequests > 0) return

  settleTimer = window.setTimeout(() => {
    settleTimer = null
    finishIfReady(expectedLoadId)
  }, SETTLE_DELAY_MS)
}

export function startPageLoad() {
  loadId += 1
  pendingRequests = 0
  isLoading = true
  document.body.setAttribute('aria-busy', 'true')
  emit()
  scheduleFinish(loadId)
}

export function trackPageRequest(config) {
  if (!isLoading || config?.skipPageLoading) return config

  pendingRequests += 1
  clearSettleTimer()
  config.linkPortPageLoadId = loadId
  return config
}

export function finishPageRequest(config) {
  if (
    !config?.linkPortPageLoadId ||
    config.linkPortPageLoadId !== loadId
  ) {
    return
  }

  pendingRequests = Math.max(0, pendingRequests - 1)
  scheduleFinish(loadId)
}

export function subscribeToPageLoading(listener) {
  listeners.add(listener)
  listener(isLoading)
  return () => listeners.delete(listener)
}

export function getPageLoadingState() {
  return isLoading
}
