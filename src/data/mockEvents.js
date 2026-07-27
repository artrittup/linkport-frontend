export const EVENT_CATEGORIES = [
  'All',
  'Workshop',
  'Meetup',
  'Project Showcase',
  'Career',
  'Challenge',
]

const events = [
  {
    id: 'portfolio-review-workshop',
    title: 'Portfolio Review Workshop',
    shortDescription: 'Bring one project and get practical feedback on how you present your work.',
    fullDescription: 'Reviewers from design and engineering will help members improve project summaries, case-study structure, accessibility, and evidence of individual contribution. The workshop includes a short introduction followed by small feedback groups.',
    category: 'Workshop',
    date: '2026-08-04',
    startTime: '18:00',
    endTime: '19:30',
    location: 'Online',
    format: 'Online',
    organizer: 'LinkPort Community',
    capacity: 40,
    topics: ['Portfolio', 'Accessibility', 'Career'],
    requirements: ['One project or portfolio draft', 'A short introduction to your role'],
    audience: 'Students and early-career members preparing to share their work.',
    externalUrl: 'https://discord.gg/8NemkkpJj',
    createdAt: '2026-07-08T09:00:00Z',
  },
  {
    id: 'community-project-showcase',
    title: 'Community Project Showcase',
    shortDescription: 'See what LinkPort teams are building and exchange focused product feedback.',
    fullDescription: 'Four community teams will share short demos, current challenges, and the skills they need next. Each demonstration is followed by questions and practical feedback from members.',
    category: 'Project Showcase',
    date: '2026-08-12',
    startTime: '18:00',
    endTime: '20:00',
    location: 'Innovation Centre, Prishtina + Online',
    format: 'Hybrid',
    organizer: 'LinkPort Project Showcase',
    capacity: 80,
    topics: ['Product Demos', 'Team Building', 'Feedback'],
    requirements: [],
    audience: 'Builders, potential collaborators, and members interested in new community projects.',
    externalUrl: '',
    createdAt: '2026-07-10T11:30:00Z',
  },
  {
    id: 'community-build-night',
    title: 'Community Build Night',
    shortDescription: 'An informal coding meetup for focused work, peer support, and project questions.',
    fullDescription: 'Work on your own project or join a table focused on frontend development, mobile products, or open-source tools. Volunteer mentors will be available for short technical questions.',
    category: 'Meetup',
    date: '2026-08-20',
    startTime: '18:30',
    endTime: '21:00',
    location: 'Prizren Innovation Hub',
    format: 'In person',
    organizer: 'LinkPort Prizren Circle',
    capacity: 45,
    topics: ['Web Development', 'Mobile', 'Open Source'],
    requirements: ['Bring a laptop if you plan to build'],
    audience: 'Members at any experience level who want a focused place to work.',
    externalUrl: '',
    createdAt: '2026-07-11T13:00:00Z',
  },
  {
    id: 'inclusive-design-challenge',
    title: 'Inclusive UI/UX Design Challenge',
    shortDescription: 'Redesign a public-service flow with accessibility and clarity at its core.',
    fullDescription: 'Small teams will receive a service-design prompt and create a lightweight user flow and prototype. Facilitators will introduce inclusive-design principles before the working session.',
    category: 'Challenge',
    date: '2026-08-29',
    startTime: '10:00',
    endTime: '16:00',
    location: 'AAB College, Prishtina',
    format: 'In person',
    organizer: 'LinkPort Design Circle',
    capacity: 36,
    topics: ['UI/UX', 'Accessibility', 'Prototyping'],
    requirements: ['Basic familiarity with a design or prototyping tool'],
    audience: 'Designers, developers, and researchers interested in inclusive digital services.',
    externalUrl: '',
    createdAt: '2026-07-13T08:15:00Z',
  },
  {
    id: 'early-career-tech-panel',
    title: 'Starting a Career in Technology',
    shortDescription: 'A practical discussion about internships, first roles, and building useful experience.',
    fullDescription: 'Recent graduates and hiring-team members will discuss realistic paths into technology roles, how to describe student projects, and what they learned during their first year at work.',
    category: 'Career',
    date: '2026-09-05',
    startTime: '17:30',
    endTime: '19:00',
    location: 'Online',
    format: 'Online',
    organizer: 'LinkPort Career Network',
    capacity: 100,
    topics: ['Internships', 'CV', 'Career Planning'],
    requirements: [],
    audience: 'Students, recent graduates, and members preparing for their first technology role.',
    externalUrl: 'https://discord.gg/8NemkkpJj',
    createdAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'startup-idea-session',
    title: 'Student Startup Idea Session',
    shortDescription: 'Test an early idea, find assumptions, and learn from other student founders.',
    fullDescription: 'Members can present an idea in three minutes and receive structured feedback on the problem, intended users, and smallest useful experiment. Presenting is optional.',
    category: 'Meetup',
    date: '2026-09-12',
    startTime: '18:00',
    endTime: '20:00',
    location: 'RIT Kosovo, Prishtina',
    format: 'In person',
    organizer: 'LinkPort Founders Circle',
    capacity: 50,
    topics: ['Startups', 'Validation', 'Product'],
    requirements: [],
    audience: 'Members exploring entrepreneurship or interested in giving constructive product feedback.',
    externalUrl: '',
    createdAt: '2026-07-16T14:45:00Z',
  },
  {
    id: 'embedded-systems-lab',
    title: 'Embedded Systems Prototype Lab',
    shortDescription: 'Build a small sensor prototype and learn a repeatable hardware-testing workflow.',
    fullDescription: 'Facilitators will guide teams through wiring a simple environmental sensor, reading its output, and documenting test results. Shared kits will be available during the session.',
    category: 'Workshop',
    date: '2026-09-19',
    startTime: '11:00',
    endTime: '14:00',
    location: 'UBT Innovation Campus, Lipjan',
    format: 'In person',
    organizer: 'LinkPort Hardware Circle',
    capacity: 24,
    topics: ['Arduino', 'Sensors', 'Prototyping'],
    requirements: ['Basic programming familiarity', 'Laptop with an available USB port'],
    audience: 'Students curious about electronics, IoT, and physical-product prototyping.',
    externalUrl: '',
    createdAt: '2026-07-18T09:20:00Z',
  },
  {
    id: 'community-online-qa',
    title: 'LinkPort Community Q&A',
    shortDescription: 'Ask questions about projects, collaboration, profiles, and using the community.',
    fullDescription: 'Community volunteers will answer questions, demonstrate useful LinkPort workflows, and help members identify the best place to share an idea or look for collaborators.',
    category: 'Meetup',
    date: '2026-09-26',
    startTime: '18:00',
    endTime: '19:00',
    location: 'Online',
    format: 'Online',
    organizer: 'LinkPort Community',
    capacity: 120,
    topics: ['Community', 'Collaboration', 'Q&A'],
    requirements: [],
    audience: 'New and returning LinkPort members.',
    externalUrl: 'https://discord.gg/8NemkkpJj',
    createdAt: '2026-07-20T12:00:00Z',
  },
]

function eventTimestamp(event) {
  const timestamp = Date.parse(`${event.date}T${event.startTime || '00:00'}:00`)
  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY
}

export const mockEvents = [...events].sort((first, second) => eventTimestamp(first) - eventTimestamp(second))

export function getMockEvent(eventId) {
  return mockEvents.find((event) => event.id === eventId)
}

export function formatEventDate(date) {
  const parsedDate = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsedDate.getTime())) return 'Date to be confirmed'

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate)
}

export function formatEventTime(event) {
  if (!event?.startTime) return 'Time to be confirmed'
  return event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime
}

export function getSafeEventUrl(url) {
  if (!url) return ''

  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol) ? parsedUrl.href : ''
  } catch {
    return ''
  }
}
