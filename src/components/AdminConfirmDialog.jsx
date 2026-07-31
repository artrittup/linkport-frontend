import Button from './Button'
import Modal from './Modal'

export default function AdminConfirmDialog({
  isOpen,
  title,
  entityName,
  description,
  confirmLabel = 'Delete',
  isSubmitting = false,
  error = '',
  onCancel,
  onConfirm,
}) {
  const close = () => {
    if (!isSubmitting) onCancel()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      eyebrow="Confirmation required"
      title={title}
      showCloseButton={false}
      maxWidth="max-w-lg"
      footer={(
        <>
          <Button variant="ghost" disabled={isSubmitting} onClick={close}>Cancel</Button>
          <Button variant="danger" disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? 'Working...' : confirmLabel}
          </Button>
        </>
      )}
    >
      <p className="break-words text-sm leading-6 text-text-secondary">
        <span className="font-semibold text-text-primary">{entityName}</span>
        {' — '}
        {description}
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text">
          {error}
        </p>
      )}
    </Modal>
  )
}
