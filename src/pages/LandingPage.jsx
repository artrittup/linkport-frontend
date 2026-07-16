import Navbar from '../components/Navbar'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a192f] text-[#e6f1ff]">
      <Navbar />
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6">
        <p className="mb-4 font-mono text-sm text-[#64ffda]">
          Welcome to LinkPort
        </p>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Connecting young talent with real opportunities.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#8892b0]">
          LinkPort helps students, graduates, and companies connect through
          jobs, projects, and professional collaboration.
        </p>
      </section>
    </main>
  )
}
