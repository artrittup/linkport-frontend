import { mapCommunityProject } from './communityProjectMapper'

export const COLLABORATION_STATUS_LABELS = {
  open_to_projects: 'Open to projects',
  looking_for_internship: 'Looking for internship',
  available_for_collaboration: 'Available for collaboration',
  building_a_team: 'Building a team',
  not_looking: 'Not actively looking',
}

export const COLLABORATION_STATUS_OPTIONS = [
  { value: '', label: 'Not specified' },
  ...Object.entries(COLLABORATION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export const INTEREST_LABELS = {
  web_development: 'Web Development',
  mobile: 'Mobile',
  ai_data: 'AI and Data',
  embedded_systems: 'Embedded Systems',
  design: 'Design',
  business: 'Business',
}

export const INTEREST_OPTIONS = [
  { value: '', label: 'All' },
  ...Object.entries(INTEREST_LABELS).map(([value, label]) => ({ value, label })),
]

function readableValue(value) {
  return String(value ?? '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function getCollaborationStatusLabel(value) {
  return COLLABORATION_STATUS_LABELS[value] ?? readableValue(value)
}

export function getInterestLabel(value) {
  return INTEREST_LABELS[value] ?? readableValue(value)
}

export function mapCommunityMember(member) {
  if (!member || typeof member !== 'object') return null
  const name = member.name ?? 'LinkPort member'
  const fallbackInitials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return {
    id: String(member.id),
    name,
    initials: member.initials || fallbackInitials || 'LP',
    headline: member.headline ?? '',
    biography: member.bio ?? '',
    university: member.university ?? '',
    fieldOfStudy: member.field_of_study ?? '',
    graduationYear: member.graduation_year ?? '',
    location: member.location ?? '',
    skills: Array.isArray(member.skills) ? member.skills.filter(Boolean) : [],
    interests: Array.isArray(member.interests) ? member.interests.filter(Boolean) : [],
    collaborationStatus: member.collaboration_status ?? '',
    lookingForRoles: Array.isArray(member.looking_for_roles)
      ? member.looking_for_roles.filter(Boolean)
      : [],
    githubUrl: member.github_url ?? '',
    linkedinUrl: member.linkedin_url ?? '',
    portfolioUrl: member.website ?? '',
    projects: Array.isArray(member.community_projects)
      ? member.community_projects.map(mapCommunityProject).filter(Boolean)
      : [],
    projectCount: Number.isFinite(Number(member.community_projects_count))
      ? Number(member.community_projects_count)
      : 0,
    isCurrentUser: Boolean(member.is_current_user),
    updatedAt: member.updated_at ?? null,
  }
}

export function mapEditableCandidateProfile(profile, user) {
  return {
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    professionalTitle: profile?.headline ?? '',
    location: profile?.location ?? '',
    bio: profile?.bio ?? '',
    university: profile?.university ?? '',
    fieldOfStudy: profile?.field_of_study ?? '',
    graduationYear: profile?.graduation_year ?? '',
    interests: Array.isArray(profile?.interests) ? profile.interests.filter(Boolean) : [],
    interestsInput: Array.isArray(profile?.interests) ? profile.interests.filter(Boolean).join(', ') : '',
    collaborationStatus: profile?.collaboration_status ?? '',
    lookingForRoles: Array.isArray(profile?.looking_for_roles)
      ? profile.looking_for_roles.filter(Boolean)
      : [],
    lookingForRolesInput: Array.isArray(profile?.looking_for_roles)
      ? profile.looking_for_roles.filter(Boolean).join(', ')
      : '',
    education: profile?.education ?? '',
    experience: profile?.experience ?? '',
    portfolioLink: profile?.website ?? '',
    phone: profile?.phone ?? '',
    githubUrl: profile?.github_url ?? '',
    linkedinUrl: profile?.linkedin_url ?? '',
    cvUrl: profile?.cv_url ?? '',
    skills: Array.isArray(profile?.skills) ? profile.skills.filter(Boolean) : [],
  }
}

export function parseCommaSeparatedValues(value) {
  const seen = new Set()
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\s+/g, ' '))
    .filter((item) => {
      const key = item.toLowerCase()
      if (!item || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function getSafeMemberUrl(value) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}
