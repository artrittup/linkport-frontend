import { useState } from 'react'
import { sendProjectBid } from '../api/projectsApi'
import Button from './Button'
import Card from './Card'

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

function getSubmissionError(error) {
  if (error.response?.status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  const validationErrors = error.response?.data?.errors
  const messages = validationErrors
    ? Object.values(validationErrors).flat().filter(Boolean)
    : []

  return messages.length > 0
    ? messages.join(' ')
    : error.response?.data?.message ||
        'Unable to submit your bid. Please try again.'
}

export default function SendBidModal({ project, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [proposal, setProposal] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await sendProjectBid(project.id, {
        amount,
        proposal: proposal.trim(),
        estimatedDays,
      })
      onSuccess(response)
    } catch (requestError) {
      setError(getSubmissionError(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (!isSubmitting && event.target === event.currentTarget) onClose()
      }}
    >
      <Card className="w-full max-w-lg shadow-2xl shadow-black/40" padding="lg">
        <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="send-bid-title">
          <p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">Project bid</p>
          <h2 id="send-bid-title" className="mt-3 text-xl font-bold text-[#e6f1ff]">{project.title}</h2>
          <p className="mt-1 text-sm text-[#64ffda]">{project.company}</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="bid-amount" className="text-sm font-medium text-[#e6f1ff]">Amount</label>
              <input id="bid-amount" type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="2500.00" className={inputClasses} disabled={isSubmitting} />
            </div>
            <div>
              <label htmlFor="estimated-days" className="text-sm font-medium text-[#e6f1ff]">Estimated days</label>
              <input id="estimated-days" type="number" min="1" max="3650" step="1" required value={estimatedDays} onChange={(event) => setEstimatedDays(event.target.value)} placeholder="30" className={inputClasses} disabled={isSubmitting} />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="bid-proposal" className="text-sm font-medium text-[#e6f1ff]">Proposal</label>
            <textarea id="bid-proposal" rows="7" maxLength="20000" required value={proposal} onChange={(event) => setProposal(event.target.value)} placeholder="Describe your approach, experience, and proposed delivery..." className={`${inputClasses} resize-y`} disabled={isSubmitting} />
            <p className="mt-2 text-right text-xs text-[#64748b]">{proposal.length}/20,000</p>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send Bid'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
