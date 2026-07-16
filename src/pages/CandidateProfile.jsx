import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import SkillsInput from '../components/SkillsInput'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/candidate/dashboard' },
  { label: 'My Profile', href: '/candidate/profile' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'My Applications', href: '/candidate/applications' },
  { label: 'Projects', href: '/projects' },
  { label: 'My Bids', href: '/candidate/bids' },
  { label: 'Settings', href: '/settings' },
  { label: 'Logout', href: '/login' },
]

const initialForm = {
  fullName: 'Arta Krasniqi',
  professionalTitle: 'Junior Frontend Developer',
  location: 'Prishtina, Kosovo',
  bio: 'Computer Science student and frontend developer focused on building accessible, responsive digital products. I enjoy turning thoughtful design ideas into clean user experiences.',
  education: 'University of Prishtina — Computer Science',
  experience: 'Frontend Intern at Tech Solutions',
  portfolioLink: 'https://portfolio.example.com',
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
  const [form, setForm] = useState(initialForm)
  const [skills, setSkills] = useState([
    'React',
    'JavaScript',
    'Tailwind CSS',
    'UI Design',
  ])
  const [cvName, setCvName] = useState('Arta_Krasniqi_CV.pdf')
  const [saved, setSaved] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setSaved(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSaved(true)
  }

  const scrollToEdit = () => {
    document.getElementById('edit-profile')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <DashboardLayout title="My Profile" navItems={navItems} userType="Candidate">
      <div className="space-y-10">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Professional profile</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">My Profile</h2>
          <p className="mt-3 text-[#8892b0]">
            Manage your professional profile and portfolio.
          </p>
        </section>

        <Card padding="lg" className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#64ffda]/5 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-[#64ffda]/40 bg-[#172a45] font-mono text-2xl font-bold text-[#64ffda]">
              AK
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

            <OverviewCard number="05" title="Portfolio Projects">
              <ul className="space-y-3 text-sm text-[#8892b0]">
                {[
                  'Personal Portfolio Website',
                  'Restaurant Website',
                  'Dashboard UI Concept',
                ].map((project) => (
                  <li key={project} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#64ffda]" />
                    {project}
                  </li>
                ))}
              </ul>
            </OverviewCard>

            <OverviewCard number="06" title="CV">
              <div className="flex items-center gap-3 rounded-md border border-[#233554] bg-[#0a192f]/50 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#22c55e]/10 text-sm text-[#22c55e]">
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#e6f1ff]">{cvName}</p>
                  <p className="mt-0.5 text-xs text-[#22c55e]">CV uploaded</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => window.alert(`Previewing ${cvName}`)}
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
                  <input id="fullName" name="fullName" value={form.fullName} onChange={updateField} className={inputClasses} />
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
                <label htmlFor="cv-upload" className="text-sm font-medium">CV upload</label>
                <div className="mt-2 rounded-md border border-dashed border-[#233554] bg-[#0a192f]/40 p-4">
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) setCvName(file.name)
                      setSaved(false)
                    }}
                    className="block w-full text-sm text-[#8892b0] file:mr-4 file:rounded-md file:border file:border-[#64ffda] file:bg-transparent file:px-4 file:py-2 file:text-sm file:text-[#64ffda] hover:file:bg-[#64ffda]/10"
                  />
                  <p className="mt-2 text-xs text-[#64748b]">PDF, DOC, or DOCX. Frontend preview only.</p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite">
                  {saved && (
                    <p className="text-sm text-[#22c55e]">Profile changes saved successfully.</p>
                  )}
                </div>
                <Button type="submit" size="lg">Save Changes</Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
