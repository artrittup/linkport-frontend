import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../components/Button'
import Card from '../components/Card'
import SkillsInput from '../components/SkillsInput'
import { useAuth } from '../context/AuthContext'
import { useLocalContent } from '../context/LocalContentContext'
import { PROJECT_STATUSES } from '../data/mockProjects'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const inputClasses = 'mt-2 w-full min-w-0 max-w-full rounded-lg border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'
const postCategories = ['General', 'Project update', 'Question', 'Achievement', 'Opportunity tip']
const commitments = ['A few hours per week', 'Part-time collaboration', 'Weekend project', 'Short-term challenge', 'Flexible']
const workStyles = ['Remote', 'In-person', 'Flexible']

function splitList(value) {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))]
}

function isValidUrl(value) {
  if (!value.trim()) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function FieldError({ message }) {
  return message ? <p className="mt-1.5 text-xs text-[#fca5a5]">{message}</p> : null
}

function FormActions({ onCancel, isSubmitting, submitLabel }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : submitLabel}</Button>
    </div>
  )
}

function ProjectForm({ onCancel }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addProject } = useLocalContent()
  const { showToast } = useToast()
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: PROJECT_STATUSES.IN_PROGRESS,
    skills: [],
    lookingForTeam: false,
    roles: '',
    repositoryUrl: '',
    liveUrl: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleStatus = (event) => {
    const status = event.target.value
    setForm((current) => ({
      ...current,
      status,
      lookingForTeam: status === PROJECT_STATUSES.LOOKING_FOR_TEAM,
    }))
  }

  const handleTeamToggle = (event) => {
    const lookingForTeam = event.target.checked
    setForm((current) => ({
      ...current,
      lookingForTeam,
      status: lookingForTeam
        ? PROJECT_STATUSES.LOOKING_FOR_TEAM
        : (current.status === PROJECT_STATUSES.LOOKING_FOR_TEAM ? PROJECT_STATUSES.IN_PROGRESS : current.status),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Project title is required.'
    if (!form.description.trim()) nextErrors.description = 'Short description is required.'
    if (form.skills.length === 0) nextErrors.skills = 'Add at least one skill.'
    if (form.lookingForTeam && splitList(form.roles).length === 0) nextErrors.roles = 'Add at least one role needed.'
    if (!isValidUrl(form.repositoryUrl)) nextErrors.repositoryUrl = 'Enter a valid http or https URL.'
    if (!isValidUrl(form.liveUrl)) nextErrors.liveUrl = 'Enter a valid http or https URL.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const project = addProject({
      title: form.title.trim(),
      description: form.description.trim(),
      fullDescription: form.description.trim(),
      creator: user?.name || 'LinkPort Member',
      creatorHeadline: 'LinkPort member',
      university: '',
      status: form.lookingForTeam ? PROJECT_STATUSES.LOOKING_FOR_TEAM : form.status,
      skills: form.skills,
      teamMembers: [user?.name || 'LinkPort Member'],
      lookingForRoles: form.lookingForTeam ? splitList(form.roles) : [],
      repositoryUrl: form.repositoryUrl.trim(),
      liveUrl: form.liveUrl.trim(),
    })
    showToast('Project created and added to the showcase.', 'success')
    navigate(`/candidate/projects/${project.id}`, { replace: true })
  }

  const isDirty = form.title
    || form.description
    || form.skills.length
    || form.roles
    || form.repositoryUrl
    || form.liveUrl
    || form.lookingForTeam
    || form.status !== PROJECT_STATUSES.IN_PROGRESS

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block min-w-0 text-sm font-medium">
        Project title <span className="text-[#64ffda]">*</span>
        <input name="title" value={form.title} onChange={updateField} placeholder="What are you building?" className={inputClasses} />
        <FieldError message={errors.title} />
      </label>
      <label className="block min-w-0 text-sm font-medium">
        Short description <span className="text-[#64ffda]">*</span>
        <textarea name="description" rows="4" value={form.description} onChange={updateField} maxLength="500" placeholder="Explain the project and why it matters." className={`${inputClasses} resize-y`} />
        <FieldError message={errors.description} />
      </label>
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-medium">
          Status
          <select name="status" value={form.status} onChange={handleStatus} className={inputClasses}>
            <option value={PROJECT_STATUSES.LOOKING_FOR_TEAM}>Looking for team</option>
            <option value={PROJECT_STATUSES.IN_PROGRESS}>In progress</option>
            <option value={PROJECT_STATUSES.COMPLETED}>Completed</option>
          </select>
        </label>
        <label className="mt-7 flex min-w-0 items-center gap-3 rounded-lg border border-[#233554] bg-[#0a192f]/45 px-4 py-3 text-sm text-[#a8b2d1]">
          <input type="checkbox" checked={form.lookingForTeam} onChange={handleTeamToggle} className="h-4 w-4 shrink-0 accent-[#64ffda]" />
          Looking for teammates
        </label>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">Skills or technologies <span className="text-[#64ffda]">*</span></p>
        <div className="mt-2 min-w-0">
          <SkillsInput skills={form.skills} setSkills={(skills) => { setForm((current) => ({ ...current, skills })); setErrors((current) => ({ ...current, skills: '' })) }} />
        </div>
        <FieldError message={errors.skills} />
      </div>
      {form.lookingForTeam && (
        <label className="block min-w-0 text-sm font-medium">
          Roles needed <span className="text-[#64ffda]">*</span>
          <input name="roles" value={form.roles} onChange={updateField} placeholder="Product designer, Backend developer" className={inputClasses} />
          <p className="mt-1.5 text-xs text-[#64748b]">Separate roles with commas.</p>
          <FieldError message={errors.roles} />
        </label>
      )}
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-medium">
          Repository URL <span className="text-[#64748b]">(optional)</span>
          <input name="repositoryUrl" type="text" inputMode="url" value={form.repositoryUrl} onChange={updateField} placeholder="https://github.com/..." className={inputClasses} />
          <FieldError message={errors.repositoryUrl} />
        </label>
        <label className="block min-w-0 text-sm font-medium">
          Live demo URL <span className="text-[#64748b]">(optional)</span>
          <input name="liveUrl" type="text" inputMode="url" value={form.liveUrl} onChange={updateField} placeholder="https://..." className={inputClasses} />
          <FieldError message={errors.liveUrl} />
        </label>
      </div>
      <FormActions onCancel={() => onCancel(isDirty)} isSubmitting={isSubmitting} submitLabel="Publish project" />
    </form>
  )
}

