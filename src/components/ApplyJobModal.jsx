import { useState } from 'react'
import { applyToJob } from '../api/jobsApi'
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
        'Unable to submit your application. Please try again.'
}

export default function ApplyJobModal({ job, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await applyToJob(job.id, {
        cover_letter: coverLetter.trim() || null,
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
        <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="apply-job-title">
          <p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">Job application</p>
          <h2 id="apply-job-title" className="mt-3 text-xl font-bold text-[#e6f1ff]">{job.title}</h2>
          <p className="mt-1 text-sm text-[#64ffda]">{job.company}</p>

          <div className="mt-6">
            <label htmlFor="cover-letter" className="text-sm font-medium text-[#e6f1ff]">Cover letter</label>
            <textarea
              id="cover-letter"
              rows="7"
              maxLength="10000"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Tell the company why you are a good fit..."
              className={`${inputClasses} resize-y`}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-right text-xs text-[#64748b]">{coverLetter.length}/10,000</p>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
