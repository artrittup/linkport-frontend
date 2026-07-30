import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  getCandidateProfile,
  getProfileErrorMessage,
  getProfileValidationErrors,
  updateCandidateProfile,
} from '../api/profileApi'
import Button from '../components/Button'
import CandidateProfileHeader from '../components/CandidateProfileHeader'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ProjectShowcaseCard from '../components/ProjectShowcaseCard'
import SkillsInput from '../components/SkillsInput'
import { getCandidateActivityPath } from '../config/candidateActivity'
import { useAuth } from '../context/AuthContext'
import {
  COLLABORATION_STATUS_OPTIONS,
  getCollaborationStatusLabel,
  getInterestLabel,
  mapEditableCandidateProfile,
  parseCommaSeparatedValues,
} from '../data/communityMemberMapper'
import useCommunityProjects from '../hooks/useCommunityProjects'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const inputClasses = 'mt-2 w-full min-w-0 max-w-full rounded-lg border border-border bg-background/70 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring'

function FieldError({ errors, name }) {
  const message = errors[name]
    || Object.entries(errors).find(([field]) => field.startsWith(`${name}.`))?.[1]
  if (!message) return null
  return <p className="mt-1.5 text-xs text-danger-text">{message}</p>
}

function ProfileSection({ title, description, children, className = '' }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-border bg-surface/55 p-5 sm:p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 text-sm text-text-subtle">{description}</p>}
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  )
}

function EmptyProfileText({ children, onEdit }) {
  return (
    <div>
      <p className="text-sm leading-6 text-text-muted">{children}</p>
      {onEdit && (
        <button type="button" onClick={onEdit} className="mt-3 text-sm font-medium text-primary hover:underline">
          Add information
        </button>
      )}
    </div>
  )
}

