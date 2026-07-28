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
      <p className="break-words text-sm leading-6 text-[#a8b2d1]">
        <span className="font-semibold text-[#e6f1ff]">{entityName}</span>
        {' — '}
        {description}
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
          {error}
        </p>
      )}
    </Modal>
  )
}
