import { useEffect } from 'react'
import { Link } from 'react-router'
import Button from './Button'
import Card from './Card'

export default function CompanyResponseReviewModal({
  response,
  reviewing,
  onClose,
  onDecision,
}) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !reviewing) onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose, reviewing])

  if (!response) return null
  const pending = response.statusValue === 'pending'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !reviewing) onClose()
    }}>
      <Card padding="lg" className="max-h-full w-full max-w-2xl overflow-y-auto shadow-2xl">
        <div role="dialog" aria-modal="true" aria-labelledby="company-response-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase text-[#64ffda]">{response.typeLabel} review</p>
              <h2 id="company-response-title" className="mt-2 break-words text-2xl font-bold">{response.candidateName}</h2>
              <p className="mt-1 text-sm text-[#64ffda]">{response.candidateHeadline}</p>
            </div>
            <button type="button" disabled={Boolean(reviewing)} onClick={onClose} aria-label="Close review" className="h-9 w-9 shrink-0 text-xl text-[#8892b0] disabled:opacity-50">×</button>
          </div>

          <dl className="mt-5 grid gap-4 border-y border-[#233554] py-5 sm:grid-cols-2">
            <div><dt className="text-xs text-[#64748b]">{response.type === 'application' ? 'Job' : 'Company project'}</dt><dd className="mt-1 break-words text-sm">{response.opportunityTitle}</dd></div>
            <div><dt className="text-xs text-[#64748b]">Submitted</dt><dd className="mt-1 text-sm">{response.submittedAt}</dd></div>
            <div><dt className="text-xs text-[#64748b]">Status</dt><dd className="mt-1 text-sm">{response.statusLabel}</dd></div>
            <div><dt className="text-xs text-[#64748b]">Location</dt><dd className="mt-1 text-sm">{response.candidateLocation}</dd></div>
            {response.type === 'proposal' && <>
              <div><dt className="text-xs text-[#64748b]">Proposed budget</dt><dd className="mt-1 font-semibold">{response.budget}</dd></div>
              <div><dt className="text-xs text-[#64748b]">Duration</dt><dd className="mt-1 text-sm">{response.duration}</dd></div>
            </>}
          </dl>

          {response.skills.length > 0 && <div className="mt-5 flex flex-wrap gap-1.5">{response.skills.map((skill) => <span key={skill} className="rounded-full border border-[#233554] px-2 py-1 font-mono text-[10px] text-[#64ffda]">{skill}</span>)}</div>}
          <div className="mt-5">
            <p className="text-xs text-[#64748b]">{response.type === 'application' ? 'Cover letter' : 'Proposal'}</p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#8892b0]">{response.summary}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[#233554] pt-5 sm:flex-row sm:items-center">
            {response.candidateRoute && <Link to={response.candidateRoute} className="text-sm text-[#64ffda]">View public profile</Link>}
            <Link to={response.opportunityRoute} className="text-sm text-[#8892b0] hover:text-[#64ffda]">Open related {response.type === 'application' ? 'job' : 'project'}</Link>
            <div className="flex gap-2 sm:ml-auto">
              {pending ? <>
                <Button disabled={Boolean(reviewing)} onClick={() => onDecision(response, 'accept')}>{reviewing === 'accept' ? 'Accepting...' : 'Accept'}</Button>
                <Button variant="danger" disabled={Boolean(reviewing)} onClick={() => onDecision(response, 'reject')}>{reviewing === 'reject' ? 'Rejecting...' : 'Reject'}</Button>
              </> : <span className="text-sm text-[#8892b0]">This response has already been reviewed.</span>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
