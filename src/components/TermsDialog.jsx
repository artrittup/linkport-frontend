import { useEffect, useRef, useState } from 'react'

/**
 * Terms gate shown after the sign-up form is filled in. The account is only
 * created once the person ticks the box and presses Continue.
 */
export default function TermsDialog({ onCancel, onAccept, isSubmitting }) {
  const [agreed, setAgreed] = useState(false)
  const panel = useRef(null)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onCancel()
    }

    document.addEventListener('keydown', onKey)
    panel.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel, isSubmitting])

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-overlay/70 px-4 py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel()
      }}
    >
      <section
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        className="flex max-h-full w-full max-w-lg flex-col rounded-xl border border-border-strong bg-surface shadow-2xl outline-none"
      >
        <h2
          id="terms-title"
          className="border-b border-border px-5 py-3.5 text-base font-bold text-text-primary"
        >
          Terms and Conditions
        </h2>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm leading-6 text-text-secondary">
          <p>
            By creating a LinkPort account you agree to use the platform lawfully and
            respectfully, and to keep the details on your profile accurate.
          </p>
          <p>
            <strong className="text-text-primary">Your content.</strong> You keep ownership of
            what you post. You grant LinkPort permission to display it to other members as
            part of running the platform.
          </p>
          <p>
            <strong className="text-text-primary">Conduct.</strong> Harassment, spam,
            impersonation and illegal content are not allowed. Accounts that break these
            rules may be suspended.
          </p>
          <p>
            <strong className="text-text-primary">Your data.</strong> We store the details you
            give us in order to operate your account. You can correct or delete them from
            your profile at any time.
          </p>
          <p>
            <strong className="text-text-primary">The service.</strong> LinkPort is provided as
            it is, and features may change as the platform grows.
          </p>
          <p className="text-text-muted">
            This summary is a placeholder and is not legal advice. Replace it with terms
            reviewed by a lawyer before the platform goes public.
          </p>
        </div>

        <div className="border-t border-border px-5 py-4">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--theme-primary)]"
            />
            I agree to the Terms and Conditions
          </label>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAccept}
              disabled={!agreed || isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-contrast transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Continue'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
