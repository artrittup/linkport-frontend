import { useEffect, useState } from 'react'
import {
  acceptConnection,
  getConnectionErrorMessage,
  getConnectionStatus,
  rejectConnection,
  sendConnectionRequest,
} from '../api/connectionsApi'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

export default function ConnectionButton({ userId, initialStatus, onStatusChange }) {
  const { user } = useAuth()
  const initial = typeof initialStatus === 'string' ? { status: initialStatus } : initialStatus
  const [status, setStatus] = useState(initial?.status ?? 'loading')
  const [connectionId, setConnectionId] = useState(initial?.connection_id ?? null)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId || Number(userId) === Number(user?.id)) return undefined
    let active = true

    getConnectionStatus(userId)
      .then((data) => {
        if (active) {
          setStatus(data.status)
          setConnectionId(data.connection_id)
        }
      })
      .catch((requestError) => active && setError(getConnectionErrorMessage(requestError, 'Unable to load connection status.')))

    return () => { active = false }
  }, [userId, user?.id])

  if (!userId || Number(userId) === Number(user?.id) || user?.role !== 'candidate') return null

  const updateStatus = (nextStatus, nextId = connectionId) => {
    setStatus(nextStatus)
    setConnectionId(nextId)
    onStatusChange?.(nextStatus)
  }

  const run = async (action) => {
    setIsWorking(true)
    setError('')
    try {
      const data = await action()
      return data
    } catch (requestError) {
      setError(getConnectionErrorMessage(requestError))
      return null
    } finally {
      setIsWorking(false)
    }
  }

  const connect = async () => {
    const data = await run(() => sendConnectionRequest(userId))
    if (data) updateStatus('pending_sent', data.connection.id)
  }

  const accept = async () => {
    const data = await run(() => acceptConnection(connectionId))
    if (data) updateStatus('connected', data.connection.id)
  }

  const reject = async () => {
    const data = await run(() => rejectConnection(connectionId))
    if (data) updateStatus('rejected', data.connection.id)
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      {(status === 'none' || status === 'rejected') && <Button size="sm" onClick={connect} disabled={isWorking}>{isWorking ? 'Sending...' : 'Connect'}</Button>}
      {status === 'pending_sent' && <Button size="sm" variant="outline" disabled>Pending</Button>}
      {status === 'connected' && <Button size="sm" variant="outline" disabled>Connected</Button>}
      {status === 'pending_received' && (
        <div className="flex gap-2"><Button size="sm" onClick={accept} disabled={isWorking}>{isWorking ? 'Updating...' : 'Accept'}</Button><Button size="sm" variant="ghost" onClick={reject} disabled={isWorking}>Reject</Button></div>
      )}
      {status === 'loading' && <span className="text-xs text-[#8892b0]">Checking connection...</span>}
      {error && <p role="alert" className="max-w-xs text-xs text-[#fca5a5]">{error}</p>}
    </div>
  )
}