function PostForm({ onCancel }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addPost } = useLocalContent()
  const { showToast } = useToast()
  const [form, setForm] = useState({ text: '', category: 'General', tags: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.text.trim()) {
      setErrors({ text: 'Post text is required.' })
      return
    }
    setIsSubmitting(true)
    addPost({
      text: form.text.trim(),
      category: form.category,
      tags: splitList(form.tags),
      author: user?.name || 'LinkPort Member',
    })
    showToast('Post published to your Home feed.', 'success')
    navigate('/candidate/home', { replace: true })
  }

  const isDirty = form.text || form.tags || form.category !== 'General'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block min-w-0 text-sm font-medium">
        Post text <span className="text-[#64ffda]">*</span>
        <textarea
          rows="7"
          value={form.text}
          maxLength="1000"
          onChange={(event) => { setForm((current) => ({ ...current, text: event.target.value })); setErrors({}) }}
          placeholder="Share an update, question, or useful idea with the community."
          className={`${inputClasses} resize-y`}
        />
        <div className="mt-1.5 flex justify-between gap-3 text-xs">
          <FieldError message={errors.text} />
          <span className="ml-auto text-[#64748b]">{form.text.length}/1000</span>
        </div>
      </label>
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-medium">
          Category
          <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={inputClasses}>
            {postCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="block min-w-0 text-sm font-medium">
          Related skills or tags <span className="text-[#64748b]">(optional)</span>
          <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="React, Career, Design" className={inputClasses} />
          <p className="mt-1.5 text-xs text-[#64748b]">Separate tags with commas.</p>
        </label>
      </div>
      <FormActions onCancel={() => onCancel(isDirty)} isSubmitting={isSubmitting} submitLabel="Publish post" />
    </form>
  )
}

