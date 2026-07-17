import Button from './Button'
import Card from './Card'

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <Card padding="lg" className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#233554] bg-[#0a192f]/70">
        <span className="font-mono text-xl text-[#64ffda]" aria-hidden="true">∅</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[#e6f1ff]">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#8892b0]">
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
