import { useEffect, useMemo, useState } from 'react'
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
import { mockProjects } from '../data/mockProjects'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const emptyProfile = {
  fullName: '',
  email: '',
  professionalTitle: '',
  location: '',
  bio: '',
  education: '',
  experience: '',
  portfolioLink: '',
  phone: '',
  githubUrl: '',
  linkedinUrl: '',
  cvUrl: '',
  skills: [],
}

const inputClasses = 'mt-2 w-full min-w-0 max-w-full rounded-lg border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

function normalizeProfile(profile, user) {
  return {
    ...emptyProfile,
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    professionalTitle: profile?.headline ?? '',
    location: profile?.location ?? '',
    bio: profile?.bio ?? '',
    education: profile?.education ?? '',
    experience: profile?.experience ?? '',
    portfolioLink: profile?.website ?? '',
    phone: profile?.phone ?? '',
    githubUrl: profile?.github_url ?? '',
    linkedinUrl: profile?.linkedin_url ?? '',
    cvUrl: profile?.cv_url ?? '',
    skills: Array.isArray(profile?.skills) ? profile.skills : [],
  }
}

function FieldError({ errors, name }) {
  const message = errors[name]
    || Object.entries(errors).find(([field]) => field.startsWith(`${name}.`))?.[1]
  if (!message) return null
  return <p className="mt-1.5 text-xs text-[#fca5a5]">{message}</p>
}

function ProfileSection({ title, description, children, className = '' }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/55 p-5 sm:p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-[#e6f1ff]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[#64748b]">{description}</p>}
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  )
}

function EmptyProfileText({ children, onEdit }) {
  return (
    <div>
      <p className="text-sm leading-6 text-[#8892b0]">{children}</p>
      {onEdit && (
        <button type="button" onClick={onEdit} className="mt-3 text-sm font-medium text-[#64ffda] hover:underline">
          Add information
        </button>
      )}
    </div>
  )
}

