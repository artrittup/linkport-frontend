import Button from '../components/Button'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/Card'
import Navbar from '../components/Navbar'

const candidateFeatures = [
  {
    title: 'Build your professional profile',
    description:
      'Create a polished profile that tells companies who you are and what you want to build.',
  },
  {
    title: 'Showcase your skills',
    description:
      'Highlight your technical strengths, experience, education, and best work in one place.',
  },
  {
    title: 'Apply for jobs',
    description:
      'Find early-career roles that match your interests and take the next step with confidence.',
  },
  {
    title: 'Bid on real projects',
    description:
      'Send proposals, work independently or with a team, and gain meaningful project experience.',
  },
]

const companyFeatures = [
  {
    title: 'Discover young talent',
    description:
      'Explore motivated candidates and find people with the skills and potential your team needs.',
  },
  {
    title: 'Post job opportunities',
    description:
      'Share internships and junior roles with a focused community ready to start their careers.',
  },
  {
    title: 'Publish company projects',
    description:
      'Turn real business challenges into project opportunities for individuals and emerging teams.',
  },
  {
    title: 'Choose the best offer',
    description:
      'Compare proposals, experience, and ideas to select the right candidate or team for the work.',
  },
]

const stats = ['Jobs', 'Projects', 'Bids', 'Companies', 'Talent']

const projectSteps = [
  {
    title: 'Company posts a project',
    description:
      'A company defines its goals, scope, timeline, and the skills needed to deliver the project.',
  },
  {
    title: 'Candidates or teams send offers',
    description:
      'Talent reviews the brief and submits a clear proposal with an approach, timeline, and offer.',
  },
  {
    title: 'Company selects the best proposal',
    description:
      'The company compares submissions and chooses the strongest fit for the project and team.',
  },
]

function SectionTitle({ number, children }) {
  return (
    <h2 className="text-2xl font-semibold tracking-tight text-[#e6f1ff] sm:text-3xl">
      <span className="mr-2 font-mono text-lg font-normal text-[#64ffda]">
        {number}.
      </span>
      {children}
    </h2>
  )
}

export default function LandingPage() {
  const goToRegister = () => window.location.assign('/register')

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a192f] text-[#e6f1ff]">
      <Navbar />

      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-32 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#64ffda]/5 blur-3xl" />
        <div className="relative max-w-4xl">
          <p className="mb-5 font-mono text-sm tracking-wide text-[#64ffda] sm:text-base">
            Welcome to LinkPort
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-[#e6f1ff] sm:text-6xl lg:text-7xl">
            Connecting young talent with real opportunities.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#8892b0] sm:text-lg">
            LinkPort helps students, graduates, and companies connect through
            jobs, projects, and professional collaboration.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={goToRegister}>
              Join as Candidate
            </Button>
            <Button variant="outline" size="lg" onClick={goToRegister}>
              Join as Company
            </Button>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-20 border-y border-[#233554]/70 bg-[#112240]/30 py-24 sm:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20 lg:px-8">
          <div>
            <SectionTitle number="01">About LinkPort</SectionTitle>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#8892b0] sm:text-lg">
              LinkPort is a professional platform where students and young
              graduates can build profiles, showcase their skills, apply for
              jobs, and work on real projects posted by companies.
            </p>
            <div className="mt-8 h-px w-24 bg-[#64ffda]" />
          </div>

          <Card hover padding="lg" className="relative overflow-hidden">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-[#64ffda]/20" />
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#64ffda]">
              One connected platform
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat}
                  className="rounded-md border border-[#233554] bg-[#0a192f]/50 p-4"
                >
                  <span className="block font-mono text-xs text-[#64ffda]">
                    0{index + 1}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-[#e6f1ff]">
                    {stat}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="candidates" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle number="02">For Candidates</SectionTitle>
          <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
            Build credibility, find your first opportunity, and turn your
            knowledge into practical experience.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {candidateFeatures.map((feature, index) => (
              <Card key={feature.title} hover className="h-full">
                <CardHeader>
                  <span className="mb-5 block font-mono text-sm text-[#64ffda]">
                    0{index + 1}
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardDescription>{feature.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="companies"
        className="scroll-mt-20 border-y border-[#233554]/70 bg-[#112240]/30 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle number="03">For Companies</SectionTitle>
          <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
            Meet emerging professionals, share meaningful work, and discover
            fresh ideas for your business.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {companyFeatures.map((feature, index) => (
              <Card key={feature.title} hover className="h-full">
                <CardHeader>
                  <span className="mb-5 block font-mono text-sm text-[#64ffda]">
                    0{index + 1}
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardDescription>{feature.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle number="04">Project Bidding</SectionTitle>
          <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
            A simple, transparent process that turns company needs into real
            opportunities for young professionals.
          </p>
          <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
            <div className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-[#233554] lg:block" />
            {projectSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#64ffda] bg-[#0a192f] font-mono text-sm text-[#64ffda]">
                  0{index + 1}
                </div>
                <Card hover className="h-[calc(100%-5rem)]">
                  <CardHeader>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-[#8892b0]">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#233554] bg-[#112240] px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 bg-[#64ffda]/10 blur-3xl" />
          <div className="relative">
            <p className="font-mono text-sm text-[#64ffda]">Ready to begin?</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-5xl">
              Start building your future with LinkPort.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl leading-7 text-[#8892b0]">
              Whether you are looking for your first job or searching for new
              talent, LinkPort gives you a place to connect.
            </p>
            <Button size="lg" className="mt-9" onClick={goToRegister}>
              Create Account
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#233554] px-6 py-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <a href="/" className="text-xl font-bold text-[#e6f1ff]">
              Link<span className="text-[#64ffda]">Port</span>
            </a>
            <p className="mt-3 text-sm leading-6 text-[#64748b]">
              A platform connecting young talent with real professional
              opportunities.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
            {[
              ['About', '#about'],
              ['Candidates', '#candidates'],
              ['Companies', '#companies'],
              ['Projects', '#projects'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="font-mono text-xs text-[#8892b0] transition-colors hover:text-[#64ffda]"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  )
}
