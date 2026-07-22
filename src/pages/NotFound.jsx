import { Link } from 'react-router'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a192f] px-6 text-[#e6f1ff]">
      <section className="w-full max-w-lg rounded-2xl border border-[#233554] bg-[#112240] p-8 text-center shadow-2xl shadow-black/20 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#64ffda]">404</p>
        <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-[#8892b0]">
          The page you requested does not exist or may have moved.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex rounded-lg border border-[#64ffda] px-5 py-2.5 text-sm font-semibold text-[#64ffda] transition-colors hover:bg-[#64ffda]/10"
        >
          Back to LinkPort
        </Link>
      </section>
    </main>
  )
}
