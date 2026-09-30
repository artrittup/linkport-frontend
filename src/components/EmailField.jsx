import { useEffect, useState } from 'react'
import api from '../api/axios'
import FloatingField from './FloatingField'

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Cross() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-4 w-4 text-danger" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-4 w-4 text-success" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

/** Email input that tells the person straight away if the address is taken. */
export default function EmailField({ value, onChange, invalid = false, label = 'Email' }) {
  const address = value.trim()
  const valid = LOOKS_LIKE_EMAIL.test(address)

  const [result, setResult] = useState(null) // { address, available } | null

  useEffect(() => {
    if (!valid) return undefined

    let active = true

    const timer = setTimeout(() => {
      api.get('/email-available', { params: { email: address } })
        .then((response) => {
          if (active) setResult({ address, available: Boolean(response.data?.available) })
        })
        .catch(() => { if (active) setResult(null) })
    }, 400)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [address, valid])

  const answered = result?.address === address ? result : null
  const taken = answered ? !answered.available : false

  return (
    <div>
      <FloatingField
        id="register-email"
        name="email"
        type="email"
        label={label}
        autoComplete="email"
        required
        value={value}
        onChange={onChange}
        invalid={invalid || taken}
        trailing={answered ? (taken ? <Cross /> : <Tick />) : null}
      />
      {taken && (
        <p className="mt-1.5 text-xs font-semibold text-danger-text">
          This email is already registered
        </p>
      )}
    </div>
  )
}
