import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import api from '../api/axios'
import Button from './Button'

export default function CollaborationRequests({ kind, itemId, isOwner, isOpen }) {
  const [requests, setRequests] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [version, setVersion] = useState(0)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const path = `/collaboration/${kind}/${itemId}`
  useEffect(() => {
    let active = true
    api
      .get(path, { params: { page } })
      .then(({ data }) => {
        if (active) {
          setRequests(data.data)
          setLastPage(data.last_page)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Unable to load collaboration requests.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [path, page, version])
  const submit = async (event) => {
    event.preventDefault()
    if (busy || !message.trim()) return
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post(path, { message: message.trim() })
      setRequests([data.data])
      setMessage('')
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to send request. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  const review = async (id, status) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { data } = await api.patch(`${path}/${id}`, { status })
      setRequests((current) => current.map((item) => (item.id === id ? data.data : item)))
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to review request.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="mt-6 border-t border-border pt-5" aria-label="Collaboration requests">
      <h3 className="font-semibold">{isOwner ? 'Collaboration requests' : 'Collaborate on this idea'}</h3>
      {loading ? (
        <p role="status" className="mt-3 text-sm text-text-muted">
          Loading requests...
        </p>
      ) : (
        <>
          {requests.map((request) => (
            <div key={request.id} className="mt-4 rounded-lg border border-border p-3">
              {isOwner && (
                <Link
                  to={`/member/community/members/${request.user_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {request.user.name}
                </Link>
              )}
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-text-muted">
                {request.message}
              </p>
              <p className="mt-2 text-sm capitalize">
                {isOwner ? 'Status' : 'Your request'}: {request.status}
              </p>
              {isOwner && request.status === 'pending' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" disabled={busy} onClick={() => review(request.id, 'accepted')}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => review(request.id, 'rejected')}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
          {isOwner && !requests.length && !error && (
            <p className="mt-3 text-sm text-text-muted">Requests from interested members will appear here.</p>
          )}
          {!isOwner && !requests.length && isOpen && !error && (
            <form onSubmit={submit} className="mt-4">
              <label htmlFor="collaboration-message" className="text-sm">
                How would you like to help?
              </label>
              <textarea
                id="collaboration-message"
                required
                maxLength={1000}
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm"
              />
              <Button type="submit" disabled={busy || !message.trim()} className="mt-3 w-full">
                {busy ? 'Sending...' : 'Send collaboration request'}
              </Button>
            </form>
          )}
          {!isOwner && !requests.length && !isOpen && (
            <p className="mt-3 text-sm text-text-muted">This item is not accepting requests.</p>
          )}
          {lastPage > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span>
                {page} / {lastPage}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= lastPage}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      {error && (
        <div role="alert" className="mt-3 text-sm text-danger-text">
          {error}
          <button className="ml-2 underline" onClick={() => setVersion((value) => value + 1)}>
            Retry
          </button>
        </div>
      )}
    </section>
  )
}
