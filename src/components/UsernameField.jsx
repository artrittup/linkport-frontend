import { useEffect, useState } from 'react'
import api from '../api/axios'
import FloatingField from './FloatingField'

const VALID = /^[A-Za-z0-9_-]{3,30}$/

function Spinner() {
  return (
    <span
      className="block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary"
      role="status"
      aria-label="Checking availability"
    />
  )
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-4 w-4 text-success" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function Cross() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-4 w-4 text-danger" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

/**
 * Username input that asks the API whether the handle is free, debounced so a
 * request only goes out once typing pauses.
 */
export default function UsernameField({ value, onChange, invalid = false }) {
  // Format is known synchronously; only the server answer needs state.
  const handle = value.trim()
  const format = !handle ? 'empty' : VALID.test(handle) ? 'ok' : 'invalid'

  const [result, setResult] = useState(null) // { handle, available } | null

  useEffect(() => {
    if (format !== 'ok') return undefined

    let active = true

    const timer = setTimeout(() => {
      api.get('/username-available', { params: { username: handle } })
        .then((response) => {
          if (active) setResult({ handle, available: Boolean(response.data?.available) })
        })
        .catch(() => { if (active) setResult(null) })
    }, 400)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [handle, format])

  const answered = result?.handle === handle ? result : null
  const state = format === 'empty'
    ? 'idle'
    : format === 'invalid'
      ? 'invalid'
      : answered
        ? (answered.available ? 'free' : 'taken')
        : 'checking'

  const trailing = state === 'checking'
    ? <Spinner />
    : state === 'free'
      ? <Tick />
      : state === 'taken' || state === 'invalid'
        ? <Cross />
        : null

  return (
    <div>
      <FloatingField
        id="register-username"
        name="username"
        type="text"
        label="Username"
        autoComplete="username"
        required
        minLength="3"
        maxLength="30"
        value={value}
        onChange={onChange}
        invalid={invalid || state === 'taken' || state === 'invalid'}
        trailing={trailing}
      />

      {state === 'taken' && (
        <p className="mt-1.5 text-xs font-semibold text-danger-text">Already exists</p>
      )}
      {state === 'free' && (
        <p className="mt-1.5 text-xs font-semibold text-success-text">Available</p>
      )}
      {state === 'invalid' && (
        <p className="mt-1.5 text-xs text-text-muted">
          3&ndash;30 characters: letters, numbers, dash or underscore.
        </p>
      )}
    </div>
  )
}
