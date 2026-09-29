export const OPPORTUNITY_TYPES = {
  JOB: 'JOB',
  INTERNSHIP: 'INTERNSHIP',
  PROJECT: 'COMPANY PROJECT',
}

function inferWorkStyle(location = '') {
  const value = location.toLowerCase()
  if (value.includes('remote')) return 'Remote'
  if (value.includes('hybrid')) return 'Hybrid'
  return 'On-site'
}

function isInternship(job) {
  return String(job.type ?? '').toLowerCase().includes('intern')
}

export function jobToOpportunity(job) {
  const internship = isInternship(job)

  return {
    id: `job-${job.id}`,
    source: 'job',
    sourceId: job.id,
    sourceData: job,
    type: internship ? OPPORTUNITY_TYPES.INTERNSHIP : OPPORTUNITY_TYPES.JOB,
    typeCategory: internship ? 'Internships' : 'Jobs',
    title: job.title,
    company: job.company,
    companyId: job.companyData?.id ?? null,
    description: job.description,
    fullDescription: job.description,
    location: job.location || 'Location not specified',
    workStyle: inferWorkStyle(job.location),
    employmentType: job.type || (internship ? 'Internship' : ''),
    skills: job.skills,
    deadline: job.deadline,
    status: job.status ?? '',
    postedAt: job.created_at ?? null,
    eligibility: job.requirements || 'See the full role description for requirements.',
    actionLabel: 'Apply',
  }
}

export function projectToOpportunity(project) {
  return {
    id: `project-${project.id}`,
    source: 'project',
    sourceId: project.id,
    sourceData: project,
    type: OPPORTUNITY_TYPES.PROJECT,
    typeCategory: 'Company projects',
    title: project.title,
    company: project.company,
    companyId: project.companyData?.id ?? null,
    description: project.description,
    fullDescription: project.description,
    location: 'Remote',
    workStyle: 'Remote',
    skills: project.skills,
    deadline: project.deadline,
    budget: project.budget ?? null,
    category: project.category ?? '',
    status: project.status ?? '',
    bidCount: project.bids_count ?? null,
    postedAt: project.created_at ?? null,
    eligibility: 'Open to candidates who can deliver the requested project scope.',
    actionLabel: 'Submit bid',
  }
}
