import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/company/dashboard' },
  { label: 'Company Profile', href: '/company/profile' },
  { label: 'Jobs', href: '/company/jobs' },
  { label: 'Applications', href: '/company/applications' },
  { label: 'Projects', href: '/company/projects' },
  { label: 'Bids', href: '/company/bids' },
  { label: 'Settings', href: '/settings' },
  { label: 'Logout', href: '/login' },
]

const initialForm = {
  companyName: 'Tech Solutions',
  industry: 'Software Development',
  location: 'Prishtina, Kosovo',
  website: 'www.techsolutions.com',
  contactEmail: 'hello@techsolutions.com',
  description:
    'Tech Solutions builds modern digital products for ambitious businesses. We invest in young talent through internships, junior roles, and hands-on projects that help emerging professionals grow.',
}

const openJobs = [
  'Junior Frontend Developer',
  'Backend Developer Intern',
  'UI/UX Design Intern',
]

const activeProjects = [
  'Restaurant Website',
  'Booking System UI',
  'Company Portfolio Website',
]

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

function InformationCard({ number, title, children, className = '' }) {
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

function ItemList({ items, badge }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center justify-between gap-3 rounded-md border border-[#233554] bg-[#0a192f]/50 px-3 py-2.5"
        >
          <span className="text-sm text-[#e6f1ff]">{item}</span>
          <span className="shrink-0 rounded-full bg-[#64ffda]/10 px-2 py-0.5 font-mono text-[10px] text-[#64ffda]">
            {badge}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function CompanyProfile() {
  const [form, setForm] = useState(initialForm)
  const [logoName, setLogoName] = useState('No custom logo uploaded')
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
    document.getElementById('edit-company-profile')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <DashboardLayout title="Company Profile" navItems={navItems} userType="Company">
      <div className="space-y-10">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Public company profile</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Company Profile
          </h2>
          <p className="mt-3 text-[#8892b0]">
            Manage your company information and public profile.
          </p>
        </section>

        <Card padding="lg" className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#64ffda]/5 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-[#64ffda]/40 bg-[#172a45] font-mono text-2xl font-bold text-[#64ffda]">
              TS
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl font-bold text-[#e6f1ff]">{form.companyName}</h3>
              <p className="mt-1 text-[#64ffda]">{form.industry}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#8892b0]">
                <span>{form.location}</span>
                <span>{form.website}</span>
              </div>
            </div>
            <Button variant="outline" onClick={scrollToEdit}>
              Edit Profile
            </Button>
          </div>
        </Card>

        <section>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <InformationCard number="01" title="About Company" className="md:col-span-2">
              <p className="text-sm leading-relaxed text-[#8892b0]">{form.description}</p>
            </InformationCard>

            <InformationCard number="02" title="Industry">
              <p className="text-sm text-[#e6f1ff]">{form.industry}</p>
            </InformationCard>

            <InformationCard number="03" title="Location">
              <p className="text-sm text-[#e6f1ff]">{form.location}</p>
            </InformationCard>

            <InformationCard number="04" title="Website">
              <a
                href={`https://${form.website.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noreferrer"
                className="break-all text-sm text-[#64ffda] transition-opacity hover:opacity-80"
              >
                {form.website}
              </a>
            </InformationCard>

            <InformationCard number="05" title="Contact Email">
              <a
                href={`mailto:${form.contactEmail}`}
                className="break-all text-sm text-[#64ffda] transition-opacity hover:opacity-80"
              >
                {form.contactEmail}
              </a>
            </InformationCard>

            <InformationCard number="06" title="Open Jobs">
              <ItemList items={openJobs} badge="Open" />
            </InformationCard>

            <InformationCard number="07" title="Active Projects" className="md:col-span-2">
              <ItemList items={activeProjects} badge="Active" />
            </InformationCard>
          </div>
        </section>

        <section id="edit-company-profile" className="scroll-mt-24">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">
              Edit Company Profile
            </h2>
            <p className="mt-1 text-sm text-[#8892b0]">
              Keep your public details current for candidates and collaborators.
            </p>
          </div>

          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="companyName" className="text-sm font-medium">
                    Company name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={updateField}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="industry" className="text-sm font-medium">
                    Industry
                  </label>
                  <input
                    id="industry"
                    name="industry"
                    value={form.industry}
                    onChange={updateField}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="company-location" className="text-sm font-medium">
                    Location
                  </label>
                  <input
                    id="company-location"
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="website" className="text-sm font-medium">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={updateField}
                    placeholder="www.company.com"
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="contactEmail" className="text-sm font-medium">
                    Contact email
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={updateField}
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company-description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="company-description"
                  name="description"
                  rows="5"
                  value={form.description}
                  onChange={updateField}
                  className={`${inputClasses} resize-y`}
                />
              </div>

              <div>
                <label htmlFor="logo-upload" className="text-sm font-medium">
                  Company logo
                </label>
                <div className="mt-2 rounded-md border border-dashed border-[#233554] bg-[#0a192f]/40 p-4">
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) setLogoName(file.name)
                      setSaved(false)
                    }}
                    className="block w-full text-sm text-[#8892b0] file:mr-4 file:rounded-md file:border file:border-[#64ffda] file:bg-transparent file:px-4 file:py-2 file:text-sm file:text-[#64ffda] hover:file:bg-[#64ffda]/10"
                  />
                  <p className="mt-2 text-xs text-[#64748b]">
                    {logoName}. PNG, JPG, or SVG. Frontend preview only.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite">
                  {saved && (
                    <p className="text-sm text-[#22c55e]">
                      Company profile saved successfully.
                    </p>
                  )}
                </div>
                <Button type="submit" size="lg">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
