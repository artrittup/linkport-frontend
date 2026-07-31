import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  getTeammateRequest,
  getTeammateRequestErrorMessage,
  isTeammateRequestNotFound,
} from '../api/teammateRequestsApi'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import {
  TEAMMATE_REQUEST_STATUSES,
  getTeammateRequestCommitmentLabel,
  getTeammateRequestStatusLabel,
  getTeammateRequestWorkStyleLabel,
} from '../data/teammateRequestMapper'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const statusClasses = {
  [TEAMMATE_REQUEST_STATUSES.OPEN]: 'border-success/30 bg-success/10 text-success-text',
  [TEAMMATE_REQUEST_STATUSES.CLOSED]: 'border-border-strong/40 bg-text-subtle/10 text-text-secondary',
}

function formatCreatedDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date)
}

function MissingRequest({ isNotFound, message }) {
  return (
    <CandidateLayout title={isNotFound ? 'Request not found' : 'Request unavailable'}>
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface/65 p-8 text-center sm:p-10">
        <p className="font-mono text-sm text-primary">Looking for teammates</p>
        <h2 className="mt-3 text-2xl font-bold text-text-primary">
          {isNotFound ? 'Teammate request not found' : 'Unable to load this request'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {isNotFound
            ? 'This teammate request does not exist or is no longer available.'
            : message}
        </p>
        <Link to="/member/community#collaboration" className="mt-6 inline-flex rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
          Back to Community
        </Link>
      </section>
    </CandidateLayout>
  )
}

function DetailList({ title, items }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="max-w-full break-words rounded-md border border-border bg-background/45 px-3 py-1.5 text-sm text-text-secondary">
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

export default function CandidateTeammateRequestDetails() {
  const { requestId } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [request, setRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadRequest() {
      setIsLoading(true)
      setError('')
      setNotFound(false)

      try {
        const response = await getTeammateRequest(requestId)
        if (isActive) setRequest(response.data)
      } catch (requestError) {
        if (!isActive) return
        setRequest(null)
        setNotFound(isTeammateRequestNotFound(requestError))
        setError(getTeammateRequestErrorMessage(
          requestError,
          'This teammate request is temporarily unavailable. Please try again.',
        ))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadRequest()
    return () => {
      isActive = false
    }
  }, [requestId])

  if (isLoading) {
    return (
      <CandidateLayout title="Teammate request">
        <LoadingSpinner label="Loading teammate request..." size="lg" />
      </CandidateLayout>
    )
  }

  if (!request) return <MissingRequest isNotFound={notFound} message={error} />

  const isOwner = String(request.ownerId) === String(user?.id)
  const isOpen = request.status === TEAMMATE_REQUEST_STATUSES.OPEN

  const handleInterest = () => {
    showToast('Collaboration requests are not available yet. Your interest was not submitted.', 'info')
  }

  return (
    <CandidateLayout title={request.title}>
      <Link to="/member/community#collaboration" className="text-sm font-medium text-primary hover:underline">
        ← Back to Community
      </Link>

      <article className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-2xl border border-border bg-surface/65 p-6 sm:p-8">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">Looking for teammates</p>
              <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-text-primary">{request.title}</h2>
              <p className="mt-3 text-sm text-text-subtle">Created {formatCreatedDate(request.createdAt)}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {isOwner && <span className="rounded-full border border-border-strong/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Your request</span>}
              <span className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide ${statusClasses[request.status] ?? statusClasses[TEAMMATE_REQUEST_STATUSES.CLOSED]}`}>
                {getTeammateRequestStatusLabel(request.status)}
              </span>
            </div>
          </div>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">About the collaboration</h3>
            <p className="mt-3 whitespace-pre-line break-words leading-7 text-text-muted">{request.description}</p>
          </section>

          <div className="mt-8 space-y-8">
            <DetailList title="Roles needed" items={request.rolesNeeded} />
            <DetailList title="Relevant skills" items={request.skills} />
          </div>
        </div>

        <aside className="h-fit min-w-0 rounded-2xl border border-border bg-surface/65 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Request owner</h3>
          <p className="mt-3 break-words font-semibold text-text-primary">{request.ownerName || 'Owner information unavailable'}</p>
          {request.ownerHeadline && <p className="mt-1 break-words text-sm text-text-muted">{request.ownerHeadline}</p>}
          {request.ownerEducation && <p className="mt-1 break-words text-xs text-text-subtle">{request.ownerEducation}</p>}
          {request.ownerLocation && <p className="mt-1 break-words text-xs text-text-subtle">{request.ownerLocation}</p>}

          <dl className="mt-6 space-y-4 border-t border-border pt-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-subtle">Commitment</dt>
              <dd className="mt-1 break-words text-sm text-text-primary">{getTeammateRequestCommitmentLabel(request.commitment)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-subtle">Work style</dt>
              <dd className="mt-1 break-words text-sm text-text-primary">{getTeammateRequestWorkStyleLabel(request.workStyle)}</dd>
            </div>
            {request.preferredUniversity && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-text-subtle">Preferred university</dt>
                <dd className="mt-1 break-words text-sm text-text-primary">{request.preferredUniversity}</dd>
              </div>
            )}
            {request.preferredLocation && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-text-subtle">Preferred location</dt>
                <dd className="mt-1 break-words text-sm text-text-primary">{request.preferredLocation}</dd>
              </div>
            )}
          </dl>

          {!isOwner && isOpen && (
            <div className="mt-6">
              <Button className="w-full" onClick={handleInterest}>Interested in collaborating</Button>
              <p className="mt-3 text-center text-xs leading-5 text-text-subtle">
                This is a placeholder. No collaboration request or message will be submitted.
              </p>
            </div>
          )}
          {!isOpen && (
            <p className="mt-6 rounded-lg border border-border-strong/30 bg-text-subtle/10 p-3 text-center text-xs leading-5 text-text-secondary">
              This request is closed and is not currently seeking collaborators.
            </p>
          )}
        </aside>
      </article>
    </CandidateLayout>
  )
}