export default function CandidateProfile() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(() => mapEditableCandidateProfile(null, user))
  const [draft, setDraft] = useState(() => mapEditableCandidateProfile(null, user))
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const {
    projects: profileProjects,
    isLoading: projectsLoading,
    error: projectsError,
    retry: retryProjects,
  } = useCommunityProjects({
    userId: user?.id,
    perPage: 3,
    enabled: Boolean(user?.id),
  })

  useEffect(() => {
    let isActive = true

    async function loadProfile() {
      setIsLoading(true)
      setLoadError('')

      try {
        const { profile: responseProfile } = await getCandidateProfile()
        if (!isActive) return
        const nextProfile = mapEditableCandidateProfile(responseProfile, user)
        setProfile(nextProfile)
        setDraft(nextProfile)
      } catch (requestError) {
        if (!isActive) return
        const fallbackProfile = mapEditableCandidateProfile(null, user)
        setProfile(fallbackProfile)
        setDraft(fallbackProfile)
        setLoadError(getProfileErrorMessage(requestError, 'Unable to load your member profile.'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadProfile()
    return () => {
      isActive = false
    }
  }, [user])

  const openEdit = () => {
    setDraft(profile)
    setSaveError('')
    setFieldErrors({})
    setSaveSuccess(false)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setDraft(profile)
    setSaveError('')
    setFieldErrors({})
    setIsEditing(false)
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => {
      const apiField = {
        professionalTitle: 'headline',
        fieldOfStudy: 'field_of_study',
        graduationYear: 'graduation_year',
        interestsInput: 'interests',
        collaborationStatus: 'collaboration_status',
        lookingForRolesInput: 'looking_for_roles',
        portfolioLink: 'website',
        githubUrl: 'github_url',
        linkedinUrl: 'linkedin_url',
        cvUrl: 'cv_url',
      }[name] ?? name
      const nextEntries = Object.entries(current).filter(([field]) => (
        field !== apiField && !field.startsWith(`${apiField}.`)
      ))
      return nextEntries.length === Object.keys(current).length
        ? current
        : Object.fromEntries(nextEntries)
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaveError('')
    setFieldErrors({})

    const nullable = (value = '') => value.trim() || null
    const graduationYear = String(draft.graduationYear).trim()
    if (graduationYear && (!/^\d{4}$/.test(graduationYear) || Number(graduationYear) < 1900 || Number(graduationYear) > 2200)) {
      setFieldErrors({ graduation_year: 'Enter a graduation year between 1900 and 2200.' })
      setSaveError('Please correct the highlighted profile field.')
      return
    }

    setIsSaving(true)

    try {
      const response = await updateCandidateProfile({
        headline: nullable(draft.professionalTitle),
        bio: nullable(draft.bio),
        location: nullable(draft.location),
        university: nullable(draft.university),
        field_of_study: nullable(draft.fieldOfStudy),
        graduation_year: graduationYear ? Number(graduationYear) : null,
        interests: parseCommaSeparatedValues(draft.interestsInput),
        collaboration_status: draft.collaborationStatus || null,
        looking_for_roles: parseCommaSeparatedValues(draft.lookingForRolesInput),
        phone: nullable(draft.phone),
        website: nullable(draft.portfolioLink),
        github_url: nullable(draft.githubUrl),
        linkedin_url: nullable(draft.linkedinUrl),
        skills: draft.skills,
        education: nullable(draft.education),
        experience: nullable(draft.experience),
        cv_url: nullable(draft.cvUrl),
      })

      const savedProfile = mapEditableCandidateProfile(response.profile, user)
      setProfile(savedProfile)
      setDraft(savedProfile)
      setSaveSuccess(true)
      setIsEditing(false)
      showToast(response.message ?? 'Profile saved successfully.', 'success')
    } catch (requestError) {
      setFieldErrors(getProfileValidationErrors(requestError))
      setSaveError(getProfileErrorMessage(requestError, 'Unable to save your member profile.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <CandidateLayout title="Profile">
        <LoadingSpinner label="Loading your profile..." size="lg" />
      </CandidateLayout>
    )
  }

  if (isEditing) {
    return (
      <CandidateLayout title="Edit profile">
        <div className="min-w-0 max-w-4xl">
          <section>
            <p className="font-mono text-sm text-primary">Member profile</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">Edit profile</h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">Update the information shown on your professional community profile.</p>
          </section>

          <Card padding="lg" className="mt-8 min-w-0">
            <form onSubmit={handleSubmit} className="min-w-0 space-y-8">
              <fieldset className="min-w-0">
                <legend className="text-lg font-semibold text-text-primary">Account</legend>
                <p className="mt-1 text-xs text-text-subtle">Name and email are managed by your account.</p>
                <div className="mt-4 grid min-w-0 gap-5 md:grid-cols-2">
                  <label className="min-w-0 text-sm font-medium">
                    Full name
                    <input value={draft.fullName} readOnly className={`${inputClasses} cursor-not-allowed opacity-70`} />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Email
                    <input type="email" value={draft.email} readOnly className={`${inputClasses} cursor-not-allowed opacity-70`} />
                  </label>
                </div>
              </fieldset>

              <fieldset className="min-w-0 border-t border-border pt-7">
                <legend className="text-lg font-semibold text-text-primary">Community profile</legend>
                <p className="mt-1 text-xs text-text-subtle">These fields help other members discover you and understand how you want to collaborate.</p>
                <div className="mt-4 grid min-w-0 gap-5 md:grid-cols-2">
                  <label className="min-w-0 text-sm font-medium">
                    University
                    <input name="university" value={draft.university} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="university" />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Field of study
                    <input name="fieldOfStudy" value={draft.fieldOfStudy} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="field_of_study" />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Graduation year
                    <input name="graduationYear" type="number" min="1900" max="2200" value={draft.graduationYear} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="graduation_year" />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Collaboration status
                    <select name="collaborationStatus" value={draft.collaborationStatus} onChange={updateField} className={inputClasses}>
                      {COLLABORATION_STATUS_OPTIONS.map((option) => <option key={option.value || 'none'} value={option.value}>{option.label}</option>)}
                    </select>
                    <FieldError errors={fieldErrors} name="collaboration_status" />
                  </label>
                  <label className="min-w-0 text-sm font-medium md:col-span-2">
                    Interests
                    <input name="interestsInput" value={draft.interestsInput} onChange={updateField} placeholder="web_development, design, AI ethics" className={inputClasses} />
                    <p className="mt-1.5 text-xs text-text-subtle">Separate interests with commas. Common values use readable labels publicly.</p>
                    <FieldError errors={fieldErrors} name="interests" />
                  </label>
                  <label className="min-w-0 text-sm font-medium md:col-span-2">
                    Looking-for roles
                    <input name="lookingForRolesInput" value={draft.lookingForRolesInput} onChange={updateField} placeholder="Frontend Developer, UI/UX Designer" className={inputClasses} />
                    <p className="mt-1.5 text-xs text-text-subtle">Separate roles with commas.</p>
                    <FieldError errors={fieldErrors} name="looking_for_roles" />
                  </label>
                </div>
              </fieldset>

              <fieldset className="min-w-0 border-t border-border pt-7">
                <legend className="text-lg font-semibold text-text-primary">Profile basics</legend>
                <div className="mt-4 grid min-w-0 gap-5 md:grid-cols-2">
                  <label className="min-w-0 text-sm font-medium">
                    Professional headline
                    <input name="professionalTitle" value={draft.professionalTitle} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="headline" />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Location
                    <input name="location" value={draft.location} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="location" />
                  </label>
                  <label className="min-w-0 text-sm font-medium md:col-span-2">
                    Phone
                    <input name="phone" type="tel" value={draft.phone} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="phone" />
                  </label>
                  <label className="min-w-0 text-sm font-medium md:col-span-2">
                    Biography
                    <textarea name="bio" rows="5" value={draft.bio} onChange={updateField} className={`${inputClasses} resize-y`} />
                    <FieldError errors={fieldErrors} name="bio" />
                  </label>
                </div>
              </fieldset>

              <fieldset className="min-w-0 border-t border-border pt-7">
                <legend className="text-lg font-semibold text-text-primary">Experience and skills</legend>
                <div className="mt-4 grid min-w-0 gap-5 md:grid-cols-2">
                  <label className="min-w-0 text-sm font-medium">
                    Education
                    <textarea name="education" rows="4" value={draft.education} onChange={updateField} className={`${inputClasses} resize-y`} />
                    <FieldError errors={fieldErrors} name="education" />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Experience
                    <textarea name="experience" rows="4" value={draft.experience} onChange={updateField} className={`${inputClasses} resize-y`} />
                    <FieldError errors={fieldErrors} name="experience" />
                  </label>
                  <div className="min-w-0 md:col-span-2">
                    <p className="text-sm font-medium">Skills</p>
                    <div className="mt-2 min-w-0">
                      <SkillsInput
                        skills={draft.skills}
                        setSkills={(skills) => setDraft((current) => ({ ...current, skills }))}
                        placeholder="Type a skill and press Enter"
                      />
                    </div>
                    <FieldError errors={fieldErrors} name="skills" />
                  </div>
                </div>
              </fieldset>

              <fieldset className="min-w-0 border-t border-border pt-7">
                <legend className="text-lg font-semibold text-text-primary">Professional links</legend>
                <div className="mt-4 grid min-w-0 gap-5 md:grid-cols-2">
                  <label className="min-w-0 text-sm font-medium">
                    Portfolio or website
                    <input name="portfolioLink" type="url" value={draft.portfolioLink} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="website" />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    GitHub URL
                    <input name="githubUrl" type="url" value={draft.githubUrl} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="github_url" />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    LinkedIn URL
                    <input name="linkedinUrl" type="url" value={draft.linkedinUrl} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="linkedin_url" />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    CV URL
                    <input name="cvUrl" type="url" value={draft.cvUrl} onChange={updateField} className={inputClasses} />
                    <FieldError errors={fieldErrors} name="cv_url" />
                  </label>
                </div>
              </fieldset>

              {saveError && (
                <p role="alert" className="rounded-lg border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger-text">
                  {saveError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save profile'}</Button>
              </div>
            </form>
          </Card>
        </div>
      </CandidateLayout>
    )
  }

  const currentFocus = profile.skills.slice(0, 3)

  return (
    <CandidateLayout title="Profile">
      <div className="min-w-0 max-w-full space-y-8">
        <section>
          <p className="font-mono text-sm text-primary">Member profile</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">Profile</h2>
          <p className="mt-3 text-sm leading-6 text-text-muted">Your professional community profile and project portfolio.</p>
        </section>

        {loadError && (
          <p role="alert" className="rounded-lg border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger-text">{loadError}</p>
        )}
        {saveSuccess && (
          <p role="status" className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success-text">Profile changes saved successfully.</p>
        )}

        <CandidateProfileHeader profile={profile} isOwner onEdit={openEdit} />

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
          <ProfileSection title="About">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Biography</h4>
                {profile.bio
                  ? <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-text-secondary">{profile.bio}</p>
                  : <EmptyProfileText onEdit={openEdit}>No biography added yet.</EmptyProfileText>}
              </div>
              {(profile.university || profile.fieldOfStudy || profile.graduationYear) && (
                <dl className="grid gap-4 border-y border-border py-5 sm:grid-cols-2">
                  {profile.university && <div><dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">University</dt><dd className="mt-2 break-words text-sm text-text-secondary">{profile.university}</dd></div>}
                  {profile.fieldOfStudy && <div><dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Field of study</dt><dd className="mt-2 break-words text-sm text-text-secondary">{profile.fieldOfStudy}</dd></div>}
                  {profile.graduationYear && <div><dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Graduation year</dt><dd className="mt-2 text-sm text-text-secondary">{profile.graduationYear}</dd></div>}
                </dl>
              )}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Education summary</h4>
                {profile.education
                  ? <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-text-secondary">{profile.education}</p>
                  : <EmptyProfileText onEdit={openEdit}>No education summary added yet.</EmptyProfileText>}
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Current focus</h4>
                <p className="mt-2 break-words text-sm leading-6 text-text-secondary">
                  {currentFocus.length > 0 ? currentFocus.join(', ') : (profile.professionalTitle || 'Add skills to show your current focus.')}
                </p>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Links and CV">
            {profile.cvUrl ? (
              <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">View CV</a>
            ) : (
              <EmptyProfileText onEdit={openEdit}>No CV link added.</EmptyProfileText>
            )}
            {!profile.portfolioLink && !profile.githubUrl && !profile.linkedinUrl && (
              <p className="mt-4 text-xs leading-5 text-text-subtle">No external professional links added yet.</p>
            )}
          </ProfileSection>
        </div>

        <ProfileSection title="Skills" description="Tools, technologies, and areas of practice.">
          {profile.skills.length > 0 ? (
            <div className="flex min-w-0 flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="max-w-full break-words rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-sm text-primary">{skill}</span>
              ))}
            </div>
          ) : (
            <EmptyProfileText onEdit={openEdit}>No skills added yet.</EmptyProfileText>
          )}
        </ProfileSection>

        <ProfileSection title="Community and collaboration" description="Your public interests and collaboration preferences.">
          <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Collaboration status</h4>
              {profile.collaborationStatus
                ? <p className="mt-2 inline-flex max-w-full break-words rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-sm text-primary">{getCollaborationStatusLabel(profile.collaborationStatus)}</p>
                : <EmptyProfileText onEdit={openEdit}>No collaboration status selected.</EmptyProfileText>}
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Looking for</h4>
              {profile.lookingForRoles.length > 0
                ? <ul className="mt-2 space-y-1 text-sm text-text-secondary">{profile.lookingForRoles.map((role) => <li key={role} className="break-words">&bull; {role}</li>)}</ul>
                : <EmptyProfileText onEdit={openEdit}>No collaboration roles listed.</EmptyProfileText>}
            </div>
          </div>
          <div className="mt-6 border-t border-border pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Interests</h4>
            {profile.interests.length > 0
              ? <div className="mt-2 flex min-w-0 flex-wrap gap-2">{profile.interests.map((interest) => <span key={interest} className="max-w-full break-words rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary">{getInterestLabel(interest)}</span>)}</div>
              : <EmptyProfileText onEdit={openEdit}>No interests added yet.</EmptyProfileText>}
          </div>
        </ProfileSection>

        <section className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary">Projects</h3>
              <p className="mt-2 text-sm text-text-muted">Selected work from the LinkPort Project Showcase.</p>
            </div>
            <Link to="/member/projects" className="text-sm font-medium text-primary hover:underline">View all projects</Link>
          </div>
          {projectsLoading ? (
            <Card className="mt-5"><p className="text-sm text-text-muted">Loading your projects...</p></Card>
          ) : projectsError ? (
            <Card className="mt-5">
              <p className="text-sm text-text-muted">Your projects are temporarily unavailable.</p>
              <button type="button" onClick={retryProjects} className="mt-3 text-sm font-medium text-primary hover:underline">Try again</button>
            </Card>
          ) : profileProjects.length > 0 ? (
            <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {profileProjects.map((project) => <ProjectShowcaseCard key={project.id} project={project} />)}
            </div>
          ) : (
            <Card className="mt-5">
              <EmptyProfileText>You have not shared a community project yet.</EmptyProfileText>
              <Link to="/member/create/project" className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">Share a project</Link>
            </Card>
          )}
        </section>

        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          <ProfileSection title="Experience">
            {profile.experience
              ? <p className="whitespace-pre-line break-words text-sm leading-6 text-text-secondary">{profile.experience}</p>
              : <EmptyProfileText onEdit={openEdit}>No experience added yet.</EmptyProfileText>}
          </ProfileSection>
          <ProfileSection title="Education">
            {profile.education
              ? <p className="whitespace-pre-line break-words text-sm leading-6 text-text-secondary">{profile.education}</p>
              : <EmptyProfileText onEdit={openEdit}>No education details added yet.</EmptyProfileText>}
          </ProfileSection>
        </div>

        <ProfileSection title="Activity" description="Quick links to your private member activity.">
          <Link to={getCandidateActivityPath()} className="inline-flex w-full items-center justify-center rounded-xl border border-primary bg-primary px-5 py-3 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover">
            View all activity
          </Link>
          <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-3">
            {[
              { label: 'Applications', path: getCandidateActivityPath('applications') },
              { label: 'Proposals', path: getCandidateActivityPath('proposals') },
              { label: 'Shared content', path: getCandidateActivityPath('content') },
            ].map((item) => (
              <Link key={item.path} to={item.path} className="rounded-xl border border-border bg-background/45 px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-primary/40 hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>
        </ProfileSection>
      </div>
    </CandidateLayout>
  )
}
