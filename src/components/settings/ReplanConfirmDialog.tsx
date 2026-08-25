import { ConfirmDialog } from './ConfirmDialog'

interface ReplanConfirmDialogProps {
  onCancel: () => void
  onConfirm: () => void
}

export function ReplanConfirmDialog({ onCancel, onConfirm }: ReplanConfirmDialogProps) {
  return (
    <ConfirmDialog
      title="重新规划当前行程？"
      description="将保留目的地、人数、预算和旅行偏好，并重新生成新的旅行方案。"
      confirmLabel="重新规划"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
