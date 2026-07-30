import { Link } from 'react-router'
import ThemeToggle from '../components/ThemeToggle'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 text-text-primary">
      <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" />
      <section className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 text-center shadow-2xl shadow-black/20 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">404</p>
        <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          The page you requested does not exist or may have moved.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          Back to LinkPort
        </Link>
      </section>
    </main>
  )
}