function TeamRequestForm({ onCancel }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addTeamRequest } = useLocalContent()
  const { showToast } = useToast()
  const [form, setForm] = useState({
    title: '',
    context: '',
    roles: '',
    skills: '',
    commitment: 'Flexible',
    workStyle: 'Flexible',
    preferredLocation: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'A short title is required.'
    if (!form.context.trim()) nextErrors.context = 'Project context is required.'
    if (splitList(form.roles).length === 0) nextErrors.roles = 'Add at least one role.'
    if (splitList(form.skills).length === 0) nextErrors.skills = 'Add at least one relevant skill.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    addTeamRequest({
      title: form.title.trim(),
      context: form.context.trim(),
      roles: splitList(form.roles),
      skills: splitList(form.skills),
      commitment: form.commitment,
      workStyle: form.workStyle,
      preferredLocation: form.preferredLocation.trim(),
      author: user?.name || 'LinkPort Member',
    })
    showToast('Collaboration request published.', 'success')
    navigate('/candidate/community#collaboration', { replace: true })
  }

  const isDirty = Object.entries(form).some(([key, value]) => (
    !['commitment', 'workStyle'].includes(key) ? Boolean(value) : value !== 'Flexible'
  ))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block min-w-0 text-sm font-medium">
        Short title <span className="text-[#64ffda]">*</span>
        <input name="title" value={form.title} onChange={updateField} placeholder="Looking for a designer for a study app" className={inputClasses} />
        <FieldError message={errors.title} />
      </label>
      <label className="block min-w-0 text-sm font-medium">
        Project idea or context <span className="text-[#64ffda]">*</span>
        <textarea name="context" rows="5" value={form.context} onChange={updateField} maxLength="800" placeholder="Describe the idea, current progress, and what you want to build together." className={`${inputClasses} resize-y`} />
        <FieldError message={errors.context} />
      </label>
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-medium">
          Roles needed <span className="text-[#64ffda]">*</span>
          <input name="roles" value={form.roles} onChange={updateField} placeholder="Designer, Backend developer" className={inputClasses} />
          <FieldError message={errors.roles} />
        </label>
        <label className="block min-w-0 text-sm font-medium">
          Relevant skills <span className="text-[#64ffda]">*</span>
          <input name="skills" value={form.skills} onChange={updateField} placeholder="Figma, Laravel, Research" className={inputClasses} />
          <FieldError message={errors.skills} />
        </label>
      </div>
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-medium">
          Expected commitment
          <select name="commitment" value={form.commitment} onChange={updateField} className={inputClasses}>
            {commitments.map((commitment) => <option key={commitment}>{commitment}</option>)}
          </select>
        </label>
        <label className="block min-w-0 text-sm font-medium">
          Collaboration style
          <select name="workStyle" value={form.workStyle} onChange={updateField} className={inputClasses}>
            {workStyles.map((style) => <option key={style}>{style}</option>)}
          </select>
        </label>
      </div>
      <label className="block min-w-0 text-sm font-medium">
        Preferred university or location <span className="text-[#64748b]">(optional)</span>
        <input name="preferredLocation" value={form.preferredLocation} onChange={updateField} placeholder="Prishtina or University of Prizren" className={inputClasses} />
      </label>
      <p className="text-xs leading-5 text-[#64748b]">Roles and skills may be separated with commas. This request will not send messages or invitations.</p>
      <FormActions onCancel={() => onCancel(isDirty)} isSubmitting={isSubmitting} submitLabel="Create request" />
    </form>
  )
}

const pageConfig = {
  project: {
    eyebrow: 'Project showcase',
    title: 'Share a project',
    description: 'Add your work to the local Project Showcase. It will be saved only in this browser.',
    cancelPath: '/candidate/projects',
    Form: ProjectForm,
  },
  post: {
    eyebrow: 'Community post',
    title: 'Create a post',
    description: 'Share one concise update with the LinkPort community Home feed.',
    cancelPath: '/candidate/home',
    Form: PostForm,
  },
  team: {
    eyebrow: 'Collaboration',
    title: 'Find teammates',
    description: 'Describe the people and commitment you need for a project idea.',
    cancelPath: '/candidate/community',
    Form: TeamRequestForm,
  },
}

export default function CandidateCreatePage({ type }) {
  const navigate = useNavigate()
  const { storageError } = useLocalContent()
  const config = useMemo(() => pageConfig[type], [type])

  const cancel = (isDirty) => {
    if (isDirty && !window.confirm('Discard this unsaved draft?')) return
    navigate(config.cancelPath)
  }

  if (!config) return null
  const Form = config.Form

  return (
    <CandidateLayout title={config.title}>
      <div className="mx-auto min-w-0 max-w-3xl">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">{config.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff]">{config.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8892b0]">{config.description}</p>
        </section>
        {storageError && (
          <p role="status" className="mt-6 rounded-lg border border-[#facc15]/25 bg-[#facc15]/5 px-4 py-3 text-sm text-[#fde68a]">{storageError}</p>
        )}
        <Card padding="lg" className="mt-8 min-w-0 max-w-full">
          <Form onCancel={cancel} />
        </Card>
      </div>
    </CandidateLayout>
  )
}