export default function CandidateProfile() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(() => normalizeProfile(null, user))
  const [draft, setDraft] = useState(() => normalizeProfile(null, user))
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadProfile() {
      setIsLoading(true)
      setLoadError('')

      try {
        const { profile: responseProfile } = await getCandidateProfile()
        if (!isActive) return
        const nextProfile = normalizeProfile(responseProfile, user)
        setProfile(nextProfile)
        setDraft(nextProfile)
      } catch (requestError) {
        if (!isActive) return
        const fallbackProfile = normalizeProfile(null, user)
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

  const profileProjects = useMemo(() => {
    const normalizedName = profile.fullName.trim().toLowerCase()
    const matchingProjects = normalizedName
      ? mockProjects.filter((project) => project.creator.toLowerCase() === normalizedName)
      : []

    return {
      items: (matchingProjects.length > 0 ? matchingProjects : mockProjects.slice(0, 2)).slice(0, 3),
      isPreview: matchingProjects.length === 0,
    }
  }, [profile.fullName])

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
        portfolioLink: 'website',
        githubUrl: 'github_url',
        linkedinUrl: 'linkedin_url',
        cvUrl: 'cv_url',
      }[name] ?? name
      if (!current[apiField]) return current
      const next = { ...current }
      delete next[apiField]
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaveError('')
    setFieldErrors({})
    setIsSaving(true)

    const nullable = (value = '') => value.trim() || null

    try {
      const response = await updateCandidateProfile({
        headline: nullable(draft.professionalTitle),
        bio: nullable(draft.bio),
        location: nullable(draft.location),
        phone: nullable(draft.phone),
        website: nullable(draft.portfolioLink),
        github_url: nullable(draft.githubUrl),
        linkedin_url: nullable(draft.linkedinUrl),
        skills: draft.skills,
        education: nullable(draft.education),
        experience: nullable(draft.experience),
        cv_url: nullable(draft.cvUrl),
      })

      const savedProfile = normalizeProfile(response.profile, user)
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
      <DashboardLayout title="Profile" userType="Member">
        <LoadingSpinner label="Loading your profile..." size="lg" />
      </DashboardLayout>
    )
  }

  if (isEditing) {
    return (
      <DashboardLayout title="Edit profile" userType="Member">
        <div className="min-w-0 max-w-4xl">
          <section>
            <p className="font-mono text-sm text-[#64ffda]">Member profile</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff]">Edit profile</h2>
            <p className="mt-3 text-sm leading-6 text-[#8892b0]">Update the information shown on your professional community profile.</p>
          </section>

          <Card padding="lg" className="mt-8 min-w-0">
            <form onSubmit={handleSubmit} className="min-w-0 space-y-8">
              <fieldset className="min-w-0">
                <legend className="text-lg font-semibold text-[#e6f1ff]">Account</legend>
                <p className="mt-1 text-xs text-[#64748b]">Name and email are managed by your account.</p>
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

              <fieldset className="min-w-0 border-t border-[#233554] pt-7">
                <legend className="text-lg font-semibold text-[#e6f1ff]">Profile basics</legend>
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

              <fieldset className="min-w-0 border-t border-[#233554] pt-7">
                <legend className="text-lg font-semibold text-[#e6f1ff]">Experience and skills</legend>
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

              <fieldset className="min-w-0 border-t border-[#233554] pt-7">
                <legend className="text-lg font-semibold text-[#e6f1ff]">Professional links</legend>
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
                <p role="alert" className="rounded-lg border border-[#ef4444]/35 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
                  {saveError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save profile'}</Button>
              </div>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const currentFocus = profile.skills.slice(0, 3)

  return (
    <DashboardLayout title="Profile" userType="Member">
      <div className="min-w-0 max-w-full space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Member profile</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff]">Profile</h2>
          <p className="mt-3 text-sm leading-6 text-[#8892b0]">Your professional community profile and project portfolio.</p>
        </section>

        {loadError && (
          <p role="alert" className="rounded-lg border border-[#ef4444]/35 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">{loadError}</p>
        )}
        {saveSuccess && (
          <p role="status" className="rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-3 text-sm text-[#86efac]">Profile changes saved successfully.</p>
        )}

        <CandidateProfileHeader profile={profile} isOwner onEdit={openEdit} />

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
          <ProfileSection title="About">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Biography</h4>
                {profile.bio
                  ? <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{profile.bio}</p>
                  : <EmptyProfileText onEdit={openEdit}>No biography added yet.</EmptyProfileText>}
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Education summary</h4>
                {profile.education
                  ? <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{profile.education}</p>
                  : <EmptyProfileText onEdit={openEdit}>No education summary added yet.</EmptyProfileText>}
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Current focus</h4>
                <p className="mt-2 break-words text-sm leading-6 text-[#a8b2d1]">
                  {currentFocus.length > 0 ? currentFocus.join(', ') : (profile.professionalTitle || 'Add skills to show your current focus.')}
                </p>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Links and CV">
            {profile.cvUrl ? (
              <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#64ffda] hover:underline">View CV</a>
            ) : (
              <EmptyProfileText onEdit={openEdit}>No CV link added.</EmptyProfileText>
            )}
            {!profile.portfolioLink && !profile.githubUrl && !profile.linkedinUrl && (
              <p className="mt-4 text-xs leading-5 text-[#64748b]">No external professional links added yet.</p>
            )}
          </ProfileSection>
        </div>

        <ProfileSection title="Skills" description="Tools, technologies, and areas of practice.">
          {profile.skills.length > 0 ? (
            <div className="flex min-w-0 flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-3 py-1.5 text-sm text-[#64ffda]">{skill}</span>
              ))}
            </div>
          ) : (
            <EmptyProfileText onEdit={openEdit}>No skills added yet.</EmptyProfileText>
          )}
        </ProfileSection>

        <section className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-[#e6f1ff]">Projects</h3>
              <p className="mt-2 text-sm text-[#8892b0]">Selected work from the LinkPort Project Showcase.</p>
            </div>
            <Link to="/candidate/projects" className="text-sm font-medium text-[#64ffda] hover:underline">View all projects</Link>
          </div>
          {profileProjects.items.length > 0 ? (
            <>
              {profileProjects.isPreview && (
                <p className="mt-4 text-xs leading-5 text-[#64748b]">Portfolio associations are a frontend preview and will be connected to member projects in a later version.</p>
              )}
              <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {profileProjects.items.map((project) => <ProjectShowcaseCard key={project.id} project={project} />)}
              </div>
            </>
          ) : (
            <Card className="mt-5"><EmptyProfileText>No projects have been shared yet.</EmptyProfileText></Card>
          )}
        </section>

        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          <ProfileSection title="Experience">
            {profile.experience
              ? <p className="whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{profile.experience}</p>
              : <EmptyProfileText onEdit={openEdit}>No experience added yet.</EmptyProfileText>}
          </ProfileSection>
          <ProfileSection title="Education">
            {profile.education
              ? <p className="whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{profile.education}</p>
              : <EmptyProfileText onEdit={openEdit}>No education details added yet.</EmptyProfileText>}
          </ProfileSection>
        </div>

        <ProfileSection title="Activity" description="Quick links to your private Candidate activity.">
          <Link to={getCandidateActivityPath()} className="inline-flex w-full items-center justify-center rounded-xl border border-[#64ffda] bg-[#64ffda] px-5 py-3 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1]">
            View all activity
          </Link>
          <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-3">
            {[
              { label: 'Applications', path: getCandidateActivityPath('applications') },
              { label: 'Proposals', path: getCandidateActivityPath('proposals') },
              { label: 'Shared content', path: getCandidateActivityPath('content') },
            ].map((item) => (
              <Link key={item.path} to={item.path} className="rounded-xl border border-[#233554] bg-[#0a192f]/45 px-4 py-3 text-sm font-medium text-[#a8b2d1] transition-colors hover:border-[#64ffda]/40 hover:text-[#64ffda]">
                {item.label}
              </Link>
            ))}
          </div>
        </ProfileSection>
      </div>
    </DashboardLayout>
  )
}
