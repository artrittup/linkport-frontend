import { useState } from 'react'
import { getSavedItemErrorMessage, setSavedItem } from '../api/savedItemsApi'

export default function SaveButton({ type, itemId, initialSaved = false, onChange, className = '' }) {
  const [optimisticSaved, setOptimisticSaved] = useState(null)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState('')

  const isSaved = optimisticSaved ?? initialSaved

  const toggleSave = async () => {
    if (isWorking) return
    const nextSaved = !isSaved
    setOptimisticSaved(nextSaved)
    setIsWorking(true)
    setError('')
    try {
      await setSavedItem(type, itemId, nextSaved)
      onChange?.(nextSaved)
    } catch (requestError) {
      setOptimisticSaved(null)
      setError(getSavedItemErrorMessage(requestError))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <span className={`inline-flex flex-col items-end ${className}`}>
      <button
        type="button"
        aria-pressed={isSaved}
        disabled={isWorking}
        onClick={toggleSave}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors hover:bg-primary/10 disabled:opacity-60 ${isSaved ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
      >
        <svg viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
        </svg>
        {isSaved ? 'Saved' : 'Save'}
      </button>
      {error && <span role="alert" className="mt-1 max-w-56 text-right text-xs text-danger-text">{error}</span>}
    </span>
  )
}
