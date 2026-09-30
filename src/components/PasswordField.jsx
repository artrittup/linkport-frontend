import FloatingField from './FloatingField'

const LEVELS = [
  { label: 'Too short', bar: 'bg-danger', text: 'text-danger-text' },
  { label: 'Weak', bar: 'bg-danger', text: 'text-danger-text' },
  { label: 'Fair', bar: 'bg-warning', text: 'text-warning-text' },
  { label: 'Good', bar: 'bg-info', text: 'text-info-text' },
  { label: 'Strong', bar: 'bg-success', text: 'text-success-text' },
]

/** Rough strength score from 0 (unusable) to 4 (strong). */
function scorePassword(password) {
  if (!password || password.length < 8) return 0

  let score = 1
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/]
    .filter((pattern) => pattern.test(password)).length

  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (classes >= 3) score += 1
  if (classes === 4 && password.length >= 12) score += 1

  return Math.min(score, 4)
}

export default function PasswordField({ id, label, value, showStrength = false, ...rest }) {
  const score = scorePassword(value)
  const level = LEVELS[score]

  return (
    <div>
      <FloatingField id={id} label={label} value={value} {...rest} />

      {showStrength && value && (
        <div className="mt-2">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  score >= step ? level.bar : 'bg-border'
                }`}
              />
            ))}
          </div>
          <p className={`mt-1 text-xs font-semibold ${level.text}`} role="status">
            {level.label}
          </p>
        </div>
      )}
    </div>
  )
}
