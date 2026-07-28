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
  [TEAMMATE_REQUEST_STATUSES.OPEN]: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#86efac]',
  [TEAMMATE_REQUEST_STATUSES.CLOSED]: 'border-[#64748b]/40 bg-[#64748b]/10 text-[#a8b2d1]',
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
      <section className="mx-auto max-w-2xl rounded-2xl border border-[#233554] bg-[#112240]/65 p-8 text-center sm:p-10">
        <p className="font-mono text-sm text-[#64ffda]">Looking for teammates</p>
        <h2 className="mt-3 text-2xl font-bold text-[#e6f1ff]">
          {isNotFound ? 'Teammate request not found' : 'Unable to load this request'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#8892b0]">
          {isNotFound
            ? 'This teammate request does not exist or is no longer available.'
            : message}
        </p>
        <Link to="/candidate/community#collaboration" className="mt-6 inline-flex rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
          Back to Community
        </Link>
      </section>
    </CandidateLayout>
  )
}

function DetailList({ title, items }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="max-w-full break-words rounded-md border border-[#233554] bg-[#0a192f]/45 px-3 py-1.5 text-sm text-[#a8b2d1]">
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
      <Link to="/candidate/community#collaboration" className="text-sm font-medium text-[#64ffda] hover:underline">
        ← Back to Community
      </Link>

      <article className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/65 p-6 sm:p-8">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#64ffda]">Looking for teammates</p>
              <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#e6f1ff]">{request.title}</h2>
              <p className="mt-3 text-sm text-[#64748b]">Created {formatCreatedDate(request.createdAt)}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {isOwner && <span className="rounded-full border border-[#a8b2d1]/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#a8b2d1]">Your request</span>}
              <span className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide ${statusClasses[request.status] ?? statusClasses[TEAMMATE_REQUEST_STATUSES.CLOSED]}`}>
                {getTeammateRequestStatusLabel(request.status)}
              </span>
            </div>
          </div>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">About the collaboration</h3>
            <p className="mt-3 whitespace-pre-line break-words leading-7 text-[#8892b0]">{request.description}</p>
          </section>

          <div className="mt-8 space-y-8">
            <DetailList title="Roles needed" items={request.rolesNeeded} />
            <DetailList title="Relevant skills" items={request.skills} />
          </div>
        </div>

        <aside className="h-fit min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/65 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b2d1]">Request owner</h3>
          <p className="mt-3 break-words font-semibold text-[#e6f1ff]">{request.ownerName || 'Owner information unavailable'}</p>
          {request.ownerHeadline && <p className="mt-1 break-words text-sm text-[#8892b0]">{request.ownerHeadline}</p>}
          {request.ownerEducation && <p className="mt-1 break-words text-xs text-[#64748b]">{request.ownerEducation}</p>}
          {request.ownerLocation && <p className="mt-1 break-words text-xs text-[#64748b]">{request.ownerLocation}</p>}

          <dl className="mt-6 space-y-4 border-t border-[#233554] pt-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[#64748b]">Commitment</dt>
              <dd className="mt-1 break-words text-sm text-[#e6f1ff]">{getTeammateRequestCommitmentLabel(request.commitment)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[#64748b]">Work style</dt>
              <dd className="mt-1 break-words text-sm text-[#e6f1ff]">{getTeammateRequestWorkStyleLabel(request.workStyle)}</dd>
            </div>
            {request.preferredUniversity && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Preferred university</dt>
                <dd className="mt-1 break-words text-sm text-[#e6f1ff]">{request.preferredUniversity}</dd>
              </div>
            )}
            {request.preferredLocation && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Preferred location</dt>
                <dd className="mt-1 break-words text-sm text-[#e6f1ff]">{request.preferredLocation}</dd>
              </div>
            )}
          </dl>

          {!isOwner && isOpen && (
            <div className="mt-6">
              <Button className="w-full" onClick={handleInterest}>Interested in collaborating</Button>
              <p className="mt-3 text-center text-xs leading-5 text-[#64748b]">
                This is a placeholder. No collaboration request or message will be submitted.
              </p>
            </div>
          )}
          {!isOpen && (
            <p className="mt-6 rounded-lg border border-[#64748b]/30 bg-[#64748b]/10 p-3 text-center text-xs leading-5 text-[#a8b2d1]">
              This request is closed and is not currently seeking collaborators.
            </p>
          )}
        </aside>
      </article>
    </CandidateLayout>
  )
}
