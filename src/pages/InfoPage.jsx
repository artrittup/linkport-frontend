import { Link, useParams } from 'react-router'

const pages = {
  about: {
    eyebrow: 'About LinkPort',
    title: 'A professional network built around real opportunities.',
    intro: 'LinkPort connects developers, candidates, and companies through professional profiles, jobs, projects, applications, and bids.',
    sections: [
      ['Our mission', 'We want skills and completed work to speak clearly. LinkPort helps people present their experience and helps companies discover the right collaborators.'],
      ['For candidates', 'Build a professional profile, discover jobs, apply directly, explore projects, and submit structured bids.'],
      ['For companies', 'Create a company presence, publish opportunities, review candidates, and manage applications and project proposals in one place.'],
    ],
  },
  faq: {
    eyebrow: 'Frequently asked questions',
    title: 'Quick answers about using LinkPort.',
    intro: 'Find answers to the most common questions from candidates and companies.',
    sections: [
      ['How do I create a profile?', 'Register as a candidate or company, sign in, and open the Profile page from your dashboard.'],
      ['How do candidates apply for jobs?', 'Open an available job, review its details, and submit your application with an optional cover letter.'],
      ['How do project bids work?', 'Candidates can open an active project and send a proposal containing an amount, delivery estimate, and project plan.'],
      ['How does a company publish an opportunity?', 'Company accounts can create and manage jobs or projects from their dashboard.'],
      ['Can I apply or bid more than once?', 'No. A candidate can submit only one application per job and one bid per project.'],
      ['Is LinkPort free?', 'The current LinkPort MVP does not charge users. Future paid features will always be communicated clearly before activation.'],
      ['How do I report a problem?', 'Use the Help & Support page and send details about the account, job, project, or technical issue.'],
    ],
  },
  help: {
    eyebrow: 'Help & Support',
    title: 'We are here to help.',
    intro: 'Before contacting support, check the FAQ and make sure you are signed in with the correct account role.',
    sections: [
      ['Account support', 'For login, account access, or profile issues, include the email connected to your account. Never send your password.'],
      ['Jobs and projects', 'Include the title and ID of the job or project when reporting an application or bid issue.'],
      ['Contact', 'Email support@linkport.dev with a clear subject, a short description, and a screenshot when useful.'],
    ],
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro: 'By accessing LinkPort, you agree to use the platform lawfully, honestly, and respectfully.',
    sections: [
      ['Accounts', 'You are responsible for accurate account information, protecting your credentials, and activity performed through your account.'],
      ['Acceptable use', 'Do not impersonate others, publish misleading opportunities, scrape private information, distribute malware, spam users, or misuse the service.'],
      ['User content', 'You retain ownership of your content and grant LinkPort permission to display it as needed to provide the platform.'],
      ['Opportunities and agreements', 'LinkPort facilitates discovery and communication. Candidates and companies remain responsible for evaluating and fulfilling their agreements.'],
      ['Enforcement', 'We may restrict or disable accounts that violate these terms, threaten users, or compromise platform security.'],
      ['Changes', 'These terms may be updated as LinkPort develops. Material changes will be communicated through the platform.'],
    ],
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'This policy explains what information LinkPort uses and why it is needed.',
    sections: [
      ['Information we collect', 'We process account details, professional profile information, jobs, projects, applications, bids, and basic technical data required to operate the service.'],
      ['How information is used', 'Data is used to authenticate users, provide platform features, prevent abuse, improve reliability, and respond to support requests.'],
      ['Who can see your data', 'Public professional information may be visible to other users. Applications and bids are shared only with the relevant candidate and company.'],
      ['Data security', 'We use access controls and secure password hashing, but no online system can guarantee absolute security.'],
      ['Your choices', 'You may update your profile and request account or personal-data deletion by contacting support.'],
      ['Contact', 'Privacy questions can be sent to privacy@linkport.dev.'],
    ],
  },
  cookies: {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    intro: 'LinkPort uses only the browser storage and technical data needed to keep the application working.',
    sections: [
      ['Essential storage', 'Authentication data may be stored in your browser so that you remain signed in and the correct dashboard can be displayed.'],
      ['Optional analytics', 'If analytics or non-essential cookies are introduced, LinkPort will request consent where required before enabling them.'],
      ['Your controls', 'You can clear site data through your browser settings. Doing so may sign you out and reset local preferences.'],
    ],
  },
}

export default function InfoPage() {
  const { page } = useParams()
  const content = pages[page]

  if (!content) {
    return <main className="grid min-h-screen place-items-center bg-[#0a192f] text-[#e6f1ff]"><Link to="/" className="text-[#64ffda]">Return home</Link></main>
  }

  return (
    <main className="min-h-screen bg-[#0a192f] px-6 py-10 text-[#e6f1ff] lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64ffda] transition hover:text-white">← Back to LinkPort</Link>
        <header className="mt-12 border-b border-[#233554] pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64ffda]">{content.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#a8b2d1]">{content.intro}</p>
          {['terms', 'privacy', 'cookies'].includes(page) && <p className="mt-4 text-sm text-[#8892b0]">Last updated: July 22, 2026</p>}
        </header>
        <div className="space-y-5 py-10">
          {content.sections.map(([title, body]) => (
            <section key={title} className="rounded-2xl border border-[#233554] bg-[#112240]/70 p-6 shadow-lg shadow-black/10">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-[#a8b2d1]">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
