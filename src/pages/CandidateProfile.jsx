import { useEffect, useState } from 'react'
import {
  getCandidateProfile,
  getProfileErrorMessage,
  updateCandidateProfile,
} from '../api/profileApi'
import Button from '../components/Button'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import SkillsInput from '../components/SkillsInput'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const initialForm = {
  fullName: '',
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
}

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

function OverviewCard({ number, title, children, className = '' }) {
  return (
    <Card hover className={`h-full ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-[#e6f1ff]">{title}</h3>
        <span className="font-mono text-xs text-[#64ffda]">{number}</span>
      </div>
      {children}
    </Card>
  )
}

export default function CandidateProfile() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(initialForm)
  const [skills, setSkills] = useState([])
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadProfile() {
      try {
        const { profile } = await getCandidateProfile()

        if (!isActive) return

        setForm((current) => ({
          ...current,
          fullName: user?.name ?? '',
          professionalTitle: profile?.headline ?? '',
          location: profile?.location ?? '',
          bio: profile?.bio ?? '',
          phone: profile?.phone ?? '',
          portfolioLink: profile?.website ?? '',
          githubUrl: profile?.github_url ?? '',
          linkedinUrl: profile?.linkedin_url ?? '',
          education: profile?.education ?? '',
          experience: profile?.experience ?? '',
          cvUrl: profile?.cv_url ?? '',
        }))
        setSkills(profile?.skills ?? [])
      } catch (requestError) {
        if (isActive) {
          setLoadError(
            getProfileErrorMessage(
              requestError,
              'Unable to load your member profile.',
            ),
          )
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [user?.name])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setSaved(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaveError('')
    setSaved(false)
    setIsSaving(true)

    const nullable = (value = '') => value.trim() || null

    try {
      await updateCandidateProfile({
        headline: nullable(form.professionalTitle),
        bio: nullable(form.bio),
        location: nullable(form.location),
        phone: nullable(form.phone),
        website: nullable(form.portfolioLink),
        github_url: nullable(form.githubUrl),
        linkedin_url: nullable(form.linkedinUrl),
        education: nullable(form.education),
        experience: nullable(form.experience),
        cv_url: nullable(form.cvUrl),
        skills,
      })

      setSaved(true)
      showToast('Member profile saved successfully.', 'success')
    } catch (requestError) {
      setSaveError(
        getProfileErrorMessage(
          requestError,
          'Unable to save your member profile.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const scrollToEdit = () => {
    document.getElementById('edit-profile')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Member Profile" userType="Member">
        <LoadingSpinner label="Loading your profile..." size="lg" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Member Profile" userType="Member">
      <div className="space-y-10">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Professional profile</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Member Profile</h2>
          <p className="mt-3 text-[#8892b0]">
            Manage your professional profile and portfolio.
          </p>
        </section>

        {loadError && (
          <p role="alert" className="rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
            {loadError}
          </p>
        )}

        <Card padding="lg" className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#64ffda]/5 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-[#64ffda]/40 bg-[#172a45] font-mono text-2xl font-bold text-[#64ffda]">
              {(form.fullName || 'User')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl font-bold text-[#e6f1ff]">{form.fullName}</h3>
              <p className="mt-1 text-[#64ffda]">{form.professionalTitle}</p>
              <p className="mt-2 text-sm text-[#8892b0]">{form.location}</p>
            </div>
            <Button variant="outline" onClick={scrollToEdit}>
              Edit Profile
            </Button>
          </div>
        </Card>

        <section>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <OverviewCard number="01" title="About Me">
              <p className="text-sm leading-relaxed text-[#8892b0]">{form.bio}</p>
            </OverviewCard>

            <OverviewCard number="02" title="Education">
              <p className="text-sm text-[#e6f1ff]">{form.education}</p>
            </OverviewCard>

            <OverviewCard number="03" title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2.5 py-1 font-mono text-xs text-[#64ffda]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </OverviewCard>

            <OverviewCard number="04" title="Experience">
              <p className="text-sm text-[#e6f1ff]">{form.experience}</p>
            </OverviewCard>

            <OverviewCard number="05" title="Professional Links">
              {form.portfolioLink || form.githubUrl || form.linkedinUrl ? (
                <div className="space-y-3 text-sm">
                  {[
                    ['Portfolio', form.portfolioLink],
                    ['GitHub', form.githubUrl],
                    ['LinkedIn', form.linkedinUrl],
                  ]
                    .filter(([, url]) => url)
                    .map(([label, url]) => (
                      <a key={label} href={url} target="_blank" rel="noreferrer" className="block text-[#64ffda] hover:opacity-80">
                        {label}
                      </a>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-[#8892b0]">No professional links added.</p>
              )}
            </OverviewCard>

            <OverviewCard number="06" title="CV">
              {form.cvUrl ? <div className="flex items-center gap-3 rounded-md border border-[#233554] bg-[#0a192f]/50 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#22c55e]/10 text-sm text-[#22c55e]">
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#e6f1ff]">CV link available</p>
                  <p className="mt-0.5 text-xs text-[#22c55e]">Saved in your profile</p>
                </div>
              </div> : <p className="text-sm text-[#8892b0]">No CV link added.</p>}
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                disabled={!form.cvUrl}
                onClick={() => window.open(form.cvUrl, '_blank', 'noopener,noreferrer')}
              >
                View CV
              </Button>
            </OverviewCard>
          </div>
        </section>

        <section id="edit-profile" className="scroll-mt-24">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">Edit Profile</h2>
            <p className="mt-1 text-sm text-[#8892b0]">
              Keep your details current so companies can find the right fit.
            </p>
          </div>

          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium">Full name</label>
                  <input id="fullName" name="fullName" value={form.fullName} readOnly className={`${inputClasses} cursor-not-allowed opacity-70`} />
                  <p className="mt-1 text-xs text-[#64748b]">Managed by your account.</p>
                </div>
                <div>
                  <label htmlFor="professionalTitle" className="text-sm font-medium">Professional title</label>
                  <input id="professionalTitle" name="professionalTitle" value={form.professionalTitle} onChange={updateField} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="location" className="text-sm font-medium">Location</label>
                  <input id="location" name="location" value={form.location} onChange={updateField} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="education" className="text-sm font-medium">Education</label>
                  <input id="education" name="education" value={form.education} onChange={updateField} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="experience" className="text-sm font-medium">Experience</label>
                  <input id="experience" name="experience" value={form.experience} onChange={updateField} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="portfolioLink" className="text-sm font-medium">Portfolio link</label>
                  <input id="portfolioLink" name="portfolioLink" type="url" value={form.portfolioLink} onChange={updateField} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                  <input id="phone" name="phone" type="tel" value={form.phone ?? ''} onChange={updateField} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="githubUrl" className="text-sm font-medium">GitHub URL</label>
                  <input id="githubUrl" name="githubUrl" type="url" value={form.githubUrl ?? ''} onChange={updateField} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="linkedinUrl" className="text-sm font-medium">LinkedIn URL</label>
                  <input id="linkedinUrl" name="linkedinUrl" type="url" value={form.linkedinUrl ?? ''} onChange={updateField} className={inputClasses} />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                <textarea id="bio" name="bio" rows="5" value={form.bio} onChange={updateField} className={`${inputClasses} resize-y`} />
              </div>

              <div>
                <label className="text-sm font-medium">Skills</label>
                <div className="mt-2">
                  <SkillsInput skills={skills} setSkills={(nextSkills) => { setSkills(nextSkills); setSaved(false) }} placeholder="Type a skill and press Enter" />
                </div>
              </div>

              <div>
                <label htmlFor="cvUrl" className="text-sm font-medium">CV URL</label>
                <input
                  id="cvUrl"
                  name="cvUrl"
                  type="url"
                  value={form.cvUrl}
                  onChange={updateField}
                  placeholder="https://example.com/cv.pdf"
                  className={inputClasses}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite">
                  {saveError && <p role="alert" className="text-sm text-[#fca5a5]">{saveError}</p>}
                  {saved && (
                    <p className="text-sm text-[#22c55e]">Profile changes saved successfully.</p>
                  )}
                </div>
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
