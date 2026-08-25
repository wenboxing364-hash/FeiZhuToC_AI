import { ConfirmDialog } from './ConfirmDialog'

interface RestartConfirmDialogProps {
  onCancel: () => void
  onConfirm: () => void
}

export function RestartConfirmDialog({ onCancel, onConfirm }: RestartConfirmDialogProps) {
  return (
    <ConfirmDialog
      title="重新开始规划？"
      description="当前聊天记录和旅行计划将被清空。"
      confirmLabel="重新开始"
      danger
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
