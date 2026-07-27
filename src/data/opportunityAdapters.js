import { OPPORTUNITY_TYPES } from './mockOpportunities'

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
    description: job.description,
    fullDescription: job.description,
    location: job.location || 'Location not specified',
    workStyle: inferWorkStyle(job.location),
    skills: job.skills,
    deadline: job.deadline,
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
    typeCategory: 'Projects',
    title: project.title,
    company: project.company,
    description: project.description,
    fullDescription: project.description,
    location: 'Remote',
    workStyle: 'Remote',
    skills: project.skills,
    deadline: project.deadline,
    eligibility: 'Open to candidates who can deliver the requested project scope.',
    actionLabel: 'Submit proposal',
  }
}
