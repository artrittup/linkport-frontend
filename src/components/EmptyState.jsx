import Button from './Button'
import Card from './Card'

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <Card padding="lg" className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background/70">
        <span className="font-mono text-xl text-primary" aria-hidden="true">∅</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}
