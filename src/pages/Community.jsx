import CandidateLayout from '../layouts/CandidateLayout'

const upcomingEvents = [
  { date: '24 AUG', title: 'Portfolio Review Evening', detail: 'Online · 18:00' },
  { date: '02 SEP', title: 'Build Your First Team', detail: 'Prishtina · 17:30' },
]

const interests = [
  'Web Development',
  'Product Design',
  'Data & AI',
  'Career Growth',
  'Startups',
  'Student Projects',
]

export default function Community() {
  return (
    <CandidateLayout title="Community">
      <section className="max-w-3xl">
        <p className="font-mono text-sm text-[#64ffda]">Meet and build together</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">
          Community
        </h2>
        <p className="mt-4 leading-7 text-[#8892b0]">
          Connect with students, graduates, and young professionals who want to learn, share ideas, and build useful projects.
        </p>
        <a
          href="https://discord.gg/8NemkkpJj"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-5 py-2.5 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1]"
        >
          Join Discord
        </a>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#233554] bg-[#112240]/65 p-6">
          <h3 className="text-xl font-semibold text-[#e6f1ff]">Upcoming Events</h3>
          <p className="mt-2 text-sm text-[#8892b0]">Simple ways to meet, learn, and exchange feedback.</p>
          <div className="mt-6 space-y-3">
            {upcomingEvents.map((event) => (
              <article key={event.title} className="flex items-center gap-4 rounded-xl border border-[#233554] bg-[#0a192f]/55 p-4">
                <span className="w-12 shrink-0 font-mono text-xs font-semibold leading-5 text-[#64ffda]">{event.date}</span>
                <div>
                  <h4 className="font-medium text-[#e6f1ff]">{event.title}</h4>
                  <p className="mt-1 text-xs text-[#8892b0]">{event.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#233554] bg-[#112240]/65 p-6">
          <h3 className="text-xl font-semibold text-[#e6f1ff]">Community Interests</h3>
          <p className="mt-2 text-sm text-[#8892b0]">Topics members are exploring together right now.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {interests.map((interest) => (
              <span key={interest} className="rounded-full border border-[#64ffda]/20 bg-[#64ffda]/5 px-3 py-2 text-sm text-[#a8b2d1]">
                {interest}
              </span>
            ))}
          </div>
        </section>
      </div>
    </CandidateLayout>
  )
}
