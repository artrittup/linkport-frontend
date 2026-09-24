import { useState } from 'react'
import { updateCommunityProject, getCommunityProjectErrorMessage } from '../api/communityProjectsApi'
import { toCommunityProjectPayload } from '../data/communityProjectMapper'
import SkillsInput from './SkillsInput'
import Modal from './Modal'
import Button from './Button'

const input = 'mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm'
export default function ProjectEditModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: project.title,
    description: project.shortDescription,
    fullDescription: project.fullDescription,
    status: project.status,
    skills: project.skills,
    roles: project.lookingForRoles.join(', '),
    repositoryUrl: project.repositoryUrl,
    liveUrl: project.liveUrl,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await updateCommunityProject(
        project.id,
        toCommunityProjectPayload({
          ...form,
          roles: form.roles
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
          lookingForTeam: form.status === 'looking_for_team',
        }),
      )
      onSaved(response.data)
    } catch (error) {
      setError(getCommunityProjectErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      isOpen
      title="Edit idea"
      onClose={() => {
        if (!busy) onClose()
      }}
      showCloseButton={false}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="idea-title">Title</label>
          <input
            id="idea-title"
            name="title"
            required
            maxLength={255}
            value={form.title}
            onChange={change}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="idea-description">Short description</label>
          <textarea
            id="idea-description"
            name="description"
            required
            maxLength={2000}
            value={form.description}
            onChange={change}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="idea-full-description">Full description</label>
          <textarea
            id="idea-full-description"
            name="fullDescription"
            maxLength={20000}
            rows={5}
            value={form.fullDescription}
            onChange={change}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="idea-status">Status</label>
          <select id="idea-status" name="status" value={form.status} onChange={change} className={input}>
            <option value="looking_for_team">Looking for team</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Skills</p>
          <SkillsInput
            skills={form.skills}
            setSkills={(skills) => setForm((value) => ({ ...value, skills }))}
          />
        </div>
        {form.status === 'looking_for_team' && (
          <div>
            <label htmlFor="idea-roles">Roles needed (comma separated)</label>
            <input
              id="idea-roles"
              name="roles"
              required
              value={form.roles}
              onChange={change}
              className={input}
            />
          </div>
        )}
        <div>
          <label htmlFor="idea-repository">Repository URL</label>
          <input
            id="idea-repository"
            name="repositoryUrl"
            type="url"
            value={form.repositoryUrl}
            onChange={change}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="idea-live">Live URL</label>
          <input
            id="idea-live"
            name="liveUrl"
            type="url"
            value={form.liveUrl}
            onChange={change}
            className={input}
          />
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
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
