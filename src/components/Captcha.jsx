import { useEffect, useRef } from 'react'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise = null

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)

  scriptPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.turnstile)
    script.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

/** True when a site key is configured, so callers can require a token. */
export const captchaEnabled = SITE_KEY !== ''

/**
 * Cloudflare Turnstile checkbox. Renders nothing when no site key is set,
 * which keeps local development working without Cloudflare credentials.
 */
export default function Captcha({ onToken }) {
  const holder = useRef(null)
  const widgetId = useRef(null)

  useEffect(() => {
    if (!captchaEnabled) return undefined

    let cancelled = false

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !holder.current || widgetId.current !== null) return

        widgetId.current = turnstile.render(holder.current, {
          sitekey: SITE_KEY,
          callback: (token) => onToken(token),
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        })
      })
      .catch(() => { if (!cancelled) onToken('') })

    return () => {
      cancelled = true
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = null
      }
    }
  }, [onToken])

  if (!captchaEnabled) return null

  return <div ref={holder} className="mt-1" />
}
