import { useState } from 'react'
import { createCircle, updateCircle, getCircleErrorMessage } from '../api/circlesApi'
import Modal from './Modal'
import Button from './Button'
import SkillsInput from './SkillsInput'

const input =
  'mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary'
export default function CircleFormModal({ circle, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: circle?.name ?? '',
    description: circle?.description ?? '',
    category: circle?.category ?? '',
    visibility: circle?.visibility ?? 'public',
  })
  const [skills, setSkills] = useState(circle?.skills ?? [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (busy || !form.name.trim()) return
    setBusy(true)
    setError('')
    try {
      const payload = { ...form, name: form.name.trim(), skills }
      const response = circle ? await updateCircle(circle.id, payload) : await createCircle(payload)
      onSaved(response.circle)
    } catch (error) {
      setError(getCircleErrorMessage(error, 'Unable to save Circle.'))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      isOpen
      title={circle ? 'Edit Circle' : 'Create Circle'}
      onClose={() => {
        if (!busy) onClose()
      }}
      showCloseButton={false}
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="circle-name">Circle name</label>
          <input
            id="circle-name"
            name="name"
            required
            maxLength={255}
            value={form.name}
            onChange={change}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="circle-description">Description</label>
          <textarea
            id="circle-description"
            name="description"
            maxLength={5000}
            rows={4}
            value={form.description}
            onChange={change}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="circle-category">Category</label>
          <input
            id="circle-category"
            name="category"
            maxLength={120}
            value={form.category}
            onChange={change}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="circle-visibility">Visibility</label>
          <select
            id="circle-visibility"
            name="visibility"
            value={form.visibility}
            onChange={change}
            className={input}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <p className="mt-2 text-xs text-text-muted">
            Public Circles can be discovered by everyone. Private discussions are visible only to members.
            Membership requests need approval.
          </p>
        </div>
        <div>
          <p className="mb-2">Topics and skills</p>
          <SkillsInput skills={skills} setSkills={setSkills} />
        </div>
        {error && (
          <p role="alert" className="text-danger-text">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !form.name.trim()}>
            {busy ? 'Saving...' : circle ? 'Save changes' : 'Create Circle'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
