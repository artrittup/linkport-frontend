import Modal, { DetailGrid, DetailSection } from './Modal'

export default function CirclePreviewModal({ circle, onClose }) {
  return (
    <Modal
      isOpen={Boolean(circle)}
      onClose={onClose}
      eyebrow={circle?.category}
      title={circle?.name ?? 'Circle preview'}
      maxWidth="max-w-xl"
    >
      {circle && (
        <>
          <p className="text-sm font-medium leading-6 text-text-secondary">{circle.tagline}</p>
          <DetailSection label="About this Circle">{circle.description}</DetailSection>
          <div className="mt-5">
            <DetailGrid items={[
              { label: 'Members', value: circle.memberCount.toLocaleString() },
              { label: 'Discussions', value: circle.discussionCount.toLocaleString() },
              { label: 'Location', value: circle.location },
              { label: 'Visibility', value: circle.visibility },
              { label: 'Activity', value: circle.activityLevel, fullWidth: true },
            ]} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {circle.tags.map((tag) => <span key={tag} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">{tag}</span>)}
          </div>
          <p className="mt-5 rounded-lg border border-border bg-background/45 px-4 py-3 text-xs leading-5 text-text-muted">
            Full Circle discussions and member spaces are coming in the next phase.
          </p>
        </>
      )}
    </Modal>
  )
}
